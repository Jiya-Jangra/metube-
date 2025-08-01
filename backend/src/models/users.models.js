import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import {Video}from './video.models.js'; // adjust the path based on your folder structure




const userSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index:true,//make search faster
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index:true,//make search faster
    },
    avatar:{
        required: true,
        type: String, //cloudinary image url
        default: "https://res.cloudinary.com/dz1qj0x2h/image/upload/v1706266466/avatars/default-avatar.png",
    },
    coverImage:{
        type: String, //cloudinary image url
        default: "https://res.cloudinary.com/dz1qj0x2h/image/upload/v1706266466/avatars/default-cover.png",
    },
    watchHistory :[{
        type: Schema.Types.ObjectId,
        ref:Video,

    }],

    password:{
        type:String,
        required:[true,"Password is required"] ,
        select: false, //do not return password in queries

    },

    refreshToken:{
        type:String , 

    }

    } ,{timestamps: true});


userSchema.pre("save", async function (next){ //works before the user data is being saved checks the modification of password if done it will encrypt the password 
        if(!this.isModified("password")){
            return next(); 

        }
        if (this.password.startsWith("$2b$")) {
        return next();
    }
        this.password = await bcrypt.hash(this.password, 10);
        next();
})          
//mongoose gives you freedom to create you own methods
//if we had to create a passwordcheck 
userSchema.methods.isPasswordCorrect = async function (password){
    //logic to check 
    console.log(password, this.password); 
    const match=  await bcrypt.compare(password,this.password); //returns the boolean value 
    console.log(match);
    return match; 
}

userSchema.methods.generateAccessToken= function(){
    return jsonwebtoken.sign(
        {
            _id :  this._id,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE , //expires in 1 day
        }
    )
}

userSchema.methods.generaterefreshToken= function(){
    return jsonwebtoken.sign(
        {
            _id :  this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE , //expires in 1 day
        }
    )}



const User = mongoose.model("User", userSchema);
export default User;    