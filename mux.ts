import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Context } from "https://deno.land/x/oak/mod.ts";

const { MUX_API_ACCESS_ID, MUX_API_SECRET_KEY, MUX_API_URL } = config();


const muxResponse = async ({ requestOptions }: { requestOptions: any }): Promise<any> => {
  let data = await (await fetch(MUX_API_URL, requestOptions)).text();
  return data
};


export default async (ctx: Context, next: Function) => {
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { msg: "Invalid data" };
    return;
  }

  const requestHeaders = new Headers();
  const token = btoa(`${MUX_API_ACCESS_ID}:${MUX_API_SECRET_KEY}`);

  requestHeaders.append("Content-Type", "application/json");
  requestHeaders.append(
    `Authorization`,
    `Basic ${token}`,
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

  const data = await muxResponse({ requestOptions });

  next();

  ctx.response.body = data;
  ctx.response.status= 200;
};
