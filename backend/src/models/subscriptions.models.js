import mongoose,{Schema} from "mongoose"; 

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref:"User", //one who is subscribing 
    

    },
    channel:{
        type: Schema.Types.ObjectId,
        ref:"User", //one whom subscribing  
    }
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema);