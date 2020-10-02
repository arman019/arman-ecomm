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
            
            res.send(products);

        });
};
