import { Router } from "https://deno.land/x/oak/mod.ts";
import muxAuthController from './auth.ts';

const router = new Router();

router.post('/auth', muxAuthController);

export default router;
