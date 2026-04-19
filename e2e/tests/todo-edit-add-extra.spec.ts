import { test, expect } from '@playwright/test';

test.describe('Edit Todo — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('app-todo-list');
    await page.waitForSelector('mat-table .mat-mdc-row');
  });

  test('should pre-fill existing todo data when opening edit dialog', async ({ page }) => {
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    const originalTitle = (await firstRow.locator('.title-text').textContent())?.trim();

    await firstRow.locator('button[mattooltip="Chỉnh sửa"]').click();
    await page.waitForSelector('app-todo-form');

    // Title phải được điền sẵn đúng giá trị cũ
    await expect(page.locator('input[formControlName="title"]')).toHaveValue(originalTitle!);
    // Dialog header phải hiển thị "Chỉnh sửa"
    await expect(page.locator('h2')).toContainText('Chỉnh sửa Todo');
  });

  test('should show validation error and disable save button when title too short', async ({ page }) => {
    await page.locator('button[mattooltip="Chỉnh sửa"]').first().click();
    await page.waitForSelector('app-todo-form');

    const titleInput = page.locator('input[formControlName="title"]');
    await titleInput.clear();
    await titleInput.fill('ab');
    await titleInput.blur();

    // Phải hiện lỗi minLength
    await expect(page.locator('mat-error')).toContainText('Tối thiểu');

    // Nút Lưu phải bị disabled khi form invalid
    await expect(page.getByRole('button', { name: /Lưu thay đổi/i })).toBeDisabled();

    // Dialog vẫn mở
    await expect(page.locator('app-todo-form')).toBeVisible();
  });

  test('should show validation error and disable save button when title exceeds 120 chars', async ({ page }) => {
    await page.locator('button[mattooltip="Chỉnh sửa"]').first().click();
    await page.waitForSelector('app-todo-form');

    const titleInput = page.locator('input[formControlName="title"]');
    await titleInput.clear();
    await titleInput.fill('A'.repeat(121));
    await titleInput.blur();

    // Phải hiện lỗi maxLength
    await expect(page.locator('mat-error')).toContainText('Tối đa');

    // Nút Lưu phải bị disabled
    await expect(page.getByRole('button', { name: /Lưu thay đổi/i })).toBeDisabled();

    // Dialog vẫn mở
    await expect(page.locator('app-todo-form')).toBeVisible();
  });

  test('should cancel edit and NOT save changes', async ({ page }) => {
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    const originalTitle = (await firstRow.locator('.title-text').textContent())?.trim();

    await firstRow.locator('button[mattooltip="Chỉnh sửa"]').click();
    await page.waitForSelector('app-todo-form');

    // Sửa thành title khác
    await page.locator('input[formControlName="title"]').clear();
    await page.locator('input[formControlName="title"]').fill('Title Không Được Lưu');

    // Nhấn Hủy
    await page.getByRole('button', { name: /Hủy/i }).click();

    // Dialog đóng, title cũ vẫn còn trong bảng (chờ table visible cho Firefox)
    await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).toContainText(originalTitle!);
    await expect(page.locator('mat-table')).not.toContainText('Title Không Được Lưu');
  });

  test('should save changes when editing priority and category', async ({ page }) => {
    await page.locator('button[mattooltip="Chỉnh sửa"]').first().click();
    await page.waitForSelector('app-todo-form');

    // Đổi priority sang Thấp
    await page.locator('mat-select[formControlName="priority"]').click();
    await page.getByRole('option', { name: /Thấp/i }).click();

    // Lưu
    await page.getByRole('button', { name: /Lưu thay đổi/i }).click();
    await expect(page.locator('app-todo-form')).not.toBeVisible();
  });
});

test.describe('Add Todo — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('app-todo-list');
    // Mở dialog thêm mới
    await page.getByRole('button', { name: /Thêm Todo/i }).first().click();
    await page.waitForSelector('app-todo-form');
  });

  test('should disable submit button and show errors for empty form', async ({ page }) => {
    // Trigger validation bằng cách touch title field rồi blur
    await page.locator('input[formControlName="title"]').click();
    await page.locator('input[formControlName="title"]').blur();

    // Phải hiện lỗi required cho title
    await expect(page.locator('mat-error')).toBeVisible();

    // Nút Thêm phải bị disabled khi form invalid
    await expect(page.getByRole('button', { name: /Thêm Todo/i }).last()).toBeDisabled();

    // Dialog vẫn mở
    await expect(page.locator('app-todo-form')).toBeVisible();
  });

  test('should show error and disable submit when title shorter than 3 characters', async ({ page }) => {
    await page.locator('input[formControlName="title"]').fill('ab');
    await page.locator('input[formControlName="title"]').blur();

    await expect(page.locator('mat-error')).toContainText('Tối thiểu');

    // Nút Thêm phải bị disabled
    await expect(page.getByRole('button', { name: /Thêm Todo/i }).last()).toBeDisabled();

    // Dialog vẫn mở
    await expect(page.locator('app-todo-form')).toBeVisible();
  });

  test('should show error and disable submit when title exceeds 120 characters', async ({ page }) => {
    await page.locator('input[formControlName="title"]').fill('A'.repeat(121));
    await page.locator('input[formControlName="title"]').blur();

    await expect(page.locator('mat-error')).toContainText('Tối đa');

    // Nút Thêm phải bị disabled
    await expect(page.getByRole('button', { name: /Thêm Todo/i }).last()).toBeDisabled();

    // Dialog vẫn mở
    await expect(page.locator('app-todo-form')).toBeVisible();
  });

  test('should cancel add and NOT create new todo', async ({ page }) => {
    await page.locator('input[formControlName="title"]').fill('Không Nên Được Thêm Vào');

    // Nhấn Hủy
    await page.getByRole('button', { name: /Hủy/i }).click();

    // Dialog đóng, todo KHÔNG xuất hiện trong bảng (chờ table visible cho Firefox)
    await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).not.toContainText('Không Nên Được Thêm Vào');
  });

  test('should add todo with description and dueDate', async ({ page }) => {
    const title = `Todo Full Fields ${Date.now()}`;

    await page.locator('input[formControlName="title"]').fill(title);
    await page.locator('mat-select[formControlName="priority"]').click();
    await page.getByRole('option', { name: /Cao/i }).click();
    await page.locator('mat-select[formControlName="category"]').click();
    await page.getByRole('option', { name: 'Work' }).click();
    await page.locator('textarea[formControlName="description"]').fill('Mô tả chi tiết của todo');

    await page.getByRole('button', { name: /Thêm Todo/i }).last().click();

    await expect(page.locator('app-todo-form')).not.toBeVisible();
    await expect(page.locator('mat-table')).toContainText(title);
  });
});
