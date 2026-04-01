// scripts/reindexTechnicians.js
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  try {
    // ✅ WAIT for DB connection
    await mongoose.connect(
     YOUR MONGODB URL,
      {
        serverSelectionTimeoutMS: 5000, // fail fast
      }
    );

    console.log("✅ MongoDB connected");

    const techs = await User.find({ role: "technician" });

    for (const tech of techs) {
      if (!tech.location || !tech.location.coordinates) continue;

      tech.location = {
        type: "Point",
        coordinates: [
          Number(tech.location.coordinates[0]),
          Number(tech.location.coordinates[1]),
        ],
      };

      await tech.save();
    }

    console.log("✅ Technicians reindexed");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
