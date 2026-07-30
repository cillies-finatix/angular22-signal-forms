# Angular 22 Forms im Vergleich

Dieses Projekt stellt **Reactive Forms** und **Signal Forms** anhand desselben Formulars gegenüber. Es zeigt nicht nur unterschiedliche Syntax, sondern vor allem die zwei zugrunde liegenden Denkmodelle:

- Reactive Forms verwalten den Formularzustand in einem expliziten Baum aus `FormControl`, `FormGroup` und `FormArray`.
- Signal Forms leiten einen `FieldTree` aus einem typisierten Signal-Modell ab. Das Modell bleibt die Quelle der Wahrheit.

Template-driven Forms werden im Folgenden ebenfalls eingeordnet, sind aber nicht als eigene Demo implementiert. Der Schwerpunkt des Repositories liegt auf dem direkten Vergleich der beiden Ansätze, die für komplexere und dynamische Formulare relevant sind.

## Was die Anwendung demonstriert

Beide vorhandenen Varianten bilden denselben Use Case ab:

- typisierte Profilfelder für Name, Alter, Startdatum und Priorität
- Pflichtfeld-, E-Mail- und Mindestwertvalidierung
- formularweite Validierung für zwei übereinstimmende E-Mail-Adressen
- dynamisch hinzufügbare Text-, Zahlen- und Datumsfelder
- ein eigenes Eingabeelement für die Priorität
- Anzeige des aktuellen Formularwerts beziehungsweise Modells

Die Demos sind unter folgenden Routen erreichbar:

| Route | Inhalt |
| --- | --- |
| `/` | Einstieg und Kurzvergleich |
| `/reactive-forms` | Umsetzung mit Reactive Forms |
| `/signal-forms` | Umsetzung mit Signal Forms |

## Drei Formularansätze

Angular bietet drei unterschiedliche Ansätze. Sie lösen dieselbe fachliche Aufgabe, unterscheiden sich aber darin, wo Zustand und Regeln definiert werden und wie gut komplexe Abläufe skalieren.

| Aspekt | Template-driven Forms | Reactive Forms | Signal Forms |
| --- | --- | --- | --- |
| Quelle der Wahrheit | veränderliches Komponentenmodell und Template-Direktiven | expliziter Control-Baum | typisiertes, schreibbares Signal-Modell |
| Bindung | `[(ngModel)]` und `name` | `[formControl]`, `formControlName`, `[formGroup]` | `[formField]` und `[formRoot]` |
| Validierung | überwiegend als Attribute/Direktiven im Template | Validator-Funktionen an Controls und Groups | deklarative Schema-Funktionen an Modellpfaden |
| Reaktivität | intern asynchron und direktivengetrieben | `valueChanges` und `statusChanges` als Observables | Werte und Feldzustände als Signals |
| Typisierung | schwächer und stärker vom Template abhängig | streng typisierbare Controls, Groups und Arrays | Typen werden direkt aus dem Modellbaum abgeleitet |
| Dynamische Felder | möglich, bei wachsender Komplexität schnell unübersichtlich | explizites Erzeugen und Verwalten von `FormArray` und Controls | Array im Modell ändern; Regeln mit `applyEach` auf Einträge anwenden |
| Eigene Controls | `ControlValueAccessor` | `ControlValueAccessor` | `FormValueControl` mit `model()`, `input()` und `output()` |
| Testbarkeit | häufig stärker an Template und Fixture gekoppelt | sehr gut isoliert über den Control-Baum testbar | Modell, Schema und abgeleiteter Feldzustand direkt testbar |
| Lernkurve | niedrig für einfache Formulare | höher, dafür lange etabliert | niedrig, wenn Signals bekannt sind; API und Muster sind neuer |
| Typischer Sweet Spot | kleine, überwiegend statische Formulare | komplexe Bestands- und Enterprise-Formulare | neue, modellzentrierte und signalbasierte Formulare |

## Template-driven Forms

Template-driven Forms definieren einen großen Teil der Formularlogik direkt im HTML. `FormsModule`, `ngModel`, Template-Referenzen und Validierungsattribute erzeugen den internen Control-Baum weitgehend implizit.

```html
<form #profileForm="ngForm" (ngSubmit)="save()">
  <input
    name="email"
    type="email"
    [(ngModel)]="profile.email"
    #email="ngModel"
    required
  />
</form>
```

**Weiterhin sinnvoll für:**

- kleine Login-, Kontakt-, Such- oder Einstellungsformulare
- wenige Felder und einfache, lokale Validierungsregeln
- Teams, die bewusst möglichst viel Logik im Template halten wollen
- bestehende, stabile Formulare ohne Änderungsdruck

**Weniger geeignet für:**

- dynamische Feldstrukturen
- komplexe Abhängigkeiten zwischen Feldern
- wiederverwendbare Validierungslogik
- umfangreiche Tests ohne starkes Template-Setup

Template-driven Forms sind damit nicht "veraltet". Ihr Vorteil ist geringe Zeremonie. Ab einer gewissen fachlichen Komplexität wird die implizite Zustandsverwaltung jedoch zum Nachteil.

## Reactive Forms

Reactive Forms definieren die Formularstruktur explizit in TypeScript. Das Modell des Formulars ist der Control-Baum und nicht automatisch das fachliche Datenobjekt.

```ts
readonly form = new FormGroup({
  email: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  }),
});
```

Im Reactive-Forms-Beispiel dieses Projekts werden dynamische Felder als neue `FormGroup` in ein `FormArray` eingefügt. Für das eigene Prioritäts-Control wird der etablierte `ControlValueAccessor` mit `NG_VALUE_ACCESSOR` implementiert. Änderungen stellt Angular über Observable-Streams wie `valueChanges` bereit; die Demo adaptiert diesen Stream mit `toSignal` für die Anzeige.

