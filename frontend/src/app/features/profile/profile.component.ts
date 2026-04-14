// src/app/features/profile/profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page-wrapper">

  <!-- Navbar -->
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/dashboard" class="btn-back">← Dashboard</a>
    </div>
  </nav>

  <main class="page-main">
    <div class="page-header">
      <div class="avatar">{{ initials }}</div>
      <div>
        <h1 class="page-title">Mi perfil</h1>
        <p class="page-sub">Completá tu información personal</p>
      </div>
      <span class="badge-complete" *ngIf="profileComplete">✅ Perfil completo</span>
      <span class="badge-pending"  *ngIf="!profileComplete">⚠ Perfil incompleto</span>
    </div>

    <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
    <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

      <!-- ── Datos personales ── -->
      <div class="section">
        <h2 class="section-title">👤 Datos personales</h2>
        <div class="grid-2">

          <div class="field">
            <label>Nombre</label>
            <input type="text" formControlName="firstName" placeholder="Tu nombre"
                   [class.error]="isInvalid('firstName')" />
            <span class="err-msg" *ngIf="isInvalid('firstName')">Requerido</span>
          </div>

          <div class="field">
            <label>Apellido</label>
            <input type="text" formControlName="lastName" placeholder="Tu apellido"
                   [class.error]="isInvalid('lastName')" />
            <span class="err-msg" *ngIf="isInvalid('lastName')">Requerido</span>
          </div>

          <div class="field">
            <label>Género</label>
            <select formControlName="gender" [class.error]="isInvalid('gender')">
              <option value="">Seleccioná...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
            <span class="err-msg" *ngIf="isInvalid('gender')">Requerido</span>
          </div>

          <div class="field">
            <label>Tipo de trabajo</label>
            <select formControlName="workStatus" [class.error]="isInvalid('workStatus')">
              <option value="">Seleccioná...</option>
              <option value="Empleado">Empleado</option>
              <option value="Desempleado">Desempleado</option>
              <option value="Autónomo">Autónomo</option>
            </select>
            <span class="err-msg" *ngIf="isInvalid('workStatus')">Requerido</span>
          </div>

          <div class="field">
            <label>Tipo de documento</label>
            <select formControlName="docType" [class.error]="isInvalid('docType')">
              <option value="">Seleccioná...</option>
              <option value="DNI">DNI</option>
              <option value="LLC">LLC</option>
            </select>
            <span class="err-msg" *ngIf="isInvalid('docType')">Requerido</span>
          </div>

          <div class="field">
            <label>Número de documento</label>
            <input type="text" formControlName="docNumber" placeholder="12345678"
                   [class.error]="isInvalid('docNumber')" />
            <span class="err-msg" *ngIf="isInvalid('docNumber')">Requerido</span>
          </div>

        </div>
      </div>

      <!-- ── Domicilio ── -->
      <div class="section">
        <h2 class="section-title">🏠 Domicilio</h2>
        <div class="grid-2">

          <div class="field">
            <label>Tipo de vivienda</label>
            <div class="radio-group">
              <label class="radio-option" [class.selected]="form.get('addressType')?.value === 'Casa'">
                <input type="radio" formControlName="addressType" value="Casa" />
                🏡 Casa
              </label>
              <label class="radio-option" [class.selected]="form.get('addressType')?.value === 'Edificio'">
                <input type="radio" formControlName="addressType" value="Edificio" />
                🏢 Edificio
              </label>
            </div>
            <span class="err-msg" *ngIf="isInvalid('addressType')">Requerido</span>
          </div>

          <div class="field" *ngIf="isEdificio">
            <label>Piso</label>
            <input type="text" formControlName="floor" placeholder="Ej: 3"
                   [class.error]="isInvalid('floor')" />
            <span class="err-msg" *ngIf="isInvalid('floor')">Requerido para edificio</span>
          </div>

          <div class="field" *ngIf="isEdificio">
            <label>Departamento</label>
            <input type="text" formControlName="apartment" placeholder="Ej: A"
                   [class.error]="isInvalid('apartment')" />
            <span class="err-msg" *ngIf="isInvalid('apartment')">Requerido para edificio</span>
          </div>

          <div class="field">
            <label>Calle</label>
            <input type="text" formControlName="street" placeholder="Nombre de la calle"
                   [class.error]="isInvalid('street')" />
            <span class="err-msg" *ngIf="isInvalid('street')">Requerido</span>
          </div>

          <div class="field">
            <label>Número</label>
            <input type="text" formControlName="streetNumber" placeholder="Ej: 1234"
                   [class.error]="isInvalid('streetNumber')" />
            <span class="err-msg" *ngIf="isInvalid('streetNumber')">Requerido</span>
          </div>

          <div class="field">
            <label>Ciudad</label>
            <input type="text" formControlName="city" placeholder="Tu ciudad"
                   [class.error]="isInvalid('city')" />
            <span class="err-msg" *ngIf="isInvalid('city')">Requerido</span>
          </div>

          <div class="field">
            <label>Provincia</label>
            <input type="text" formControlName="province" placeholder="Tu provincia"
                   [class.error]="isInvalid('province')" />
            <span class="err-msg" *ngIf="isInvalid('province')">Requerido</span>
          </div>

        </div>
      </div>

      <div class="form-footer">
        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="!loading">💾 Guardar perfil</span>
          <span *ngIf="loading" class="spinner"></span>
        </button>
      </div>

    </form>
  </main>
