import React, { createContext, useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import "./App.css";
import { useParams } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { Link, useLocation } from "react-router-dom";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API = axios.create({ baseURL: API_BASE });
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  // ✅ existing effect
  useEffect(() => {
    if (!user) return;
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  // 🔔 ADD THIS EFFECT EXACTLY HERE
  useEffect(() => {
    if (!user) return;

    // only technicians get notifications
    if (user.role !== "technician") return;

    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.BJrOsK9YnRz360dniQG0siDVgWNG7XVYZcRaBDNePqm0JVvdZz3AQNxNb1MdnLlLywNfJvOpEWM64MCW5NjzmC4,

          
        });

        if (token) {
          await API.post("/users/save-token", { token });
          console.log("✅ FCM token saved");
        }
      }
    });
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // ✅ ADD THIS

  const isAdminPage = location.pathname.startsWith("/admin");
  const isTechPage = location.pathname.startsWith("/tech");

  const handleLogout = () => {
    logout();        // clear auth
    navigate("/");   // ✅ redirect to home
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand brand-name">
          RemoteRepair
        </Link>

        <nav className="nav-links">
          {!isAdminPage && !isTechPage && (
            <Link to="/services">Services</Link>
          )}

          {user ? (
            <>
              {!isAdminPage && !isTechPage && (
                <Link to="/dashboard">My Bookings</Link>
              )}

              {!isAdminPage &&
                !isTechPage &&
                user.role === "user" && (
                  <Link to="/urgent" className="btn primary">
                    🚨 Urgent
                  </Link>
                )}

              {user.role === "technician" && (
                <Link to="/tech">Technician</Link>
              )}

              {user.role === "admin" && (
                <Link to="/admin">Admin</Link>
              )}

              {user.role === "admin" && isAdminPage && (
                <Link to="/admin/urgent" className="btn danger">
                  🚨 Urgent Requests
                </Link>
              )}

              {/* ✅ FIXED LOGOUT */}
              <span className="nav-link logout" onClick={handleLogout}>
                Logout
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="btn primary">
                Login
              </Link>
              <Link to="/signup" className="btn outline">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}


function Home() {
  const nav = useNavigate();

  const [service, setService] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [err, setErr] = useState("");

  // 📍 Get user location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setErr("");
      },
      () => setErr("Location permission denied")
    );
  };

  // 🔍 Search nearest technicians
  const searchTechnicians = () => {
    if (!service) {
      setErr("Please select a service");
      return;
    }
    if (!lat || !lng) {
      setErr("Please use your location");
      return;
    }

    nav(`/book/${service}?lat=${lat}&lng=${lng}`);
  };

  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>Fix it fast — trusted technicians at your doorstep</h1>
          <p>
            Book certified technicians for appliances, plumbing, electrical, AC,
            mobiles & more. Transparent pricing • On-time service • Secure
            payments
          </p>

          {/* 🔍 SEARCH BAR */}
          <div style={{ marginTop: 20, maxWidth: 420 }}>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="input"
            >
              <option value="">Select Service</option>
              <option value="ac">AC Repair</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
            </select>

            <button
              type="button"
              className="btn outline"
              style={{ marginTop: 10 }}
              onClick={getLocation}
            >
              Use My Location
            </button>

            {lat && lng && (
              <p className="muted">Location detected ✔</p>
            )}

            <button
              className="btn primary"
              style={{ marginTop: 12, width: "100%" }}
              onClick={searchTechnicians}
            >
              Search Nearby Technicians
            </button>

            {err && <div className="error">{err}</div>}
          </div>

          {/* Existing buttons */}
          <div className="hero-cta" style={{ marginTop: 20 }}>
            <Link to="/services" className="btn large primary">
              Browse Services
            </Link>
            <Link to="/signup" className="btn large outline">
              Become a Technician
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="card-stacked">
            <div className="card-lg">
              <img
                alt="repair"
                src="https://res.cloudinary.com/taskrabbit-com/image/upload/f_auto,q_auto/dl0hw3kpgkvuhx3asbrf"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= POPULAR SERVICES ================= */}
      <section className="features container">
  <h2>Popular services</h2>

  <div className="grid">
    <ServiceCard
      title="Appliance Repair"
      desc="Washing machines, refrigerators, microwaves"
      price="Starting from 199"
      serviceKey="appliance"
    />

    <ServiceCard
      title="AC Repair"
      desc="Gas top up, compressor repair, cleaning"
      price="Starting from 499"
      serviceKey="ac"
    />

    <ServiceCard
      title="Electrical"
      desc="Wiring, switchboards, switches & sockets"
      price="Starting from 149"
      serviceKey="electrical"
    />

    <ServiceCard
      title="Plumbing"
      desc="Leaks, drain unclogging, fittings"
      price="Starting from 149"
      serviceKey="plumbing"
    />
  </div>
