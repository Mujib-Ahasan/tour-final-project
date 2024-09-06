// const fs = require('fs');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
const { json } = require('express');
const Tour=require('./../models/tourModel');
const APIfeature=require('./../utils/apiFeature');
const appError = require('../utils/appError');
const handlerFactory=require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');

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

exports.resizeTourImage = catchAsync(async(req,res,next)=>{
  console.log(req.files);
  if(!req.files)return next();

  req.files.imageCover[0].filename=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/users/${req.files.imageCover[0].filename}`);

  req.body.imageCover = req.files.imageCover[0].filename;
// console.log(req.file);
// console.log(req.files);
  req.body.images=[];
  await Promise.all(
    req.files.images.map( async (file , i) =>{
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
  })
);
  console.log(req.files);
  console.log(req.body);

  next();
});

exports.uploadTourImages = upload.fields([
  {name : 'imageCover' ,maxCount :1},    // it gonna produce req.files
  {name : 'images' ,maxCount : 3}
])

// upload.single('file');when you need to submit single file;   req.file
// exports.uploadTourImages = upload.array('images' ,5); // when you need to submit more files ;  req.files


// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.aliasTopTours=(req,res,next)=>{
  req.query.limit='5';
  req.query.sort='-ratingsAverage,price'
  req.query.fields='name,duration,price,ratingsAverage,summary'
next();
}

// exports.getAllToursTop= async(req,res)=>{
//   try{
//     console.log(req.query);
//     let q=Tour.find();

//     if(req.query.sort){
//       const qrtSrt=req.query.sort.split(',').join(' ');
//       console.log(qrtSrt);
//       q=q.sort(qrtSrt);
//     }
    
    
//     if(req.query.fields){
//       const field=req.query.fields.split(',').join(' ');
//       console.log(field);
//       q=q.select(field);
//     }
//     q=q.skip(0).limit( req.query.limit*1);
//     const tours=await q;
    
//     res.status(200).json({
//       status:'success',
//       result:tours.length,
//       data:{
//         tours
//       }
//     })
//   }catch(err){
//     res.status(400).json({
//       status:'failed ho gaya bc',
//       message:err
//     })
//   }

// }


 


//VVI:WE ALWAYS NEED TO HANDLE UNHANDLED EXCEPTION BEFORE THE EXCEPTION LIKE IN BELOW;;;
// process.on('uncaughtException',err=>{
//   console.log(err.name ,err.message);
// console.log('uncaught exception..forced to shutdown!');
//   process.exit(1);
// })
//console.log(x);
//


// exports.deleteTour = catchAsync(async(req, res,next) => {

//     const tour= await Tour.findByIdAndDelete(req.params.id);
//     if(!tour){
//       return next(new appError('Cannot find a tour with this ID',404));
//     }
//     res.status(204).json({
//       status: 'success',
//        tour
//     });


// });  instead of that what we can use...
exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour,{ path:'reviews' });
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);
exports.createTour = handlerFactory.createOne(Tour);



exports.getToursWithin = (req,res,next) =>{ // just go to the lecture and try this if you see this in workspace;not that important for now! 
 const {distance ,latlan, unit} = req.params;
 const [lat,lan] = latlan.split(',');
if(!lat || !lan){
  return next(new appError('please provide lat and lan',400));
}

console.log(distance , lat,lan, unit);

res.status(200).json({
  status:'success'
});
}


exports.getAllTourStat=catchAsync(async(req,res,next)=>{
 
    console.log('hi from stat!!!');
    const stats=await Tour.aggregate([
      {
        $match:{
          ratingsAverage:{ $gte : 4 },
        }
      },
      {
        $group:{
           _id:{$toUpper:'$difficulty'},//according to the ID different groups will be created!
           numTour:{ $sum: 1 },
           numRatings:{ $sum :'$ratingsQuantity'},
           avgRating:{ $avg :'$ratingsAverage'},
           avgPrice:{ $avg : '$price'},
           minPrice:{ $min : '$price'},
           maxPrice:{ $max : '$price'}
        }
      },
      {
        $sort: {
          avgPrice:1
          }
      }
     
    ]);
    res.status(200).json({
      status: 'success',
       data:{
      stats
       }
    });
});

exports.getAllPlan=catchAsync(async(req,res,next)=>{

    const year= req.params.year*1;
   console.log('plan')
    const plan=await Tour.aggregate([
     {
       $unwind: '$startDates'
      },
      {
        $match:{
          startDates: {$gte:new Date(`${year}-01-01`),$lte:new Date(`${year}-12-31`)}
        }
      },
      {
        $group : {
          _id : {$month : '$startDates'},
          numOfTour : {$sum:1},
          // noOfzcount: {$push:'$summaryWordCount'},aggregation is not working with virtuals;;;cause this peroperty is not a part of a DB
          tours :{$push:'$name'},
          maxPrice:{$max :'$price'},
          minPrice:{$min :'$price'}
        }
      },
      {
        $addFields:{
          month: '$_id',
          year : `${year}`*1
        }
      },
      {
        $sort :{
          numOfTour:-1,
          month:1
        }
      },
      {
        $project: {
          _id:0
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
    result:plan.length,
       data:{
      plan
       }
    });

});