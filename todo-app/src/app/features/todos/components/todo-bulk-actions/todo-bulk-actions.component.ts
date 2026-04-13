import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TodoStore } from '../../../../core/services/todo-store.service';

@Component({
  selector: 'app-todo-bulk-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="bulk-bar">
      <span class="bulk-count">
        <mat-icon>check_box</mat-icon>
        {{ store.selectedCount() }} mục được chọn
      </span>
      <div class="bulk-actions">
        <button
          mat-stroked-button
          (click)="bulkComplete()"
          matTooltip="Đánh dấu hoàn thành"
          class="btn-complete"
        >
          <mat-icon>done_all</mat-icon>
          Hoàn thành
        </button>
        <button
          mat-stroked-button
          (click)="bulkDeleteRequest.emit()"
          matTooltip="Xóa các mục đã chọn"
          class="btn-delete"
        >
          <mat-icon>delete_sweep</mat-icon>
          Xóa {{ store.selectedCount() }} mục
        </button>
        <button
          mat-icon-button
          (click)="store.clearSelection()"
          matTooltip="Bỏ chọn tất cả"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bulk-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--mat-sys-secondary-container);
      border-radius: 8px;
      margin-bottom: 12px;
      animation: slideIn .2s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bulk-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--mat-sys-on-secondary-container);
      mat-icon { font-size: 20px; height: 20px; width: 20px; }
    }
    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-complete { color: #2e7d32; border-color: #2e7d32; }
    .btn-delete   { color: #c62828; border-color: #c62828; }
  `],
})
export class TodoBulkActionsComponent {
  readonly store = inject(TodoStore);
  bulkDeleteRequest = output<void>();

  bulkComplete(): void {
    this.store.bulkComplete();
  }
}
