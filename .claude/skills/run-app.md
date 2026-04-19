# Run & Build App Skill

## Cấu trúc project

```
e:\AI_AGENT\Agent_Claude\
  todo-app\       ← Angular 21 app
    src\
    db.json       ← Mock database (JSON Server)
    package.json
  e2e\            ← Playwright E2E tests (project riêng)
```

**Ports:**
- Angular dev server: `http://localhost:4200`
- JSON Server API: `http://localhost:3000`

---

## Chạy development

```bash
cd e:\AI_AGENT\Agent_Claude\todo-app

# Khuyến nghị: start cả Angular + JSON Server cùng lúc, tự mở browser
npm run dev

# Chỉ Angular
npm start

# Chỉ JSON Server (mock API)
npm run api
```

---

## Build production

```bash
cd e:\AI_AGENT\Agent_Claude\todo-app
npm run build
# Output: dist/todo-app/
```

---

## Unit tests (Vitest)

```bash
cd e:\AI_AGENT\Agent_Claude\todo-app
npm test
# hoặc: ng test
```

> Dùng **Vitest**, không phải Jasmine/Karma.

---

## E2E tests (Playwright)

```bash
cd e:\AI_AGENT\Agent_Claude\e2e

npm test                  # Tất cả (60 tests — Chromium + Firefox)
npm run test:chromium     # Chỉ Chromium
npm run test:firefox      # Chỉ Firefox
npm run test:headed       # Có hiển thị trình duyệt
npm run test:ui           # Mở Playwright UI để debug
npm run test:crud         # Chỉ file todo-crud.spec.ts
npm run test:filter       # Chỉ file todo-filter.spec.ts
npm run test:search       # Chỉ file todo-search.spec.ts
npm run report            # Xem HTML report
```

> **Lưu ý:** Playwright tự start Angular + JSON Server — không cần khởi động thủ công.

---

## Cài đặt lần đầu

```bash
# 1. Cài Angular app
cd e:\AI_AGENT\Agent_Claude\todo-app
npm install

# 2. Cài E2E project
cd e:\AI_AGENT\Agent_Claude\e2e
npm install
npm run playwright:install   # Cài Chromium + Firefox
```

---

## API Endpoints (JSON Server)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/todos` | Lấy tất cả |
| GET | `/todos?status=active` | Lọc theo status |
| GET | `/todos?title_like=keyword` | Tìm kiếm |
| POST | `/todos` | Tạo mới |
| PUT | `/todos/:id` | Cập nhật toàn bộ |
| PATCH | `/todos/:id` | Cập nhật một phần |
| DELETE | `/todos/:id` | Xóa |

> `db.json` là CSDL thực — mọi thao tác thêm/sửa/xóa ghi trực tiếp vào file.

---

## Generate code (Angular CLI)

```bash
cd e:\AI_AGENT\Agent_Claude\todo-app

ng generate component features/todos/components/ten-component
ng generate service core/services/ten-service
ng generate pipe shared/pipes/ten-pipe
```

---

## Lint

```bash
cd e:\AI_AGENT\Agent_Claude\todo-app
ng lint
```
