import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password.component';
import { DashboardComponent } from './features/vault/dashboard.component';
import { VaultFormComponent } from './features/vault/vault-form.component';
import { VaultDetailComponent } from './features/vault/vault-detail.component';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vault/add', component: VaultFormComponent },
      { path: 'vault/:id/edit', component: VaultFormComponent },
      { path: 'vault/:id', component: VaultDetailComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
