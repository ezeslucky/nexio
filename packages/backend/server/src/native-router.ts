/**
 * DualEngineRouter: Automatic Failover & Circuit Breaker between Go and Rust.
 *
 * If Go is down or slow (> timeout threshold) -> immediately shifts to Rust.
 * If Rust is down or fails -> immediately shifts to Go.
 * Automatically recovers and self-heals when services come back online.
 */

export type EngineType = 'go' | 'rust';

export interface EngineStats {
  status: 'healthy' | 'degraded' | 'down';
  consecutiveFailures: number;
  lastFailureTime?: number;
  totalCalls: number;
  totalFailovers: number;
}

export class DualEngineRouter {
  private goStats: EngineStats = {
    status: 'healthy',
    consecutiveFailures: 0,
    totalCalls: 0,
    totalFailovers: 0,
  };

  private rustStats: EngineStats = {
    status: 'healthy',
    consecutiveFailures: 0,
    totalCalls: 0,
    totalFailovers: 0,
  };

  private readonly maxFailuresBeforeDown = 3;
  private readonly cooldownPeriodMs = 15_000; // 15 seconds to try recovering
  private readonly defaultLatencyTimeoutMs = 600; // If slower than 600ms, shift to other engine

  constructor(private preferredPrimary: EngineType = 'go') {}

  public getStats() {
    return {
      go: { ...this.goStats },
      rust: { ...this.rustStats },
      currentPrimary: this.getActivePrimary(),
    };
  }

  public getActivePrimary(): EngineType {
    // If preferred is Go and Go is healthy or probing recovery
    if (this.preferredPrimary === 'go') {
      if (this.goStats.status === 'down') {
        const elapsed = Date.now() - (this.goStats.lastFailureTime || 0);
        if (elapsed > this.cooldownPeriodMs) {
          return 'go'; // Probe recovery
        }
        return 'rust';
      }
      return 'go';
    } else {
      if (this.rustStats.status === 'down') {
        const elapsed = Date.now() - (this.rustStats.lastFailureTime || 0);
        if (elapsed > this.cooldownPeriodMs) {
          return 'rust'; // Probe recovery
        }
        return 'go';
      }
      return 'rust';
    }
  }

  private recordSuccess(engine: EngineType) {
    const stats = engine === 'go' ? this.goStats : this.rustStats;
    stats.consecutiveFailures = 0;
    stats.status = 'healthy';
    stats.totalCalls++;
  }

  private recordFailure(engine: EngineType, reason: string) {
    const stats = engine === 'go' ? this.goStats : this.rustStats;
    stats.consecutiveFailures++;
    stats.lastFailureTime = Date.now();
    stats.totalCalls++;

    if (stats.consecutiveFailures >= this.maxFailuresBeforeDown) {
      stats.status = 'down';
    } else {
      stats.status = 'degraded';
    }

    console.warn(
      `[DualEngineRouter] ${engine.toUpperCase()} engine failure #${stats.consecutiveFailures} (${reason}). Current status: ${stats.status}`
    );
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T> | T,
    timeoutMs: number,
    engineName: EngineType
  ): Promise<T> {
    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${engineName} engine timed out (> ${timeoutMs}ms)`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([Promise.resolve(fn()), timeoutPromise]);
      if (timer) clearTimeout(timer);
      return result;
    } catch (err) {
      if (timer) clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Execute an operation with automatic failover between Go and Rust.
   */
  public async execute<T>(
    operationName: string,
    runGo: () => Promise<T> | T,
    runRust: () => Promise<T> | T,
    latencyTimeoutMs: number = this.defaultLatencyTimeoutMs
  ): Promise<T> {
    const primary = this.getActivePrimary();
    const secondary: EngineType = primary === 'go' ? 'rust' : 'go';

    const primaryFn = primary === 'go' ? runGo : runRust;
    const secondaryFn = primary === 'go' ? runRust : runGo;

    try {
      const result = await this.executeWithTimeout(primaryFn, latencyTimeoutMs, primary);
      this.recordSuccess(primary);
      return result;
    } catch (primaryError) {
      this.recordFailure(primary, (primaryError as Error)?.message || 'Unknown error');

      const primaryStats = primary === 'go' ? this.goStats : this.rustStats;
      primaryStats.totalFailovers++;

      console.warn(
        `[DualEngineRouter] Failover triggered for "${operationName}": ${primary.toUpperCase()} is down or slow. Shifting to ${secondary.toUpperCase()}...`
      );

      try {
        // Execute secondary engine (fallback)
        const fallbackResult = await this.executeWithTimeout(secondaryFn, latencyTimeoutMs * 2, secondary);
        this.recordSuccess(secondary);
        return fallbackResult;
      } catch (secondaryError) {
        this.recordFailure(secondary, (secondaryError as Error)?.message || 'Fallback error');
        throw new Error(
          `DualEngineRouter: Both engines failed for "${operationName}". Primary error: ${primaryError}; Fallback error: ${secondaryError}`
        );
      }
    }
  }
}

export const nativeRouter = new DualEngineRouter('go');
