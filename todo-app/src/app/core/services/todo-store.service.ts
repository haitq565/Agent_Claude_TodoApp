import { Injectable, signal, computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Todo, TodoFilter, TodoStatus } from '../models/todo.model';
import { TodoService } from './todo.service';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private todoService = inject(TodoService);
  private snackBar = inject(MatSnackBar);

  // ── State ──────────────────────────────────────────────────────────
  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);
  readonly filter = signal<TodoFilter>({
    status: 'all',
    priority: 'all',
    category: '',
    search: '',
  });
  readonly selectedIds = signal<Set<number>>(new Set());

  // ── Computed ───────────────────────────────────────────────────────
  readonly filteredTodos = computed(() => {
    const f = this.filter();
    return this.todos().filter(todo => {
      if (f.status !== 'all' && todo.status !== f.status) return false;
      if (f.priority !== 'all' && todo.priority !== f.priority) return false;
      if (f.category && todo.category !== f.category) return false;
      if (f.search && !todo.title.toLowerCase().includes(f.search.toLowerCase())) return false;
      return true;
    });
  });

  readonly totalCount      = computed(() => this.todos().length);
  readonly activeCount     = computed(() => this.todos().filter(t => t.status === 'active').length);
  readonly completedCount  = computed(() => this.todos().filter(t => t.status === 'completed').length);
  readonly highPriorityCount = computed(() =>
    this.todos().filter(t => t.priority === 'high' && t.status === 'active').length
  );
  readonly completionRate  = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });
  readonly selectedCount   = computed(() => this.selectedIds().size);
  readonly allSelected     = computed(() => {
    const filtered = this.filteredTodos();
    return filtered.length > 0 && filtered.every(t => this.selectedIds().has(t.id));
  });
  readonly someSelected    = computed(() =>
    this.selectedIds().size > 0 && !this.allSelected()
  );
  readonly categories      = computed(() => {
    const cats = new Set(this.todos().map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  });

  // ── CRUD ───────────────────────────────────────────────────────────
  loadAll(): void {
    this.loading.set(true);
    this.todoService.getAll().subscribe({
      next: todos => { this.todos.set(todos); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snack('Không thể tải danh sách todo. Kiểm tra JSON Server!', 5000);
      },
    });
  }

  add(todo: Omit<Todo, 'id'>): void {
    this.todoService.create(todo).subscribe({
      next: newTodo => {
        this.todos.update(ts => [...ts, newTodo]);
        this.snack('Todo đã được thêm!');
      },
      error: () => this.snack('Thêm todo thất bại!'),
    });
  }

  update(id: number, changes: Partial<Todo>): void {
    const updatedAt = new Date().toISOString();
    this.todoService.update(id, { ...changes, updatedAt }).subscribe({
      next: updated => {
        this.todos.update(ts => ts.map(t => t.id === id ? { ...t, ...updated } : t));
        this.snack('Todo đã cập nhật!');
      },
      error: () => this.snack('Cập nhật thất bại!'),
    });
  }

  delete(id: number): void {
    this.todoService.delete(id).subscribe({
      next: () => {
        this.todos.update(ts => ts.filter(t => t.id !== id));
        this.selectedIds.update(ids => { const next = new Set(ids); next.delete(id); return next; });
        this.snack('Todo đã xóa!');
      },
      error: () => this.snack('Xóa thất bại!'),
    });
  }

  toggleStatus(todo: Todo): void {
    const status: TodoStatus = todo.status === 'active' ? 'completed' : 'active';
    const updatedAt = new Date().toISOString();
    this.todoService.update(todo.id, { status, updatedAt }).subscribe({
      next: updated => this.todos.update(ts => ts.map(t => t.id === todo.id ? { ...t, ...updated } : t)),
      error: () => this.snack('Cập nhật trạng thái thất bại!'),
    });
  }

  // ── Filter ─────────────────────────────────────────────────────────
  setFilter(patch: Partial<TodoFilter>): void {
    this.filter.update(f => ({ ...f, ...patch }));
  }

  resetFilter(): void {
    this.filter.set({ status: 'all', priority: 'all', category: '', search: '' });
  }

  // ── Selection ──────────────────────────────────────────────────────
  toggleSelection(id: number): void {
    this.selectedIds.update(ids => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.filteredTodos().map(t => t.id)));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  // ── Bulk Actions ───────────────────────────────────────────────────
  bulkDelete(): void {
    const ids = Array.from(this.selectedIds());
    ids.forEach(id => this.todoService.delete(id).subscribe());
    this.todos.update(ts => ts.filter(t => !this.selectedIds().has(t.id)));
    this.selectedIds.set(new Set());
    this.snack(`Đã xóa ${ids.length} todo!`);
  }

  bulkComplete(): void {
    const ids = Array.from(this.selectedIds());
    const updatedAt = new Date().toISOString();
    ids.forEach(id => this.todoService.update(id, { status: 'completed', updatedAt }).subscribe());
    this.todos.update(ts =>
      ts.map(t => ids.includes(t.id) ? { ...t, status: 'completed' as TodoStatus, updatedAt } : t)
    );
    this.selectedIds.set(new Set());
    this.snack(`Đã hoàn thành ${ids.length} todo!`);
  }

  // ── Helpers ────────────────────────────────────────────────────────
  private snack(msg: string, duration = 2500): void {
    this.snackBar.open(msg, 'Đóng', { duration });
  }
}
