const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const {ObjectId}=mongoose.Types;

const userSchema=new mongoose.Schema({
    name: String,
    email: String,
    password:String,
    phone:String,
    created_at: { type: Date, default: Date.now },
    detail_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'address' }],
    Block:{type:Boolean,default:false}
});
const addressSchema=new mongoose.Schema({
    fname:String,
    lname:String,
    street:String,
    city:String,
    state:String,
    zip:Number,
    country:String,
    landmark:String,
    mobile:Number
})
const Address=mongoose.model('address',addressSchema);
const User=mongoose.model('user',userSchema);
module.exports={User,Address};