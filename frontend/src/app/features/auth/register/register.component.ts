// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-header">
      <div class="logo">⬡</div>
      <h1>Crear cuenta</h1>
      <p>Completá el formulario para registrarte</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

      <div class="field">
        <label>Nombre</label>
        <input type="text" formControlName="name" placeholder="Tu nombre"
               [class.error]="isInvalid('name')" />
        <span class="err-msg" *ngIf="isInvalid('name')">Nombre requerido</span>
      </div>

      <div class="field">
        <label>Email</label>
        <input type="email" formControlName="email" placeholder="nombre@ejemplo.com"
               [class.error]="isInvalid('email')" />
        <span class="err-msg" *ngIf="isInvalid('email')">Email inválido</span>
      </div>

      <div class="field">
        <label>Contraseña</label>
        <input type="password" formControlName="password" placeholder="Mínimo 6 caracteres"
               [class.error]="isInvalid('password')" />
        <span class="err-msg" *ngIf="isInvalid('password')">Mínimo 6 caracteres</span>
      </div>

      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

      <button type="submit" class="btn-primary" [disabled]="loading">
        <span *ngIf="!loading">Registrarse</span>
        <span *ngIf="loading" class="spinner"></span>
      </button>
    </form>

    <p class="auth-footer">
      ¿Ya tenés cuenta? <a routerLink="/login">Iniciá sesión</a>
    </p>
  </div>
</div>
  `,
  styleUrls: ['../auth.styles.css']
})
export class RegisterComponent {
  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading    = false;
  errorMsg   = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading  = true;
    this.errorMsg = '';

    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.status === 400
          ? 'El email ya está registrado.'
          : 'Error al registrar. Intentá de nuevo.';
        this.loading = false;
      }
    });
  }
}
