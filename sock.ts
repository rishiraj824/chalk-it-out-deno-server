import { acceptable, acceptWebSocket } from "https://deno.land/std/ws/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import teach from "./teach.ts";

const { APP_HOST, APP_PORT } = config();

const isWhitelistedSocketURL = (url: String) => {
  const WHITE_LIST_PARAMS = ["key", "id", "rtmp"];
  for (let param of WHITE_LIST_PARAMS) {
    if (!url.includes(param)) {
      return true;
    }
  }
  return false;
};

export default (async (ctx: any) => {
  const { request, response } = ctx;
  if (request.method === "GET" && isWhitelistedSocketURL(request.url.href)) {
    if (acceptable(request)) {
      const queryString = new URLSearchParams(
        `ws://${APP_HOST}:${APP_PORT}/${request.url}`,
      );
      const key = queryString.get("streamKey");
      const id = queryString.get("streamId");

      acceptWebSocket({
        conn: request.conn,
        bufReader: request.r,
        bufWriter: request.w,
        headers: request.headers,
      }).then(teach.bind(null, key, id));
    }
  } else {
    response.body = {
      message: "Some error occurred",
    };
  }
});