**Weiterhin sinnvoll für:**

- große bestehende Anwendungen mit umfangreicher Reactive-Forms-Infrastruktur
- dynamische Formulare, deren Control-Baum bewusst direkt gesteuert werden soll
- RxJS-lastige Workflows, etwa Autosave, Debouncing oder verkettete asynchrone Abläufe
- Bibliotheken und Custom Controls, die auf `ControlValueAccessor` aufbauen
- Teams, die eine seit Jahren etablierte, gut dokumentierte API benötigen

Reactive Forms sind robust und skalierbar, bringen aber zusätzliche Strukturen mit: Fachmodell und Control-Baum müssen häufig getrennt typisiert, aufgebaut und synchronisiert werden.

## Signal Forms

Signal Forms beginnen beim fachlichen Modell. `form()` erzeugt daraus einen typisierten `FieldTree`; Validierungsregeln werden in einem Schema an Modellpfade gebunden.

```ts
readonly model = signal({
  email: '',
});

readonly profileForm = form(this.model, (profile) => {
  required(profile.email, { message: 'E-Mail ist erforderlich.' });
  email(profile.email, { message: 'Bitte eine gültige E-Mail eingeben.' });
});
```

```html
<input type="email" [formField]="profileForm.email" />
```

Im Signal-Forms-Beispiel wird ein dynamisches Feld direkt zum Array im Modell hinzugefügt. Der `FieldTree` folgt dieser Änderung; `applyEach` weist jedem Eintrag automatisch dessen Regeln zu. Das eigene Prioritäts-Control implementiert `FormValueControl<Priority>` und stellt seinen Wert über `model.required<Priority>()` bereit. Dadurch entfällt die Callback-Verkabelung eines `ControlValueAccessor`.

**Besonders sinnvoll für:**

- neue Angular-Anwendungen, die Zustand bereits mit Signals modellieren
- Formulare, bei denen das fachliche Datenmodell im Mittelpunkt stehen soll
- stark typisierte, dynamische Formulare
- synchrone Ableitungen von Wert, Gültigkeit und Feldzustand
- neue Custom Controls mit einer kleinen signalbasierten Schnittstelle

**Vor einer Einführung prüfen:**

- Status der API in der konkret eingesetzten Angular-Version
- Verfügbarkeit benötigter Features und Drittanbieter-Integrationen
- Migrationsaufwand für bestehende `ControlValueAccessor`-Komponenten
- Erfahrung des Teams mit Signals und schemaorientierter Validierung

## Sind Signal Forms die Zukunft?

**Strategisch: ja. Als sofortiger Ersatz für jedes vorhandene Formular: nein.**

Signal Forms passen zu Angulars signalbasierter Reaktivität und reduzieren die doppelte Modellierung von Fachobjekt und Formular-Control-Baum. Für neue Anwendungen auf Angular 22 sind sie daher der naheliegende Ansatz, sofern die konkret verwendete Version alle benötigten Funktionen stabil bereitstellt.

Das bedeutet nicht, dass bestehende Reactive Forms migriert werden müssen. Reactive Forms bleiben für etablierte Anwendungen, RxJS-zentrierte Prozesse und vorhandene Control-Bibliotheken ein sinnvoller Ansatz. Template-driven Forms behalten ihren Platz bei kleinen, statischen Formularen, bei denen ein zusätzlicher Modell- oder Control-Aufbau keinen Mehrwert bringt.

Für dieses Repository ist außerdem wichtig: Die Abhängigkeiten verwenden Angular-22-Prerelease-Versionen (`next` beziehungsweise `rc`). Versionsspezifische Angular-22-Empfehlungen führen Signal Forms bereits als bevorzugten Ansatz für neue Formulare; einzelne offizielle Tutorialseiten kennzeichnen die API weiterhin als experimentell. Deshalb sollte eine Produktionsentscheidung immer anhand der Release Notes und Dokumentation der tatsächlich installierten Angular-Version getroffen werden.

Eine pragmatische Entscheidungsmatrix:

| Situation | Empfehlung |
| --- | --- |
| Neues, komplexes Formular in einer signalbasierten Angular-22-Anwendung | Signal Forms zuerst evaluieren |
| Bestehendes, funktionierendes Reactive Form | Beibehalten; nur mit fachlichem Nutzen migrieren |
| RxJS-intensive Formularprozesse oder breite CVA-Komponentenbibliothek | Reactive Forms bleiben oft günstiger |
| Kleines, statisches Formular mit wenigen Regeln | Template-driven Forms sind weiterhin vertretbar |
| Kritische Produktion mit fehlendem Feature oder unsicherem API-Status | Reactive Forms verwenden und Signal Forms später neu bewerten |

Die Ansätze können innerhalb einer Anwendung nebeneinander existieren. Eine schrittweise Einführung pro Formular oder Feature ist deshalb meist sinnvoller als eine technische Komplettmigration.

## Projekt starten

Voraussetzungen:

- Node.js in einer mit Angular 22 kompatiblen Version
- npm 10 (das Projekt deklariert `npm@10.9.8`)

```bash
npm install
npm start
```

Danach ist die Anwendung unter [http://localhost:4200](http://localhost:4200) erreichbar.

## Tests und Build

```bash
# Unit-Tests mit Vitest
npm test

# Produktions-Build
npm run build
```

## Weiterführende Angular-Dokumentation

- [Template-driven Forms](https://angular.dev/guide/forms/template-driven-forms)
- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Signal Forms](https://angular.dev/essentials/signal-forms)
- [Angular CLI](https://angular.dev/tools/cli)
