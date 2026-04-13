import { Pipe, PipeTransform } from '@angular/core';
import { Priority } from '../../core/models/todo.model';

@Pipe({ name: 'priorityLabel', standalone: true })
export class PriorityLabelPipe implements PipeTransform {
  transform(priority: Priority): string {
    const labels: Record<Priority, string> = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao',
    };
    return labels[priority] ?? priority;
  }
}
