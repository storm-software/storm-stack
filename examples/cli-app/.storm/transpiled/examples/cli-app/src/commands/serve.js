var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// examples/cli-app/src/types.ts
var __\u03A9ServePayload = ["host", "The host to bind the server to.", '"localhost"', "port", "The port to bind the server to.", "3000", "compress", "Should the server serve compressed files?", "node", "browser", "platform", '"node"', "loadEnv", "Should the server load environment variables from the .env file?", "true", "The payload for the example CLI application.", "ServePayload", `P&4!?">#'4$?%>&)4'8?(P.).*J4+?(>,)4-?.>/M?0w1y`];

// examples/cli-app/src/commands/serve.ts
import { StormPayload } from "examples/cli-app/.storm/runtime/payload";
import { useStorm } from "examples/cli-app/.storm/runtime/context";
function handler(event) {
  const payload = event.data;
  useStorm().log.info(`Starting server on ${payload.host}:${payload.port} with compress: ${payload.compress} and loadEnv: ${payload.loadEnv}`);
}
__name(handler, "handler");
handler.__type = [() => __\u03A9ServePayload, () => StormPayload, "event", "handler", "Start a server and serve the application", 'PPn!7"2#"/$?%'];
var serve_default = handler;
export {
  serve_default as default
};
