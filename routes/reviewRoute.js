const express=require('express');
const router=express.Router({mergeParams:true});//doing this kind of merge params because to handler:
//POST tours/tourId/reviews; and 
//POST /reviews; 

const reviewController=require('./../controller/reviewController') ;
const authController=require('./../controller/authController');

router.use(authController.protect);

router.
route('/')
.get(reviewController.getAllReview)
.post(authController.restrictTo('user'),reviewController.checkCreateReview,reviewController.creteReview);
//to prevent a user to write more than one review we can use 'reviewController.checkDuplicateReview';;or we can use indexing in model 
router
.route('/:id')
.get(reviewController.getreview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview)

module.exports=router;