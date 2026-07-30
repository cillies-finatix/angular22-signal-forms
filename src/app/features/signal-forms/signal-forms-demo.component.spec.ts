import { TestBed } from '@angular/core/testing';

import { SignalFormsDemoComponent } from './signal-forms-demo.component';

describe('SignalFormsDemoComponent', () => {
  it('renders the signal forms demo', async () => {
    const fixture = TestBed.createComponent(SignalFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.querySelector('h1')?.textContent).toContain('Modell als Formularzustand');
    expect(hostElement.querySelector('.status')?.textContent).toContain('Formular enthält Fehler');
  });

  it('adds a dynamic model field', async () => {
    const fixture = TestBed.createComponent(SignalFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    hostElement.querySelector<HTMLButtonElement>('.secondary-button')?.click();
    fixture.detectChanges();

    expect(hostElement.querySelectorAll('.dynamic-row')).toHaveLength(1);
    expect(hostElement.querySelector<HTMLInputElement>('.dynamic-row input')?.value).toBe('Zusatzfeld');
  });

  it('updates and validates the model through its form fields', async () => {
    const fixture = TestBed.createComponent(SignalFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    const enterFieldValue = (selector: string, value: string, index = 0): void => {
      const input = hostElement.querySelectorAll<HTMLInputElement>(selector)[index];
      expect(input).not.toBeNull();
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    enterFieldValue('[autocomplete="name"]', 'Ada');
    enterFieldValue('input[type="number"]', '36');
    enterFieldValue('[autocomplete="email"]', 'ada@example.com');
    enterFieldValue('input[type="email"]', 'ada@example.com', 1);
    fixture.detectChanges();

    expect(hostElement.querySelector('.status')?.textContent).toContain('Formular gültig');
    expect(hostElement.querySelector('pre')?.textContent).toContain('"name": "Ada"');
  });
});