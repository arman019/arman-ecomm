const expresss = require('express');
const app = expresss();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const expressValidator = require('express-validator');
const cors = require('cors');


const authRoutes=require('./routes/auth');
const userRoutes=require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');

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
app.use(expressValidator());
app.use(cors());


app.get('/',(req,res)=>{
    res.send("heelo from node");
})

app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',productRoutes);
app.use('/api',braintreeRoutes);
app.use('/api',orderRoutes);




const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`server is running port  ${port}`);
})