</section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="how container">
        <h2>How it works</h2>
        <div className="steps">
          <Step number={1} title="Book a service" desc="Choose service, date & address." />
          <Step number={2} title="Technician assigned" desc="We assign a verified technician." />
          <Step number={3} title="Get it fixed" desc="Technician arrives & fixes the issue." />
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta container">
        <div className="cta-card">
          <div>
            <h2>Ready to fix it?</h2>
            <p>
              Schedule a repair in minutes. Cancel anytime before technician
              accepts.
            </p>
          </div>
          <Link to="/services" className="btn primary">
            Book now
          </Link>
        </div>
      </section>
    </main>
  );
}


function ServiceCard({ title, desc, price, serviceKey }) {
  return (
    <div className="service-card">
      <div className="icon">🔧</div>
      <div>
        <h3>{title}</h3>
        <p className="muted">{desc}</p>
        <div className="card-footer">
          <div className="price">₹{price}</div>

          {/* ✅ FIX: use serviceKey instead of title */}
          <Link to={`/book/${serviceKey}`} className="btn small primary">
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}



function Step({ number, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-bubble">{number}</div>
      <h4>{title}</h4>
      <p className="muted">{desc}</p>
    </div>
  );
}



function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);

      const role = res.data.user?.role || "user";
      if (role === "admin") nav("/admin");
      else if (role === "technician") nav("/tech");
      else nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={submit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          {err && <div className="error">{err}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Signup() {
  const nav = useNavigate();
  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Technician specific
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [skills, setSkills] = useState([]);

  // 📍 Location
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION HELPERS ================= */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  /* ================= SKILLS TOGGLE ================= */
  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  /* ================= LOCATION ================= */
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setErr("Location permission denied")
    );
  };

  /* ================= SUBMIT ================= */
  async function submit(e) {
    e.preventDefault();
    setErr("");

    // 🔴 NAME
    if (!name.trim() || name.trim().length < 3) {
      return setErr("Name must be at least 3 characters");
    }

    // 🔴 EMAIL
    if (!isValidEmail(email)) {
      return setErr("Please enter a valid email address");
    }

    // 🔴 PASSWORD
    if (!isStrongPassword(password)) {
      return setErr(
        "Password must be at least 8 characters with uppercase, lowercase and number"
      );
    }

    // 🔴 PHONE (optional)
    if (phone && !/^\d{10}$/.test(phone)) {
      return setErr("Phone number must be exactly 10 digits");
    }

    // 🔧 TECHNICIAN VALIDATIONS
    if (role === "technician") {
      if (!businessName.trim()) {
        return setErr("Business name is required");
      }

      if (skills.length === 0) {
        return setErr("Select at least one service");
      }

      if (!lat || !lng) {
        return setErr("Please click 'Use My Location'");
      }
    }

    // ✅ PAYLOAD
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone,
      role,
    };

    if (role === "technician") {
      payload.businessName = businessName.trim();
      payload.businessAddress = businessAddress;
      payload.taxId = taxId;
      payload.skills = skills;
      payload.lat = lat;
      payload.lng = lng;
    }

    try {
      setLoading(true);
      await API.post("/auth/signup", payload);
      nav("/login");
    } catch (e) {
      setErr(e.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>

        {/* ROLE SELECT */}
        <div className="option-group">
          <label className="option-item">
            <input
              type="radio"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            User
          </label>

          <label className="option-item">
            <input
              type="radio"
              checked={role === "technician"}
              onChange={() => setRole("technician")}
            />
            Technician
          </label>
        </div>

        <form onSubmit={submit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />

          {/* TECHNICIAN FIELDS */}
          {role === "technician" && (
            <>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
              />

              <input
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Business address"
              />

              <input
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Tax ID (optional)"
              />

              <div className="services-group">
                <strong>Services you provide</strong>
                <div className="services-grid">
                  {["ac", "plumbing", "electrical"].map((skill) => (
                    <label key={skill} className="service-item">
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn outline"
                onClick={getLocation}
              >
                Use My Location
              </button>

              {lat && lng && (
                <p className="muted">Location saved ✔</p>
              )}

              <div className="muted" style={{ fontSize: 13 }}>
                Technician account requires admin approval.
              </div>
            </>
          )}

          {err && <div className="error">{err}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}




function ServicesList() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/services")
      .then((r) => setServices(r.data))
      .catch(() => setServices([]));
  }, []);

  return (
    <div className="auth-page">
      <div className="dashboard-wrapper">
        <h2>All Services</h2>

        <div className="services-row">
          {services.length === 0 &&
            [1, 2, 3, 4].map((i) => (
              <ServiceCard
                key={i}
                title="Loading"
                desc=""
                price={0}
                serviceKey=""
              />
            ))}

          {services.map((s) => (
            <ServiceCard
              key={s._id}
              title={s.title}
              desc={s.description}
              price={s.basePrice}
              serviceKey={s.title.split(" ")[0].toLowerCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}



function BookingForm() {
  const { service } = useParams(); // /book/electrical
  const nav = useNavigate();

  const normalizedService = service?.toLowerCase();

  const [technicians, setTechnicians] = useState([]);
  const [technician, setTechnician] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  /* =========================
     1️⃣ GET USER LOCATION
  ========================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {
        setLocationError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* =========================
     2️⃣ FETCH NEAREST TECHNICIANS (10 KM)
  ========================= */
  useEffect(() => {
    if (!normalizedService || lat === null || lng === null) return;

    setLoading(true);

    fetch(
      `http://localhost:5000/api/users/technicians/nearby?service=${normalizedService}&lat=${lat}&lng=${lng}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(() => {
        setTechnicians([]);
        setLoading(false);
      });
  }, [normalizedService, lat, lng]);

  /* =========================
     3️⃣ SUBMIT BOOKING
  ========================= */
  async function submit(e) {
    e.preventDefault();

    if (!technician) {
      alert("Please select a technician");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          serviceName: normalizedService,
          technician,
          preferredDate: date,
          address,
        }),
      });

      if (!res.ok) throw new Error();

      alert("✅ Booking successful");
      nav("/dashboard");
    } catch {
      alert("❌ Booking failed");
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="container form-card">
      <h2>Book Service: {service}</h2>

      {locationError && (
        <p className="muted">⚠️ Location access is required</p>
      )}

      {loading ? (
        <p className="muted">Finding nearby technicians (within 10 km)...</p>
      ) : (
        <form onSubmit={submit} className="form">
          {technicians.length > 0 ? (
            <select
              required
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            >
              <option value="">Select Nearest Technician</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.skills.join(", ")})
                </option>
              ))}
            </select>
          ) : (
            <p className="muted">❌ No technicians within 10 km</p>
          )}

          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />

          <button className="btn primary" disabled={!technicians.length}>
            Confirm Booking
          </button>
        </form>
      )}
    </div>
  );
}


/* ================= STYLES ================= */

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 20px",
  background: `
    radial-gradient(circle at top left, #E0E7FF, transparent 40%),
    radial-gradient(circle at bottom right, #FDE68A, transparent 40%),
    linear-gradient(135deg, #EEF2FF, #F8FAFC)
  `,
};

const titleStyle = {
  textAlign: "center",
  fontSize: "30px",
  fontWeight: "800",
  color: "#1E3A8A",
  marginBottom: "10px",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#475569",
  marginBottom: "40px",
};

const emptyStyle = {
  textAlign: "center",
  marginTop: "30px",
  color: "#6B7280",
};

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "28px",
  justifyContent: "center",
};

const cardStyle = {
  width: "320px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(6px)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px",
};

const serviceStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2563EB",
  textTransform: "capitalize",
};

const statusStyle = (status) => ({
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
  background:
    status === "pending"
      ? "#FEF08A"
      : status === "completed"
      ? "#BBF7D0"
      : "#BFDBFE",
  color: "#1F2937",
  textTransform: "capitalize",
});

const bodyStyle = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
};

const dateStyle = {
  marginTop: "8px",
  fontSize: "13px",
  color: "#6B7280",
};

const costPending = {
  marginTop: "14px",
  padding: "10px",
  background: "#FEF3C7",
  borderRadius: "12px",
  fontWeight: "700",
  textAlign: "center",
};

const costApproved = {
  marginTop: "14px",
  padding: "10px",
  background: "#DCFCE7",
  borderRadius: "12px",
  fontWeight: "700",
  textAlign: "center",
};

const actionsRow = {
  display: "flex",
  gap: "10px",
  marginTop: "18px",
};

const btnBase = {
  flex: 1,
  padding: "10px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  textAlign: "center",
};

const btnDetails = {
  ...btnBase,
  background: "#E0E7FF",
  color: "#1D4ED8",
  textDecoration: "none",
};

const btnApprove = {
  ...btnBase,
  background: "linear-gradient(135deg, #22C55E, #16A34A)",
  color: "#fff",
};

const btnCancel = {
  ...btnBase,
  background: "linear-gradient(135deg, #EF4444, #DC2626)",
  color: "#fff",
};
function UserDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    API.get("/bookings/my")
      .then((res) => setBookings(res.data))
      .catch(() => {});
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    await API.put(`/bookings/${id}/cancel`);
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  const approveCost = async (id) => {
    await API.put(`/bookings/${id}/approve-cost`);
    const res = await API.get("/bookings/my");
    setBookings(res.data);
  };

  return (
    
    <section style={pageStyle}>
      <h2 style={titleStyle}>My Bookings</h2>
       {/* 🚨 URGENT BUTTON */}
    
      <p style={subtitleStyle}>
        Track, approve and manage your service bookings
      </p>

      {bookings.length === 0 && (
        <p style={emptyStyle}>No bookings yet</p>
      )}

      <div style={gridStyle}>
        {bookings.map((b) => (
          <div key={b._id} style={cardStyle}>
            <div style={topRow}>
              <span style={serviceStyle}>{b.serviceName}</span>
              <span style={statusStyle(b.status)}>
                {b.status.replaceAll("_", " ")}
              </span>
            </div>

            <div style={bodyStyle}>
              <p>
                <b>Technician:</b>{" "}
                {b.technician?.name || "Not assigned"}
              </p>
              <p>
                <b>Address:</b> {b.address}
              </p>
              <p style={dateStyle}>
                {new Date(b.preferredDate).toLocaleString()}
              </p>

              {b.estimatedCost && !b.costApproved && (
                <div style={costPending}>
                  Estimated ₹{b.estimatedCost}
                </div>
              )}

              {b.costApproved && (
                <div style={costApproved}>
                  Final ₹{b.finalCost}
                </div>
              )}
            </div>

            <div style={actionsRow}>
              <Link to={`/order/${b._id}`} style={btnDetails}>
                Details
              </Link>

              {b.estimatedCost && !b.costApproved && (
                <button
                  style={btnApprove}
                  onClick={() => approveCost(b._id)}
                >
                  Approve
                </button>
              )}

              {b.status === "pending" && (
                <button
                  style={btnCancel}
                  onClick={() => cancelBooking(b._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function TechnicianDashboard() {
  /* ================= NORMAL BOOKINGS ================= */
  const [jobs, setJobs] = useState([]);
  const [costInputs, setCostInputs] = useState({});

  const fetchJobs = async () => {
    try {
      const res = await API.get("/bookings/tech");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const acceptJob = async (id) => {
    await API.put(`/bookings/${id}/accept`);
    fetchJobs();
  };

  const rejectJob = async (id) => {
    if (!window.confirm("Reject this job?")) return;
    await API.put(`/bookings/${id}/reject`);
    fetchJobs();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/bookings/${id}/status`, { status });
    fetchJobs();
  };

  const addCost = async (id) => {
    const cost = costInputs[id];
    if (!cost) return alert("Enter estimated cost");

    await API.put(`/bookings/${id}/add-cost`, {
      estimatedCost: Number(cost),
    });
    fetchJobs();
  };

  const completeJob = async (id) => {
    await API.put(`/bookings/${id}/complete`);
    fetchJobs();
  };

  /* ================= URGENT JOBS ================= */
  const [urgentJobs, setUrgentJobs] = useState([]);

  const fetchUrgentJobs = async () => {
    try {
      const res = await API.get("/urgent/tech/my");
      setUrgentJobs(res.data);
    } catch (err) {
      console.error("Urgent fetch failed", err);
    }
  };

  useEffect(() => {
    fetchUrgentJobs();
  }, []);

  const acceptUrgent = async (id) => {
    await API.put(`/urgent/tech/${id}/accept`);
    fetchUrgentJobs();
  };

  const completeUrgent = async (id) => {
    await API.put(`/urgent/tech/${id}/complete`);
    fetchUrgentJobs();
  };

  /* ================= UI ================= */
  return (
    <section className="ud-page-full">
      {/* ================= NORMAL JOBS ================= */}
      <h2 className="ud-title">My Assigned Jobs</h2>

      {jobs.length === 0 && (
        <p className="ud-empty">No jobs assigned yet</p>
      )}

      <div className="ud-grid">
        {jobs.map((job) => (
          <div key={job._id} className="ud-card">
            <div className="ud-top">
              <span className="ud-service">
                {job.serviceName.toUpperCase()}
              </span>
              <span className={`ud-status ${job.status}`}>
                {job.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="ud-body">
              <p><b>Customer:</b> {job.user?.name}</p>
              <p><b>Address:</b> {job.address}</p>
              <p className="ud-date">
                {new Date(job.preferredDate).toLocaleString()}
              </p>

              {job.status === "pending" && !job.estimatedCost && (
                <input
                  type="number"
                  placeholder="Estimated cost ₹"
                  className="ud-cost-input"
                  value={costInputs[job._id] || ""}
                  onChange={(e) =>
                    setCostInputs({
                      ...costInputs,
                      [job._id]: e.target.value,
                    })
                  }
                />
              )}

              {job.estimatedCost && !job.costApproved && (
                <div className="ud-cost pending">
                  Waiting for user approval ₹{job.estimatedCost}
                </div>
              )}

              {job.costApproved && (
                <div className="ud-cost approved">
                  Approved ₹{job.estimatedCost}
                </div>
              )}
            </div>

            <div className="ud-actions">
              {job.status === "pending" && !job.estimatedCost && (
                <button
                  className="ud-btn success"
                  onClick={() => addCost(job._id)}
                >
                  Submit Cost
                </button>
              )}

              {job.costApproved && job.status === "pending" && (
                <>
                  <button
                    className="ud-btn success"
                    onClick={() => acceptJob(job._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="ud-btn danger"
                    onClick={() => rejectJob(job._id)}
                  >
                    Reject
                  </button>
                </>
              )}

              {job.status === "accepted" && (
                <button
                  className="ud-btn ghost"
                  onClick={() => updateStatus(job._id, "on_the_way")}
                >
                  On the Way
                </button>
              )}

              {job.status === "on_the_way" && (
                <button
                  className="ud-btn ghost"
                  onClick={() => updateStatus(job._id, "arrived")}
                >
                  Arrived
                </button>
              )}

              {job.status === "arrived" && job.costApproved && (
                <button
                  className="ud-btn success"
                  onClick={() => completeJob(job._id)}
                >
                  Complete Job
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= URGENT JOBS ================= */}
      <h2 className="ud-title" style={{ marginTop: 40 }}>
        🚨 Urgent Requests
      </h2>

      {urgentJobs.length === 0 && (
        <p className="ud-empty">No urgent jobs assigned</p>
      )}

      <div className="ud-grid">
        {urgentJobs.map((u) => (
          <div key={u._id} className="ud-card urgent">
            <div className="ud-top">
              <span className="ud-service">
                {u.issueType.toUpperCase()}
              </span>
              <span className={`ud-status ${u.status}`}>
                {u.status.toUpperCase()}
              </span>
            </div>

            <div className="ud-body">
              <p><b>Description:</b> {u.description}</p>
              <p><b>Address:</b> {u.address}</p>
              <p><b>Phone:</b> {u.phone}</p>
            </div>

            <div className="ud-actions">
              {u.status === "assigned" && (
                <button
                  className="ud-btn success"
                  onClick={() => acceptUrgent(u._id)}
                >
                  Accept Urgent
                </button>
              )}

              {u.status === "accepted" && (
                <button
                  className="ud-btn success"
                  onClick={() => completeUrgent(u._id)}
                >
                  Complete Urgent
                </button>
              )}

              {u.status === "completed" && (
                <span className="ud-cost approved">Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* =====================================================
   ADMIN PANEL – ASSIGN TECHNICIANS
===================================================== */

export function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [techs, setTechs] = useState([]);

  useEffect(() => {
    API.get("/bookings")
      .then((r) => setBookings(r.data))
      .catch(() => {});
    API.get("/users?role=technician")
      .then((r) => setTechs(r.data))
      .catch(() => {});
  }, []);

  async function assign(bid, techId) {
    if (!techId) return;
    await API.put(`/bookings/${bid}/assign`, { technician: techId });
    const r = await API.get("/bookings");
    setBookings(r.data);
  }

  return (
    <div className="admin-page">
      <style>{`
        .admin-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, #eef2ff, #f8fafc, #ecfeff);
        }

        .admin-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 30px;
        }

        .admin-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-item {
          background: linear-gradient(145deg, #eef2ff, #f5f7ff);
          padding: 18px 22px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .admin-item select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #c7d2fe;
          outline: none;
        }

        .muted {
          color: #475569;
          font-size: 14px;
        }
      `}</style>

      <h2 className="admin-title">Admin – Assign Technicians</h2>

      <div className="admin-list">
        {bookings.map((b) => (
          <div key={b._id} className="admin-item">
            <div>
              <strong>{b.service?.title}</strong>
              <div className="muted">by {b.user?.name}</div>
            </div>

            <select onChange={(e) => assign(b._id, e.target.value)}>
              <option value="">Assign technician</option>
              {techs.map((t) => (
                <option value={t._id} key={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   ADMIN DASHBOARD – TECHNICIAN VERIFICATION
===================================================== */

export function AdminDashboard() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTechs = () => {
    API.get("/users/technicians/all")
      .then((res) => {
        setTechs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const updateVerification = async (id, verified) => {
    try {
      await API.put(`/users/technicians/${id}/verify`, { verified });
      fetchTechs();
    } catch {
      alert("Action failed");
    }
  };

  if (loading) {
    return <div className="admin-page">Loading technicians...</div>;
  }

  return (
    <div className="admin-page">
      <style>{`
        .admin-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .admin-card {
          width: 300px;
          background: linear-gradient(145deg, #eef2ff, #f5f7ff);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.08);
        }

        .admin-card h3 {
          margin-bottom: 10px;
          color: #1e40af;
        }

        .status-pill {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
        }

        .status-pill.pending {
          background: #fde68a;
          color: #92400e;
        }

        .status-pill.completed {
          background: #bbf7d0;
          color: #166534;
        }

        .admin-btn {
          padding: 8px 18px;
          border-radius: 999px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .admin-btn.success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .admin-btn.danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
      `}</style>

      <h2 className="admin-title">Admin – Technician Verification</h2>

      {techs.length === 0 ? (
        <p className="muted">No technicians found</p>
      ) : (
        <div className="admin-grid">
          {techs.map((t) => (
            <div key={t._id} className="admin-card">
              <h3>{t.name}</h3>
              <p>Email: {t.email}</p>
              <p>Phone: {t.phone}</p>
              <p>Business: {t.businessName}</p>
              <p>Skills: {t.skills.join(", ")}</p>

              <span
                className={`status-pill ${
                  t.verified ? "completed" : "pending"
                }`}
              >
                {t.verified ? "VERIFIED" : "PENDING"}
              </span>

              <div style={{ marginTop: 12 }}>
                {!t.verified ? (
                  <button
                    className="admin-btn success"
                    onClick={() => updateVerification(t._id, true)}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    className="admin-btn danger"
                    onClick={() => updateVerification(t._id, false)}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    API.get(`/bookings/${id}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => alert("Failed to load order"));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // 🔁 TECH STATUS UPDATE
  const updateStatus = async (status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      fetchOrder(); // refresh
    } catch {
      alert("Failed to update status");
    }
  };

  // 🔁 COMPLETE JOB
  const completeJob = async () => {
    try {
      await API.put(`/bookings/${id}/complete`);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.msg || "Cannot complete job");
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!order) return <div className="container">No details found</div>;

  return (
    <div className="container form-card">
      <h2>Order Details</h2>

      <p>
        <strong>Service:</strong> {order.serviceName}
      </p>
      <p>
        <strong>Address:</strong> {order.address}
      </p>
      <p>
        <strong>Date:</strong> {new Date(order.preferredDate).toLocaleString()}
      </p>

      <p>
        <strong>Technician:</strong>{" "}
        {order.technician ? order.technician.name : "Not assigned"}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {order.status.replaceAll("_", " ").toUpperCase()}
      </p>
      {/* =========================
   👨‍🔧 TECHNICIAN ACTIONS
========================= */}
      {user?.role === "technician" && (
        <div style={{ marginTop: 20 }}>
          {/* ACCEPTED → ON THE WAY */}
          {order.status === "accepted" && (
            <button
              className="btn primary"
              onClick={() => updateStatus("on_the_way")}
            >
              On the Way
            </button>
          )}

          {/* ON THE WAY → ARRIVED + COMPLETED (DISABLED) */}
          {order.status === "on_the_way" && (
            <>
              <button
                className="btn success"
                onClick={() => updateStatus("arrived")}
              >
                Arrived
              </button>

              <button
                className="btn success"
                disabled
                style={{ marginLeft: 10, opacity: 0.6 }}
              >
                Completed
              </button>
            </>
          )}

          {/* ARRIVED → COMPLETED (ENABLED) */}
          {order.status === "arrived" && (
            <button className="btn success" onClick={completeJob}>
              Mark as Completed
            </button>
          )}
        </div>
      )}

      {/* =========================
         📊 STATUS TRACKER (VIEW ONLY)
      ========================= */}
      <h3 style={{ marginTop: 30 }}>Tracking Status</h3>

      {["pending", "accepted", "on_the_way", "arrived", "completed"].map(
        (step, index) => {
          const steps = [
            "pending",
            "accepted",
            "on_the_way",
            "arrived",
            "completed",
          ];
          const current = steps.indexOf(order.status);

          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
                color: index <= current ? "#16a34a" : "#9ca3af",
                fontWeight: index === current ? "700" : "400",
              }}
            >
              <span style={{ marginRight: 8 }}>
                {index <= current ? "✔" : "○"}
              </span>
              {step.replaceAll("_", " ").toUpperCase()}
            </div>
          );
        }
      )}
    </div>
  );
}


function UrgentRequest() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const submitUrgent = async () => {
    if (!issueType || !description || !address || !phone) {
      alert("All fields are required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/urgent", {
        issueType,
        description,
        address,
        phone,
      });

      alert("Urgent request submitted");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="urgent-form">
      <h2>🚨 Urgent Requirement</h2>

      <select onChange={(e) => setIssueType(e.target.value)}>
        <option value="">Select Issue</option>
        <option value="AC">AC</option>
        <option value="Electrical">Electrical</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Other">Other</option>
      </select>

      <textarea
        placeholder="Describe your issue"
        onChange={(e) => setDescription(e.target.value)}
      />

      <textarea
        placeholder="Enter your full address"
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number"
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={submitUrgent}>Submit</button>
    </div>
  );
}






function AdminUrgentRequests() {
  const [urgents, setUrgents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔴 ADMIN protected → use API (token attached)
        const urgentRes = await API.get("/urgent");
        console.log("URGENTS 👉", urgentRes.data);
        setUrgents(urgentRes.data);

        // 🔴 ADMIN technicians list
        const techRes = await API.get("/users/technicians/all");
        setTechnicians(techRes.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const assignTechnician = async (urgentId, technicianId) => {
    if (!technicianId) return;

    try {
      await API.put(`/urgent/${urgentId}/assign`, { technicianId });

      alert("Technician assigned");

      const res = await API.get("/urgent");
      setUrgents(res.data);
    } catch (err) {
      alert("Assignment failed");
    }
  };

  if (loading) return <p>Loading urgent requests...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚨 Urgent Requests</h2>

      {urgents.length === 0 && <p>No urgent requests</p>}

      {urgents.map((u) => (
        <div
          key={u._id}
          style={{
            background: "#fff",
            padding: "15px",
            marginBottom: "15px",
            borderLeft: "5px solid red",
            borderRadius: "8px",
          }}
        >
          <h4>{u.issueType}</h4>
          <p><b>Description:</b> {u.description}</p>
          <p><b>Address:</b> {u.address}</p>
          <p><b>Phone:</b> {u.phone}</p>
          <p><b>Status:</b> {u.status}</p>

          {u.technician ? (
            <p>
              <b>Assigned Technician:</b>{" "}
              {u.technician.name || u.technician.email}
            </p>
          ) : (
            <select
              onChange={(e) =>
                assignTechnician(u._id, e.target.value)
              }
            >
              <option value="">Assign Technician</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name || t.email}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}




function RequireAuth({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return (
      <div className="container">
        <h3>Access denied</h3>
      </div>
    );
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/book/:service" element={<BookingForm />} />
<Route path="/urgent" element={<UrgentRequest />} />
<Route path="/admin/urgent" element={<AdminUrgentRequests />} />


            <Route
              path="/admin"
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <UserDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/order/:id"
              element={
                <RequireAuth>
                  <OrderDetails />
                </RequireAuth>
              }
            />

            <Route
              path="/tech"
              element={
                <RequireAuth allowedRoles={["technician"]}>
                  <TechnicianDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="*"
              element={
                <div className="container">
                  <h2>Not found</h2>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}