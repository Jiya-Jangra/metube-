import asyncHandler from "../utils/asynchandler.js";
import {APIError} from "../utils/apiError.js"; 
//user import krte h or ye user direct contact kr skta h database se kyuki ye mongoose se bna h 
import User from "../models/users.models.js"; 
import {uploadonCloudinary} from "../utils/cloudnary.js" ;
import { ApiResponse } from "../utils/apiResponse.js"; 
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt"; 
const userRegister = asyncHandler( 
    async(req,res)=>{

    // sari details req m milegi body req.body 
    const {fullName , email, userName , password } = req.body ; 
    console.log(userName); 
    //validaion
    if([fullName,email,userName,password].some((field)=>field?.trim()==="")){
        throw new APIError(400,"all field required")
    }
    //user exist krta h ke nhi krta 
    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    }); 

    if(existedUser) {
        console.log(existedUser); 
        throw new APIError(409,"UserName or email already exits"); 
    }
    

    const avatarLocalPath =  req.files?.avatar[0]?.path
    console.log(avatarLocalPath); 
    let coverImageLocalPath; 
    if(req.files &&  Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path ; 
    }
    console.log(req.files);  

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar is required"); 

    }

   const avatar =  await uploadonCloudinary(avatarLocalPath); 
   console.log(avatar);
   const coverImage =  await uploadonCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new APIError(400,"Avatar is required here"); 

    }
    console.log(userName); 
    const user = await User.create(
        {fullName,
        avatar : avatar.url, 
        coverImage : coverImage?.url || "",
         email,
         password,
         userName: userName.toLowerCase()})

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
const generateAccessTokenAndRefreshToken = async(userID)=>{ 
    try {
        const user = await User.findById(userID); 
        
        const accessToken = user.generateAccessToken(); 
        const refreshToken = user.generaterefreshToken();
        user.accessToken = accessToken ; 
        user.refreshToken = refreshToken ; 
        await user.save({validateBeforeSave:false}) ; 
        console.log("access token",accessToken,"refresh token",refreshToken); 
        return {accessToken,refreshToken}
    } catch (err) {
        console.log("generated error",err); 
        throw new APIError(500,"something went wrong while generating the tokens"); 
    }
}
const loginUser = asyncHandler(
    async (req,res)=>{

       const {email,password,userName} =  req.body ; 
       if(!(userName || email)){
        throw new APIError(404,"username or email is required")
       }

       const user = await User.findOne({
        $or : [{userName},{email}]
       }).select("+password") //ya toh email ya toh userName 

       if(!user){
        throw new APIError(404,'user doesnot exist'); 
       }
       console.log(password)
       const isPasswordValid = await user.isPasswordCorrect(password); 

        if(!isPasswordValid){
        throw new APIError(404,'password not valid'); 
       }
       console.log(user); 
       const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id)

       const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); 
       
       const options = {
        httpOnly:true,
        secure:true 
       }

       return res.status(200).cookie("accessToken",accessToken,options) //app.use(cookieParser()) ki wajh se hum ye use kr skte h app.js m h 
       .cookie("refreshToken",refreshToken,options)
       .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "user loggedIn successfully"
    )
    )




    }
)
const logOutUser = asyncHandler(async()=>{
    //todos
    //remove copkies
    //remove access and refresh tokens 
    console.log(req.cookies); 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken:undefined}
        },
        {
            new:true 
        }
    )
    const options = {
        httpOnly:true,
        secure:true 
       }


    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        201,
        {},
        "User logged out"
    ))


}
)

const refreshAccessToken = asyncHandler(async(req,res)=>{
    //cookies se refresh token req.body.refreshtoken
    const rtoken = req.cookies.refreshToken || req.body.refreshToken ; //idr req.user isliye nhi kia kyuki vo tbhi ata h jb user login ho idr vo logout hogya h verifyJWt humne logout pr lgaya tha 
    if(!rtoken){
        throw new APIError(401,"Invalid refresh token at access refresh  token ")
    } 

try {
        const decodedToken = jwt.verify(rtoken,process.env.REFRESH_TOKEN_SECRET); 
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new APIError(401,"invalid refresh token") ; 
        }
    
        if(rtoken !== user.refreshToken){
            throw new APIError(400,"Refresh token is experied or used"); 
        }
    
        const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    
        req.status(201).cookies("accessToken",accessToken,options)
        .cookies("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken},"access token refreshed"))
} catch (error) {
    console.log("error",error); 
    
}



})

const changePassword = asyncHandler(async(req,res)=>{
    //users se lena h old password 
    const {oldPassword,newPasword} = req.body;//ye toh user joh form m likh ke bhejega vo h  
    if(!(oldPassword && newPasword)){
        throw new APIError(401,"Enter both the passwords"); 
    }
    const user = await User.findById(refreshAccessToken.user?._id);
    const isMatch = await user.isPasswordCorrect(oldPassword)
    if(isMatch){
        user.password = newPasword ; 
        await user.save({validateBeforeSave:false}); //ye negative check kia h sir ne 
    }else{
        throw new APIError(401,"Wrong oldPassword"); 
    }

    return res.status(201
        .json(new ApiResponse(200,"password changed successfully"))
    )
     
})

const currentUser = asyncHandler((req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    //extract the details from form
    const {userName , email,fullName} = req.body  
    //update them in database 
    if(!(userName|| email)){
        throw new APIError(400,"all credentials are required")
    }
    if(!userName){
        throw new APIError(400,"all credentials are required fill userName")
    }
     
    const user = await User.findByIdAndUpdate(

        req.user?._id,
        {
            $set:{
                fullName,
                email,
                userName
            }
        },
        {new:true}
    ).select("-password")


    return res.status(200
    .json(new ApiResponse(200,user,"updated the information in your account"))
    )



})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarFilePath = req.file?.path 
    if(!avatarFilePath){
        throw new APIError(400,"Avatar is missing")
    }

    const avatar = await uploadonCloudinary(avatarFilePath)
    if(!avatar.url){
        throw new APIError(400,"avatar uploading failed on cloud")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}

    ).select("-password")

        res.status(200).json(
        new ApiResponse(200,user,"avatar updated")
    )
})


const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImagePath = req.file?.path 
    if(!coverImagePath){
        throw new APIError(400,"coverImagePath is missing")
    }

    const coverImage = await uploadonCloudinary(coverImagePath)
    if(!coverImage.url){
        throw new APIError(400,"coverImage uploading failed on cloud")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}

    ).select("-password")

    res.status(200).json(
        new ApiResponse(200,user,"coverImage updated")
    )
})
      

export { 
    userRegister,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    currentUser,
    updateAccountDetails,
    updateUserAvatar,
};
