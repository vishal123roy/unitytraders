import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";
import scheme from "../models/scheme.js";
import User from "../models/user.js"

export const getUser = async (req,res) => {
    try {
        const {id:userId} = req.params;

        const user = await User.findOne({_id:userId});

        if(!user){
           return res.status(400).json({Message:"user not found"});
        }
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const getSchemes = async (req, res) => {
  try {
    const activeSchemes = await scheme.find({ active: true });

    console.log("Fetched Schemes:", activeSchemes); // ✅ Debug log

    if (!activeSchemes || activeSchemes.length === 0) {
      return res.status(400).json({ message: "No active schemes available" });
    }

    return res.status(200).json(activeSchemes);

  } catch (error) {
    console.error("Error fetching schemes:", error.message); // ✅ Print real error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


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

