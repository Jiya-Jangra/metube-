import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";



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
        required:[true,"PAssword is required"] ,
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
        this.password = await bcrypt.hash(this.password, 10);
        next();
})          
//mongoose gives you freedom to create you own methods
//if we had to create a passwordcheck 
userSchema.methods.isPasswordCorrect = async function (password){
    //logic to check 
    return await bcrypt.compare(password,this.password); //returns the boolean value 
}

userSchema.methids.generateAccessToken= function(){
    JsonWebTokenError.sign(
        {
            _Id :  this._id,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE , //expires in 1 day
        }
    )
}

userSchema.methids.generaterefreshToken= function(){
    JsonWebTokenError.sign(
        {
            _Id :  this._id,

        },
        process.env.REFRESH_TOKEN_SECRE,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE , //expires in 1 day
        }
    )}



const User = mongoose.model("User", userSchema);
export default User;    