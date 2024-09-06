const mongoose=require('mongoose');
const Tour=require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[true,'A review must have review!'],
        minlength:[5,'please add more your thoughts!']
    },
    rating:{
        type:Number,
        default:3.5,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now(),
      },
    tour:
       {
        type: mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
       }
    ,
    user:
        {
            type:mongoose.Schema.ObjectId,
            ref:'User',
        required:[true,'Review must belong to a user']
        }
    
},{
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})


reviewSchema.index({tour:1 ,user:1},{unique:true}); //one user cannot set multiple reviews for the same tour;;;

reviewSchema.statics.calcAverageRating = async function(tourId){//a statics function we can call with the model not by the instance!!!
     const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group : {
             _id:'$tour',
             nRatings:{$sum : 1 },
             avgRating:{$avg : '$rating'}
            }
        }
     ]);
    //  console.log(stats);

     if(stats.length>0){
        const tour = await Tour.findById(tourId);
        tour.ratingsAverage=stats[0].avgRating;
        tour.ratingsQuantity=stats[0].nRatings;
        await tour.save();
        //we camn do this by findByIdandUpdate method too!!!
     }else {
        const tour = await Tour.findById(tourId);
        tour.ratingsAverage=4;
        tour.ratingsQuantity=0;
        await tour.save();
     }
   
};

reviewSchema.post('save',function(){
    this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/,async function(next){
        this.r=await this.findOne();//we cannot do all the calculalation right here cause query(find()) has not done yet so bettr to in post middle ware!!
next();
})

reviewSchema.post(/^findOneAnd/,function(){
    this.r.constructor.calcAverageRating(this.r.tour);
})

 

reviewSchema.pre(/^find/,function(next){ 
    // this.populate({
    //     path:"user",
    //     select:"name photo"
    // }).populate({
    //     path:"tour",
    //     select:"name"
    // })
    this.populate({
        path:"user",
        select:"name photo"
    })
next();
})

const Review = mongoose.model( 'Review',reviewSchema );

module.exports=Review;