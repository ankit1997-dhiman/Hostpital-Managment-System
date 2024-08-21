import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin:process.env.ORIGIN_CORS,
    credentials:true
}))

// this is for json limit 
app.use(express.json({limit:"18kb"}))

// this is use form urlencode like %20
app.use(express(urlencoded({
    extended:true,limit:"16kb"
})))
app.use(express.static("public"))
app.use(cookieParser())


// import router
import userRouter from './routes/user.routes.js'

// declare route
app.use("/api/v1/users" , userRouter)

export default app