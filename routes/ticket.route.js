import express from "express";
import {authenticate} from "../middleware/auth.js";
import { createTicket, getTicket, getTickets, updateTicketStatus } from  ".././controllers/ticket.controller.js";

const router = express.Router()

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
// router.get("/assigned", authenticate, getAssignedTickets);

router.post("/", authenticate, createTicket);
router.post("/update-status/:id", authenticate, updateTicketStatus);


router.put("/:id/update", authenticate, updateTicketStatus);

export default router;