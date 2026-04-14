// src/app/features/appointments/new-appointment/new-appointment.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { ClientService } from '../../../core/services/client.service';
import { DoctorSelectDto } from '../../../core/models/doctor.models';
import { ClientDto } from '../../../core/models/client.models';
import { DoctorAvailability } from '../../../core/models/appointment.models';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/appointments" class="btn-nav">← Volver a turnos</a>
    </div>
  </nav>

  <main class="page-main">
    <h1 class="page-title">📅 Nueva cita médica</h1>
    <p class="page-sub">Asigná un turno a un paciente con un profesional</p>

    <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
    <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

    <!-- PASO 1: Paciente -->
    <div class="section" [class.section-done]="selectedClient">
      <div class="section-header">
        <span class="step-badge">1</span>
        <h2 class="section-title">👤 Seleccionar paciente</h2>
        <span class="done-check" *ngIf="selectedClient">✅</span>
      </div>

      <div class="search-row">
        <input type="text" [(ngModel)]="clientSearch"
               (ngModelChange)="filterClients()"
               placeholder="Buscar por nombre o DNI..." />
        <button class="btn-clear" *ngIf="selectedClient" (click)="clearClient()">Cambiar</button>
      </div>

      <!-- Cliente seleccionado -->
      <div class="selected-card" *ngIf="selectedClient">
        <div class="avatar-sm">{{ initials(selectedClient.firstName, selectedClient.lastName) }}</div>
        <div>
          <strong>{{ selectedClient.lastName }}, {{ selectedClient.firstName }}</strong>
          <span>DNI: {{ selectedClient.dni }} | 📞 {{ selectedClient.phone }}</span>
          <span *ngIf="selectedClient.hasHealthInsurance">🏥 {{ selectedClient.healthInsuranceName }}</span>
        </div>
      </div>

      <!-- Lista de clientes -->
      <div class="dropdown-list" *ngIf="!selectedClient && filteredClients.length > 0">
        <div class="dropdown-item" *ngFor="let c of filteredClients" (click)="selectClient(c)">
          <div class="avatar-xs">{{ initials(c.firstName, c.lastName) }}</div>
          <div>
            <strong>{{ c.lastName }}, {{ c.firstName }}</strong>
            <span>DNI: {{ c.dni }}</span>
          </div>
        </div>
      </div>
      <p class="hint" *ngIf="!selectedClient && clientSearch.length > 1 && filteredClients.length === 0">
        No se encontraron pacientes con ese criterio.
      </p>
    </div>

    <!-- PASO 2: Especialidad y médico -->
    <div class="section" [class.section-disabled]="!selectedClient" [class.section-done]="selectedDoctor">
      <div class="section-header">
        <span class="step-badge">2</span>
        <h2 class="section-title">🩺 Seleccionar médico</h2>
        <span class="done-check" *ngIf="selectedDoctor">✅</span>
      </div>

      <div class="grid-2" *ngIf="selectedClient">
        <div class="field">
          <label>Especialidad</label>
          <select [(ngModel)]="selectedSpecialty" (ngModelChange)="onSpecialtyChange()">
            <option value="">Todas las especialidades</option>
            <option *ngFor="let s of specialties" [value]="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Lista de médicos filtrada -->
      <div class="doctors-grid" *ngIf="selectedClient && filteredDoctors.length > 0 && !selectedDoctor">
        <div class="doctor-card" *ngFor="let d of filteredDoctors" (click)="selectDoctor(d)">
          <div class="avatar-md">{{ initials2(d.fullName) }}</div>
          <div class="doctor-info">
            <strong>{{ d.fullName }}</strong>
            <span class="specialty-badge">{{ d.specialty }}</span>
            <small>Mat: {{ d.licenseNumber }}</small>
          </div>
        </div>
      </div>

      <!-- Médico seleccionado -->
      <div class="selected-card" *ngIf="selectedDoctor">
        <div class="avatar-md">{{ initials2(selectedDoctor.fullName) }}</div>
        <div>
          <strong>{{ selectedDoctor.fullName }}</strong>
          <span class="specialty-badge">{{ selectedDoctor.specialty }}</span>
          <small>Matrícula: {{ selectedDoctor.licenseNumber }}</small>
        </div>
        <button class="btn-clear" (click)="clearDoctor()">Cambiar</button>
      </div>

      <p class="hint" *ngIf="selectedClient && filteredDoctors.length === 0 && !selectedDoctor">
        No hay médicos disponibles para esa especialidad.
      </p>
    </div>

    <!-- PASO 3: Disponibilidad y turno -->
    <div class="section" [class.section-disabled]="!selectedDoctor">
      <div class="section-header">
        <span class="step-badge">3</span>
        <h2 class="section-title">📆 Elegir turno</h2>
      </div>

      <div class="week-nav" *ngIf="selectedDoctor">
        <button class="btn-week" (click)="prevWeek()" [disabled]="weekOffset <= 0">← Semana anterior</button>
        <span class="week-label">Semana del {{ weekStart }}</span>
        <button class="btn-week" (click)="nextWeek()">Semana siguiente →</button>
      </div>

      <div class="loading-slots" *ngIf="loadingSlots">
        <div class="spinner-sm"></div> Cargando disponibilidad...
      </div>

      <div class="availability-grid" *ngIf="selectedDoctor && !loadingSlots">
        <div class="day-col" *ngFor="let day of availability">
          <div class="day-header">
            <span class="day-name">{{ day.dayName }}</span>
            <span class="day-date">{{ formatDate(day.date) }}</span>
          </div>
          <div class="slot-list">
            <button *ngFor="let slot of day.slots"
                    class="slot"
                    [class.slot-available]="slot.available"
                    [class.slot-taken]="!slot.available"
                    [class.slot-selected]="selectedDate === day.date && selectedTime === slot.time"
                    [disabled]="!slot.available"
                    (click)="selectSlot(day.date, slot.time)">
              {{ slot.time }}
            </button>
          </div>
        </div>
      </div>

      <!-- Notas -->
      <div class="field notes-field" *ngIf="selectedDate && selectedTime">
        <label>Notas del turno (opcional)</label>
        <textarea [(ngModel)]="notes" placeholder="Motivo de consulta, observaciones..." rows="3"></textarea>
      </div>

      <!-- Resumen y confirmar -->
      <div class="summary-box" *ngIf="selectedDate && selectedTime">
        <h3>📋 Resumen del turno</h3>
        <div class="summary-grid">
          <div><span>Paciente</span><strong>{{ selectedClient?.lastName }}, {{ selectedClient?.firstName }}</strong></div>
          <div><span>Médico</span><strong>{{ selectedDoctor?.fullName }}</strong></div>
          <div><span>Especialidad</span><strong>{{ selectedDoctor?.specialty }}</strong></div>
          <div><span>Fecha</span><strong>{{ formatDateFull(selectedDate) }}</strong></div>
          <div><span>Hora</span><strong>{{ selectedTime }} hs</strong></div>
          <div><span>Duración</span><strong>50 minutos</strong></div>
        </div>
        <button class="btn-confirm" (click)="confirm()" [disabled]="saving">
          <span *ngIf="!saving">✅ Confirmar turno</span>
          <span *ngIf="saving" class="spinner"></span>
        </button>
      </div>

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
    .btn-nav {
      padding:.4rem .9rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#94a3b8; text-decoration:none; font-size:.85rem; transition:background .2s;
    }
    .btn-nav:hover { background:rgba(255,255,255,.12); color:#f1f5f9; }

    .page-main { padding:2.5rem 2rem; max-width:1000px; margin:0 auto; }
    .page-title { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-.03em; }
    .page-sub { color:#64748b; font-size:.88rem; margin-top:.2rem; margin-bottom:1.75rem; }

    .alert { border-radius:10px; padding:.75rem 1rem; font-size:.88rem; margin-bottom:1rem; }
    .alert-success { background:rgba(52,211,153,.12); color:#6ee7b7; border:1px solid rgba(52,211,153,.25); }
    .alert-error   { background:rgba(248,113,113,.12); color:#fca5a5; border:1px solid rgba(248,113,113,.25); }

    /* Sections */
    .section {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      border-radius:16px; padding:1.75rem; margin-bottom:1.5rem;
      transition:opacity .3s;
    }
    .section-disabled { opacity:.4; pointer-events:none; }
    .section-done { border-color:rgba(52,211,153,.3); }

    .section-header { display:flex; align-items:center; gap:.75rem; margin-bottom:1.25rem; }
    .step-badge {
      width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-weight:800; font-size:.85rem; color:#fff; flex-shrink:0;
    }
    .section-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#a5b4fc; margin:0; }
    .done-check { margin-left:auto; font-size:1.1rem; }

    /* Search */
    .search-row { display:flex; gap:.75rem; align-items:center; margin-bottom:1rem; }
    .search-row input {
      flex:1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.65rem 1rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem; outline:none;
      transition:border-color .2s;
    }
    .search-row input:focus { border-color:#818cf8; }
    .search-row input::placeholder { color:#475569; }
    .btn-clear {
      padding:.5rem 1rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#94a3b8; cursor:pointer; font-size:.85rem; white-space:nowrap;
      transition:background .2s;
    }
    .btn-clear:hover { background:rgba(255,255,255,.12); color:#f1f5f9; }

    /* Dropdown */
    .dropdown-list {
      border:1px solid rgba(255,255,255,.1); border-radius:12px; overflow:hidden;
      max-height:260px; overflow-y:auto;
    }
    .dropdown-item {
      display:flex; align-items:center; gap:.75rem; padding:.75rem 1rem;
      cursor:pointer; border-bottom:1px solid rgba(255,255,255,.05);
      transition:background .15s;
    }
    .dropdown-item:last-child { border-bottom:none; }
    .dropdown-item:hover { background:rgba(99,102,241,.1); }
    .dropdown-item div { display:flex; flex-direction:column; }
    .dropdown-item strong { font-size:.92rem; color:#e2e8f0; }
    .dropdown-item span { font-size:.78rem; color:#64748b; }

    /* Selected card */
    .selected-card {
      display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem;
      background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.25);
      border-radius:12px;
    }
    .selected-card div { display:flex; flex-direction:column; gap:.2rem; flex:1; }
    .selected-card strong { color:#e2e8f0; font-size:.95rem; }
    .selected-card span  { color:#94a3b8; font-size:.82rem; }
    .selected-card small { color:#64748b; font-size:.78rem; }

    /* Avatars */
    .avatar-xs {
      width:28px; height:28px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.72rem; font-weight:800; color:#fff;
    }
    .avatar-sm {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.82rem; font-weight:800; color:#fff;
    }
    .avatar-md {
      width:44px; height:44px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#0ea5e9,#6366f1);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-size:.9rem; font-weight:800; color:#fff;
    }

    /* Doctors grid */
    .grid-2 { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1rem; margin-bottom:1.25rem; }
    .field { display:flex; flex-direction:column; gap:.35rem; }
    label { font-size:.78rem; font-weight:500; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
    select {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.65rem 1rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem; outline:none; width:100%;
    }
    select option { background:#1e293b; }

    .doctors-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:.75rem; margin-top:.75rem; }
    .doctor-card {
      display:flex; align-items:center; gap:.75rem; padding:1rem;
      background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
      border-radius:12px; cursor:pointer; transition:all .2s;
    }
    .doctor-card:hover { background:rgba(14,165,233,.1); border-color:rgba(14,165,233,.3); transform:translateY(-2px); }
    .doctor-info { display:flex; flex-direction:column; gap:.25rem; }
    .doctor-info strong { font-size:.88rem; color:#e2e8f0; }
    .doctor-info small  { font-size:.75rem; color:#64748b; }
    .specialty-badge {
      display:inline-block; padding:.15rem .6rem; border-radius:999px;
      background:rgba(14,165,233,.15); color:#7dd3fc;
      border:1px solid rgba(14,165,233,.2); font-size:.72rem; font-weight:500;
    }

    /* Availability */
    .week-nav {
      display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap;
    }
    .week-label { font-size:.9rem; color:#94a3b8; flex:1; text-align:center; }
    .btn-week {
      padding:.45rem .9rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.1); border-radius:8px;
      color:#94a3b8; cursor:pointer; font-size:.82rem; transition:background .2s;
    }
    .btn-week:hover:not(:disabled) { background:rgba(255,255,255,.12); color:#f1f5f9; }
    .btn-week:disabled { opacity:.4; cursor:not-allowed; }

    .availability-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.75rem;
    }
    .day-col { display:flex; flex-direction:column; gap:.4rem; }
    .day-header { text-align:center; padding:.5rem 0; border-bottom:1px solid rgba(255,255,255,.07); }
    .day-name { display:block; font-family:'Syne',sans-serif; font-weight:700; font-size:.85rem; color:#a5b4fc; }
    .day-date { display:block; font-size:.75rem; color:#64748b; margin-top:.1rem; }
    .slot-list { display:flex; flex-direction:column; gap:.3rem; }

    .slot {
      padding:.45rem; border-radius:8px; font-size:.82rem; font-weight:500;
      cursor:pointer; border:1px solid transparent; transition:all .15s; text-align:center;
    }
    .slot-available {
      background:rgba(52,211,153,.1); color:#6ee7b7;
      border-color:rgba(52,211,153,.25);
    }
    .slot-available:hover { background:rgba(52,211,153,.2); transform:scale(1.03); }
    .slot-taken {
      background:rgba(100,116,139,.08); color:#475569;
      border-color:rgba(100,116,139,.15); cursor:not-allowed;
      text-decoration:line-through;
    }
    .slot-selected {
      background:rgba(99,102,241,.35) !important; color:#c7d2fe !important;
      border-color:#6366f1 !important; box-shadow:0 0 0 2px rgba(99,102,241,.25);
    }

    .loading-slots { display:flex; align-items:center; gap:.75rem; color:#64748b; padding:1rem 0; }
    .spinner-sm {
      width:20px; height:20px; border:2px solid rgba(255,255,255,.1);
      border-top-color:#818cf8; border-radius:50%; animation:spin .7s linear infinite;
    }

    /* Notes */
    .notes-field { margin-top:1.25rem; }
    textarea {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.75rem 1rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem; outline:none; width:100%; resize:vertical;
    }
    textarea:focus { border-color:#818cf8; }
    textarea::placeholder { color:#475569; }

    /* Summary */
    .summary-box {
      margin-top:1.5rem; padding:1.5rem;
      background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.2);
      border-radius:16px;
    }
    .summary-box h3 { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#a5b4fc; margin-bottom:1rem; }
    .summary-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:.75rem; margin-bottom:1.5rem; }
    .summary-grid div { display:flex; flex-direction:column; gap:.2rem; }
    .summary-grid span { font-size:.75rem; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }
    .summary-grid strong { color:#e2e8f0; font-size:.95rem; }

    .btn-confirm {
      width:100%; padding:.9rem; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff; border:none; border-radius:12px;
      font-family:'Syne',sans-serif; font-size:1.05rem; font-weight:700;
      cursor:pointer; transition:opacity .2s; display:flex; align-items:center;
      justify-content:center; gap:.5rem; min-height:50px;
    }
    .btn-confirm:hover:not(:disabled) { opacity:.88; }
    .btn-confirm:disabled { opacity:.5; cursor:not-allowed; }

    .hint { color:#475569; font-size:.85rem; margin-top:.5rem; }

    .spinner {
      width:20px; height:20px; border:2px solid rgba(255,255,255,.3);
      border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class NewAppointmentComponent implements OnInit {
  private apptSvc   = inject(AppointmentService);
  private doctorSvc = inject(DoctorService);
  private clientSvc = inject(ClientService);
  private router    = inject(Router);

  // Step 1 - Cliente
  allClients:     ClientDto[]       = [];
  filteredClients: ClientDto[]      = [];
  clientSearch    = '';
  selectedClient: ClientDto | null  = null;

  // Step 2 - Médico
  specialties:     string[]         = [];
  allDoctors:      DoctorSelectDto[]= [];
  filteredDoctors: DoctorSelectDto[]= [];
  selectedSpecialty = '';
  selectedDoctor:  DoctorSelectDto | null = null;

  // Step 3 - Turno
  availability:  DoctorAvailability[] = [];
  loadingSlots   = false;
  weekOffset     = 0;
  weekStart      = '';
  selectedDate   = '';
  selectedTime   = '';
  notes          = '';

  saving     = false;
  successMsg = '';
  errorMsg   = '';

  ngOnInit(): void {
    this.clientSvc.getAll().subscribe(data => {
      this.allClients = data;
    });
    this.apptSvc.getSpecialties().subscribe(data => {
      this.specialties = data;
    });
    this.doctorSvc.getForSelect().subscribe(data => {
      this.allDoctors     = data;
      this.filteredDoctors = data;
    });
  }

  // ── Step 1 ──────────────────────────────────────────
  filterClients(): void {
    const q = this.clientSearch.toLowerCase();
    if (q.length < 2) { this.filteredClients = []; return; }
    this.filteredClients = this.allClients.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q)  ||
      c.dni.includes(q)).slice(0, 8);
  }

  selectClient(c: ClientDto): void {
    this.selectedClient  = c;
    this.filteredClients = [];
    this.clientSearch    = '';
  }

  clearClient(): void {
    this.selectedClient = null;
    this.clearDoctor();
  }

  // ── Step 2 ──────────────────────────────────────────
  onSpecialtyChange(): void {
    this.filteredDoctors = this.selectedSpecialty
      ? this.allDoctors.filter(d => d.specialty === this.selectedSpecialty)
      : this.allDoctors;
    this.clearDoctor();
  }

  selectDoctor(d: DoctorSelectDto): void {
    this.selectedDoctor = d;
    this.loadAvailability();
  }

  clearDoctor(): void {
    this.selectedDoctor = null;
    this.availability   = [];
    this.selectedDate   = '';
    this.selectedTime   = '';
    this.weekOffset     = 0;
  }

  // ── Step 3 ──────────────────────────────────────────
  loadAvailability(): void {
    if (!this.selectedDoctor) return;
    this.loadingSlots = true;
    this.selectedDate = '';
    this.selectedTime = '';

    const from = this.getWeekStart();
    this.weekStart = from;

    this.apptSvc.getAvailability(this.selectedDoctor.id, from, 5).subscribe({
      next:  data => { this.availability = data; this.loadingSlots = false; },
      error: ()   => { this.loadingSlots = false; }
    });
  }

  prevWeek(): void { if (this.weekOffset > 0) { this.weekOffset--; this.loadAvailability(); } }
  nextWeek(): void { this.weekOffset++; this.loadAvailability(); }

  selectSlot(date: string, time: string): void {
    this.selectedDate = date;
    this.selectedTime = time;
  }

  // ── Confirm ─────────────────────────────────────────
  confirm(): void {
    if (!this.selectedClient || !this.selectedDoctor || !this.selectedDate || !this.selectedTime) return;

    this.saving   = true;
    this.errorMsg = '';

    this.apptSvc.create({
      clientId:        this.selectedClient.id,
      doctorId:        this.selectedDoctor.id,
      appointmentDate: this.selectedDate,
      appointmentTime: this.selectedTime,
      durationMinutes: 50,
      notes:           this.notes || undefined
    }).subscribe({
      next: () => {
        this.saving     = false;
        this.successMsg = '✅ Turno asignado correctamente.';
        setTimeout(() => this.router.navigate(['/appointments']), 1500);
      },
      error: (err) => {
        this.saving   = false;
        this.errorMsg = err.status === 409
          ? 'Ese horario ya fue tomado. Elegí otro.'
          : 'Error al guardar el turno.';
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────
  private getWeekStart(): string {
    const d = new Date();
    d.setDate(d.getDate() + this.weekOffset * 5);
    // Avanzar al lunes si es fin de semana
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  formatDateFull(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  initials(first: string, last: string): string {
    return (first[0] + last[0]).toUpperCase();
  }

  initials2(fullName: string): string {
    const parts = fullName.replace('Dr/a. ', '').split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  }
}
