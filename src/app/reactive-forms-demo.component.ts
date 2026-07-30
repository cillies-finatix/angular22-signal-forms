import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { startWith } from 'rxjs';

type DynamicFieldType = 'string' | 'number' | 'date';
type DynamicFieldValue = string | number | Date | null;

type DynamicFieldControls = {
  label: FormControl<string>;
  type: FormControl<DynamicFieldType>;
  value: FormControl<DynamicFieldValue>;
};

// A group validator can inspect sibling controls and report one shared error on the form group.
const matchingEmails: ValidatorFn = (control): ValidationErrors | null => {
  const email = control.get('email')?.value;
  const emailConfirmation = control.get('emailConfirmation')?.value;

  return email && emailConfirmation && email !== emailConfirmation ? { emailMismatch: true } : null;
};

@Component({
  selector: 'app-reactive-forms-demo',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-heading" aria-labelledby="reactive-title">
      <p class="eyebrow">Reactive Forms</p>
      <h1 id="reactive-title">Control-Tree als Formularzustand</h1>
      <p>Jedes dynamische Feld ist eine neue <code>FormGroup</code> innerhalb des <code>FormArray</code>.</p>
    </section>

    <form class="demo-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <fieldset>
        <legend>Profil</legend>
        <div class="field-grid">
          <label>
            Name
            <input formControlName="name" autocomplete="name" />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <small class="error">Name ist erforderlich.</small>
            }
          </label>
          <label>
            Alter
            <input type="number" formControlName="age" min="18" />
            @if (form.controls.age.touched && form.controls.age.invalid) {
              <small class="error">Mindestalter: 18 Jahre.</small>
            }
          </label>
          <label>
            Startdatum
            <input type="date" [value]="toDateInput(form.controls.startDate.value)" (change)="setStartDate($event)" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>E-Mail-Bestätigung</legend>
        <div class="field-grid">
          <label>
            E-Mail
            <input type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="error">Gültige E-Mail erforderlich.</small>
            }
          </label>
          <label>
            E-Mail wiederholen
            <input type="email" formControlName="emailConfirmation" autocomplete="email" />
          </label>
        </div>
        @if (form.hasError('emailMismatch') && (form.controls.email.touched || form.controls.emailConfirmation.touched)) {
          <p class="error form-error">Die E-Mail-Adressen stimmen nicht überein.</p>
        }
      </fieldset>

      <fieldset>
        <div class="fieldset-header">
          <legend>Dynamische Felder</legend>
          <button type="button" class="secondary-button" (click)="addField()">Feld hinzufügen</button>
        </div>
        <p class="hint">Der Button erzeugt zur Laufzeit eine FormGroup mit Label, Typ und typisiertem Wert-Control.</p>

        <div class="dynamic-list" formArrayName="dynamicFields">
          @for (field of dynamicFields.controls; track $index; let index = $index) {
            <div class="dynamic-row" [formGroupName]="index">
              <label>
                Feldname
                <input formControlName="label" [attr.aria-label]="'Name für dynamisches Feld ' + (index + 1)" />
              </label>
              <label>
                Datentyp
                <select formControlName="type" (change)="resetDynamicValue(index)">
                  <option value="string">Text</option>
                  <option value="number">Zahl</option>
                  <option value="date">Datum</option>
                </select>
              </label>
              <label>
                Wert
                @switch (field.controls.type.value) {
                  @case ('number') {
                    <input type="number" formControlName="value" [attr.aria-label]="'Wert für dynamisches Feld ' + (index + 1)" />
                  }
                  @case ('date') {
                    <input type="date" [value]="toDateInput(field.controls.value.value)" (change)="setDynamicDate(index, $event)" [attr.aria-label]="'Datum für dynamisches Feld ' + (index + 1)" />
                  }
                  @default {
                    <input formControlName="value" [attr.aria-label]="'Wert für dynamisches Feld ' + (index + 1)" />
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
        <span class="status" [class.is-valid]="form.valid" [class.is-invalid]="form.invalid">
          {{ form.valid ? 'Formular gültig' : 'Formular enthält Fehler' }}
        </span>
      </div>
      @if (wasSubmitted() && form.invalid) {
        <p class="error form-error" role="alert">Bitte korrigiere die markierten Eingaben.</p>
      }
    </form>

    <section class="state-panel" aria-labelledby="reactive-state-title">
      <h2 id="reactive-state-title">Aktueller Wert</h2>
      <pre>{{ valuePreview() }}</pre>
    </section>
  `,
})
export class ReactiveFormsDemoComponent {
  protected readonly wasSubmitted = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(18)]),
    startDate: new FormControl<Date | null>(null),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    emailConfirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dynamicFields: new FormArray<FormGroup<DynamicFieldControls>>([]),
  }, { validators: matchingEmails });

  protected readonly dynamicFields = this.form.controls.dynamicFields;
  // Reactive Forms emits Observables; the preview adapts valueChanges to a signal for the template.
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  protected readonly valuePreview = computed(() => JSON.stringify(this.formValue(), this.dateReplacer, 2));

  protected addField(): void {
    this.dynamicFields.push(this.createDynamicField());
  }

  protected removeField(index: number): void {
    this.dynamicFields.removeAt(index);
  }

  protected resetDynamicValue(index: number): void {
    const field = this.dynamicFields.at(index);
    // A type change invalidates the previous value representation.
    field.controls.value.setValue(field.controls.type.value === 'number' ? 0 : null);
  }

  protected setStartDate(event: Event): void {
    this.form.controls.startDate.setValue(this.toDate(event));
  }

  protected setDynamicDate(index: number, event: Event): void {
    this.dynamicFields.at(index).controls.value.setValue(this.toDate(event));
  }

  protected toDateInput(value: DynamicFieldValue): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : '';
  }

  protected submit(): void {
    this.wasSubmitted.set(true);
    this.form.markAllAsTouched();
  }

  private createDynamicField(): FormGroup<DynamicFieldControls> {
    // Every runtime field needs its own control tree and validators before FormArray can manage it.
    return new FormGroup<DynamicFieldControls>({
      label: new FormControl('Zusatzfeld', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl<DynamicFieldType>('string', { nonNullable: true }),
      value: new FormControl<DynamicFieldValue>('', Validators.required),
    });
  }

  private toDate(event: Event): Date | null {
    const value = (event.target as HTMLInputElement).value;
    return value ? new Date(`${value}T00:00:00`) : null;
  }

  private dateReplacer(_: string, value: unknown): unknown {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }
}