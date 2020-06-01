import { Router } from "https://deno.land/x/oak/mod.ts";
import muxAuthController from "./auth.ts";
import createLiveStream from "./mux.ts";

const router = new Router();

router.use(muxAuthController);
router.post("/live-stream", createLiveStream);

export default router;
