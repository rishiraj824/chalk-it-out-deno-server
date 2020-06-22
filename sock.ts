import { acceptable, acceptWebSocket } from "https://deno.land/std/ws/mod.ts";
import teach from "./teach.ts";

const isWhitelistedSocketURL = (url: String) => {
  const WHITE_LIST_PARAMS = ["key", "id", "rtmp"];
  for (let param of WHITE_LIST_PARAMS) {
    if (url.includes(param)) {
      return true;
    }
  }
  return false;
};

export const sock = async (req:any) => {
  const { conn, headers, r: bufReader, w: bufWriter  } = req;
  if (req.method === "GET" && isWhitelistedSocketURL(req.url)) {
    if (acceptable(req)) {
      const queryString = new URLSearchParams(req.url);
      const key = queryString.get("key");
      const id = queryString.get("id");

      acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      }).then((ws)=> teach(ws, key, id));
    }
  }
};

export default sock;