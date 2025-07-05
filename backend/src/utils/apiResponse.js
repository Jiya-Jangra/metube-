 class ApiResponse {
    constructor(statusCode , message, data=null, success=true ){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400
    }
 }
 //jb bhi response send krni h ese hi krni h 

 export {ApiResponse} ; 
 