import { test, expect } from '@playwright/test';

test.describe('Todo Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('app-todo-filter-bar');
    await page.waitForSelector('mat-table .mat-mdc-row');
  });

  test('should search todos by keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Tìm kiếm todo..."]');
    await searchInput.fill('báo cáo');

    // Wait for debounce (300ms)
    await page.waitForTimeout(400);

    const rows = page.locator('mat-table .mat-mdc-row');
    const count = await rows.count();

    // All results should contain the keyword
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).textContent();
      expect(rowText?.toLowerCase()).toContain('báo cáo');
    }
  });

  test('should show empty state when no results found', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Tìm kiếm todo..."]');
    await searchInput.fill('xyzabc123notexist');
    await page.waitForTimeout(400);

    await expect(page.locator('app-empty-state')).toBeVisible();
    await expect(page.locator('app-empty-state')).toContainText('Không tìm thấy todo');
  });

  test('should clear search with X button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Tìm kiếm todo..."]');
    await searchInput.fill('test keyword');
    await page.waitForTimeout(400);

    // Click clear button
    await page.locator('button[mattooltip="Xóa tìm kiếm"]').click();
    await page.waitForTimeout(400);

    // Input should be empty
    await expect(searchInput).toHaveValue('');

    // All todos should be shown
    const rows = page.locator('mat-table .mat-mdc-row');
    await expect(rows.first()).toBeVisible();
  });

  test('should update result count on search', async ({ page }) => {
    const resultCount = page.locator('.result-count');

    // Get initial count
    const initial = await resultCount.textContent();

    // Search
    const searchInput = page.locator('input[placeholder="Tìm kiếm todo..."]');
    await searchInput.fill('Angular');
    await page.waitForTimeout(400);

    // Count should change
    const afterSearch = await resultCount.textContent();
    expect(initial).not.toBe(afterSearch);
  });
});

test.describe('Todo Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('mat-table .mat-mdc-row');
  });

  test('should show bulk action bar when items selected', async ({ page }) => {
    // Select first item
    const firstCheckbox = page.locator('mat-table .mat-mdc-row mat-checkbox').first();
    await firstCheckbox.click();

    await expect(page.locator('app-todo-bulk-actions')).toBeVisible();
    await expect(page.locator('.bulk-count')).toContainText('1 mục được chọn');
  });

  test('should select all items with header checkbox', async ({ page }) => {
    const headerCheckbox = page.locator('mat-table .mat-mdc-header-row mat-checkbox');
    await headerCheckbox.click();

    await page.waitForTimeout(200);
    const bulkBar = page.locator('app-todo-bulk-actions');
    await expect(bulkBar).toBeVisible();
  });

  test('should hide bulk bar after deselecting all', async ({ page }) => {
    // Select
    const firstCheckbox = page.locator('mat-table .mat-mdc-row mat-checkbox').first();
    await firstCheckbox.click();
    await expect(page.locator('app-todo-bulk-actions')).toBeVisible();

    // Deselect
    await firstCheckbox.click();
    await expect(page.locator('app-todo-bulk-actions')).not.toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('app-dashboard')).toBeVisible();
    await expect(page.locator('.stat-grid')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });
});
