const User=require('./../models/userModel');
const jwt=require('jsonwebtoken');
const { json } = require('express');
const appError=require('./../utils/appError');
const { promisify }=require('util');
const Email=require('./../utils/email');
const crypto=require('crypto');
const signToken= id =>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRETIME
    })
}
const catchAsync = fn => {
    return (req,res,next)=>{
      fn(req,res,next).catch(next);
    }
    }

exports.signup = catchAsync(async(req,res,next) => {
 const newUser = await User.create(req.body);//there is something wrong with the piece of code!!!
 
 await new Email(newUser,`${req.protocol}://${req.get('host')}/`).sendWelcome();
// const newUser=await User.create({
//     name:req.body.name,
//     email:req.body.email,
//     password:req.body.password,
//     passwordConfirm:req.body.passwordConfirm,
//     passwordChangedAt:req.body.passwordChangedAt
// });
newUser.password=undefined;

const token=signToken(newUser._id);
const cookieOptions={
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly:true
}

if(process.env.NODE_ENV === 'production')cookieOptions.secret = true;//by doing this server gonna send this only in http;
res.cookie("jwt",token ,cookieOptions);
res.status(201).json({
    status:'success',
    token,
    Users:{
   newUser
    }
})
}); 

exports.login = catchAsync(async(req,res,next)=>{
    const { email , password }=req.body;
    //checking if email and password is present or not! 
    if(!email || !password){
        return next(new appError('please enter email and pasword!!!',400));
    }

    //check if this exist in the DB or not;;;
    const user=await User.findOne({email:email}).select('+password');//if something is selected as false in Model,then you have to call.select('+password/else') explicitely!!!
    // console.log(user);
    const correct = await user.correctPassword(password,user.password);//while login we have to check wheather the apssword is correct or not!
//    console.log(correct);
    if(!user || !correct){
        return next(new appError("user not found",401));
    }

   const token=signToken(user._id);
    res.status(200).json({
        status:'success',
        token ,
        user:{
            user
        }
    })
});
exports.protect= catchAsync(async(req,res,next)=>{
    //getting the token and check of its there!
    let token='';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    //  console.log(token)
 
     if(!token){
        return next(new appError('you are not login yet!',401));
     }
    //verification token!
 
    //normal mehtod of verification
    //  jwt.verify(token,process.env.JWT_SECRET,(err,decode) =>{
    //     console.log(err);
    //     console.log(decode);
    //  })

   const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET)//here decode is an object 

    //check if user still exits!
    // console.log(decode.id);
const freshUser=await User.findById(decode.id);

if(!freshUser){
    return next(new appError('the user belonging to this token does no longer exist!!!'),401);
}

     //check if user changed the password after token was issued!
    if(freshUser.changePassWordAfter(decode.iat)){
        return next(new appError('user recently changed the passWord!!!please log in again!!!',401));
    }

    req.user=freshUser;
     next();
});

//very nice method to create middleWare with arguments
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next(new appError('you donot have permission to perform this action!',403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    //get user based on their posted email!
    const user= await User.findOne({email:req.body.email});
    
    if(!user){
        return next(new appError('please enter a valid user email!',404));
    }
    
    //generatte the random reset token!
    const resetToken=user.createPassWordResetToken();
                //for this to save we gonna do...
                console.log(resetToken);
    await user.save({validateBeforeSave:false}); // very important thing to know!
    
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password ? submit a patch request with your new password and passwordConfirm to :${resetURL}.\n If you didnot forget your password ,please ignore the email`;

    //send it to user email!

   try{
    const url =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user,url).forgetPassword();
    //     email:user.email, 
    //     subject:'your password reset token(valid for 10 min)',
    //     message:message
    // });
    res.status(200).json({
        status:'success',
        message:'Token sent to email!'
    });
   } catch(err){
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save({validateBeforeSave :false})
   console.log(err);
    return next(new appError('there was an error sending the email.. try again letter!!',500));
   }
    
});

exports.reset = catchAsync (async(req,res,next)=>{
    //1)get usr based on the token!
    const token1=req.params.token;
    // console.log('hello');
    const hashedToken=crypto.createHash('sha256').update(token1).digest('hex');
    const user=await User.findOne({passwordResetToken:hashedToken});
    console.log(user);

    //2)if the token has not expired and there is user then set the password
   if(!user){
    return next(new appError('user doesnot exist!',400));
   }

   if(user.passwordResetToken < Date.now()){
  return next(new appError('token has expired,try it again!',400));
   }
   
    //3)update the changepassword property of the user!
user.password=req.body.password;
user.passwordConfirm=req.body.password;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
// user.passwordChangedAt=Date.now();
await user.save();
    //4)log the user in and send the jwt
    const token=signToken(user._id);
    
    res.status(200).json({
        status:'success',
        token,
        messgae:'password changed successfully!'
    })

});

exports.updatePassword=catchAsync(async(req,res,next)=>{
    //1)get the user from the collection

    const user=await User.findById(req.user.id).select('+password');
    if(!user){
        return next(new appError('user doesnot exist!',400));
    }

    //2)check if the posted current password is correct!
    if(! await user.correctPassword(req.body.password,user.password)){
  return next(new appError('incorrect user password!',400));
    }


    //3)
    user.password=req.body.newPassword;
    user.passwordConfirm=req.body.newPassword;
    await user.save();

    const token=signToken(user._id);
    res.status(200).json({
        status:'success',
        token,
        message:'password change succesfull'
    })
})