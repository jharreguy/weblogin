// src/app/core/models/appointment.models.ts

export interface AppointmentRequest {
  clientId:        number;
  doctorId:        number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?:          string;
}

export interface AppointmentDto {
  id:              number;
  clientId:        number;
  clientName:      string;
  doctorId:        number;
  doctorName:      string;
  specialty:       string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status:          string;
  notes?:          string;
  createdAt:       string;
}

export interface AvailableSlot {
  time:      string;
  available: boolean;
}

export interface DoctorAvailability {
  date:    string;
  dayName: string;
  slots:   AvailableSlot[];
}
