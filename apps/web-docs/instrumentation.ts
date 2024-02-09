import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel("@storm-stack/web-docs");
}
