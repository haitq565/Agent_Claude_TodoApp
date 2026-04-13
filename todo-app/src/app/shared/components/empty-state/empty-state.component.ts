import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3 class="empty-title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }
    .empty-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: var(--mat-sys-outline);
      margin-bottom: 16px;
    }
    .empty-title {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
    }
    .empty-message {
      margin: 0;
      color: var(--mat-sys-outline);
      font-size: 14px;
    }
  `],
})
export class EmptyStateComponent {
  icon    = input('inbox');
  title   = input('Không có dữ liệu');
  message = input('');
}
