import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TodoStore } from '../../core/services/todo-store.service';
import { TodoFilterBarComponent } from './components/todo-filter-bar/todo-filter-bar.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoBulkActionsComponent } from './components/todo-bulk-actions/todo-bulk-actions.component';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Todo } from '../../core/models/todo.model';

@Component({
  selector: 'app-todos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule,
    TodoFilterBarComponent, TodoListComponent,
    TodoBulkActionsComponent,
  ],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent implements OnInit {
  readonly store  = inject(TodoStore);
  private dialog  = inject(MatDialog);

  ngOnInit(): void {
    this.store.loadAll();
    this.store.clearSelection();
  }

  openAddDialog(): void {
    this.dialog.open(TodoFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: false,
    });
  }

  openEditDialog(todo: Todo): void {
    this.dialog.open(TodoFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: todo,
      disableClose: false,
    });
  }

  confirmDelete(todo: Todo): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa Todo',
        message: `Bạn có chắc muốn xóa "${todo.title}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        isDestructive: true,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.store.delete(todo.id);
    });
  }

  confirmBulkDelete(): void {
    const count = this.store.selectedCount();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa nhiều Todo',
        message: `Bạn có chắc muốn xóa ${count} todo đã chọn? Hành động này không thể hoàn tác.`,
        confirmText: `Xóa ${count} todo`,
        isDestructive: true,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.store.bulkDelete();
    });
  }
}
