import { test, expect } from '@playwright/test';

test.describe('Todo Filter & Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await page.waitForSelector('app-todo-filter-bar');
    // Wait for data to load
    await page.waitForSelector('mat-table .mat-mdc-row');
  });

  test('should filter by Active status', async ({ page }) => {
    await page.locator('mat-chip-option:has-text("Đang làm")').first().click();
    await page.waitForTimeout(300);

    const chips = page.locator('mat-table mat-chip');
    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      await expect(chips.nth(i)).toContainText('Đang làm');
    }
  });

  test('should filter by Completed status', async ({ page }) => {
    await page.locator('mat-chip-option:has-text("Hoàn thành")').first().click();
    await page.waitForTimeout(300);

    const chips = page.locator('mat-table mat-chip');
    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      await expect(chips.nth(i)).toContainText('Hoàn thành');
    }
  });

  test('should filter by High priority', async ({ page }) => {
    await page.locator('mat-chip-option:has-text("Cao")').first().click();
    await page.waitForTimeout(300);

    const priorityCells = page.locator('mat-table .priority-cell');
    const count = await priorityCells.count();
    for (let i = 0; i < count; i++) {
      await expect(priorityCells.nth(i)).toContainText('Cao');
    }
  });

  test('should reset filter', async ({ page }) => {
    // Apply filter
    await page.locator('mat-chip-option:has-text("Đang làm")').first().click();
    await page.waitForTimeout(200);

    // Reset
    await page.getByRole('button', { name: /Xóa bộ lọc/i }).click();
    await page.waitForTimeout(200);

    // Verify all todos shown
    const resultText = page.locator('.result-count');
    const text = await resultText.textContent();
    expect(text).toMatch(/\d+ \/ \d+ todo/);
    // Numbers should be equal (no filter applied)
    const match = text?.match(/(\d+) \/ (\d+)/);
    if (match) {
      expect(match[1]).toBe(match[2]);
    }
  });

  test('should filter by category', async ({ page }) => {
    const categorySelect = page.locator('mat-select[formcontrolname]').last();
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      const firstOption = page.locator('.mat-mdc-option').nth(1); // skip "All"
      const catText = await firstOption.textContent();
      await firstOption.click();

      await page.waitForTimeout(300);

      const categoryCells = page.locator('mat-table .category-badge');
      const count = await categoryCells.count();
      for (let i = 0; i < count; i++) {
        await expect(categoryCells.nth(i)).toContainText(catText!.trim());
      }
    }
  });
});
