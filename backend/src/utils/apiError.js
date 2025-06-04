class APIError extends Error{
    constructor(
        statusCode, 
        message ="error occured ",
        errors=[],
        stack = ""
    ){
        supper(message)
        this.statusCode= statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;
        this.data = null ;  
        if(stack){
            this.stack = stack ; 
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {APIError}; 