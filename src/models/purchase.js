
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        customer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Customer",
            required:true
        },
        date:{
            type:String,
            required:true
        },
        productList:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            }
        ],
        totalPoints:{
            type:Number,
            required:true
        }
    },
    {timestamps:true}
)

export default mongoose.model("Purchase",purchaseSchema);

