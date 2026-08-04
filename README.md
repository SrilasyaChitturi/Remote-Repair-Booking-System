# 🛠️ RemoteRepair – Home Service Booking Platform

RemoteRepair is a **full-stack MERN application** that connects users with nearby **verified technicians** for home services such as **AC repair, electrical work, plumbing, and appliance repair**.

The platform focuses on **price transparency, trust, and real-time service tracking**.

---

## 🚀 Features

### 👤 User
- Secure registration & login
- Book home repair services
- Find **nearby technicians using location**
- View **estimated cost before service**
- Approve or reject technician’s estimated cost
- Track service status in real time
- Cancel bookings (before acceptance)
- Receive notifications

### 👨‍🔧 Technician
- Register and wait for admin verification
- Receive booking notifications
- Submit **estimated repair cost**
- Accept or reject jobs
- Update service status:
  - Pending → Accepted → On the Way → Arrived → Completed
- Manage assigned jobs via dashboard

### 🛡️ Admin
- Verify or reject technician accounts
- Monitor platform activity
- Ensure service quality and trust

---

## 💡 Key Highlights
- 📍 **Location-based technician discovery** (GeoJSON + MongoDB)
- 💰 **Cost approval before service starts**
- 🔔 **Push notifications using Firebase Cloud Messaging**
- 🔐 **Role-based authentication** (User / Technician / Admin)
- 📊 Clean & responsive dashboards
- 🔄 Real-world service workflow

---

## 🧱 Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS (custom styling)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JWT (JSON Web Tokens)
- Role-based access control

### Notifications
- Firebase Cloud Messaging (FCM)

---
## 🔑 Core Modules
| Module | Description |
|---|---|
| **Auth** | JWT-based signup/login for users and technicians |
| **Bookings** | Full booking lifecycle — request, cost approval, status tracking |
| **Urgent Requests** | Separate fast-track flow for emergency repairs |
| **Technician Discovery** | Geospatial nearby-technician search via MongoDB |
| **Notifications** | Firebase Cloud Messaging push alerts on booking/status updates |


## ⚙️ Setup

This project has two parts — a **backend** (Node/Express + MongoDB) and a **frontend** (React + Vite) — each needs its own install and run step.

### 1. Clone the repo
```bash
git clone https://github.com/SrilasyaChitturi/Remote-Repair-Booking-System.git
cd Remote-Repair-Booking-System
```

### 2. Backend setup
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/` with:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```
You'll also need a Firebase service account key saved as `backend/firebaseKey.json` (used for push notifications via Firebase Admin SDK).

Start the backend:
```bash
npm run dev
```
The server runs on `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../my-app
npm install
npm run dev
```
The app runs on Vite's default port (`http://localhost:5173`) and talks to the backend at `http://localhost:5000/api` by default (configurable via a `VITE_API_URL` env variable).

### 4. You're set
Open the frontend URL in your browser — it connects to your local backend and MongoDB automatically.

## 🗂️ Project Structure

```text
RemoteRepair/
├── my-app/            # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── firebase.js
│   │   └── components/
│
├── backend/            # Node.js backend
│   ├── models/
│   │   ├── User.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── bookings.js
│   ├── middlewares/
│   │   └── auth.js
│   └── server.js
│
└── README.md
