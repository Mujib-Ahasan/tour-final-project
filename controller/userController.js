const appError = require('../utils/appError');
const User = require('./../models/userModel');
const handlerFactory=require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');


// const multerStorage = multer.diskStorage({
//   destination : (req,file,cb) =>{
//     // console.log('wow')
//     cb(null,'public/img/users');         ///this code is also ok if you donot care about the image sizing stuffs!!!;
//   },
//   filename : (req,file,cb) =>{
//     //user-userId-timeStamp
//     // console.log('wow2')
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })

const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb) => {
  if(file.mimetype.startsWith('image')){
    // console.log('wow3')
    cb(null,true);
  }else{
    cb(new appError('please upload a image!',400),false);
  }
}

const upload = multer({
  storage : multerStorage,
  fileFilter : multerFilter
});

exports.resizeUserImage = catchAsync(async(req,res,next)=>{
  if(!req.file)return next();
  // console.log(req.file);
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // console.log(req.file); 


 await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/users/${req.file.filename}`)

  next();
});


  const filterObj=(obj, ...allowedFields)=>{
    const retObj={};
    Object.keys(obj).forEach(el =>{
      if(allowedFields.includes(el)){
        retObj[el]=obj[el];
      }
    });
    return retObj;
  }

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe=catchAsync(async(req,res,next)=>{
  // console.log(req.file);
  // console.log(req.body);
  if(req.body.password || req.body.confirmPassword){
    return next(new appError('To update password please visit /updateMyPassword',401));
  }
  
  const filterObject=filterObj(req.body,'name','email');
  console.log(filterObject)

  if(req.file)filterObject.photo=req.file.filename;
  console.log(filterObject)
  const user=await User.findByIdAndUpdate(req.user.id,filterObject,{
    new:true,
    runValidators:true 
  })
  console.log(user);
//run the above one or run the below //

// const user=await User.findById(req.user.id);
// user.name="harry";
// console.log(user);
// await user.save({validateBeforeSave:false});

  res.status(200).json({
    status:'success',
    data:{
      user
    },
    message:'user information updated!'
  });
});

exports.deleteMe = catchAsync(async(req, res,next) => {

  const user = await User.findByIdAndUpdate(req.user.id,{active:false});
  if(!user){
  return next('user already deleted!');
  }

  res.status(204).json({
    status: 'error',
    data:null
  });
});

exports.getMe = (req,res,next) =>{
  req.params.id=req.user.id;
  next();
}
exports.getAllUsers = handlerFactory.getAll(User) ;
exports.getUser = handlerFactory.getOne(User,'');
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
// exports.createUser = handlerFactory.createOne(User); we donot need this cause we have our signin feature!


