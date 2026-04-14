// src/app/core/models/doctor.models.ts

export interface DoctorRequest {
  firstName:     string;
  lastName:      string;
  dni:           string;
  licenseNumber: string;
  specialty:     string;
  phone?:        string;
  email?:        string;
  street:        string;
  streetNumber:  string;
  addressType:   string;
  floor?:        string;
  apartment?:    string;
  city:          string;
  province:      string;
  country:       string;
}

export interface DoctorDto extends DoctorRequest {
  id:        number;
  fullName:  string;
  active:    boolean;
  createdAt: string;
}

export interface DoctorSelectDto {
  id:            number;
  fullName:      string;
  specialty:     string;
  licenseNumber: string;
}