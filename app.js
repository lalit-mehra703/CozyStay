const express = require('express');
const app = express();
const mongoose = require('mongoose');

const port = 8080;

app.get('/',(req,res)=>{
    res.send('Hi, I am root');
});

app.listen(port,()=>{
    console.log(`server is listening to port ${port}`);
});
