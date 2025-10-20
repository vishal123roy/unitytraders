// controllers/purchaseController.js
import Purchase from "../models/purchase.js";
import Scheme from "../models/scheme.js";
import Customer from "../models/customer.js";
import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";

/**
 * Helper: find active schemes for a given date
 */
const findActiveSchemesByDate = async (date) => {
  return Scheme.find({
    active: true,
    "duration.from": { $lte: date },
    "duration.to": { $gte: date },
  });
};

export const getPurchase = async (req, res) => {
  try {
    const list = await Purchase.find().populate("customer").populate("productList.product");
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Add purchase:
 * - create Purchase doc
 * - allocate totalPoints to active schemes (monthly, annual, special)
 * - for each scheme create/update CustomerSchemeProgress
 */
export const addPurchase = async (req, res) => {
  try {
    const { customerId, products, total } = req.body;
    console.log("Printing the response")
    if (!customerId || !products || total === undefined) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // create purchase doc (date = now)
    const purchase = new Purchase({
      customer: customerId,
      date: new Date(),
      productList: products,
      totalPoints: total,
    });
    await purchase.save();

    // allocate points to active schemes
    const activeSchemes = await findActiveSchemesByDate(purchase.date);

    // For each active scheme, allocate as much of the purchase points as possible.
    // We will distribute the same total points to all active schemes (because customer wants to be eligible for multiple schemes simultaneously).
    // If you want to split points among schemes, change logic accordingly.
    for (const scheme of activeSchemes) {
      // find or create progress doc
      let progress = await CustomerSchemeProgress.findOne({ customer: customerId, scheme: scheme._id });
      if (!progress) {
        progress = new CustomerSchemeProgress({ customer: customerId, scheme: scheme._id });
      }

      // compute remaining allowed points for the scheme (don't exceed scheme.maxPoint)
      const remainingCapacity = Math.max(0, scheme.maxPoint - (progress.earnedPoints || 0));
      if (remainingCapacity <= 0) {
        // scheme already full for this customer
        await progress.save();
        continue;
      }

      // amount to allocate = min(purchase total, remainingCapacity)
      const allocate = Math.min(total, remainingCapacity);
      progress.earnedPoints = (progress.earnedPoints || 0) + allocate;

      await progress.save();
    }

    return res.status(201).json({ message: "Purchase saved and points allocated", purchase });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get purchase product list for a purchase id (existing endpoint you had)
 */
export const getPurchaseList = async (req, res) => {
  try {
    const { id: purchaseId } = req.params;
    const purchaseList = await Purchase.findById(purchaseId).populate("productList.product");
    if (!purchaseList) return res.status(404).json({ message: "Purchase not found" });
    return res.status(200).json(purchaseList.productList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
