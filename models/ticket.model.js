import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    ticket: {
      type: String
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    deadline: {
      type: Date
    },
    helpfulNotes: {
      type: String
    },
    relatedSkills: [
      {
        type: String
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const ticket = mongoose.model("ticket", ticketSchema);

export default ticket;
