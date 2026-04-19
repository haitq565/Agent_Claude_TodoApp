# Playwright Testing Skill

## Cấu trúc project

```
e:\AI_AGENT\Agent_Claude\
  todo-app\               ← Angular app (port 4200) + JSON Server (port 3000)
  e2e\                    ← Playwright project độc lập
    node_modules\
    package.json
    playwright.config.ts
    tests\
      todo-crud.spec.ts
      todo-edit-add-extra.spec.ts
      todo-filter.spec.ts
      todo-search.spec.ts
    test-results\         ← Screenshots khi fail
    playwright-report\    ← HTML report
```

---

## Cách chạy test

> **Bắt buộc:** `cd` vào thư mục `e2e` trước khi chạy.
> **Playwright tự động start** Angular (4200) và JSON Server (3000) — không cần khởi động thủ công.

```bash
cd e:\AI_AGENT\Agent_Claude\e2e

npm test                  # Chạy tất cả tests — Chromium + Firefox (60 tests)
npm run test:chromium     # Chỉ Chromium
npm run test:firefox      # Chỉ Firefox
npm run test:headed       # Có hiển thị trình duyệt (xem Playwright thao tác)
npm run test:ui           # Mở Playwright UI — debug từng bước, xem timeline
npm run test:debug        # Debug từng bước
npm run test:crud         # Chỉ file todo-crud.spec.ts
npm run test:filter       # Chỉ file todo-filter.spec.ts
npm run test:search       # Chỉ file todo-search.spec.ts
npm run report            # Xem HTML report sau khi chạy
```

---

## Cấu hình (`e2e/playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const appRoot = path.resolve(__dirname, '../todo-app');  // Trỏ đến Angular app

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,       // Retry 1 lần khi fail (xử lý Firefox flaky)
  workers: 1,       // Chạy tuần tự — tránh race condition trên db.json
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: [
    {
      command: 'npx json-server db.json --port 3000',
      cwd: appRoot,   // Chạy từ thư mục todo-app
      port: 3000,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npx ng serve --port 4200',
      cwd: appRoot,
      port: 4200,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
```

**Lý do `workers: 1`:** các tests CRUD thêm/xóa dữ liệu trực tiếp vào `db.json`. Nếu chạy song song, các tests sẽ can thiệp vào state của nhau gây fail ngẫu nhiên.

---

## Cú pháp cơ bản

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tên nhóm test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('mat-table .mat-mdc-row');
  });

  test('Tên test case', async ({ page }) => {
    // Hover vào row trước để button hiện ra (quan trọng với Firefox)
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    await firstRow.hover();
    await firstRow.locator('button[mattooltip="Chỉnh sửa"]').click();

    // Chờ dialog đóng trước khi kiểm tra table
    await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).toContainText('Nội dung mới');
  });
});
```

### Patterns quan trọng cho Firefox

```typescript
// ✅ Đúng: Hover vào row để button hiện, rồi click button trong row
const row = page.locator('mat-table .mat-mdc-row').first();
await row.hover();
await row.locator('button[mattooltip="Chỉnh sửa"]').click();

// ❌ Sai: Hover trực tiếp vào button ẩn — Firefox timeout
await page.locator('button[mattooltip="Chỉnh sửa"]').first().hover();

// ✅ Đúng: Chờ dialog đóng xong rồi mới assert table
await page.getByRole('button', { name: /Lưu thay đổi/i }).click();
await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
await expect(page.locator('mat-table')).toContainText('Updated Title');

// ✅ Đúng: Chờ table visible sau khi dialog đóng
await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
await expect(page.locator('mat-table')).toBeVisible({ timeout: 10000 });
await expect(page.locator('mat-table')).not.toContainText('Đã Hủy');
```

---

## Mẫu test CRUD

```typescript
test('should add a new todo', async ({ page }) => {
  const title = `Test Todo ${Date.now()}`;
  await page.getByRole('button', { name: /Thêm Todo/i }).first().click();
  await page.locator('input[formControlName="title"]').fill(title);
  await page.locator('mat-select[formControlName="priority"]').click();
  await page.getByRole('option', { name: /Cao/i }).click();
  await page.locator('mat-select[formControlName="category"]').click();
  await page.getByRole('option', { name: 'Work' }).click();
  await page.getByRole('button', { name: /Thêm Todo/i }).last().click();
  await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
  await expect(page.locator('mat-table')).toContainText(title);
});

test('should edit an existing todo', async ({ page }) => {
  const row = page.locator('mat-table .mat-mdc-row').first();
  await row.hover();
  await row.locator('button[mattooltip="Chỉnh sửa"]').click();
  await page.waitForSelector('app-todo-form');
  await page.locator('input[formControlName="title"]').clear();
  await page.locator('input[formControlName="title"]').fill('Updated Title');
  await page.getByRole('button', { name: /Lưu thay đổi/i }).click();
  await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
  await expect(page.locator('mat-table')).toContainText('Updated Title');
});

test('should delete a todo after confirmation', async ({ page }) => {
  const firstRow = page.locator('mat-table .mat-mdc-row').first();
  const title = await firstRow.locator('.title-text').textContent();
  await firstRow.hover();
  await firstRow.locator('button[mattooltip="Xóa"]').click();
  await page.waitForSelector('app-confirm-dialog');
  await page.getByRole('button', { name: /Xóa/i }).last().click();
  await expect(page.locator('mat-table')).not.toContainText(title!);
});
```

---

## Kết quả thực tế (2026-04-19)

| Browser | Passed | Failed | Tổng |
|---|---|---|---|
| Chromium | 30 | 0 | 30 |
| Firefox | 30 | 0 | 30 |
| **Tổng** | **60** | **0** | **60** |

---

## Cài đặt lần đầu

```bash
cd e:\AI_AGENT\Agent_Claude\e2e
npm install
npm run playwright:install
```

> **Lý do npm scripts dùng `node_modules/.bin/playwright` bên trong:** username Windows có ký tự `&` khiến `npx playwright` bị lỗi. Các npm scripts đã wrap sẵn — bạn chỉ cần dùng `npm run ...`.
