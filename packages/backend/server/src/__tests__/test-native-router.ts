import assert from 'node:assert/strict';
import { DualEngineRouter } from '../native-router';

async function runTests() {
  console.log('Testing DualEngineRouter...');

  // Test 1: Normal healthy execution
  {
    const router = new DualEngineRouter('go');
    const result = await router.execute(
      'op-normal',
      () => 'from-go',
      () => 'from-rust'
    );
    assert.equal(result, 'from-go');
    const stats = router.getStats();
    assert.equal(stats.go.status, 'healthy');
    assert.equal(stats.go.totalCalls, 1);
    assert.equal(stats.go.totalFailovers, 0);
    console.log('  [PASS] Test 1: Primary engine succeeds when healthy');
  }

  // Test 2: Go down -> shifts to Rust
  {
    const router = new DualEngineRouter('go');
    const result = await router.execute(
      'op-go-crash',
      () => {
        throw new Error('Connection refused: Go daemon is offline');
      },
      () => 'recovered-by-rust'
    );
    assert.equal(result, 'recovered-by-rust');
    const stats = router.getStats();
    assert.equal(stats.go.totalFailovers, 1);
    assert.equal(stats.rust.status, 'healthy');
    console.log('  [PASS] Test 2: Shifting from Go to Rust on crash/failure');
  }

  // Test 3: Go is slow (> threshold) -> shifts to Rust
  {
    const router = new DualEngineRouter('go');
    const start = Date.now();
    const result = await router.execute(
      'op-go-slow',
      async () => {
        await new Promise(r => setTimeout(r, 200)); // Go is slow
        return 'slow-go';
      },
      () => 'instant-rust',
      60 // 60ms timeout threshold
    );
    const duration = Date.now() - start;
    assert.equal(result, 'instant-rust');
    assert.ok(duration < 180, `Expected failover within threshold, took ${duration}ms`);
    const stats = router.getStats();
    assert.equal(stats.go.totalFailovers, 1);
    console.log(`  [PASS] Test 3: Shifting from Go to Rust on latency spike (${duration}ms)`);
  }

  // Test 4: Rust down -> shifts to Go
  {
    const router = new DualEngineRouter('rust');
    const result = await router.execute(
      'op-rust-crash',
      () => 'recovered-by-go',
      () => {
        throw new Error('Rust NAPI panic or missing binary');
      }
    );
    assert.equal(result, 'recovered-by-go');
    const stats = router.getStats();
    assert.equal(stats.rust.totalFailovers, 1);
    assert.equal(stats.go.status, 'healthy');
    console.log('  [PASS] Test 4: Shifting from Rust to Go on crash/failure');
  }

  // Test 5: Circuit breaker state & automatic self-healing
  {
    const router = new DualEngineRouter('go');
    // Trigger 3 consecutive failures to trip circuit breaker
    for (let i = 0; i < 3; i++) {
      await router.execute(
        `trip-${i}`,
        () => {
          throw new Error('Go down');
        },
        () => 'rust-fallback'
      );
    }
    const stats = router.getStats();
    assert.equal(stats.go.status, 'down', 'Go engine should be marked DOWN after 3 failures');
    assert.equal(stats.currentPrimary, 'rust', 'Active primary should now be shifted to RUST');
    console.log('  [PASS] Test 5: Circuit breaker tripped - active primary switched to RUST');
  }

  console.log('\nAll 5 Failover & Circuit Breaker tests PASSED successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
