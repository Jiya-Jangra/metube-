import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config(
    { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY  , 
        api_secret: process.env.CLOUDINARY_API_SECRET ,
        secure: true    
    }
     );

const uploadonCloudinary = async (filePath)=>{
     try{
        if(!filePath) return null ; 
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto', // Automatically detect the resource type (image, video, etc
        });    
        console.log("File uploaded successfully to Cloudinary:", response.url);
        return response ; 

    }catch(err){
    fs.unlinkSync(filePath) ; 
} } 

export {uploadonCloudinary} ; 