class appError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
        this.status=`${statusCode}`.startsWith('4')?'fail bro':'error';

        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports=appError;