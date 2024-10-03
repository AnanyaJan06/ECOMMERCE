const user=require('../model/usermodel');
const bcrypt=require('bcrypt');
const twilio=require('twilio');
require('dotenv').config()
const accountSid=process.env.ACCOUNT_SID;
const authTocken=process.env.AUTH_TOCKEN;
const twilioNumber=process.env.TWILIO_NUMBER;

const client=new twilio(accountSid,authTocken);


exports.login=(req,res)=>{
    const errormessage = req.session.errormessage;
    req.session.errormessage = null;
    res.render('userlogin',{ errormessage: errormessage })
}
exports.signup=(req,res)=>{
    const errormessage = req.session.errormessage;
    req.session.errormessage = null;
    res.render('usersignup',{errormessage: errormessage });
}
exports.signuppost=async(req,res)=>{
    console.log(req.body);
    console.log(req.session.OTP);
    const{name,email,password,cnfrmpassword,phone,otp}=req.body;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const phoneRegex= /^[0-9]{10}$/;
    
        if (!nameRegex.test(name)) {
            req.session.errormessage = 'Name should only have uppercase letters, lowercase letters, and spaces';
            return res.redirect('/signup');
        }
    
        if (!emailRegex.test(email)) {
            req.session.errormessage = 'Enter a valid email address';
            return res.redirect('/signup');
        }
    
        if (!passwordRegex.test(password)) {
            req.session.errormessage = 'Password should contain uppercase letters, lowercase letters, numbers, and must have at least 8 characters';
            return res.redirect('/signup');
        }
    
        if (password !== cnfrmpassword) {
            req.session.errormessage = 'Passwords do not match';
            return res.redirect('/signup');
        }

        if(!phoneRegex.test(phone)) {
            req.session.errormessage= 'Enter a valid phone number';
            return res.redirect('/signup');
        }

        if(otp !== req.session.OTP){
            req.session.errormessage='Invalid OTP,Please try again..';
            return res.redirect('/signup');
        }
    
        try {
            const checkData = await user.User.findOne({ $or: [{ name }, { email }, { phone }] });
            if (checkData) {
                if (checkData.name === name) {
                    req.session.errormessage = `Sorry, the name "${name}" is already exists`;
                } else if (checkData.email === email) {
                    req.session.errormessage = `Sorry, the email "${email}" is already registered`;
                } else if(checkData.phone === phone){
                    req.session.errormessage = `Sorry, the phone number "${phone}" is already registered`;
                }
                return res.redirect('/signup');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await user.User.create({ name, email, password: hashedPassword ,phone});
            req.session.errormessage = 'Account created successfully. Please log in.';
            return res.redirect('/signup'); 
        } catch (error) {
            console.log("An error occurred in signing up:", error);
            req.session.errormessage = 'An error occurred. Please try again';
            return res.redirect('/signup');
        }
    };

exports.loginpost=async(req,res)=>{
    console.log(req.body);
    const { name, password } = req.body;
    try {
        // Find the user by name or email
        const checkData = await user.User.findOne({
            $or: [{ name: name }, { email: name },]
        });
        console.log(checkData);
        
        // Check if user exists and compare the password
        if (checkData && await bcrypt.compare(password, checkData.password)) {
            req.session.userId = checkData._id;
            req.session.isAuth = true;
            req.session.message = `Welcome ${checkData.name}`;
            return res.redirect('/homepage');
        } else {
            req.session.errormessage = `Username or Password doesn't exist`;
            return res.redirect('/login');
        }
    } catch (error) {
        console.error("An error occurred in logging in", error);
        req.session.errormessage = `An error occurred. Please try again`;
        return res.redirect('/login');
    }
};

exports.sendotp=async(req,res)=>{
    const {phone} =req.body;
    console.log(phone);
    const phonenumber=`+91${phone}`
    const otp=Math.floor(100000 +Math.random()* 900000).toString();
    console.log("OTP",otp);
    req.session.OTP = otp;
    try{
        await client.messages.create({
           body:`Your OTP is ${otp}`,
           from: twilioNumber,
           to:phonenumber
        });
        res.json({success:true,message:'OTP sent Successfully'});
    }catch(error){
        console.error('Error sending OTP:',error);
        res.json({success:false,message:'Failed to send OTP'});
    }
}

exports.verifyotp=(req,res)=>{
    try{
    const {otp} =req.body;
    console.log(otp);
    console.log(req.session.OTP);
        if(otp == req.session.OTP){
            res.json({success:true,message:'OTP verified successfully'});
        }else{
            res.json({success:false,message:'Failed verifying OTP'});
        }
    }catch(error){
        console.error('Error verifying OTP:',error);
    }
}