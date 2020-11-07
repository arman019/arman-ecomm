const { Order, CartItem } =require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { orderBy } = require('lodash');




exports.orderById = (req,res,next,id)=>{
    Order.findById(id)
    .populate("products.product","name price") // only populate product's name aand price
    .exec((error,order)=>{
        if(error || !order){
            return res.status(400).json({
                error: errorHandler(error)
            })
        }

        req.order= order; // this will availabe to alll the order routes and we can find the order detail
        next();
    })
}


exports.create = (req,res)=>{
 //   console.log("req.profile ",req.profile);

    req.body.order.user = req.profile;
    const order = new Order(req.body.order)

    order.save((error,data)=>{
        if(error){
            return res.status(400).json({
                error: errorHandler(error)
            })
        }

        res.status(200).json(data);
    })

}

exports.listOrders = (req, res) => {
    Order.find()
        .populate('user', '_id name address')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(orders);
        });
};



exports.getStatusValues = (req,res)=>{
        //console.log("enum  val ",CartItem.schema.path("product").productValues)
    return res.json(Order.schema.path("status").enumValues)
};


exports.updateOrderStatus = (req,res)=>{
    Order.update({_id: req.body.orderId}, {$set:{status: req.body.status}} , (error,order)=>{
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        res.json(order);
    })
}
