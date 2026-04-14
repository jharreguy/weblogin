// src/app/core/models/client.models.ts

export interface ClientRequest {
  firstName:           string;
  lastName:            string;
  dni:                 string;
  phone:               string;
  email?:              string;
  street:              string;
  streetNumber:        string;
  addressType:         string;
  floor?:              string;
  apartment?:          string;
  city:                string;
  province:            string;
  country:             string;
  hasHealthInsurance:  boolean;
  healthInsuranceName?: string;
}

export interface ClientDto extends ClientRequest {
  id:        number;
  fullName:  string;
  active:    boolean;
  createdAt: string;
}

export interface ClientSearchResult {
  id:                  number;
  fullName:            string;
  dni:                 string;
  phone:               string;
  hasHealthInsurance:  boolean;
  healthInsuranceName?: string;
}
