import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-header">
      <div class="logo">📧</div>
      <h1>Recuperar contraseña</h1>
      <p>Te enviaremos un PIN de 6 dígitos a tu correo</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <div class="field">
        <label>Email</label>
        <input type="email" formControlName="email"
               placeholder="nombre@ejemplo.com"
               [class.error]="isInvalid('email')" />
        <span class="err-msg" *ngIf="isInvalid('email')">Email inválido</span>
      </div>

      <div class="alert alert-success" *ngIf="sent">
        ✅ Si el email está registrado, recibirás el PIN en tu correo.
        <br><br>
        <a routerLink="/reset-password">Tengo mi PIN →</a>
      </div>

      <button type="submit" class="btn-primary" [disabled]="loading || sent">
        <span *ngIf="!loading">Enviar PIN</span>
        <span *ngIf="loading" class="spinner"></span>
      </button>
    </form>

    <p class="auth-footer"><a routerLink="/login">← Volver al login</a></p>
  </div>
</div>
  `,
  styleUrls: ['../auth.styles.css']
})
export class ForgotPasswordComponent {
  form    = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  sent    = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  isInvalid(f: string) { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.http.post(`${environment.apiUrl}/passwordreset/request`, this.form.value).subscribe({
      next:  () => { this.sent = true;  this.loading = false; },
      error: () => { this.sent = true;  this.loading = false; }
    });
  }
}