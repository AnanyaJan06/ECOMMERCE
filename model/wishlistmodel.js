const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const {ObjectId}=mongoose.Types;

const WishlistSchema=new mongoose.Schema({
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    Items:[{
        productId:{type:mongoose.Schema.Types.ObjectId,ref:"product"},
        created_At:{type:Date,default:Date.now}
    }]
});

const Wishlist=mongoose.model('wishlist',WishlistSchema);

module.exports=Wishlist;