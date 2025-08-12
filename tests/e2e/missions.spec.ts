import { test, expect } from '@playwright/test';

test.describe('Missions E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the missions page
    await page.goto('/missions');
  });

  test('should display missions page correctly', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Missions/);
    
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('Missions');
    await expect(page.locator('[data-testid="create-mission-btn"]')).toBeVisible();
  });

  test('should create a new mission', async ({ page }) => {
    // Click on create mission button
    await page.click('[data-testid="create-mission-btn"]');
    
    // Wait for modal to appear
    await expect(page.locator('[data-testid="mission-modal"]')).toBeVisible();
    
    // Fill the form
    await page.fill('[data-testid="mission-title"]', 'Test Mission E2E');
    await page.fill('[data-testid="mission-description"]', 'This is a test mission created via E2E test');
    
    // Select agent
    await page.selectOption('[data-testid="mission-agent"]', 'karine-ai');
    
    // Select type
    await page.selectOption('[data-testid="mission-type"]', 'content');
    
    // Select complexity
    await page.selectOption('[data-testid="mission-complexity"]', 'medium');
    
    // Select urgency
    await page.selectOption('[data-testid="mission-urgency"]', 'high');
    
    // Submit the form
    await page.click('[data-testid="submit-mission-btn"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify mission was created
    await expect(page.locator('text=Test Mission E2E')).toBeVisible();
  });

  test('should filter missions by status', async ({ page }) => {
    // Click on status filter
    await page.click('[data-testid="status-filter"]');
    
    // Select completed status
    await page.click('[data-testid="status-completed"]');
    
    // Verify only completed missions are shown
    const missionCards = page.locator('[data-testid="mission-card"]');
    await expect(missionCards).toHaveCount(await page.locator('[data-testid="mission-card"][data-status="completed"]').count());
  });

  test('should search missions', async ({ page }) => {
    // Type in search box
    await page.fill('[data-testid="search-missions"]', 'Test');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results
    const searchResults = page.locator('[data-testid="mission-card"]');
    await expect(searchResults).toHaveCount(await page.locator('[data-testid="mission-card"]:has-text("Test")').count());
  });

  test('should view mission details', async ({ page }) => {
    // Click on first mission card
    await page.click('[data-testid="mission-card"]:first-child');
    
    // Wait for details page to load
    await expect(page.locator('[data-testid="mission-details"]')).toBeVisible();
    
    // Verify mission information is displayed
    await expect(page.locator('[data-testid="mission-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="mission-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="mission-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="mission-agent"]')).toBeVisible();
  });

  test('should edit mission', async ({ page }) => {
    // Navigate to mission details
    await page.click('[data-testid="mission-card"]:first-child');
    
    // Click edit button
    await page.click('[data-testid="edit-mission-btn"]');
    
    // Wait for edit modal
    await expect(page.locator('[data-testid="edit-mission-modal"]')).toBeVisible();
    
    // Update mission title
    await page.fill('[data-testid="edit-mission-title"]', 'Updated Mission Title');
    
    // Save changes
    await page.click('[data-testid="save-mission-btn"]');
    
    // Verify changes were saved
    await expect(page.locator('text=Updated Mission Title')).toBeVisible();
  });

  test('should delete mission', async ({ page }) => {
    // Navigate to mission details
    await page.click('[data-testid="mission-card"]:first-child');
    
    // Click delete button
    await page.click('[data-testid="delete-mission-btn"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // Verify mission was deleted
    await expect(page.locator('text=Mission deleted successfully')).toBeVisible();
  });

  test('should handle mission creation validation', async ({ page }) => {
    // Click on create mission button
    await page.click('[data-testid="create-mission-btn"]');
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-mission-btn"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/missions', route => {
      route.abort('failed');
    });
    
    // Try to create mission
    await page.click('[data-testid="create-mission-btn"]');
    await page.fill('[data-testid="mission-title"]', 'Test Mission');
    await page.fill('[data-testid="mission-description"]', 'Test Description');
    await page.click('[data-testid="submit-mission-btn"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper form labels
    await expect(page.locator('label[for="mission-title"]')).toBeVisible();
    
    // Check for proper ARIA attributes
    await expect(page.locator('[aria-label="Create mission"]')).toBeVisible();
    
    // Check for proper focus management
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-btn"]');
    await expect(page.locator('[data-testid="mobile-menu-items"]')).toBeVisible();
  });

  test('should handle large datasets', async ({ page }) => {
    // Mock many missions
    await page.route('**/api/missions', route => {
      const missions = Array.from({ length: 100 }, (_, i) => ({
        id: `mission-${i}`,
        title: `Mission ${i}`,
        description: `Description for mission ${i}`,
        status: 'PENDING',
        agentId: 'karine-ai',
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ missions }),
      });
    });
    
    // Reload page
    await page.reload();
    
    // Verify pagination works
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    
    // Test pagination
    await page.click('[data-testid="next-page-btn"]');
    await expect(page.locator('[data-testid="page-2"]')).toHaveClass(/active/);
  });

  test('should handle concurrent operations', async ({ page, context }) => {
    // Open multiple tabs
    const page2 = await context.newPage();
    const page3 = await context.newPage();
    
    // Navigate to missions on all pages
    await page.goto('/missions');
    await page2.goto('/missions');
    await page3.goto('/missions');
    
    // Create mission on first page
    await page.click('[data-testid="create-mission-btn"]');
    await page.fill('[data-testid="mission-title"]', 'Concurrent Mission 1');
    await page.fill('[data-testid="mission-description"]', 'Test concurrent creation');
    await page.click('[data-testid="submit-mission-btn"]');
    
    // Create mission on second page
    await page2.click('[data-testid="create-mission-btn"]');
    await page2.fill('[data-testid="mission-title"]', 'Concurrent Mission 2');
    await page2.fill('[data-testid="mission-description"]', 'Test concurrent creation');
    await page2.click('[data-testid="submit-mission-btn"]');
    
    // Verify both missions were created
    await expect(page.locator('text=Concurrent Mission 1')).toBeVisible();
    await expect(page2.locator('text=Concurrent Mission 2')).toBeVisible();
    
    // Close extra pages
    await page2.close();
    await page3.close();
  });
});
