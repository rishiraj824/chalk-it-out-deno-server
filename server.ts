//import { listenAndServe } from "https://deno.land/std/http/server.ts";
//import { acceptable, acceptWebSocket } from "https://deno.land/std/ws/mod.ts";
// Importing some console colors
import { bold, yellow } from "https://deno.land/std@0.54.0/fmt/colors.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import {
  Application,
  Context,
  isHttpError,
} from "https://deno.land/x/oak/mod.ts";
import router from "./routes.ts";
import socketRoute from "./sock.ts";

const { APP_HOST, APP_PORT, CLIENT_URL } = config();
const app = new Application();

// cors
app.use(async (ctx: Context, next: Function) => {
  ctx.response.headers.append("Access-Control-Allow-Origin", "*");
  ctx.response.headers.append("Access-Control-Allow-Credentials", "true");
  ctx.response.headers.append(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT",
  );
  ctx.response.headers.append(
    "Access-Control-Allow-Headers",
    "*",
  );
  next();
});

app.use(router.routes());
app.use(router.allowedMethods());

// Error handler
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      context.response.status = err.status;
      const { message, status, stack } = err;
      if (context.request.accepts("json")) {
        context.response.body = { message, status, stack };
        context.response.type = "json";
      } else {
        context.response.body = `${status} ${message}\n\n${stack ?? ""}`;
        context.response.type = "text/plain";
      }
    } else {
      console.log(err);
      throw err;
    }
  }
});

// socket route
app.use(socketRoute);

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    bold("Started listening on ") + yellow(`${hostname}:${port}`),
  );
});

await app.listen({ hostname: APP_HOST, port: Number(APP_PORT) });

console.log("Server started listening on port 3001");
