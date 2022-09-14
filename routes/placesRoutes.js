const checkAuth = require('../middleware/checkAuth');
const express = require('express')
const {check} = require('express-validator')
const router = express.Router();
const fileUpload = require('../middleware/file-upload')

const placeController = require('../controller/place_controller');

router.get('/:pid',placeController.getPlace);

router.get('/user/:uid',placeController.getPlacesByUserId);

router.use(checkAuth);

router.patch('/:pid',[
    check('title').not().isEmpty(),
    check('desc').not().isEmpty()
],placeController.updatePlace);

router.delete('/:pid',placeController.deletePlace);

router.post('/',
fileUpload.single('pImage')
,[
    check('title').not().isEmpty(),
    check('desc').isLength({min : 5}),
    check('address').not().isEmpty(),
    check('user').not().isEmpty()
],placeController.createPlace)

module.exports = router;