import { inngest } from "../Inngest/client.js";
import Ticket from ".././models/ticket.model.js";
import User from ".././models/user.model.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    console.log("🔐 req.user:", req.user);
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString()
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString()
      }
    });

    return res.status(201).json({
      message: "ticket created and processing started",
      ticket: newTicket
    });
  } catch (error) {
    console.error("Error creating ticket ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    console.log("🧠 Authenticated user:", user);
    let tickets = [];
    if (user.role != "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    }else if (user.role === "moderator") {
      tickets = await Ticket.find({ assignedTo: user._id })
        .populate("assignedTo", ["email", "_id"]);
    }else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    let user = req.user;
    let ticket;

    if (user.role != "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id"
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id
      }).select("title description status createdAt");
    }

    if (!ticket) {
      console.log(
        "Ticket not found for user:",
        user._id,
        "and ticket ID:",
        req.params.id
      );
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Only moderator assigned to it OR admin can update
    if (ticket.assignedTo?.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ message: "Status updated", ticket });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
};
