import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
/*import { environment } from '../../../../environments/environment';*/
/*
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-header">
      <div class="logo">🔒</div>
      <h1>Nueva contraseña</h1>
      <p>Ingresá el PIN que recibiste y tu nueva contraseña</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate *ngIf="!done">

      <div class="field">
        <label>Email</label>
        <input type="email" formControlName="email" placeholder="nombre@ejemplo.com"
               [class.error]="isInvalid('email')" />
        <span class="err-msg" *ngIf="isInvalid('email')">Email inválido</span>
      </div>

      <div class="field">
        <label>PIN de 6 dígitos</label>
        <input type="text" formControlName="pin" placeholder="123456"
               maxlength="6" [class.error]="isInvalid('pin')" />
        <span class="err-msg" *ngIf="isInvalid('pin')">PIN de 6 dígitos requerido</span>
      </div>

      <div class="field">
        <label>Nueva contraseña</label>
        <input type="password" formControlName="password" placeholder="Mínimo 6 caracteres"
               [class.error]="isInvalid('password')" />
        <span class="err-msg" *ngIf="isInvalid('password')">Mínimo 6 caracteres</span>
      </div>

      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

      <button type="submit" class="btn-primary" [disabled]="loading">
        <span *ngIf="!loading">Cambiar contraseña</span>
        <span *ngIf="loading" class="spinner"></span>
      </button>
    </form>

    <div class="alert alert-success" *ngIf="done">
      ✅ ¡Contraseña actualizada! <a routerLink="/login">Iniciá sesión →</a>
    </div>

    <p class="auth-footer" *ngIf="!done">
      ¿No recibiste el PIN? <a routerLink="/forgot-password">Pedí uno nuevo</a>
    </p>
  </div>
</div>
  `,
  styleUrls: ['../auth.styles.css']
})
export class ResetPasswordComponent {
  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    pin:      ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading  = false;
  done     = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  isInvalid(f: string) { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    const { email, pin, password } = this.form.value;
    this.http.post(`${environment.apiUrl}/passwordreset/verify`, {
      email, pin, newPassword: password
    }).subscribe({
      next:  () => { this.done = true; this.loading = false; },
      error: () => {
        this.errorMsg = 'PIN inválido o expirado. Intentá de nuevo.';
        this.loading  = false;
      }
    });
  }
}*/