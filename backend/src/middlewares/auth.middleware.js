//verify krega user login h k nhi
//hum access or refresh token match kr lenge agr higa toh same toh user login h 

import asyncHandler from "../utils/asynchandler.js";
import {APIError} from "../utils/apiError.js"; 
import jwt from "jsonwebtoken"; 
import User from "../models/users.models.js";
//iske baad req m ek or field add ho jayega req.user  
const verifyJWT = asyncHandler(async(req,res,next)=>{
try {   
        console.log(req)
        console.log(req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");   

    
    if(!token){
        throw new APIError(401,"Unauthorized access");
    }
    
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    console.log(decodedToken); 
    
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
    if(!user){
        throw new APIError(400,"Invalid Access Token")
    }
    
    req.user = user ; 
    next(); 
}
catch (error) {
    console.log("error occured",error)
    throw new APIError(401,error?.message || "invalid access token"); 
}
});

export {verifyJWT}