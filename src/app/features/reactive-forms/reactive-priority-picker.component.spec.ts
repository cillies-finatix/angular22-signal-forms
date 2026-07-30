import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Priority } from '../../shared/priority';
import { ReactivePriorityPickerComponent } from './reactive-priority-picker.component';

@Component({
  imports: [ReactiveFormsModule, ReactivePriorityPickerComponent],
  template: `<app-reactive-priority-picker [formControl]="priority" />`,
})
class ReactivePriorityPickerHostComponent {
  readonly priority = new FormControl<Priority>('medium', { nonNullable: true });
}

describe('ReactivePriorityPickerComponent', () => {
  it('writes a selected value to its FormControl', async () => {
    const fixture = TestBed.createComponent(ReactivePriorityPickerHostComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    const highPriorityButton = hostElement.querySelectorAll<HTMLButtonElement>('[role="radio"]')[2];
    highPriorityButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.priority.value).toBe('high');
    expect(highPriorityButton.getAttribute('aria-checked')).toBe('true');
  });
});