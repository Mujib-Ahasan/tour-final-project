const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const reviewRoute = require('./../routes/reviewRoute')
const router = express.Router();



// router
// .route('/:tourId/reviews')
// .post(authController.protect,authController.restrictTo('user'),reviewController.creteReview);  //instead of that what we can use
  // or below one
router.use('/:tourId/reviews',reviewRoute);

// router.param('id', tourController.checkID);
router
.route('/:tourId/reviews') 
.post(authController.protect,authController.restrictTo('user'),reviewController.creteReview);
router.
route('/top-and-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours);
  

router
.route('/tours-within/distance/:distance/centre/:latlan/unit/:unit')
.get(tourController.getToursWithin);

router
.route('/Monthly-plan/:year')
.get(authController.protect
  ,authController.restrictTo('admin','lead-guide','guide')
  ,tourController.getAllPlan);

router
.route('/tour-Stat')
.get(tourController.getAllTourStat);
router
  .route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post( authController.protect,authController.restrictTo('guide','lead-guide'),tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect
    ,authController.restrictTo('lead-guide','guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage
    ,tourController.updateTour)
  .delete(authController.protect
    ,authController.restrictTo('admin','lead-guide')
    ,tourController.deleteTour);


 

module.exports = router;
