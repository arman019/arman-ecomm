const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const category = new Category(req.body);
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({ data });
    });
};


exports.categoryById=(req,res,next,id)=>{
    Category.findById(id).exec((err,category)=>{
        if (err || !category) {
            return res.status(400).json({
                message:"category doesnt exsists"
            });
        }

        req.category=category;
        next();
    });

};

exports.read= (req,res,next)=>{
    return res.status(200).json({
        category:req.category
    });
};


exports.update = (req, res) => {
    console.log('req.body', req.body);
    console.log('category update param', req.params.categoryById);
    res.setHeader('Content-Type','application/json');

    const category = req.category;
    category.name = req.body.name;
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        
        res.status(200).json(data);
    });
};


exports.remove = (req, res) => {
    const category = req.category;  
        category.remove((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({
                    message: 'Category deleted'
                });
            });
        
};

exports.list = (req, res) => {
    Category.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};