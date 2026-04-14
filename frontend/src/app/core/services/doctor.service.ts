// src/app/core/services/doctor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DoctorDto, DoctorRequest, DoctorSelectDto } from '../models/doctor.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api  = `${environment.apiUrl}/doctors`;
  private http = inject(HttpClient);

  getAll(): Observable<DoctorDto[]> {
    return this.http.get<DoctorDto[]>(this.api);
  }

  getForSelect(): Observable<DoctorSelectDto[]> {
    return this.http.get<DoctorSelectDto[]>(`${this.api}/select`);
  }

  getById(id: number): Observable<DoctorDto> {
    return this.http.get<DoctorDto>(`${this.api}/${id}`);
  }

  create(req: DoctorRequest): Observable<DoctorDto> {
    return this.http.post<DoctorDto>(this.api, req);
  }

  update(id: number, req: DoctorRequest): Observable<DoctorDto> {
    return this.http.put<DoctorDto>(`${this.api}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
