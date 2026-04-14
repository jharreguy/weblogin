// src/app/features/doctors/doctor-form/doctor-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor.service';

const SPECIALTIES = [
  'Psicología', 'Psiquiatría', 'Clínica Médica', 'Cardiología',
  'Dermatología', 'Ginecología', 'Neurología', 'Oftalmología',
  'Odontología', 'Ortopedia', 'Pediatría', 'Traumatología', 'Otra'
];

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/doctors" class="btn-nav">← Volver a médicos</a>
    </div>
  </nav>

  <main class="page-main">
    <h1 class="page-title">{{ isEdit ? '✏️ Editar médico' : '🩺 Nuevo médico' }}</h1>
    <p class="page-sub">{{ isEdit ? 'Modificá los datos del profesional' : 'Completá los datos del nuevo profesional' }}</p>

    <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
    <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

      <!-- ── Datos profesionales ── -->
      <div class="section">
        <h2 class="section-title">🩺 Datos profesionales</h2>
        <div class="grid-2">

          <div class="field">
            <label>Nombre *</label>
            <input type="text" formControlName="firstName" placeholder="Nombre"
                   [class.error]="isInvalid('firstName')" />
            <span class="err-msg" *ngIf="isInvalid('firstName')">Requerido</span>
          </div>

          <div class="field">
            <label>Apellido *</label>
            <input type="text" formControlName="lastName" placeholder="Apellido"
                   [class.error]="isInvalid('lastName')" />
            <span class="err-msg" *ngIf="isInvalid('lastName')">Requerido</span>
          </div>

          <div class="field">
            <label>DNI *</label>
            <input type="text" formControlName="dni" placeholder="Ej: 20123456"
                   [class.error]="isInvalid('dni')" />
            <span class="err-msg" *ngIf="isInvalid('dni')">Requerido</span>
          </div>

          <div class="field">
            <label>Matrícula médica *</label>
            <input type="text" formControlName="licenseNumber" placeholder="Ej: MN 12345"
                   [class.error]="isInvalid('licenseNumber')" />
            <span class="err-msg" *ngIf="isInvalid('licenseNumber')">Requerido</span>
          </div>

          <div class="field">
            <label>Especialidad *</label>
            <select formControlName="specialty" [class.error]="isInvalid('specialty')">
              <option value="">Seleccioná una especialidad...</option>
              <option *ngFor="let s of specialties" [value]="s">{{ s }}</option>
            </select>
            <span class="err-msg" *ngIf="isInvalid('specialty')">Requerido</span>
          </div>

          <div class="field">
            <label>Teléfono</label>
            <input type="text" formControlName="phone" placeholder="Ej: 11 4567-8901" />
          </div>

          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com" />
          </div>

        </div>
      </div>

      <!-- ── Domicilio ── -->
      <div class="section">
        <h2 class="section-title">📍 Domicilio del consultorio</h2>
        <div class="grid-2">

          <div class="field" style="grid-column: 1 / -1">
            <label>Tipo de vivienda *</label>
            <div class="radio-group">
              <label class="radio-option" [class.selected]="form.get('addressType')?.value === 'Casa'">
                <input type="radio" formControlName="addressType" value="Casa" />
                🏡 Casa / PH
              </label>
              <label class="radio-option" [class.selected]="form.get('addressType')?.value === 'Edificio'">
                <input type="radio" formControlName="addressType" value="Edificio" />
                🏢 Edificio
              </label>
            </div>
          </div>

          <div class="field">
            <label>Calle *</label>
            <input type="text" formControlName="street" placeholder="Nombre de la calle"
                   [class.error]="isInvalid('street')" />
            <span class="err-msg" *ngIf="isInvalid('street')">Requerido</span>
          </div>

          <div class="field">
            <label>Número *</label>
            <input type="text" formControlName="streetNumber" placeholder="Ej: 1234"
                   [class.error]="isInvalid('streetNumber')" />
            <span class="err-msg" *ngIf="isInvalid('streetNumber')">Requerido</span>
          </div>

          <ng-container *ngIf="isEdificio">
            <div class="field">
              <label>Piso *</label>
              <input type="text" formControlName="floor" placeholder="Ej: 4"
                     [class.error]="isInvalid('floor')" />
              <span class="err-msg" *ngIf="isInvalid('floor')">Requerido para edificio</span>
            </div>
            <div class="field">
              <label>Departamento *</label>
              <input type="text" formControlName="apartment" placeholder="Ej: A"
                     [class.error]="isInvalid('apartment')" />
              <span class="err-msg" *ngIf="isInvalid('apartment')">Requerido para edificio</span>
            </div>
          </ng-container>

          <div class="field">
            <label>Ciudad *</label>
            <input type="text" formControlName="city" placeholder="Ciudad"
                   [class.error]="isInvalid('city')" />
            <span class="err-msg" *ngIf="isInvalid('city')">Requerido</span>
          </div>

          <div class="field">
            <label>Provincia *</label>
            <input type="text" formControlName="province" placeholder="Provincia"
                   [class.error]="isInvalid('province')" />
            <span class="err-msg" *ngIf="isInvalid('province')">Requerido</span>
          </div>

          <div class="field">
            <label>País *</label>
            <input type="text" formControlName="country" placeholder="País"
                   [class.error]="isInvalid('country')" />
            <span class="err-msg" *ngIf="isInvalid('country')">Requerido</span>
          </div>

        </div>
      </div>

      <div class="form-footer">
        <a routerLink="/doctors" class="btn-cancel">Cancelar</a>
        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="!loading">{{ isEdit ? '💾 Guardar cambios' : '✅ Registrar médico' }}</span>
          <span *ngIf="loading" class="spinner"></span>
        </button>
      </div>

    </form>
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

    .page-main { padding:2.5rem 2rem; max-width:860px; margin:0 auto; }
    .page-title { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; letter-spacing:-.03em; }
    .page-sub { color:#64748b; font-size:.88rem; margin-top:.2rem; margin-bottom:1.75rem; }

    .alert { border-radius:10px; padding:.75rem 1rem; font-size:.88rem; margin-bottom:1rem; }
    .alert-success { background:rgba(52,211,153,.12); color:#6ee7b7; border:1px solid rgba(52,211,153,.25); }
    .alert-error   { background:rgba(248,113,113,.12); color:#fca5a5; border:1px solid rgba(248,113,113,.25); }

    .section {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      border-radius:16px; padding:1.75rem; margin-bottom:1.5rem;
    }
    .section-title {
      font-family:'Syne',sans-serif; font-size:1rem; font-weight:700;
      color:#7dd3fc; margin-bottom:1.25rem;
    }
    .grid-2 { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:1rem; }

    .field { display:flex; flex-direction:column; gap:.35rem; }
    label { font-size:.78rem; font-weight:500; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
    input, select {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.65rem 1rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem;
      transition:border-color .2s, box-shadow .2s; outline:none; width:100%;
    }
    input::placeholder { color:#475569; }
    select option { background:#1e293b; }
    input:focus, select:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,.15); }
    input.error, select.error { border-color:#f87171; }
    .err-msg { font-size:.78rem; color:#f87171; }

    .radio-group { display:flex; gap:.75rem; }
    .radio-option {
      flex:1; max-width:160px; display:flex; align-items:center; justify-content:center; gap:.5rem;
      padding:.65rem 1rem; border-radius:10px; cursor:pointer;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      font-size:.9rem; color:#94a3b8; transition:all .2s;
    }
    .radio-option input[type="radio"] { display:none; }
    .radio-option.selected { background:rgba(14,165,233,.2); border-color:#0ea5e9; color:#7dd3fc; }

    .form-footer { display:flex; justify-content:flex-end; gap:1rem; margin-top:1rem; align-items:center; }
    .btn-cancel {
      padding:.75rem 1.5rem; background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      color:#94a3b8; text-decoration:none; font-size:.95rem; transition:background .2s;
    }
    .btn-cancel:hover { background:rgba(255,255,255,.1); }
    .btn-primary {
      padding:.8rem 2rem; background:linear-gradient(135deg,#0ea5e9,#6366f1);
      color:#fff; border:none; border-radius:10px;
      font-family:'Syne',sans-serif; font-size:1rem; font-weight:700;
      cursor:pointer; transition:opacity .2s; display:flex; align-items:center; gap:.5rem; min-height:46px;
    }
    .btn-primary:hover:not(:disabled) { opacity:.88; }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .spinner {
      width:18px; height:18px; border:2px solid rgba(255,255,255,.3);
      border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class DoctorFormComponent implements OnInit {
  private svc    = inject(DoctorService);
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  specialties = SPECIALTIES;
  isEdit      = false;
  doctorId    = 0;
  loading     = false;
  successMsg  = '';
  errorMsg    = '';

  form = this.fb.group({
    firstName:     ['', Validators.required],
    lastName:      ['', Validators.required],
    dni:           ['', Validators.required],
    licenseNumber: ['', Validators.required],
    specialty:     ['', Validators.required],
    phone:         [''],
    email:         [''],
    addressType:   ['Casa', Validators.required],
    floor:         [''],
    apartment:     [''],
    street:        ['', Validators.required],
    streetNumber:  ['', Validators.required],
    city:          ['', Validators.required],
    province:      ['', Validators.required],
    country:       ['Argentina', Validators.required],
  });

  get isEdificio(): boolean {
    return this.form.get('addressType')?.value === 'Edificio';
  }

  ngOnInit(): void {
    this.form.get('addressType')?.valueChanges.subscribe(val => {
      const floor     = this.form.get('floor');
      const apartment = this.form.get('apartment');
      if (val === 'Edificio') {
        floor?.setValidators(Validators.required);
        apartment?.setValidators(Validators.required);
      } else {
        floor?.clearValidators();
        apartment?.clearValidators();
      }
      floor?.updateValueAndValidity();
      apartment?.updateValueAndValidity();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit   = true;
      this.doctorId = +id;
      this.svc.getById(this.doctorId).subscribe({
        next:  data => this.form.patchValue(data as any),
        error: ()   => this.errorMsg = 'No se pudo cargar el médico.'
      });
    }
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    const req = this.form.value as any;
    const obs = this.isEdit
      ? this.svc.update(this.doctorId, req)
      : this.svc.create(req);

    obs.subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = this.isEdit ? '✅ Médico actualizado.' : '✅ Médico registrado correctamente.';
        setTimeout(() => this.router.navigate(['/doctors']), 1500);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.status === 409
          ? 'Ya existe un médico con ese DNI o matrícula.'
          : 'Error al guardar. Intentá de nuevo.';
      }
    });
  }
}
