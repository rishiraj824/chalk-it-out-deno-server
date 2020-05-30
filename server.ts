import { listenAndServe } from "https://deno.land/std/http/server.ts";
import { acceptable, acceptWebSocket } from "https://deno.land/std/ws/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import router from "./routes.ts";
import teach from "./teach.ts";

const { APP_HOST, APP_PORT } = config();
const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

listenAndServe({ port: Number(APP_PORT) + 1 }, async (req) => {
  if (req.method === "GET" && req.url.includes("/rtmp")) {
    if (acceptable(req)) {
      const queryString = new URL(`ws://${APP_HOST}:${APP_PORT}/${req.url}`).search;
      const params = new URLSearchParams(queryString);
      const key = params.get('key');
      
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }).then(teach.bind(null, key));
    }
  }
  else {

  }
});
console.log("Server started on port 3000");

