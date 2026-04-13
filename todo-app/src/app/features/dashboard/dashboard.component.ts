import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TodoStore } from '../../core/services/todo-store.service';
import { PriorityLabelPipe } from '../../shared/pipes/priority-label.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Todo } from '../../core/models/todo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, DatePipe, NgClass,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatTableModule, MatChipsModule, MatTooltipModule,
    PriorityLabelPipe, EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly store = inject(TodoStore);

  recentColumns = ['title', 'status', 'priority', 'dueDate'];

  get recentTodos(): Todo[] {
    return [...this.store.todos()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }

  get priorityStats() {
    const todos = this.store.todos();
    return [
      { label: 'Cao',      cssClass: 'dot-high',   count: todos.filter(t => t.priority === 'high').length },
      { label: 'Trung bình', cssClass: 'dot-medium', count: todos.filter(t => t.priority === 'medium').length },
      { label: 'Thấp',     cssClass: 'dot-low',    count: todos.filter(t => t.priority === 'low').length },
    ];
  }

  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.status === 'completed') return false;
    return new Date(todo.dueDate) < new Date();
  }

  ngOnInit(): void {
    if (this.store.todos().length === 0) {
      this.store.loadAll();
    }
  }
}
