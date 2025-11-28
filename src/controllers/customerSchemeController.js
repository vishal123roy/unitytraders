// controllers/customerSchemeController.js
import Scheme from "../models/scheme.js";
import Customer from "../models/customer.js";
import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";


export const getCustomerProgress = async (req, res) => {
  try {
    const { customerId } = req.params;
    const progress = await CustomerSchemeProgress.find({ customer: customerId }).populate("scheme");
    return res.status(200).json(progress);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const redeemSlab = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { schemeId, slabLevel } = req.body;
    if (!schemeId || slabLevel === undefined) {
      return res.status(400).json({ message: "schemeId and slabLevel required" });
    }

    const customer = await Customer.findById({_id:customerId});
    if (!customer) return res.status(404).json({ message: "Customer not found" });


    const scheme = await Scheme.findById({_id:schemeId});
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    

    const slab = scheme.slabs.find(s => s.level === Number(slabLevel));
    if (!slab) return res.status(404).json({ message: "Slab not found" });

    // get or create progress for this scheme
    let progress = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: schemeId });
    if (!progress) {
      return res.status(400).json({message:"progress not created"});
    }
    // check if already redeemed this level
    if (progress.achievedSlabs.some(s => s.level === Number(slabLevel))) {
      return res.status(400).json({ message: "Slab already redeemed" });
    }
    if(progress.earnedPoints < slab.targetPoint){
      return res.status(400).json({message:"not eligible"})
    };
    // consume points for this scheme
    progress.achievedSlabs.push({ level: slab.level, redeemedAt: new Date()});

    await progress.save();

    return res.status(200).json({ message: "Slab redeemed",achievedSlabs: progress.achievedSlabs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
