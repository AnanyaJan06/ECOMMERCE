const mongoose=require('mongoose');
const users=require('../../model/usermodel');
const products=require('../../model/productmodel');
const fs=require('fs');
const path=require('path');
const { error, log } = require('console');

exports.admin=(req,res)=>{
    res.render('admin/admin');
}

exports.userdetails=async(req,res)=>{
    try {
        const Users = await users.User.find({});
        res.render('admin/users', { Users });
    } catch (error) {
        console.log(error);
    }
}

exports.showdetailspage = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId); 

        const user = await users.User.findById(userId).populate('detail_id');
        if (!user) {
            return res.status(404).send('User not found');  
        }

        const userDetails = {
            name: user.name,
            email: user.email,
            address: user.detail_id 
        };

        console.log(userDetails);
        res.render('admin/showdetailspage', { details: userDetails });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.blockuser=async(req,res)=>{
    try{
    const userid=req.params.id;
    console.log(userid);
    const blockuser=await users.User.updateOne({_id:userid},{$set:{Block:true}});
    res.redirect('/admin/users')
    } catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.unblockuser=async(req,res)=>{
    try{
    const id=req.params.id;
    console.log(id);
    const unblockuser=await users.User.updateOne({_id:id},{$set:{Block:false}});
    res.redirect('/admin/users');
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.productdetails=async(req,res)=>{
    const categories=await products.Category.find({});
    const subcategories=await products.Subcategory.find({});
    res.render('admin/addproducts',{categories,subcategories});
}

exports.addproducts=async(req,res)=>{
    console.log(req.body);
    const{productname,productdescription,productprice,productofferprice,productcategory,productsubcategory,productsize,productstock}=req.body;
    try{
    const productimage=req.files.map(file=>file.filename)
    console.log(productimage);
    const newproducts=new products.Product({
        productname,
        productdescription,
        productprice,productofferprice,
        productcategory,productsubcategory,
        productsize,
        productstock,
        productimage
    })
    await newproducts.save();
    return res.redirect('/admin/viewproducts'); 
    }catch(err){
        console.error(err);
        res.send('error occured');
    }
}

exports.viewproduct=async(req,res)=>{
    try{
    const productlist=await products.Product.find({})
    .populate('productcategory')
    .populate('productsubcategory');
    console.log(productlist);
    res.render('admin/viewproduct',{productlist});
    }catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error'); 
    }
}

exports.EditProduct=async(req,res)=>{
    try{
      const id=req.params.id;
      console.log(id);
      const editproduct=await products.Product.findOne({_id:id}).populate('productcategory').populate('productsubcategory');
      console.log(editproduct);
      const cat_id=editproduct.productcategory._id;
      console.log(cat_id);
      const categories=await products.Category.find({});
      const subcategories=await products.Subcategory.find({category_id:cat_id});
      res.render('admin/editproduct',{editproduct,categories,subcategories});
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.Editpost=async(req,res)=>{
    const id=req.params.id;
    console.log(id);
    console.log(req.body);
    const {productname,productdescription,productprice,productofferprice,productcategory,productsubcategory,productsize,productstock}=req.body;
    let productimage=[];
    if(req.files && req.files.length > 0){
        productimage = req.files.map(file=>file.filename);
        console.log(productimage);
    }else{
        const existingimage=await products.Product.findOne({_id:id});
        productimage = existingimage.productimage;
    }
    try{
    await products.Product.updateOne({_id:id},{$set:{productname,productdescription,productprice,productofferprice,productcategory,productsubcategory,productsize,productstock,productimage}});
    res.redirect('/admin/viewproducts');
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.deleteproduct=async(req,res)=>{
    try{
     const id=req.params.id;
     console.log(id);
     const product=await products.Product.findById(id);
     console.log(product);
     if(!product){
        console.log('Product not Found');
        return res.render('/admin/viewproducts')
     }
      const images= product.productimage;
      console.log('Images:',images);
      await products.Product.deleteOne({_id:id});
      images.forEach(imagePath=>{
        fs.unlink(path.join(__dirname,'../../uploads',imagePath),error=>{
            if(error){
                console.error(`Failed to delete image,${imagePath}`);
            }
        })
      })
     res.redirect('/admin/viewproducts');
     }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
     }
}

exports.viewcategories=async(req,res)=>{
    try{
        const categories=await products.Category.aggregate([
            {
                $lookup:{
                    from:'subcategories',
                    localField:'_id',
                    foreignField:'category_id',
                    as:'subcategory'
                }
            }
        ]);
        console.log(categories);
        res.render('admin/viewcategory',{categories});
    }catch(error){
        console.log("An error occured",error);
    }
}

exports.editcategory=async(req,res)=>{
    const categoryid=req.params.id;
    console.log(categoryid);
    const category=await products.Category.findOne({_id:categoryid})
    console.log(category);
    res.render('admin/editcategory',{category});
}

exports.editcategorypost=async(req,res)=>{
    const{categoryname}=req.body;
    const id=req.params.id;
    console.log(id);
    const cat=await products.Category.findById(id);
    console.log(cat);
    try{
        if(!cat){
        res.status(400).send('No such category exists');
        }
        await products.Category.updateOne({_id:id},{$set:{categoryname}});
        // res.status(200).send("Category updated Successfully!");
        res.redirect('/admin/viewcategories');
    }catch(error){
        console.log("An error occurred", error);
    }
}

exports.deletecategory=async(req,res)=>{
    const id=req.params.id;
    console.log(id);
    try{
    const producttodlt=await products.Product.find({productcategory:id});
    console.log(producttodlt);
    const images=producttodlt.flatMap(element=>element.productimage);
    console.log(images);
    images.forEach(imagePath=>{
        fs.unlink(path.join(__dirname,'../../uploads',imagePath),error=>{
            if(error){
                console.error(`Failed to delete image,${imagePath}`);
            }
        })
      });
      await products.Product.deleteMany({productcategory:id});
      await products.Subcategory.deleteMany({category_id:id});
      await products.Category.findByIdAndDelete(id);
      res.redirect('/admin/viewcategories');
    }catch(error){
      console.log("An error occurred", error);
    }
}

exports.editsubcategory=async(req,res)=>{
    const id=req.params.cat_id;
    console.log(id);
    const subcategory=await products.Subcategory.findOne({_id:id});
    const categories=await products.Category.find({});
    res.render('admin/editsubcategory',{categories,subcategory});
}

exports.editsubcategorypost=async(req,res)=>{
    console.log(req.body);
    const {subcategoryname,categoryid}=req.body;
    const id=req.params.cat_id;
    console.log(id);
     const subcat=await products.Subcategory.findById({_id:id});
     console.log(subcat);
    try{
    if(!subcat){
        res.status(400).send('No such Subcategory exists');
        }
        await products.Subcategory.updateOne({_id:id},{$set:{subcategoryname:subcategoryname,category_id:categoryid}});
        res.redirect('/admin/viewcategories');
    }catch(error){
        console.log("An error occurred", error);
    }
}

exports.addcategory=async(req,res)=>{
    try{
    const categories= await products.Category.find({})
    res.render('admin/addcategory', {categories});
    }catch(error){
        console.log("An error occured",error);
    }
}

exports.addcategorypost = async (req, res) => {
    console.log(req.body);
    const { categoryname } = req.body;
    try {
        const categoryexist = await products.Category.findOne({ categoryname: { $regex: new RegExp(`^${categoryname}$`, 'i') } });
        console.log(categoryexist)
        if (categoryexist) {
            return res.status(400).send('Category already exists');
        } else {
            await products.Category.create({ categoryname });
            res.redirect('/admin/addcategory');
        }
    } catch (error) {
        console.log("An error occurred", error);
    }
}

exports.addsubcategorypost=async(req,res)=>{
    console.log(req.body);
    const{subcategoryname,categoryid}=req.body;
    try{
        const subcategoryexist= await products.Subcategory.findOne({subcategoryname: { $regex: new RegExp(`^${subcategoryname}$`, 'i') },category_id:categoryid});
        if(subcategoryexist){
            return res.status(400).send('Subcategory already exists in this selected category');
        }
        await products.Subcategory.create({subcategoryname,category_id:categoryid })
        res.redirect('/admin/addcategory');
    }catch(error){
      console.log(error);
    }
} 

exports.getsubcategories=async(req,res)=>{
    categoryId=req.params.categoryid;
    console.log(categoryId);
    try{
        const Subcategories= await products.Subcategory.find({category_id:categoryId});
        console.log(Subcategories);
        res.json(Subcategories);
    }catch(error){
        res.status(500).send('Server Error');
    }
}