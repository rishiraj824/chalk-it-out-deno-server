import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Context } from "https://deno.land/x/oak/mod.ts";

const { MUX_API_ACCESS_ID, MUX_API_SECRET_KEY, MUX_API_URL } = config();

export default async (ctx: Context) => {
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { msg: "Invalid data" };
    return;
  }

  const requestHeaders = new Headers();
  requestHeaders.append("Content-Type", "application/json");
  requestHeaders.append(
    "Authorization",
    `Basic ${MUX_API_ACCESS_ID}:${MUX_API_SECRET_KEY}`,
  );

  const raw = JSON.stringify(
    {
      "playback_policy": "public",
      "new_asset_settings": { "playback_policy": "public" },
    },
  );

  const requestOptions: RequestInit = {
    method: "POST",
    headers: requestHeaders,
    body: raw,
    redirect: "follow",
  };

  const muxResponse = async (MUX_API_URL: string) => {
    let data = await (await fetch(MUX_API_URL, requestOptions)).text();
    console.log(data);
    return data;
  };
  muxResponse(MUX_API_URL);

  ctx.response.body = muxResponse(MUX_API_URL);
};
