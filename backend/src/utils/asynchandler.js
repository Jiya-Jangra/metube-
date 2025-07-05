const asyncHandler = (fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>{
            next(err);
        })
    }
}

export default asyncHandler;


//const asynchandler = (fn)=>async(req,res,next)=>{
    // try{
    // await fn(res,req,next); 
    //}
    // catch(err){
    // res.status(err.code||500).json({message : err.message 
    // sucess:false });
    //}