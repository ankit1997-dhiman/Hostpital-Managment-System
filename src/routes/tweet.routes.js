import { Router } from "express";
import { getTweetById, registerTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.use(verifyJWT)

router.route("/").post(registerTweet)
router.route("/user/:userId").get(getTweetById)


export default router