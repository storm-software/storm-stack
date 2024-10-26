export type BatteryManager = {
  supported: boolean;
  loading: boolean;
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

export type NetworkState = {
  online: boolean;
  downlink: number | null;
  downlinkMax: number | null;
  effectiveType: string | null;
  rtt: number | null;
  saveData: boolean | null;
  type: string | null;
};

// http://wicg.github.io/netinfo/#navigatornetworkinformation-interface
declare interface NavigatorNetworkInformation {
  readonly connection?: NetworkInformation;
}

// http://wicg.github.io/netinfo/#navigatornetworkinformation-interface
declare interface Navigator extends NavigatorNetworkInformation {}
declare interface WorkerNavigator extends NavigatorNetworkInformation {}

// http://wicg.github.io/netinfo/#connection-types
export type ConnectionType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "mixed"
  | "none"
  | "other"
  | "unknown"
  | "wifi"
  | "wimax";

// http://wicg.github.io/netinfo/#effectiveconnectiontype-enum
export type EffectiveConnectionType = "2g" | "3g" | "4g" | "slow-2g";

// http://wicg.github.io/netinfo/#dom-megabit
type Megabit = number;
// http://wicg.github.io/netinfo/#dom-millisecond
type Millisecond = number;

// http://wicg.github.io/netinfo/#networkinformation-interface
export interface NetworkInformation extends EventTarget {
  // http://wicg.github.io/netinfo/#type-attribute
  readonly type?: ConnectionType;
  // http://wicg.github.io/netinfo/#effectivetype-attribute
  readonly effectiveType?: EffectiveConnectionType;
  // http://wicg.github.io/netinfo/#downlinkmax-attribute
  readonly downlinkMax?: Megabit;
  // http://wicg.github.io/netinfo/#downlink-attribute
  readonly downlink?: Megabit;
  // http://wicg.github.io/netinfo/#rtt-attribute
  readonly rtt?: Millisecond;
  // http://wicg.github.io/netinfo/#savedata-attribute
  readonly saveData?: boolean;
  // http://wicg.github.io/netinfo/#handling-changes-to-the-underlying-connection
  onchange?: EventListener;
}
