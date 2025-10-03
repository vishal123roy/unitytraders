// const express  = require('express');
import express from 'express';
import dotenv from 'dotenv';
// import userRoutes from './src/routes/userRoutes.js'

// import { connectDB } from './src/db';

dotenv.config();

const PORT = process.env.PORT;
const app = express();

// app.use('/api/users',userRoutes)

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})