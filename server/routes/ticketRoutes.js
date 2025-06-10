import express from "express";
import upload from "../middlewares/multer.js";
import { getTicket, getTicketMessage, addTicket, addTicketMessage, closeTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getTicket);
router.get("/ticktMessage", getTicketMessage);
router.post("/addTicket", upload.single("attachment") , addTicket);
router.post("/addTicketMessage", upload.single("attachment"), addTicketMessage);
router.get("/closeticket", closeTicket);

export default router;