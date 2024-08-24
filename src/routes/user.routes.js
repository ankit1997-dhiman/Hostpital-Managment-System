import { Router } from "express";
import { currentUser, loginUser, logout, refereshToken, registerUser, updateAvatar, updatePassword, userUpdate } from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT ,updatePassword )
router.route("/current-user").post(verifyJWT ,currentUser )
router.route("/update-avatar").patch(verifyJWT ,upload.single("avatar"),updateAvatar )
router.route("/update-user").patch(verifyJWT , userUpdate )

export default router