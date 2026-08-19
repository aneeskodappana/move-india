export type AppErrorCode =
  | "invalid_request"
  | "invalid_otp"
  | "rate_limited"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
