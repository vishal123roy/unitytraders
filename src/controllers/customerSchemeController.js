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

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    const slab = scheme.slabs.find((s) => s.level === Number(slabLevel));
    if (!slab) return res.status(404).json({ message: "Slab not found" });

    // find or create progress
    let progress = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: schemeId });
    if (!progress) {
      progress = new CustomerSchemeProgress({
        customer: customerId,
        scheme: schemeId,
        earnedPoints: 0,
        usedPoints: 0,
        achievedSlabs: [],
      });
    }

    // Check already redeemed
    if (progress.achievedSlabs.some((s) => s.level === Number(slabLevel))) {
      return res.status(400).json({ message: "This slab has already been redeemed" });
    }

    const availablePoints = (progress.earnedPoints || 0) - (progress.usedPoints || 0);
    if (availablePoints < slab.targetPoint) {
      return res.status(400).json({ message: "Not enough scheme points to redeem this slab" });
    }

    // Deduct scheme-level points only
    progress.usedPoints += slab.targetPoint;
    progress.achievedSlabs.push({
      level: slab.level,
      redeemedAt: new Date(),
      gift: slab.gift || "",
    });

    await progress.save();

    // 🎯 If monthly scheme redeemed, credit annual schemes
    if (scheme.schemeType === "monthly") {
      const now = new Date();
      const activeAnnualSchemes = await Scheme.find({
        schemeType: "annual",
        active: true,
        "duration.from": { $lte: now },
        "duration.to": { $gte: now },
      });

      for (const ann of activeAnnualSchemes) {
        let annProg = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: ann._id });
        if (!annProg) {
          annProg = new CustomerSchemeProgress({
            customer: customerId,
            scheme: ann._id,
            earnedPoints: 0,
            usedPoints: 0,
            achievedSlabs: [],
          });
        }

        const remaining = Math.max(0, ann.maxPoint - (annProg.earnedPoints || 0));
        const toCredit = Math.min(remaining, slab.targetPoint);
        if (toCredit > 0) {
          annProg.earnedPoints += toCredit;
          await annProg.save();
        }
      }
    }

    return res.status(200).json({
      message: "Slab redeemed successfully",
      progress,
    });
  } catch (err) {
    console.error("Error redeeming slab:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
