const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const {ObjectId}=mongoose.Types;

const addproductSchema=new mongoose.Schema({
    productname:String,
    productdescription:String,
    productprice:Number,
    productofferprice:Number,
    productsize:String,
    productstock:Number,
    productimage: [ String ],
    productcategory:{type:mongoose.Schema.Types.ObjectId,ref:"categories"},
    productsubcategory:{type:mongoose.Schema.Types.ObjectId,ref:"subcategories"},
    created_at: { type: Date, default: Date.now }
});

const categorySchema=new mongoose.Schema({
    categoryname:{ type:String , required:true }
})

const subcategorySchema=new mongoose.Schema({
    subcategoryname:{ type:String,required:true },
    category_id:{ type:mongoose.Schema.Types.ObjectId,ref:"categories" }
})


const Product=mongoose.model('product',addproductSchema);
const Category=mongoose.model('categories',categorySchema);
const Subcategory=mongoose.model('subcategories',subcategorySchema);

module.exports={Product,Category,Subcategory};