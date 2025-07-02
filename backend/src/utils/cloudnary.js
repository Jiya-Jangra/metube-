import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config(
    { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxqauxhrz', 
        api_key: process.env.CLOUDINARY_API_KEY || '321611789665942', 
        api_secret: process.env.CLOUDINARY_API_SECRET || 'sZMuCEQl8D_fPI56z-5ZMAnLyhc',
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