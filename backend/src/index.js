import dbconnect from './db/index.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

dbconnect()
    .then(()=>{
        console.log('Database connected successfully');
    }).catch((err)=>{
        console.error('Database connection failed:', err);
    });

