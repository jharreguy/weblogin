// src/app/features/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="dash-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <span class="nav-user">{{ auth.user()?.name }}</span>
      <span class="badge" [class.badge-admin]="auth.isAdmin()">
        {{ auth.user()?.role }}
      </span>
      <button class="btn-logout" (click)="auth.logout()">Salir</button>
    </div>
  </nav>

  <main class="dash-main">
    <h1 class="dash-title">Panel de control</h1>
    <p class="dash-sub">Bienvenido, <strong>{{ auth.user()?.name }}</strong></p>

    <div class="cards">
      <div class="card card-purple">
        <div class="card-icon">👤</div>
        <div class="card-body">
          <p class="card-label">Tu cuenta</p>
          <p class="card-value">{{ auth.user()?.email }}</p>
          <a class="card-link" routerLink="/profile">Editar perfil →</a>
        </div>
      </div>

      <div class="card card-blue">
        <div class="card-icon">🔐</div>
        <div class="card-body">
          <p class="card-label">Sesión activa</p>
          <p class="card-value">JWT válido</p>
        </div>
      </div>

      <div class="card card-green">
        <div class="card-icon">👥</div>
        <div class="card-body">
          <p class="card-label">Pacientes</p>
          <p class="card-value">Gestión de clientes</p>
          <a class="card-link" routerLink="/clients">Ver pacientes →</a>
        </div>
      </div>

      <div class="card card-cyan">
        <div class="card-icon">🩺</div>
        <div class="card-body">
          <p class="card-label">Médicos</p>
          <p class="card-value">Profesionales de la salud</p>
          <a class="card-link" routerLink="/doctors">Ver médicos →</a>
        </div>
      </div>

      <div class="card card-orange">
        <div class="card-icon">📅</div>
        <div class="card-body">
          <p class="card-label">Turnos</p>
          <p class="card-value">Gestión de citas</p>
          <a class="card-link" routerLink="/appointments">Ver turnos →</a>
        </div>
      </div>

      <div class="card card-teal">
        <div class="card-icon">🗓</div>
        <div class="card-body">
          <p class="card-label">Agenda del día</p>
          <p class="card-value">Vista por fecha</p>
          <a class="card-link" routerLink="/agenda">Ver agenda →</a>
        </div>
      </div>

      <div class="card card-pink" *ngIf="auth.isAdmin()">
        <div class="card-icon">🛡</div>
        <div class="card-body">
          <p class="card-label">Administración</p>
          <a class="card-link" routerLink="/users">Gestionar usuarios →</a>
        </div>
      </div>
    </div>
  </main>
</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    .dash-wrapper { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #f1f5f9; }

    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem;
      background: rgba(255,255,255,.04);
      border-bottom: 1px solid rgba(255,255,255,.08);
      backdrop-filter: blur(8px);
    }
    .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: #818cf8; }
    .nav-actions { display: flex; align-items: center; gap: 1rem; }
    .nav-user { color: #94a3b8; font-size: .9rem; }
    .badge {
      padding: .2rem .65rem; border-radius: 999px; font-size: .75rem; font-weight: 600;
      background: rgba(99,102,241,.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,.3);
    }
    .badge-admin { background: rgba(236,72,153,.2); color: #f9a8d4; border-color: rgba(236,72,153,.3); }
    .btn-logout {
      padding: .4rem .9rem; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px; color: #94a3b8; cursor: pointer; font-size: .85rem;
      transition: background .2s;
    }
    .btn-logout:hover { background: rgba(255,255,255,.12); color: #f1f5f9; }

    .dash-main { padding: 3rem 2rem; max-width: 900px; margin: 0 auto; }
    .dash-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -.03em; }
    .dash-sub { color: #64748b; margin-top: .4rem; margin-bottom: 2.5rem; }
    .dash-sub strong { color: #a5b4fc; }

    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
    .card {
      border-radius: 16px; padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem;
      border: 1px solid rgba(255,255,255,.08); transition: transform .2s;
    }
    .card:hover { transform: translateY(-3px); }
    .card-purple { background: linear-gradient(135deg, rgba(99,102,241,.15), rgba(139,92,246,.08)); }
    .card-blue   { background: linear-gradient(135deg, rgba(59,130,246,.15), rgba(99,102,241,.08)); }
    .card-green  { background: linear-gradient(135deg, rgba(52,211,153,.15), rgba(16,185,129,.08)); }
    .card-cyan   { background: linear-gradient(135deg, rgba(14,165,233,.15), rgba(6,182,212,.08)); }
    .card-orange { background: linear-gradient(135deg, rgba(251,146,60,.15), rgba(245,101,101,.08)); }
    .card-teal   { background: linear-gradient(135deg, rgba(20,184,166,.15), rgba(6,182,212,.08)); }
    .card-pink   { background: linear-gradient(135deg, rgba(236,72,153,.15), rgba(168,85,247,.08)); }
    .card-icon { font-size: 1.75rem; }
    .card-label { font-size: .75rem; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .3rem; }
    .card-value { font-weight: 500; font-size: .95rem; color: #e2e8f0; word-break: break-all; }
    .card-link { color: #818cf8; text-decoration: none; font-weight: 500; }
    .card-link:hover { text-decoration: underline; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
