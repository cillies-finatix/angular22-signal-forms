import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./home.component').then((component) => component.HomeComponent),
		title: 'Angular Forms im Vergleich',
	},
	{
		path: 'reactive-forms',
		loadComponent: () => import('./features/reactive-forms/reactive-forms-demo.component').then((component) => component.ReactiveFormsDemoComponent),
		title: 'Reactive Forms',
	},
	{
		path: 'signal-forms',
		loadComponent: () => import('./features/signal-forms/signal-forms-demo.component').then((component) => component.SignalFormsDemoComponent),
		title: 'Signal Forms',
	},
	{ path: '**', redirectTo: '' },
];
