import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-header" [class.destructive]="data.isDestructive">
        <mat-icon>{{ data.isDestructive ? 'warning' : 'help_outline' }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>
          {{ data.cancelText ?? 'Hủy' }}
        </button>
        <button
          mat-flat-button
          [class]="data.isDestructive ? 'btn-danger' : ''"
          [mat-dialog-close]="true"
        >
          {{ data.confirmText ?? 'Xác nhận' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { min-width: 320px; }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 0;
      mat-icon { font-size: 28px; height: 28px; width: 28px; color: var(--mat-sys-primary); }
      h2 { margin: 0; }
    }
    .confirm-header.destructive mat-icon { color: #c62828; }
    mat-dialog-content p { margin: 0; color: var(--mat-sys-on-surface-variant); }
    .btn-danger { background-color: #c62828 !important; color: white !important; }
  `],
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
