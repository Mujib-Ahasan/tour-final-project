const mongoose=require('mongoose');
const crypto=require('crypto');
const validate=require('validator');
const bcrypto=require('bcryptjs');

const userSchema=new mongoose.Schema({      
    name:{
        type:String,
        required:[true,'A user must have a name!'], 
    },
    email:{
        type:String,
        required:[true,'A user must have  a emial!'],
        unique:true,
        lowercase:true,
        validate:[validate.isEmail,'your email is Invalid!'] 
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'A user must have password!'],   
        minlength:8,
        select :false
    },
    passwordConfirm:{
        type:String,
        required:[true,"please confirm your password!"],
        validate:{
                //this only points to current document on new document creation,,this thing does not works on .update()method
        validator : function(val) {
            console.log("in the validator!")
            return val===this.password;
        },
        message:'check your password again!'
    }
    },
    passwordChangedAt:Date, 
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});
userSchema.pre('save', function(next){ // this gonna work on update too!!!
    // console.log("ok");
    if(!this.isModified('password') || this.isNew)return next();
    // console.log("ok2");

    this.passwordChangedAt=Date.now()-1000;
    next();
})

userSchema.pre('save',async function(next){
    //only run this password is not modified;;;
    if(!this.isModified('password')) return next();
    this.password=await bcrypto.hash(this.password,12);
    // console.log('tata');
    this.passwordConfirm=undefined;
    next();
})

userSchema.pre(/^find/,function(next){ // return me the things with active=true;please check it
    this.find({active:{$ne:false}});
    next();
})

// instance methds presnet in all the document;;;
userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
return await bcrypto.compare(candidatePassword,userPassword);
}

userSchema.methods.changePassWordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimeStamp=(this.passwordChangedAt.getTime())/1000;
        console.log(changeTimeStamp,JWTTimestamp);
        return JWTTimestamp <= changeTimeStamp;
    }
    
    //false mena not change in password
    return false;
}

userSchema.methods.createPassWordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// console.log({resetToken});
// console.log(this.passwordResetToken);

this.passwordResetExpires=Date.now() + 60*10*1000;

return resetToken;
 }

const User=mongoose.model('User',userSchema);
module.exports=User;