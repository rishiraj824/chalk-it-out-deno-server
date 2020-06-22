import { Router } from "https://deno.land/x/oak/mod.ts";
import muxAuthController from "./auth.ts";
import mux from "./mux.ts";
import sock from "./sock.ts";

const router = new Router();

router.use(muxAuthController);

// socket route
router.use(sock);

router.post("/live-stream", mux);

export default router;
