// controllers/schemeController.js
import Scheme from "../models/scheme.js";
import CustomerSchemeProgress from "../models/CustomerSchemeProgress.js";

// Create scheme
export const createScheme = async (req, res) => {
  try {
    const { schemeName, duration, schemeType, maxPoint, gift, slabs } = req.body;
    if (!schemeName || !duration || !duration.from || !duration.to || !schemeType || !maxPoint) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const scheme = new Scheme({ schemeName, duration, schemeType, maxPoint, gift, slabs });
    await scheme.save();
    res.status(201).json({ message: "Scheme created", scheme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all schemes
export const getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get scheme by id
export const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.status(200).json(scheme);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update scheme
export const updateScheme = async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Scheme not found" });
    res.status(200).json({ message: "Scheme updated", scheme: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete scheme
export const deleteScheme = async (req, res) => {
  try {
    const removed = await Scheme.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Scheme not found" });
    // Also remove CustomerSchemeProgress docs referencing it
    await CustomerSchemeProgress.deleteMany({ scheme: removed._id });
    res.status(200).json({ message: "Scheme removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
