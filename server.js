// server.js - TRSW Room Booker Local Web Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup to allow frontend (Vite dev server) to communicate with backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Mock-User']
}));

app.use(express.json());

// Initialize Database Directory and Files
const DATA_DIR = path.join(__dirname, 'data');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance.json');
const PERIODS_FILE = path.join(DATA_DIR, 'periods.json');

const DEFAULT_PERIODS = [
  { id: 'period-1', name: 'Period 1', regularStart: '09:00', regularEnd: '09:50', fridayStart: '09:10', fridayEnd: '09:55', type: 'Lesson', isBookable: true },
  { id: 'period-2', name: 'Period 2', regularStart: '09:50', regularEnd: '10:40', fridayStart: '09:55', fridayEnd: '10:40', type: 'Lesson', isBookable: true },
  { id: 'break', name: 'Break', regularStart: '10:40', regularEnd: '11:00', fridayStart: '10:40', fridayEnd: '11:00', type: 'Break', isBookable: false },
  { id: 'period-3', name: 'Period 3', regularStart: '11:00', regularEnd: '11:50', fridayStart: '11:00', fridayEnd: '11:50', type: 'Lesson', isBookable: true },
  { id: 'period-4', name: 'Period 4', regularStart: '11:50', regularEnd: '12:40', fridayStart: '11:50', fridayEnd: '12:40', type: 'Lesson', isBookable: true },
  { id: 'lunch', name: 'Lunch', regularStart: '12:40', regularEnd: '13:20', fridayStart: '12:40', fridayEnd: '13:20', type: 'Lunch', isBookable: false },
  { id: 'period-5', name: 'Period 5', regularStart: '13:20', regularEnd: '14:10', fridayStart: '13:20', fridayEnd: '14:10', type: 'Lesson', isBookable: true },
  { id: 'period-6', name: 'Period 6', regularStart: '14:10', regularEnd: '15:00', fridayStart: '14:10', fridayEnd: '15:00', type: 'Lesson', isBookable: true }
];

function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ROOMS_FILE)) {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(MAINTENANCE_FILE)) {
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(PERIODS_FILE)) {
    fs.writeFileSync(PERIODS_FILE, JSON.stringify(DEFAULT_PERIODS, null, 2));
  }
}
initDatabase();

