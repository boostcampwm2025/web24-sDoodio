import { expect, test } from '@playwright/test';

test('home renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('web24-boostcamp')).toBeVisible();
  await expect(page.getByText('DodoRoom')).toBeVisible();
});
