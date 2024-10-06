import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplodOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const userAccessToken = await user.accessToken();
    const userRefereshToken = await user.refreshToken();

    user.refereshToken = await userRefereshToken;

    await user.save({ validateBeforeSave: false });
    return { userAccessToken, userRefereshToken };
  } catch (error) {
    throw new ApiError(500, "Error Occured while generating password");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, userName, password } = req.body;

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All is required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Already exist");
  }

  const avatarPath = req.files?.avatar[0]?.path;
  // const coverImagePath = req.files?.coverImage[0]?.path

  //   if (!avatarPath) {
  //     throw new ApiError(400, "Avatar file is required");
  //   }
  const avatar = await uplodOnCloudinary(avatarPath);
  //   const coverImage = await uplodOnCloudinary(coverImagePath)

  //   if (!avatar) {
  //     throw new ApiError(400, "Avatar file is required");
  //   }

  const user = await User.create({
    userName: userName?.toLowerCase(),
    avatar: avatar?.url,
    email,
    password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Suceessfully !!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }
  console.log(email);
  // Here is an alternative of above code based on logic discussed in video:
  if (!email) {
    throw new ApiError(400, "username or email is required");
  }
  console.log({ email });

  const user = await User.findOne({
    $or: [{ email }],
  });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { userAccessToken, userRefereshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", userAccessToken, options)
    .cookie("refreshToken", userRefereshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          userAccessToken,
          userRefereshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refereshToken: 1,
      },
    },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "Logout Suceessfully"));
});

const refereshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthrized request");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    console.log(incomingRefreshToken, user.refereshToken);

    // if (incomingRefreshToken !== user.refereshToken) {
    //   throw new ApiError(401, "referesh token is expired or used");
    // }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { userAccessToken, userRefereshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", userAccessToken, option)
      .cookie("refreshToken", userRefereshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            user,
            userAccessToken,
            userRefereshToken: userRefereshToken,
          },
          "Token Refershed "
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error.message || "refresh token is expired or used"
    );
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;

  if (oldpassword && newPassword === "") {
    throw new ApiError(404, "Old Password and New Passowrd is required");
  }

  const user = await User.findById(req.user.id);
  const validPassword = await user.isPasswordCorrect(oldpassword);

  if (!validPassword) {
    throw new ApiError(404, "Not Valid Password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new ApiError(404, "Image Not Found");
  }

  const avatar = await uplodOnCloudinary(avatarPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "updated sucessfully"));
});

const userUpdate = asyncHandler(async (req, res) => {
  const { fullName, userName } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, userName: userName },
    },
    { new: true }
  ).select("-password");

  res.status(200).json(new ApiResponse(200, user, "Updated Successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(404, "User name is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "susubscriber",
        as: "channelSubscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscriberCount: {
          $size: "$channelSubscribedTo",
        },
        isSubscribedTo: {
          $cond: {
            $if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        email: 1,
        subscriberCount: 1,
        channelSubscriberCount: 1,
        avatar: 1,
        fullName: 1,
      },
    },
  ]);
  if (channel?.length()) {
    throw new ApiError(404, "Data Not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "data fetched successfully"));
});

const watchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "owner",
              as: "videoOwner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    userName: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$videoOwner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0].watchHistory, "Data fetched Successfully")
    );
});

export {
  registerUser,
  loginUser,
  logout,
  refereshToken,
  updatePassword,
  currentUser,
  updateAvatar,
  userUpdate,
  watchHistory,
};
