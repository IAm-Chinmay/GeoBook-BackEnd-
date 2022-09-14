const {v4 : uuidv4} = require('uuid');
const {validationResult} = require("express-validator");
const mongoose = require('mongoose');
const fs = require('fs');

const Http_error = require('../Models/Http-errors');
const Place = require('../Models/places-schema');
const User = require('../Models/user-schema');




const getPlace = async (req,res,next)=>{

    const placeId = req.params.pid;

    let place;

    try{
         place = await  Place.findById(placeId);
    }catch(err){
        const error = new Http_error("Cannot retrive data",500);
        return next(error);
    }

    if(!place){
        const error =  new Http_error("No Place Found",404);
        return next(error);
    }

    res.json(
        {
           place : place.toObject({getter : true})
        }
    );
} ;

const getPlacesByUserId = async (req,res,next)=>{
    const userId = req.params.uid;
    let getUser;
    try{
         getUser = await User.findById(userId).populate('places');
    }catch(error){
        const err = new Http_error("Failed to get Place by user ID",500);
        return next(err);
    }

    if(!getUser || getUser.places.length === 0){
       return next(new Http_error("No place found of given user",404))
    }

    res.json(
        {
            places : getUser.places.map(place => place.toObject({getters : true})) 
        }
    );
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next( new Http_error("Please enter all feilds",422));
    }

    

    const {title, desc, address, user } = req.body;
    // const title = req.body.title;
    const createdPlace = new Place(
        {
            title,
            desc,
            img : req.file.path,
            address,
            user
          }
    ) ;
  
    let checkUser;

    try{
        checkUser = await User.findById(user)
    }catch(error){
        return next(new Http_error("Cannot find User",500));
    }

    if(!checkUser){
        return next("User does not exist" ,404);
    }
    console.log(checkUser);

          try{
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdPlace.save({session : sess});
            checkUser.places.push(createdPlace);
            await checkUser.save({session : sess});
            await sess.commitTransaction();
          }catch(err){
            return next(new Http_error("Creating Place Failed",500));
          }

  
    res.status(201).json({place: createdPlace.toObject({getters : true})});
  };


const updatePlace = async (req,res,next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw new Http_error("Please enter all feilds",422);
    }

    const {title , desc} = req.body;

    const placeId = req.params.pid;
    let updatePlace;
     
    try{
        updatePlace = await Place.findById(placeId);
    }catch(error){
        return next(new Http_error("Cannot find place with given ID",404));
    }

    if(updatePlace.user.toString() !== req.userData.userId){
        return next(new Http_error("Cannot update",401));
    }

    updatePlace.title = title;
    updatePlace.desc = desc;

   try{
       await updatePlace.save();
   }catch(error){
        return next(new Http_error("Cannot save the place",500));
   }

    res.status(200).json({updatedPlace : updatePlace.toObject({getter : true})});
}


const deletePlace = async(req,res,next) => {
    const placeId = req.params.pid;

    let place;

    try{
        place = await Place.findById(placeId).populate('user');
    }catch(error){
        return next(new Http_error("Cannot find the place to delete",500));
    }

    

    if(!place){
        return next(new Http_error("Place not found",404));
    }

    if(place.user.id !== req.userData.userId){
        return next(new Http_error("Cannot Delete",401));
    } 


    const ImagePath = place.img;

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session : sess});
        place.user.places.pull(place);
        await place.user.save({session : sess});
        await sess.commitTransaction();
    }catch(error){
        return next(new Http_error("Cannot Delete place",500));
    }
    fs.unlink(ImagePath, err =>{
        console.log(err);
    })
    res.status(200).json({message : "Deleted"});
}



exports.getPlace = getPlace;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;