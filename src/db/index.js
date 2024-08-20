import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";
 
 export const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); 
        console.log(`connected ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB sdsd connection FAILED ", error);
        process.exit(1)
       
        
    }
} 
// export default connectDB