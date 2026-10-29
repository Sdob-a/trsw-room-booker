# 🏫 TRSW Room Booker - School Classroom Booking System

A local web server application for booking school classrooms, specialist teaching spaces, halls, and meeting rooms. Adapted from the PC Booking system with full estates and room management capabilities.

---

## 🚀 Quick Start

### 1. Run Development Server (Backend + Vite Frontend with Hot Reload)
```bash
npm run dev
```
- **Frontend (Vite dev server):** [http://localhost:5173](http://localhost:5173)
- **Backend API (Express):** [http://localhost:3001](http://localhost:3001)

### 2. Standalone Production Server
```bash
npm run build
npm start
```
- Runs both API and static frontend bundled together at [http://localhost:3001](http://localhost:3001).

---

## 🛠️ Key Functionality & Adaptations

| Feature | Original PC Booking | TRSW Room Booker (Classrooms) |
| :--- | :--- | :--- |
| **Booking Target** | Individual PCs 1–64 in a Computer Lab | **Classrooms across all blocks & wings** (e.g. Science Labs, IT Suites, Drama Studios, Assembly Hall) |
| **Interactive Floor Plans** | Single-room PC grid | **Interactive architectural floor plan maps** replicating the school DECANT building plans (**Kensington Building** & **Holyrood Building** Ground/First floors, with corridor walkways, portals, and toilets) |
| **CAD Blueprint View** | None | **Toggleable CAD Architectural drawing overlay** directly extracted from building plans |
| **Room Details** | PC numbers | **Room Code, Capacity, Building Block, Floor, Type, and Facilities** |
| **Maintenance** | Hardware maintenance (damaged PC, broken mouse) | **Room Maintenance & Closures** (closures, exam hall setups, deep cleaning, refurbishments, AV repairs) |
| **Admin Portal** | Master bookings table, Hardware maintenance | **Master bookings with CSV export, Room maintenance closures, Classroom directory management, and Utilization analytics** |
| **Calendar Sync** | .ics download & Outlook Calendar integration | **.ics calendar file export with classroom location & purpose; Microsoft Graph hooks prepared for Teams** |
| **User Mode** | Teams SSO or Developer Profiles | **Direct standalone local web server mode** with 1-click staff profile switcher (Teacher, HOD, Estates Admin) |

---

## 🗺️ Integrating Future Buildings & Floor Plans

The system uses a modular configuration in [`src/floorPlanData.js`](file:///c:/Users/SteveO'Brien/.gemini/antigravity/scratch/TRSW%20Room%20Booker/src/floorPlanData.js):
1. **Add Building Entry**: Define building `id`, `name`, `subtitle`, and optional blueprint image in `BUILDINGS_CONFIG`.
2. **Define Floors**: Add ground, first, or upper floors with their `topRow`, `corridor`, and `bottomRow` room mappings.
3. **Register Rooms**: Add room metadata to [`data/rooms.json`](file:///c:/Users/SteveO'Brien/.gemini/antigravity/scratch/TRSW%20Room%20Booker/data/rooms.json).
4. The dashboard automatically integrates new buildings into the building tabs, floor switches, search filters, and booking dock!

---

## 📁 Project Structure

```
TRSW Room Booker/
├── data/
│   ├── rooms.json          # Pre-loaded catalog of school classrooms & facilities
│   ├── bookings.json       # Active and historical classroom reservations
│   └── maintenance.json    # Rooms currently closed or flagged for maintenance
├── src/
│   ├── components/
│   │   ├── Dashboard/      # Date/Period selector, block filters, interactive room cards, booking dock
│   │   ├── MyBookings/     # Upcoming/past sessions, cancel single or group, .ics export
│   │   ├── AdminDashboard/ # Master bookings, room maintenance closures, directory editor, stats
│   │   └── PeriodSelector/ # School bell schedule with automatic Friday adjustment
│   ├── services/
│   │   └── BookingService.js # Full API client with mock authentication & error handling
│   ├── constants.js        # Timetable schedule, period bell timings, blocks, room types
│   ├── App.jsx             # Main layout, navigation, and staff profile switcher
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── server.js               # Express API backend with JSON storage & Entra ID support
├── package.json
└── vite.config.js          # Vite config with API proxy to port 3001
```

---

## 👥 Pre-Configured Test Profiles

Click on the user pill at the top right of the navigation bar to switch between test profiles:
- **Mr. Steve O'Brien** – Head of English / Teacher
- **Dr. Emily Watson** – Science Department HOD
- **Mr. David Patel** – Maths & Computing Teacher
- **Ms. Rachel Adams** – Cover Supervisor & Events
- **Estates & Facilities Team** – Estates Administrator (Unlocks the **Estates & Admin** tab)
- *Custom Staff Name input*

---

## 🔮 Future Microsoft Teams Deployment

The app is built so that adding Microsoft Teams SSO later requires **no changes to core business logic**:
- `@microsoft/teams-js` is included in dependencies and token forwarding is supported.
- `server.js` includes the Microsoft Entra ID verification and Microsoft Graph calendar sync helpers.
- When you are ready for Teams, configure the `.env` file with `ENTRA_CLIENT_ID`, `ENTRA_TENANT_ID`, and `ENTRA_CLIENT_SECRET`.
