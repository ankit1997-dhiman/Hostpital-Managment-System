import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uplodOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res)=>{

    const {userName,email,fullName,password} = req.body
    // console.log(email)

    if ([fullName ,userName ,email ,password].some((filed)=>filed.trim()=== "") ) {
        throw new ApiError(400 , "All is required");
    }

    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    })
    
    if (existedUser) {
        throw new ApiError(409, "Already exist");
        
    }
    
    const avatarPath = req.files?.avatar[0]?.path
    // const coverImagePath = req.files?.coverImage[0]?.path

    if(!avatarPath ){
        throw new ApiError(400 ,"Avatar file is required");
    }
    const avatar = await uplodOnCloudinary(avatarPath)
//   const coverImage = await uplodOnCloudinary(coverImagePath)
    
    if(!avatar){
        throw new ApiError(400 ,"Avatar file is required");
        
    }

    const user= await User.create({userName: userName.toLowerCase(),avatar: avatar.url,  email, password ,fullName})

   const createdUser = await User.findById(user._id).select("-password -refreshToken")
   console.log(createdUser)
   

if (!createdUser) {
    throw new ApiError(500,"Something went wrong while creating a user");
    
}

   return  res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Suceessfully !!")
   )
})


export {registerUser}