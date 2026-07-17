export interface SafetyProfile {
  bloodGroup: string;
  medicalNotes: string;
  allergies: string;
  emergencyNote: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: number;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: "women" | "parent" | "volunteer" | "admin";
  name: string;
  phone: string;
  isVerified?: boolean;
  linkedDaughter?: string;
  safetyProfile?: SafetyProfile;
  contacts?: EmergencyContact[];
  currentLocation?: Location;
  createdAt: string;
}

export interface ResponderStatus {
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  status: "pending" | "accepted" | "declined" | "en_route" | "on_scene" | "resolved";
  updatedAt: string;
  lat?: number;
  lng?: number;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  username: string;
  name: string;
  phone: string;
  status: "active" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  location: Location;
  details: string;
  safetyProfile?: SafetyProfile;
  contacts?: EmergencyContact[];
  responders: ResponderStatus[];
}

export interface SafetyZone {
  id: string;
  name: string;
  type: "police" | "hospital" | "community_center" | "safe_house";
  lat: number;
  lng: number;
  address: string;
  phone: string;
  resources: string[];
}

export interface SessionPayload {
  userId: string;
  username: string;
  role: "women" | "parent" | "volunteer" | "admin";
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  username: string;
  passwordHash: string;
  role: "women" | "parent" | "volunteer" | "admin";
  name: string;
  phone: string;
  isVerified?: boolean;
  linkedDaughter?: string;
  safetyProfile?: SafetyProfile;
  contacts?: EmergencyContact[];
  currentLocation?: Location;
  createdAt: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: "danger" | "safe" | "user" | "volunteer";
  icon?: "red" | "blue" | "green" | "orange";
}
