// src/components/MyBookings/MyBookings.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Download, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Layers, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { getUserBookings, cancelBooking, cancelBookingGroup } from '../../services/BookingService';
import { getPeriodTimes } from '../../constants';
import './MyBookings.css';

const MyBookings = ({ userName = 'Current User' }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelGroupTarget, setCancelGroupTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      showToast('Could not fetch bookings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [userName]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Group bookings by date and period
  const groupedBookings = useMemo(() => {
    const groups = {};
    bookings.forEach(b => {
      const key = `${b.date}_${b.period}`;
      if (!groups[key]) {
        groups[key] = {
          date: b.date,
          period: b.period,
          isUpcoming: b.date >= todayStr,
          rooms: []
        };
      }
      groups[key].rooms.push(b);
    });

    const list = Object.values(groups);
    // Sort descending by date
    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [bookings, todayStr]);

  const filteredGroups = useMemo(() => {
    if (activeTab === 'upcoming') {
      return groupedBookings.filter(g => g.isUpcoming);
    }
    if (activeTab === 'past') {
      return groupedBookings.filter(g => !g.isUpcoming);
    }
    return groupedBookings;
  }, [groupedBookings, activeTab]);

  // Cancel single room
  const handleConfirmCancelSingle = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      await cancelBooking(cancelTarget.id);
      showToast(`Cancelled booking for ${cancelTarget.roomName}.`, 'success');
      setCancelTarget(null);
      await loadBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel group
  const handleConfirmCancelGroup = async () => {
    if (!cancelGroupTarget) return;
    setIsProcessing(true);
    try {
      await cancelBookingGroup(cancelGroupTarget.date, cancelGroupTarget.period);
      showToast(`Cancelled all bookings for ${cancelGroupTarget.period} on ${cancelGroupTarget.date}.`, 'success');
      setCancelGroupTarget(null);
      await loadBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel session bookings.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download .ics Calendar File
  const handleDownloadIcs = (group) => {
    const { startDateTime, endDateTime, timeDisplay } = getPeriodTimes(group.date, group.period);
    const roomList = group.rooms.map(r => r.roomName || r.roomId).join(', ');
    const purposes = group.rooms.map(r => r.purpose).filter(Boolean).join('; ') || 'TRSW Classroom Session';

    const formatIcsDate = (isoStr) => (isoStr || '').replace(/[-:]/g, '');
    const dtStart = formatIcsDate(startDateTime);
    const dtEnd = formatIcsDate(endDateTime);
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const summary = `Classroom Booking: ${roomList} (${group.period})`;
    const description = `TRSW Room Booking\\nRooms: ${roomList}\\nPeriod: ${group.period} (${timeDisplay})\\nDate: ${group.date}\\nPurpose: ${purposes}`;

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TRSW Room Booker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:trsw-${group.date}-${group.period.replace(/\s+/g, '')}-${Date.now()}@trsw`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${roomList}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trsw_booking_${group.date}_${group.period.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Outlook / Apple Calendar .ics file!', 'success');
  };

  return (
    <div className="my-bookings-container">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header Metrics */}
      <section className="my-bookings-header glass-panel">
        <div className="header-info">
          <h2>My Classroom Reservations</h2>
          <p className="text-secondary">
            Manage your booked classrooms, cancel sessions, or add appointments to your Outlook calendar.
          </p>
        </div>

        <div className="metrics-row">
          <div className="metric-box">
            <span className="metric-number">{bookings.length}</span>
            <span className="metric-label">Total Rooms</span>
          </div>
          <div className="metric-box">
            <span className="metric-number text-brand">
              {groupedBookings.filter(g => g.isUpcoming).length}
            </span>
            <span className="metric-label">Upcoming Sessions</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="tabs-bar">
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Sessions ({groupedBookings.filter(g => g.isUpcoming).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Sessions ({groupedBookings.filter(g => !g.isUpcoming).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Bookings ({groupedBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <section className="bookings-list-section">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your reservations...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="empty-state glass-panel">
            <CalendarCheck size={40} className="text-muted mb-2" />
            <h3>No reservations found</h3>
            <p className="text-secondary">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming classroom bookings scheduled."
                : "No past bookings recorded for your profile."}
            </p>
          </div>
        ) : (
          <div className="groups-list">
            {filteredGroups.map(group => {
              const { timeDisplay } = getPeriodTimes(group.date, group.period);
              return (
                <div key={`${group.date}_${group.period}`} className="session-group-card glass-panel">
                  <div className="session-header">
                    <div className="session-meta">
                      <div className="session-date-badge">
                        <CalendarIcon size={16} />
                        <span>{group.date}</span>
                      </div>
                      <div className="session-period-badge">
                        <Clock size={15} />
                        <span>{group.period} ({timeDisplay})</span>
                      </div>
                      {group.isUpcoming ? (
                        <span className="badge badge-success">Upcoming</span>
                      ) : (
                        <span className="badge badge-past">Completed</span>
                      )}
                    </div>

                    <div className="session-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadIcs(group)}
                        title="Download .ics for Outlook or Google Calendar"
                      >
                        <Download size={14} />
                        <span>Add to Calendar</span>
                      </button>

                      {group.isUpcoming && group.rooms.length > 1 && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => setCancelGroupTarget(group)}
                          title="Cancel all rooms for this session"
                        >
                          <Trash2 size={14} />
                          <span>Cancel All Rooms</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rooms-in-session-grid">
                    {group.rooms.map(roomBooking => (
                      <div key={roomBooking.id} className="room-subcard">
                        <div className="room-subcard-left">
                          <div className="room-code-tag">
                            {roomBooking.roomId}
                          </div>
                          <div className="room-details-text">
                            <h4>{roomBooking.roomName}</h4>
                            {roomBooking.block && (
                              <p className="room-block-sub">
                                <MapPin size={12} />
                                <span>{roomBooking.block}</span>
                              </p>
                            )}
                            <p className="room-purpose-sub">
                              <strong>Purpose:</strong> {roomBooking.purpose || 'General lesson'}
                            </p>
                          </div>
                        </div>

                        {group.isUpcoming && (
                          <button 
                            className="btn-cancel-single"
                            onClick={() => setCancelTarget(roomBooking)}
                            title="Cancel this single room"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cancel Single Room Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="confirmation-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap text-danger">
              <AlertCircle size={36} />
            </div>
            <h3>Cancel Classroom Booking?</h3>
            <p>
              Are you sure you want to cancel the reservation for <strong>{cancelTarget.roomName}</strong> on <strong>{cancelTarget.date}</strong> ({cancelTarget.period})?
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
                onClick={handleConfirmCancelSingle}
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Group Modal */}
      {cancelGroupTarget && (
        <div className="modal-overlay" onClick={() => setCancelGroupTarget(null)}>
          <div className="confirmation-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap text-danger">
              <AlertCircle size={36} />
            </div>
            <h3>Cancel Entire Session?</h3>
            <p>
              This will cancel all <strong>{cancelGroupTarget.rooms.length} classroom reservations</strong> for {cancelGroupTarget.period} on {cancelGroupTarget.date}.
            </p>
            <div className="confirmation-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setCancelGroupTarget(null)}
                disabled={isProcessing}
              >
                Go Back
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmCancelGroup}
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Cancel All Rooms'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
