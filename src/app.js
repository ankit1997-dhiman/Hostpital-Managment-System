import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN_CORS,
    credentials: true,
  })
);

// this is for json limit
app.use(express.json({ limit: "50mb" }));

// this is use form urlencode like %20
app.use(
  express(
    urlencoded({
      extended: true,
      limit: "16kb",
    })
  )
);
app.use(express.static("public"));
app.use(cookieParser());

// import router
// import { API_VERSION } from "./contants.js";
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.routes.js";

import { API_VERSION } from "./contants.js";

// declare route
app.use(`${API_VERSION}users`, userRouter);
app.use(`${API_VERSION}tweets`, tweetRouter);
app.use(`${API_VERSION}likes`, likeRouter);
app.use(`${API_VERSION}video`, videoRouter);
app.use(`${API_VERSION}comment`, commentRouter);

export default app;
