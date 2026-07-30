import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./home.component').then((component) => component.HomeComponent),
		title: 'Angular Forms im Vergleich',
	},
	{
		path: 'reactive-forms',
		loadComponent: () => import('./reactive-forms-demo.component').then((component) => component.ReactiveFormsDemoComponent),
		title: 'Reactive Forms',
	},
	{
		path: 'signal-forms',
		loadComponent: () => import('./signal-forms-demo.component').then((component) => component.SignalFormsDemoComponent),
		title: 'Signal Forms',
	},
	{ path: '**', redirectTo: '' },
];
