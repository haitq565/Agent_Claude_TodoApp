import {
  Component, inject, output, ViewChild, AfterViewInit, ChangeDetectionStrategy, effect,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { TodoStore } from '../../../../core/services/todo-store.service';
import { PriorityLabelPipe } from '../../../../shared/pipes/priority-label.pipe';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Todo } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, NgClass,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatCheckboxModule, MatChipsModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatMenuModule,
    PriorityLabelPipe, EmptyStateComponent,
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements AfterViewInit {
  readonly store = inject(TodoStore);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  readonly editTodo   = output<Todo>();
  readonly deleteTodo = output<Todo>();

  readonly displayedColumns = ['select', 'title', 'status', 'priority', 'category', 'dueDate', 'actions'];
  readonly dataSource = new MatTableDataSource<Todo>([]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.filteredTodos();
      if (this.paginator) this.paginator.firstPage();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.status === 'completed') return false;
    return new Date(todo.dueDate) < new Date();
  }
}
