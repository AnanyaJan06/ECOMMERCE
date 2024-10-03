const mongoose=require('mongoose');
const user=require('../model/usermodel');
const products=require('../model/productmodel');
const cart=require('../model/cartmodel');
const wishlist=require('../model/wishlistmodel');
const { LogContextImpl } = require('twilio/lib/rest/serverless/v1/service/environment/log');

exports.homepage=async(req,res)=>{
    const user_id=req.session.userId;
    console.log("userid:",user_id);
    const categories=await products.Category.find({});
    console.log(categories);
    const productlist=await products.Product.find({});
    console.log(productlist);
    const productreverse=productlist.reverse();
    console.log(productreverse);
    const cartexist=await cart.findOne({userid:user_id});
    console.log("cart",cartexist);
    const cartlength=cartexist?cartexist.products.length:0;
    console.log("cartlength",cartlength);
    const wishlistexist=await wishlist.findOne({userid:user_id});
    const wishlistlength=wishlistexist?wishlistexist.Items.length:0;
    console.log("wishlistlength",wishlistlength); 
    res.render('home',{message:req.session.message,categories,productreverse,cartlength,wishlistlength});
}

exports.shop=async(req,res)=>{
    const user_id=req.session.userId;
    console.log("userid:",user_id);
    const categories=await products.Category.find({});
    const productdetails=await products.Product.find({});
    const cartexist=await cart.findOne({userid:user_id});
    console.log("cart",cartexist);
    const cartlength=cartexist?cartexist.products.length:0;
    console.log("length",cartlength);
    const wishlistexist=await wishlist.findOne({userid:user_id});
    const wishlistlength=wishlistexist?wishlistexist.Items.length:0;
    console.log("wishlistlength",wishlistlength); 
    res.render('shop',{message:req.session.message,categories,productdetails,cartlength,wishlistlength});
}

exports.viewdetail=async(req,res)=>{
    const user_id=req.session.userId;
    console.log("userid:",user_id);
    const productid=req.params.id;
    console.log(productid);
    const product=await products.Product.findOne({_id:productid});
    if (!product) {
        return res.status(404).send('Product not found');
    }
    console.log(product);
    const catid=product.productcategory;
    console.log(catid);
    // Split the product name into individual words
    const productnamesplit=product.productname.split(' ');
    console.log(productnamesplit);
    // Create a regex pattern to match any of the words
    const regexpattern=productnamesplit.join('|');
    console.log(regexpattern);
     // Use a regex to find similar products by name
    const similiarproducts=await products.Product.find({
        productname:{$regex:regexpattern,$options:'i'},
        _id:{$ne:productid},
        productcategory:catid
    });
    console.log(similiarproducts);
    const categories=await products.Category.find({});
    const cartexist=await cart.findOne({userid:user_id});
    console.log("cart",cartexist);
    const cartlength=cartexist?cartexist.products.length:0;
    console.log("length",cartlength);
    const wishlistexist=await wishlist.findOne({userid:user_id});
    const wishlistlength=wishlistexist?wishlistexist.Items.length:0;
    console.log("wishlistlength",wishlistlength);
    const findbyproductid=await wishlist.findOne({userid:user_id,'Items.productId':productid});
    console.log("fffffffff",findbyproductid);
    const is=!!findbyproductid;
    console.log("is value",is);
    res.render('detail',{message:req.session.message,categories,product,similiarproducts,cartlength,wishlistlength,findbyproductid,is});
}

exports.cart=async(req,res)=>{
    const categories=await products.Category.find({});
    const user_id=req.session.userId;
    console.log(user_id);
    const cartdetails=await cart.findOne({userid:user_id}).populate('products.productid');
    console.log(cartdetails);
    cartdetails.products.forEach(product=>{
    console.log(product.productid.productname);
    });
    const cartexist=await cart.findOne({userid:user_id});
    console.log("cart",cartexist);
    const cartlength=cartexist?cartexist.products.length:0;
    console.log("length",cartlength);
    const wishlistexist=await wishlist.findOne({userid:user_id});
    const wishlistlength=wishlistexist?wishlistexist.Items.length:0;
    console.log("wishlistlength",wishlistlength); 
    res.render('cart',{message:req.session.message,categories,cartdetails,cartlength,wishlistlength});
}

exports.addcart=async(req,res)=>{
    const {quantity}=req.body;
    const Userid=req.session.userId;
    const Productid=req.params.id;
    console.log(Userid);
    console.log(Productid);
    let cartexists=await cart.findOne({userid:Userid});
    console.log(cartexists);
    if(!cartexists){
     cartexists=new cart({userid:Userid,products:[]});
     console.log(cartexists);
    }
    const productexists= await cart.findOne({userid:Userid,'products.productid':Productid});
    console.log(productexists);
    if(productexists){
        console.log('Product already in the cart');
    }else{
    cartexists.products.push({productid:Productid,quantity:quantity});
    await cartexists.save(); 
    }
    res.redirect('/homepage/cart');
}

