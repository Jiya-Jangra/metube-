import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({extended:true})); 
app.use(express.static('public'));

//route import 
import userRoutes from './routes/users.route.js';

app.use("/api/v1/users", userRoutes);

export {app};  