// --- Database Helper Functions ---
async function readRooms() {
  try {
    const data = await fs.promises.readFile(ROOMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading rooms database:', err);
    return [];
  }
}

async function writeRooms(rooms) {
  try {
    await fs.promises.writeFile(ROOMS_FILE, JSON.stringify(rooms, null, 2));
  } catch (err) {
    console.error('Error writing rooms database:', err);
  }
}

async function readBookings() {
  try {
    const data = await fs.promises.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading bookings database:', err);
    return [];
  }
}

async function writeBookings(bookings) {
  try {
    await fs.promises.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error writing bookings database:', err);
  }
}

async function readMaintenance() {
  try {
    const data = await fs.promises.readFile(MAINTENANCE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading maintenance database:', err);
    return [];
  }
}

async function writeMaintenance(items) {
  try {
    await fs.promises.writeFile(MAINTENANCE_FILE, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('Error writing maintenance database:', err);
  }
}

async function readPeriods() {
  try {
    if (!fs.existsSync(PERIODS_FILE)) {
      return DEFAULT_PERIODS;
    }
    const data = await fs.promises.readFile(PERIODS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading periods database:', err);
    return DEFAULT_PERIODS;
  }
}

async function writePeriods(periods) {
  try {
    await fs.promises.writeFile(PERIODS_FILE, JSON.stringify(periods, null, 2));
  } catch (err) {
    console.error('Error writing periods database:', err);
  }
}

// --- Microsoft Entra ID Configuration Helpers (for future Teams / Outlook Calendar sync) ---
const getEntraClientId = () => process.env.ENTRA_CLIENT_ID || process.env.VITE_ENTRA_CLIENT_ID || '';
const getEntraTenantId = () => process.env.ENTRA_TENANT_ID || process.env.VITE_ENTRA_TENANT_ID || '';
const getEntraClientSecret = () => process.env.ENTRA_CLIENT_SECRET || '';

// --- School Timetable Bell Schedule (Mon-Thu vs Friday) ---
const TIMETABLE_SCHEDULE = {
  regular: {
    'Period 1': { start: '09:00', end: '09:50' },
    'Period 2': { start: '09:50', end: '10:40' },
    'Break': { start: '10:40', end: '11:00' },
    'Period 3': { start: '11:00', end: '11:50' },
    'Period 4': { start: '11:50', end: '12:40' },
    'Lunch': { start: '12:40', end: '13:20' },
    'Period 5': { start: '13:20', end: '14:10' },
    'Period 6': { start: '14:10', end: '15:00' }
  },
  friday: {
    'Period 1': { start: '09:10', end: '09:55' },
    'Period 2': { start: '09:55', end: '10:40' },
    'Break': { start: '10:40', end: '11:00' },
    'Period 3': { start: '11:00', end: '11:50' },
    'Period 4': { start: '11:50', end: '12:40' },
    'Lunch': { start: '12:40', end: '13:20' },
    'Period 5': { start: '13:20', end: '14:10' },
    'Period 6': { start: '14:10', end: '15:00' }
  }
};

function getPeriodTimes(dateString, periodName) {
  const parts = (dateString || '').split('-');
  let isFriday = false;
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    isFriday = d.getDay() === 5;
  }
  const schedule = isFriday ? TIMETABLE_SCHEDULE.friday : TIMETABLE_SCHEDULE.regular;
  const times = schedule[periodName] || { start: '09:00', end: '10:00' };

  return {
    startDateTime: `${dateString}T${times.start}:00`,
    endDateTime: `${dateString}T${times.end}:00`,
    timeDisplay: `${times.start} - ${times.end}`,
    isFriday
  };
}

// Check admin role
async function isUserAdmin(user) {
  if (!user) return false;

  const userName = (user.name || '').toLowerCase();
  const userEmail = (user.email || '').toLowerCase();

  // 1. Check local mock administrator names
  if (
    userName.includes('admin') ||
    userName.includes('estates') ||
    userEmail.includes('admin') ||
    userEmail.includes('estates')
  ) {
    return true;
  }

  // 2. Direct whitelist check via ADMIN_EMAILS env var
  const adminWhitelist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminWhitelist.length > 0) {
    const isMatch = adminWhitelist.some(entry => {
      return userEmail === entry || userEmail.includes(entry) || userName === entry || userName.includes(entry);
    });
    if (isMatch) return true;
  }

  // 3. Token roles or groups claim
  if (user.roles && (user.roles.includes('Admin') || user.roles.includes('RoomBookingAdmin'))) {
    return true;
  }

  return false;
}

// Middleware: Require Admin access
const requireAdmin = async (req, res, next) => {
  const isAdmin = await isUserAdmin(req.user);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied: Estates/Administrator permissions required.' });
  }
  req.user.isAdmin = true;
  next();
};

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const mockUser = req.headers['x-mock-user'];

  // 1. Mock user header (ideal for standalone web server / local development)
  if (mockUser) {
    const emailPrefix = mockUser.toLowerCase().replace(/[^a-z0-9]/g, '');
    req.user = {
      name: mockUser,
      email: `${emailPrefix}@school.edu`
    };
    return next();
  }

  // 2. Mock token
  if (token && token.startsWith('mock-token-')) {
    const decodedName = decodeURIComponent(token.substring('mock-token-'.length));
    const emailPrefix = decodedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    req.user = {
      name: decodedName,
      email: `${emailPrefix}@school.edu`
    };
    return next();
  }

  // 3. Fallback default user if no auth token provided in local dev mode
  if (!token) {
    req.user = {
      name: "Mr. Steve O'Brien",
      email: "sobrien@school.edu"
    };
    return next();
  }

  // 4. Decode JWT for future Teams SSO integration
  try {
    const decodedToken = jwt.decode(token);
    if (decodedToken) {
      req.user = {
        name: decodedToken.name || decodedToken.unique_name || 'School Staff',
        email: decodedToken.upn || decodedToken.email || decodedToken.preferred_username || 'staff@school.edu',
        groups: decodedToken.groups || [],
        roles: decodedToken.roles || []
      };
      return next();
    }
  } catch (err) {
    console.warn('Token decode error:', err.message);
  }

  req.user = {
    name: "Mr. Steve O'Brien",
    email: "sobrien@school.edu"
  };
  next();
};

// --- API Endpoints ---

// GET /api/auth/me - Current user profile and admin status
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const isAdmin = await isUserAdmin(req.user);
  res.json({
    name: req.user.name,
    email: req.user.email,
    isAdmin
  });
});

