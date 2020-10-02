const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req,res,next)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions=true;
    form.parse(req,(err,fields,files)=>{
        if(err){
        return res.status(400).json({
            error:"Image couldnot be uploaded"
        })

        }
        
        const { name, description, price, category, quantity, shipping } = fields;

        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }


        let product = new Product(fields);
        // files.photo.contentType.matches(/\.(jpe?g|png|gif|bmp)$/i)
      //  console.log(files.photo.type)
        var checkExtension = files.photo.type.split("/")[1];      
        
        if(!checkExtension.match('jpe'||'jpg'||'png'||'bmp'||'jpeg')){
            //console.log(checkExtension)
            return res.status(400).json({
                error: 'extension should be jpe||jpg||png||bmp||jpeg'
            });
        }

        if(files.photo){

            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.photo.data=fs.readFileSync(files.photo.path);
            product.photo.contentType= files.photo.type;
        }

        product.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }

            res.status(200).json({
                result
            })
            
        })

    })

};


exports.productById= (req,res,next,id)=>{
    Product.findById(id).exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error:"product not found"
            })
        }

        req.product=product;
        next();
    });

};

exports.read = (req,res)=>  {
    req.product.photo= undefined
    res.status(200).json({
        product:req.product
    })
};

exports.remove = (req,res)=>{
    let product = req.product
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            });
        }
        res.json({        
            message:"product has been deleted" 
        })

        product.save((err,resp)=>{
            if(err){
                return res.status(400).json({
                    error:errorHandler(err),
                    message:"cant delete product"
                });
            }

            res.json({              
                message:"process succesfull" 
            })
            
            
        })
    });
};


exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        
        if(err){
            return res.status(400).json({
                error:"Image couldnot be uploaded"
            })
    
            }
            
            const { name, description, price, category, quantity, shipping } = fields;
    
            if (!name || !description || !price || !category || !quantity || !shipping) {
                return res.status(400).json({
                    error: 'All fields are required'
                });
            }
        

        let product = req.product;
        product = _.extend(product, fields);
        var checkExtension = files.photo.type.split("/")[1];      
        
        if(!checkExtension.match('jpe'||'jpg'||'png'||'bmp'||'jpeg')){
            //console.log(checkExtension)
            return res.status(400).json({
                error: 'extension should be jpe||jpg||png||bmp||jpeg'
            });
        }


        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.list = (req,res,next)=>{
    let order = req.query.order ? req.query.order:'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy:'_id';
    let limit = req.query.limit ? parseInt(req.query.limit):6;

    Product.find()
        .select("-photo")
        .populate('category')
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err,products)=>{
            res.setHeader('Content-Type','application/json');
            if(err){
                return res.status(400).json({
                    error: errorHandler(err),
                    message:'Product not found'
                });
            }
            
            res.json(products);

        });
};


/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */


exports.listRelated=(req,res,next)=>{
    let limit = req.query.limit ? parseInt(req.query.limit):6;

    Product.find({_id: {$ne:req.product}, category: req.product.category})
    .limit(limit)
    .populate('category','_id name')
    .exec((err,products)=>{
        res.setHeader('Content-Type','application/json');
        if(err){
            return res.status(400).json({
                error: errorHandler(err),
                message:'Product not found'
            });
        }

        res.status(200).json(products);
    });
};

exports.listCategories= (req,res)=>{
    Product.distinct("category",{},(err,categories)=>{
        res.setHeader('Content-Type','application/json');
        if(err){
            return res.status(400).json({
                error: errorHandler(err),
                message:'category not found'
            });
        }

        res.status(200).json(categories);
    });

};


/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

// route - make sure its post


exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};