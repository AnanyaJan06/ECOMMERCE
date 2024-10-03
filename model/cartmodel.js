const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const {ObjectId}=mongoose.Types;


const cartSchema=new mongoose.Schema({
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    products:[{
    productid:{type:mongoose.Schema.Types.ObjectId,ref:"product"},
    quantity:{type:Number,default:1},
    created_At:{type:Date,default:Date.now}
    }]
});

const Cart=mongoose.model('cart',cartSchema);

module.exports=Cart;