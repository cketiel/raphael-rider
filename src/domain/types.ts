export enum NotificationLevel {
  Info = "Info",
  Warning = "Warning",
  Alert = "Alert",
}

export interface RaphaelNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  level: NotificationLevel;
  read: boolean;
  tripId?: number; // Para navegar al mapa si es una alerta de viaje en curso
}

export enum TripType {
  Appointment = "Appointment",
  Return = "Return",
}

export enum TripStatus {
  Assigned = "Assigned",
  Accepted = "Accepted",
  Scheduled = "Scheduled",
  Waiting = "Waiting",
  Late = "Late",
  InProgress = "InProgress",
  Finished = "Finished",
  Canceled = "Canceled",
  Billed = "Billed",
  Payed = "Payed",
}

export enum ScheduleEventType {
  Pickup = "Pickup",
  Dropoff = "Dropoff",
}

export interface Customer {
  id: number;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  mobilePhone?: string;
  clientCode?: string;
  policyNumber?: string;
  fundingSourceId: number;
  spaceTypeId: number;
  email?: string;
  dob?: string;
  gender: string;
  riderId?: string;
  latitude?: number;
  longitude?: number;
}

export interface Trip {
  id: number;
  day: string;
  date: string;
  fromTime?: string;
  toTime?: string;
  customerId: number;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  spaceTypeId: number;
  isCancelled: boolean;
  charge?: number;
  paid?: number;
  type: string; // TripType
  willCall: boolean;
  status: string; // TripStatus
  created: string;
  distance?: number;
  eta?: number;
}

export interface Schedule {
  id: number;
  tripId?: number;
  vehicleRouteId: number;
  eventType: string; // ScheduleEventType
  sequence?: number;
  name: string;
  address: string;
  scheduleLatitude: number;
  scheduleLongitude: number;
  phone?: string;
  comment?: string;
  fundingSourceName?: string;
  authNo?: string;
  spaceTypeName?: string;
  scheduledPickupTime?: string;
  scheduledApptTime?: string;
  actualArriveTime?: string;
  actualPerformTime?: string;
  performed: boolean;
}

export interface GPS {
  id: number;
  idVehicleRoute: number;
  dateTime: string;
  speed: number;
  address?: string;
  latitude: number;
  longitude: number;
  direction?: string;
}

export interface Rating {
  id: number;
  tripId: number;
  customerId: number;
  driverId: number;
  score: number;
  comment?: string;
  createdAt: string;
}

export const TripStatusColors: Record<string, string> = {
  [TripStatus.Assigned]: "#9E9E9E", // Gray
  [TripStatus.Accepted]: "#00BCD4", // Cyan
  [TripStatus.Scheduled]: "#2196F3", // Blue
  [TripStatus.Waiting]: "#FFEB3B", // Yellow (Dark text)
  [TripStatus.Late]: "#FF9800", // Orange
  [TripStatus.InProgress]: "#3F51B5", // Indigo
  [TripStatus.Finished]: "#4CAF50", // Green
  [TripStatus.Payed]: "#10B981", // Emerald
  [TripStatus.Billed]: "#009688", // Teal
  [TripStatus.Canceled]: "#F44336", // Red
};
