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
        
        let product = new Product(fields)

        if(files.photo){
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

}
