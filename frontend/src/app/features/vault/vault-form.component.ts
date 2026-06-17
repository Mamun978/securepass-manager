import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VaultService } from '../../core/vault.service';

@Component({
  selector: 'app-vault-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ isEdit ? 'Edit item' : 'New item' }}</p>
        <h1>{{ isEdit ? 'Update password' : 'Add password' }}</h1>
      </div>
      <a class="ghost" routerLink="/dashboard">Back</a>
    </header>

    <form [formGroup]="form" (ngSubmit)="submit()" class="form wide-form">
      <label>Title<input formControlName="title" /></label>
      <label>Website URL<input formControlName="websiteUrl" /></label>
      <label>Username<input formControlName="username" /></label>
      <label>Password<input type="password" formControlName="password" /></label>
      <label>Notes<textarea rows="5" formControlName="notes"></textarea></label>
      @if (message) { <p class="message error">{{ message }}</p> }
      <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Saving...' : 'Save password' }}</button>
    </form>
  `
})
export class VaultFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vault = inject(VaultService);

  loading = false;
  message = '';
  isEdit = false;
  id = '';
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    websiteUrl: [''],
    username: ['', [Validators.required, Validators.maxLength(180)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    notes: ['']
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.id;
    if (this.isEdit) {
      this.vault.get(this.id, true).subscribe({
        next: (response) => this.form.patchValue({
          title: response.data.title,
          websiteUrl: response.data.websiteUrl || '',
          username: response.data.username,
          password: response.data.password || '',
          notes: response.data.notes || ''
        }),
        error: (err) => this.message = err.error?.message || 'Unable to load item'
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const request = this.isEdit ? this.vault.update(this.id, this.form.getRawValue()) : this.vault.create(this.form.getRawValue());
    request.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.message = err.error?.message || 'Save failed';
        this.loading = false;
      }
    });
  }
}
