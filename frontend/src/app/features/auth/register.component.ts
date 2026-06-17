import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <p class="eyebrow">SecurePass Manager</p>
        <h1>Create account</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <label>Name<input formControlName="name" /></label>
          <label>Email<input type="email" formControlName="email" /></label>
          <label>Password<input type="password" formControlName="password" /></label>
          @if (message()) { <p class="message error">{{ message() }}</p> }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Creating...' : 'Register' }}</button>
        </form>
        <div class="auth-links"><a routerLink="/login">Already have an account?</a></div>
      </section>
    </main>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  message = signal('');
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set('');
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.message.set(err.error?.message || 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
