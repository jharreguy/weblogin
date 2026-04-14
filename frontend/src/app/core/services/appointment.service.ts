// src/app/core/services/appointment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDto, AppointmentRequest, DoctorAvailability } from '../models/appointment.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api  = `${environment.apiUrl}/appointments`;
  private http = inject(HttpClient);

  getAll(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(this.api);
  }

  getByDoctor(doctorId: number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.api}/doctor/${doctorId}`);
  }

  getByClient(clientId: number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.api}/client/${clientId}`);
  }

  getAvailability(doctorId: number, from: string, days = 5): Observable<DoctorAvailability[]> {
    const params = new HttpParams().set('from', from).set('days', days);
    return this.http.get<DoctorAvailability[]>(`${this.api}/availability/${doctorId}`, { params });
  }

  getSpecialties(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/specialties`);
  }

  create(req: AppointmentRequest): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(this.api, req);
  }

  updateStatus(id: number, status: string): Observable<AppointmentDto> {
    return this.http.patch<AppointmentDto>(`${this.api}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
