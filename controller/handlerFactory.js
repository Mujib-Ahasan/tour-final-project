
const appError=require('./../utils/appError');
const APIfeature=require('./../utils/apiFeature');

const catchAsync = fn => {
    return (req,res,next)=>{
      fn(req,res,next).catch(next);
    }
    }


exports.deleteOne = Model => catchAsync(async(req, res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
//   console.log(doc);
    if(!doc){
      return next(new appError('Cannot find a doc with this ID',404));
    }
    res.status(204).json({
      status: 'success',
       tour:null
    });


});

exports.updateOne = Model => catchAsync(async (req, res ,next) => {
  
    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true//whatever i am changing only those validator are gonna run!!!
    }).select('+password')
    console.log(doc);
    if(!doc){
      return next(new appError('Cannot find a Document with this ID',404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
});

exports.createOne = Model => catchAsync(async(req, res, next) => {
    // if(!req.body.tour)req.body.tour=req.params.tourId;
    // if(!req.body.user)req.body.user=req.user.id;   to keep it simple just put it into middleware and add this middleware where it is needed;

    const doc=await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: { 
          doc
        }
      });
  });

  exports.getOne = (Model , populateOption)=> catchAsync(async(req, res,next) => {
    let query = Model.findById(req.params.id);
    if(populateOption)query.populate(populateOption);
    query=await query;
  if(!query){
    return next(new appError('Cannot find a tour with this ID',404));
  }
    res.status(200).json({
      status: 'successfully found tour' ,
      data: {
        query
      } 
    });
  });

  exports.getAll =(Model) =>
    catchAsync(async(req, res,next) => {
        let filter={}; 
       if(req.params.tourId)filter = { tour:req.params.tourId } 
        const feature = new APIfeature(Model.find(filter),req.query);
       feature.filtering()
        .sorting()
        .limitingFields()
        .pagination();
      //  const doc = await feature.query.explain();gives a very nice details!
       const doc = await feature.query;

       res.status(200).json({
         status: 'success good',
         results: doc.length,
         data: {
           doc
         }
       });
   });
   
   
    
