const expresss = require('express');
const app = expresss();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');



const userRoutes=require('./routes/user');

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true  
})
.then(()=>{
    console.log('data base connected')
},error=>{
    console.log(error);
})

//middlewares
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(cookieparser());


app.get('/',(req,res)=>{
    res.send("heelo from node");
})

app.use('/api',userRoutes);
const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`server is running port  ${port}`);
})