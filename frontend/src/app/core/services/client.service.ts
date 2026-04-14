// src/app/core/services/client.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientDto, ClientRequest, ClientSearchResult } from '../models/client.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private api = `${environment.apiUrl}/clients`;
  private http = inject(HttpClient);

  getAll(): Observable<ClientDto[]> {
    return this.http.get<ClientDto[]>(this.api);
  }

  getById(id: number): Observable<ClientDto> {
    return this.http.get<ClientDto>(`${this.api}/${id}`);
  }

  searchByDni(dni: string): Observable<ClientSearchResult> {
    return this.http.get<ClientSearchResult>(`${this.api}/search/${dni}`);
  }

  create(req: ClientRequest): Observable<ClientDto> {
    return this.http.post<ClientDto>(this.api, req);
  }

  update(id: number, req: ClientRequest): Observable<ClientDto> {
    return this.http.put<ClientDto>(`${this.api}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
