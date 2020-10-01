const formidable = require('formidable');
//const loadash = require('loadash');
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

exports.read = (req,res)=>
   {
    req.product.photo= undefined
    res.status(200).json({
        product:req.product
    })
}
