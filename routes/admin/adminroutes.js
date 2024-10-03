const express=require('express');
const router=express.Router();
const adminController=require('../../controller/admin/admincontroller');
const User=require('../../model/usermodel');
const upload=require('../../multer/multer');
const { mkactivity } = require('../userroutes');

router.get('/',adminController.admin);
router.get('/users',adminController.userdetails);
router.get('/users/:id/showdetailspage',adminController.showdetailspage);
router.post('/users/:id/block',adminController.blockuser);
router.post('/users/:id/unblock',adminController.unblockuser);
router.get('/addproducts',adminController.productdetails);
router.post('/addproducts',upload.array('productimage',10),adminController.addproducts);
router.get('/viewcategories',adminController.viewcategories);
router.get('/addcategory',adminController.addcategory);
router.post('/addcategory',adminController.addcategorypost)
router.post('/addsubcategory',adminController.addsubcategorypost);

router.get('/viewcategories/:id/edit',adminController.editcategory);
router.post('/viewcategories/:id/edit',adminController.editcategorypost);
router.post('/viewcategories/:id/delete',adminController.deletecategory);

router.get('/viewsubcategories/:cat_id/edit',adminController.editsubcategory);
router.post('/viewsubcategories/:cat_id/edit',adminController.editsubcategorypost);


router.get('/subcategories/:categoryid',adminController.getsubcategories);
router.get('/viewproducts',adminController.viewproduct);
router.get('/viewproducts/:id/edit',adminController.EditProduct);
router.post('/viewproducts/:id/edit',upload.array('productimage',10),adminController.Editpost);
router.post('/viewproducts/:id/delete',adminController.deleteproduct);

module.exports=router;