import {
  Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TodoStore } from '../../../../core/services/todo-store.service';
import { TodoStatus, Priority } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-filter-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatChipsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatSelectModule, MatTooltipModule,
  ],
  templateUrl: './todo-filter-bar.component.html',
  styleUrl: './todo-filter-bar.component.scss',
})
export class TodoFilterBarComponent implements OnInit, OnDestroy {
  readonly store = inject(TodoStore);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => this.store.setFilter({ search }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStatusChange(event: MatChipListboxChange): void {
    this.store.setFilter({ status: event.value as TodoStatus | 'all' });
  }

  onPriorityChange(event: MatChipListboxChange): void {
    this.store.setFilter({ priority: event.value as Priority | 'all' });
  }

  onCategoryChange(value: string): void {
    this.store.setFilter({ category: value });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.store.setFilter({ search: '' });
  }

  reset(): void {
    this.searchControl.setValue('');
    this.store.resetFilter();
  }

  get hasActiveFilter(): boolean {
    const f = this.store.filter();
    return f.status !== 'all' || f.priority !== 'all' || !!f.category || !!f.search;
  }
}
