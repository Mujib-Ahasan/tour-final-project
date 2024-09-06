const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');

// const catchAsync = fn => {
//     return (req,res,next)=>{
//       fn(req,res,next).catch(next);
//     }
//     }
  

exports.overviewPage = catchAsync(async(req,res,next) =>{
    const tours = await Tour.find();
    res.status(200).render('overview',{
      title:'All tour',
      tours
    }); 
});

exports.getTour = (req,res) =>{
    res.status(200).render('tour',{
      title:'the forest hiker'
    });
};