import Scheme from "../models/scheme.js";

export const getScheme = async (req, res) => {
  try {

    const schemeList = await Scheme.find();

    if (!schemeList) {
      return res.status(400).json({ message: "no scheme are available" });
    }

    res.status(200).json(schemeList);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const addScheme = async (req, res) => {
  try {
    const { schemeName, duration, schemeType, maxPoint } = req.body;

    const scheme = await Scheme.findOne({ schemeName });

    if (scheme) {
      return res.status(400).json({ message: "scheme is already available" });
    }

    const newScheme = new Scheme.create({
      schemeName,
      duration,
      schemeType,
      maxPoint,
    });

    await newScheme.save();

    res.status(201).json({ message: "scheme created" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
