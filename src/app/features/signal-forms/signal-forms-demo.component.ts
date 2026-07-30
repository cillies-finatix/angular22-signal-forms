import { Component, computed, signal } from '@angular/core';
import { FormField, FormRoot, applyEach, email, form, min, required, validateTree } from '@angular/forms/signals';

import { Priority } from '../../shared/priority';
import { SignalPriorityPickerComponent } from './signal-priority-picker.component';

type DynamicFieldType = 'string' | 'number' | 'date';
type DynamicFieldValue = string | number | Date | null;

interface DynamicFieldModel {
  id: string;
  label: string;
  type: DynamicFieldType;
  value: DynamicFieldValue;
}

interface ProfileModel {
  name: string;
  age: number | null;
  startDate: Date | null;
  priority: Priority;
  email: string;
  emailConfirmation: string;
  dynamicFields: DynamicFieldModel[];
}

@Component({
  selector: 'app-signal-forms-demo',
  imports: [FormField, FormRoot, SignalPriorityPickerComponent],
  template: `
    <section class="page-heading" aria-labelledby="signal-title">
      <p class="eyebrow">Signal Forms</p>
      <h1 id="signal-title">Modell als Formularzustand</h1>
      <p>Das Form-Tree wird aus einem Signal-Modell abgeleitet; Regeln werden deklarativ an Pfade gebunden.</p>
    </section>

    <form class="demo-form" [formRoot]="profileForm" (submit)="submit($event)">
      <fieldset>
        <legend>Profil</legend>
        <div class="field-grid">
          <label>
            Name
            <input [formField]="profileForm.name" autocomplete="name" />
            @if (profileForm.name().touched() && profileForm.name().invalid()) {
              <small class="error">{{ profileForm.name().errors()[0]?.message }}</small>
            }
          </label>
          <label>
            Alter
            <input type="number" [formField]="profileForm.age" />
            @if (profileForm.age().touched() && profileForm.age().invalid()) {
              <small class="error">{{ profileForm.age().errors()[0]?.message }}</small>
            }
          </label>
          <label>
            Startdatum
            <input type="date" [value]="toDateInput(model().startDate)" (change)="setStartDate($event)" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Custom FormValueControl</legend>
        <p class="hint">Das Control exponiert <code>value = model.required&lt;Priority&gt;()</code>; <code>formField</code> synchronisiert es direkt mit dem Modell.</p>
        <app-signal-priority-picker [formField]="profileForm.priority" />
      </fieldset>

      <fieldset>
        <legend>E-Mail-Bestätigung</legend>
        <div class="field-grid">
          <label>
            E-Mail
            <input type="email" [formField]="profileForm.email" autocomplete="email" />
            @if (profileForm.email().touched() && profileForm.email().invalid()) {
              <small class="error">{{ profileForm.email().errors()[0]?.message }}</small>
            }
          </label>
          <label>
            E-Mail wiederholen
            <input type="email" [formField]="profileForm.emailConfirmation" autocomplete="email" />
          </label>
        </div>
        @if (emailsMismatch()) {
          <p class="error form-error">Die E-Mail-Adressen stimmen nicht überein.</p>
        }
      </fieldset>

      <fieldset>
        <div class="fieldset-header">
          <legend>Dynamische Felder</legend>
          <button type="button" class="secondary-button" (click)="addField()">Feld hinzufügen</button>
        </div>
        <p class="hint">Der Eintrag wird in das Modell geschrieben. <code>applyEach</code> wendet die Regeln automatisch auf jedes Array-Element an.</p>

        <div class="dynamic-list">
          @for (field of model().dynamicFields; track field.id; let index = $index) {
            <div class="dynamic-row">
              <label>
                Feldname
                <input [value]="field.label" (input)="setLabel(index, $event)" [attr.aria-label]="'Name für dynamisches Feld ' + (index + 1)" />
              </label>
              <label>
                Datentyp
                <select [value]="field.type" (change)="setType(index, $event)">
                  <option value="string">Text</option>
                  <option value="number">Zahl</option>
                  <option value="date">Datum</option>
                </select>
              </label>
              <label>
                Wert
                @switch (field.type) {
                  @case ('number') {
                    <input type="number" [value]="field.value" (input)="setNumberValue(index, $event)" [attr.aria-label]="'Wert für dynamisches Feld ' + (index + 1)" />
                  }
                  @case ('date') {
                    <input type="date" [value]="toDateInput(field.value)" (change)="setDateValue(index, $event)" [attr.aria-label]="'Datum für dynamisches Feld ' + (index + 1)" />
                  }
                  @default {
                    <input [value]="field.value" (input)="setTextValue(index, $event)" [attr.aria-label]="'Wert für dynamisches Feld ' + (index + 1)" />
                  }
                }
              </label>
              <button type="button" class="icon-button" (click)="removeField(index)" [attr.aria-label]="'Dynamisches Feld ' + (index + 1) + ' entfernen'">×</button>
            </div>
          } @empty {
            <p class="empty-state">Noch keine zusätzlichen Felder.</p>
          }
        </div>
      </fieldset>

      <div class="form-footer">
        <button type="submit">Profil prüfen</button>
        <span class="status" [class.is-valid]="profileForm().valid()" [class.is-invalid]="profileForm().invalid()">
          {{ profileForm().valid() ? 'Formular gültig' : 'Formular enthält Fehler' }}
        </span>
      </div>
      @if (wasSubmitted() && profileForm().invalid()) {
        <p class="error form-error" role="alert">Bitte korrigiere die markierten Eingaben.</p>
      }
    </form>

    <section class="state-panel" aria-labelledby="signal-state-title">
      <h2 id="signal-state-title">Aktuelles Modell</h2>
      <pre>{{ valuePreview() }}</pre>
    </section>
  `,
})
export class SignalFormsDemoComponent {
  protected readonly wasSubmitted = signal(false);
  // Signal Forms uses this writable model signal as its single source of truth.
  protected readonly model = signal<ProfileModel>({
    name: '',
    age: null,
    startDate: null,
    priority: 'medium',
    email: '',
    emailConfirmation: '',
    dynamicFields: [],
  });

