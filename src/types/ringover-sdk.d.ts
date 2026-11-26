/* Le paquet ringover-sdk ne fournit pas de types : voici ceux de sa documentation (v1.1.3). */
declare module "ringover-sdk" {
  export type RingoverOptions = {
    type?: "fixed" | "relative" | "absolute";
    size?: "big" | "medium" | "small" | "auto";
    container?: string | null;
    position?: { top?: string | null; bottom?: string | null; left?: string | null; right?: string | null };
    border?: boolean;
    animation?: boolean;
    backgroundColor?: string;
    trayicon?: boolean;
    trayposition?: { top?: string | null; bottom?: string | null; left?: string | null; right?: string | null };
  };
  export default class RingoverSDK {
    constructor(options?: RingoverOptions);
    generate(): HTMLIFrameElement | undefined;
    destroy(): boolean;
    checkStatus(): boolean;
    show(): boolean;
    hide(): boolean;
    toggle(): boolean;
    isDisplay(): boolean;
    logout(): boolean;
    reload(): boolean;
    getCurrentPage(): string | false;
    changePage(page: string): boolean;
    dial(numberE164: string | number, fromNumberE164?: string | number | null): boolean;
    sendSMS(to: string | number, content: string, from?: string | number | null): boolean;
    openCallLog(callId: string): boolean;
    on(event: string, fn: (e: { action: string; data: Record<string, unknown> }) => void): boolean;
    off(): boolean;
  }
}
