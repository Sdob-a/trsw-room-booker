// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Users, 
  Wrench, 
  Check, 
  Info, 
  Plus, 
  X, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layers,
  Monitor,
  Flame,
  Music,
  Palette,
  Briefcase,
  LayoutGrid
} from 'lucide-react';
import PeriodSelector from '../PeriodSelector/PeriodSelector';
import FloorPlanView from '../FloorPlanView/FloorPlanView';
import { PERIODS, ROOM_BLOCKS, ROOM_TYPES, getPeriodTimes } from '../../constants';
import { 
  getRooms, 
  getBookingsForDateAndPeriod, 
  bookRooms, 
  getMaintenanceRooms,
  getPeriods
} from '../../services/BookingService';
import './Dashboard.css';

const Dashboard = ({ userName = 'Current User' }) => {
  // Date & Period state
  const getInitialDate = () => {
    const d = new Date();
    // If weekend, advance to Monday
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);

  // View state: 'floorplan' (architectural blueprint view) or 'grid' (directory list)
  const [viewMode, setViewMode] = useState('floorplan');
  const [activeBuildingId, setActiveBuildingId] = useState('kensington');

  // Data state
  const [rooms, setRooms] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [bookingPurpose, setBookingPurpose] = useState('');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All Buildings');
  const [selectedType, setSelectedType] = useState('All Types');
  const [inspectRoom, setInspectRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load of rooms, maintenance, and timetable periods
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [roomsData, maintData, periodsData] = await Promise.all([
          getRooms(),
          getMaintenanceRooms(),
          getPeriods()
        ]);
        setRooms(roomsData);
        setMaintenanceList(maintData);
        if (periodsData && periodsData.length > 0) {
          setPeriodsList(periodsData);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitial();
  }, []);

  const activePeriodNames = useMemo(() => {
    if (periodsList.length > 0) {
      return periodsList.map(p => p.name);
    }
    return PERIODS;
  }, [periodsList]);

  // Fetch bookings whenever Date or Period changes
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getBookingsForDateAndPeriod(selectedDate, selectedPeriod);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setSelectedRoomIds([]);
  }, [selectedDate, selectedPeriod]);

  // Maps for fast lookup
  const bookingsMap = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      map[b.roomId] = b;
    });
    return map;
  }, [bookings]);

  const maintenanceMap = useMemo(() => {
    const map = {};
    maintenanceList.forEach(m => {
      map[m.roomId] = m;
    });
    return map;
  }, [maintenanceList]);

  // Filtered rooms for grid view
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (selectedBlock !== 'All Buildings' && room.block !== selectedBlock) {
        return false;
      }
      if (selectedType !== 'All Types' && room.type !== selectedType) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesId = room.id.toLowerCase().includes(q);
        const matchesFacility = room.facilities?.some(f => f.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesFacility) return false;
      }
      return true;
    });
  }, [rooms, selectedBlock, selectedType, searchTerm]);

  // Statistics for current view
  const stats = useMemo(() => {
    let availableCount = 0;
    let bookedCount = 0;
    let maintenanceCount = 0;

    rooms.forEach(r => {
      if (maintenanceMap[r.id]) {
        maintenanceCount++;
      } else if (bookingsMap[r.id]) {
        bookedCount++;
      } else {
        availableCount++;
      }
    });

    return { total: rooms.length, availableCount, bookedCount, maintenanceCount };
  }, [rooms, bookingsMap, maintenanceMap]);

  // Date step helper
  const handleStepDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    // Skip weekends if navigating
    if (current.getDay() === 0) current.setDate(current.getDate() + (days > 0 ? 1 : -2));
    if (current.getDay() === 6) current.setDate(current.getDate() + (days > 0 ? 2 : -1));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Selection toggle
  const handleToggleRoom = (roomId) => {
    if (bookingsMap[roomId] || maintenanceMap[roomId]) return;

    setSelectedRoomIds(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId) 
        : [...prev, roomId]
    );
  };

  const handleSelectAllAvailable = () => {
    const availableFilteredIds = filteredRooms
      .filter(r => !bookingsMap[r.id] && !maintenanceMap[r.id])
      .map(r => r.id);

    const isAllSelected = availableFilteredIds.length > 0 && availableFilteredIds.every(id => selectedRoomIds.includes(id));
    if (isAllSelected) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(availableFilteredIds);
    }
  };

  // Booking submit
  const handleBookSelected = async (e) => {
    e.preventDefault();
    if (selectedRoomIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await bookRooms(
        selectedDate, 
        selectedPeriod, 
        selectedRoomIds, 
        bookingPurpose || 'General Classroom Booking'
      );
      showToast(res.message || `Successfully booked ${selectedRoomIds.length} classroom(s)!`, 'success');
      setSelectedRoomIds([]);
      setBookingPurpose('');
      await fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to complete booking.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'Science Lab':
        return <Flame size={16} />;
      case 'IT Computer Suite':
        return <Monitor size={16} />;
      case 'Music & Audio':
        return <Music size={16} />;
      case 'Art & Design':
        return <Palette size={16} />;
      case 'Meeting / Conference':
      case 'Assembly Hall':
        return <Briefcase size={16} />;
      default:
        return <Layers size={16} />;
    }
  };

  const { timeDisplay } = getPeriodTimes(selectedDate, selectedPeriod, periodsList);

  return (
    <div className="dashboard-container">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Top Filter and Controls Bar */}
      <section className="dashboard-controls-card glass-panel">
        <div className="controls-row-top">
          {/* Date Picker Section */}
          <div className="control-date-box">
            <label className="control-label">
              <CalendarIcon size={16} className="text-brand" />
              <span>Timetable Date</span>
            </label>
            <div className="date-input-group">
              <button 
                type="button" 
                className="date-nav-btn" 
                onClick={() => handleStepDate(-1)} 
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <input 
                type="date" 
                className="date-input" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button 
                type="button" 
                className="date-nav-btn" 
                onClick={() => handleStepDate(1)} 
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                type="button" 
                className="today-btn" 
                onClick={() => setSelectedDate(getInitialDate())}
              >
                Today
              </button>
            </div>
          </div>

          {/* Quick Period Selector */}
          <div className="control-period-box">
            <div className="period-header-line">
              <label className="control-label">
                <span>Timetable Period:</span>
                <strong className="text-brand ml-1">{selectedPeriod}</strong>
                <span className="period-time-badge">{timeDisplay}</span>
              </label>
            </div>
            <PeriodSelector 
              periods={activePeriodNames} 
              periodsList={periodsList}
              selectedPeriod={selectedPeriod} 
              selectedDate={selectedDate} 
              onSelect={setSelectedPeriod} 
            />
          </div>
        </div>

        {/* Filter and Search Bar (Active in Grid View or Global) */}
        <div className="controls-row-bottom">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search room (e.g. K1 Music, K6 Science, H3, Hall)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-dropdowns">
            <div className="filter-group">
              <Filter size={14} className="text-muted" />
              <select 
                value={selectedBlock} 
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  if (e.target.value === 'Kensington Building') setActiveBuildingId('kensington');
                  else if (e.target.value === 'Holyrood Building') setActiveBuildingId('holyrood');
                  else if (e.target.value === 'Upper School & Venues') setActiveBuildingId('upper-school');
                }}
                className="filter-select"
              >
                {ROOM_BLOCKS.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Layers size={14} className="text-muted" />
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                {ROOM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Utilization & View Switcher Bar */}
      <section className="summary-status-bar">
        <div className="status-pills">
          <div className="status-pill status-pill-available">
            <span className="status-dot green"></span>
            <span>{stats.availableCount} Available</span>
          </div>
          <div className="status-pill status-pill-booked">
            <span className="status-dot red"></span>
            <span>{stats.bookedCount} Booked</span>
          </div>
          <div className="status-pill status-pill-maintenance">
            <span className="status-dot orange"></span>
            <span>{stats.maintenanceCount} Under Maintenance</span>
          </div>
        </div>

        <div className="view-mode-controls">
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'floorplan' ? 'active' : ''}`}
              onClick={() => setViewMode('floorplan')}
            >
              <MapPin size={15} />
              <span>Floor Plan View</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} />
              <span>Directory Grid</span>
            </button>
          </div>

          {viewMode === 'grid' && (
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={handleSelectAllAvailable}
              title="Select all currently free rooms shown"
            >
              <Sparkles size={14} />
              Select All Free
            </button>
          )}
        </div>
      </section>

      {/* Main View Area: Floor Plan or Grid */}
      {viewMode === 'floorplan' ? (
        <FloorPlanView
          rooms={rooms}
          bookingsMap={bookingsMap}
          maintenanceMap={maintenanceMap}
          selectedRoomIds={selectedRoomIds}
          onToggleRoom={handleToggleRoom}
          onInspectRoom={(room) => setInspectRoom(room)}
          activeBuildingId={activeBuildingId}
          onChangeBuilding={(bId) => {
            setActiveBuildingId(bId);
            if (bId === 'kensington') setSelectedBlock('Kensington Building');
            else if (bId === 'holyrood') setSelectedBlock('Holyrood Building');
            else if (bId === 'upper-school') setSelectedBlock('Upper School & Venues');
          }}
        />
      ) : (
        <section className="classroom-grid-section">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading classroom availability for {selectedPeriod}...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="empty-state glass-panel">
              <Info size={36} className="text-muted mb-2" />
              <h3>No classrooms match your search</h3>
              <p className="text-secondary">Try adjusting your search terms, building filter, or room type.</p>
              <button 
                className="btn btn-outline mt-3" 
                onClick={() => { setSearchTerm(''); setSelectedBlock('All Buildings'); setSelectedType('All Types'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="classroom-grid">
              {filteredRooms.map(room => {
                const booking = bookingsMap[room.id];
                const maintenance = maintenanceMap[room.id];
                const isSelected = selectedRoomIds.includes(room.id);
                const isBooked = !!booking;
                const isMaintenance = !!maintenance;

                let cardStatusClass = 'available';
                if (isSelected) cardStatusClass = 'selected';
                else if (isMaintenance) cardStatusClass = 'maintenance';
                else if (isBooked) cardStatusClass = 'booked';

                return (
                  <div 
                    key={room.id}
                    className={`room-card ${cardStatusClass}`}
                    onClick={() => handleToggleRoom(room.id)}
                  >
                    <div className="room-card-header">
                      <div className="room-id-badge">
                        {getRoomIcon(room.type)}
                        <span>{room.id}</span>
                      </div>

                      <div className="room-header-meta">
                        <span className="capacity-badge" title={`Capacity: ${room.capacity} people`}>
                          <Users size={12} />
                          {room.capacity}
                        </span>
                        <button 
                          type="button" 
                          className="info-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectRoom(room);
                          }}
                          title="View Room Specifications"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="room-card-body">
                      <h4 className="room-name">{room.name}</h4>
                      <div className="room-block-info">
                        <MapPin size={12} />
                        <span>{room.floor} • {room.block}</span>
                      </div>

                      <div className="facilities-chips">
                        {(room.facilities || []).slice(0, 3).map((fac, idx) => (
                          <span key={idx} className="facility-chip">{fac}</span>
                        ))}
                        {(room.facilities || []).length > 3 && (
                          <span className="facility-chip-more">+{room.facilities.length - 3}</span>
                        )}
                      </div>
                    </div>

                    <div className="room-card-footer">
                      {isMaintenance ? (
                        <div className="footer-status-pill maintenance-pill">
                          <Wrench size={13} />
                          <span>Maintenance: {maintenance.reason}</span>
                        </div>
                      ) : isBooked ? (
                        <div className="footer-status-pill booked-pill" title={`Booked by ${booking.bookedBy} (${booking.purpose || 'No details'})`}>
                          <div className="status-dot red"></div>
                          <span>Booked: <strong>{booking.bookedBy}</strong></span>
                        </div>
                      ) : isSelected ? (
                        <div className="footer-status-pill selected-pill">
                          <Check size={14} />
                          <span>Selected for Booking</span>
                        </div>
                      ) : (
                        <div className="footer-status-pill available-pill">
                          <Plus size={13} />
                          <span>Available • Click to Book</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Floating Booking Action Dock */}
      {selectedRoomIds.length > 0 && (
        <aside className="booking-dock glass-panel">
          <div className="dock-left">
            <div className="dock-count-badge">
              {selectedRoomIds.length}
            </div>
            <div className="dock-summary">
              <h4>
                {selectedRoomIds.length} Classroom{selectedRoomIds.length > 1 ? 's' : ''} Selected
              </h4>
              <p>
                {selectedDate} • {selectedPeriod} ({timeDisplay})
              </p>
            </div>
          </div>

          <form onSubmit={handleBookSelected} className="dock-form">
            <input 
              type="text" 
              placeholder="Lesson / Purpose note (e.g. Year 8 Science Titration, Music Rehearsal)..."
              value={bookingPurpose}
              onChange={(e) => setBookingPurpose(e.target.value)}
              className="dock-purpose-input"
            />
            <div className="dock-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setSelectedRoomIds([])}
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </aside>
      )}

      {/* Room Details Modal */}
      {inspectRoom && (
        <div className="modal-overlay" onClick={() => setInspectRoom(null)}>
          <div className="room-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="room-modal-id">{inspectRoom.id}</span>
                <h3>{inspectRoom.name}</h3>
              </div>
              <button className="close-btn" onClick={() => setInspectRoom(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="room-modal-content">
              <div className="modal-grid-details">
                <div className="detail-item">
                  <span className="detail-label">Location / Building</span>
                  <span className="detail-value">{inspectRoom.block} ({inspectRoom.floor})</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seating Capacity</span>
                  <span className="detail-value">{inspectRoom.capacity} students</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Room Type</span>
                  <span className="detail-value">{inspectRoom.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Period Status</span>
                  <span className="detail-value">
                    {maintenanceMap[inspectRoom.id] ? (
                      <span className="text-warning font-semibold">⚠️ Under Maintenance</span>
                    ) : bookingsMap[inspectRoom.id] ? (
                      <span className="text-danger font-semibold">🔴 Booked ({bookingsMap[inspectRoom.id].bookedBy})</span>
                    ) : (
                      <span className="text-success font-semibold">🟢 Available to Book</span>
                    )}
                  </span>
                </div>
              </div>

              {bookingsMap[inspectRoom.id] && (
                <div className="booking-info-box">
                  <h5>Current Booking Details ({selectedPeriod})</h5>
                  <p><strong>Booked By:</strong> {bookingsMap[inspectRoom.id].bookedBy}</p>
                  {bookingsMap[inspectRoom.id].bookedByEmail && (
                    <p><strong>Email:</strong> {bookingsMap[inspectRoom.id].bookedByEmail}</p>
                  )}
                  <p><strong>Purpose:</strong> {bookingsMap[inspectRoom.id].purpose || 'Classroom session'}</p>
                </div>
              )}

              {maintenanceMap[inspectRoom.id] && (
                <div className="maintenance-info-box">
                  <h5>⚠️ Maintenance Closure Notice</h5>
                  <p><strong>Reason:</strong> {maintenanceMap[inspectRoom.id].reason}</p>
                  <p><strong>Reported By:</strong> {maintenanceMap[inspectRoom.id].updatedBy}</p>
                  {maintenanceMap[inspectRoom.id].estimatedCompletion && (
                    <p><strong>Est. Completion:</strong> {maintenanceMap[inspectRoom.id].estimatedCompletion}</p>
                  )}
                </div>
              )}

              <div className="modal-facilities-section">
                <h5>Equipped Facilities & Resources</h5>
                <div className="facilities-tags-list">
                  {(inspectRoom.facilities || []).map((fac, idx) => (
                    <span key={idx} className="facility-tag-large">
                      <Check size={14} className="text-success mr-1" />
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setInspectRoom(null)}>
                Close
              </button>
              {!bookingsMap[inspectRoom.id] && !maintenanceMap[inspectRoom.id] && (
                <button 
                  className={`btn ${selectedRoomIds.includes(inspectRoom.id) ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => {
                    handleToggleRoom(inspectRoom.id);
                    setInspectRoom(null);
                  }}
                >
                  {selectedRoomIds.includes(inspectRoom.id) ? 'Remove Selection' : 'Select This Classroom'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
