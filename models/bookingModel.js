const mongoose = require('mongoose');

const bookingModel = new mongoose.Schema({
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required :[true,'A booking must meet a tour!']
    },
    user : {
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required :[true,'a user should use booking!']
    },
    price : {
        type : Number,
        required : [true,'booing must have a price!']
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    paid :{ 
        type : boolean,
        default : true
    },

},
{
    toJSON:{virtuals:true},
    toObject : {virtuals:true}
}) 



bookingModel.pre(/^find/ ,function(next){
    this.populate({
        path:'User'
    }).populate({
        path : 'Tour',
        select : 'name'
    })
    next();
})

const Booking = mongoose.model('Booking' , bookingModel);

module.exports = Booking;