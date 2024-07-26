export type MessageType = "error" | "info" | "success" | "warning";
// eslint-disable-next-line no-redeclare
export const MessageType = {
  ERROR: "error" as MessageType,
  INFO: "info" as MessageType,
  SUCCESS: "success" as MessageType,
  WARNING: "warning" as MessageType
};

export type MessageDetails<TMessageType extends string = MessageType> =
  | {
      code: string;
      message?: string;
      type: TMessageType;
    }
  | {
      code?: string;
      message: string;
      type: TMessageType;
    };

export type ErrorMessageDetails = {
  type: "error";
} & Omit<MessageDetails, "type">;
export type WarningMessageDetails = {
  type: "warning";
} & Omit<MessageDetails, "type">;
export type InfoMessageDetails = {
  type: "info";
} & Omit<MessageDetails, "type">;
export type SuccessMessageDetails = {
  type: "success";
} & Omit<MessageDetails, "type">;
