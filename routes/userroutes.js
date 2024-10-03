const express=require('express');
const router=express.Router();
const userController=require('../controller/usercontroller');
const User = require('../model/usermodel');
const Authentication=require('../middleware/middleware');

router.get('/',userController.homepage);
router.get('/shop',userController.shop);
router.get('/shop/:id/detail',userController.viewdetail);
router.get('/cart',Authentication,userController.cart);
router.post('/shop/:id/cart',Authentication,userController.addcart);
router.delete('/cart/remove',Authentication,userController.RemoveFromcart);
router.post('/update-quantity/:productId',Authentication,userController.updateQuantity);
router.get('/wishlist',Authentication,userController.wishlistpage);
router.post('/wishlist/addtocollection/:productId',Authentication,userController.AddtoCollection);
router.post('/wishlist/remove/:itemId',Authentication,userController.RemoveFromCollection);
router.get('/checkout',Authentication,userController.checkout);
router.get('/contact',userController.contact);

//Address router
router.get('/address',userController.address);
router.post('/address',userController.addresspost);


router.get('/subcategory/:id',userController.showsubcategories);


module.exports=router;