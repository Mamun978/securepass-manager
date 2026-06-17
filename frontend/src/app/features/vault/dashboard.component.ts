import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { VaultService } from '../../core/vault.service';
import { VaultItem } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Vault</p>
        <h1>Password dashboard</h1>
      </div>
      <a class="button" routerLink="/vault/add">Add Password</a>
    </header>

    <section class="toolbar">
      <input type="search" placeholder="Search by title, username, or URL" [(ngModel)]="query" (input)="load()" />
    </section>

    @if (message()) { <p class="message error">{{ message() }}</p> }

    <section class="vault-grid">
      @if (loading()) {
        <div class="empty-state">
          <h2>Loading vault...</h2>
        </div>
      }

      @for (item of items(); track item.id) {
        <article class="vault-card">
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.username }}</p>
            <small>{{ item.websiteUrl || 'No URL saved' }}</small>
          </div>
          <div class="card-actions">
            <a [routerLink]="['/vault', item.id]">View</a>
            <a [routerLink]="['/vault', item.id, 'edit']">Edit</a>
            <button class="danger" type="button" (click)="remove(item.id)">Delete</button>
          </div>
        </article>
      } @empty {
        @if (!loading()) {
        <div class="empty-state">
          <h2>No passwords saved yet</h2>
          <p>Add your first vault item to start the demo.</p>
        </div>
        }
      }
    </section>
  `
})
export class DashboardComponent implements OnInit {
  items = signal<VaultItem[]>([]);
  loading = signal(false);
  message = signal('');
  query = '';

  constructor(private vault: VaultService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.message.set('');
    this.vault.list(this.query).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => this.items.set(response.data || []),
      error: (err) => this.message.set(err.error?.message || err.message || 'Unable to load vault')
    });
  }

  remove(id: number): void {
    if (!confirm('Delete this password item?')) return;
    this.vault.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => this.message.set(err.error?.message || 'Delete failed')
    });
  }
}