  // Schema functions attach validation and field state directly to paths in the model tree.
  protected readonly profileForm = form(this.model, (profile) => {
    required(profile.name, { message: 'Name ist erforderlich.' });
    required(profile.age, { message: 'Alter ist erforderlich.' });
    min(profile.age, 18, { message: 'Mindestalter: 18 Jahre.' });
    required(profile.priority, { message: 'Priorität ist erforderlich.' });
    required(profile.email, { message: 'E-Mail ist erforderlich.' });
    email(profile.email, { message: 'Bitte eine gültige E-Mail eingeben.' });
    required(profile.emailConfirmation, { message: 'E-Mail-Bestätigung ist erforderlich.' });
    validateTree(profile, ({ value }) => {
      // Tree validation can compare values from multiple fields without a separate form group.
      const currentProfile = value();
      return currentProfile.email && currentProfile.emailConfirmation && currentProfile.email !== currentProfile.emailConfirmation
        ? { kind: 'email-mismatch', message: 'Die E-Mail-Adressen stimmen nicht überein.' }
        : undefined;
    });
    applyEach(profile.dynamicFields, (field) => {
      // New array entries automatically receive these rules as soon as the model is updated.
      required(field.label, { message: 'Ein Feldname ist erforderlich.' });
      required(field.value, { message: 'Ein Wert ist erforderlich.' });
    });
  });

  protected readonly emailsMismatch = computed(() => {
    const { email: emailValue, emailConfirmation } = this.model();
    return Boolean(emailValue && emailConfirmation && emailValue !== emailConfirmation);
  });
  protected readonly valuePreview = computed(() => JSON.stringify(this.model(), this.dateReplacer, 2));

  protected addField(): void {
    // Updating the model creates both the dynamic UI row and its FieldTree entry.
    this.model.update((profile) => ({
      ...profile,
      dynamicFields: [...profile.dynamicFields, { id: crypto.randomUUID(), label: 'Zusatzfeld', type: 'string', value: '' }],
    }));
  }

  protected removeField(index: number): void {
    this.model.update((profile) => ({
      ...profile,
      dynamicFields: profile.dynamicFields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  }

  protected setStartDate(event: Event): void {
    this.model.update((profile) => ({ ...profile, startDate: this.toDate(event) }));
  }

  protected setLabel(index: number, event: Event): void {
    this.updateDynamicField(index, (field) => ({ ...field, label: this.toText(event) }));
  }

  protected setType(index: number, event: Event): void {
    const type = this.toText(event) as DynamicFieldType;
    this.updateDynamicField(index, (field) => ({ ...field, type, value: type === 'number' ? 0 : null }));
  }

  protected setTextValue(index: number, event: Event): void {
    this.updateDynamicField(index, (field) => ({ ...field, value: this.toText(event) }));
  }

  protected setNumberValue(index: number, event: Event): void {
    const value = this.toText(event);
    this.updateDynamicField(index, (field) => ({ ...field, value: value === '' ? null : Number(value) }));
  }

  protected setDateValue(index: number, event: Event): void {
    this.updateDynamicField(index, (field) => ({ ...field, value: this.toDate(event) }));
  }

  protected toDateInput(value: DynamicFieldValue): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : '';
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();
    this.wasSubmitted.set(true);
  }

  private updateDynamicField(index: number, update: (field: DynamicFieldModel) => DynamicFieldModel): void {
    this.model.update((profile) => ({
      ...profile,
      dynamicFields: profile.dynamicFields.map((field, fieldIndex) => fieldIndex === index ? update(field) : field),
    }));
  }

  private toText(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private toDate(event: Event): Date | null {
    const value = this.toText(event);
    return value ? new Date(`${value}T00:00:00`) : null;
  }

  private dateReplacer(_: string, value: unknown): unknown {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
}
