const appError = require("../utils/appError");
const handleCastErrorDB = err => {
const message=`Invalid${err.path} :${err.value}`
return new appError(message,400);
}
const handleInvalidFieldsErrorDB = err =>{
  const valid='change the name of the name of the tour'
  return new appError(valid,400);
}
handleValidationErrorDB = err => {
  const message='Invalid validator!!!'
  return new appError(message,400);
}

const handleJWTError =err =>{
  const message='Invalid token or something!Somethimng went wrong!Please login again!'
  return new appError(message,401);
}

const handleTokenExpireerror=err=>{
  const message='token has been expired! please log in again!';
  return new appError(message,401);
}
module.exports=(err,req,res,next)=>{
    // console.log(err.stack);
    console.log("error catched!");
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'fail boss';
  // console.log(res.statusCode);
  if(process.env.NODE_ENV==='development'){
    res.status(err.statusCode).json({
      status:err.status,
      message:err.message,
      Error:err,
      stack:err.stack
    }) 
  }else if(process.env.NODE_ENV==='production'){
    let error={ ...err };
    //OBSERVATION:WHEN WE ARE CREATING A HARDCOPY OF ERR OBJECT THEN ITS error.name IS NOT PRESENT THERE..SO WE HAVE TO USE err.name  
    if(err.name === 'CastError'){
      error = handleCastErrorDB(error);
    }
    if(err.code === 11000){
      error=handleInvalidFieldsErrorDB(error);
    }
    if(err.name === 'ValidationError'){
      error=handleValidationErrorDB(error);
    }

    if(err.name === 'JsonWebTokenError'){
      error=handleJWTError(error);
    }

    if(err.name === 'TokenExpiredError'){
      error=handleTokenExpireerror(error);
    }
    //OPEREATIONAL ERROR,TRUSTED ERROR SEND TO THE CLIENT!!! 
    if(error.isOperational){
      res.status(error.statusCode).json({
        status:error.status,
        message:error.message
      })
    }else {
      //PROGRAMMING OR OTHER UNKNOWN ERROR SEMT TO THE CLIENT;;;
      res.status(error.statusCode).json({
        status:'error',
        message:'SOMETHING WENT VERY WRONG!'
      })
    }
  }
    // next();
  } 