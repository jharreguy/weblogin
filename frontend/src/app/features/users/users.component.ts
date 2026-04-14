// src/app/features/users/users.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard" class="btn-back">← Dashboard</a>
    </div>
  </nav>

  <main class="page-main">
    <h1 class="page-title">Gestión de usuarios</h1>
    <p class="page-sub">{{ users.length }} usuarios registrados</p>

    <div class="loading" *ngIf="loading">Cargando...</div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <div class="table-wrapper" *ngIf="!loading && !error">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td class="td-id">#{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td class="td-email">{{ u.email }}</td>
            <td>
              <span class="badge" [class.badge-admin]="u.role === 'Admin'">
                {{ u.role }}
              </span>
            </td>
            <td>
              <span class="status" [class.status-active]="u.active">
                {{ u.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-date">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <button class="btn-del" (click)="deleteUser(u.id)">Eliminar</button>
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
    .page-wrapper { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #f1f5f9; }

    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem;
      background: rgba(255,255,255,.04);
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; color: #818cf8; }
    .btn-back {
      padding: .4rem .9rem; background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
      color: #94a3b8; text-decoration: none; font-size: .85rem;
      transition: background .2s;
    }
    .btn-back:hover { background: rgba(255,255,255,.12); color: #f1f5f9; }

    .page-main { padding: 3rem 2rem; max-width: 1100px; margin: 0 auto; }
    .page-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -.03em; }
    .page-sub { color: #64748b; margin-top: .4rem; margin-bottom: 2rem; }

    .loading { color: #64748b; padding: 2rem 0; }

    .alert { border-radius: 10px; padding: .7rem 1rem; font-size: .88rem; margin-bottom: 1rem; }
    .alert-error { background: rgba(248,113,113,.12); color: #fca5a5; border: 1px solid rgba(248,113,113,.25); }

    .table-wrapper { overflow-x: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,.08); }
    table { width: 100%; border-collapse: collapse; }
    thead { background: rgba(255,255,255,.04); }
    th {
      padding: .9rem 1rem; text-align: left;
      font-size: .75rem; font-weight: 600; color: #64748b;
      text-transform: uppercase; letter-spacing: .06em;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    td { padding: .85rem 1rem; border-bottom: 1px solid rgba(255,255,255,.05); font-size: .9rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,.02); }

    .td-id    { color: #475569; font-size: .8rem; }
    .td-email { color: #94a3b8; }
    .td-date  { color: #475569; font-size: .82rem; }

    .badge {
      padding: .2rem .65rem; border-radius: 999px; font-size: .75rem; font-weight: 600;
      background: rgba(99,102,241,.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,.3);
    }
    .badge-admin { background: rgba(236,72,153,.2); color: #f9a8d4; border-color: rgba(236,72,153,.3); }

    .status { font-size: .8rem; color: #64748b; }
    .status-active { color: #34d399; }

    .btn-del {
      padding: .3rem .7rem; background: rgba(248,113,113,.1);
      border: 1px solid rgba(248,113,113,.25); border-radius: 7px;
      color: #fca5a5; cursor: pointer; font-size: .8rem;
      transition: background .2s;
    }
    .btn-del:hover { background: rgba(248,113,113,.2); }
  `]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  users: UserDto[] = [];
  loading = true;
  error   = '';

  ngOnInit(): void {
    this.http.get<UserDto[]>(`${environment.apiUrl}/users`).subscribe({
      next:  data  => { this.users = data; this.loading = false; },
      error: ()    => { this.error = 'Error al cargar usuarios.'; this.loading = false; }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({
      next: () => this.users = this.users.filter(u => u.id !== id),
      error: () => alert('No se pudo eliminar el usuario.')
    });
  }
}
