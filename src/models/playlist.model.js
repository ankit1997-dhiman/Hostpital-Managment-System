import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    playlistOwner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    playlistVideo: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