// GET /api/rooms - Get all school classrooms
app.get('/api/rooms', authenticateToken, async (req, res) => {
  const rooms = await readRooms();
  res.json(rooms);
});

// POST /api/admin/rooms - Add a new classroom
app.post('/api/admin/rooms', authenticateToken, requireAdmin, async (req, res) => {
  const { id, name, block, floor, capacity, type, facilities, isBookable, unbookableReason } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Room ID and Name are required.' });
  }

  const rooms = await readRooms();
  const existing = rooms.find(r => r.id.toLowerCase() === id.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `Room code '${id}' already exists.` });
  }

  const newRoom = {
    id: id.toUpperCase().trim(),
    name: name.trim(),
    block: block || 'Main Building',
    floor: floor || 'Ground Floor',
    capacity: parseInt(capacity, 10) || 30,
    type: type || 'General Classroom',
    facilities: Array.isArray(facilities) ? facilities : [],
    isBookable: isBookable !== undefined ? Boolean(isBookable) : true,
    unbookableReason: isBookable === false ? (unbookableReason || 'Designated as non-bookable') : ''
  };

  rooms.push(newRoom);
  await writeRooms(rooms);
  res.json({ success: true, room: newRoom, rooms });
});

// PUT /api/admin/rooms/:id - Update classroom details
app.put('/api/admin/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, block, floor, capacity, type, facilities, isBookable, unbookableReason } = req.body;

  const rooms = await readRooms();
  const index = rooms.findIndex(r => r.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const oldName = rooms[index].name;

  rooms[index] = {
    ...rooms[index],
    name: name !== undefined ? name : rooms[index].name,
    block: block !== undefined ? block : rooms[index].block,
    floor: floor !== undefined ? floor : rooms[index].floor,
    capacity: capacity !== undefined ? parseInt(capacity, 10) : rooms[index].capacity,
    type: type !== undefined ? type : rooms[index].type,
    facilities: facilities !== undefined ? facilities : rooms[index].facilities,
    isBookable: isBookable !== undefined ? Boolean(isBookable) : (rooms[index].isBookable !== undefined ? rooms[index].isBookable : true),
    unbookableReason: unbookableReason !== undefined ? unbookableReason : (rooms[index].unbookableReason || '')
  };

  await writeRooms(rooms);

  // If room name changed, update existing bookings roomName as well
  if (name && name !== oldName) {
    const bookings = await readBookings();
    let bookingsModified = false;
    for (const b of bookings) {
      if (b.roomId && b.roomId.toLowerCase() === id.toLowerCase()) {
        b.roomName = name;
        bookingsModified = true;
      }
    }
    if (bookingsModified) {
      await writeBookings(bookings);
    }
  }

  res.json({ success: true, room: rooms[index], rooms });
});

// POST /api/admin/rooms/:id/bookable - Quick toggle/update bookable status
app.post('/api/admin/rooms/:id/bookable', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { isBookable, unbookableReason, reason } = req.body;
  const effectiveReason = unbookableReason || reason || '';

  const rooms = await readRooms();
  const index = rooms.findIndex(r => r.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const newStatus = Boolean(isBookable);
  rooms[index] = {
    ...rooms[index],
    isBookable: newStatus,
    unbookableReason: newStatus ? '' : (effectiveReason || rooms[index].unbookableReason || 'Designated as non-bookable by Administrator')
  };

  await writeRooms(rooms);
  res.json({ success: true, room: rooms[index], rooms });
});

// DELETE /api/admin/rooms/:id - Delete classroom
app.delete('/api/admin/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const rooms = await readRooms();
  const filtered = rooms.filter(r => r.id.toLowerCase() !== id.toLowerCase());

  if (filtered.length === rooms.length) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  await writeRooms(filtered);
  res.json({ success: true, rooms: filtered });
});

// GET /api/bookings - Get bookings for a date and period
app.get('/api/bookings', authenticateToken, async (req, res) => {
  const { date, period } = req.query;
  const bookings = await readBookings();
  const filtered = bookings.filter(b => (!date || b.date === date) && (!period || b.period === period));
  res.json(filtered);
});

