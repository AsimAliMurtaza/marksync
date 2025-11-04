export default interface ClassData {
  _id?: string;
  name: string;
  code: string;
  location: { latitude: number; longitude: number };
  allowedRadius: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  };
}