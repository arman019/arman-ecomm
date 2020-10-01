const mongoose = require("mongoose");
const category = require("./category");
const {ObjectId}=mongoose.Schema

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true
        },
        description: {
            type: String, 
            required: true,
            maxlength: 200,          
        },
        price: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32,
        },
        category:{
            type: ObjectId,
            ref:'Category',
            required: true,
            maxlength: 32,
        },
        quantity:{
            type:Number
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        shipping: {
            required: false,
            type: Boolean
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);