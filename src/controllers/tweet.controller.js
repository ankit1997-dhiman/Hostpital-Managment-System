import mongoose, { model } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const user = await User.findById(req.user._id);
  const tweet = await Tweet.create({
    content: content,
    tweetOwner: user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Submit Successfully"));
});

const getTweetById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "Id Is required");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "tweetOwner",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$result",
        },
      },
    },
    {
      $project: {
        content: 1,
        owner: {
          userName: 1,
        },
      },
    },
  ]);

  if (!tweet.length) {
    throw new ApiError(404,"No Tweet Found");
  }
  

  return res.status(200)
    .json(new ApiResponse(200, tweet, "tweet Fetched Successfully"));
});

const updateTweet =asyncHandler(async(req,res)=>{
  const tweetId = req.params
  const uContent=req.body
 
   if(!tweetId){
    throw new ApiError(404,"Tweet Not Found");
   }
    
    const tweet = await Tweet.findByIdAndUpdate(new mongoose.Types.ObjectId(tweetId.tweetId),{
      $set:{
        content: uContent.content
      }
    },{new:true})

    if (!tweet) {
      throw new ApiError(400 ,"Internal server error while updating tweet");
      
    }
  return res.status(200).json(
    new ApiResponse(200,tweet,"Updated Succeesfully")
  ) 
})

const deleteTweet= asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    if(!tweetId){
      throw new ApiError(400 ,"Id Not Found")
    }
    
    await Tweet.findByIdAndDelete(new mongoose.Types.ObjectId(tweetId))

    return res.status(200).json(new ApiResponse(200 ,"Deleted Successfully"))
})
export { registerTweet, getTweetById,updateTweet ,deleteTweet};
