import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet],
  template: `
    <main class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard">
          <span class="brand-mark">S</span>
          <span>SecurePass</span>
        </a>
        <nav>
          <a routerLink="/dashboard">Dashboard</a>
          <a routerLink="/vault/add">Add Password</a>
        </nav>
        <button class="ghost full" type="button" (click)="auth.logout()">Logout</button>
      </aside>
      <section class="content">
        <router-outlet />
      </section>
    </main>
  `
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
