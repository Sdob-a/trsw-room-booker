// src/services/BookingService.js - API client for TRSW Room Booker

let authToken = null;
let mockUser = localStorage.getItem('trsw_mock_user') || "Mr. Steve O'Brien";

export const setAuthToken = (token) => {
  authToken = token;
};

export const setMockUser = (user) => {
  mockUser = user;
  if (user) {
    localStorage.setItem('trsw_mock_user', user);
  } else {
    localStorage.removeItem('trsw_mock_user');
  }
};

export const getMockUser = () => {
  return mockUser;
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (mockUser) {
    headers['X-Mock-User'] = mockUser;
  }
  return headers;
};

export const getCurrentUser = async () => {
  try {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return await res.json();
  } catch (err) {
    console.error('Error fetching current user:', err);
    return {
      name: mockUser || "Mr. Steve O'Brien",
      email: `${(mockUser || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu`,
      isAdmin: (mockUser || '').toLowerCase().includes('admin') || (mockUser || '').toLowerCase().includes('estates')
    };
  }
};

export const getRooms = async () => {
  try {
    const res = await fetch('/api/rooms', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch classrooms');
    return await res.json();
  } catch (err) {
    console.error('Error getting classrooms:', err);
    throw err;
  }
};

export const getBookingsForDateAndPeriod = async (date, period) => {
  try {
    const res = await fetch(`/api/bookings?date=${date}&period=${encodeURIComponent(period)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  } catch (err) {
    console.error(`Failed to get bookings for ${date} / ${period}:`, err);
    throw err;
  }
};

export const getUserBookings = async () => {
  try {
    const res = await fetch('/api/bookings/my', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return await res.json();
  } catch (err) {
    console.error('Failed to get user bookings:', err);
    throw err;
  }
};

export const bookRooms = async (date, period, roomIds, purpose = '') => {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        date,
        period,
        roomIds,
        purpose
      })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error booking rooms (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to save room booking:', err);
    throw err;
  }
};

export const cancelBooking = async (id) => {
  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel booking');
    }
    return await res.json();
  } catch (err) {
    console.error('Error cancelling booking:', err);
    throw err;
  }
};

export const cancelBookingGroup = async (date, period) => {
  try {
    const res = await fetch(`/api/bookings/group?date=${date}&period=${encodeURIComponent(period)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel session bookings');
    }
    return await res.json();
  } catch (err) {
    console.error('Error cancelling session bookings:', err);
    throw err;
  }
};

export const getMaintenanceRooms = async () => {
  try {
    const res = await fetch('/api/maintenance', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch room maintenance status');
    return await res.json();
  } catch (err) {
    console.error('Failed to get maintenance rooms:', err);
    return [];
  }
};

// Admin Endpoints
export const getAllBookingsAdmin = async ({ date = '', period = '', block = '', search = '' } = {}) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (period) params.append('period', period);
    if (block) params.append('block', block);
    if (search) params.append('search', search);

    const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin bookings');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch admin bookings:', err);
    throw err;
  }
};

export const cancelBookingAdmin = async (id) => {
  try {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel booking as admin');
    }
    return await res.json();
  } catch (err) {
    console.error('Admin cancel failed:', err);
    throw err;
  }
};

export const setRoomMaintenanceStatus = async (roomId, status, reason = '', category = 'Maintenance', estimatedCompletion = '') => {
  try {
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        roomId,
        status,
        reason,
        category,
        estimatedCompletion
      })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update room maintenance status');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    throw err;
  }
};

export const addRoomAdmin = async (roomData) => {
  try {
    const res = await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add classroom');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to add classroom:', err);
    throw err;
  }
};

export const updateRoomAdmin = async (id, roomData) => {
  try {
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update classroom');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to update classroom:', err);
    throw err;
  }
};

export const deleteRoomAdmin = async (id) => {
  try {
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete classroom');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to delete classroom:', err);
    throw err;
  }
};

export const setRoomBookableStatus = async (roomId, isBookable, unbookableReason = '') => {
  try {
    const res = await fetch(`/api/admin/rooms/${roomId}/bookable`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ isBookable, unbookableReason })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update bookable status');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to set room bookable status:', err);
    throw err;
  }
};

export const getAdminStats = async () => {
  try {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json();
  } catch (err) {
    console.error('Failed to get admin stats:', err);
    return null;
  }
};


// --- Timetable Periods API ---

export const getPeriods = async () => {
  try {
    const res = await fetch('/api/periods', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timetable periods');
    return await res.json();
  } catch (err) {
    console.error('Failed to get periods:', err);
    return [];
  }
};

export const addPeriodAdmin = async (periodData) => {
  try {
    const res = await fetch('/api/admin/periods', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(periodData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add timetable period');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to add timetable period:', err);
    throw err;
  }
};

export const updatePeriodAdmin = async (id, periodData) => {
  try {
    const res = await fetch(`/api/admin/periods/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(periodData)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update timetable period');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to update timetable period:', err);
    throw err;
  }
};

export const deletePeriodAdmin = async (id) => {
  try {
    const res = await fetch(`/api/admin/periods/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete timetable period');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to delete timetable period:', err);
    throw err;
  }
};

export const reorderPeriodsAdmin = async (periodIds) => {
  try {
    const res = await fetch('/api/admin/periods/reorder', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ periodIds })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to reorder timetable periods');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to reorder timetable periods:', err);
    throw err;
  }
};
