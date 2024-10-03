const express=require('express');
const app=express();
const path=require('path');
const session=require('express-session');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const userroutes=require('./routes/userroutes')
const authroutes=require('./routes/authroutes');
const adminroutes=require('./routes/admin/adminroutes');
const { error } = require('console');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/Ecom',{})
.then(()=>{
  console.log('Mongodb Connected');
}).catch((error)=>{
   console.log('An error Occured',error);
})

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use('/homepage',userroutes);
app.use('/admin',adminroutes);
app.use('/',authroutes);


app.listen(4000,()=>{
    console.log("Server running on port number 4000");
});