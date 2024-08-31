import mongoose, { mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const postComment = asyncHandler(async function (req, res) {
  const { videoId } = req.params;
  const { content } = req.body;
  const user = req.user;

  if (!content) {
    throw new ApiError(400, "Comment is required");
  }

  const video = await Video.findById({
    _id: new mongoose.Types.ObjectId(videoId),
  });

  const newComment = await Comment.create({
    commentContent: content,
    video: video._id,
    commentOwner: user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "comment Inserted Successfully"));
});

const getVideoComments = asyncHandler(async function (req, res) {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "No Video Found");
  }
  const commentsOnVideo = await Comment.find({
    video: new mongoose.Types.ObjectId(videoId),
  });
  if (!commentsOnVideo.length) {
    throw new ApiError(404, "empty comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, commentsOnVideo, "Fetched all comments Sucessfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  await Comment.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(commentId),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Deleted comment Successfully"));
});

const updateComment = asyncHandler(async function (req, res) {
  const { commentId } = req.params;
  const { content } = req.body;

  const updatedComment = await Comment.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(commentId) },
    {
      commentContent: content,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment Updated Successfully"));
});

export { postComment, getVideoComments, deleteComment, updateComment };
