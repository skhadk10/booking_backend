import express from "express";
import {create,hotels ,image,sellerHotels,remove} from "../controllers/hotel";
import formidable from 'express-formidable'
import { hotelOwner, requireSignin } from "../middleware";
const router = express.Router();

router.post("/create-hotel",formidable(),requireSignin,create );
router.get("/hotels",hotels );
router.get("/hotel/image/:hotelId",image );
router.get("/seller-hotels",requireSignin,sellerHotels );
router.delete("/delete-hotel/:hotelId",requireSignin,hotelOwner,remove)

module.exports = router;
