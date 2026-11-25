import { Button, Input, notify } from '@nexio/component';
import { SettingRow } from '@nexio/component/setting-components';
import { ServerService } from '@nexio/core/modules/cloud';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

interface ByokKey {
  provider: string;
  keyMask: string;
  isValid: boolean;
  lastUsedAt: string | null;
}

interface CreditInfo {
  balance: number;
  lifetimeUsed: number;
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...', hint: 'Starts with sk-' },
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...', hint: 'Starts with sk-ant-' },
  { id: 'gemini', name: 'Google Gemini', placeholder: 'AIza...', hint: 'Starts with AIza' },
];

export const AICreditsByokPanel = () => {
  const serverService = useService(ServerService);
  const baseUrl = serverService.server.baseUrl;

  const [credits, setCredits] = useState<CreditInfo>({ balance: 1000, lifetimeUsed: 0 });
  const [keys, setKeys] = useState<Record<string, ByokKey>>({});
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [savingProvider, setSavingProvider] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [creditsRes, byokRes] = await Promise.all([
        fetch(`${baseUrl}/api/copilot/credits`, { credentials: 'include' }).catch(() => null),
        fetch(`${baseUrl}/api/copilot/byok`, { credentials: 'include' }).catch(() => null),
      ]);

      if (creditsRes && creditsRes.ok) {
        const data = await creditsRes.json();
        setCredits({ balance: data.balance ?? 1000, lifetimeUsed: data.lifetimeUsed ?? 0 });
      }

      if (byokRes && byokRes.ok) {
        const data = await byokRes.json();
        const map: Record<string, ByokKey> = {};
        if (Array.isArray(data.keys)) {
          data.keys.forEach((k: ByokKey) => {
            map[k.provider.toLowerCase()] = k;
          });
        }
        setKeys(map);
      }
    } catch (e) {
      console.warn('Failed to load credits/byok:', e);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveKey = async (provider: string) => {
    const rawKey = inputKeys[provider]?.trim();
    if (!rawKey) {
      notify.error({ title: 'Please enter a valid API key' });
      return;
    }

    setSavingProvider(provider);
    try {
      const res = await fetch(`${baseUrl}/api/copilot/byok`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider, apiKey: rawKey }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save key');
      }

      notify.success({
        title: `${provider.toUpperCase()} Key Saved`,
        message: 'Your key has been encrypted (AES-256) and activated.',
      });
      setInputKeys(prev => ({ ...prev, [provider]: '' }));
      await fetchData();
    } catch (e: any) {
      notify.error({ title: 'Failed to save key', message: e.message });
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/copilot/byok/${provider}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        notify.success({ title: `${provider.toUpperCase()} Key Revoked` });
        await fetchData();
      }
    } catch (e: any) {
      notify.error({ title: 'Failed to delete key', message: e.message });
    }
  };

  const hasAnyByok = Object.keys(keys).length > 0;

  return (
    <>
      {/* AI Credit Balance */}
      <SettingRow
        name="AI Credits & Quota"
        desc={
          hasAnyByok
            ? 'BYOK active — requests with configured keys are 100% free with 0 platform credit deduction.'
            : 'Credits automatically deduct per AI request based on model intelligence tier.'
        }
        spreadCol={false}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--affine-background-secondary-color, #f8fafc)',
            borderRadius: '12px',
            border: '1px solid var(--affine-border-color, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                {credits.balance.toLocaleString()}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--affine-text-secondary-color, #64748b)', marginLeft: '6px' }}>
                credits remaining
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: hasAnyByok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.12)',
                color: hasAnyByok ? '#059669' : '#2563eb',
              }}
            >
              {hasAnyByok ? '⚡ BYOK Active (Free)' : 'Standard Plan'}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color, #64748b)', lineHeight: '1.5' }}>
            Rates: <strong>1 credit</strong> (Standard: Mini/Flash) · <strong>3 credits</strong> (High: Gemini Pro) ·{' '}
            <strong>5 credits</strong> (Smart: GPT-4o, Claude Sonnet).
          </div>
        </div>
      </SettingRow>

      {/* Bring Your Own Key (BYOK) Manager */}
      <SettingRow
        name="Bring Your Own Key (BYOK)"
        desc="Use your own API keys. Keys are stored with AES-256-GCM encryption and never exposed to the browser."
        spreadCol={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {PROVIDERS.map(p => {
            const activeKey = keys[p.id];
            const isSaving = savingProvider === p.id;

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--affine-border-color, #e2e8f0)',
                  backgroundColor: 'var(--affine-background-primary-color, #ffffff)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</span>
                  {activeKey ? (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#059669',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Active ({activeKey.keyMask})
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Not Configured</span>
                  )}
                </div>

                {activeKey ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Button variant="error" size="default" onClick={() => handleDeleteKey(p.id)}>
                      Revoke Key
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Input
                      placeholder={p.placeholder}
                      type="password"
                      value={inputKeys[p.id] || ''}
                      onChange={val => setInputKeys(prev => ({ ...prev, [p.id]: val }))}
                      style={{ flex: 1 }}
                    />
                    <Button
                      variant="primary"
                      size="default"
                      loading={isSaving}
                      disabled={isSaving || !inputKeys[p.id]?.trim()}
                      onClick={() => handleSaveKey(p.id)}
                    >
                      Save Key
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingRow>
    </>
  );
};
