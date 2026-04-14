// src/app/features/appointments/appointments-list/appointments-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentDto } from '../../../core/models/appointment.models';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard" class="btn-nav">← Dashboard</a>
      <a routerLink="/appointments/new" class="btn-primary-sm">+ Nueva cita</a>
    </div>
  </nav>

  <main class="page-main">
    <div class="page-header">
      <div>
        <h1 class="page-title">📅 Turnos</h1>
        <p class="page-sub">{{ filtered.length }} turno{{ filtered.length !== 1 ? 's' : '' }} registrado{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="search-bar">
        <span>🔍</span>
        <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
               placeholder="Buscar paciente o médico..." />
      </div>
      <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Confirmado">Confirmado</option>
        <option value="Realizado">Realizado</option>
        <option value="Cancelado">Cancelado</option>
      </select>
      <input type="date" [(ngModel)]="filterDate" (ngModelChange)="applyFilters()" />
    </div>

    <div class="empty-state" *ngIf="loading">
      <div class="spinner-lg"></div>
      <p>Cargando turnos...</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Tabla -->
    <div class="table-wrapper" *ngIf="!loading && !error">
      <div class="empty-state" *ngIf="filtered.length === 0">
        <span style="font-size:3rem">📅</span>
        <p>No hay turnos registrados</p>
        <a routerLink="/appointments/new" class="btn-primary-sm">Crear el primero</a>
      </div>

      <table *ngIf="filtered.length > 0">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of filtered">
            <td>
              <div class="date-cell">
                <strong>{{ formatDate(a.appointmentDate) }}</strong>
                <span>{{ a.appointmentTime }} hs</span>
              </div>
            </td>
            <td>{{ a.clientName }}</td>
            <td>{{ a.doctorName }}</td>
            <td><span class="specialty-badge">{{ a.specialty }}</span></td>
            <td>
              <select class="status-select"
                      [value]="a.status"
                      [class]="'status-' + a.status.toLowerCase()"
                      (change)="changeStatus(a, $any($event.target).value)">
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </td>
            <td class="td-actions">
              <button class="btn-icon btn-del" (click)="deleteAppt(a)" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing:border-box; }
    .page-wrapper { min-height:100vh; background:#0a0a0f; font-family:'DM Sans',sans-serif; color:#f1f5f9; }

    .navbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:1rem 2rem; background:rgba(255,255,255,.04);
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    .nav-logo { font-family:'Syne',sans-serif; font-weight:800; color:#818cf8; }
    .nav-actions { display:flex; gap:.75rem; align-items:center; }
    .btn-nav {
      padding:.4rem .9rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#94a3b8; text-decoration:none; font-size:.85rem; transition:background .2s;
    }
    .btn-nav:hover { background:rgba(255,255,255,.12); color:#f1f5f9; }
    .btn-primary-sm {
      padding:.45rem 1rem; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff; border:none; border-radius:8px; font-size:.88rem;
      font-weight:600; cursor:pointer; text-decoration:none; transition:opacity .2s;
    }
    .btn-primary-sm:hover { opacity:.85; }

    .page-main { padding:2.5rem 2rem; max-width:1100px; margin:0 auto; }
    .page-header { margin-bottom:1.5rem; }
    .page-title { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-.03em; }
    .page-sub { color:#64748b; font-size:.88rem; margin-top:.2rem; }

    .filters-bar { display:flex; gap:.75rem; margin-bottom:1.5rem; flex-wrap:wrap; }
    .search-bar {
      display:flex; align-items:center; gap:.75rem; flex:1; min-width:200px;
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.55rem 1rem;
    }
    .search-bar input { background:none; border:none; outline:none; color:#f1f5f9; font-family:'DM Sans',sans-serif; font-size:.9rem; flex:1; }
    .search-bar input::placeholder { color:#475569; }
    .filters-bar select, .filters-bar input[type="date"] {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.55rem .9rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.88rem; outline:none;
    }
    .filters-bar select option { background:#1e293b; }

    .alert { border-radius:10px; padding:.75rem 1rem; font-size:.88rem; margin-bottom:1rem; }
    .alert-error { background:rgba(248,113,113,.12); color:#fca5a5; border:1px solid rgba(248,113,113,.25); }

    .table-wrapper { border-radius:16px; border:1px solid rgba(255,255,255,.08); overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead { background:rgba(255,255,255,.04); }
    th {
      padding:.85rem 1rem; text-align:left; font-size:.73rem; font-weight:600;
      color:#64748b; text-transform:uppercase; letter-spacing:.06em;
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    td { padding:.85rem 1rem; border-bottom:1px solid rgba(255,255,255,.05); font-size:.9rem; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:rgba(255,255,255,.02); }

    .date-cell { display:flex; flex-direction:column; }
    .date-cell strong { color:#e2e8f0; }
    .date-cell span   { font-size:.8rem; color:#818cf8; }

    .specialty-badge {
      padding:.2rem .65rem; border-radius:999px; font-size:.75rem;
      background:rgba(14,165,233,.12); color:#7dd3fc; border:1px solid rgba(14,165,233,.2);
    }

    .status-select {
      background:transparent; border:1px solid rgba(255,255,255,.15);
      border-radius:8px; padding:.3rem .6rem; font-size:.8rem;
      font-family:'DM Sans',sans-serif; cursor:pointer; outline:none;
    }
    .status-pendiente  { color:#fbbf24; border-color:rgba(251,191,36,.3); }
    .status-confirmado { color:#34d399; border-color:rgba(52,211,153,.3); }
    .status-realizado  { color:#818cf8; border-color:rgba(129,140,248,.3); }
    .status-cancelado  { color:#f87171; border-color:rgba(248,113,113,.3); }

    .td-actions { display:flex; gap:.5rem; }
    .btn-icon {
      width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05); cursor:pointer; font-size:.9rem;
      display:flex; align-items:center; justify-content:center; transition:background .2s;
    }
    .btn-del:hover { background:rgba(248,113,113,.15); border-color:rgba(248,113,113,.3); }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:3rem; color:#475569; }
    .spinner-lg {
      width:36px; height:36px; border:3px solid rgba(255,255,255,.1);
      border-top-color:#818cf8; border-radius:50%; animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class AppointmentsListComponent implements OnInit {
  private svc = inject(AppointmentService);

  appointments: AppointmentDto[] = [];
  filtered:     AppointmentDto[] = [];
  searchTerm    = '';
  filterStatus  = '';
  filterDate    = '';
  loading       = true;
  error         = '';

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next:  data => { this.appointments = data; this.filtered = data; this.loading = false; },
      error: ()   => { this.error = 'Error al cargar turnos.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.appointments];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(a =>
        a.clientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q));
    }
    if (this.filterStatus) result = result.filter(a => a.status === this.filterStatus);
    if (this.filterDate)   result = result.filter(a => a.appointmentDate === this.filterDate);
    this.filtered = result;
  }

  changeStatus(a: AppointmentDto, status: string): void {
    this.svc.updateStatus(a.id, status).subscribe({
      next: updated => {
        const idx = this.appointments.findIndex(x => x.id === a.id);
        if (idx >= 0) this.appointments[idx] = updated;
        this.applyFilters();
      }
    });
  }

  deleteAppt(a: AppointmentDto): void {
    if (!confirm(`¿Eliminar el turno de ${a.clientName}?`)) return;
    this.svc.delete(a.id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(x => x.id !== a.id);
        this.applyFilters();
      },
      error: () => alert('No se pudo eliminar el turno.')
    });
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
