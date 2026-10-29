// src/constants.js - TRSW Room Booker Constants

export const PERIODS = [
  'Period 1',
  'Period 2',
  'Break',
  'Period 3',
  'Period 4',
  'Lunch',
  'Period 5',
  'Period 6'
];

export const TIMETABLE_SCHEDULE = {
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

export const ROOM_BLOCKS = [
  'All Buildings',
  'Kensington Building',
  'Holyrood Building',
  'Senior School Building',
  'Art & Design Building',
  'Sports & Recreation'
];

export const ROOM_TYPES = [
  'All Types',
  'General Classroom',
  'Science Lab',
  'IT Computer Suite',
  'Music & Audio',
  'Art & Design',
  'Specialist Workshop',
  'Library / Resource Centre',
  'Lecture Theatre',
  'Intervention & Support',
  'Staff Work Room',
  'Staff Office',
  'Assembly Hall',
  'Meeting / Conference',
  'Sports & PE'
];

/**
 * Get the exact start and end times for a period on a given date.
 * Handles Friday schedule adjustments automatically.
 * @param {string} dateString - Format: 'YYYY-MM-DD'
 * @param {string} periodName - e.g. 'Period 1'
 */
export function getPeriodTimes(dateString, periodName, periodsList = null) {
  const parts = (dateString || '').split('-');
  let isFriday = false;
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    isFriday = d.getDay() === 5;
  }

  if (periodsList && Array.isArray(periodsList) && periodsList.length > 0) {
    const matched = periodsList.find(p => p.name === periodName || p.id === periodName);
    if (matched) {
      const startTime = isFriday ? (matched.fridayStart || matched.regularStart) : matched.regularStart;
      const endTime = isFriday ? (matched.fridayEnd || matched.regularEnd) : matched.regularEnd;
      return {
        startDateTime: `${dateString}T${startTime}:00`,
        endDateTime: `${dateString}T${endTime}:00`,
        startTime,
        endTime,
        timeDisplay: `${startTime} - ${endTime}`,
        isFriday
      };
    }
  }

  const schedule = isFriday ? TIMETABLE_SCHEDULE.friday : TIMETABLE_SCHEDULE.regular;
  const times = schedule[periodName] || { start: '09:00', end: '10:00' };

  return {
    startDateTime: `${dateString}T${times.start}:00`,
    endDateTime: `${dateString}T${times.end}:00`,
    startTime: times.start,
    endTime: times.end,
    timeDisplay: `${times.start} - ${times.end}`,
    isFriday
  };
}
