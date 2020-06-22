import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.0.0-rc2/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { MUX_API_ACCESS_ID, MUX_API_SECRET_KEY, MUX_API_URL } = config();

export const mux: HandlerFunc = async (ctx: Context) => {
  try {
    const body: Object = await (ctx.body());
    if (!Object.keys(body).length) {
      return ctx.string("Request can't be empty", 400);
    }

    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    const token = btoa(`${MUX_API_ACCESS_ID}:${MUX_API_SECRET_KEY}`);

    requestHeaders.append(
      "Authorization",
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

    const muxResponse = async (MUX_API_URL: string): Promise<any> => {
      let data = await (await fetch(MUX_API_URL, requestOptions)).text();
      return data
    };

    let data = await muxResponse(MUX_API_URL);

    ctx.json(data, 200);
  } catch (err) {
    console.log(err)
    return ctx.json(err, 500);
  }
};
