import express from "express";
import { getAddress, addAddress, setDefaultAddress, deleteAddress } from "../controllers/addressController.js"

const router = express.Router();

router.get("/", getAddress);
router.post("/", addAddress);
router.post("/setdefaultaddress", setDefaultAddress);
router.post("/deleteaddress", deleteAddress);

export default router;