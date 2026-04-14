// src/app/features/appointments/agenda/agenda.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentDto } from '../../../core/models/appointment.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page-wrapper">

  <!-- Navbar -->
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard"    class="btn-nav">← Dashboard</a>
      <a routerLink="/appointments" class="btn-nav">Lista completa</a>
      <a routerLink="/appointments/new" class="btn-primary-sm">+ Nueva cita</a>
    </div>
  </nav>

  <main class="page-main">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🗓 Agenda</h1>
        <p class="page-sub">{{ isToday(selectedDate) ? 'Hoy — ' : '' }}{{ formatDateLong(selectedDate) }}</p>
      </div>
      <div class="header-stats" *ngIf="!loading">
        <div class="stat">
          <span class="stat-num">{{ dayAppointments.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat stat-green">
          <span class="stat-num">{{ countStatus('Confirmado') }}</span>
          <span class="stat-label">Confirmados</span>
        </div>
        <div class="stat stat-yellow">
          <span class="stat-num">{{ countStatus('Pendiente') }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat stat-gray">
          <span class="stat-num">{{ countStatus('Realizado') }}</span>
          <span class="stat-label">Realizados</span>
        </div>
      </div>
    </div>

    <div class="main-grid">

      <!-- ── Columna izquierda: calendario + búsqueda ── -->
      <aside class="sidebar">

        <!-- Calendario -->
        <div class="calendar-card">
          <div class="cal-header">
            <button class="cal-nav" (click)="prevMonth()">‹</button>
            <span class="cal-title">{{ monthName }} {{ calYear }}</span>
            <button class="cal-nav" (click)="nextMonth()">›</button>
          </div>

          <div class="cal-days-header">
            <span *ngFor="let d of dayNames">{{ d }}</span>
          </div>

          <div class="cal-grid">
            <span *ngFor="let cell of calCells"
                  class="cal-cell"
                  [class.cal-empty]="!cell.date"
                  [class.cal-today]="cell.isToday"
                  [class.cal-selected]="cell.date === selectedDate"
                  [class.cal-has-appts]="cell.hasAppts"
                  (click)="cell.date && selectDate(cell.date)">
              {{ cell.day }}
              <span class="cal-dot" *ngIf="cell.hasAppts"></span>
            </span>
          </div>

          <button class="btn-today" (click)="goToday()">Ir a hoy</button>
        </div>

        <!-- Búsqueda por DNI -->
        <div class="search-card">
          <h3 class="search-title">🔍 Buscar por DNI</h3>
          <div class="dni-input-row">
            <input type="text" [(ngModel)]="dniSearch"
                   placeholder="Ingresá el DNI..."
                   (keyup.enter)="searchByDni()" />
            <button class="btn-search" (click)="searchByDni()" [disabled]="!dniSearch">
              Buscar
            </button>
          </div>
          <button class="btn-clear-search" *ngIf="dniResults !== null" (click)="clearDni()">
            Limpiar búsqueda
          </button>

          <!-- Resultado DNI -->
          <div *ngIf="dniResults !== null">
            <div class="alert alert-error" *ngIf="dniResults.length === 0">
              No se encontraron turnos para ese DNI.
            </div>
            <div class="dni-results" *ngIf="dniResults.length > 0">
              <p class="results-label">{{ dniResults.length }} turno(s) encontrado(s)</p>
              <div class="dni-result-item" *ngFor="let a of dniResults">
                <div class="result-date">
                  <strong>{{ formatDateShort(a.appointmentDate) }}</strong>
                  <span>{{ a.appointmentTime }} hs</span>
                </div>
                <div class="result-info">
                  <strong>{{ a.clientName }}</strong>
                  <span>{{ a.doctorName }}</span>
                  <span class="status-pill" [class]="'pill-' + a.status.toLowerCase()">
                    {{ a.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </aside>

      <!-- ── Columna derecha: turnos del día ── -->
      <section class="agenda-section">

        <div class="loading-row" *ngIf="loading">
          <div class="spinner-sm"></div>
          Cargando turnos...
        </div>

        <!-- Sin turnos -->
        <div class="empty-day" *ngIf="!loading && dayAppointments.length === 0">
          <span class="empty-icon">📭</span>
          <p>No hay turnos para este día</p>
          <a routerLink="/appointments/new" class="btn-primary-sm">Asignar un turno</a>
        </div>

        <!-- Timeline de turnos -->
        <div class="timeline" *ngIf="!loading && dayAppointments.length > 0">
          <div class="timeline-item" *ngFor="let a of dayAppointments; let i = index"
               [class]="'timeline-item--' + a.status.toLowerCase()">

            <!-- Hora -->
            <div class="tl-time">
              <span class="tl-hour">{{ a.appointmentTime }}</span>
              <span class="tl-duration">{{ a.durationMinutes }}m</span>
            </div>

            <!-- Línea vertical -->
            <div class="tl-line">
              <div class="tl-dot" [class]="'dot-' + a.status.toLowerCase()"></div>
              <div class="tl-connector" *ngIf="i < dayAppointments.length - 1"></div>
            </div>

            <!-- Card del turno -->
            <div class="tl-card">
              <div class="tl-card-header">
                <div class="patient-info">
                  <div class="avatar-sm">{{ initials(a.clientName) }}</div>
                  <div>
                    <strong>{{ a.clientName }}</strong>
                    <span class="specialty-tag">{{ a.specialty }}</span>
                  </div>
                </div>
                <span class="status-pill" [class]="'pill-' + a.status.toLowerCase()">
                  {{ a.status }}
                </span>
              </div>

              <div class="tl-card-body">
                <div class="tl-detail">
                  <span>🩺</span>
                  <span>{{ a.doctorName }}</span>
                </div>
                <div class="tl-detail" *ngIf="a.notes">
                  <span>📝</span>
                  <span>{{ a.notes }}</span>
                </div>
              </div>

              <div class="tl-card-footer">
                <select class="status-select"
                        [value]="a.status"
                        [class]="'sel-' + a.status.toLowerCase()"
                        (change)="changeStatus(a, $any($event.target).value)">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <button class="btn-cancel-appt"
                        *ngIf="a.status !== 'Cancelado' && a.status !== 'Realizado'"
                        (click)="cancelAppt(a)">
                  Cancelar turno
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  </main>
</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing:border-box; }
    .page-wrapper { min-height:100vh; background:#0a0a0f; font-family:'DM Sans',sans-serif; color:#f1f5f9; }

    /* Navbar */
    .navbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:1rem 2rem; background:rgba(255,255,255,.04);
      border-bottom:1px solid rgba(255,255,255,.08);
      position:sticky; top:0; z-index:10; backdrop-filter:blur(8px);
    }
    .nav-logo { font-family:'Syne',sans-serif; font-weight:800; color:#818cf8; }
    .nav-actions { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }
    .btn-nav {
      padding:.38rem .85rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#94a3b8; text-decoration:none; font-size:.83rem; transition:background .2s;
    }
    .btn-nav:hover { background:rgba(255,255,255,.12); color:#f1f5f9; }
    .btn-primary-sm {
      padding:.42rem 1rem; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff; border:none; border-radius:8px; font-size:.85rem;
      font-weight:600; cursor:pointer; text-decoration:none; transition:opacity .2s;
    }
    .btn-primary-sm:hover { opacity:.85; }

    /* Page */
    .page-main { padding:2rem; max-width:1200px; margin:0 auto; }

    .page-header {
      display:flex; align-items:flex-start; justify-content:space-between;
      margin-bottom:1.75rem; flex-wrap:wrap; gap:1rem;
    }
    .page-title { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-.03em; }
    .page-sub { color:#64748b; font-size:.9rem; margin-top:.2rem; }

    .header-stats { display:flex; gap:.75rem; flex-wrap:wrap; }
    .stat {
      display:flex; flex-direction:column; align-items:center;
      padding:.6rem 1rem; background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08); border-radius:12px; min-width:70px;
    }
    .stat-num   { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#e2e8f0; }
    .stat-label { font-size:.7rem; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }
    .stat-green .stat-num  { color:#34d399; }
    .stat-yellow .stat-num { color:#fbbf24; }
    .stat-gray .stat-num   { color:#818cf8; }

    /* Main grid */
    .main-grid {
      display:grid;
      grid-template-columns:280px 1fr;
      gap:1.5rem;
      align-items:start;
    }
    @media (max-width:768px) {
      .main-grid { grid-template-columns:1fr; }
    }

    /* Sidebar */
    .sidebar { display:flex; flex-direction:column; gap:1rem; position:sticky; top:72px; }

    /* Calendar */
    .calendar-card {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
      border-radius:16px; padding:1.25rem; overflow:hidden;
    }
    .cal-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:1rem;
    }
    .cal-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.95rem; color:#e2e8f0; }
    .cal-nav {
      width:28px; height:28px; border-radius:8px; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); color:#94a3b8; cursor:pointer;
      font-size:1rem; display:flex; align-items:center; justify-content:center;
      transition:background .2s;
    }
    .cal-nav:hover { background:rgba(255,255,255,.12); color:#f1f5f9; }

    .cal-days-header {
      display:grid; grid-template-columns:repeat(7,1fr);
      margin-bottom:.4rem;
    }
    .cal-days-header span {
      text-align:center; font-size:.7rem; color:#475569;
      font-weight:600; text-transform:uppercase; padding:.2rem 0;
    }

    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
    .cal-cell {
      position:relative; aspect-ratio:1; display:flex; align-items:center;
      justify-content:center; border-radius:8px; font-size:.82rem; cursor:pointer;
      color:#64748b; transition:all .15s; flex-direction:column; gap:1px;
    }
    .cal-cell:not(.cal-empty):hover { background:rgba(129,140,248,.15); color:#a5b4fc; }
    .cal-empty { cursor:default; }
    .cal-today { background:rgba(99,102,241,.2); color:#a5b4fc; font-weight:700; }
    .cal-selected {
      background:linear-gradient(135deg,#6366f1,#8b5cf6) !important;
      color:#fff !important; font-weight:700;
    }
    .cal-has-appts { color:#e2e8f0; }
    .cal-dot {
      width:4px; height:4px; border-radius:50%;
      background:#6366f1; position:absolute; bottom:3px;
    }
    .cal-selected .cal-dot { background:rgba(255,255,255,.7); }

    .btn-today {
      width:100%; margin-top:.75rem; padding:.45rem;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:8px; color:#94a3b8; cursor:pointer; font-size:.82rem;
      transition:background .2s;
    }
    .btn-today:hover { background:rgba(255,255,255,.1); color:#f1f5f9; }

    /* Search card */
    .search-card {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
      border-radius:16px; padding:1.25rem;
    }
    .search-title {
      font-family:'Syne',sans-serif; font-weight:700; font-size:.9rem;
      color:#a5b4fc; margin-bottom:.9rem;
    }
    .dni-input-row { display:flex; gap:.5rem; margin-bottom:.6rem; }
    .dni-input-row input {
      flex:1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:8px; padding:.55rem .8rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.88rem; outline:none;
      transition:border-color .2s;
    }
    .dni-input-row input:focus { border-color:#818cf8; }
    .dni-input-row input::placeholder { color:#475569; }
    .btn-search {
      padding:.5rem .85rem; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff; border:none; border-radius:8px; font-size:.82rem;
      font-weight:600; cursor:pointer; transition:opacity .2s; white-space:nowrap;
    }
    .btn-search:hover:not(:disabled) { opacity:.85; }
    .btn-search:disabled { opacity:.4; cursor:not-allowed; }
    .btn-clear-search {
      width:100%; padding:.38rem; background:none;
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#64748b; cursor:pointer; font-size:.78rem; margin-bottom:.75rem;
      transition:background .2s;
    }
    .btn-clear-search:hover { background:rgba(255,255,255,.05); color:#94a3b8; }

    .alert { border-radius:8px; padding:.6rem .9rem; font-size:.82rem; margin-top:.5rem; }
    .alert-error { background:rgba(248,113,113,.1); color:#fca5a5; border:1px solid rgba(248,113,113,.2); }

    .results-label { font-size:.75rem; color:#64748b; margin-bottom:.5rem; }
    .dni-results { display:flex; flex-direction:column; gap:.5rem; max-height:280px; overflow-y:auto; }
    .dni-result-item {
      display:flex; gap:.75rem; padding:.6rem .75rem;
      background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
      border-radius:10px;
    }
    .result-date { display:flex; flex-direction:column; align-items:center; min-width:48px; }
    .result-date strong { font-size:.8rem; color:#e2e8f0; }
    .result-date span   { font-size:.72rem; color:#818cf8; }
    .result-info { display:flex; flex-direction:column; gap:.15rem; flex:1; }
    .result-info strong { font-size:.82rem; color:#e2e8f0; }
    .result-info span   { font-size:.75rem; color:#64748b; }

    /* Agenda section */
    .agenda-section { min-height:400px; }

    .loading-row { display:flex; align-items:center; gap:.75rem; color:#64748b; padding:2rem 0; }
    .spinner-sm {
      width:20px; height:20px; border:2px solid rgba(255,255,255,.1);
      border-top-color:#818cf8; border-radius:50%; animation:spin .7s linear infinite;
    }

    .empty-day {
      display:flex; flex-direction:column; align-items:center; gap:1rem;
      padding:4rem 2rem; color:#475569; text-align:center;
    }
    .empty-icon { font-size:3rem; }

    /* Timeline */
    .timeline { display:flex; flex-direction:column; }

    .timeline-item {
      display:grid; grid-template-columns:64px 24px 1fr;
      gap:0 .75rem; align-items:start;
    }

    .tl-time {
      display:flex; flex-direction:column; align-items:flex-end;
      padding-top:.9rem;
    }
    .tl-hour { font-family:'Syne',sans-serif; font-weight:700; font-size:.95rem; color:#a5b4fc; }
    .tl-duration { font-size:.72rem; color:#475569; }

    .tl-line { display:flex; flex-direction:column; align-items:center; }
    .tl-dot {
      width:14px; height:14px; border-radius:50%; margin-top:1rem; flex-shrink:0;
      border:2px solid currentColor;
    }
    .dot-pendiente  { color:#fbbf24; background:rgba(251,191,36,.2); }
    .dot-confirmado { color:#34d399; background:rgba(52,211,153,.2); }
    .dot-realizado  { color:#818cf8; background:rgba(129,140,248,.2); }
    .dot-cancelado  { color:#f87171; background:rgba(248,113,113,.2); }

    .tl-connector { flex:1; width:2px; background:rgba(255,255,255,.06); min-height:16px; }

    .tl-card {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1rem 1.25rem; margin-bottom:1rem;
      transition:border-color .2s;
    }
    .timeline-item--confirmado .tl-card { border-color:rgba(52,211,153,.2); }
    .timeline-item--pendiente  .tl-card { border-color:rgba(251,191,36,.15); }
    .timeline-item--cancelado  .tl-card { opacity:.55; }

    .tl-card-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:.75rem; gap:.75rem; flex-wrap:wrap;
    }
    .patient-info { display:flex; align-items:center; gap:.75rem; }
    .patient-info div { display:flex; flex-direction:column; gap:.15rem; }
    .patient-info strong { font-size:.95rem; color:#e2e8f0; }

    .avatar-sm {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.8rem; font-weight:800; color:#fff;
    }

    .specialty-tag {
      font-size:.72rem; padding:.15rem .55rem; border-radius:999px;
      background:rgba(14,165,233,.12); color:#7dd3fc;
      border:1px solid rgba(14,165,233,.2); display:inline-block;
    }

    .tl-card-body { display:flex; flex-direction:column; gap:.35rem; margin-bottom:.9rem; }
    .tl-detail { display:flex; align-items:center; gap:.5rem; font-size:.85rem; color:#94a3b8; }

    .tl-card-footer { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }

    .status-select {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
      border-radius:8px; padding:.3rem .65rem; font-size:.8rem;
      font-family:'DM Sans',sans-serif; cursor:pointer; outline:none; color:#f1f5f9;
    }
    .sel-pendiente  { border-color:rgba(251,191,36,.4);  color:#fbbf24; }
    .sel-confirmado { border-color:rgba(52,211,153,.4);  color:#34d399; }
    .sel-realizado  { border-color:rgba(129,140,248,.4); color:#a5b4fc; }
    .sel-cancelado  { border-color:rgba(248,113,113,.4); color:#f87171; }

    .btn-cancel-appt {
      padding:.3rem .8rem; background:rgba(248,113,113,.1);
      border:1px solid rgba(248,113,113,.2); border-radius:8px;
      color:#fca5a5; cursor:pointer; font-size:.78rem; transition:background .2s;
    }
    .btn-cancel-appt:hover { background:rgba(248,113,113,.2); }

    /* Status pills */
    .status-pill {
      padding:.2rem .65rem; border-radius:999px; font-size:.72rem; font-weight:600;
    }
    .pill-pendiente  { background:rgba(251,191,36,.15);  color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
    .pill-confirmado { background:rgba(52,211,153,.15);  color:#34d399; border:1px solid rgba(52,211,153,.3); }
    .pill-realizado  { background:rgba(129,140,248,.15); color:#a5b4fc; border:1px solid rgba(129,140,248,.3); }
    .pill-cancelado  { background:rgba(248,113,113,.15); color:#f87171; border:1px solid rgba(248,113,113,.3); }

    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class AgendaComponent implements OnInit {
  private svc  = inject(AppointmentService);
  private http = inject(HttpClient);

  // Estado del calendario
  today        = this.toIso(new Date());
  selectedDate = this.today;
  calMonth     = new Date().getMonth();
  calYear      = new Date().getFullYear();

  dayNames  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  calCells: { day: number|null; date: string|null; isToday: boolean; hasAppts: boolean }[] = [];
  monthName = '';

  // Turnos
  allAppointments:  AppointmentDto[] = [];
  dayAppointments:  AppointmentDto[] = [];
  loading = true;

  // Búsqueda DNI
  dniSearch  = '';
  dniResults: AppointmentDto[] | null = null;

  readonly MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: data => {
        this.allAppointments = data;
        this.buildCalendar();
        this.filterDay();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Calendario ──────────────────────────────────────
  buildCalendar(): void {
    this.monthName = this.MONTHS[this.calMonth];
    const first    = new Date(this.calYear, this.calMonth, 1).getDay();
    const days     = new Date(this.calYear, this.calMonth + 1, 0).getDate();

    // Fechas con turnos este mes
    const datesWithAppts = new Set(
      this.allAppointments.map(a => a.appointmentDate)
    );

    this.calCells = [];

    // Celdas vacías al inicio
    for (let i = 0; i < first; i++) {
      this.calCells.push({ day: null, date: null, isToday: false, hasAppts: false });
    }

    for (let d = 1; d <= days; d++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      this.calCells.push({
        day:      d,
        date:     dateStr,
        isToday:  dateStr === this.today,
        hasAppts: datesWithAppts.has(dateStr)
      });
    }
  }

  prevMonth(): void {
    if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
    else this.calMonth--;
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
    else this.calMonth++;
    this.buildCalendar();
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.filterDay();
    this.dniResults = null;
    this.dniSearch  = '';
  }

  goToday(): void {
    const now      = new Date();
    this.calMonth  = now.getMonth();
    this.calYear   = now.getFullYear();
    this.selectedDate = this.today;
    this.buildCalendar();
    this.filterDay();
  }

  // ── Turnos del día ──────────────────────────────────
  filterDay(): void {
    this.dayAppointments = this.allAppointments
      .filter(a => a.appointmentDate === this.selectedDate)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }

  // ── Búsqueda DNI ────────────────────────────────────
  searchByDni(): void {
    if (!this.dniSearch.trim()) return;
    const q = this.dniSearch.trim();

    // Buscar cliente por DNI y luego sus turnos
    this.http.get<any>(`${environment.apiUrl}/clients/search/${q}`).subscribe({
      next: client => {
        this.dniResults = this.allAppointments
          .filter(a => a.clientId === client.id)
          .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
      },
      error: () => { this.dniResults = []; }
    });
  }

  clearDni(): void {
    this.dniResults = null;
    this.dniSearch  = '';
  }

  // ── Acciones ────────────────────────────────────────
  changeStatus(a: AppointmentDto, status: string): void {
    this.svc.updateStatus(a.id, status).subscribe({
      next: updated => {
        const idx = this.allAppointments.findIndex(x => x.id === a.id);
        if (idx >= 0) this.allAppointments[idx] = updated;
        this.filterDay();
        this.buildCalendar();
      }
    });
  }

  cancelAppt(a: AppointmentDto): void {
    if (!confirm(`¿Cancelar el turno de ${a.clientName}?`)) return;
    this.changeStatus(a, 'Cancelado');
  }

  // ── Helpers ─────────────────────────────────────────
  countStatus(status: string): number {
    return this.dayAppointments.filter(a => a.status === status).length;
  }

  isToday(date: string): boolean {
    return date === this.today;
  }

  initials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  formatDateLong(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(+y, +m - 1, +d);
    const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    return `${days[date.getDay()]} ${+d} de ${this.MONTHS[+m - 1]} de ${y}`;
  }

  formatDateShort(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}
