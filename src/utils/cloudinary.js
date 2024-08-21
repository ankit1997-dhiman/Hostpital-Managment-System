import {v2} from "cloudinary"
import fs from "fs"



const uplodOnCloudinary = async (filePath) =>{

    try {
        if (!filePath)  return
      const response = await  cloudinary.uploader.upload(filePath, {
            resouce_type:"auto"
        })
        console.log("file uploade successfully")
         return response
    } catch (error) {
        fs.unlinkSync(filePath)
        return null
    }
}
export {uplodOnCloudinary}

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});