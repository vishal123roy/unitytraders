// controllers/purchaseController.js
import Purchase from "../models/purchase.js";
import Scheme from "../models/scheme.js";
import Customer from "../models/customer.js";
import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";

const findActiveSchemesByDate = async (date) => {
  return Scheme.find({
    active: true,
    "duration.from": { $lte: date },
    "duration.to": { $gte: date },
  });
};

export const getPurchase = async (req, res) => {
  try {
    console.log("Printing")
    const list = await Purchase.find().populate("customer").populate("productList.product");
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addPurchase = async (req, res) => {
  try {
    const { customerId, productList, totalPoints } = req.body;
    console.log("Printing the response")
    if (!customerId || !productList || totalPoints === undefined) {
      return res.status(400).json({ message: "all fields are required",customerId,productList,totalPoints });
    }
console.log(customerId)
    const customer = await Customer.findById(customerId.trim());
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // create purchase doc (date = now)
    const purchase = new Purchase({
      customer: customerId,
      date: new Date(),
      productList: productList,
      totalPoints: totalPoints,
    });
    await purchase.save();

    // allocate points to active schemes
    const activeSchemes = await findActiveSchemesByDate(purchase.date);
  
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
      const allocate = Math.min(totalPoints, remainingCapacity);
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
