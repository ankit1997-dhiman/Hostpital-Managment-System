import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const UserSchema= new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    }, 
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    }, 
    fullName:{
        type:String,
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
        required:true,
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refereshToken:{
        type:String,
    }
},{timestamps:true})
 
UserSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next()
    this.password=bcrypt.hash(this.password,10)
    next()
})
 UserSchema.methods.isPasswordCorrect = async function (password){
     return await bcrypt.compare(password, this.password)
 }

 UserSchema.methods.accessToken =  function (){
      return jwt.sign(
           {
            _id:this._id,
            userName:this.userName,
            fullName:this.fullName  
           },
           process.env.ACCESS_TOKEN,
           {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
           }
        )
        
 }
 UserSchema.methods.refreshToken = function (){
   return jwt.sign(
       {
        _id:this._id,
       },
       process.env.REFRESH_TOKEN,
       {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
       }
    )
}

export const User =mongoose.model("User" ,UserSchema)