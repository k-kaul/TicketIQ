import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes)

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('connected to Db')
        app.listen(PORT, () => {
            console.log('Served at port 3000')
        })
    })
    .catch((err) => console.error('mongodb error', err))