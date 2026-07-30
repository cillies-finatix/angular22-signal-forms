import { TestBed } from '@angular/core/testing';

import { ReactiveFormsDemoComponent } from './reactive-forms-demo.component';

describe('ReactiveFormsDemoComponent', () => {
  it('renders the reactive forms demo', async () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.querySelector('h1')?.textContent).toContain('Control-Tree als Formularzustand');
    expect(hostElement.querySelector('.status')?.textContent).toContain('Formular enthält Fehler');
  });

  it('adds a dynamic form group', async () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    hostElement.querySelector<HTMLButtonElement>('.secondary-button')?.click();
    fixture.detectChanges();

    expect(hostElement.querySelectorAll('.dynamic-row')).toHaveLength(1);
    expect(hostElement.querySelector<HTMLInputElement>('[formcontrolname="label"]')?.value).toBe('Zusatzfeld');
  });

  it('updates and validates the form through its controls', async () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;
    const setControlValue = (selector: string, value: string): void => {
      const input = hostElement.querySelector<HTMLInputElement>(selector);
      expect(input).not.toBeNull();
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    setControlValue('[formcontrolname="name"]', 'Ada');
    setControlValue('[formcontrolname="age"]', '36');
    setControlValue('[formcontrolname="email"]', 'ada@example.com');
    setControlValue('[formcontrolname="emailConfirmation"]', 'ada@example.com');
    fixture.detectChanges();

    expect(hostElement.querySelector('.status')?.textContent).toContain('Formular gültig');
    expect(hostElement.querySelector('pre')?.textContent).toContain('"name": "Ada"');
  });
});