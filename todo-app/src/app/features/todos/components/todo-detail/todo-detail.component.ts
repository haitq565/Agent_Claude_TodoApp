import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TodoStore } from '../../../../core/services/todo-store.service';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { PriorityLabelPipe } from '../../../../shared/pipes/priority-label.pipe';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, DatePipe, NgClass,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatDividerModule, MatTooltipModule,
    MatProgressSpinnerModule,
    PriorityLabelPipe,
  ],
  templateUrl: './todo-detail.component.html',
  styleUrl: './todo-detail.component.scss',
})
export class TodoDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  readonly store = inject(TodoStore);

  readonly todoId   = signal<number>(0);
  readonly todo     = computed(() => this.store.todos().find(t => t.id === this.todoId()) ?? null);
  readonly notFound = computed(() => !this.store.loading() && this.todoId() > 0 && this.todo() === null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.todoId.set(id);
    if (this.store.todos().length === 0) {
      this.store.loadAll();
    }
  }

  isOverdue(): boolean {
    const todo = this.todo();
    if (!todo?.dueDate || todo.status === 'completed') return false;
    return new Date(todo.dueDate) < new Date();
  }

  openEditDialog(): void {
    const todo = this.todo();
    if (!todo) return;
    this.dialog.open(TodoFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: todo,
      disableClose: false,
    });
  }

  goBack(): void {
    this.router.navigate(['/todos']);
  }
}