// GET /api/bookings/my - Get current user's bookings
app.get('/api/bookings/my', authenticateToken, async (req, res) => {
  const userName = req.user.name;
  const userEmail = req.user.email;
  const bookings = await readBookings();
  const filtered = bookings.filter(b => 
    b.bookedBy === userName || 
    (b.bookedByEmail && userEmail && b.bookedByEmail.toLowerCase() === userEmail.toLowerCase())
  );
  
  // Sort upcoming first
  filtered.sort((a, b) => b.date.localeCompare(a.date));
  res.json(filtered);
});

// GET /api/maintenance - Get classrooms currently under maintenance / out of order
app.get('/api/maintenance', authenticateToken, async (req, res) => {
  const maintenanceList = await readMaintenance();
  res.json(maintenanceList);
});

// POST /api/bookings - Book one or multiple classrooms
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { date, period, roomIds, purpose } = req.body;
  const userName = req.user.name;
  const userEmail = req.user.email;

  if (!date || !period || !roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
    return res.status(400).json({ error: 'Missing required booking fields (date, period, and roomIds).' });
  }

  // Check if any room is marked unbookable
  const allRooms = await readRooms();
  const roomsMap = Object.fromEntries(allRooms.map(r => [r.id, r]));
  const unbookableRooms = roomIds.filter(id => roomsMap[id] && roomsMap[id].isBookable === false);
  if (unbookableRooms.length > 0) {
    const unbookableDetails = unbookableRooms.map(id => {
      const r = roomsMap[id];
      return `${r.name || id} (${r.unbookableReason || 'Designated as Non-Bookable'})`;
    }).join(', ');
    return res.status(400).json({
      error: `Cannot book: The following space(s) are set as Unbookable: ${unbookableDetails}`
    });
  }

  // Check if any room is under maintenance
  const maintenanceList = await readMaintenance();
  const maintenanceRoomIds = maintenanceList.map(m => m.roomId);
  const blockedRooms = roomIds.filter(id => maintenanceRoomIds.includes(id));
  if (blockedRooms.length > 0) {
    return res.status(400).json({
      error: `Cannot book room(s) ${blockedRooms.join(', ')}: currently flagged for maintenance or out of order.`
    });
  }

  // Check if any room is already booked for this date and period
  const existingBookings = await readBookings();
  const conflictingBookings = existingBookings.filter(b => 
    b.date === date && b.period === period && roomIds.includes(b.roomId)
  );

  if (conflictingBookings.length > 0) {
    const bookedNames = conflictingBookings.map(b => b.roomName || b.roomId).join(', ');
    return res.status(409).json({
      error: `The following room(s) are already booked for ${period} on ${date}: ${bookedNames}`
    });
  }

  const newBookings = roomIds.map(roomId => {
    const roomInfo = roomsMap[roomId] || {};
    return {
      id: crypto.randomUUID(),
      date,
      period,
      roomId,
      roomName: roomInfo.name || `Room ${roomId}`,
      block: roomInfo.block || '',
      capacity: roomInfo.capacity || null,
      bookedBy: userName,
      bookedByEmail: userEmail,
      purpose: (purpose || '').trim() || 'General Classroom Booking',
      createdAt: new Date().toISOString(),
      outlookEventId: null
    };
  });

  const updatedBookings = [...existingBookings, ...newBookings];
  await writeBookings(updatedBookings);

  res.json({
    success: true,
    message: `Successfully booked ${newBookings.length} room(s)`,
    bookings: newBookings
  });
});

// DELETE /api/bookings/:id - Cancel user's own booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userName = req.user.name;
  const userEmail = req.user.email;

  const bookings = await readBookings();
  const target = bookings.find(b => String(b.id) === String(id));

  if (!target) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  // Allow user if owner or admin
  const isAdmin = await isUserAdmin(req.user);
  const isOwner = target.bookedBy === userName || (userEmail && target.bookedByEmail === userEmail);

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'You can only cancel your own bookings.' });
  }

  const filtered = bookings.filter(b => String(b.id) !== String(id));
  await writeBookings(filtered);

  res.json({ success: true, message: 'Classroom booking cancelled successfully.' });
});

