const mongoose=require('mongoose');
const User=require('./userModel');
const slugify=require('slugify');
const validator=require('validator');
const { promises } = require('nodemailer/lib/xoauth2');
 const tourSchema=new mongoose.Schema({
    name:{
      type: String,
      required:[true,'A tour need name'],//built-in data validator
      unique:true,
      maxlength:[40,'must be less than 40'],//built-in data validator
      minlength:[10,'must be greater than 20'],//built-in data validator
      //custom validator from the library;;;
      // validate:[validator.isAlpha,'name should not contain number!']
    },
    secret:{
      type:Boolean,
      default:false
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,"A tour must have a duration"]//built-in data validator//this works on update
    },
    maxGroupSize:{
        type:Number,
        required:[true,"A tour must have a GroupSize"]//built-in data validator//this works on update
    },
    difficulty:{
        type:String,
        required:[true,"A tour must have Difficulty"],//built-in data validator//this works on update
        enum:{                                   //    |
         values:['easy','medium','difficult'],   //    | //built-in data validator//this works on update
         message:'think and put!!!'              //    |
          }
    },
  
    price:{
      type:Number,
    required:[true,'A tour need its price'],//built-in data validator//this works on update
    
    },
    priceDiscount:{
      type:Number,
      //custom validator
      validate:{
        validator:function(val){
          //this only points to current document on new document creation,,this thing does not works on .update()method
      return val<this.price;
      },
      message:'validation faailed here'
    }
  },
    ratingsAverage:{
      type:Number,
      default:4,
      min:[1,'rating atleast 1'],
      max:[5,'max rating cannot surprass 5'],
      set : val =>Math.round(val*10) / 10 // very very userful mehtod to follow;;;
    },
    ratingsQuantity:{
        type:Number,
        default:0
      },
      pricediscount:Number,
      Summary:{
        type:Number,
        trim:true
      },

      description:{
        type:String,
        trim:true
      },

      imageCover:{
        type:String,
        require:[true,"A tour must have a image cover"]//built-in data validator
      },
      images:[String],
      craetedAt:{
        type:Date,
        default:Date.now(),
        select:false
      },
      startDates:[Date],
      startLocation:{
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
      },
      //IN ORDER TO CREATE EMBEDD DATA MODEL WE NEED TO CREATE ARRAYS OF EMBEDD DATA
      locations:[// this is embedding documents!!!
        {
          type:{
            type:String,
            default:'Point',
            enum:['Point']
          },
          coordinates:[Number],
          address:String,
          description:String, 
          day:Number
        }
      ],
      guides:[//this is how we do referencing documents!!!
        {
          type:mongoose.Schema.ObjectId,
          ref:'User'
        }
      ]
  },{
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
  });

  tourSchema.virtual('durationweek').get(function(){
    return this.duration / 7;
  })

  tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
  })
  // tourSchema.virtual('summaryWordCount').get(function(){
  //   if(!this.description)return 0;
  //   const temp=this.description.split('.').join(' ');
  //   let count=0;
  //   let i=0;
  //   while(i<temp.length){
  //     if(temp.charAt(i)===' '){
  //       count++;
  //     }
  //   i++;
  //   }

  //   return count+1;
  // })
// DOCUMENT MIDDLEWARE run before .save() and .create() (not in .insertMany());;;
  tourSchema.pre('save',function(next){
    this.slug=slugify(this.name , { lower : true });
    next();
  }); 
// DOCUMENT MIDDLEWARE run after .save() and .create() (not in .insertMany());;;
  // tourSchema.post('save',function(doc,next){
  //   console.log(doc.name)
  //   next();
  // })


// tourSchema.index({ price: 1 });simple indexing
 tourSchema.index({ price: 1,ratingsAverage:-1});//compound indexing
  tourSchema.index({ slug:1 });




  //QUERY MIDDLEWARE run in query methods only;;;
  tourSchema.pre(/^find/,function(next){
    // this.find({secret : {$ne:false}})
    this.start=Date.now();
next();
  })

  tourSchema.post(/^find/,function(){
    // console.log("ok!");
    console.log("time taken: ",Date.now()-this.start);
  });
  tourSchema.pre(/^find/,function(next){  //    this is the example of referencing documents!
    this.populate({
      path:'guides',   
      select:'-__v -passwordChangedAt'
    });
    next();
  })

  // tourSchema.pre('save',async function(next){
  //   this.guides=await Promise.all(this.guides.map( async id => await User.findById(id)));  //this is the example of embedd documents!!
  //   next();
  // });

  // tourSchema.pre('aggregate',function(next){
  //   this.pipeline().unshift({$match: {secret:{$ne:true}}})
  //   // console.log(this.pipeline()); 
  //   next();
  // })


const Tour=mongoose.model('Tour',tourSchema);

  module.exports=Tour;
  