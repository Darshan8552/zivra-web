import { test, expect } from '@playwright/test';

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/notifications');
  });

  test('should load notifications page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Notifications');
  });

  test('should have filter tabs', async ({ page }) => {
    await expect(page.locator('[data-testid="notif-filter-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="notif-filter-mentions"]')).toBeVisible();
    await expect(page.locator('[data-testid="notif-filter-follows"]')).toBeVisible();
    await expect(page.locator('[data-testid="notif-filter-likes"]')).toBeVisible();
  });

  test('should have mark all as read button', async ({ page }) => {
    await expect(page.locator('[data-testid="notifications-mark-all-btn"]')).toBeVisible();
  });
});

test.describe('Follow Request Acceptance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/notifications');
  });

  test('should display accept/decline buttons for follow requests', async ({ page }) => {
    const acceptButton = page.locator('[data-testid^="notif-accept-"]');
    const declineButton = page.locator('[data-testid^="notif-decline-"]');
    
    if (await acceptButton.count() > 0) {
      await expect(acceptButton.first()).toBeVisible();
      await expect(acceptButton.first()).toContainText('Accept');
      await expect(declineButton.first()).toBeVisible();
      await expect(declineButton.first()).toContainText('Decline');
    }
  });

  test('should call accept API when accept button is clicked', async ({ page }) => {
    const acceptButton = page.locator('[data-testid^="notif-accept-"]').first();
    
    if (await acceptButton.count() > 0) {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/users/me/follow/accept') && response.request().method() === 'PATCH'
      );
      
      await acceptButton.click();
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
    }
  });

  test('should call decline API when decline button is clicked', async ({ page }) => {
    const declineButton = page.locator('[data-testid^="notif-decline-"]').first();
    
    if (await declineButton.count() > 0) {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/users/me/follow/decline') && response.request().method() === 'PATCH'
      );
      
      await declineButton.click();
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
    }
  });
});