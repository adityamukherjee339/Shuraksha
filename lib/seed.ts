import { connectToDatabase } from "./mongodb";
import { User } from "./models/user";
import { SafetyZone } from "./models/safety-zone";
import { hashPassword } from "./crypto";

export async function seedDatabase() {
  await connectToDatabase();

  const existingUser = await User.findOne({ username: "admin" });
  if (existingUser) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  const adminHash = await hashPassword("admin123");
  const ananyaHash = await hashPassword("ananya123");
  const rajeshHash = await hashPassword("rajesh123");
  const amitHash = await hashPassword("amit123");
  const rahulHash = await hashPassword("rahul123");

  await User.create([
    {
      username: "admin",
      passwordHash: adminHash,
      role: "admin",
      name: "System Director",
      phone: "+91 99999 11111",
    },
    {
      username: "ananya",
      passwordHash: ananyaHash,
      role: "women",
      name: "Ananya Sharma",
      phone: "+91 98765 43210",
      safetyProfile: {
        bloodGroup: "O+",
        medicalNotes: "Asthma patient. Keeps inhaler in handbag.",
        allergies: "Penicillin",
        emergencyNote: "Call parents immediately. Need immediate shelter.",
      },
      contacts: [
        {
          id: "contact-1",
          name: "Rajesh Sharma",
          phone: "+91 98765 43211",
          relationship: "Father",
        },
        {
          id: "contact-2",
          name: "Pooja Sharma",
          phone: "+91 98765 43212",
          relationship: "Mother",
        },
      ],
      currentLocation: {
        lat: 28.6139,
        lng: 77.209,
        timestamp: Date.now(),
      },
    },
    {
      username: "rajesh",
      passwordHash: rajeshHash,
      role: "parent",
      name: "Rajesh Sharma",
      phone: "+91 98765 43211",
      linkedDaughter: "ananya",
    },
    {
      username: "amit",
      passwordHash: amitHash,
      role: "volunteer",
      name: "Amit Patel",
      phone: "+91 98765 54321",
      isVerified: true,
      currentLocation: {
        lat: 28.625,
        lng: 77.215,
        timestamp: Date.now(),
      },
    },
    {
      username: "rahul",
      passwordHash: rahulHash,
      role: "volunteer",
      name: "Rahul Kumar",
      phone: "+91 98765 67890",
      isVerified: false,
      currentLocation: {
        lat: 28.53,
        lng: 77.21,
        timestamp: Date.now(),
      },
    },
  ]);

  await SafetyZone.create([
    {
      name: "Connaught Place Police Station",
      type: "police",
      lat: 28.6304,
      lng: 77.2177,
      address: "Block H, Connaught Place, New Delhi",
      phone: "011-23340101",
      resources: ["24/7 Patrol", "Women Help Desk", "Emergency Vehicle"],
    },
    {
      name: "Max Super Speciality Hospital Saket",
      type: "hospital",
      lat: 28.5284,
      lng: 77.2197,
      address: "1-2 Press Enclave Road, Saket, New Delhi",
      phone: "011-26515050",
      resources: ["Trauma Care", "Ambulance Station", "24/7 ER Desk"],
    },
    {
      name: "Saket Shelter & Community Center",
      type: "safe_house",
      lat: 28.5244,
      lng: 77.2067,
      address: "Sector 3, Saket, New Delhi",
      phone: "011-26859393",
      resources: ["Secure Shelter", "First Aid Kit", "Food & Water"],
    },
    {
      name: "Delhi Police Headquarters",
      type: "police",
      lat: 28.6199,
      lng: 77.2279,
      address: "Jai Singh Marg, Connaught Place, New Delhi",
      phone: "011-23490200",
      resources: ["Emergency Response Unit", "Women Safety Division", "24/7 Control Room"],
    },
    {
      name: "AIIMS Emergency & Trauma Center",
      type: "hospital",
      lat: 28.5672,
      lng: 77.2102,
      address: "Ansari Nagar, New Delhi",
      phone: "011-26588500",
      resources: ["Trauma Care", "Emergency Surgery", "Crisis Counseling"],
    },
    {
      name: "Lajpat Nagar Community Safe Hub",
      type: "community_center",
      lat: 28.5656,
      lng: 77.2429,
      address: "Lajpat Nagar Market Road, New Delhi",
      phone: "011-29810205",
      resources: ["First Aid", "Counseling", "Temporary Shelter", "Legal Aid"],
    },
  ]);

  console.log("Database seeded successfully!");
}
