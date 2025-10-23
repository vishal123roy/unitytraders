// controllers/customerSchemeController.js
import Scheme from "../models/scheme.js";
import Customer from "../models/customer.js";
import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";

/**
 * Get progress for a customer across schemes
 */
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

/**
 * Redeem a specific slab for a scheme:
 * Body: { schemeId, slabLevel }
 *
 * Rules applied:
 * - Ensure customer has enough (earnedPoints - usedPoints) to cover slab.targetPoint
 * - For monthly scheme: when redeemed, also credit the same slab.targetPoint to **active annual schemes** (this matches "50 point go to annual scheme point section")
 * - For special scheme: redemption does not consume monthly/annual points
 */
// export const redeemSlab = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { schemeId, slabLevel } = req.body;
//     if (!schemeId || slabLevel === undefined) {
//       return res.status(400).json({ message: "schemeId and slabLevel required" });
//     }

//     const customer = await Customer.findById(customerId);
//     if (!customer) return res.status(404).json({ message: "Customer not found" });

//     const scheme = await Scheme.findById(schemeId);
//     if (!scheme) return res.status(404).json({ message: "Scheme not found" });

//     const slab = scheme.slabs.find(s => s.level === Number(slabLevel));
//     if (!slab) return res.status(404).json({ message: "Slab not found" });

//     // get or create progress for this scheme
//     let progress = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: schemeId });
//     if (!progress) progress = new CustomerSchemeProgress({ customer: customerId, scheme: schemeId });

//     // check if already redeemed this level
//     if (progress.achievedSlabs.some(s => s.level === Number(slabLevel))) {
//       return res.status(400).json({ message: "Slab already redeemed" });
//     }

//     const availablePoints = (progress.earnedPoints || 0) - (progress.usedPoints || 0);
//     if (availablePoints < slab.targetPoint) {
//       return res.status(400).json({ message: "Not enough points to redeem this slab" });
//     }

//     // consume points for this scheme
//     progress.usedPoints = (progress.usedPoints || 0) + slab.targetPoint;
//     progress.achievedSlabs.push({ level: slab.level, redeemedAt: new Date(), gift: slab.gift || "" });

//     await progress.save();

//     // Business rule: if redeemed slab of a monthly scheme, credit slab.targetPoint to active annual schemes
//     if (scheme.schemeType === "monthly") {
//       const now = new Date();
//       const activeAnnualSchemes = await Scheme.find({
//         schemeType: "annual",
//         active: true,
//         "duration.from": { $lte: now },
//         "duration.to": { $gte: now },
//       });

//       for (const ann of activeAnnualSchemes) {
//         let annProg = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: ann._id });
//         if (!annProg) annProg = new CustomerSchemeProgress({ customer: customerId, scheme: ann._id });
//         // Do not exceed annual.maxPoint
//         const remaining = Math.max(0, ann.maxPoint - (annProg.earnedPoints || 0));
//         const toCredit = Math.min(remaining, slab.targetPoint);
//         if (toCredit > 0) {
//           annProg.earnedPoints = (annProg.earnedPoints || 0) + toCredit;
//           await annProg.save();
//         }
//       }
//     }

//     // For special schemes the redemption does not consume monthly/annual points by design (per your requirement).

//     return res.status(200).json({ message: "Slab redeemed", progress });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


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

    const slab = scheme.slabs.find(s => s.level === Number(slabLevel));
    if (!slab) return res.status(404).json({ message: "Slab not found" });

    // get or create progress for this scheme
    let progress = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: schemeId });
    if (!progress) progress = new CustomerSchemeProgress({ customer: customerId, scheme: schemeId });

    // check if already redeemed this level
    if (progress.achievedSlabs.some(s => s.level === Number(slabLevel))) {
      return res.status(400).json({ message: "Slab already redeemed" });
    }

    const availablePoints = (progress.earnedPoints || 0)
    if (availablePoints < slab.targetPoint) {
      return res.status(400).json({ message: "Not enough points to redeem this slab" });
    }

    // consume points for this scheme
    progress.achievedSlabs.push({ level: slab.level, redeemedAt: new Date()});

    await progress.save();

    return res.status(200).json({ message: "Slab redeemed", progress });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};