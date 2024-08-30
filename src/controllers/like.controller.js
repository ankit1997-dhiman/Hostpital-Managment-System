import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (tweetId) {
    throw new ApiError(400, "Tweet Id Not Found");
  }
  const user = req.user;
  const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: user });

  if (likedTweet) {
    await Like.deleteOne({
      tweet: tweetId,
      likedBy: user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Dislike Tweet Successfully"));
  } else {
    const tweetliked = await Like.create({
      tweet: tweetId,
      likedBy: user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, tweetliked, "Tweet Liked Successfully"));
  }
});

const likedComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (commentId) {
    throw new ApiError(400, "Comment Id Not Found");
  }
  const user = req.user;

  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: user._id,
  });

  if (likedComment) {
    const deletedComment = await Like.deleteOne({
      comment: commentId,
      likedBy: user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Dislike Comment Successfully"));
  } else {
    const likeComment = await Like.create({
      comment: commentId,
      likedBy: user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likeComment, "Comment Like Successfully"));
  }
});

const likedVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (videoId) {
    throw new ApiError(400, "Video Id Not Found");
  }
  const user = req.user;

  const likedVideo = await Like.findOne({ video: videoId, likedBy: user._id });

  if (likedVideo) {
    await Like.deleteOne({ video: videoId, likedBy: user._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Dislike Video Successfully"));
  } else {
    const likeOnVideo = await Like.create({
      video: videoId,
      likedBy: user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likeOnVideo, "Video Liked Successfully"));
  }
});

const getLikeVideos = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user);

  const likedVideo = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(user._id),
      },
    },
  ]);
  console.log(likedVideo);

  res
    .status(200)
    .status(
      new ApiResponse(200, likedVideo, "Liked Video Fetched Successfully")
    );
});

export { toggleTweetLike, likedComment, likedVideo, getLikeVideos };
