export interface ClassData {
  id: string;
  title: string;
  code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  latitude: number;
  longitude: number;
  semester_id: string;
  allowed_radius?: number;
  created_by: string;
}

export interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface ApiResponse {
  success: boolean;
  data?: ClassData | ClassData[];
  error?: string;
}

export interface AttendanceStatusResponse {
  success: boolean;
  data?: { isPresent: boolean };
  error?: string;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface ClassForm {
  id?: string;
  title: string;
  code: string;
  allowed_radius: number;
  latitude: number;
  longitude: number;
  semester_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  created_by: string;
  users?: string[]; // Add users field to ClassForm
}
