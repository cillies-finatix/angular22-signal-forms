import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Frontend-Gilde · Angular Forms</p>
      <h1 id="page-title">Ein Formular, zwei Denkmodelle.</h1>
      <p class="lead">
        Beide Demos erfassen ein Profil, validieren Pflichtfelder, ein Mindestalter und zwei
        identische E-Mail-Adressen. Zur Laufzeit kommen Text-, Zahlen- oder Datumsfelder hinzu.
      </p>
    </section>

    <section class="comparison" aria-label="Formularvarianten">
      <article class="approach-card reactive-card">
        <p class="card-kicker">Klassisch</p>
        <h2>Reactive Forms</h2>
        <p>
          Der Formularzustand liegt in einer expliziten Control-Struktur. Dynamische Controls werden
          als <code>FormGroup</code> in ein <code>FormArray</code> eingefügt.
        </p>
        <a class="action-link" routerLink="/reactive-forms">Reactive Demo öffnen</a>
      </article>

      <article class="approach-card signal-card">
        <p class="card-kicker">Neu in Angular</p>
        <h2>Signal Forms</h2>
        <p>
          Das Modell ist die Quelle der Wahrheit. Das Form-Tree leitet Feldzustand und Validierung
          daraus ab; neue Array-Einträge erhalten ihr Schema über <code>applyEach</code>.
        </p>
        <a class="action-link" routerLink="/signal-forms">Signal Demo öffnen</a>
      </article>
    </section>
  `,
})
export class HomeComponent {}