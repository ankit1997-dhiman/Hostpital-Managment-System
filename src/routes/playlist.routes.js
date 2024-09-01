import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { creaatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/").post(creaatePlaylist);
// router.route("/add/:videoId/:playlistId").patch(addtoPlaylist);

export default router;
