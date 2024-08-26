import mongoose, { Schema } from "mongoose";

const tweetSchema =  new Schema({
    content:{
        type:String,
        required:true,
    },
    tweetOwner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Tweet = mongoose.model("Tweet",tweetSchema)