// DELETE /api/bookings/group - Cancel all user's bookings for a specific session
app.delete('/api/bookings/group', authenticateToken, async (req, res) => {
  const { date, period } = req.query;
  const userName = req.user.name;
  const userEmail = req.user.email;

  if (!date || !period) {
    return res.status(400).json({ error: 'Date and Period are required.' });
  }

  const bookings = await readBookings();
  const targets = bookings.filter(b => 
    b.date === date &&
    b.period === period &&
    (b.bookedBy === userName || (userEmail && b.bookedByEmail === userEmail))
  );

  if (targets.length === 0) {
    return res.status(404).json({ error: 'No matching bookings found for this session.' });
  }

  const targetIds = new Set(targets.map(b => String(b.id)));
  const filtered = bookings.filter(b => !targetIds.has(String(b.id)));
  await writeBookings(filtered);

  res.json({
    success: true,
    message: `Cancelled ${targets.length} classroom booking(s) for ${period} on ${date}.`,
    count: targets.length
  });
});

// --- ADMIN & ESTATES API ENDPOINTS ---

// GET /api/admin/bookings - Master booking list with filters & search
app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  const { date, period, block, search } = req.query;
  let bookings = await readBookings();

  if (date) {
    bookings = bookings.filter(b => b.date === date);
  }
  if (period) {
    bookings = bookings.filter(b => b.period === period);
  }
  if (block) {
    bookings = bookings.filter(b => (b.block || '').toLowerCase().includes(block.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    bookings = bookings.filter(b =>
      (b.roomId && b.roomId.toLowerCase().includes(q)) ||
      (b.roomName && b.roomName.toLowerCase().includes(q)) ||
      (b.bookedBy && b.bookedBy.toLowerCase().includes(q)) ||
      (b.purpose && b.purpose.toLowerCase().includes(q)) ||
      (b.date && b.date.includes(q))
    );
  }

  // Sort descending by date, then period, then room
  bookings.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    if (a.period !== b.period) return (a.period || '').localeCompare(b.period || '');
    return (a.roomId || '').localeCompare(b.roomId || '');
  });

  res.json(bookings);
});

// DELETE /api/admin/bookings/:id - Admin override cancellation
app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const bookings = await readBookings();
  const target = bookings.find(b => String(b.id) === String(id));

  if (!target) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const filtered = bookings.filter(b => String(b.id) !== String(id));
  await writeBookings(filtered);

  res.json({ success: true, message: `Booking for ${target.roomName} cancelled by Administrator.` });
});

// POST /api/admin/maintenance - Toggle room maintenance / out of order
app.post('/api/admin/maintenance', authenticateToken, requireAdmin, async (req, res) => {
  const { roomId, status, reason, category, estimatedCompletion } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required.' });
  }

  const allRooms = await readRooms();
  const room = allRooms.find(r => r.id.toLowerCase() === roomId.toLowerCase());
  const current = await readMaintenance();

  let updated;
  if (status === 'maintenance' || status === 'out_of_order') {
    const existingIndex = current.findIndex(m => m.roomId.toLowerCase() === roomId.toLowerCase());
    const entry = {
      roomId: room ? room.id : roomId,
      roomName: room ? room.name : `Room ${roomId}`,
      reason: reason || 'Under maintenance / estates inspection',
      category: category || 'Maintenance',
      estimatedCompletion: estimatedCompletion || '',
      updatedBy: req.user.name,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      current[existingIndex] = entry;
      updated = [...current];
    } else {
      updated = [...current, entry];
    }
  } else {
    // Restore room to active service
    updated = current.filter(m => m.roomId.toLowerCase() !== roomId.toLowerCase());
  }

  await writeMaintenance(updated);
  res.json({ success: true, maintenance: updated });
});

// GET /api/admin/stats - Quick stats on utilization
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  const rooms = await readRooms();
  const bookings = await readBookings();
  const maintenance = await readMaintenance();

  const totalRooms = rooms.length;
  const bookableRooms = rooms.filter(r => r.isBookable !== false).length;
  const unbookableRooms = rooms.filter(r => r.isBookable === false).length;
  const totalBookings = bookings.length;
  const roomsInMaintenance = maintenance.length;

  // Bookings today
  const todayStr = new Date().toISOString().split('T')[0];
  const bookingsToday = bookings.filter(b => b.date === todayStr).length;

  // Most booked rooms
  const roomCountMap = {};
  bookings.forEach(b => {
    roomCountMap[b.roomId] = (roomCountMap[b.roomId] || 0) + 1;
  });

  const popularRooms = Object.entries(roomCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([roomId, count]) => {
      const room = rooms.find(r => r.id === roomId);
      return { roomId, name: room ? room.name : roomId, bookingsCount: count };
    });

  res.json({
    totalRooms,
    bookableRooms,
    unbookableRooms,
    totalBookings,
    roomsInMaintenance,
    bookingsToday,
    popularRooms
  });
});

