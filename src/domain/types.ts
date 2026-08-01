// src/domain/types.ts

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
  dob?: string; // ISO String
  gender: string;
  riderId?: string;
  latitude?: number;
  longitude?: number;
}

// Raphael Ecosystem colors based on status
export const TripStatusColors: Record<string, string> = {
  [TripStatus.Assigned]: "#9E9E9E", // Gray
  [TripStatus.Accepted]: "#00BCD4", // Cyan
  [TripStatus.Scheduled]: "#2196F3", // Blue
  [TripStatus.Waiting]: "#FFEB3B", // Yellow (Dark text needed)
  [TripStatus.Late]: "#FF9800", // Orange
  [TripStatus.InProgress]: "#3F51B5", // Indigo
  [TripStatus.Finished]: "#4CAF50", // Green
  [TripStatus.Payed]: "#10B981", // Emerald
  [TripStatus.Billed]: "#009688", // Teal
  [TripStatus.Canceled]: "#F44336", // Red
};
