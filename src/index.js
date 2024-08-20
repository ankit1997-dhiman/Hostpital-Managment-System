import dotenv from "dotenv"
import {connectDB} from "./db/index.js"
import app from "./app.js"


 dotenv.config({
    path:"./env"
 })
connectDB()
.then(()=>{
   app.on('error',(error)=>{
      console.log(error,"here is error");
      
   })
   app.listen(process.env.PORT | 8000 ,()=>{
      console.log("connectDB successfully");
   } )
   
   
})
.catch((err)=>{
   console.log(err,"connection Failed !!");
   
})

// (async()=>{
//         try {
//            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//            app.on("error",(error)=>{
//             console.log(error)
//            })
//            app.listen(process.env.PORT,()=>{
//             console.log("runnug ");
            
//            })
//         } catch (error) {
//          console.error("Error" , error)   
//         }
// })()