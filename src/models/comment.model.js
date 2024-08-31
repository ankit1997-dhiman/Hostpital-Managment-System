import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentContent: {
      type: String,
      required: true,
    },
    commentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
