import mongoose from "mongoose";

export const asObjectId = (id: string) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return id as any;
  }
};

export const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};
