import asyncHandler from "../utils/asynchandler.js";
import {APIError} from "../utils/apiError.js"; 
//user import krte h or ye user direct contact kr skta h database se kyuki ye mongoose se bna h 
import User from "../models/users.models.js"; 
import {uploadonCloudinary} from "../utils/cloudnary.js" ;
import { ApiResponse } from "../utils/apiResponse.js"; 
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

        User.refreshToken = refreshToken ; 
        await user.save({validateBeforeSave:false}) ; 

        return {accessToken,refreshToken}
    } catch (err) {
        throw new APIError(500,"something went wrong while generating the tokens"); 
    }
}
const loginUser = asyncHandler(
    async (req,res)=>{

       const {email,password,userName} =  req.body ; 
       if(!userName || !email){
        throw new APIError(404,"username or email is required")
       }

       const user = await User.findOne({
        $or : [{userName},{email}]
       }) //ya toh email ya toh userName 

       if(!user){
        throw new APIError(404,'user doesnot exist'); 
       }

       const isPasswordValid = await user.isPasswordCorrect(password); 

        if(!isPasswordValid){
        throw new APIError(404,'password not valid'); 
       }

       const {refreshToken,accessToken}= await generateAccessTokenAndRefreshToken(user._id)

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
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken:undefined}
        },
        {
            new:true 
        }
    )

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

export { userRegister,loginUser,logOutUser };
