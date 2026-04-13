import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TodoStore } from '../../../../core/services/todo-store.service';
import { Todo, TodoStatus, Priority, CATEGORIES, PRIORITIES } from '../../../../core/models/todo.model';
import { PriorityLabelPipe } from '../../../../shared/pipes/priority-label.pipe';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule,
    PriorityLabelPipe,
  ],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss',
})
export class TodoFormComponent {
  private fb       = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TodoFormComponent>);
  private store    = inject(TodoStore);
  readonly todo: Todo | null = inject(MAT_DIALOG_DATA, { optional: true });

  readonly isEdit = !!this.todo;
  readonly categories = CATEGORIES;
  readonly priorities = PRIORITIES;

  readonly form = this.fb.nonNullable.group({
    title:       [this.todo?.title ?? '',        [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: [this.todo?.description ?? ''],
    status:      [this.todo?.status ?? 'active'  as TodoStatus, Validators.required],
    priority:    [this.todo?.priority ?? 'medium' as Priority,  Validators.required],
    category:    [this.todo?.category ?? '',      Validators.required],
    dueDate:     [this.todo?.dueDate ? new Date(this.todo.dueDate) : null as Date | null],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const now  = new Date().toISOString();
    const dueDate = raw.dueDate
      ? (raw.dueDate as Date).toISOString().split('T')[0]
      : undefined;

    if (this.isEdit && this.todo) {
      this.store.update(this.todo.id, {
        title:       raw.title,
        description: raw.description || undefined,
        status:      raw.status,
        priority:    raw.priority,
        category:    raw.category,
        dueDate,
        updatedAt:   now,
      });
    } else {
      this.store.add({
        title:       raw.title,
        description: raw.description || undefined,
        status:      raw.status,
        priority:    raw.priority,
        category:    raw.category,
        dueDate,
        createdAt:   now,
        updatedAt:   now,
      });
    }

    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMsg(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])   return 'Trường này là bắt buộc';
    if (ctrl.errors['minlength'])  return `Tối thiểu ${ctrl.errors['minlength'].requiredLength} ký tự`;
    if (ctrl.errors['maxlength'])  return `Tối đa ${ctrl.errors['maxlength'].requiredLength} ký tự`;
    return 'Không hợp lệ';
  }
}
