import asyncHandler from "../utils/asynchandler.js";
import {APIError} from "../utils/apiError.js"; 
//user import krte h or ye user direct contact kr skta h database se kyuki ye mongoose se bna h 
import {User} from "../models/users.models.js"; 
import {uploadOnCloudinary} from "../utils/cloudnary.js" ;
import { ApiResponse } from "../utils/apiResponse.js"; 
const userRegister = asyncHandler( 
    async(req,res)=>{

    // sari details req m milegi body req.body 
    const {fullname , email, username , password } = req.body ; 
    console.log(email); 
    //validaion
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new APIError(400,"all field required")
    }
    //user exist krta h ke nhi krta 
    const existedUser = User.findOne({
        $or: [{username},{email}]
    }); 

    if(existedUser) {
        console.log(existedUser); 
        throw new APIError(409,"UserName or email already exits"); 
    }
    

    const avatarLocalPath =  req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path  
    console.log(req.files);  

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar is required"); 

    }

   const avatar =  await uploadOnCloudinary(avatarLocalPath); 
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new APIError(400,"Avatar is required"); 

    }

    const user = await User.create(
        {fullname,
        avatar : avatar.url, 
        coverImage : coverImage?.url || "",
         email,
         password,
         username: username.toLoweCase()})

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )     
    if(!createdUser){
        throw new APIError(500,"User didnt created"); 
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user created successfully")
    )
})

export { userRegister };
