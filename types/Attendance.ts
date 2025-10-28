export interface ClassData {
  _id: string;
  id: number;
  name: string;
  code: string;
  timing: string;
  status: 'On Time' | 'Cancelled' | 'Rescheduled';
  location?: {
    latitude: number;
    longitude: number;
  };
  allowedRadius?: number;
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}

export interface AttendanceData {
  _id: string;
  student: string;
  class: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'present' | 'absent';
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}