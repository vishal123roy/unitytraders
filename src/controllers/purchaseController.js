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
    const { id } = req.params;
        console.log('kkkkkkkkkkkkkkkkkkk',id);

    const list = await Purchase.find({customerId:id}).populate("productList.product");
    console.log('kkkkkkkkkkkkkkkkkkk',list.length);
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const addPurchase = async (req, res) => {
  try {
    const { customerId, productList, totalPoints } = req.body;

    if (!customerId || !productList || totalPoints === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Check customer
    const customer = await Customer.findById(customerId.trim());
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // 2️⃣ Create new purchase
    const purchase = new Purchase({
      customerId,
      date: new Date(),
      productList,
      totalPoints,
    });
    await purchase.save();

    // 3️⃣ Add points to customer (main total)
    customer.point += totalPoints;
    await customer.save();

    // 4️⃣ Allocate points to active schemes
    const activeSchemes = await findActiveSchemesByDate(purchase.date);

    for (const scheme of activeSchemes) {
      let progress = await CustomerSchemeProgress.findOne({
        customer: customerId,
        scheme: scheme._id,
      });

      if (!progress) {
        progress = new CustomerSchemeProgress({
          customer: customerId,
          scheme: scheme._id,
          earnedPoints: 0,
          usedPoints: 0,
          achievedSlabs: [],
        });
      }

      // calculate remaining points that can be allocated
      const remainingCapacity = Math.max(0, scheme.maxPoint - (progress.earnedPoints || 0));
      if (remainingCapacity <= 0) continue;

      const allocate = Math.min(totalPoints, remainingCapacity);
      progress.earnedPoints += allocate;

      await progress.save();
    }

    return res.status(201).json({
      message: "Purchase saved, customer points updated, and scheme points allocated.",
      purchase,
    });
  } catch (err) {
    console.error("Error adding purchase:", err);
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
