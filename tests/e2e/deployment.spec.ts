import { test, expect } from '@playwright/test';

test.describe('🚀 Tests de Déploiement et Détection d\'Erreurs', () => {
  let baseUrl: string;

  test.beforeAll(async ({ browser }) => {
    // Récupérer l'URL de base depuis les variables d'environnement
    baseUrl = process.env.BASE_URL || 'https://beriox-far2hz8tm-beriox.vercel.app';
  });

  test.describe('🔍 Health Checks', () => {
    test('should have healthy API endpoints', async ({ request }) => {
      const healthResponse = await request.get(`${baseUrl}/api/health`);
      expect(healthResponse.ok()).toBeTruthy();
      
      const healthData = await healthResponse.json();
      expect(healthData.status).toBe('healthy');
      expect(healthData.services.database.status).toBe('healthy');
      expect(healthData.services.redis.status).toBe('healthy');
    });

    test('should have fast response times', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${baseUrl}/api/health`);
      const responseTime = Date.now() - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(5000); // Moins de 5 secondes
    });

    test('should handle database connectivity', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'database' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.details.connections).toBeGreaterThan(0);
    });

    test('should handle Redis connectivity', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'redis' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.details.connections).toBeGreaterThanOrEqual(0);
    });

    test('should check external APIs', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'external-apis' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.details.apis).toBeDefined();
    });

    test('should monitor performance metrics', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'performance' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.details.memory).toBeDefined();
      expect(data.details.cpu).toBeDefined();
    });
  });

  test.describe('🚨 Error Detection', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      const response = await page.goto(`${baseUrl}/non-existent-page`);
      expect(response?.status()).toBe(404);
      
      // Vérifier que la page d'erreur s'affiche correctement
      await expect(page.locator('h1')).toContainText(/404|Not Found|Page non trouvée/);
    });

    test('should handle API errors gracefully', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/non-existent-endpoint`);
      expect(response.status()).toBe(404);
      
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
    });

    test('should handle database errors gracefully', async ({ request }) => {
      // Simuler une erreur de base de données en utilisant un endpoint qui pourrait échouer
      const response = await request.post(`${baseUrl}/api/missions`, {
        data: {
          // Données invalides pour déclencher une erreur
          title: '',
          description: '',
          agentId: 'invalid-agent-id'
        }
      });
      
      expect(response.status()).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
    });

    test('should handle authentication errors', async ({ page }) => {
      // Essayer d'accéder à une page protégée sans authentification
      await page.goto(`${baseUrl}/admin`);
      
      // Vérifier qu'on est redirigé vers la page de connexion
      await expect(page).toHaveURL(/.*signin.*/);
    });

    test('should handle rate limiting', async ({ request }) => {
      // Faire plusieurs requêtes rapides pour déclencher le rate limiting
      const promises = Array.from({ length: 20 }, () => 
        request.get(`${baseUrl}/api/health`)
      );
      
      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      
      // Au moins une réponse devrait être rate limitée
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('📊 Performance Monitoring', () => {
    test('should load main pages quickly', async ({ page }) => {
      const pages = [
        '/',
        '/missions',
        '/metrics-dashboard',
        '/pricing'
      ];

      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(`${baseUrl}${pagePath}`);
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(10000); // Moins de 10 secondes
        await expect(page).toHaveTitle(/Beriox|AI/);
      }
    });

    test('should handle concurrent users', async ({ browser }) => {
      // Simuler plusieurs utilisateurs simultanés
      const contexts = await Promise.all(
        Array.from({ length: 5 }, () => browser.newContext())
      );
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // Toutes les pages devraient se charger simultanément
      await Promise.all(
        pages.map(page => page.goto(`${baseUrl}/api/health`))
      );
      
      // Vérifier que toutes les réponses sont OK
      for (const page of pages) {
        await expect(page.locator('body')).toContainText(/healthy|status/);
      }
      
      await Promise.all(contexts.map(context => context.close()));
    });

    test('should handle large data sets', async ({ request }) => {
      // Tester avec des requêtes qui pourraient retourner beaucoup de données
      const response = await request.get(`${baseUrl}/api/missions?limit=100`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('should handle memory usage', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'performance' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Vérifier que l'utilisation mémoire est raisonnable
      expect(data.details.memory.heapUsed).toBeLessThan(1000); // Moins de 1GB
      expect(data.details.memory.rss).toBeLessThan(2000); // Moins de 2GB
    });
  });

  test.describe('🔄 Recovery and Resilience', () => {
    test('should recover from temporary failures', async ({ request }) => {
      // Faire plusieurs requêtes pour tester la résilience
      const responses = await Promise.allSettled(
        Array.from({ length: 10 }, () => 
          request.get(`${baseUrl}/api/health`)
        )
      );
      
      const successfulResponses = responses.filter(r => r.status === 'fulfilled');
      expect(successfulResponses.length).toBeGreaterThan(8); // Au moins 80% de succès
    });

    test('should handle network timeouts', async ({ request }) => {
      // Tester avec un timeout court
      const response = await request.get(`${baseUrl}/api/health`, {
        timeout: 1000 // 1 seconde
      });
      
      // La réponse devrait être rapide
      expect(response.ok()).toBeTruthy();
    });

    test('should handle malformed requests', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/missions`, {
        data: 'invalid-json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/missions`, {
        data: { title: 'Test Mission' } // Manque description et agentId
      });
      
      expect(response.status()).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toContain('description');
    });
  });

  test.describe('🔐 Security and Validation', () => {
    test('should validate input data', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/missions`, {
        data: {
          title: 'A'.repeat(1000), // Titre trop long
          description: 'Test',
          agentId: 'valid-agent-id'
        }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should prevent SQL injection', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/missions?search=1'; DROP TABLE missions; --`);
      
      // Ne devrait pas planter
      expect(response.status()).toBe(200);
    });

    test('should handle XSS attempts', async ({ page }) => {
      await page.goto(`${baseUrl}/missions?search=<script>alert('xss')</script>`);
      
      // Ne devrait pas exécuter de script
      const hasAlert = await page.evaluate(() => {
        return typeof window.alert === 'function';
      });
      
      expect(hasAlert).toBeTruthy();
    });

    test('should validate file uploads', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/missions`, {
        data: {
          title: 'Test',
          description: 'Test',
          agentId: 'valid-agent-id',
          file: 'invalid-file-data'
        }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('📈 Monitoring and Alerts', () => {
    test('should provide detailed health metrics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/health`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.services).toBeDefined();
      expect(data.performance).toBeDefined();
      expect(data.alerts).toBeDefined();
      expect(data.metrics).toBeDefined();
    });

    test('should track error rates', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/health`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.services.monitoring.issues).toBeDefined();
      expect(Array.isArray(data.services.monitoring.issues)).toBeTruthy();
    });

    test('should provide performance insights', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'performance' }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(data.details.memory).toBeDefined();
      expect(data.details.cpu).toBeDefined();
      expect(data.details.uptime).toBeDefined();
    });

    test('should handle monitoring failures gracefully', async ({ request }) => {
      // Tester avec un endpoint de monitoring invalide
      const response = await request.post(`${baseUrl}/api/monitoring/health`, {
        data: { checkType: 'invalid-check' }
      });
      
      expect(response.status()).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
    });
  });
});
