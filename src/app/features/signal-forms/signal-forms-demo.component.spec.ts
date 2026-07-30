import { TestBed } from '@angular/core/testing';

import { SignalFormsDemoComponent } from './signal-forms-demo.component';

describe('SignalFormsDemoComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

    vi.useFakeTimers();
    const submitButton = hostElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    hostElement.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(submitButton?.disabled).toBe(true);
    expect(submitButton?.textContent).toContain('Profil wird geprüft');

    await vi.runAllTimersAsync();
    fixture.detectChanges();

    expect(submitButton?.disabled).toBe(false);
    expect(submitButton?.textContent).toContain('Profil prüfen');
  });

  it('submits through FormRoot and reveals validation errors', async () => {
    const fixture = TestBed.createComponent(SignalFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    const formElement = hostElement.querySelector<HTMLFormElement>('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

    expect(formElement).not.toBeNull();
    formElement?.dispatchEvent(submitEvent);
    fixture.detectChanges();

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(hostElement.querySelector('[autocomplete="name"] + .error')?.textContent).toContain('Name ist erforderlich.');
    expect(hostElement.querySelector('[role="alert"]')?.textContent).toContain('Bitte korrigiere die markierten Eingaben.');
  });
});