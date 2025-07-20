import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import {serve} from "inngest/express"
import {inngest} from "./Inngest/client.js"
import {onUserSignup} from "./Inngest/functions/onsignUp.js"
import {onTicketCreate} from "./Inngest/functions/onticketCreate.js"
import userRoutes from "./routes/user.route.js"
import ticketRoutes from "./routes/ticket.route.js"

dotenv.config({
    path: "./env"
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/inngest", serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreate]
}));

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});