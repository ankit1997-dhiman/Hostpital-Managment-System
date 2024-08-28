import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likedComment, likedVideo, toggleTweetLike } from "../controllers/like.controller.js";


const router = Router()
router.use(verifyJWT)

router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/toggle/c/:commentId").post(likedComment)
router.route("/toggle/v/:videoId").post(likedVideo)
router.route("/videos").get()

export default router