// src/app/features/clients/clients-list/clients-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { ClientDto } from '../../../core/models/client.models';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard" class="btn-nav">← Dashboard</a>
      <a routerLink="/clients/new" class="btn-primary-sm">+ Nuevo cliente</a>
    </div>
  </nav>

  <main class="page-main">
    <div class="page-header">
      <div>
        <h1 class="page-title">👥 Clientes</h1>
        <p class="page-sub">{{ filtered.length }} cliente{{ filtered.length !== 1 ? 's' : '' }} registrado{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Buscador -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filter()"
             placeholder="Buscar por nombre, apellido o DNI..." />
    </div>

    <!-- Loading -->
    <div class="empty-state" *ngIf="loading">
      <div class="spinner-lg"></div>
      <p>Cargando clientes...</p>
    </div>

    <!-- Error -->
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Tabla -->
    <div class="table-wrapper" *ngIf="!loading && !error">
      <div class="empty-state" *ngIf="filtered.length === 0">
        <span style="font-size:3rem">👤</span>
        <p>No se encontraron clientes</p>
        <a routerLink="/clients/new" class="btn-primary-sm">Agregar el primero</a>
      </div>

      <table *ngIf="filtered.length > 0">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Localidad</th>
            <th>Obra social</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of filtered">
            <td>
              <div class="client-name">
                <div class="avatar-sm">{{ initials(c) }}</div>
                <div>
                  <strong>{{ c.lastName }}, {{ c.firstName }}</strong>
                  <small *ngIf="c.email">{{ c.email }}</small>
                </div>
              </div>
            </td>
            <td class="td-mono">{{ c.dni }}</td>
            <td>{{ c.phone }}</td>
            <td>{{ c.city }}, {{ c.province }}</td>
            <td>
              <span class="badge badge-green" *ngIf="c.hasHealthInsurance">
                {{ c.healthInsuranceName }}
              </span>
              <span class="badge badge-gray" *ngIf="!c.hasHealthInsurance">
                Sin obra social
              </span>
            </td>
            <td class="td-actions">
              <a [routerLink]="['/clients', c.id, 'edit']" class="btn-icon" title="Editar">✏️</a>
              <button class="btn-icon btn-del" (click)="deleteClient(c)" title="Eliminar">🗑️</button>
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
    * { box-sizing: border-box; }
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
    .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .page-title { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-.03em; }
    .page-sub { color:#64748b; font-size:.88rem; margin-top:.2rem; }

    .search-bar {
      display:flex; align-items:center; gap:.75rem;
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:12px; padding:.6rem 1rem; margin-bottom:1.5rem;
    }
    .search-bar input {
      background:none; border:none; outline:none; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem; flex:1;
    }
    .search-bar input::placeholder { color:#475569; }
    .search-icon { font-size:1rem; }

    .alert { border-radius:10px; padding:.75rem 1rem; font-size:.88rem; margin-bottom:1rem; }
    .alert-error { background:rgba(248,113,113,.12); color:#fca5a5; border:1px solid rgba(248,113,113,.25); }

    .table-wrapper { border-radius:16px; border:1px solid rgba(255,255,255,.08); overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead { background:rgba(255,255,255,.04); }
    th {
      padding:.85rem 1rem; text-align:left; font-size:.73rem;
      font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.06em;
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    td { padding:.85rem 1rem; border-bottom:1px solid rgba(255,255,255,.05); font-size:.9rem; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:rgba(255,255,255,.02); }

    .client-name { display:flex; align-items:center; gap:.75rem; }
    .client-name div { display:flex; flex-direction:column; }
    .client-name strong { font-weight:500; color:#e2e8f0; }
    .client-name small { font-size:.78rem; color:#64748b; }

    .avatar-sm {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.8rem; font-weight:800; color:#fff;
    }

    .td-mono { font-family:monospace; font-size:.88rem; color:#94a3b8; }
    .td-actions { display:flex; gap:.5rem; }

    .badge {
      padding:.2rem .7rem; border-radius:999px; font-size:.75rem; font-weight:500;
    }
    .badge-green { background:rgba(52,211,153,.12); color:#6ee7b7; border:1px solid rgba(52,211,153,.25); }
    .badge-gray  { background:rgba(100,116,139,.12); color:#94a3b8; border:1px solid rgba(100,116,139,.2); }

    .btn-icon {
      width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05); cursor:pointer; font-size:.9rem;
      display:flex; align-items:center; justify-content:center; text-decoration:none;
      transition:background .2s;
    }
    .btn-icon:hover { background:rgba(255,255,255,.1); }
    .btn-del:hover { background:rgba(248,113,113,.15); border-color:rgba(248,113,113,.3); }

    .empty-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:3rem; color:#475569; }

    .spinner-lg {
      width:36px; height:36px; border:3px solid rgba(255,255,255,.1);
      border-top-color:#818cf8; border-radius:50%; animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class ClientsListComponent implements OnInit {
  private svc = inject(ClientService);

  clients:    ClientDto[] = [];
  filtered:   ClientDto[] = [];
  searchTerm  = '';
  loading     = true;
  error       = '';

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next:  data  => { this.clients = data; this.filtered = data; this.loading = false; },
      error: ()    => { this.error = 'Error al cargar clientes.'; this.loading = false; }
    });
  }

  filter(): void {
    const q = this.searchTerm.toLowerCase();
    this.filtered = this.clients.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q)  ||
      c.dni.includes(q));
  }

  initials(c: ClientDto): string {
    return (c.firstName[0] + c.lastName[0]).toUpperCase();
  }

  deleteClient(c: ClientDto): void {
    if (!confirm(`¿Eliminar a ${c.fullName}?`)) return;
    this.svc.delete(c.id).subscribe({
      next: () => {
        this.clients  = this.clients.filter(x => x.id !== c.id);
        this.filtered = this.filtered.filter(x => x.id !== c.id);
      },
      error: () => alert('No se pudo eliminar el cliente.')
    });
  }
}
