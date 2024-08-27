import { Router } from "express";
import { getTweetById, registerTweet,updateTweet,deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.use(verifyJWT)

router.route("/").post(registerTweet)
router.route("/user/:userId").get(getTweetById)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)


export default router