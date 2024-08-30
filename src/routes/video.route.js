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
router.use(verifyJWT);
router
  .route("/")
  .post(
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
  )
  .get(getVideos);

router
  .route("/:videoId")
  .get(getVideosById)
  .delete(deleteVideoId)
  .patch(upload.single("thumbnail"), updateVideoId);

export default router;
