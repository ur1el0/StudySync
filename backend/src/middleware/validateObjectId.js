import mongoose from "mongoose";

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  return next();
};

export default validateObjectId;
