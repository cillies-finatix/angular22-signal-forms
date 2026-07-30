import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';

import { Priority } from '../../shared/priority';
import { SignalPriorityPickerComponent } from './signal-priority-picker.component';

@Component({
  imports: [FormField, SignalPriorityPickerComponent],
  template: `<app-signal-priority-picker [formField]="profileForm.priority" />`,
})
class SignalPriorityPickerHostComponent {
  readonly model = signal({ priority: 'medium' as Priority });
  readonly profileForm = form(this.model);
}

describe('SignalPriorityPickerComponent', () => {
  it('writes a selected value to its model signal', async () => {
    const fixture = TestBed.createComponent(SignalPriorityPickerHostComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    const highPriorityButton = hostElement.querySelectorAll<HTMLButtonElement>('[role="radio"]')[2];
    highPriorityButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.model().priority).toBe('high');
    expect(highPriorityButton.getAttribute('aria-checked')).toBe('true');
  });
});