// --- TIMETABLE PERIODS ENDPOINTS ---

// GET /api/periods - List all timetable periods
app.get('/api/periods', async (req, res) => {
  try {
    const periods = await readPeriods();
    res.json(periods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load periods' });
  }
});

// POST /api/admin/periods - Add a new timetable period
app.post('/api/admin/periods', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, regularStart, regularEnd, fridayStart, fridayEnd, type, isBookable } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Period name is required.' });
    }
    const periods = await readPeriods();
    const id = `period-${Date.now()}`;
    const newPeriod = {
      id,
      name: name.trim(),
      regularStart: regularStart || '09:00',
      regularEnd: regularEnd || '09:50',
      fridayStart: fridayStart || regularStart || '09:00',
      fridayEnd: fridayEnd || regularEnd || '09:50',
      type: type || 'Lesson',
      isBookable: isBookable !== false
    };
    periods.push(newPeriod);
    await writePeriods(periods);
    res.status(201).json({ success: true, period: newPeriod, periods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add period' });
  }
});

// PUT /api/admin/periods/:id - Edit an existing timetable period
app.put('/api/admin/periods/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, regularStart, regularEnd, fridayStart, fridayEnd, type, isBookable } = req.body;
    const periods = await readPeriods();
    const idx = periods.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Period not found.' });
    }

    const oldName = periods[idx].name;
    const newName = (name || periods[idx].name).trim();

    periods[idx] = {
      ...periods[idx],
      name: newName,
      regularStart: regularStart || periods[idx].regularStart,
      regularEnd: regularEnd || periods[idx].regularEnd,
      fridayStart: fridayStart || periods[idx].fridayStart,
      fridayEnd: fridayEnd || periods[idx].fridayEnd,
      type: type || periods[idx].type,
      isBookable: isBookable !== undefined ? isBookable : periods[idx].isBookable
    };

    await writePeriods(periods);

    // If period name changed, synchronize existing bookings
    if (oldName !== newName) {
      const bookings = await readBookings();
      let updatedCount = 0;
      bookings.forEach(b => {
        if (b.period === oldName) {
          b.period = newName;
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        await writeBookings(bookings);
      }
    }

    res.json({ success: true, period: periods[idx], periods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update period' });
  }
});

// DELETE /api/admin/periods/:id - Remove a period
app.delete('/api/admin/periods/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let periods = await readPeriods();
    const target = periods.find(p => p.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Period not found.' });
    }
    periods = periods.filter(p => p.id !== id);
    await writePeriods(periods);
    res.json({ success: true, message: `Period ${target.name} removed.`, periods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete period' });
  }
});

// POST /api/admin/periods/reorder - Reorder sequence of periods
app.post('/api/admin/periods/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { periodIds } = req.body;
    if (!Array.isArray(periodIds)) {
      return res.status(400).json({ error: 'periodIds array required.' });
    }
    const periods = await readPeriods();
    const map = new Map(periods.map(p => [p.id, p]));
    const reordered = [];
    periodIds.forEach(id => {
      if (map.has(id)) {
        reordered.push(map.get(id));
        map.delete(id);
      }
    });
    map.forEach(p => reordered.push(p));
    await writePeriods(reordered);
    res.json({ success: true, periods: reordered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder periods' });
  }
});

// Serve frontend static assets in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all non-API GET requests to index.html for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TRSW Room Booker - Server Running</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 3rem; background: #f8fafc; color: #1e293b; }
          .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 650px; margin: 0 auto; }
          h2 { color: #4338ca; margin-top: 0; }
          code { background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #4338ca; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🏫 TRSW Room Booker - Backend Server Running</h2>
          <p>The Express backend is actively running on port <strong>${PORT}</strong>.</p>
          <p>For development with live reload, start the client using:</p>
          <p><code>npm run dev</code> or <code>npm run dev:client</code></p>
          <p>Or build the client bundle with <code>npm run build</code> for standalone single-server serving.</p>
        </div>
      </body>
      </html>
    `);
  }
  res.sendFile(indexPath);
});

// Start listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏫 TRSW Room Booker Web Server running on port ${PORT}`);
  console.log(`Mode: School Classrooms Local Web Server`);
  console.log(`Data Files: ${DATA_DIR}`);
  console.log(`====================================================`);
});
