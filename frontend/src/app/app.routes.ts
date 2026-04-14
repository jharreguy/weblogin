// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },  
  {
  path: 'forgot-password',
  loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
    .then(m => m.ForgotPasswordComponent)
},
{
  path: 'reset-password',
  loadComponent: () => import('./features/auth/reset-password/reset-password.component')
    .then(m => m.ResetPasswordComponent)
},
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'agenda',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/agenda/agenda.component').then(m => m.AgendaComponent)
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/appointments-list/appointments-list.component').then(m => m.AppointmentsListComponent)
  },
  {
    path: 'appointments/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/new-appointment/new-appointment.component').then(m => m.NewAppointmentComponent)
  },
  {
    path: 'doctors',
    canActivate: [authGuard],
    loadComponent: () => import('./features/doctors/doctors-list/doctors-list.component').then(m => m.DoctorsListComponent)
  },
  {
    path: 'doctors/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/doctors/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
  },
  {
    path: 'doctors/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/doctors/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    loadComponent: () => import('./features/clients/clients-list/clients-list.component').then(m => m.ClientsListComponent)
  },
  {
    path: 'clients/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'clients/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
  },
  { path: '**', redirectTo: 'login' }
];
