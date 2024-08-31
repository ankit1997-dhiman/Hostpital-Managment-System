import { Router } from "express";
import {
  deleteComment,
  getVideoComments,
  postComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/:videoId").post(postComment).get(getVideoComments);
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
