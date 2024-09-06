const Review=require('../models/reviewModel');
const handlerFactory=require('./handlerFactory');
const appError=require('./../utils/appError');


const catchAsync = fn => {
    return (req,res,next)=>{
      fn(req,res,next).catch(next);
    }
    }
// exports.getAllReview= catchAsync(async(req,res,next) =>{
//   let filter={};
//   if(req.params.tourId)filter = { tour:req.params.tourId } 
//   const reviews=await Review.find(filter);

//   res.status(200).json({
//     status:'success',
//     result:reviews.length,
//     review:{
//         reviews
//     }
//   });
// });

exports.checkDuplicateReview = async(req,res,next) =>{
  console.log(req.body.user,req.body.tour);
  const f=await Review.find({tour:req.body.tour,user:req.body.user}).explain();
  console.log(f);
  if(f.length > 0){
    return next(new appError('you already have created a review ',500))
  }
  // const stat = await Review.aggregate([
  //   {
  //     $match:{tour:req.body.tour}   why aggregation pipeline is not working??
  //   }
  // ]);
  // console.log('ok')
  // console.log(stat);
  next();
}



exports.checkCreateReview = (req,res,next) =>{
  if(!req.body.tour)req.body.tour=req.params.tourId;
  if(!req.body.user)req.body.user=req.user.id;

  next();
} 
exports.getAllReview = handlerFactory.getAll(Review) ;
exports.getreview = handlerFactory.getOne(Review,'');
exports.creteReview=handlerFactory.createOne(Review);
exports.updateReview=handlerFactory.updateOne(Review);
exports.deleteReview=handlerFactory.deleteOne(Review);