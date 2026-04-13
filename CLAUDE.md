# TodoApp — Angular 21 Admin

Ứng dụng quản lý công việc (Todo) với đầy đủ chức năng CRUD dành cho quản trị viên, xây dựng bằng Angular 21 + Angular Material + JSON Server.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular CLI 21.2.6 / Angular 21 (standalone components) |
| Language | TypeScript 5.x (strict mode) |
| UI Library | Angular Material 21 (M3 theme, violet palette) |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| HTTP | Angular HttpClient |
| Mock API | JSON Server (port 3000) |
| Routing | Angular Router |
| Forms | Reactive Forms |
| Unit Tests | Vitest (default trong Angular 21) |
| E2E Tests | Playwright |

---

## Cách Chạy Dự Án

### Yêu cầu môi trường
- Node.js >= 20.x
- Angular CLI >= 21.x
- Port **4200** (Angular) và **3000** (JSON Server) phải trống

### Cài đặt lần đầu
```bash
cd e:\AI_AGENT\Agent_Claude\todo-app
npm install
```

### Chạy development (khuyến nghị)
```bash
# Khởi động cả Angular + JSON Server cùng lúc, tự động mở trình duyệt
npm run dev
```
- Angular app: `http://localhost:4200`
- JSON Server API: `http://localhost:3000`

### Chạy riêng từng service
```bash
# Chỉ Angular dev server
npm start
# hoặc: ng serve

# Chỉ JSON Server (mock API)
npm run api
# hoặc: npx json-server db.json --port 3000
```

### Build & Tests
```bash
# Build production
npm run build

# Unit tests (Vitest)
npm test

# E2E tests (Playwright) — tự động start cả 2 server
npm run e2e           # Headless
npm run e2e:ui        # Mở Playwright UI mode để debug
npx playwright test --headed   # Chạy có hiển thị trình duyệt
```

### Lưu ý quan trọng
- `db.json` là CSDL thực — mọi thao tác thêm/sửa/xóa sẽ ghi trực tiếp vào file
- Khi chạy E2E, **không cần start server thủ công** — Playwright tự quản lý qua `webServer` config
- Unit test dùng **Vitest**, không phải Jasmine/Karma
- Chỉ dùng `npm`, không dùng `yarn` hay `pnpm`

---

## Commands

```bash
# Lint
ng lint

# Generate components/services
ng generate component features/todos/components/todo-list
ng generate service core/services/todo
ng generate pipe shared/pipes/filter-todos
```

---

## Project Structure

```
todo-app/
  db.json                         # Mock database (JSON Server)
  e2e/                            # Playwright E2E tests
    tests/
      todo-crud.spec.ts
      todo-filter.spec.ts
      todo-search.spec.ts
    playwright.config.ts
  src/
    app/
      core/
        models/
          todo.model.ts           # interface Todo, TodoStatus, Priority
        services/
          todo.service.ts         # HttpClient CRUD calls
        interceptors/
          loading.interceptor.ts
      features/
        todos/
          components/
            todo-list/            # Danh sách + bảng todos
            todo-form/            # Form thêm/sửa (dialog)
            todo-detail/          # Chi tiết todo
            todo-filter-bar/      # Thanh lọc + tìm kiếm
            todo-bulk-actions/    # Bulk select & actions
          todos.routes.ts
          todos.component.ts      # Shell component
        dashboard/
          dashboard.component.ts  # Thống kê tổng quan
          dashboard.routes.ts
      shared/
        components/
          confirm-dialog/         # Dialog xác nhận xóa
          empty-state/            # UI khi không có data
        pipes/
          filter-todos.pipe.ts
          priority-label.pipe.ts
        directives/
      app.config.ts               # provideHttpClient, provideRouter, provideAnimations
      app.routes.ts
      app.component.ts
    assets/
    styles.scss                   # Global styles + Material theme
```

---

## Data Model

```typescript
// core/models/todo.model.ts

export type TodoStatus = 'active' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  category: string;
  createdAt: string;   // ISO date string
  updatedAt: string;
  dueDate?: string;
}

export interface TodoFilter {
  status?: TodoStatus | 'all';
  priority?: Priority | 'all';
  category?: string;
  search?: string;
}
```

### db.json (JSON Server)

```json
{
  "todos": [
    {
      "id": 1,
      "title": "Sample Todo",
      "description": "Description here",
      "status": "active",
      "priority": "medium",
      "category": "Work",
      "createdAt": "2026-04-13T00:00:00.000Z",
      "updatedAt": "2026-04-13T00:00:00.000Z",
      "dueDate": "2026-04-20"
    }
  ]
}
```

**API Endpoints (JSON Server)**
- `GET    /todos` — lấy tất cả
- `GET    /todos?status=active` — lọc
- `GET    /todos?title_like=keyword` — tìm kiếm
- `POST   /todos` — tạo mới
- `PUT    /todos/:id` — cập nhật toàn bộ
- `PATCH  /todos/:id` — cập nhật một phần
- `DELETE /todos/:id` — xóa

