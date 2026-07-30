import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Priority, priorityOptions } from '../../shared/priority';

@Component({
  selector: 'app-reactive-priority-picker',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ReactivePriorityPickerComponent), multi: true }],
  template: `
    <div class="priority-picker" role="radiogroup" aria-label="Priorität" (focusout)="markAsTouched()">
      @for (option of priorityOptions; track option.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="value() === option.value"
          [class.is-selected]="value() === option.value"
          [disabled]="isDisabled()"
          (click)="select(option.value)">
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class ReactivePriorityPickerComponent implements ControlValueAccessor {
  protected readonly priorityOptions = priorityOptions;
  protected readonly value = signal<Priority>('medium');
  protected readonly isDisabled = signal(false);

  private onChange: (value: Priority) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Priority | null): void {
    this.value.set(value ?? 'medium');
  }

  registerOnChange(onChange: (value: Priority) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected select(value: Priority): void {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(value);
    this.onChange(value);
  }

  protected markAsTouched(): void {
    this.onTouched();
  }
}
