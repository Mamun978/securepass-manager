import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { VaultService } from '../../core/vault.service';
import { VaultItem } from '../../core/models';

@Component({
  selector: 'app-vault-detail',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Vault item</p>
        <h1>{{ item()?.title || 'Password details' }}</h1>
      </div>
      <div class="header-actions">
        <a class="ghost" routerLink="/dashboard">Back</a>
        @if (item(); as currentItem) {
          <a class="button" [routerLink]="['/vault', currentItem.id, 'edit']">Edit</a>
        }
      </div>
    </header>

    @if (message()) { <p class="message error">{{ message() }}</p> }

    @if (loading()) {
      <section class="empty-state">
        <h2>Loading password item...</h2>
      </section>
    } @else if (item(); as currentItem) {
      <section class="detail-list">
        <div><span>Website</span><strong>{{ currentItem.websiteUrl || 'Not saved' }}</strong></div>
        <div><span>Username</span><strong>{{ currentItem.username }}</strong></div>
        <div>
          <span>Password</span>
          <strong>{{ currentItem.password || 'Hidden' }}</strong>
          <button type="button" class="ghost compact" (click)="reveal()">Reveal</button>
        </div>
        <div><span>Notes</span><strong>{{ currentItem.notes || 'No notes' }}</strong></div>
        <div><span>Updated</span><strong>{{ formatDate(currentItem.updatedAt) }}</strong></div>
      </section>
    } @else {
      <section class="empty-state">
        <h2>Password item was not loaded</h2>
        <p>Go back to the dashboard and open the item again.</p>
      </section>
    }
  `
})
export class VaultDetailComponent implements OnInit {
  item = signal<VaultItem | null>(null);
  loading = signal(false);
  message = signal('');
  id = '';

  constructor(private route: ActivatedRoute, private vault: VaultService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load(false);
  }

  reveal(): void {
    this.load(true);
  }

  private load(reveal: boolean): void {
    if (!this.id) {
      this.message.set('Invalid password item id');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.vault.get(this.id, reveal).pipe(
      timeout(8000),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        this.item.set(response.data);
        if (!response.data) {
          this.message.set(response.message || 'Password item was not found');
        }
      },
      error: (err) => {
        if (err.name === 'TimeoutError') {
          this.message.set(`Request timed out while loading vault item ${this.id}. Check backend and browser Network tab.`);
          return;
        }

        const status = err.status ? ` (${err.status})` : '';
        this.message.set(err.error?.message || err.message || `Unable to load item${status}`);
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }
}
