import dbconnect from './db/index.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import {app} from "./app.js"



dbconnect()
    .then(()=>{
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
        console.log('Database connected successfully');
    }).catch((err)=>{
        console.error('Database connection failed:', err);
    });

