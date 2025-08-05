import mongoose,{Schema} from "mongoose"

const tweetScehma = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    content:{
        type:String,
        required:true
    }

},{timeStamps:true})

export const Tweet = mongoose.model("Tweet",tweetScehma); 