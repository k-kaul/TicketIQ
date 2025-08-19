import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { serve } from 'inngest/express';
import { inngest } from './inngest/client.js';
import { onUserSignUp } from './inngest/functions/on-signup.js';
import { onTicketCreation } from './inngest/functions/on-ticket-creation.js';


const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('api/tickets', ticketRoutes);

app.use("/api/inngest", serve({
    client: inngest,
    functions: [onUserSignUp, onTicketCreation]
}))

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('connected to Db')
        app.listen(PORT, () => {
            console.log('Served at port 3000')
        })
    })
    .catch((err) => console.error('mongodb error', err))