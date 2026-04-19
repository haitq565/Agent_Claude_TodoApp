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
```

### E2E tests (Playwright) — chạy từ thư mục `e2e/` riêng biệt
```bash
cd e:\AI_AGENT\Agent_Claude\e2e

npm test                  # Tất cả tests — Chromium + Firefox (60 tests)
npm run test:chromium     # Chỉ Chromium
npm run test:firefox      # Chỉ Firefox
npm run test:headed       # Có hiển thị trình duyệt
npm run test:ui           # Mở Playwright UI để debug
npm run test:debug        # Debug từng bước
npm run test:crud         # Chỉ file todo-crud.spec.ts
npm run test:filter       # Chỉ file todo-filter.spec.ts
npm run test:search       # Chỉ file todo-search.spec.ts
npm run report            # Xem HTML report
```

### Lưu ý quan trọng
- `db.json` là CSDL thực — mọi thao tác thêm/sửa/xóa sẽ ghi trực tiếp vào file
- E2E project nằm ở `e:\AI_AGENT\Agent_Claude\e2e\` — **độc lập** với `todo-app/`
- Khi chạy E2E, **không cần start server thủ công** — Playwright tự quản lý qua `webServer` config
- Các `npm run` scripts đã wrap sẵn lệnh đúng — **không cần gõ `node_modules/.bin/playwright`** trực tiếp
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
e:\AI_AGENT\Agent_Claude\
  todo-app/                       # Angular app
    db.json                       # Mock database (JSON Server)
    package.json
    src/
      app/
        core/
          models/
            todo.model.ts         # interface Todo, TodoStatus, Priority
          services/
            todo.service.ts       # HttpClient CRUD calls
          interceptors/
            loading.interceptor.ts
        features/
          todos/
            components/
              todo-list/          # Danh sách + bảng todos
              todo-form/          # Form thêm/sửa (dialog)
              todo-detail/        # Trang chi tiết todo (/todos/:id)
              todo-filter-bar/    # Thanh lọc + tìm kiếm
              todo-bulk-actions/  # Bulk select & actions
            todos.component.ts    # Shell component
          dashboard/
            dashboard.component.ts
        shared/
          components/
            confirm-dialog/       # Dialog xác nhận xóa
            empty-state/          # UI khi không có data
          pipes/
            priority-label.pipe.ts
            # Filtering dùng computed() signal trong TodoStore, không dùng pipe
        app.config.ts             # provideHttpClient, provideRouter, provideAnimations
        app.routes.ts
        app.component.ts
      assets/
      styles.scss                 # Global styles + Material theme
  e2e/                            # Playwright E2E tests (project độc lập)
    node_modules/
    package.json
    playwright.config.ts
    tests/
      todo-crud.spec.ts
      todo-edit-add-extra.spec.ts
      todo-filter.spec.ts
      todo-search.spec.ts
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
  status: TodoStatus | 'all';
  priority: Priority | 'all';
  category: string;
  search: string;
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
- [x] Xem chi tiết todo (trang riêng `/todos/:id` — nút visibility trong bảng)
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

---

### E2E Tests với Playwright

E2E project nằm **độc lập** tại `e:\AI_AGENT\Agent_Claude\e2e\` — tách riêng khỏi `todo-app/`.

#### Bước 1 — Cài đặt (chỉ làm một lần)

```bash
cd e:\AI_AGENT\Agent_Claude\e2e

npm install
npm run playwright:install   # Cài Chromium + Firefox
```

#### Bước 2 — Cấu hình (`e2e/playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const appRoot = path.resolve(__dirname, '../todo-app');  // Trỏ đến Angular app

export default defineConfig({
  testDir: './tests',
  retries: process.env['CI'] ? 2 : 1,  // Local: 1 lần; CI: 2 lần
  workers: 1,     // Chạy tuần tự — tránh race condition trên db.json
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: [
    { command: 'npx json-server db.json --port 3000', cwd: appRoot, port: 3000, reuseExistingServer: true },
    { command: 'npx ng serve --port 4200', cwd: appRoot, port: 4200, reuseExistingServer: true, timeout: 120_000 },
  ],
});
```

#### Bước 3 — Chạy tests

```bash
cd e:\AI_AGENT\Agent_Claude\e2e

