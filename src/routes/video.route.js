import { Router } from "express";
import { upload } from "../middlewares/multer.middlerware.js";
import {
  deleteVideoId,
  getVideos,
  getVideosById,
  publishVideo,
  updateVideoId,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/all-videos/").get(getVideos);

router
  .route("/:videoId")
  .get(verifyJWT, getVideosById)
  .delete(verifyJWT, deleteVideoId)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoId);

export default router;
