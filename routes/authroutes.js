const express=require('express');
const router=express.Router();
const authController=require('../controller/authcontroller');
//get requests
router.get('/login',authController.login);
router.get('/signup',authController.signup);


//post request
router.post('/signup',authController.signuppost);
router.post('/login',authController.loginpost);

//otp send post
router.post('/send-otp',authController.sendotp);

//otp verify post
router.post('/verify-otp',authController.verifyotp);


module.exports=router;