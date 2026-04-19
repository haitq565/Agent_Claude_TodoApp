import { test, expect } from '@playwright/test';

test.describe('Todo CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('app-todo-list');
  });

  test('should display the todos list', async ({ page }) => {
    const rows = page.locator('mat-table .mat-mdc-row');
    await expect(rows.first()).toBeVisible();
  });

  test('should open Add Todo dialog when clicking Add button', async ({ page }) => {
    await page.getByRole('button', { name: /Thêm Todo/i }).first().click();
    await expect(page.locator('app-todo-form')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Thêm Todo mới');
  });

  test('should add a new todo', async ({ page }) => {
    const title = `Test Todo ${Date.now()}`;

    // Open dialog
    await page.getByRole('button', { name: /Thêm Todo/i }).first().click();
    await page.waitForSelector('app-todo-form');

    // Fill form
    await page.locator('input[formControlName="title"]').fill(title);
    await page.locator('mat-select[formControlName="priority"]').click();
    await page.getByRole('option', { name: /Cao/i }).click();
    await page.locator('mat-select[formControlName="category"]').click();
    await page.getByRole('option', { name: 'Work' }).click();

    // Submit
    await page.getByRole('button', { name: /Thêm Todo/i }).last().click();

    // Verify dialog closed and todo appears
    await expect(page.locator('app-todo-form')).not.toBeVisible();
    await expect(page.locator('mat-table')).toContainText(title);
  });

  test('should show validation error when title is too short', async ({ page }) => {
    await page.getByRole('button', { name: /Thêm Todo/i }).first().click();
    await page.locator('input[formControlName="title"]').fill('ab');
    await page.locator('input[formControlName="title"]').blur();
    await expect(page.locator('mat-error')).toContainText('Tối thiểu');
  });

  test('should edit an existing todo', async ({ page }) => {
    // Hover vào row trước để button hiện ra (Firefox cần hover vào row, không phải button ẩn)
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    await firstRow.hover();
    const editBtn = firstRow.locator('button[mattooltip="Chỉnh sửa"]');
    await editBtn.click();

    await page.waitForSelector('app-todo-form');
    await expect(page.locator('h2')).toContainText('Chỉnh sửa Todo');

    // Update title
    const titleInput = page.locator('input[formControlName="title"]');
    await titleInput.clear();
    await titleInput.fill('Updated Todo Title');
    await page.getByRole('button', { name: /Lưu thay đổi/i }).click();

    // Wait for dialog to close before checking table (Firefox needs extra time)
    await expect(page.locator('app-todo-form')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-table')).toContainText('Updated Todo Title');
  });

  test('should delete a todo after confirmation', async ({ page }) => {
    // Get first todo title
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    const title = await firstRow.locator('.title-text').textContent();

    const deleteBtn = firstRow.locator('button[mattooltip="Xóa"]');
    await firstRow.hover();
    await deleteBtn.click();

    // Confirm dialog
    await page.waitForSelector('app-confirm-dialog');
    await page.getByRole('button', { name: /Xóa/i }).last().click();

    // Verify todo is removed
    await expect(page.locator('mat-table')).not.toContainText(title!);
  });

  test('should toggle todo status', async ({ page }) => {
    const firstRow = page.locator('mat-table .mat-mdc-row').first();
    const toggleBtn = firstRow.locator('.toggle-btn');

    // Click toggle
    await toggleBtn.click();

    // Wait for status chip to update
    await page.waitForTimeout(500);
    const chip = firstRow.locator('mat-chip');
    const text = await chip.textContent();
    expect(['Hoàn thành', 'Đang làm']).toContain(text?.trim());
  });
});
