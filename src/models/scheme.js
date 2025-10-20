import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
    {
        schemeName:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        duration:{
            from:{
                type:Date,
                required:true
            },
            to:{
                type:Date,
                required:true
            }
        },
        schemeType:{
            type:String,
            enum:['monthly','annual']
        },
        maxPoint:{
            type:Number,
            requried:true
        }

    }
)

export default mongoose.model("Scheme",schemeSchema);