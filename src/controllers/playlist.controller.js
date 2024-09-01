import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const creaatePlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const user = req.user;

  const playlist = await Playlist.create({
    title: title,
    description: description,
    playlistOwner: user._id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

// const addtoPlaylist = asyncHandler(async (req, res) => {
//   const { videoId, playlistId } = req.params;
//   const user = req.user;

//   await Playlist.findByIdAndUpdate({
//     playlistId: new mongoose.Types.ObjectId(playlistId),
//   },{
//     $set:
//         playlistVideo:

//   });
// });

export { creaatePlaylist };
