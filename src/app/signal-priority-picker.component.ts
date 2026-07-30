import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

import { Priority, priorityOptions } from './priority';

@Component({
  selector: 'app-signal-priority-picker',
  template: `
    <div class="priority-picker" role="radiogroup" aria-label="Priorität" (focusout)="touch.emit()">
      @for (option of priorityOptions; track option.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="value() === option.value"
          [class.is-selected]="value() === option.value"
          [disabled]="disabled()"
          (click)="value.set(option.value)">
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SignalPriorityPickerComponent implements FormValueControl<Priority> {
  protected readonly priorityOptions = priorityOptions;
  readonly value = model.required<Priority>();
  readonly disabled = input(false);
  readonly touch = output<void>();
}