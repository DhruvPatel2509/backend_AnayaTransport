import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String,  },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isAgreed: { type: Boolean, default: false },
    lastSignatureDate: { type: Date },
    sign_image: {
      type: String,
    },
    signoff_image: {
      type: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
