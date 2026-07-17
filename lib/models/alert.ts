import mongoose, { Schema, Document } from "mongoose";

export interface IResponderStatus {
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  status: "pending" | "accepted" | "declined" | "en_route" | "on_scene" | "resolved";
  updatedAt: string;
  lat?: number;
  lng?: number;
}

export interface IEmergencyAlert extends Document {
  userId: string;
  username: string;
  name: string;
  phone: string;
  status: "active" | "resolved";
  createdAt: Date;
  resolvedAt?: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: number;
  };
  details: string;
  safetyProfile?: {
    bloodGroup: string;
    medicalNotes: string;
    allergies: string;
    emergencyNote: string;
  };
  contacts?: Array<{
    id: string;
    name: string;
    phone: string;
    relationship: string;
  }>;
  responders: IResponderStatus[];
}

const ResponderStatusSchema = new Schema<IResponderStatus>(
  {
    volunteerId: { type: String, required: true },
    volunteerName: { type: String, required: true },
    volunteerPhone: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "declined", "en_route", "on_scene", "resolved"],
    },
    updatedAt: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const EmergencyAlertSchema = new Schema<IEmergencyAlert>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "resolved"],
      default: "active",
    },
    resolvedAt: { type: Date },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
      timestamp: { type: Number },
    },
    details: { type: String, default: "" },
    safetyProfile: {
      bloodGroup: { type: String },
      medicalNotes: { type: String },
      allergies: { type: String },
      emergencyNote: { type: String },
    },
    contacts: [
      {
        id: { type: String },
        name: { type: String },
        phone: { type: String },
        relationship: { type: String },
      },
    ],
    responders: [ResponderStatusSchema],
  },
  { timestamps: true }
);

EmergencyAlertSchema.index({ status: 1 });
EmergencyAlertSchema.index({ userId: 1 });
EmergencyAlertSchema.index({ createdAt: -1 });

export const EmergencyAlert =
  mongoose.models.EmergencyAlert ||
  mongoose.model<IEmergencyAlert>("EmergencyAlert", EmergencyAlertSchema);
