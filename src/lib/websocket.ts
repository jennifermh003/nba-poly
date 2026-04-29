export type PriceUpdateCallback = (tokenId: string, price: number) => void;
export type StatusCallback = (
  status: "live" | "reconnecting" | "disconnected",
) => void;

export class PolymarketWebSocket {
  private ws: WebSocket | null = null;
  private tokenIds: string[] = [];
  private onPriceUpdate: PriceUpdateCallback;
  private onStatusChange: StatusCallback;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url = "wss://ws-subscriptions-clob.polymarket.com/ws/market";

  constructor(
    onPriceUpdate: PriceUpdateCallback,
    onStatusChange: StatusCallback,
  ) {
    this.onPriceUpdate = onPriceUpdate;
    this.onStatusChange = onStatusChange;
  }

  connect(tokenIds: string[]): void {
    this.tokenIds = tokenIds;
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatusChange("live");
        this.subscribe();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event);
      };

      this.ws.onclose = () => {
        this.handleClose();
      };

      this.ws.onerror = () => {
        // The close event will fire after error, triggering reconnect logic.
        // No separate handling needed here.
      };
    } catch {
      this.handleClose();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect on close

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.onStatusChange("disconnected");
  }

  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = JSON.stringify({
      type: "market",
      assets_ids: this.tokenIds,
    });

    this.ws.send(message);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data as string);

      // Handle array of price updates
      if (Array.isArray(data)) {
        for (const update of data) {
          if (update.asset_id && update.price !== undefined) {
            this.onPriceUpdate(update.asset_id, Number(update.price));
          }
        }
        return;
      }

      // Handle single price update
      if (data.asset_id && data.price !== undefined) {
        this.onPriceUpdate(data.asset_id, Number(data.price));
      }
    } catch {
      // Ignore malformed messages (e.g. heartbeats)
    }
  }

  private handleClose(): void {
    this.ws = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.onStatusChange("reconnecting");
      this.reconnect();
    } else {
      this.onStatusChange("disconnected");
    }
  }

  private reconnect(): void {
    const delay = 1000 * Math.pow(2, this.reconnectAttempts); // 1s, 2s, 4s
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.tokenIds);
    }, delay);
  }
}

export function createWebSocket(
  onPriceUpdate: PriceUpdateCallback,
  onStatusChange: StatusCallback,
): PolymarketWebSocket {
  return new PolymarketWebSocket(onPriceUpdate, onStatusChange);
}
