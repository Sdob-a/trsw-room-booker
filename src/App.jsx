// src/App.jsx - TRSW Room Booker Main Component
import { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  User, 
  ShieldCheck, 
  LogOut, 
  Users, 
  X, 
  Check, 
  Sparkles,
  School
} from 'lucide-react';
import { getCurrentUser, setMockUser, getMockUser } from './services/BookingService';
import Dashboard from './components/Dashboard/Dashboard';
import MyBookings from './components/MyBookings/MyBookings';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import './App.css';

const DEFAULT_PROFILES = [
  { name: "Mr. Steve O'Brien", role: "Head of English / Teacher", email: "sobrien@school.edu", color: "#2563eb", admin: false },
  { name: "Dr. Emily Watson", role: "Science Department HOD", email: "ewatson@school.edu", color: "#059669", admin: false },
  { name: "Mr. David Patel", role: "Maths & Computing Teacher", email: "dpatel@school.edu", color: "#7c3aed", admin: false },
  { name: "Ms. Rachel Adams", role: "Cover Supervisor & Events", email: "radams@school.edu", color: "#db2777", admin: false },
  { name: "Estates & Facilities Team", role: "Estates Administrator", email: "admin.estates@school.edu", color: "#d97706", admin: true }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'my-bookings' | 'admin'
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load current user profile
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error initializing user:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initUser();
  }, []);

  const handleSelectProfile = async (profileName) => {
    setMockUser(profileName);
    const updated = await getCurrentUser();
    setCurrentUser(updated);
    setShowProfileModal(false);
    setCustomNameInput('');
  };

  const handleCustomUserSubmit = async (e) => {
    e.preventDefault();
    if (customNameInput.trim()) {
      await handleSelectProfile(customNameInput.trim());
    }
  };

  const currentProfileObj = DEFAULT_PROFILES.find(p => p.name === currentUser?.name);
  const userInitials = (currentUser?.name || 'Staff')
    .split(' ')
    .map(n => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const isAdmin = currentUser?.isAdmin || (currentUser?.name || '').toLowerCase().includes('admin') || (currentUser?.name || '').toLowerCase().includes('estates');

  return (
    <div className="app-container">
      {/* Main Top Header */}
      <header className="header">
        <div className="header-left">
          <div className="school-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="school-logo-badge">
              <School size={22} />
            </div>
            <div className="school-title-wrap">
              <span className="school-title">TRSW Room Booker</span>
              <span className="school-subtitle">School Classroom Booking System</span>
            </div>
          </div>
        </div>

        <nav className="header-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <CalendarIcon size={17} />
            <span>Book Classrooms</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-bookings')}
          >
            <User size={17} />
            <span>My Bookings</span>
          </button>

          {isAdmin && (
            <button 
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ color: activeTab === 'admin' ? 'var(--brand-primary)' : '#d97706' }}
            >
              <ShieldCheck size={17} />
              <span>Estates & Admin</span>
            </button>
          )}
        </nav>

        <div className="header-right">
          <button 
            type="button" 
            className="user-profile-pill" 
            onClick={() => setShowProfileModal(true)}
            title="Switch User Profile"
          >
            <div 
              className="user-avatar" 
              style={{ backgroundColor: currentProfileObj?.color || '#2563eb' }}
            >
              {userInitials}
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser?.name || "Mr. Steve O'Brien"}</span>
              <span className={`user-role-badge ${isAdmin ? 'admin-tag' : ''}`}>
                {isAdmin ? '🛡️ Estates Admin' : (currentProfileObj?.role || 'Teaching Staff')}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard userName={currentUser?.name} />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings userName={currentUser?.name} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard userName={currentUser?.name} />
        )}
      </main>

      {/* Profile Switcher Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Switch Staff Profile</h3>
                <p className="text-secondary text-sm">
                  Select a staff member or administrator to test bookings and permissions.
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="profile-list">
              {DEFAULT_PROFILES.map((p, idx) => {
                const isCurrent = currentUser?.name === p.name;
                return (
                  <div
                    key={idx}
                    className={`profile-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSelectProfile(p.name)}
                  >
                    <div className="profile-icon" style={{ backgroundColor: p.color }}>
                      {p.name.split(' ').map(n => n[0]).slice(-2).join('')}
                    </div>
                    <div className="profile-text">
                      <div className="profile-item-name">{p.name}</div>
                      <div className="profile-item-role">{p.role}</div>
                    </div>
                    {isCurrent && <Check size={18} className="text-brand" />}
                  </div>
                );
              })}
            </div>

            <div className="custom-user-section">
              <span className="text-secondary text-xs font-semibold uppercase">Or Enter Custom Staff Name:</span>
              <form onSubmit={handleCustomUserSubmit} className="custom-user-form">
                <input 
                  type="text" 
                  placeholder="e.g. Mrs. Davies (Head of Art)..." 
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!customNameInput.trim()}
                >
                  Switch
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>TRSW Room Booker • School Classroom Timetable & Facilities Booking System • Local Web Server Mode</p>
      </footer>
    </div>
  );
}

export default App;
