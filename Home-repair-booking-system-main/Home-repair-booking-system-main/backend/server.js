require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');


const authRoutes = require('./routes/auth'); // keep your routes
const bookingRoutes = require('./routes/bookings');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/urgent", require("./routes/urgentRoutes"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Check .env file.');
  process.exit(1);
}

// Connect without legacy options — mongoose (modern) handles options internally
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connect error', err);
    process.exit(1);
  });
