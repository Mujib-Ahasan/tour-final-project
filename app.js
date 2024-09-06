const path=require('path');
const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const appError=require('./utils/appError.js');
const golbalErrorHandling=require('./controller/errController.js');
const helmet=require('helmet');
const mongoSanitizer=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const reviewRouter=require('./routes/reviewRoute.js');
const viewRoute=require('./routes/viewRoute.js');

const app = express();


// 1) MIDDLEWARES

app.use(helmet())//set security http headers

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));


app.use(express.json());
//data sanitization against NOSQL query Injection!
app.use(mongoSanitizer());

//data sanitization against XSS!
app.use(xss());

//preevent parameter pollution
app.use(hpp({
  whitelist:['duration']
})); 

const limiter=ratelimit({
  max:100,
  windowMs:60*60*1000,
  message:"Too many request from this IP,please try again in an hour!"
})

app.use('/api',limiter);

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  // console.log(req.headers);
  next();
});

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   // // console.log(req.requestTime);
//   next();
// });


// 3) ROUTES
app.use('/',viewRoute);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*',(req,res,next)=>{
  //1ST METHOD OF HANDLING A ERROR
  // res.status(404).json({
  //   status:'fail',
  //   message:`cannot find ${req.originalUrl} in the server!`
  // })
  // next();

  //2ND METHOD OF HANDLING A ERROR

  // const e=new Error(`cannot find ${req.originalUrl} in the server!`);
  // e.status='this sucks!';
  // e.statusCode=404;
  // next(e);
  //2ND METHOD OF HANDLING A ERROR BY JUST CREATIGN A CUSTOM CALSS OF ERROR HANDLING;;;

  next(new appError(`cannot find ${req.originalUrl} in the server!`,404));
})
//GLOBAL ERROR HANDLING MIDDLEWARE => IF WE ADD  next(new appError(message,statusCode) IN ANY MIDDLEWARE IT GONNA DIREVTLY CALL THAT GLOBAL ERROR HANDLING MIDDLEWARE;;
app.use(golbalErrorHandling); 

module.exports = app;  
 