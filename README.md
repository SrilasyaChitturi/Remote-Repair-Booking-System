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