exports.RemoveFromcart=async(req,res)=>{
  const Userid=req.session.userId;
  console.log(Userid);
  const{productId}=req.body
  console.log(productId);
  try{
    const Cartexists=await cart.findOne({userid:Userid});
    if(!Cartexists){
        return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const remove=await cart.updateOne({userid:Userid},{$pull:{products:{productid:productId}}});
    if (!remove){
        return res.status(404).json({ success: false, message: 'Product not found in cart' });
      }
      return res.status(200).json({ success: true, message: 'Product removed from cart' });
  }catch(error){
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.updateQuantity=async(req,res)=>{
    try{
     const userid=req.session.userId;
     console.log(userid);
     const productid=req.params.productId;
     console.log(productid);
     const{quantity}=req.body;
     console.log('nbbjnjnjn',quantity);
     const cartexists=await cart.findOne({userid:userid});
     if(!cartexists){
        return res.status(404).json({ success: false, message: 'Cart not found' });
     }
     const cartupdate=await cart.updateOne({userid:userid,'products.productid':productid},{$set:{'products.$.quantity':quantity}});
     console.log("CART UPDATE",cartupdate);
     if(!cartupdate){
        return res.status(404).json({ success: false, message: 'Cart item not found' });
     }
     res.json({ success: true, message: 'Quantity updated successfully' });
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.wishlistpage=async(req,res)=>{
    const Userid=req.session.userId;
    console.log(Userid);
    const wishlistItems=await wishlist.findOne({userid:Userid}).populate('Items.productId');
    console.log(wishlistItems);
    wishlistItems.Items.forEach(Item=>{
       console.log(Item.productId.productname)
       })  
    res.render('wishlist',{message:req.session.message,wishlistItems});
}

exports.AddtoCollection=async(req,res)=>{
    try{
    const Userid=req.session.userId;
    console.log(Userid);
    const{Productid}=req.body;
    console.log(Productid);
    let WishlistExists=await wishlist.findOne({userid:Userid});
    console.log(WishlistExists);
    if(!WishlistExists){
       WishlistExists=new wishlist({userid:Userid,Items:[]});
       console.log(WishlistExists);
    }
    const ItemExists=await wishlist.findOne({userid:Userid,'Items.productId':Productid});
    console.log(ItemExists);
    if(ItemExists){
        console.log('Product already in wishlist');
        const remove=await wishlist.updateOne({userid:Userid},{$pull:{Items:{productId:Productid}}});
        console.log(remove);
        res.json({success:true,message:"Item removed from wishlist"});
    }else{
        WishlistExists.Items.push({productId:Productid})
        await WishlistExists.save();
        res.json({success:true,message:"Item added to wishlist"})
    }
    }catch(error){
        console.error(error);
        res.status(404).json({success:false,message:"Server error"});
    }
}

exports.RemoveFromCollection=async(req,res)=>{
    const user_id=req.session.userId;
    console.log(user_id);
    const {ItemId}=req.body;
    console.log(ItemId);
    try{
        const wishlistexist=await wishlist.findOne({userid:user_id});
        console.log(wishlistexist);
        if(!wishlistexist){
          return  res.status(404).json({success:false,message:"wishlist not found"});
        }
        const removefromcollection=await wishlist.updateOne({userid:user_id},{$pull:{Items:{productId:ItemId}}});
        console.log("remove.....",removefromcollection);
        if(!removefromcollection){
          return  res.status(404).json({success:false,message:"Item not found in wishlist"});
        }
        return res.status(200).json({success:true,message:"Item removed from collection"});
    }catch(error){
        console.error("error",error);
    }
}

exports.checkout=async(req,res)=>{
    const user_id=req.session.userId;
    console.log(user_id);
    const categories=await products.Category.find({});
    const cartexist=await cart.findOne({userid:user_id});
    console.log("cart",cartexist);
    const cartlength=cartexist?cartexist.products.length:0;
    console.log("length",cartlength);
    const wishlistexist=await wishlist.findOne({userid:user_id});
    const wishlistlength=wishlistexist?wishlistexist.Items.length:0;
    console.log("wishlistlength",wishlistlength);
    const address=await user.User.findOne({_id:user_id}).populate('detail_id');
    console.log("addressarray",address);
    const cartdetails=await cart.findOne({userid:user_id}).populate('products.productid');
    console.log(cartdetails);
    const lastaddress=address.detail_id[address.detail_id.length-1];
    console.log("lastaddedaddress in the array",lastaddress);
    const reduce=cartdetails.products.reduce((acc,product)=>{
          return acc+product.productid.productofferprice*product.quantity;
    },0);
    console.log(reduce);
    console.log(address.detail_id);
    
    res.render('checkout',{message:req.session.message,categories,cartlength,wishlistlength,addresses:address.detail_id,cartdetails,reduce,lastaddress});
}

exports.contact=async(req,res)=>{
    const categories=await products.Category.find({});
    res.render('contact',{message:req.session.message,categories});
}

exports.showsubcategories=async(req,res)=>{
    try {
        const categoryId = req.params.id;
        const subcategories = await products.Subcategory.find({ category_id: categoryId });
        res.json({ subcategories });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).send('Internal Server Error');
    }
}

//Address controller

exports.address = async (req, res) => {
    try {
        const userid = req.session.userId;
        console.log(userid);
        if (!userid) {
            return res.redirect('/homepage')
        }
        const userDetails = await user.User.aggregate([
            { $match: { _id:new mongoose.Types.ObjectId(userid) } },
            { 
                $lookup: {
                    from: 'addresses',
                    localField: 'detail_id',
                    foreignField: '_id',
                    as: 'addressDetails'
                }
            }
        ]);
        console.log(userDetails);
        // if (!userDetails || userDetails.length === 0) {
        //     return res.status(404).send('User not found');
        // }
        res.render('address', { addresses: userDetails[0].addressDetails });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.addresspost = async (req, res) => {
    try {
        const userid = req.session.userId;
        console.log(req.session);
         
        if (!userid) {
            return res.status(400).send('User not logged in');
        }
        const { fname,lname, street, city, state, zip, country, landmark, mobile } = req.body;
        const details = await user.Address.create({ fname,lname, street, city, state, zip, country, landmark, mobile });
        const store = details._id;
        await user.User.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $push: { detail_id: store } });
        res.redirect('/homepage/address');
    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).send('Internal Server Error');
    }
};

