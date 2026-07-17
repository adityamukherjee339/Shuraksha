import mongoose, { Schema, Document } from "mongoose";

export interface ISafetyProfile {
  bloodGroup: string;
  medicalNotes: string;
  allergies: string;
  emergencyNote: string;
}

export interface IEmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface ILocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: number;
}

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "women" | "parent" | "volunteer" | "admin";
  name: string;
  phone: string;
  isVerified?: boolean;
  linkedDaughter?: string;
  safetyProfile?: ISafetyProfile;
  contacts?: IEmergencyContact[];
  currentLocation?: ILocation;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyProfileSchema = new Schema<ISafetyProfile>(
  {
    bloodGroup: { type: String, default: "" },
    medicalNotes: { type: String, default: "" },
    allergies: { type: String, default: "" },
    emergencyNote: { type: String, default: "" },
  },
  { _id: false }
);

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
    timestamp: { type: Number },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["women", "parent", "volunteer", "admin"],
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: true },
    linkedDaughter: { type: String },
    safetyProfile: { type: SafetyProfileSchema },
    contacts: { type: [EmergencyContactSchema], default: [] },
    currentLocation: { type: LocationSchema },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
