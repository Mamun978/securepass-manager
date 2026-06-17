import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <p class="eyebrow">Account recovery</p>
        <h1>Reset password</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <label>Reset token<input formControlName="token" /></label>
          <label>New password<input type="password" formControlName="newPassword" /></label>
          @if (message()) { <p class="message" [class.error]="hasError()" [class.success]="!hasError()">{{ message() }}</p> }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Resetting...' : 'Reset password' }}</button>
        </form>
        <div class="auth-links"><a routerLink="/login">Back to login</a></div>
      </section>
    </main>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  hasError = signal(false);
  message = signal('');
  form = this.fb.nonNullable.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) this.form.controls.token.setValue(token);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { token, newPassword } = this.form.getRawValue();
    this.auth.resetPassword(token, newPassword).subscribe({
      next: () => {
        this.hasError.set(false);
        this.message.set('Password reset successful. Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: (err) => {
        this.hasError.set(true);
        this.message.set(err.error?.message || 'Reset failed');
        this.loading.set(false);
      }
    });
  }
}
