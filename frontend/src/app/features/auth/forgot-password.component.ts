import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <p class="eyebrow">Account recovery</p>
        <h1>Forgot password</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <label>Email<input type="email" formControlName="email" /></label>
          @if (message()) { <p class="message" [class.success]="!hasError()" [class.error]="hasError()">{{ message() }}</p> }
          @if (resetUrl()) { <textarea readonly [value]="resetUrl()"></textarea> }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Generating...' : 'Generate reset link' }}</button>
        </form>
        <div class="auth-links"><a routerLink="/login">Back to login</a></div>
      </section>
    </main>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  hasError = signal(false);
  message = signal('');
  resetUrl = signal('');
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.hasError.set(false);
    this.message.set('');
    this.resetUrl.set('');
    this.auth.forgotPassword(this.form.controls.email.value).pipe(
      timeout(8000),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        this.message.set(response.data
          ? response.message
          : 'If this email exists, a reset link will be generated.');
        this.resetUrl.set(response.data?.resetUrl || '');
      },
      error: (err) => {
        this.hasError.set(true);
        this.message.set(err.name === 'TimeoutError'
          ? 'Request timed out. Check that the backend is running.'
          : err.error?.message || err.message || 'Unable to generate reset link');
      }
    });
  }
}
