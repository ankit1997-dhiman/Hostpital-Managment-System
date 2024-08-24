import { Router } from "express";
import { loginUser, logout, refereshToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"cover-image",
            maxCount:2
        }]),
    registerUser
)
router.route("/login").post(loginUser)


// protected routue
router.route("/logout").post(verifyJWT ,logout)
router.route("/refresh-token").post(refereshToken)

export default router