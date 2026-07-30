import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/">Angular Forms Lab</a>
      <nav aria-label="Hauptnavigation">
        <a routerLink="/reactive-forms" routerLinkActive="is-active">Reactive Forms</a>
        <a routerLink="/signal-forms" routerLinkActive="is-active">Signal Forms</a>
      </nav>
    </header>

    <main class="app-shell">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App {}