---

## Architecture Decisions

### Signals (không dùng RxJS Subject cho state)
```typescript
// Dùng signal/computed/effect — KHÔNG dùng BehaviorSubject
todos = signal<Todo[]>([]);
activeTodos = computed(() => this.todos().filter(t => t.status === 'active'));
completedCount = computed(() => this.todos().filter(t => t.status === 'completed').length);
```

### RxJS chỉ dùng cho HTTP
```typescript
// HttpClient trả về Observable — OK dùng ở đây
loadTodos(): void {
  this.todoService.getAll().subscribe(todos => this.todos.set(todos));
}
```

### Standalone Components (không NgModule)
```typescript
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent { ... }
```

### Reactive Forms
```typescript
form = this.fb.nonNullable.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  priority: ['medium' as Priority, Validators.required],
  category: ['', Validators.required],
  dueDate: [''],
  description: [''],
});
```

---

## Features (Admin CRUD)

- [x] Xem danh sách todos (MatTable với phân trang MatPaginator)
- [x] Thêm todo mới (MatDialog + Reactive Form + validation)
- [x] Sửa todo (cùng dialog, truyền data vào)
- [x] Xóa todo (confirm dialog trước khi xóa)
- [x] Toggle hoàn thành / chưa hoàn thành (PATCH status)
- [x] Lọc theo trạng thái: All / Active / Completed
- [x] Lọc theo priority: All / Low / Medium / High
- [x] Tìm kiếm theo tiêu đề (debounce 300ms)
- [x] Phân loại theo category (MatChips)
- [x] Bulk actions: chọn nhiều → xóa / đánh dấu hoàn thành
- [x] Dashboard thống kê: tổng, hoàn thành, còn lại, theo priority

---

## Angular Material Components Used

| Tính năng | Material Component |
|---|---|
| Danh sách | `MatTable`, `MatSort`, `MatPaginator` |
| Form thêm/sửa | `MatDialog`, `MatFormField`, `MatInput`, `MatSelect`, `MatDatepicker` |
| Xác nhận xóa | `MatDialog` + `MatButton` |
| Thông báo | `MatSnackBar` |
| Lọc / Tag | `MatChipListbox` |
| Icons | `MatIcon` (Google Material Icons) |
| Loading | `MatProgressSpinner` / `MatProgressBar` |
| Tooltip | `MatTooltip` |
| Checkbox | `MatCheckbox` (bulk select) |

---

## Coding Conventions

- **File names**: `kebab-case` — `todo-list.component.ts`
- **Class names**: `PascalCase` — `TodoListComponent`
- **No `any`**: TypeScript strict mode luôn bật
- **Imports**: Mỗi component tự import dependencies (standalone)
- **Service**: 1 service = 1 responsibility (`TodoService` chỉ lo HTTP)
- **Signals**: Ưu tiên signals cho local/shared state, tránh `Subject`
- **OnPush**: Dùng `ChangeDetectionStrategy.OnPush` cho performance
- **inject()**: Dùng `inject()` thay `constructor` injection khi có thể

---

## Testing

### Unit Tests (Vitest)
```bash
npm test
# hoặc: ng test
```
- Test `TodoService`: mock `HttpClientTestingModule`, verify CRUD calls
- Test pipes: `FilterTodosPipe`, `PriorityLabelPipe`
- Test components: verify render, form validation

### E2E Tests (Playwright)
```bash
npx playwright test
```

**Kịch bản cần cover** (`e2e/tests/`):

| File | Kịch bản |
|---|---|
| `todo-crud.spec.ts` | Thêm todo → kiểm tra danh sách; Sửa todo → kiểm tra cập nhật; Xóa todo → kiểm tra biến mất |
| `todo-status.spec.ts` | Toggle hoàn thành; Bulk mark complete |
| `todo-filter.spec.ts` | Lọc All/Active/Completed; Lọc theo priority |
| `todo-search.spec.ts` | Tìm kiếm theo keyword; Clear search |

**Config Playwright** (`playwright.config.ts`):
```typescript
baseURL: 'http://localhost:4200'
// Chạy JSON Server và ng serve trước khi test
```

---

## Setup Mới

```bash
# 1. Tạo dự án Angular 20
ng new todo-app --standalone --routing --style=scss

# 2. Cài Angular Material
ng add @angular/material

# 3. Cài JSON Server + Concurrently
npm install --save-dev json-server concurrently

# 4. Cài Playwright
npm init playwright@latest

# 5. Tạo db.json
echo '{"todos":[]}' > db.json
```

---

## Environment

- Node.js >= 20.x
- Angular CLI >= 21.x (thực tế dùng 21.2.6)
- JSON Server chạy ở `http://localhost:3000`
- Angular dev server chạy ở `http://localhost:4200`
- Package manager: `npm` (không dùng yarn/pnpm)
