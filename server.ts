import { listenAndServe } from "https://deno.land/std/http/server.ts";
import { cors } from "https://deno.land/x/abc@v1.0.0-rc2/middleware/cors.ts";
import { logger } from "https://deno.land/x/abc@v1.0.0-rc2/middleware/logger.ts";
import { Application } from "https://deno.land/x/abc@v1.0.0-rc2/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { CORSconfig } from "./cors.ts";
import { ErrorMiddleware } from "./error.ts";
import { mux } from "./mux.ts";
import { sock } from "./sock.ts";

const { APP_PORT, SOCKET_PORT } = config();

const app = new Application();

app.use(cors(CORSconfig));
app.use(logger());
app.use(ErrorMiddleware);

// API Routes
app.post("/live-stream", mux).start({ port: Number(APP_PORT) });

// socket route
listenAndServe({ port: Number(SOCKET_PORT) }, sock);

console.log(`Socket on ${SOCKET_PORT}`);
console.log(`Server started on port ${APP_PORT}`);
