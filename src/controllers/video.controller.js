import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uplodOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((fields) => fields === "")) {
    throw new ApiError(400, "Fields are Required");
  }

  const videoFile = req.files.videoFile[0].path;

  const video = await uplodOnCloudinary(videoFile);

  if (!video) {
    throw new ApiError(400, "Video Not Found");
  }
  const thumbnailFile = req.files.thumbnail[0].path;

  if (!thumbnailFile) {
    throw new ApiError(400, "Video Not Required");
  }

  const thumbnail = await uplodOnCloudinary(thumbnailFile);
  if (!thumbnail) {
    throw new ApiError(400, "Video Not Found");
  }

  const videoReocrd = await Video.create({
    video: video?.url,
    thumbnail: thumbnail?.url,
    title: title,
    description: description,
    isPublished: true,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videoReocrd, "Post Successfully"));
});

const getVideos = asyncHandler(async (req, res) => {
  // const video = await Video.find({});
  const video = await Video.aggregate([
    {
      $lookup: {
        from: "users", // Foreign collection name
        localField: "owner", // Field in the 'video' collection
        foreignField: "_id", // Field in the 'users' collection
        as: "userInfo", // The name of the new array field with matching documents
      },
    },
    {
      $addFields: {
        userInfo: { $arrayElemAt: ["$userInfo", 0] }, // Get the first element of the array
      },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        video: 1,
        userInfo: {
          fullName: 1,
        },
        views: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, video, "Fetched all Videos"));
});

const getVideosById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id not Found");
  }

  // const fetchVideoById = await Video.findById({
  //   _id: new mongoose.Types.ObjectId(videoId),
  // });

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users", // Foreign collection name
        localField: "owner", // Field in the 'video' collection
        foreignField: "_id", // Field in the 'users' collection
        as: "userInfo", // The name of the new array field with matching documents
      },
    },
    {
      $addFields: {
        userInfo: {
          $cond: {
            if: { $gt: [{ $size: "$userInfo" }, 0] }, // Check if the array is not empty
            then: { $arrayElemAt: ["$userInfo", 0] }, // Get the first element
            else: null, // Set to null if the array is empty
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        video: 1,
        userInfo: {
          fullName: 1,
        },
        views: 1,
        description: 1,
        createdAt: 1,
      },
    },
  ]);

  // const video = await Video.aggregate([
  //   {
  //     $match: {
  //       _id: new mongoose.Types.ObjectId(videoId),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users", // Foreign collection name
  //       localField: "owner", // Field in the 'video' collection
  //       foreignField: "_id", // Field in the 'users' collection
  //       as: "userInfo", // The name of the new array field with matching documents
  //     },
  //   },
  //   {
  //     $addFields: {

  //       userInfo: { $arrayElemAt: ["$userInfo", 0] }, // Get the first element of the array
  //     },
  //   },
  //   {
  //     $project: {
  //       title: 1,
  //       thumbnail: 1,
  //       video: 1,
  //       userInfo: {
  //         fullName: 1,
  //       },
  //       views: 1,
  //       createdAt: 1,
  //     },
  //   },
  // ]);
  console.log(video);

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video Fetched Suceesfully"));
});

const deleteVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const deleteVideo = await Video.deleteOne({
    _id: new mongoose.Types.ObjectId(videoId),
  });
  return res.status(200).json(new ApiResponse(200, "Deleted Successfully"));
});

const updateVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  if (!(title || description)) {
    throw new ApiError(400, "title and desc Id is required");
  }
  const updateFields = {};

  // Check if title is provided and add to updateFields if it is
  if (title) {
    updateFields.title = title;
  }

  // Check if description is provided and add to updateFields if it is
  if (description) {
    updateFields.description = description;
  }

  // Check if a file (thumbnail) is provided
  if (req.file) {
    const thumbnail = req.file.path;
    const updateThumbnail = await uplodOnCloudinary(thumbnail);

    // Add thumbnail URL to updateFields
    if (updateThumbnail && updateThumbnail.url) {
      updateFields.thumbnail = updateThumbnail.url;
    }
  }
  const updateVideo = await Video.findByIdAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(videoId),
    },
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Updated Successfully"));
});

export { publishVideo, getVideos, getVideosById, deleteVideoId, updateVideoId };
