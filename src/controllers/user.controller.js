import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uplodOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async (userID)=>{

    try {
        const user = await User.findById(userID)
        const userAccessToken= user.accessToken()
        const userRefereshToken= user.refreshToken()
        
        user.refereshToken = userRefereshToken
       
        await user.save({validateBeforeSave:false})
        return {userAccessToken ,userRefereshToken}

    } catch (error) {
        throw new ApiError(500 ,"Error Occured while generating password");
        
    }
}

const registerUser = asyncHandler( async (req, res)=>{

    const {userName,email,fullName,password} = req.body
    

    if ([fullName ,userName ,email ,password].some((field)=>field.trim() === "") ) {
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
   
   

if (!createdUser) {
    throw new ApiError(500,"Something went wrong while creating a user");
    
}

   return  res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Suceessfully !!")
   )
})



const loginUser = asyncHandler(async (req, res) =>{
    
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
   
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {userAccessToken, userRefereshToken} = await generateAccessTokenAndRefreshToken(user._id)
   

    const loggedInUser = await User.findById(user._id).select("-password -refereshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", userAccessToken, options)
    .cookie("refreshToken", userRefereshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, userAccessToken, userRefereshToken
            },
            "User logged In Successfully"
        )
    )

})


const logout = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refereshToken : undefined
        }
    },{new:true})

    const option = {
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .clearCookie("accessToken" ,option)
    .clearCookie("refreshToken" ,option)
    .json(new ApiResponse(200 ,{}, "Logout Suceessfully"))
})

const refereshToken =asyncHandler(async(req,res)=>{

   const incomingRefreshToken= req.cookies?.refreshToken || req.body.refreshToken
   

   if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthrized request");
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN)
 
    const user = await User.findById(decodedToken?._id)
   
    if (!user) {
     throw new ApiError(401, "invalid refresh token");
    }
    if(incomingRefreshToken !== user.refereshToken){
     throw new ApiError(401, "refresh token is expired or used");
    }
 
    const option ={
     httpOnly:true,
     secure:true
    }
 
   const {userAccessToken,userRefereshToken} = await generateAccessTokenAndRefreshToken(user._id)

    return res.status(200).cookie("accessToken",userAccessToken,option).cookie("refreshToken" ,userRefereshToken ).json(
     new ApiResponse(200, {user,"refreshToken" :userRefereshToken ,userAccessToken})
    )
   } catch (error) {
    throw new ApiError(401, error.message || "refresh token is expired or used");
   }
})

export {registerUser,loginUser,logout,refereshToken}