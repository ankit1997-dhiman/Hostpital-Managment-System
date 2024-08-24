import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT= asyncHandler(async (req,res,next)=>{
 
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
    
        if(!token){
            throw new ApiError(401 ,"not authorised")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN)
        const user =  await User.findById(decodeToken?._id).select("-password -refereshToken")
    
        if(!user){
            throw new ApiError(401 ,"Invalid Access token")
            }
    
        req.user= user
        next()
    } catch (error) {
       throw new ApiError(401,error?.message || "Invalid access Token")
    }
})