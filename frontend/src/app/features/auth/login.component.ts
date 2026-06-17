import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <p class="eyebrow">SecurePass Manager</p>
        <h1>Sign in</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <label>Email<input type="email" formControlName="email" /></label>
          <label>Password<input type="password" formControlName="password" /></label>
          @if (message()) { <p class="message error">{{ message() }}</p> }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Signing in...' : 'Login' }}</button>
        </form>
        <div class="auth-links">
          <a routerLink="/forgot-password">Forgot password?</a>
          <a routerLink="/register">Create account</a>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  message = signal('');
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.message.set(err.error?.message || 'Invalid email or password');
        this.loading.set(false);
      }
    });
  }
}
