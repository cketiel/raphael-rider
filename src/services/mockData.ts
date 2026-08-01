// src/services/mockData.ts
import {
  Trip,
  Schedule,
  TripStatus,
  ScheduleEventType,
  TripType,
} from "../domain/types";
import { format, subDays } from "date-fns";

export const MOCK_TRIPS: Trip[] = [
  {
    id: 101,
    date: new Date().toISOString(),
    day: format(new Date(), "EEEE"),
    pickupAddress: "800 Douglas Rd, Coral Gables, FL",
    pickupLatitude: 25.751,
    pickupLongitude: -80.252,
    dropoffAddress: "Bascom Palmer Eye Institute, Miami, FL",
    dropoffLatitude: 25.789,
    dropoffLongitude: -80.201,
    status: TripStatus.InProgress,
    type: TripType.Appointment,
    willCall: false,
    customerId: 1,
    spaceTypeId: 1,
    isCancelled: false,
    created: new Date().toISOString(),
  },
  {
    id: 102,
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    day: "Yesterday",
    pickupAddress: "123 Home St, Miami, FL",
    pickupLatitude: 25.761,
    pickupLongitude: -80.191,
    dropoffAddress: "Dentist Office, Brickell, FL",
    dropoffLatitude: 25.765,
    dropoffLongitude: -80.195,
    status: TripStatus.Finished,
    type: TripType.Return,
    willCall: false,
    customerId: 1,
    spaceTypeId: 1,
    isCancelled: false,
    created: subDays(new Date(), 1).toISOString(),
  },
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 501,
    tripId: 101,
    vehicleRouteId: 20,
    name: "John Doe Pickup - Appointment",
    address: "800 Douglas Rd, Coral Gables, FL",
    scheduleLatitude: 25.751,
    scheduleLongitude: -80.252,
    eventType: ScheduleEventType.Pickup,
    performed: false,
    actualArriveTime: undefined, // "On Route" (Arrived y Performed null)
    actualPerformTime: undefined,
  },
  {
    id: 502,
    tripId: 101,
    vehicleRouteId: 20,
    name: "John Doe Dropoff - Appointment",
    address: "Bascom Palmer Eye Institute, Miami, FL",
    scheduleLatitude: 25.789,
    scheduleLongitude: -80.201,
    eventType: ScheduleEventType.Dropoff,
    performed: false,
    actualArriveTime: "09:00:00", // "Arrive" (Arrived != null)
    actualPerformTime: undefined,
  },
];
