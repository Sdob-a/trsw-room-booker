// src/components/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { 
  ArrowUp,
  ArrowDown,
  ShieldCheck, 
  Calendar as CalendarIcon, 
  Wrench, 
  Search, 
  Download, 
  Trash2, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  DoorClosed, 
  Layers, 
  BarChart3, 
  Check, 
  Edit3, 
  X, 
  MapPin, 
  Clock, 
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Building2
} from 'lucide-react';
import { PERIODS, ROOM_BLOCKS, ROOM_TYPES, getPeriodTimes } from '../../constants';
import { 
  getAllBookingsAdmin, 
  cancelBookingAdmin, 
  getMaintenanceRooms, 
  setRoomMaintenanceStatus, 
  getRooms, 
  addRoomAdmin, 
  updateRoomAdmin, 
  deleteRoomAdmin, 
  getAdminStats,
  setRoomBookableStatus,
  getPeriods,
  addPeriodAdmin,
  updatePeriodAdmin,
  deletePeriodAdmin,
  reorderPeriodsAdmin
} from '../../services/BookingService';
import './AdminDashboard.css';

const AdminDashboard = ({ userName = 'Estates Admin' }) => {
  const [activeSubTab, setActiveSubTab] = useState('bookings'); // 'bookings' | 'maintenance' | 'rooms' | 'analytics'

  // Master bookings state
  const [bookings, setBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Maintenance state
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoomForMaint, setSelectedRoomForMaint] = useState('');
  const [maintReason, setMaintReason] = useState('');
  const [maintCategory, setMaintCategory] = useState('Maintenance & Repairs');
  const [maintEstCompletion, setMaintEstCompletion] = useState('');

  // Rooms Directory state
  const [rooms, setRooms] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryBlockFilter, setDirectoryBlockFilter] = useState('All Buildings');
  const [bookableFilter, setBookableFilter] = useState('all'); // 'all' | 'bookable' | 'unbookable'
  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomData, setEditRoomData] = useState({
    name: '',
    block: '',
    floor: 'Ground Floor',
    capacity: 30,
    type: 'General Classroom',
    facilitiesText: '',
    isBookable: true,
    unbookableReason: ''
  });
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    id: '',
    name: '',
    block: ROOM_BLOCKS[1] || 'Kensington Building',
    floor: 'Ground Floor',
    capacity: 30,
    type: 'General Classroom',
    facilitiesText: 'Interactive Whiteboard, Projector, Teacher PC',
    isBookable: true,
    unbookableReason: ''
  });

  // Timetable Periods state
  const [periodsList, setPeriodsList] = useState([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodData, setNewPeriodData] = useState({
    name: '',
    regularStart: '09:00',
    regularEnd: '09:50',
    fridayStart: '09:10',
    fridayEnd: '09:55',
    type: 'Lesson',
    isBookable: true
  });
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [editPeriodData, setEditPeriodData] = useState({
    name: '',
    regularStart: '09:00',
    regularEnd: '09:50',
    fridayStart: '09:10',
    fridayEnd: '09:55',
    type: 'Lesson',
    isBookable: true
  });
  const [periodToDelete, setPeriodToDelete] = useState(null);

  // Bookable/Unbookable Modal state
  const [showBookableModal, setShowBookableModal] = useState(false);
  const [roomToModifyBookable, setRoomToModifyBookable] = useState(null);
  const [unbookableReasonInput, setUnbookableReasonInput] = useState('Staff Office / Dedicated Space');

  // Analytics state
  const [stats, setStats] = useState(null);

  // General state
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Bookings
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await getAllBookingsAdmin({
        date: dateFilter,
        period: periodFilter,
        block: blockFilter,
        search: searchQuery
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
      showToast('Failed to load bookings.', 'error');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Load Maintenance
  const loadMaintenance = async () => {
    setIsLoadingMaintenance(true);
    try {
      const data = await getMaintenanceRooms();
      setMaintenanceList(data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  // Load Rooms
  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms directory:', err);
    }
  };

  // Load Stats
  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Load Timetable Periods
  const loadPeriods = async () => {
    setIsLoadingPeriods(true);
    try {
      const data = await getPeriods();
      setPeriodsList(data);
    } catch (err) {
      console.error('Failed to load periods:', err);
      showToast('Failed to load timetable periods.', 'error');
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  const calculateDurationMinutes = (start, end) => {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? `${diff} mins` : '';
  };

  const handleAddPeriodSubmit = async (e) => {
    e.preventDefault();
    if (!newPeriodData.name.trim()) {
      showToast('Period name is required.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await addPeriodAdmin(newPeriodData);
      setPeriodsList(res.periods);
      setShowAddPeriodModal(false);
      setNewPeriodData({
        name: '',
        regularStart: '09:00',
        regularEnd: '09:50',
        fridayStart: '09:10',
        fridayEnd: '09:55',
        type: 'Lesson',
        isBookable: true
      });
      showToast(`Period "${newPeriodData.name}" added successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add period.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPeriodClick = (p) => {
    setEditingPeriod(p);
    setEditPeriodData({
      name: p.name || '',
      regularStart: p.regularStart || '09:00',
      regularEnd: p.regularEnd || '09:50',
      fridayStart: p.fridayStart || p.regularStart || '09:00',
      fridayEnd: p.fridayEnd || p.regularEnd || '09:50',
      type: p.type || 'Lesson',
      isBookable: p.isBookable !== false
    });
  };

  const handleUpdatePeriodSubmit = async (e) => {
    e.preventDefault();
    if (!editPeriodData.name.trim()) {
      showToast('Period name is required.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await updatePeriodAdmin(editingPeriod.id, editPeriodData);
      setPeriodsList(res.periods);
      setEditingPeriod(null);
      showToast(`Period "${editPeriodData.name}" updated successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update period.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePeriodConfirm = async () => {
    if (!periodToDelete) return;
    setIsProcessing(true);
    try {
      const res = await deletePeriodAdmin(periodToDelete.id);
      setPeriodsList(res.periods);
      showToast(res.message || 'Period removed successfully!', 'success');
      setPeriodToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete period.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMovePeriod = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= periodsList.length) return;

    const updated = [...periodsList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPeriodsList(updated);

    try {
      const ids = updated.map(p => p.id);
      await reorderPeriodsAdmin(ids);
      showToast('Period sequence updated.', 'success');
    } catch (err) {
      console.error('Failed to save period sequence:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'bookings') loadBookings();
    if (activeSubTab === 'maintenance') {
      loadMaintenance();
      loadRooms();
    }
    if (activeSubTab === 'rooms') loadRooms();
    if (activeSubTab === 'periods') loadPeriods();
    if (activeSubTab === 'analytics') loadStats();
    // Always pre-populate period count for tabs badge
    loadPeriods();
  }, [activeSubTab, dateFilter, periodFilter, blockFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('No bookings available to export.', 'error');
      return;
    }

    const headers = ['Booking ID', 'Date', 'Period', 'Room Code', 'Room Name', 'Building', 'Booked By', 'Email', 'Purpose', 'Booked At'];
    const rows = bookings.map(b => [
      `"${b.id}"`,
      `"${b.date}"`,
      `"${b.period}"`,
      `"${b.roomId}"`,
      `"${(b.roomName || '').replace(/"/g, '""')}"`,
      `"${(b.block || '').replace(/"/g, '""')}"`,
      `"${(b.bookedBy || '').replace(/"/g, '""')}"`,
      `"${(b.bookedByEmail || '').replace(/"/g, '""')}"`,
      `"${(b.purpose || '').replace(/"/g, '""')}"`,
      `"${b.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trsw_classroom_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${bookings.length} bookings to CSV!`, 'success');
  };

  // Confirm cancel booking
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      await cancelBookingAdmin(cancelTarget.id);
      showToast(`Cancelled booking for ${cancelTarget.roomName} on ${cancelTarget.date}.`, 'success');
      setCancelTarget(null);
      await loadBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Maintenance Toggle / Save
  const handleSaveMaintenance = async (roomId, makeActive = false) => {
    setIsProcessing(true);
    try {
      const status = makeActive ? 'active' : 'out_of_order';
      const targetRoom = roomId || selectedRoomForMaint;
      await setRoomMaintenanceStatus(
        targetRoom, 
        status, 
        maintReason, 
        maintCategory, 
        maintEstCompletion
      );
      showToast(
        makeActive 
          ? `Room ${targetRoom} restored to active service.`
          : `Room ${targetRoom} flagged for maintenance/closure.`,
        'success'
      );
      setShowMaintenanceModal(false);
      setSelectedRoomForMaint('');
      setMaintReason('');
      setMaintEstCompletion('');
      await loadMaintenance();
    } catch (err) {
      showToast(err.message || 'Failed to update room maintenance.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Bookable Toggle
  const handleToggleBookableClick = (room) => {
    if (room.isBookable !== false) {
      // Currently bookable -> user wants to set it unbookable
      setRoomToModifyBookable(room);
      setUnbookableReasonInput('Senior Leadership Office');
      setShowBookableModal(true);
    } else {
      // Currently unbookable -> restore to bookable immediately
      handleSaveBookableStatus(room.id, true, '');
    }
  };

  const handleSaveBookableStatus = async (roomId, isBookable, reason) => {
    setIsProcessing(true);
    try {
      await setRoomBookableStatus(roomId, isBookable, reason);
      showToast(
        isBookable
          ? `Room ${roomId} is now Bookable by staff.`
          : `Room ${roomId} is now marked Unbookable (${reason}).`,
        'success'
      );
      setShowBookableModal(false);
      setRoomToModifyBookable(null);
      await loadRooms();
    } catch (err) {
      showToast(err.message || 'Failed to update bookable status.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit Room Handlers
  const handleEditRoomClick = (room) => {
    setEditingRoom(room);
    setEditRoomData({
      name: room.name || '',
      block: room.block || ROOM_BLOCKS[1] || 'Senior School Building',
      floor: room.floor || 'Ground Floor',
      capacity: room.capacity || 30,
      type: room.type || 'General Classroom',
      facilitiesText: (room.facilities || []).join(', '),
      isBookable: room.isBookable !== false,
      unbookableReason: room.unbookableReason || ''
    });
  };

  const handleUpdateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!editRoomData.name.trim()) {
      showToast('Room Name is required.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const facilities = editRoomData.facilitiesText
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      await updateRoomAdmin(editingRoom.id, {
        name: editRoomData.name,
        block: editRoomData.block,
        floor: editRoomData.floor,
        capacity: parseInt(editRoomData.capacity, 10) || 30,
        type: editRoomData.type,
        facilities,
        isBookable: editRoomData.isBookable,
        unbookableReason: editRoomData.isBookable ? '' : editRoomData.unbookableReason
      });

      showToast(`Room ${editingRoom.id} (${editRoomData.name}) updated successfully!`, 'success');
      setEditingRoom(null);
      await loadRooms();
    } catch (err) {
      showToast(err.message || 'Failed to update classroom attributes.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Room
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!newRoomData.id.trim() || !newRoomData.name.trim()) {
      showToast('Room Code and Name are required.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const facilities = newRoomData.facilitiesText
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      await addRoomAdmin({
        id: newRoomData.id,
        name: newRoomData.name,
        block: newRoomData.block,
        floor: newRoomData.floor,
        capacity: newRoomData.capacity,
        type: newRoomData.type,
        facilities,
        isBookable: newRoomData.isBookable,
        unbookableReason: newRoomData.isBookable ? '' : newRoomData.unbookableReason
      });

      showToast(`Room ${newRoomData.id} successfully registered!`, 'success');
      setShowAddRoomModal(false);
      setNewRoomData({
        id: '',
        name: '',
        block: ROOM_BLOCKS[1] || 'Kensington Building',
        floor: 'Ground Floor',
        capacity: 30,
        type: 'General Classroom',
        facilitiesText: 'Interactive Whiteboard, Projector, Teacher PC',
        isBookable: true,
        unbookableReason: ''
      });
      await loadRooms();
    } catch (err) {
      showToast(err.message || 'Failed to add classroom.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm(`Are you sure you want to remove room ${roomId} from the school directory?`)) {
      return;
    }
    try {
      await deleteRoomAdmin(roomId);
      showToast(`Classroom ${roomId} removed.`, 'success');
      await loadRooms();
    } catch (err) {
      showToast(err.message || 'Failed to delete room.', 'error');
    }
  };

  // Filtered rooms in directory
  const filteredDirectoryRooms = rooms.filter(room => {
    if (directoryBlockFilter !== 'All Buildings' && room.block !== directoryBlockFilter) {
      return false;
    }
    if (bookableFilter === 'bookable' && room.isBookable === false) {
      return false;
    }
    if (bookableFilter === 'unbookable' && room.isBookable !== false) {
      return false;
    }
    if (directorySearch.trim()) {
      const q = directorySearch.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchId = room.id.toLowerCase().includes(q);
      const matchType = room.type.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchType) return false;
    }
    return true;
  });

  const totalBookableCount = rooms.filter(r => r.isBookable !== false).length;
  const totalUnbookableCount = rooms.filter(r => r.isBookable === false).length;

  return (
    <div className="admin-container">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header Banner */}
      <section className="admin-header-card glass-panel">
        <div className="admin-title-wrap">
          <div className="admin-shield-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2>Estates & Administrator Portal</h2>
            <p className="text-secondary">
              Master timetable allocations, bookable/unbookable room status, closures & maintenance.
            </p>
          </div>
        </div>

        <div className="admin-subtabs-nav">
          <button 
            className={`admin-subtab ${activeSubTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('bookings')}
          >
            <CalendarIcon size={16} />
            <span>Master Bookings</span>
          </button>
          <button 
            className={`admin-subtab ${activeSubTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('maintenance')}
          >
            <Wrench size={16} />
            <span>Room Maintenance</span>
            {maintenanceList.length > 0 && (
              <span className="count-pill">{maintenanceList.length}</span>
            )}
          </button>
          <button 
            className={`admin-subtab ${activeSubTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('rooms')}
          >
            <DoorClosed size={16} />
            <span>Classroom Directory</span>
            <span className="count-pill-blue">{rooms.length}</span>
          </button>
          <button 
            className={`admin-subtab ${activeSubTab === 'periods' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('periods')}
          >
            <Clock size={16} />
            <span>Timetable Periods</span>
            <span className="count-pill-blue">{periodsList.length}</span>
          </button>
          <button 
            className={`admin-subtab ${activeSubTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('analytics')}
          >
            <BarChart3 size={16} />
            <span>Utilization Stats</span>
          </button>
        </div>
      </section>

      {/* SUBTAB 1: MASTER BOOKINGS */}
      {activeSubTab === 'bookings' && (
        <section className="admin-section">
          {/* Filters Bar */}
          <div className="admin-filters-card glass-panel">
            <div className="filter-input-row">
              <div className="filter-item">
                <label>Filter Date</label>
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="filter-item">
                <label>Period</label>
                <select 
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="">All Periods</option>
                  {PERIODS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Building Block</label>
                <select 
                  value={blockFilter}
                  onChange={(e) => setBlockFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="">All Buildings</option>
                  {ROOM_BLOCKS.filter(b => b !== 'All Buildings').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item search-grow">
                <label>Search Teacher / Room / Purpose</label>
                <div className="search-wrap">
                  <Search size={16} className="search-icon-admin" />
                  <input 
                    type="text" 
                    placeholder="Search by teacher name, room, or note..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-input search-pl"
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="filters-actions-row">
              <button 
                className="btn btn-outline btn-sm"
                onClick={loadBookings}
                disabled={isLoadingBookings}
              >
                <RefreshCw size={14} className={isLoadingBookings ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button 
                className="btn btn-outline btn-sm"
                onClick={() => { setDateFilter(''); setPeriodFilter(''); setBlockFilter(''); setSearchQuery(''); }}
              >
                Reset Filters
              </button>

              <button 
                className="btn btn-primary btn-sm ml-auto"
                onClick={handleExportCSV}
              >
                <Download size={14} />
                Export to CSV ({bookings.length})
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="table-wrapper glass-panel">
            {isLoadingBookings ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Retrieving master bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <CalendarIcon size={36} className="text-muted mb-2" />
                <h3>No bookings found</h3>
                <p className="text-secondary">No classroom bookings matched your active filters.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Room</th>
                    <th>Location</th>
                    <th>Booked By</th>
                    <th>Purpose / Class</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="font-semibold text-primary">{b.date}</td>
                      <td>
                        <span className="table-period-tag">{b.period}</span>
                      </td>
                      <td>
                        <div className="table-room-cell">
                          <strong className="text-brand">{b.roomId}</strong>
                          <span className="room-subname">{b.roomName}</span>
                        </div>
                      </td>
                      <td className="text-secondary text-sm">{b.block || '—'}</td>
                      <td>
                        <div className="teacher-cell">
                          <span className="teacher-name">{b.bookedBy}</span>
                          {b.bookedByEmail && (
                            <span className="teacher-email">{b.bookedByEmail}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-secondary text-sm">{b.purpose || '—'}</td>
                      <td className="text-right">
                        <button 
                          className="btn-admin-cancel"
                          onClick={() => setCancelTarget(b)}
                          title="Admin cancellation override"
                        >
                          <Trash2 size={15} />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* SUBTAB 2: ROOM MAINTENANCE & CLOSURES */}
      {activeSubTab === 'maintenance' && (
        <section className="admin-section">
          <div className="maintenance-action-card glass-panel">
            <div className="action-card-text">
              <h3>Classroom Maintenance & Estates Closures</h3>
              <p className="text-secondary">
                Flag classrooms as Out of Order for maintenance, exam halls setup, deep cleaning, or refurbishment. Classrooms under maintenance cannot be booked by staff.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setSelectedRoomForMaint(rooms[0]?.id || '');
                setShowMaintenanceModal(true);
              }}
            >
              <Plus size={16} />
              Flag Room for Maintenance
            </button>
          </div>

          <div className="maintenance-cards-grid">
            {isLoadingMaintenance ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading maintenance records...</p>
              </div>
            ) : maintenanceList.length === 0 ? (
              <div className="empty-state glass-panel full-span">
                <Check size={40} className="text-success mb-2" />
                <h3>All Classrooms Active</h3>
                <p className="text-secondary">There are currently no classrooms out of order or undergoing maintenance.</p>
              </div>
            ) : (
              maintenanceList.map(item => (
                <div key={item.roomId} className="maintenance-card glass-panel">
                  <div className="maint-card-header">
                    <div className="maint-room-code">
                      <Wrench size={16} />
                      <span>{item.roomId}</span>
                    </div>
                    <span className="maint-badge">Under Maintenance</span>
                  </div>

                  <div className="maint-card-body">
                    <h4>{item.roomName}</h4>
                    <div className="maint-reason-box">
                      <strong>Reason for Closure:</strong>
                      <p>{item.reason}</p>
                    </div>

                    <div className="maint-meta-grid">
                      <div>
                        <span className="meta-label">Category</span>
                        <span className="meta-val">{item.category || 'Maintenance'}</span>
                      </div>
                      <div>
                        <span className="meta-label">Est. Reopen</span>
                        <span className="meta-val">{item.estimatedCompletion || 'TBD'}</span>
                      </div>
                      <div className="full-width">
                        <span className="meta-label">Reported By</span>
                        <span className="meta-val">{item.updatedBy || 'Estates Team'} ({item.updatedAt?.split('T')[0]})</span>
                      </div>
                    </div>
                  </div>

                  <div className="maint-card-footer">
                    <button 
                      className="btn btn-success btn-sm full-width"
                      onClick={() => handleSaveMaintenance(item.roomId, true)}
                      disabled={isProcessing}
                    >
                      <Check size={14} />
                      Restore Room to Active Service
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* SUBTAB 3: CLASSROOM DIRECTORY (WITH BOOKABLE / UNBOOKABLE CONTROLS) */}
      {activeSubTab === 'rooms' && (
        <section className="admin-section">
          <div className="directory-action-bar glass-panel">
            <div>
              <h3>Classroom Master Directory ({rooms.length} Total Spaces)</h3>
              <p className="text-secondary">
                Configure room specifications and set rooms as <strong>Bookable</strong> or <strong>Unbookable</strong> (for offices, prep rooms, and staff-only spaces).
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddRoomModal(true)}
            >
              <Plus size={16} />
              Register New Room / Space
            </button>
          </div>

          {/* Directory Filter Bar */}
          <div className="directory-filters-bar glass-panel">
            <div className="search-wrap flex-1">
              <Search size={16} className="search-icon-admin" />
              <input 
                type="text" 
                placeholder="Search rooms by code, name, or type..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="admin-input search-pl"
              />
              {directorySearch && (
                <button className="clear-search-btn" onClick={() => setDirectorySearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-group">
              <Building2 size={15} className="text-muted" />
              <select 
                value={directoryBlockFilter}
                onChange={(e) => setDirectoryBlockFilter(e.target.value)}
                className="filter-select"
              >
                {ROOM_BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Bookable vs Unbookable Pill Filter */}
            <div className="bookable-filter-pills">
              <button 
                type="button" 
                className={`filter-pill ${bookableFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBookableFilter('all')}
              >
                All ({rooms.length})
              </button>
              <button 
                type="button" 
                className={`filter-pill ${bookableFilter === 'bookable' ? 'active' : ''}`}
                onClick={() => setBookableFilter('bookable')}
              >
                🟢 Bookable ({totalBookableCount})
              </button>
              <button 
                type="button" 
                className={`filter-pill ${bookableFilter === 'unbookable' ? 'active' : ''}`}
                onClick={() => setBookableFilter('unbookable')}
              >
                🔒 Unbookable ({totalUnbookableCount})
              </button>
            </div>
          </div>

          <div className="rooms-directory-grid">
            {filteredDirectoryRooms.map(room => {
              const isBookable = room.isBookable !== false;
              return (
                <div key={room.id} className={`directory-room-card glass-panel ${!isBookable ? 'card-unbookable' : ''}`}>
                  <div className="dir-card-header">
                    <span className="dir-room-code">{room.id}</span>
                    <div className="dir-header-right">
                      <span className="dir-capacity">{room.capacity} seats</span>
                      <span className={`bookable-status-tag ${isBookable ? 'tag-bookable' : 'tag-unbookable'}`}>
                        {isBookable ? '🟢 Bookable' : '🔒 Unbookable'}
                      </span>
                    </div>
                  </div>
                  <h4>{room.name}</h4>
                  <p className="dir-location">{room.block} • {room.floor}</p>
                  <div className="dir-type-tag">{room.type}</div>

                  {!isBookable && room.unbookableReason && (
                    <div className="unbookable-reason-note">
                      <Lock size={12} />
                      <span>{room.unbookableReason}</span>
                    </div>
                  )}
                  
                  <div className="dir-facilities">
                    {(room.facilities || []).map((f, i) => (
                      <span key={i} className="dir-facility-chip">{f}</span>
                    ))}
                  </div>

                  <div className="dir-card-actions">
                    <div className="dir-actions-row">
                      {/* Edit Attributes Button */}
                      <button 
                        type="button" 
                        className="btn btn-outline dir-action-btn"
                        onClick={() => handleEditRoomClick(room)}
                        title="Edit room specifications and attributes"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Toggle Bookable Button */}
                      <button
                        type="button"
                        className={`btn ${isBookable ? 'btn-outline' : 'btn-success'} dir-action-btn`}
                        onClick={() => handleToggleBookableClick(room)}
                        title={isBookable ? 'Change to Unbookable' : 'Restore to Bookable'}
                      >
                        {isBookable ? (
                          <>
                            <Lock size={13} />
                            <span>Make Unbookable</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={13} />
                            <span>Make Bookable</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="dir-actions-row dir-actions-secondary">
                      {/* Maintenance Button */}
                      <button 
                        type="button"
                        className="btn btn-outline dir-action-btn"
                        onClick={() => {
                          setSelectedRoomForMaint(room.id);
                          setMaintReason('');
                          setShowMaintenanceModal(true);
                        }}
                        title="Flag for maintenance and repairs"
                      >
                        <Wrench size={13} />
                        <span>Maintenance</span>
                      </button>

                      {/* Delete Room Button */}
                      <button 
                        type="button"
                        className="btn btn-outline-danger dir-action-btn"
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Delete room from directory"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      
      {/* SUBTAB: TIMETABLE PERIODS & BELL SCHEDULE */}
      {activeSubTab === 'periods' && (
        <section className="admin-section">
          {/* Header Action Bar */}
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Timetable Periods & Bell Schedule</h3>
              <p className="text-secondary text-sm">
                Define school day timetable blocks, standard lesson timings, Friday adjusted finishes, and break/lunch designations.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddPeriodModal(true)}
            >
              <Plus size={16} />
              <span>Add Timetable Period</span>
            </button>
          </div>

          {/* Periods KPI Summary Cards */}
          <div className="stats-kpi-grid">
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Total Day Periods</span>
              <span className="kpi-value text-brand">{periodsList.length}</span>
              <span className="kpi-sub">Blocks across full school day</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Teaching Lessons</span>
              <span className="kpi-value text-success">
                {periodsList.filter(p => (p.type || 'Lesson') === 'Lesson' || p.isBookable).length}
              </span>
              <span className="kpi-sub">Standard classroom periods</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Breaks & Recess</span>
              <span className="kpi-value text-amber">
                {periodsList.filter(p => p.type === 'Break' || p.type === 'Lunch').length}
              </span>
              <span className="kpi-sub">Non-teaching interval periods</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Day Schedule Span</span>
              <span className="kpi-value text-muted" style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>
                {periodsList.length > 0 ? `${periodsList[0].regularStart} – ${periodsList[periodsList.length - 1].regularEnd}` : '09:00 – 15:00'}
              </span>
              <span className="kpi-sub">Regular Mon–Thu school hours</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="admin-table-container glass-panel">
            <table className="admin-table periods-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Sequence</th>
                  <th>Period Name</th>
                  <th>Classification</th>
                  <th>Mon – Thu Regular</th>
                  <th>Friday Adjusted</th>
                  <th>Bookable Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPeriods ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-secondary">
                      Loading timetable schedule...
                    </td>
                  </tr>
                ) : periodsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-secondary">
                      No timetable periods configured yet. Click "Add Timetable Period" above to get started.
                    </td>
                  </tr>
                ) : (
                  periodsList.map((period, index) => {
                    const regDuration = calculateDurationMinutes(period.regularStart, period.regularEnd);
                    const friDuration = calculateDurationMinutes(period.fridayStart, period.fridayEnd);
                    const isBreak = period.type === 'Break' || period.type === 'Lunch';
                    const isBookable = period.isBookable !== false;

                    return (
                      <tr key={period.id} className={isBreak ? 'row-break-period' : ''}>
                        {/* Sequence & Move */}
                        <td style={{ textAlign: 'center' }}>
                          <div className="period-seq-controls">
                            <span className="period-seq-badge">#{index + 1}</span>
                            <div className="seq-arrow-buttons">
                              <button 
                                type="button"
                                className="seq-arrow-btn"
                                onClick={() => handleMovePeriod(index, 'up')}
                                disabled={index === 0}
                                title="Move earlier in day"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button 
                                type="button"
                                className="seq-arrow-btn"
                                onClick={() => handleMovePeriod(index, 'down')}
                                disabled={index === periodsList.length - 1}
                                title="Move later in day"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Name */}
                        <td>
                          <div className="period-title-cell">
                            <strong>{period.name}</strong>
                          </div>
                        </td>

                        {/* Classification */}
                        <td>
                          <span className={`period-type-badge type-${(period.type || 'lesson').toLowerCase()}`}>
                            {period.type || 'Lesson'}
                          </span>
                        </td>

                        {/* Regular Times */}
                        <td>
                          <div className="time-display-cell">
                            <span className="time-range">{period.regularStart} – {period.regularEnd}</span>
                            {regDuration && <span className="time-duration-chip">{regDuration}</span>}
                          </div>
                        </td>

                        {/* Friday Times */}
                        <td>
                          <div className="time-display-cell">
                            <span className="time-range">{period.fridayStart} – {period.fridayEnd}</span>
                            {friDuration && <span className="time-duration-chip fri-chip">{friDuration}</span>}
                          </div>
                        </td>

                        {/* Bookability */}
                        <td>
                          <span className={`bookable-status-tag ${isBookable ? 'tag-bookable' : 'tag-unbookable'}`}>
                            {isBookable ? '🟢 Bookable' : '🔒 Restricted / Break'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="period-row-actions">
                            <button 
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleEditPeriodClick(period)}
                              title="Edit timetable period timings & definition"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button 
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setPeriodToDelete(period)}
                              title="Delete period"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 4: UTILIZATION STATS */}
      {activeSubTab === 'analytics' && (
        <section className="admin-section">
          <div className="stats-kpi-grid">
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Total School Spaces</span>
              <span className="kpi-value text-brand">{stats?.totalRooms || rooms.length}</span>
              <span className="kpi-sub">Registered across all buildings</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Bookable Classrooms</span>
              <span className="kpi-value text-success">{stats?.bookableRooms || totalBookableCount}</span>
              <span className="kpi-sub">Available for teaching & events</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Unbookable / Staff Offices</span>
              <span className="kpi-value text-muted">{stats?.unbookableRooms || totalUnbookableCount}</span>
              <span className="kpi-sub">Offices, prep rooms & stores</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Rooms in Maintenance</span>
              <span className="kpi-value text-warning">{stats?.roomsInMaintenance || maintenanceList.length}</span>
              <span className="kpi-sub">Currently closed</span>
            </div>
            <div className="kpi-card glass-panel">
              <span className="kpi-label">Bookings Today</span>
              <span className="kpi-value text-primary font-bold">{stats?.bookingsToday || 0}</span>
              <span className="kpi-sub">Active today</span>
            </div>
          </div>

          <div className="stats-detail-grid">
            <div className="stats-panel glass-panel">
              <h3>Busiest Classrooms</h3>
              <p className="text-secondary text-sm mb-3">Rooms with highest booking frequencies.</p>
              {stats?.popularRooms?.length > 0 ? (
                <div className="popular-rooms-list">
                  {stats.popularRooms.map((r, i) => (
                    <div key={r.roomId} className="popular-room-item">
                      <span className="rank-badge">{i + 1}</span>
                      <div className="popular-room-info">
                        <strong>{r.name}</strong>
                        <span className="text-secondary text-xs">Code: {r.roomId}</span>
                      </div>
                      <span className="booking-badge">{r.bookingsCount} booking(s)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No historical bookings yet to compile rankings.</p>
              )}
            </div>

            <div className="stats-panel glass-panel">
              <h3>School Bell Schedule Timetable</h3>
              <p className="text-secondary text-sm mb-3">Automatic Friday timetable offset detection enabled.</p>
              <div className="timetable-preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Mon - Thu</th>
                      <th>Friday (Adjusted)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(p => {
                      const regularTime = getPeriodTimes('2026-10-26', p);
                      const fridayTime = getPeriodTimes('2026-10-30', p);
                      return (
                        <tr key={p}>
                          <td className="font-semibold">{p}</td>
                          <td>{regularTime.timeDisplay}</td>
                          <td>{fridayTime.timeDisplay}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Set Room Unbookable Reason Modal */}
      {showBookableModal && roomToModifyBookable && (
        <div className="modal-overlay" onClick={() => setShowBookableModal(false)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="room-modal-id">{roomToModifyBookable.id}</span>
                <h3>Set Room as Unbookable</h3>
              </div>
              <button className="close-btn" onClick={() => setShowBookableModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p className="text-secondary text-sm">
                Marking <strong>{roomToModifyBookable.name}</strong> as unbookable prevents general staff from reserving this space on the timetable.
              </p>

              <div className="form-group">
                <label>Reason / Designation</label>
                <select 
                  value={unbookableReasonInput}
                  onChange={(e) => setUnbookableReasonInput(e.target.value)}
                  className="admin-select"
                >
                  <option value="Senior Leadership Office">Senior Leadership Office</option>
                  <option value="Department Head / Staff Office">Department Head / Staff Office</option>
                  <option value="Staff Common Room">Staff Common Room</option>
                  <option value="Technician Prep Room">Technician Prep Room</option>
                  <option value="JCQ Secure Exam Store">JCQ Secure Exam Store</option>
                  <option value="Central IT Server Infrastructure">Central IT Server Infrastructure</option>
                  <option value="Permanent Pastoral Care Hub">Permanent Pastoral Care Hub</option>
                  <option value="Department Storage">Department Storage</option>
                  <option value="Custom Reason">Custom Reason (Enter Below)</option>
                </select>
              </div>

              {unbookableReasonInput === 'Custom Reason' && (
                <div className="form-group">
                  <label>Specify Custom Reason</label>
                  <input 
                    type="text"
                    placeholder="e.g. Dedicated Music Technician Room..."
                    onChange={(e) => setUnbookableReasonInput(e.target.value)}
                    className="admin-input"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowBookableModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleSaveBookableStatus(roomToModifyBookable.id, false, unbookableReasonInput)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Set as Unbookable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Flag Classroom for Maintenance / Closure</h3>
              <button className="close-btn" onClick={() => setShowMaintenanceModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="form-group">
                <label>Select Classroom</label>
                <select 
                  value={selectedRoomForMaint} 
                  onChange={(e) => setSelectedRoomForMaint(e.target.value)}
                  className="admin-select"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.id} - {r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category of Closure</label>
                <select 
                  value={maintCategory}
                  onChange={(e) => setMaintCategory(e.target.value)}
                  className="admin-select"
                >
                  <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                  <option value="Health & Safety / Hazard">Health & Safety / Hazard</option>
                  <option value="Exam Hall Setup">Exam Hall Setup</option>
                  <option value="Deep Clean / Sanitization">Deep Clean / Sanitization</option>
                  <option value="Internal School Event">Internal School Event</option>
                  <option value="Refurbishment">Refurbishment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reason / Work Order Notes</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Interactive screen backlight flickering, contractor on site..."
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="admin-textarea"
                />
              </div>

              <div className="form-group">
                <label>Estimated Reopen Date (Optional)</label>
                <input 
                  type="date"
                  value={maintEstCompletion}
                  onChange={(e) => setMaintEstCompletion(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowMaintenanceModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleSaveMaintenance(selectedRoomForMaint, false)}
                disabled={isProcessing || !maintReason.trim()}
              >
                {isProcessing ? 'Saving...' : 'Set Out of Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Attributes Modal */}
      {editingRoom && (
        <div className="modal-overlay" onClick={() => setEditingRoom(null)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Room Attributes</h3>
                <p className="text-secondary text-xs">Update specifications, capacity, block, floor and policies for <strong>{editingRoom.id}</strong></p>
              </div>
              <button className="close-btn" onClick={() => setEditingRoom(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoomSubmit}>
              <div className="admin-modal-body">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Room Code / Identifier</label>
                    <input 
                      type="text" 
                      value={editingRoom.id}
                      className="admin-input readonly-input"
                      disabled
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Seating / Max Capacity</label>
                    <input 
                      type="number" 
                      min="1"
                      max="500"
                      value={editRoomData.capacity}
                      onChange={(e) => setEditRoomData({ ...editRoomData, capacity: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Room Full Name / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Room K1 - Music Suite"
                    value={editRoomData.name}
                    onChange={(e) => setEditRoomData({ ...editRoomData, name: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Building Block</label>
                    <select 
                      value={editRoomData.block}
                      onChange={(e) => setEditRoomData({ ...editRoomData, block: e.target.value })}
                      className="admin-select"
                    >
                      {ROOM_BLOCKS.filter(b => b !== 'All Buildings').map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label>Floor Level</label>
                    <select 
                      value={editRoomData.floor}
                      onChange={(e) => setEditRoomData({ ...editRoomData, floor: e.target.value })}
                      className="admin-select"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="First Floor">First Floor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Room Category / Type</label>
                  <select 
                    value={editRoomData.type}
                    onChange={(e) => setEditRoomData({ ...editRoomData, type: e.target.value })}
                    className="admin-select"
                  >
                    {ROOM_TYPES.filter(t => t !== 'All Types').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Facilities & Equipment (comma-separated)</label>
                  <input 
                    type="text"
                    value={editRoomData.facilitiesText}
                    onChange={(e) => setEditRoomData({ ...editRoomData, facilitiesText: e.target.value })}
                    className="admin-input"
                    placeholder="Interactive Whiteboard, Projector, Teacher PC, Sinks"
                  />
                  <div className="quick-facility-chips">
                    {['Interactive Whiteboard', 'Teacher PC', 'Projector', 'Sinks', 'Gas Taps', 'Fume Cupboard', 'Piano', '3D Printers'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        className="chip-btn"
                        onClick={() => {
                          const current = editRoomData.facilitiesText.split(',').map(s => s.trim()).filter(Boolean);
                          if (!current.includes(chip)) {
                            current.push(chip);
                            setEditRoomData({ ...editRoomData, facilitiesText: current.join(', ') });
                          }
                        }}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookable vs Unbookable Checkbox */}
                <div className="form-group">
                  <label className="checkbox-label-row">
                    <input 
                      type="checkbox"
                      checked={editRoomData.isBookable}
                      onChange={(e) => setEditRoomData({ ...editRoomData, isBookable: e.target.checked })}
                    />
                    <span>Available for general staff booking (Bookable Room)</span>
                  </label>
                </div>

                {!editRoomData.isBookable && (
                  <div className="form-group">
                    <label>Reason / Designation for Unbookable Status</label>
                    <input 
                      type="text"
                      placeholder="e.g. Senior Leadership Office, Prep Room, Staff Only..."
                      value={editRoomData.unbookableReason}
                      onChange={(e) => setEditRoomData({ ...editRoomData, unbookableReason: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingRoom(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Saving Changes...' : 'Save Room Attributes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Room Modal */}
      {showAddRoomModal && (
        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Classroom / School Space</h3>
              <button className="close-btn" onClick={() => setShowAddRoomModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit}>
              <div className="admin-modal-body">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Room Code / ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MFL4, LAB7, ART4"
                      value={newRoomData.id}
                      onChange={(e) => setNewRoomData({ ...newRoomData, id: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Seating Capacity</label>
                    <input 
                      type="number" 
                      min="1"
                      max="500"
                      value={newRoomData.capacity}
                      onChange={(e) => setNewRoomData({ ...newRoomData, capacity: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Room Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Room MFL 4 - Modern Languages"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Building Block</label>
                    <select 
                      value={newRoomData.block}
                      onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                      className="admin-select"
                    >
                      {ROOM_BLOCKS.filter(b => b !== 'All Buildings').map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label>Floor</label>
                    <select 
                      value={newRoomData.floor}
                      onChange={(e) => setNewRoomData({ ...newRoomData, floor: e.target.value })}
                      className="admin-select"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="First Floor">First Floor</option>
                      <option value="Second Floor">Second Floor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Room Type</label>
                  <select 
                    value={newRoomData.type}
                    onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value })}
                    className="admin-select"
                  >
                    {ROOM_TYPES.filter(t => t !== 'All Types').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Facilities (comma separated)</label>
                  <input 
                    type="text"
                    value={newRoomData.facilitiesText}
                    onChange={(e) => setNewRoomData({ ...newRoomData, facilitiesText: e.target.value })}
                    className="admin-input"
                    placeholder="Interactive Whiteboard, Projector, Sinks"
                  />
                </div>

                {/* Bookable vs Unbookable Checkbox */}
                <div className="form-group">
                  <label className="checkbox-label-row">
                    <input 
                      type="checkbox"
                      checked={newRoomData.isBookable}
                      onChange={(e) => setNewRoomData({ ...newRoomData, isBookable: e.target.checked })}
                    />
                    <span>Available for general staff booking (Bookable Room)</span>
                  </label>
                </div>

                {!newRoomData.isBookable && (
                  <div className="form-group">
                    <label>Reason for Unbookable Status</label>
                    <input 
                      type="text"
                      placeholder="e.g. Senior Leadership Office, Prep Room, Staff Only..."
                      value={newRoomData.unbookableReason}
                      onChange={(e) => setNewRoomData({ ...newRoomData, unbookableReason: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddRoomModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Registering...' : 'Save Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="confirmation-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap text-danger">
              <AlertTriangle size={36} />
            </div>
            <h3>Administrator Cancellation Override</h3>
            <p>
              Are you sure you want to cancel the booking for <strong>{cancelTarget.roomName}</strong> booked by <strong>{cancelTarget.bookedBy}</strong> on <strong>{cancelTarget.date}</strong> ({cancelTarget.period})?
            </p>
            <div className="confirmation-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setCancelTarget(null)}
                disabled={isProcessing}
              >
                Keep Booking
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmCancel}
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PERIOD MODAL */}
      {showAddPeriodModal && (
        <div className="modal-overlay" onClick={() => setShowAddPeriodModal(false)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Timetable Period</h3>
                <p className="text-secondary text-xs">Create a new lesson block, break, or registration interval</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddPeriodModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPeriodSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Period Name *</label>
                  <input 
                    type="text" 
                    value={newPeriodData.name}
                    onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                    placeholder="e.g. Period 7, Form Time, Twilight / After-School"
                    className="admin-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Period Classification Type</label>
                  <select 
                    value={newPeriodData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const isBreak = newType === 'Break' || newType === 'Lunch';
                      setNewPeriodData({ 
                        ...newPeriodData, 
                        type: newType,
                        isBookable: !isBreak
                      });
                    }}
                    className="admin-select"
                  >
                    <option value="Lesson">Lesson (Classroom Teaching)</option>
                    <option value="Break">Break (Morning Recess / Interval)</option>
                    <option value="Lunch">Lunch (Midday Break)</option>
                    <option value="Registration">Registration / Form Tutor Time</option>
                    <option value="Extracurricular">Extracurricular / After-School Club</option>
                  </select>
                </div>

                <div className="schedule-time-box">
                  <h4 className="schedule-time-header">Mon – Thu Regular Timing</h4>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Start Time</label>
                      <input 
                        type="time" 
                        value={newPeriodData.regularStart}
                        onChange={(e) => setNewPeriodData({ ...newPeriodData, regularStart: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>End Time</label>
                      <input 
                        type="time" 
                        value={newPeriodData.regularEnd}
                        onChange={(e) => setNewPeriodData({ ...newPeriodData, regularEnd: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="schedule-time-box">
                  <div className="schedule-time-header-row">
                    <h4 className="schedule-time-header">Friday Timing</h4>
                    <button 
                      type="button" 
                      className="chip-btn"
                      onClick={() => setNewPeriodData({
                        ...newPeriodData,
                        fridayStart: newPeriodData.regularStart,
                        fridayEnd: newPeriodData.regularEnd
                      })}
                    >
                      Copy Mon–Thu Times
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Friday Start Time</label>
                      <input 
                        type="time" 
                        value={newPeriodData.fridayStart}
                        onChange={(e) => setNewPeriodData({ ...newPeriodData, fridayStart: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Friday End Time</label>
                      <input 
                        type="time" 
                        value={newPeriodData.fridayEnd}
                        onChange={(e) => setNewPeriodData({ ...newPeriodData, fridayEnd: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label-row">
                    <input 
                      type="checkbox" 
                      checked={newPeriodData.isBookable}
                      onChange={(e) => setNewPeriodData({ ...newPeriodData, isBookable: e.target.checked })}
                    />
                    <span>Allow staff room bookings during this period</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddPeriodModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Adding...' : 'Add Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERIOD MODAL */}
      {editingPeriod && (
        <div className="modal-overlay" onClick={() => setEditingPeriod(null)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Timetable Period</h3>
                <p className="text-secondary text-xs">Update timings and definition for <strong>{editingPeriod.name}</strong></p>
              </div>
              <button className="close-btn" onClick={() => setEditingPeriod(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePeriodSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Period Name *</label>
                  <input 
                    type="text" 
                    value={editPeriodData.name}
                    onChange={(e) => setEditPeriodData({ ...editPeriodData, name: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Period Classification Type</label>
                  <select 
                    value={editPeriodData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const isBreak = newType === 'Break' || newType === 'Lunch';
                      setEditPeriodData({ 
                        ...editPeriodData, 
                        type: newType,
                        isBookable: !isBreak
                      });
                    }}
                    className="admin-select"
                  >
                    <option value="Lesson">Lesson (Classroom Teaching)</option>
                    <option value="Break">Break (Morning Recess / Interval)</option>
                    <option value="Lunch">Lunch (Midday Break)</option>
                    <option value="Registration">Registration / Form Tutor Time</option>
                    <option value="Extracurricular">Extracurricular / After-School Club</option>
                  </select>
                </div>

                <div className="schedule-time-box">
                  <h4 className="schedule-time-header">Mon – Thu Regular Timing</h4>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Start Time</label>
                      <input 
                        type="time" 
                        value={editPeriodData.regularStart}
                        onChange={(e) => setEditPeriodData({ ...editPeriodData, regularStart: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>End Time</label>
                      <input 
                        type="time" 
                        value={editPeriodData.regularEnd}
                        onChange={(e) => setEditPeriodData({ ...editPeriodData, regularEnd: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="schedule-time-box">
                  <div className="schedule-time-header-row">
                    <h4 className="schedule-time-header">Friday Timing</h4>
                    <button 
                      type="button" 
                      className="chip-btn"
                      onClick={() => setEditPeriodData({
                        ...editPeriodData,
                        fridayStart: editPeriodData.regularStart,
                        fridayEnd: editPeriodData.regularEnd
                      })}
                    >
                      Copy Mon–Thu Times
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Friday Start Time</label>
                      <input 
                        type="time" 
                        value={editPeriodData.fridayStart}
                        onChange={(e) => setEditPeriodData({ ...editPeriodData, fridayStart: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Friday End Time</label>
                      <input 
                        type="time" 
                        value={editPeriodData.fridayEnd}
                        onChange={(e) => setEditPeriodData({ ...editPeriodData, fridayEnd: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label-row">
                    <input 
                      type="checkbox" 
                      checked={editPeriodData.isBookable}
                      onChange={(e) => setEditPeriodData({ ...editPeriodData, isBookable: e.target.checked })}
                    />
                    <span>Allow staff room bookings during this period</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingPeriod(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PERIOD CONFIRMATION MODAL */}
      {periodToDelete && (
        <div className="modal-overlay" onClick={() => setPeriodToDelete(null)}>
          <div className="admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Remove Timetable Period</h3>
                <p className="text-secondary text-xs">Confirm deletion of timetable block</p>
              </div>
              <button className="close-btn" onClick={() => setPeriodToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="confirm-delete-box">
                <AlertTriangle size={24} className="text-danger" />
                <div>
                  <p>Are you sure you want to delete <strong>{periodToDelete.name}</strong> from the school timetable?</p>
                  <p className="text-secondary text-xs mt-1">This will remove this period from the active schedule and room booking options.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setPeriodToDelete(null)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeletePeriodConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Period'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
