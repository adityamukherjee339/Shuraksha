import mongoose, { Schema, Document } from "mongoose";

export interface ISafetyZone extends Document {
  name: string;
  type: "police" | "hospital" | "community_center" | "safe_house";
  lat: number;
  lng: number;
  address: string;
  phone: string;
  resources: string[];
}

const SafetyZoneSchema = new Schema<ISafetyZone>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["police", "hospital", "community_center", "safe_house"],
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    resources: { type: [String], default: [] },
  },
  { timestamps: true }
);

SafetyZoneSchema.index({ type: 1 });

export const SafetyZone =
  mongoose.models.SafetyZone ||
  mongoose.model<ISafetyZone>("SafetyZone", SafetyZoneSchema);
