import puppeteer from 'apos;puppeteer'apos;;

interface QAResult {
  test: string;
  status: 'apos;PASS'apos; | 'apos;FAIL'apos; | 'apos;WARNING'apos;;
  message: string;
  screenshot?: string;
  details?: any;
}

interface QAReport {
  timestamp: string;
  url: string;
  results: QAResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class QABot {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private results: QAResult[] = [];

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['apos;--no-sandbox'apos;, 'apos;--disable-setuid-sandbox'apos;]
    });
    this.page = await this.browser.newPage();
    
    // Configuration du viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Interception des requêtes pour éviter les timeouts
    await this.page.setRequestInterception(true);
    this.page.on('apos;request'apos;, (req) => {
      if (['apos;image'apos;, 'apos;stylesheet'apos;, 'apos;font'apos;].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async addResult(test: string, status: 'apos;PASS'apos; | 'apos;FAIL'apos; | 'apos;WARNING'apos;, message: string, details?: any) {
    let screenshot: string | undefined;
    
    if (this.page && status === 'apos;FAIL'apos;) {
      screenshot = await this.page.screenshot({ 
        encoding: 'apos;base64'apos;,
        fullPage: true 
      });
    }

    this.results.push({
      test,
      status,
      message,
      screenshot,
      details
    });

    console.log(`[${status}] ${test}: ${message}`);
  }

  async runFullQA(baseUrl: string): Promise<QAReport> {
    console.log('apos;🤖 Démarrage du Bot de QA Beriox AI...'apos;);
    
    try {
      await this.initialize();
      
      // Tests de base
      await this.testPageLoad(baseUrl);
      await this.testAuthenticationPages(baseUrl);
      await this.testNavigation(baseUrl);
      await this.testForms(baseUrl);
      await this.testResponsiveDesign(baseUrl);
      await this.testPerformance(baseUrl);
      await this.testAccessibility(baseUrl);
      await this.testUserJourney(baseUrl);
      
      // Génération du rapport
      const summary = {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'apos;PASS'apos;).length,
        failed: this.results.filter(r => r.status === 'apos;FAIL'apos;).length,
        warnings: this.results.filter(r => r.status === 'apos;WARNING'apos;).length
      };

      return {
        timestamp: new Date().toISOString(),
        url: baseUrl,
        results: this.results,
        summary
      };

    } finally {
      await this.cleanup();
    }
  }

  private async testPageLoad(baseUrl: string) {
    if (!this.page) return;

    try {
      const startTime = Date.now();
      await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos;, timeout: 30000 });
      const loadTime = Date.now() - startTime;

      const title = await this.page.title();
      const url = this.page.url();

      if (loadTime < 5000) {
        await this.addResult('apos;Page Load'apos;, 'apos;PASS'apos;, `Page chargée en ${loadTime}ms`, { title, url, loadTime });
      } else {
        await this.addResult('apos;Page Load'apos;, 'apos;WARNING'apos;, `Page chargée lentement en ${loadTime}ms`, { title, url, loadTime });
      }

      // Vérifier si c'apos;est la page d'apos;authentification Vercel
      if (title.includes('apos;Authentication Required'apos;) || url.includes('apos;vercel.com/sso-api'apos;)) {
        await this.addResult('apos;Vercel Auth Redirect'apos;, 'apos;FAIL'apos;, 'apos;Application redirigée vers l\'apos;authentification Vercel au lieu de NextAuth'apos;, { title, url });
      }

    } catch (error) {
      await this.addResult('apos;Page Load'apos;, 'apos;FAIL'apos;, `Erreur lors du chargement: ${error}`, { error: error.toString() });
    }
  }

  private async testAuthenticationPages(baseUrl: string) {
    if (!this.page) return;

    const authPages = [
      'apos;/auth/signin'apos;,
      'apos;/auth/signup'apos;,
      'apos;/auth/forgot-password'apos;
    ];

    for (const page of authPages) {
      try {
        await this.page.goto(`${baseUrl}${page}`, { waitUntil: 'apos;networkidle0'apos;, timeout: 15000 });
        
        // Vérifier les éléments essentiels
        const hasForm = await this.page.$('apos;form'apos;) !== null;
        const hasButtons = await this.page.$$('apos;button'apos;).then(buttons => buttons.length > 0);
        const hasInputs = await this.page.$$('apos;input'apos;).then(inputs => inputs.length > 0);

        if (hasForm && hasButtons && hasInputs) {
          await this.addResult(`Auth Page: ${page}`, 'apos;PASS'apos;, 'apos;Page d\'apos;authentification fonctionnelle'apos;, { hasForm, hasButtons, hasInputs });
        } else {
          await this.addResult(`Auth Page: ${page}`, 'apos;FAIL'apos;, 'apos;Éléments manquants sur la page d\'apos;authentification'apos;, { hasForm, hasButtons, hasInputs });
        }

        // Test des boutons
        await this.testButtonsOnPage(page);

      } catch (error) {
        await this.addResult(`Auth Page: ${page}`, 'apos;FAIL'apos;, `Erreur lors du test: ${error}`, { error: error.toString() });
      }
    }
  }

  private async testButtonsOnPage(pageName: string) {
    if (!this.page) return;

    try {
      const buttons = await this.page.$$('apos;button'apos;);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        // Vérifier si le bouton est visible et cliquable
        const isVisible = await button.isVisible();
        const isEnabled = await button.evaluate(btn => !btn.disabled);
        const text = await button.evaluate(btn => btn.textContent?.trim() || 'apos;'apos;);
        const hasIcon = await button.$('apos;svg, i, img'apos;) !== null;

        if (!isVisible) {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'apos;WARNING'apos;, 'apos;Bouton non visible'apos;, { text, isVisible, isEnabled });
        } else if (!isEnabled) {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'apos;WARNING'apos;, 'apos;Bouton désactivé'apos;, { text, isVisible, isEnabled });
        } else {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'apos;PASS'apos;, 'apos;Bouton fonctionnel'apos;, { text, isVisible, isEnabled, hasIcon });
        }
      }

    } catch (error) {
      await this.addResult(`Button Test on ${pageName}`, 'apos;FAIL'apos;, `Erreur lors du test des boutons: ${error}`, { error: error.toString() });
    }
  }

  private async testNavigation(baseUrl: string) {
    if (!this.page) return;

    try {
      await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos; });
      
      // Test de navigation vers les pages principales
      const navLinks = await this.page.$$('apos;a[href^="/"]'apos;);
      
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        const link = navLinks[i];
        const href = await link.evaluate(el => el.getAttribute('apos;href'apos;));
        const text = await link.evaluate(el => el.textContent?.trim() || 'apos;'apos;);
        
        if (href && !href.includes('apos;#'apos;)) {
          try {
            await link.click();
            await this.page.waitForTimeout(2000);
            
            const currentUrl = this.page.url();
            if (currentUrl.includes(href) || currentUrl.includes('apos;auth'apos;)) {
              await this.addResult(`Navigation: ${text}`, 'apos;PASS'apos;, 'apos;Navigation réussie'apos;, { href, currentUrl });
            } else {
              await this.addResult(`Navigation: ${text}`, 'apos;WARNING'apos;, 'apos;Navigation vers une page inattendue'apos;, { href, currentUrl });
            }
            
            await this.page.goBack();
            await this.page.waitForTimeout(1000);
            
          } catch (error) {
            await this.addResult(`Navigation: ${text}`, 'apos;FAIL'apos;, `Erreur de navigation: ${error}`, { href, error: error.toString() });
          }
        }
      }

    } catch (error) {
      await this.addResult('apos;Navigation Test'apos;, 'apos;FAIL'apos;, `Erreur lors du test de navigation: ${error}`, { error: error.toString() });
    }
  }

  private async testForms(baseUrl: string) {
    if (!this.page) return;

    try {
      await this.page.goto(`${baseUrl}/auth/signup`, { waitUntil: 'apos;networkidle0'apos; });
      
      const forms = await this.page.$$('apos;form'apos;);
      
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        
        // Test de soumission de formulaire
        const inputs = await form.$$('apos;input[type="text"], input[type="email"], input[type="password"]'apos;);
        
        if (inputs.length > 0) {
          // Remplir le formulaire avec des données de test
          for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            const type = await input.evaluate(el => el.getAttribute('apos;type'apos;));
            const placeholder = await input.evaluate(el => el.getAttribute('apos;placeholder'apos;));
            
            let testValue = 'apos;test@example.com'apos;;
            if (type === 'apos;password'apos;) testValue = 'apos;password123'apos;;
            else if (placeholder?.includes('apos;nom'apos;) || placeholder?.includes('apos;name'apos;)) testValue = 'apos;Test User'apos;;
            
            await input.type(testValue);
          }
          
          // Soumettre le formulaire
          const submitButton = await form.$('apos;button[type="submit"]'apos;);
          if (submitButton) {
            await submitButton.click();
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            if (currentUrl.includes('apos;verify'apos;) || currentUrl.includes('apos;success'apos;)) {
              await this.addResult(`Form Submission ${i + 1}`, 'apos;PASS'apos;, 'apos;Formulaire soumis avec succès'apos;, { currentUrl });
            } else {
              await this.addResult(`Form Submission ${i + 1}`, 'apos;WARNING'apos;, 'apos;Soumission de formulaire sans redirection attendue'apos;, { currentUrl });
            }
          }
        }
      }

    } catch (error) {
      await this.addResult('apos;Form Test'apos;, 'apos;FAIL'apos;, `Erreur lors du test des formulaires: ${error}`, { error: error.toString() });
    }
  }

  private async testResponsiveDesign(baseUrl: string) {
    if (!this.page) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'apos;Desktop'apos; },
      { width: 768, height: 1024, name: 'apos;Tablet'apos; },
      { width: 375, height: 667, name: 'apos;Mobile'apos; }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos; });
        
        // Vérifier si la page s'apos;affiche correctement
        const bodyWidth = await this.page.evaluate(() => document.body.offsetWidth);
        const bodyHeight = await this.page.evaluate(() => document.body.offsetHeight);
        
        if (bodyWidth > 0 && bodyHeight > 0) {
          await this.addResult(`Responsive: ${viewport.name}`, 'apos;PASS'apos;, 'apos;Page responsive'apos;, { viewport, bodyWidth, bodyHeight });
        } else {
          await this.addResult(`Responsive: ${viewport.name}`, 'apos;FAIL'apos;, 'apos;Page non responsive'apos;, { viewport, bodyWidth, bodyHeight });
        }

      } catch (error) {
        await this.addResult(`Responsive: ${viewport.name}`, 'apos;FAIL'apos;, `Erreur responsive: ${error}`, { viewport, error: error.toString() });
      }
    }
  }

  private async testPerformance(baseUrl: string) {
    if (!this.page) return;

    try {
      const startTime = Date.now();
      await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos; });
      const loadTime = Date.now() - startTime;

      // Mesurer les métriques de performance
      const metrics = await this.page.metrics();
      
      if (loadTime < 3000) {
        await this.addResult('apos;Performance'apos;, 'apos;PASS'apos;, `Temps de chargement optimal: ${loadTime}ms`, { loadTime, metrics });
      } else if (loadTime < 5000) {
        await this.addResult('apos;Performance'apos;, 'apos;WARNING'apos;, `Temps de chargement acceptable: ${loadTime}ms`, { loadTime, metrics });
      } else {
        await this.addResult('apos;Performance'apos;, 'apos;FAIL'apos;, `Temps de chargement trop lent: ${loadTime}ms`, { loadTime, metrics });
      }

    } catch (error) {
      await this.addResult('apos;Performance'apos;, 'apos;FAIL'apos;, `Erreur lors du test de performance: ${error}`, { error: error.toString() });
    }
  }

  private async testAccessibility(baseUrl: string) {
    if (!this.page) return;

    try {
      await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos; });
      
      // Tests d'apos;accessibilité basiques
      const hasTitle = await this.page.title() !== 'apos;'apos;;
      const hasHeadings = await this.page.$$('apos;h1, h2, h3, h4, h5, h6'apos;).then(headings => headings.length > 0);
      const hasAltText = await this.page.$$eval('apos;img'apos;, imgs => imgs.every(img => img.alt !== null));
      
      if (hasTitle && hasHeadings) {
        await this.addResult('apos;Accessibility'apos;, 'apos;PASS'apos;, 'apos;Accessibilité de base correcte'apos;, { hasTitle, hasHeadings, hasAltText });
      } else {
        await this.addResult('apos;Accessibility'apos;, 'apos;WARNING'apos;, 'apos;Problèmes d\'apos;accessibilité détectés'apos;, { hasTitle, hasHeadings, hasAltText });
      }

    } catch (error) {
      await this.addResult('apos;Accessibility'apos;, 'apos;FAIL'apos;, `Erreur lors du test d'apos;accessibilité: ${error}`, { error: error.toString() });
    }
  }

  private async testUserJourney(baseUrl: string) {
    if (!this.page) return;

    try {
      // Simuler un parcours utilisateur complet
      console.log('apos;🧭 Test du parcours utilisateur...'apos;);
      
      // 1. Arrivée sur la page d'apos;accueil
      await this.page.goto(baseUrl, { waitUntil: 'apos;networkidle0'apos; });
      await this.addResult('apos;User Journey: Homepage'apos;, 'apos;PASS'apos;, 'apos;Page d\'apos;accueil accessible'apos;);
      
      // 2. Navigation vers l'apos;inscription
      await this.page.goto(`${baseUrl}/auth/signup`, { waitUntil: 'apos;networkidle0'apos; });
      await this.addResult('apos;User Journey: Signup'apos;, 'apos;PASS'apos;, 'apos;Page d\'apos;inscription accessible'apos;);
      
      // 3. Test d'apos;inscription avec Google
      const googleButton = await this.page.$('apos;button:has-text("Google")'apos;);
      if (googleButton) {
        await this.addResult('apos;User Journey: Google Auth'apos;, 'apos;PASS'apos;, 'apos;Bouton Google Auth présent'apos;);
      } else {
        await this.addResult('apos;User Journey: Google Auth'apos;, 'apos;WARNING'apos;, 'apos;Bouton Google Auth manquant'apos;);
      }
      
      // 4. Test de navigation vers la connexion
      await this.page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle0'apos; });
      await this.addResult('apos;User Journey: Signin'apos;, 'apos;PASS'apos;, 'apos;Page de connexion accessible'apos;);
      
      // 5. Test de mot de passe oublié
      await this.page.goto(`${baseUrl}/auth/forgot-password`, { waitUntil: 'apos;networkidle0'apos; });
      await this.addResult('apos;User Journey: Forgot Password'apos;, 'apos;PASS'apos;, 'apos;Page mot de passe oublié accessible'apos;);

    } catch (error) {
      await this.addResult('apos;User Journey'apos;, 'apos;FAIL'apos;, `Erreur dans le parcours utilisateur: ${error}`, { error: error.toString() });
    }
  }
}

// Fonction utilitaire pour exécuter le QA
export async function runQA(url: string): Promise<QAReport> {
  const qaBot = new QABot();
  return await qaBot.runFullQA(url);
}
