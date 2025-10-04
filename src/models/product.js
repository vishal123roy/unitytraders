import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true,
        trim:true
    },
    unit:{
        type:Number,
        required:true
    },
    point:{
        type:Number,
        required:true
    }
    },
    {timestamps:true}
);

export default mongoose.model("Product",productSchema);