npm test                  # Tất cả (Chromium + Firefox, 60 tests)
npm run test:chromium     # Chỉ Chromium
npm run test:firefox      # Chỉ Firefox
npm run test:headed       # Có hiển thị trình duyệt
npm run test:ui           # Mở Playwright UI — debug từng bước
npm run test:crud         # Chỉ file todo-crud.spec.ts
npm run test:filter       # Chỉ file todo-filter.spec.ts
npm run test:search       # Chỉ file todo-search.spec.ts
npm run report            # Xem HTML report
```

#### Bước 4 — Đọc kết quả

```
ok  1 [chromium] › tests/todo-crud.spec.ts › should display the todos list   ✓ PASS
ok  2 [firefox]  › tests/todo-crud.spec.ts › should display the todos list   ✓ PASS
x   3 [firefox]  › tests/todo-crud.spec.ts › should edit an existing todo    ✗ FAIL (retry #1)
ok  4 [firefox]  › tests/todo-crud.spec.ts › should edit an existing todo    ✓ PASS
```

- `ok` = pass | `x` = fail | `flaky` = fail lần 1, pass retry
- HTML report: `e2e/playwright-report/index.html`

#### Kết quả thực tế (2026-04-19)

| Browser | Passed | Failed | Tổng |
|---|---|---|---|
| Chromium | 30 | 0 | 30 |
| Firefox | 30 | 0 | 30 |
| **Tổng** | **60** | **0** | **60** |

#### Các file test (`e2e/tests/`)

| File | Kịch bản |
|---|---|
| `todo-crud.spec.ts` | Hiển thị danh sách; Thêm/Sửa/Xóa todo; Validation; Toggle trạng thái |
| `todo-edit-add-extra.spec.ts` | Edge cases: pre-fill form; validation maxLength; cancel không lưu |
| `todo-filter.spec.ts` | Lọc theo Active/Completed/High priority; Reset bộ lọc; Lọc theo category |
| `todo-search.spec.ts` | Tìm kiếm; Empty state; Clear search; Bulk actions |

#### Thêm test case mới

Tạo file mới trong `e2e/tests/`, ví dụ `todo-dashboard.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should show stat cards', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });
});
```

Playwright tự động nhận file mới, không cần cấu hình thêm.

---

## Setup Mới

```bash
# 1. Tạo dự án Angular
ng new todo-app --standalone --routing --style=scss

# 2. Cài Angular Material
cd todo-app
ng add @angular/material

# 3. Cài JSON Server + Concurrently
npm install --save-dev json-server concurrently

# 4. Tạo db.json
echo '{"todos":[]}' > db.json

# 5. Tạo E2E project riêng (đồng cấp với todo-app)
mkdir ../e2e && cd ../e2e
npm init -y
npm install --save-dev @playwright/test
npm run playwright:install   # Cài Chromium + Firefox (script trong package.json)
mkdir tests
```

---

## Environment

- Node.js >= 20.x
- Angular CLI >= 21.x (thực tế dùng 21.2.6)
- JSON Server chạy ở `http://localhost:3000`
- Angular dev server chạy ở `http://localhost:4200`
- Package manager: `npm` (không dùng yarn/pnpm)

---

## Changelog

### 2026-04-19 — E2E Restructure & Firefox Fixes

**E2E tách thành project độc lập**
- Di chuyển `todo-app/e2e/` → `e2e/` đồng cấp với `todo-app/`
- E2E có `package.json` riêng, `node_modules` riêng, không phụ thuộc Angular app
- Lý do: tránh xung đột 2 phiên bản `@playwright/test` khi chạy từ `todo-app/`

**Cấu hình Playwright cải thiện**
- `workers: 1` — chạy tuần tự, tránh race condition nhiều tests cùng write `db.json`
- `retries: 1` — tự retry khi Firefox flaky, không cần sửa từng test
- `cwd: appRoot` trong `webServer` — Playwright start đúng thư mục `todo-app/`

**Firefox timing fixes**
- `todo-crud.spec.ts`: hover vào row trước để button hiện, rồi click trong row (không hover button ẩn)
- `todo-crud.spec.ts`: thêm `await expect(app-todo-form).not.toBeVisible({ timeout: 10000 })` sau save
- `todo-edit-add-extra.spec.ts`: thêm `await expect(mat-table).toBeVisible()` sau dialog đóng trước khi assert

**Kết quả sau fix**

| Browser | Passed | Failed | Tổng |
|---|---|---|---|
| Chromium | 30 | 0 | 30 |
| Firefox | 30 | 0 | 30 |
| **Tổng** | **60** | **0** | **60** |

**Skills cập nhật**
- `.claude/skills/test-playwright.md` — cập nhật lệnh chạy, cấu trúc mới, patterns Firefox
- `.claude/skills/run-app.md` — tạo mới, hướng dẫn setup + chạy toàn bộ project

### 2026-04-19 — TodoDetail + Doc Fixes

**Thêm tính năng todo-detail**
- Tạo `todo-detail` component tại `features/todos/components/todo-detail/`
- Route mới `/todos/:id` — trang chi tiết với đầy đủ fields (title, status, priority, category, description, dueDate, createdAt, updatedAt)
- Nút "Xem chi tiết" (visibility icon) trong cột actions của bảng
- Cảnh báo overdue, nút Edit mở dialog, nút Back về `/todos`
- Lazy loaded chunk riêng — không ảnh hưởng bundle chính

**Sửa docs lệch với code**
- `TodoFilter` interface: đổi fields từ optional (`?`) → required (khớp với code thực tế)
- Playwright `retries`: đổi từ `1` tĩnh → `process.env['CI'] ? 2 : 1` (dynamic)
- Project structure: xóa `todos.routes.ts`, `dashboard.routes.ts` (routes gộp trong `app.routes.ts`)
- Project structure: xóa `filter-todos.pipe.ts` (filtering dùng `computed()` signal trong TodoStore)
- E2E commands: đổi từ `node_modules/.bin/playwright` → `npm run ...` (dùng scripts trong package.json)

**Kết quả sau thay đổi**

| Browser | Passed | Failed | Tổng |
|---|---|---|---|
| Chromium | 30 | 0 | 30 |
| Firefox | 30 | 0 | 30 |
| **Tổng** | **60** | **0** | **60** |
