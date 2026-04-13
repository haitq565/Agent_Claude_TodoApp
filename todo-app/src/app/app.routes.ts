import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — Todo Admin',
  },
  {
    path: 'todos',
    loadComponent: () =>
      import('./features/todos/todos.component').then(m => m.TodosComponent),
    title: 'Quản lý Todos — Todo Admin',
  },
  { path: '**', redirectTo: 'dashboard' },
];
