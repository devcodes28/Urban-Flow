# 🚍 UrbanFlow: Smart Transit Management System

**UrbanFlow** is a modern, full-stack transit management application designed to synchronize commuters, transport operators, and city administrators in real-time. By bridging the gap between physical fleets and digital infrastructure, UrbanFlow aims to make public transportation safer, more efficient, and highly accessible.

### 🌍 Sustainable Development Goals (SDGs) Alignment
This project actively contributes to the UN SDGs:
* **SDG 11 (Sustainable Cities):** Providing real-time data for accessible, sustainable urban transport.
* **SDG 9 (Innovation & Infrastructure):** Replacing paper ticketing with a resilient digital API ecosystem.
* **SDG 13 (Climate Action):** Optimizing route occupancy to promote mass transit and reduce carbon emissions.

---

## ✨ Key Features

### 👤 1. Commuter Dashboard (The User)
* **Smart Journey Planner:** View live stations and available vehicles.
* **Safety Lock:** Automatically hides vehicles marked as "Critical/Maintenance" by admins.
* **Digital Wallet:** Seamless balance deductions for ticket purchases.
* **QR Pass Generation:** Unique ticket IDs mapped to the user and vehicle.

### 🧑‍✈️ 2. Operator Terminal (The Driver/Conductor)
* **Live Synchronization:** Instantly verify passenger QR passes.
* **Real-time Occupancy:** Automatically increment vehicle occupancy upon successful scans, pushing live updates to the database.

### 🛡️ 3. Admin Overwatch (The Controller)
* **Live Geospatial Tracking:** Interactive map built with `Leaflet.js` to monitor the city's fleet.
* **Fleet Health Monitoring:** Track total units, live passenger counts, and trigger "Critical" safety alerts.
* **Live Passenger Manifests:** Generate and view real-time trip logs linking users, tickets, and vehicles.

---

## 🛠️ Tech Stack

**Frontend (User Interface)**
* React.js (Vite)
* Tailwind CSS (Styling)
* Framer Motion (Animations)
* Leaflet.js (Geospatial Mapping)

**Backend (RESTful API)**
* Python 3.x
* FastAPI
* Uvicorn (ASGI Server)
* SQLAlchemy & Pydantic (ORM & Data Validation)

**Database**
* MySQL (Relational 3NF Architecture: `Users`, `Vehicles`, `Passes`, `Stations`)
* PyMySQL (Database Driver)

---

## 🚀 Installation & Setup (Local Development)

### Prerequisites
* Python 3.10+
* Node.js & npm
* MySQL Server (Running locally on port 3306)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/Urban-Flow.git](https://github.com/yourusername/Urban-Flow.git)
cd Urban-Flow
