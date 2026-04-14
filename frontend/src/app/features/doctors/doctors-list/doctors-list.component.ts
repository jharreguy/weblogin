// src/app/features/doctors/doctors-list/doctors-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorDto } from '../../../core/models/doctor.models';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard" class="btn-nav">← Dashboard</a>
      <a routerLink="/doctors/new" class="btn-primary-sm">+ Nuevo médico</a>
    </div>
  </nav>

  <main class="page-main">
    <div class="page-header">
      <div>
        <h1 class="page-title">🩺 Médicos</h1>
        <p class="page-sub">{{ filtered.length }} médico{{ filtered.length !== 1 ? 's' : '' }} registrado{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Buscador -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filter()"
             placeholder="Buscar por nombre, DNI, matrícula o especialidad..." />
    </div>

    <div class="empty-state" *ngIf="loading">
      <div class="spinner-lg"></div>
      <p>Cargando médicos...</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <div class="table-wrapper" *ngIf="!loading && !error">

      <div class="empty-state" *ngIf="filtered.length === 0">
        <span style="font-size:3rem">🩺</span>
        <p>No se encontraron médicos</p>
        <a routerLink="/doctors/new" class="btn-primary-sm">Agregar el primero</a>
      </div>

      <table *ngIf="filtered.length > 0">
        <thead>
          <tr>
            <th>Médico</th>
            <th>DNI</th>
            <th>Matrícula</th>
            <th>Especialidad</th>
            <th>Localidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of filtered">
            <td>
              <div class="doctor-name">
                <div class="avatar-sm">{{ initials(d) }}</div>
                <div>
                  <strong>{{ d.lastName }}, {{ d.firstName }}</strong>
                  <small *ngIf="d.phone">📞 {{ d.phone }}</small>
                </div>
              </div>
            </td>
            <td class="td-mono">{{ d.dni }}</td>
            <td class="td-mono">{{ d.licenseNumber }}</td>
            <td>
              <span class="badge-specialty">{{ d.specialty }}</span>
            </td>
            <td>{{ d.city }}, {{ d.province }}</td>
            <td class="td-actions">
              <a [routerLink]="['/doctors', d.id, 'edit']" class="btn-icon" title="Editar">✏️</a>
              <button class="btn-icon btn-del" (click)="deleteDoctor(d)" title="Eliminar">🗑️</button>
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

    .search-bar {
      display:flex; align-items:center; gap:.75rem;
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:12px; padding:.6rem 1rem; margin-bottom:1.5rem;
    }
    .search-bar input {
      background:none; border:none; outline:none;
      color:#f1f5f9; font-family:'DM Sans',sans-serif; font-size:.95rem; flex:1;
    }
    .search-bar input::placeholder { color:#475569; }

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

    .doctor-name { display:flex; align-items:center; gap:.75rem; }
    .doctor-name div { display:flex; flex-direction:column; }
    .doctor-name strong { font-weight:500; color:#e2e8f0; }
    .doctor-name small { font-size:.78rem; color:#64748b; }

    .avatar-sm {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#0ea5e9,#6366f1);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.8rem; font-weight:800; color:#fff;
    }

    .td-mono { font-family:monospace; font-size:.88rem; color:#94a3b8; }
    .td-actions { display:flex; gap:.5rem; }

    .badge-specialty {
      padding:.25rem .75rem; border-radius:999px; font-size:.78rem; font-weight:500;
      background:rgba(14,165,233,.15); color:#7dd3fc; border:1px solid rgba(14,165,233,.25);
    }

    .btn-icon {
      width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05); cursor:pointer; font-size:.9rem;
      display:flex; align-items:center; justify-content:center; text-decoration:none;
      transition:background .2s;
    }
    .btn-icon:hover  { background:rgba(255,255,255,.1); }
    .btn-del:hover   { background:rgba(248,113,113,.15); border-color:rgba(248,113,113,.3); }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:3rem; color:#475569; }
    .spinner-lg {
      width:36px; height:36px; border:3px solid rgba(255,255,255,.1);
      border-top-color:#818cf8; border-radius:50%; animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class DoctorsListComponent implements OnInit {
  private svc = inject(DoctorService);

  doctors:   DoctorDto[] = [];
  filtered:  DoctorDto[] = [];
  searchTerm = '';
  loading    = true;
  error      = '';

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next:  data => { this.doctors = data; this.filtered = data; this.loading = false; },
      error: ()   => { this.error = 'Error al cargar médicos.'; this.loading = false; }
    });
  }

  filter(): void {
    const q = this.searchTerm.toLowerCase();
    this.filtered = this.doctors.filter(d =>
      d.firstName.toLowerCase().includes(q)     ||
      d.lastName.toLowerCase().includes(q)      ||
      d.dni.includes(q)                         ||
      d.licenseNumber.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q));
  }

  initials(d: DoctorDto): string {
    return (d.firstName[0] + d.lastName[0]).toUpperCase();
  }

  deleteDoctor(d: DoctorDto): void {
    if (!confirm(`¿Eliminar al Dr/a. ${d.fullName}?`)) return;
    this.svc.delete(d.id).subscribe({
      next: () => {
        this.doctors  = this.doctors.filter(x => x.id !== d.id);
        this.filtered = this.filtered.filter(x => x.id !== d.id);
      },
      error: () => alert('No se pudo eliminar el médico.')
    });
  }
}
