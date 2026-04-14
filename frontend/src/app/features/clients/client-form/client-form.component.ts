// src/app/features/clients/client-form/client-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page-wrapper">
  <nav class="navbar">
    <span class="nav-logo">⬡ AppName</span>
    <div class="nav-actions">
      <a routerLink="/clients" class="btn-nav">← Volver a clientes</a>
    </div>
  </nav>

  <main class="page-main">
    <h1 class="page-title">{{ isEdit ? '✏️ Editar cliente' : '👤 Nuevo cliente' }}</h1>
    <p class="page-sub">{{ isEdit ? 'Modificá los datos del paciente' : 'Completá los datos del nuevo paciente' }}</p>

    <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
    <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

      <!-- ── Datos personales ── -->
      <div class="section">
        <h2 class="section-title">👤 Datos personales</h2>
        <div class="grid-2">

          <div class="field">
            <label>Nombre *</label>
            <input type="text" formControlName="firstName" placeholder="Nombre del paciente"
                   [class.error]="isInvalid('firstName')" />
            <span class="err-msg" *ngIf="isInvalid('firstName')">Requerido</span>
          </div>

          <div class="field">
            <label>Apellido *</label>
            <input type="text" formControlName="lastName" placeholder="Apellido del paciente"
                   [class.error]="isInvalid('lastName')" />
            <span class="err-msg" *ngIf="isInvalid('lastName')">Requerido</span>
          </div>

          <div class="field">
            <label>DNI *</label>
            <input type="text" formControlName="dni" placeholder="Ej: 30123456"
                   [class.error]="isInvalid('dni')" />
            <span class="err-msg" *ngIf="isInvalid('dni')">Requerido</span>
          </div>

          <div class="field">
            <label>Teléfono *</label>
            <input type="text" formControlName="phone" placeholder="Ej: 11 4567-8901"
                   [class.error]="isInvalid('phone')" />
            <span class="err-msg" *ngIf="isInvalid('phone')">Requerido</span>
          </div>

          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com" />
          </div>

        </div>
      </div>

      <!-- ── Obra social ── -->
      <div class="section">
        <h2 class="section-title">🏥 Cobertura médica</h2>

        <div class="toggle-row">
          <span>¿Tiene obra social?</span>
          <label class="toggle">
            <input type="checkbox" formControlName="hasHealthInsurance" />
            <span class="slider"></span>
          </label>
          <span class="toggle-label">{{ form.get('hasHealthInsurance')?.value ? 'Sí' : 'No' }}</span>
        </div>

        <div class="field" style="margin-top:1rem" *ngIf="form.get('hasHealthInsurance')?.value">
          <label>Nombre de la obra social *</label>
          <input type="text" formControlName="healthInsuranceName"
                 placeholder="Ej: OSDE, Swiss Medical, IOMA..."
                 [class.error]="isInvalid('healthInsuranceName')" />
          <span class="err-msg" *ngIf="isInvalid('healthInsuranceName')">Requerido si tiene obra social</span>
        </div>
      </div>

      <!-- ── Domicilio ── -->
      <div class="section">
        <h2 class="section-title">🏠 Domicilio</h2>
        <div class="grid-2">

          <div class="field" style="grid-column: 1 / -1">
            <label>Tipo de vivienda *</label>
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
              <input type="text" formControlName="floor" placeholder="Ej: 3"
                     [class.error]="isInvalid('floor')" />
              <span class="err-msg" *ngIf="isInvalid('floor')">Requerido para edificio</span>
            </div>

            <div class="field">
              <label>Departamento *</label>
              <input type="text" formControlName="apartment" placeholder="Ej: B"
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
        <a routerLink="/clients" class="btn-cancel">Cancelar</a>
        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="!loading">{{ isEdit ? '💾 Guardar cambios' : '✅ Registrar cliente' }}</span>
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
      color:#a5b4fc; margin-bottom:1.25rem;
    }
    .grid-2 { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:1rem; }

    .field { display:flex; flex-direction:column; gap:.35rem; }
    label { font-size:.78rem; font-weight:500; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
    input {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:.65rem 1rem; color:#f1f5f9;
      font-family:'DM Sans',sans-serif; font-size:.95rem;
      transition:border-color .2s, box-shadow .2s; outline:none; width:100%;
    }
    input::placeholder { color:#475569; }
    input:focus { border-color:#818cf8; box-shadow:0 0 0 3px rgba(129,140,248,.15); }
    input.error { border-color:#f87171; }
    .err-msg { font-size:.78rem; color:#f87171; }

    /* Toggle obra social */
    .toggle-row { display:flex; align-items:center; gap:1rem; }
    .toggle-row span { color:#94a3b8; font-size:.92rem; }
    .toggle-label { font-weight:600; color:#a5b4fc; }
    .toggle { position:relative; display:inline-block; width:48px; height:26px; }
    .toggle input { opacity:0; width:0; height:0; }
    .slider {
      position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0;
      background:rgba(255,255,255,.1); border-radius:999px; transition:.3s;
      border:1px solid rgba(255,255,255,.15);
    }
    .slider::before {
      content:""; position:absolute; height:18px; width:18px; left:3px; bottom:3px;
      background:#64748b; border-radius:50%; transition:.3s;
    }
    .toggle input:checked + .slider { background:rgba(99,102,241,.4); border-color:#6366f1; }
    .toggle input:checked + .slider::before { transform:translateX(22px); background:#818cf8; }

    /* Radio group */
    .radio-group { display:flex; gap:.75rem; }
    .radio-option {
      flex:1; max-width:160px; display:flex; align-items:center; justify-content:center; gap:.5rem;
      padding:.65rem 1rem; border-radius:10px; cursor:pointer;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      font-size:.9rem; color:#94a3b8; transition:all .2s;
    }
    .radio-option input[type="radio"] { display:none; }
    .radio-option.selected { background:rgba(99,102,241,.2); border-color:#6366f1; color:#a5b4fc; }

    .form-footer { display:flex; justify-content:flex-end; gap:1rem; margin-top:1rem; align-items:center; }
    .btn-cancel {
      padding:.75rem 1.5rem; background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      color:#94a3b8; text-decoration:none; font-size:.95rem; transition:background .2s;
    }
    .btn-cancel:hover { background:rgba(255,255,255,.1); }
    .btn-primary {
      padding:.8rem 2rem; background:linear-gradient(135deg,#6366f1,#8b5cf6);
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
export class ClientFormComponent implements OnInit {
  private svc   = inject(ClientService);
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit     = false;
  clientId   = 0;
  loading    = false;
  successMsg = '';
  errorMsg   = '';

  form = this.fb.group({
    firstName:           ['', Validators.required],
    lastName:            ['', Validators.required],
    dni:                 ['', Validators.required],
    phone:               ['', Validators.required],
    email:               [''],
    hasHealthInsurance:  [false],
    healthInsuranceName: [''],
    addressType:         ['Casa', Validators.required],
    floor:               [''],
    apartment:           [''],
    street:              ['', Validators.required],
    streetNumber:        ['', Validators.required],
    city:                ['', Validators.required],
    province:            ['', Validators.required],
    country:             ['Argentina', Validators.required],
  });

  get isEdificio(): boolean {
    return this.form.get('addressType')?.value === 'Edificio';
  }

  ngOnInit(): void {
    // Validación dinámica edificio
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

    // Validación dinámica obra social
    this.form.get('hasHealthInsurance')?.valueChanges.subscribe(has => {
      const ins = this.form.get('healthInsuranceName');
      if (has) ins?.setValidators(Validators.required);
      else     ins?.clearValidators();
      ins?.updateValueAndValidity();
    });

    // Modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit   = true;
      this.clientId = +id;
      this.svc.getById(this.clientId).subscribe({
        next: data => this.form.patchValue(data as any),
        error: ()  => this.errorMsg = 'No se pudo cargar el cliente.'
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
      ? this.svc.update(this.clientId, req)
      : this.svc.create(req);

    obs.subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = this.isEdit ? '✅ Cliente actualizado.' : '✅ Cliente registrado correctamente.';
        setTimeout(() => this.router.navigate(['/clients']), 1500);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.status === 409
          ? 'Ya existe un cliente con ese DNI.'
          : 'Error al guardar. Intentá de nuevo.';
      }
    });
  }
}
