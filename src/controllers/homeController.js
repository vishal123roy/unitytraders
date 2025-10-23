import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";
import User from "../models/user.js"

export const getUser = async (req,res) => {
    try {
        const {id:userId} = req.params;

        const user = await User.findOne(userId);

        if(!user){
           return res.status(400).json({Message:"user not found"});
        }
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const getSchemes = async (req,res) => {
    try {
        const activeSchemes = await scheme.find({active:true});

        if(!activeSchemes){
            return res.status(400).json({message:"no scheme are available"});
        }

        return res.status(200).json(activeSchemes);

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const getMonthlyTop = async (req,res) => {
    try {
        const progress = await CustomerSchemeProgress.find().populate("scheme");
        progress = progress.filter(obj => obj.scheme.schemeType === "monthly");

        if(!progress){
            return res.status(400).json({message:"no schemeprogress found"});
        }

        return res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const getAnnualTop = async (req,res) => {
            try {
                const progress = await CustomerSchemeProgress.find().populate("scheme");
                progress = progress.filter(obj => obj.scheme.schemeType === "annual");
                
                if(!progress){
                    return res.status(400).json({message:"no schemeprogress found"});
                }

                return res.status(200).json(progress);

            } catch (error) {
                res.status(500).json({message:"server error"})
        }    
};

