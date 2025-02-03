import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs'
import { fileURLToPath } from 'url';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {

        if(!localFilePath) return null

         // Upload file 
     const uploadResult = await cloudinary.uploader
     .upload(
         localFilePath, {
             resource_type: "auto"
         }
     )
     
     //file has been successfully uploaded
     fs.unlinkSync(localFilePath)
     return uploadResult;

    } catch (error) {
        fs.unlinkSync(localFilePath)   // it will delete the locally placed file
        return null;
    }
}

export {uploadOnCloudinary}

