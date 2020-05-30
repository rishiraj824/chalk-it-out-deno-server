import { Jose, makeJwt, Payload, setExpiration } from "https://deno.land/x/djwt/create.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { MUX_API_ACCESS_ID, MUX_API_SECRET_KEY } = config(); 

const payload: Payload = {
  iss: MUX_API_ACCESS_ID,
  exp: setExpiration(new Date().getTime() + 60000),
}

const header: Jose = {
  alg: "HS256",
  typ: "JWT",
}

export default async ({ request, response }: { request: any, response: any }) => {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { msg: "Invalid data" };
      return;
    }
  
    request.respond({ jwt: makeJwt({ key: MUX_API_SECRET_KEY, header, payload }) });
  
};


