import { Skipper } from "https://deno.land/x/abc@v1.0.0-rc2/middleware/skipper.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { CLIENT_URL } = config();

interface CORSConfig {
  skipper?: Skipper;
  allowOrigins?: string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  allowCredentials?: boolean;
  exposeHeaders?: string[];
  maxAge?: number;
}

export const CORSconfig: CORSConfig = {
  allowOrigins: [CLIENT_URL],
};
