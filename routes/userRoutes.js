const express = require('express');
const {check} = require('express-validator')
const router = express.Router();
const fileUpload = require('../middleware/file-upload')

const userController = require('../controller/user_controller');

router.get('/',userController.getUser);

router.post('/signup',
    fileUpload.single('image'),
[
    check('name').not().isEmpty(),
    check('username').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({min:5})
],userController.signUpUser);

router.post('/login',[
    check('email').isEmail(),
    check('password').isLength({min:5})
],userController.loginUser);

module.exports =  router;
