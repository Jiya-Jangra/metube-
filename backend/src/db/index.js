import mongoose from 'mongoose';

import { DB_NAME } from '../constants.js';




 const Dbconnect = async ()=>{
    try{
        const connectionstring = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(connectionstring.connection.host);
    }catch(err){
        console.log("error in connection of database",err); 
        process.exit(1); // Exit the process with failure
    }
}

export default Dbconnect;