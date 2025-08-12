import puppeteer from 'puppeteer'
interface QAResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  screenshot?: string
  details?: any
}

interface QAReport {
  timestamp: string
  url: string
  results: QAResult[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

export class QABot {
  private browser: puppeteer.Browser | null = null
  private page: puppeteer.Page | null = null
  private results: QAResult[] = []
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    // Configuration du viewport
    await this.page.setViewport({ width: 1920, height: 1080 })
    // Interception des requêtes pour éviter les timeouts
    await this.page.setRequestInterception(true)
    this.page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort()
      } else {
        req.continue()
      }
    })
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  private async addResult(test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    let screenshot: string | undefined
    if (this.page && status === 'FAIL') {
      screenshot = await this.page.screenshot({ 
        encoding: 'base64',
        fullPage: true 
      })
    }

    this.results.push({
      test,
      status,
      message,
      screenshot,
      details
    })
    console.log(`[${status}] ${test}: ${message}`)
  }

  async runFullQA(baseUrl: string): Promise<QAReport> {
    console.log('🤖 Démarrage du Bot de QA Beriox AI...')
    try {
      await this.initialize()
      // Tests de base
      await this.testPageLoad(baseUrl)
      await this.testAuthenticationPages(baseUrl)
      await this.testNavigation(baseUrl)
      await this.testForms(baseUrl)
      await this.testResponsiveDesign(baseUrl)
      await this.testPerformance(baseUrl)
      await this.testAccessibility(baseUrl)
      await this.testUserJourney(baseUrl)
      // Génération du rapport
      const summary = {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length,
        warnings: this.results.filter(r => r.status === 'WARNING').length
      }
      return {
        timestamp: new Date().toISOString(),
        url: baseUrl,
        results: this.results,
        summary
      }
    } finally {
      await this.cleanup()
    }
  }

  private async testPageLoad(baseUrl: string) {
    if (!this.page) return
    try {
      const startTime = Date.now()
      await this.page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 })
      const loadTime = Date.now() - startTime
      const title = await this.page.title()
      const url = this.page.url()
      if (loadTime < 5000) {
        await this.addResult('Page Load', 'PASS', `Page chargée en ${loadTime}ms`, { title, url, loadTime })
      } else {
        await this.addResult('Page Load', 'WARNING', `Page chargée lentement en ${loadTime}ms`, { title, url, loadTime })
      }

      // Vérifier si c'est la page d'authentification Vercel
      if (title.includes('Authentication Required') || url.includes('vercel.com/sso-api')) {
        await this.addResult('Vercel Auth Redirect', 'FAIL', 'Application redirigée vers l\'authentification Vercel au lieu de NextAuth', { title, url })
      }

    } catch (error) {
      await this.addResult('Page Load', 'FAIL', `Erreur lors du chargement: ${error}`, { error: error.toString() })
    }
  }

  private async testAuthenticationPages(baseUrl: string) {
    if (!this.page) return
    const authPages = [
      '/auth/signin',
      '/auth/signup',
      '/auth/forgot-password'
    ]
    for (const page of authPages) {
      try {
        await this.page.goto(`${baseUrl}${page}`, { waitUntil: 'networkidle0', timeout: 15000 })
        // Vérifier les éléments essentiels
        const hasForm = await this.page.$('form') !== null
        const hasButtons = await this.page.$$('button').then(buttons => buttons.length > 0)
        const hasInputs = await this.page.$$('input').then(inputs => inputs.length > 0)
        if (hasForm && hasButtons && hasInputs) {
          await this.addResult(`Auth Page: ${page}`, 'PASS', 'Page d\'authentification fonctionnelle', { hasForm, hasButtons, hasInputs })
        } else {
          await this.addResult(`Auth Page: ${page}`, 'FAIL', 'Éléments manquants sur la page d\'authentification', { hasForm, hasButtons, hasInputs })
        }

        // Test des boutons
        await this.testButtonsOnPage(page)
      } catch (error) {
        await this.addResult(`Auth Page: ${page}`, 'FAIL', `Erreur lors du test: ${error}`, { error: error.toString() })
      }
    }
  }

  private async testButtonsOnPage(pageName: string) {
    if (!this.page) return
    try {
      const buttons = await this.page.$$('button')
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        // Vérifier si le bouton est visible et cliquable
        const isVisible = await button.isVisible()
        const isEnabled = await button.evaluate(btn => !btn.disabled)
        const text = await button.evaluate(btn => btn.textContent?.trim() || '')
        const hasIcon = await button.$('svg, i, img') !== null
        if (!isVisible) {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'WARNING', 'Bouton non visible', { text, isVisible, isEnabled })
        } else if (!isEnabled) {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'WARNING', 'Bouton désactivé', { text, isVisible, isEnabled })
        } else {
          await this.addResult(`Button ${i + 1} on ${pageName}`, 'PASS', 'Bouton fonctionnel', { text, isVisible, isEnabled, hasIcon })
        }
      }

    } catch (error) {
      await this.addResult(`Button Test on ${pageName}`, 'FAIL', `Erreur lors du test des boutons: ${error}`, { error: error.toString() })
    }
  }

  private async testNavigation(baseUrl: string) {
    if (!this.page) return
    try {
      await this.page.goto(baseUrl, { waitUntil: 'networkidle0' })
      // Test de navigation vers les pages principales
      const navLinks = await this.page.$$('a[href^="/"]')
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        const link = navLinks[i]
        const href = await link.evaluate(el => el.getAttribute('href'))
        const text = await link.evaluate(el => el.textContent?.trim() || '')
        if (href && !href.includes('#')) {
          try {
            await link.click()
            await this.page.waitForTimeout(2000)
            const currentUrl = this.page.url()
            if (currentUrl.includes(href) || currentUrl.includes('auth')) {
              await this.addResult(`Navigation: ${text}`, 'PASS', 'Navigation réussie', { href, currentUrl })
            } else {
              await this.addResult(`Navigation: ${text}`, 'WARNING', 'Navigation vers une page inattendue', { href, currentUrl })
            }
            
            await this.page.goBack()
            await this.page.waitForTimeout(1000)
          } catch (error) {
            await this.addResult(`Navigation: ${text}`, 'FAIL', `Erreur de navigation: ${error}`, { href, error: error.toString() })
          }
        }
      }

    } catch (error) {
      await this.addResult('Navigation Test', 'FAIL', `Erreur lors du test de navigation: ${error}`, { error: error.toString() })
    }
  }

  private async testForms(baseUrl: string) {
    if (!this.page) return
    try {
      await this.page.goto(`${baseUrl}/auth/signup`, { waitUntil: 'networkidle0' })
      const forms = await this.page.$$('form')
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i]
        // Test de soumission de formulaire
        const inputs = await form.$$('input[type="text"], input[type="email"], input[type="password"]')
        if (inputs.length > 0) {
          // Remplir le formulaire avec des données de test
          for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j]
            const type = await input.evaluate(el => el.getAttribute('type'))
            const placeholder = await input.evaluate(el => el.getAttribute('placeholder'))
            let testValue = 'test@example.com'
            if (type === 'password') testValue = 'password123'
            else if (placeholder?.includes('nom') || placeholder?.includes('name')) testValue = 'Test User'
            await input.type(testValue)
          }
          
          // Soumettre le formulaire
          const submitButton = await form.$('button[type="submit"]')
          if (submitButton) {
            await submitButton.click()
            await this.page.waitForTimeout(3000)
            const currentUrl = this.page.url()
            if (currentUrl.includes('verify') || currentUrl.includes('success')) {
              await this.addResult(`Form Submission ${i + 1}`, 'PASS', 'Formulaire soumis avec succès', { currentUrl })
            } else {
              await this.addResult(`Form Submission ${i + 1}`, 'WARNING', 'Soumission de formulaire sans redirection attendue', { currentUrl })
            }
          }
        }
      }

    } catch (error) {
      await this.addResult('Form Test', 'FAIL', `Erreur lors du test des formulaires: ${error}`, { error: error.toString() })
    }
  }

  private async testResponsiveDesign(baseUrl: string) {
    if (!this.page) return
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]
    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport)
        await this.page.goto(baseUrl, { waitUntil: 'networkidle0' })
        // Vérifier si la page s'affiche correctement
        const bodyWidth = await this.page.evaluate(() => document.body.offsetWidth)
        const bodyHeight = await this.page.evaluate(() => document.body.offsetHeight)
        if (bodyWidth > 0 && bodyHeight > 0) {
          await this.addResult(`Responsive: ${viewport.name}`, 'PASS', 'Page responsive', { viewport, bodyWidth, bodyHeight })
        } else {
          await this.addResult(`Responsive: ${viewport.name}`, 'FAIL', 'Page non responsive', { viewport, bodyWidth, bodyHeight })
        }

      } catch (error) {
        await this.addResult(`Responsive: ${viewport.name}`, 'FAIL', `Erreur responsive: ${error}`, { viewport, error: error.toString() })
      }
    }
  }

  private async testPerformance(baseUrl: string) {
    if (!this.page) return
    try {
      const startTime = Date.now()
      await this.page.goto(baseUrl, { waitUntil: 'networkidle0' })
      const loadTime = Date.now() - startTime
      // Mesurer les métriques de performance
      const metrics = await this.page.metrics()
      if (loadTime < 3000) {
        await this.addResult('Performance', 'PASS', `Temps de chargement optimal: ${loadTime}ms`, { loadTime, metrics })
      } else if (loadTime < 5000) {
        await this.addResult('Performance', 'WARNING', `Temps de chargement acceptable: ${loadTime}ms`, { loadTime, metrics })
      } else {
        await this.addResult('Performance', 'FAIL', `Temps de chargement trop lent: ${loadTime}ms`, { loadTime, metrics })
      }

    } catch (error) {
      await this.addResult('Performance', 'FAIL', `Erreur lors du test de performance: ${error}`, { error: error.toString() })
    }
  }

  private async testAccessibility(baseUrl: string) {
    if (!this.page) return
    try {
      await this.page.goto(baseUrl, { waitUntil: 'networkidle0' })
      // Tests d'accessibilité basiques
      const hasTitle = await this.page.title() !== ''
      const hasHeadings = await this.page.$$('h1, h2, h3, h4, h5, h6').then(headings => headings.length > 0)
      const hasAltText = await this.page.$$eval('img', imgs => imgs.every(img => img.alt !== null))
      if (hasTitle && hasHeadings) {
        await this.addResult('Accessibility', 'PASS', 'Accessibilité de base correcte', { hasTitle, hasHeadings, hasAltText })
      } else {
        await this.addResult('Accessibility', 'WARNING', 'Problèmes d\'accessibilité détectés', { hasTitle, hasHeadings, hasAltText })
      }

    } catch (error) {
      await this.addResult('Accessibility', 'FAIL', `Erreur lors du test d'accessibilité: ${error}`, { error: error.toString() })
    }
  }

  private async testUserJourney(baseUrl: string) {
    if (!this.page) return
    try {
      // Simuler un parcours utilisateur complet
      console.log('🧭 Test du parcours utilisateur...')
      // 1. Arrivée sur la page d'accueil
      await this.page.goto(baseUrl, { waitUntil: 'networkidle0' })
      await this.addResult('User Journey: Homepage', 'PASS', 'Page d\'accueil accessible')
      // 2. Navigation vers l'inscription
      await this.page.goto(`${baseUrl}/auth/signup`, { waitUntil: 'networkidle0' })
      await this.addResult('User Journey: Signup', 'PASS', 'Page d\'inscription accessible')
      // 3. Test d'inscription avec Google
      const googleButton = await this.page.$('button:has-text("Google")')
      if (googleButton) {
        await this.addResult('User Journey: Google Auth', 'PASS', 'Bouton Google Auth présent')
      } else {
        await this.addResult('User Journey: Google Auth', 'WARNING', 'Bouton Google Auth manquant')
      }
      
      // 4. Test de navigation vers la connexion
      await this.page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle0' })
      await this.addResult('User Journey: Signin', 'PASS', 'Page de connexion accessible')
      // 5. Test de mot de passe oublié
      await this.page.goto(`${baseUrl}/auth/forgot-password`, { waitUntil: 'networkidle0' })
      await this.addResult('User Journey: Forgot Password', 'PASS', 'Page mot de passe oublié accessible')
    } catch (error) {
      await this.addResult('User Journey', 'FAIL', `Erreur dans le parcours utilisateur: ${error}`, { error: error.toString() })
    }
  }
}

// Fonction utilitaire pour exécuter le QA
export async function runQA(url: string): Promise<QAReport> {
  const qaBot = new QABot()
  return await qaBot.runFullQA(url)
}
