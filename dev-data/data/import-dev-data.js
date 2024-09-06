const mongoose=require('mongoose');
const dotenv = require('dotenv');
const fs=require('fs');
const tourData=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const size=tourData.length;
 const Tour=require('./../../models/tourModel');
 const Review = require('./../../models/reviewModel');
 const User = require('./../../models/userModel');


dotenv.config({ path: './config.env' });
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:true
}).then(console.log("DATABASE CONNECTED!!!"))

const importData = async() => {
    try{
     await User.create(tourData);
     console.log("data imported successfully!")
    }catch(err){
      console.log("Error : ",err)
    }
}
 
const deleteData = async() => {
    try{
        await User.deleteMany();
        console.log("data deleted successfully!");
       }catch(err){
         console.log(" ",err)
       }
}

if(process.argv[2]==='--import') importData();
else if(process.argv[2]==='--delete')deleteData();
console.log(process.argv);