const mongoose=require('mongoose');
const dotenv = require('dotenv');
//BETTER TO PUT THIS AT THE VERY BEGINING OF TRHE CODE;;;

process.on('uncaughtException',err=>{
  console.log(err.name ,err.message,err.stack);
console.log('uncaught exception..forced to shutdown!');
  process.exit(1);
})


dotenv.config({ path: './config.env' });
const app = require('./app');

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:true
}).then(console.log("DATABASE CONNECTED!!!"))
// .catch(err=>console.log('error'))


// const Tour=mongoose.model('Tour',tourSchema);
// const testTour=new Tour({
//   name:"The Moon Walker",
//   price:678,
// })n

// testTour.save()
// .then(doc=>console.log(doc))
// .catch(err=>console.log('error:'+err));
process.on('unhandledRejection',(err)=>{
  console.log('promise rejection error!')
  console.log('unhandled rejection..forced to shutdown!');
  server.close(()=>{
    process.exit(1);
  });
});

//STARTING EXPRESS APP;;;
const port = process.env.PORT || 3000; 
const server=app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// console.log(x);





