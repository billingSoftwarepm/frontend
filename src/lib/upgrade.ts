import type { AxiosError } from 'axios';

export interface UpgradeInfo {
  feature: string;
  requiredPlan: string;
  message: string;
}

interface UpgradeErrorBody {
  code?: string;
  feature?: string;
  requiredPlan?: string;
  message?: string;
}

/** Detects the backend's structured "upgrade required" 403 and extracts info. */
export function getUpgradeInfo(err: unknown): UpgradeInfo | null {
  const ax = err as AxiosError<UpgradeErrorBody>;
  const body = ax?.response?.data;
  if (ax?.response?.status === 403 && body?.code === 'UPGRADE_REQUIRED') {
    return {
      feature: body.feature ?? 'this feature',
      requiredPlan: body.requiredPlan ?? 'STARTER',
      message: body.message ?? 'Upgrade your plan to use this feature.',
    };
  }
  return null;
}

const EVENT = 'pm:upgrade-required';

/** Fire the global upgrade popup (called from the Axios interceptor). */
export function emitUpgrade(info: UpgradeInfo) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<UpgradeInfo>(EVENT, { detail: info }));
  }
}

/** Subscribe to upgrade events. Returns an unsubscribe function. */
export function onUpgrade(handler: (info: UpgradeInfo) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<UpgradeInfo>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