</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }

    .page-wrapper { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #f1f5f9; }

    /* Navbar */
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
      color: #94a3b8; text-decoration: none; font-size: .85rem; transition: background .2s;
    }
    .btn-back:hover { background: rgba(255,255,255,.12); color: #f1f5f9; }

    /* Page header */
    .page-main { padding: 2.5rem 2rem; max-width: 860px; margin: 0 auto; }
    .page-header {
      display: flex; align-items: center; gap: 1.25rem;
      margin-bottom: 2rem; flex-wrap: wrap;
    }
    .avatar {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; letter-spacing: -.03em; }
    .page-sub { color: #64748b; font-size: .88rem; margin-top: .2rem; }

    .badge-complete {
      margin-left: auto; padding: .3rem .9rem; border-radius: 999px;
      background: rgba(52,211,153,.15); color: #6ee7b7;
      border: 1px solid rgba(52,211,153,.3); font-size: .8rem; font-weight: 600;
    }
    .badge-pending {
      margin-left: auto; padding: .3rem .9rem; border-radius: 999px;
      background: rgba(251,191,36,.12); color: #fcd34d;
      border: 1px solid rgba(251,191,36,.25); font-size: .8rem; font-weight: 600;
    }

    /* Alerts */
    .alert { border-radius: 10px; padding: .75rem 1rem; font-size: .88rem; margin-bottom: 1.25rem; }
    .alert-success { background: rgba(52,211,153,.12); color: #6ee7b7; border: 1px solid rgba(52,211,153,.25); }
    .alert-error   { background: rgba(248,113,113,.12); color: #fca5a5; border: 1px solid rgba(248,113,113,.25); }

    /* Sections */
    .section {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
      border-radius: 16px; padding: 1.75rem; margin-bottom: 1.5rem;
    }
    .section-title {
      font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
      color: #a5b4fc; margin-bottom: 1.25rem; letter-spacing: -.01em;
    }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }

    /* Fields */
    .field { display: flex; flex-direction: column; gap: .35rem; }
    label {
      font-size: .78rem; font-weight: 500; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .06em;
    }
    input, select {
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px; padding: .65rem 1rem; color: #f1f5f9;
      font-family: 'DM Sans', sans-serif; font-size: .95rem;
      transition: border-color .2s, box-shadow .2s; outline: none;
      width: 100%;
    }
    input::placeholder { color: #475569; }
    select option { background: #1e293b; }
    input:focus, select:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,.15);
    }
    input.error, select.error { border-color: #f87171; }
    .err-msg { font-size: .78rem; color: #f87171; }

    /* Radio group */
    .radio-group { display: flex; gap: .75rem; }
    .radio-option {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: .5rem;
      padding: .65rem 1rem; border-radius: 10px; cursor: pointer;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      font-size: .9rem; color: #94a3b8; transition: all .2s;
    }
    .radio-option input[type="radio"] { display: none; }
    .radio-option.selected {
      background: rgba(99,102,241,.2); border-color: #6366f1; color: #a5b4fc;
    }
    .radio-option:hover { border-color: rgba(129,140,248,.4); color: #c7d2fe; }

    /* Footer */
    .form-footer { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .btn-primary {
      padding: .8rem 2rem; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none; border-radius: 10px;
      font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: opacity .2s, transform .1s;
      display: flex; align-items: center; gap: .5rem; min-height: 46px;
    }
    .btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);

  loading         = false;
  successMsg      = '';
  errorMsg        = '';
  profileComplete = false;
  initials        = '?';

  form = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    gender:       ['', Validators.required],
    docType:      ['', Validators.required],
    docNumber:    ['', Validators.required],
    workStatus:   ['', Validators.required],
    addressType:  ['', Validators.required],
    floor:        [''],
    apartment:    [''],
    street:       ['', Validators.required],
    streetNumber: ['', Validators.required],
    city:         ['', Validators.required],
    province:     ['', Validators.required],
  });

  get isEdificio(): boolean {
    return this.form.get('addressType')?.value === 'Edificio';
  }

  ngOnInit(): void {
    // Escuchar cambio de tipo de vivienda para validar piso/depto
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

    // Cargar perfil existente
    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe({
      next: (data) => {
        this.profileComplete = data.profileComplete;
        this.initials = this.getInitials(data.firstName, data.lastName, data.name);
        this.form.patchValue({
          firstName:    data.firstName    ?? '',
          lastName:     data.lastName     ?? '',
          gender:       data.gender       ?? '',
          docType:      data.docType      ?? '',
          docNumber:    data.docNumber    ?? '',
          workStatus:   data.workStatus   ?? '',
          addressType:  data.addressType  ?? '',
          floor:        data.floor        ?? '',
          apartment:    data.apartment    ?? '',
          street:       data.street       ?? '',
          streetNumber: data.streetNumber ?? '',
          city:         data.city         ?? '',
          province:     data.province     ?? '',
        });
      }
    });
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

    this.http.put(`${environment.apiUrl}/profile`, this.form.value).subscribe({
      next: () => {
        this.successMsg     = '✅ Perfil guardado correctamente.';
        this.profileComplete = true;
        this.loading        = false;
        this.initials = this.getInitials(
          this.form.value.firstName ?? '',
          this.form.value.lastName  ?? '',
          '');
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.errorMsg = 'Error al guardar. Intentá de nuevo.';
        this.loading  = false;
      }
    });
  }

  private getInitials(first?: string, last?: string, name?: string): string {
    if (first && last) return (first[0] + last[0]).toUpperCase();
    if (name)          return name.slice(0, 2).toUpperCase();
    return '?';
  }
}
