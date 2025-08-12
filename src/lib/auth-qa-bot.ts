import puppeteer from 'apos;puppeteer'apos;;

interface AuthQAResult {
  test: string;
  status: 'apos;PASS'apos; | 'apos;FAIL'apos; | 'apos;WARNING'apos;;
  message: string;
  screenshot?: string;
  details?: any;
  duration?: number;
}

interface AuthQAReport {
  timestamp: string;
  url: string;
  results: AuthQAResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    totalDuration: number;
  };
}

export class AuthQABot {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private results: AuthQAResult[] = [];
  private startTime: number = 0;

  async initialize() {
    this.startTime = Date.now();
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['apos;--no-sandbox'apos;, 'apos;--disable-setuid-sandbox'apos;, 'apos;--disable-dev-shm-usage'apos;]
    });
    this.page = await this.browser.newPage();
    
    // Configuration de la page
    await this.page.setViewport({ width: 1280, height: 720 });
    await this.page.setUserAgent('apos;Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'apos;);
    
    // Intercepter les erreurs console
    this.page.on('apos;console'apos;, msg => {
      if (msg.type() === 'apos;error'apos;) {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async addResult(test: string, status: 'apos;PASS'apos; | 'apos;FAIL'apos; | 'apos;WARNING'apos;, message: string, details?: any) {
    const duration = Date.now() - this.startTime;
    this.results.push({
      test,
      status,
      message,
      details,
      duration
    });
    console.log(`[${status}] ${test}: ${message}`);
  }

  async runAuthQA(baseUrl: string): Promise<AuthQAReport> {
    try {
      await this.initialize();
      
      console.log('apos;🔐 Démarrage du QA Bot d\'apos;Authentification...'apos;);
      
      // Tests de la page d'apos;accueil
      await this.testHomepage(baseUrl);
      
      // Tests des pages d'apos;authentification
      await this.testSignInPage(baseUrl);
      await this.testSignUpPage(baseUrl);
      await this.testForgotPasswordPage(baseUrl);
      await this.testResetPasswordPage(baseUrl);
      await this.testVerifyPage(baseUrl);
      
      // Tests de navigation
      await this.testAuthNavigation(baseUrl);
      
      // Tests de formulaires
      await this.testAuthForms(baseUrl);
      
      // Tests de responsive design
      await this.testAuthResponsive(baseUrl);
      
      // Tests de performance
      await this.testAuthPerformance(baseUrl);
      
      // Tests d'apos;accessibilité
      await this.testAuthAccessibility(baseUrl);
      
      // Tests de sécurité
      await this.testAuthSecurity(baseUrl);
      
      // Tests de parcours utilisateur
      await this.testAuthUserJourney(baseUrl);

      const totalDuration = Date.now() - this.startTime;
      
      return {
        timestamp: new Date().toISOString(),
        url: baseUrl,
        results: this.results,
        summary: {
          total: this.results.length,
          passed: this.results.filter(r => r.status === 'apos;PASS'apos;).length,
          failed: this.results.filter(r => r.status === 'apos;FAIL'apos;).length,
          warnings: this.results.filter(r => r.status === 'apos;WARNING'apos;).length,
          totalDuration
        }
      };
    } finally {
      await this.cleanup();
    }
  }

  private async testHomepage(baseUrl: string) {
    try {
      await this.page!.goto(baseUrl, { waitUntil: 'apos;networkidle2'apos;, timeout: 30000 });
      
      // Vérifier que la page se charge
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Homepage Load'apos;, 'apos;PASS'apos;, 'apos;Page d\'apos;accueil chargée avec succès'apos;);
      } else {
        await this.addResult('apos;Homepage Load'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      // Vérifier les liens d'apos;authentification
      const signInLink = await this.page!.$('apos;a[href="/auth/signin"]'apos;);
      const signUpLink = await this.page!.$('apos;a[href="/auth/signup"]'apos;);
      
      if (signInLink) {
        await this.addResult('apos;Sign In Link'apos;, 'apos;PASS'apos;, 'apos;Lien de connexion présent'apos;);
      } else {
        await this.addResult('apos;Sign In Link'apos;, 'apos;FAIL'apos;, 'apos;Lien de connexion manquant'apos;);
      }
      
      if (signUpLink) {
        await this.addResult('apos;Sign Up Link'apos;, 'apos;PASS'apos;, 'apos;Lien d\'apos;inscription présent'apos;);
      } else {
        await this.addResult('apos;Sign Up Link'apos;, 'apos;FAIL'apos;, 'apos;Lien d\'apos;inscription manquant'apos;);
      }

      // Vérifier que le contenu principal s'apos;affiche
      const heroText = await this.page!.$('apos;h1'apos;);
      if (heroText) {
        const text = await this.page!.evaluate(el => el.textContent, heroText);
        if (text?.includes('apos;agents IA'apos;)) {
          await this.addResult('apos;Hero Content'apos;, 'apos;PASS'apos;, 'apos;Contenu principal affiché'apos;);
        } else {
          await this.addResult('apos;Hero Content'apos;, 'apos;WARNING'apos;, 'apos;Contenu principal partiellement affiché'apos;);
        }
      } else {
        await this.addResult('apos;Hero Content'apos;, 'apos;FAIL'apos;, 'apos;Contenu principal manquant'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Homepage Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testSignInPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Vérifier le titre
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Sign In Page Title'apos;, 'apos;PASS'apos;, 'apos;Page de connexion chargée'apos;);
      } else {
        await this.addResult('apos;Sign In Page Title'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      // Vérifier les éléments du formulaire
      const emailInput = await this.page!.$('apos;input[type="email"]'apos;);
      const passwordInput = await this.page!.$('apos;input[type="password"]'apos;);
      const submitButton = await this.page!.$('apos;button[type="submit"]'apos;);
      const googleButton = await this.page!.$$('apos;button'apos;);

      if (emailInput) {
        await this.addResult('apos;Email Input'apos;, 'apos;PASS'apos;, 'apos;Champ email présent'apos;);
      } else {
        await this.addResult('apos;Email Input'apos;, 'apos;FAIL'apos;, 'apos;Champ email manquant'apos;);
      }

      if (passwordInput) {
        await this.addResult('apos;Password Input'apos;, 'apos;PASS'apos;, 'apos;Champ mot de passe présent'apos;);
      } else {
        await this.addResult('apos;Password Input'apos;, 'apos;FAIL'apos;, 'apos;Champ mot de passe manquant'apos;);
      }

      if (submitButton) {
        await this.addResult('apos;Submit Button'apos;, 'apos;PASS'apos;, 'apos;Bouton de soumission présent'apos;);
      } else {
        await this.addResult('apos;Submit Button'apos;, 'apos;FAIL'apos;, 'apos;Bouton de soumission manquant'apos;);
      }

      // Vérifier le bouton Google
      const googleButtonText = await this.page!.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('apos;button'apos;));
        return buttons.find(btn => btn.textContent?.includes('apos;Google'apos;));
      });
      
      if (googleButtonText) {
        await this.addResult('apos;Google Button'apos;, 'apos;PASS'apos;, 'apos;Bouton Google présent'apos;);
      } else {
        await this.addResult('apos;Google Button'apos;, 'apos;WARNING'apos;, 'apos;Bouton Google non trouvé'apos;);
      }

      // Vérifier les liens
      const forgotPasswordLink = await this.page!.$('apos;a[href="/auth/forgot-password"]'apos;);
      const signUpLink = await this.page!.$('apos;a[href="/auth/signup"]'apos;);

      if (forgotPasswordLink) {
        await this.addResult('apos;Forgot Password Link'apos;, 'apos;PASS'apos;, 'apos;Lien mot de passe oublié présent'apos;);
      } else {
        await this.addResult('apos;Forgot Password Link'apos;, 'apos;FAIL'apos;, 'apos;Lien mot de passe oublié manquant'apos;);
      }

      if (signUpLink) {
        await this.addResult('apos;Sign Up Link on Sign In'apos;, 'apos;PASS'apos;, 'apos;Lien d\'apos;inscription présent'apos;);
      } else {
        await this.addResult('apos;Sign Up Link on Sign In'apos;, 'apos;FAIL'apos;, 'apos;Lien d\'apos;inscription manquant'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Sign In Page Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testSignUpPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signup`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Vérifier le titre
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Sign Up Page Title'apos;, 'apos;PASS'apos;, 'apos;Page d\'apos;inscription chargée'apos;);
      } else {
        await this.addResult('apos;Sign Up Page Title'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      // Vérifier les éléments du formulaire
      const nameInput = await this.page!.$('apos;input[name="name"]'apos;);
      const emailInput = await this.page!.$('apos;input[type="email"]'apos;);
      const passwordInput = await this.page!.$('apos;input[name="password"]'apos;);
      const confirmPasswordInput = await this.page!.$('apos;input[name="confirmPassword"]'apos;);
      const submitButton = await this.page!.$('apos;button[type="submit"]'apos;);

      if (nameInput) {
        await this.addResult('apos;Name Input'apos;, 'apos;PASS'apos;, 'apos;Champ nom présent'apos;);
      } else {
        await this.addResult('apos;Name Input'apos;, 'apos;FAIL'apos;, 'apos;Champ nom manquant'apos;);
      }

      if (emailInput) {
        await this.addResult('apos;Sign Up Email Input'apos;, 'apos;PASS'apos;, 'apos;Champ email présent'apos;);
      } else {
        await this.addResult('apos;Sign Up Email Input'apos;, 'apos;FAIL'apos;, 'apos;Champ email manquant'apos;);
      }

      if (passwordInput) {
        await this.addResult('apos;Sign Up Password Input'apos;, 'apos;PASS'apos;, 'apos;Champ mot de passe présent'apos;);
      } else {
        await this.addResult('apos;Sign Up Password Input'apos;, 'apos;FAIL'apos;, 'apos;Champ mot de passe manquant'apos;);
      }

      if (confirmPasswordInput) {
        await this.addResult('apos;Confirm Password Input'apos;, 'apos;PASS'apos;, 'apos;Champ confirmation mot de passe présent'apos;);
      } else {
        await this.addResult('apos;Confirm Password Input'apos;, 'apos;FAIL'apos;, 'apos;Champ confirmation mot de passe manquant'apos;);
      }

      if (submitButton) {
        await this.addResult('apos;Sign Up Submit Button'apos;, 'apos;PASS'apos;, 'apos;Bouton de soumission présent'apos;);
      } else {
        await this.addResult('apos;Sign Up Submit Button'apos;, 'apos;FAIL'apos;, 'apos;Bouton de soumission manquant'apos;);
      }

      // Vérifier le lien de connexion
      const signInLink = await this.page!.$('apos;a[href="/auth/signin"]'apos;);
      if (signInLink) {
        await this.addResult('apos;Sign In Link on Sign Up'apos;, 'apos;PASS'apos;, 'apos;Lien de connexion présent'apos;);
      } else {
        await this.addResult('apos;Sign In Link on Sign Up'apos;, 'apos;FAIL'apos;, 'apos;Lien de connexion manquant'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Sign Up Page Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testForgotPasswordPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/forgot-password`, { waitUntil: 'apos;networkidle2'apos; });
      
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Forgot Password Page Title'apos;, 'apos;PASS'apos;, 'apos;Page mot de passe oublié chargée'apos;);
      } else {
        await this.addResult('apos;Forgot Password Page Title'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      const emailInput = await this.page!.$('apos;input[type="email"]'apos;);
      const submitButton = await this.page!.$('apos;button[type="submit"]'apos;);

      if (emailInput) {
        await this.addResult('apos;Forgot Password Email Input'apos;, 'apos;PASS'apos;, 'apos;Champ email présent'apos;);
      } else {
        await this.addResult('apos;Forgot Password Email Input'apos;, 'apos;FAIL'apos;, 'apos;Champ email manquant'apos;);
      }

      if (submitButton) {
        await this.addResult('apos;Forgot Password Submit Button'apos;, 'apos;PASS'apos;, 'apos;Bouton de soumission présent'apos;);
      } else {
        await this.addResult('apos;Forgot Password Submit Button'apos;, 'apos;FAIL'apos;, 'apos;Bouton de soumission manquant'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Forgot Password Page Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testResetPasswordPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/reset-password?token=test`, { waitUntil: 'apos;networkidle2'apos; });
      
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Reset Password Page Title'apos;, 'apos;PASS'apos;, 'apos;Page réinitialisation mot de passe chargée'apos;);
      } else {
        await this.addResult('apos;Reset Password Page Title'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      const passwordInput = await this.page!.$('apos;input[name="password"]'apos;);
      const confirmPasswordInput = await this.page!.$('apos;input[name="confirmPassword"]'apos;);
      const submitButton = await this.page!.$('apos;button[type="submit"]'apos;);

      if (passwordInput) {
        await this.addResult('apos;Reset Password Input'apos;, 'apos;PASS'apos;, 'apos;Champ mot de passe présent'apos;);
      } else {
        await this.addResult('apos;Reset Password Input'apos;, 'apos;FAIL'apos;, 'apos;Champ mot de passe manquant'apos;);
      }

      if (confirmPasswordInput) {
        await this.addResult('apos;Reset Confirm Password Input'apos;, 'apos;PASS'apos;, 'apos;Champ confirmation présent'apos;);
      } else {
        await this.addResult('apos;Reset Confirm Password Input'apos;, 'apos;FAIL'apos;, 'apos;Champ confirmation manquant'apos;);
      }

      if (submitButton) {
        await this.addResult('apos;Reset Password Submit Button'apos;, 'apos;PASS'apos;, 'apos;Bouton de soumission présent'apos;);
      } else {
        await this.addResult('apos;Reset Password Submit Button'apos;, 'apos;FAIL'apos;, 'apos;Bouton de soumission manquant'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Reset Password Page Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testVerifyPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/verify?token=test`, { waitUntil: 'apos;networkidle2'apos; });
      
      const title = await this.page!.title();
      if (title.includes('apos;Beriox AI'apos;)) {
        await this.addResult('apos;Verify Page Title'apos;, 'apos;PASS'apos;, 'apos;Page de vérification chargée'apos;);
      } else {
        await this.addResult('apos;Verify Page Title'apos;, 'apos;FAIL'apos;, `Titre incorrect: ${title}`);
      }

      // Vérifier qu'apos;il y a du contenu de vérification
      const content = await this.page!.evaluate(() => document.body.textContent);
      if (content?.includes('apos;vérification'apos;) || content?.includes('apos;verification'apos;)) {
        await this.addResult('apos;Verify Page Content'apos;, 'apos;PASS'apos;, 'apos;Contenu de vérification présent'apos;);
      } else {
        await this.addResult('apos;Verify Page Content'apos;, 'apos;WARNING'apos;, 'apos;Contenu de vérification non détecté'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Verify Page Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthNavigation(baseUrl: string) {
    try {
      // Test navigation depuis la page d'apos;accueil
      await this.page!.goto(baseUrl, { waitUntil: 'apos;networkidle2'apos; });
      
      // Cliquer sur le lien de connexion
      const signInLink = await this.page!.$('apos;a[href="/auth/signin"]'apos;);
      if (signInLink) {
        await signInLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'apos;networkidle2'apos; });
        
        const currentUrl = this.page!.url();
        if (currentUrl.includes('apos;/auth/signin'apos;)) {
          await this.addResult('apos;Navigation to Sign In'apos;, 'apos;PASS'apos;, 'apos;Navigation vers connexion réussie'apos;);
        } else {
          await this.addResult('apos;Navigation to Sign In'apos;, 'apos;FAIL'apos;, `URL incorrecte: ${currentUrl}`);
        }
      }

      // Test navigation vers l'apos;inscription
      const signUpLink = await this.page!.$('apos;a[href="/auth/signup"]'apos;);
      if (signUpLink) {
        await signUpLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'apos;networkidle2'apos; });
        
        const currentUrl = this.page!.url();
        if (currentUrl.includes('apos;/auth/signup'apos;)) {
          await this.addResult('apos;Navigation to Sign Up'apos;, 'apos;PASS'apos;, 'apos;Navigation vers inscription réussie'apos;);
        } else {
          await this.addResult('apos;Navigation to Sign Up'apos;, 'apos;FAIL'apos;, `URL incorrecte: ${currentUrl}`);
        }
      }

    } catch (error) {
      await this.addResult('apos;Auth Navigation Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthForms(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Test remplissage du formulaire
      await this.page!.type('apos;input[type="email"]'apos;, 'apos;test@example.com'apos;);
      await this.page!.type('apos;input[type="password"]'apos;, 'apos;password123'apos;);
      
      const emailValue = await this.page!.evaluate(() => {
        const input = document.querySelector('apos;input[type="email"]'apos;) as HTMLInputElement;
        return input?.value;
      });
      
      const passwordValue = await this.page!.evaluate(() => {
        const input = document.querySelector('apos;input[type="password"]'apos;) as HTMLInputElement;
        return input?.value;
      });

      if (emailValue === 'apos;test@example.com'apos;) {
        await this.addResult('apos;Form Email Input'apos;, 'apos;PASS'apos;, 'apos;Saisie email fonctionnelle'apos;);
      } else {
        await this.addResult('apos;Form Email Input'apos;, 'apos;FAIL'apos;, 'apos;Saisie email non fonctionnelle'apos;);
      }

      if (passwordValue === 'apos;password123'apos;) {
        await this.addResult('apos;Form Password Input'apos;, 'apos;PASS'apos;, 'apos;Saisie mot de passe fonctionnelle'apos;);
      } else {
        await this.addResult('apos;Form Password Input'apos;, 'apos;FAIL'apos;, 'apos;Saisie mot de passe non fonctionnelle'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Auth Forms Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthResponsive(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Test mobile
      await this.page!.setViewport({ width: 375, height: 667 });
      await this.page!.waitForTimeout(1000);
      
      const mobileElements = await this.page!.evaluate(() => {
        const form = document.querySelector('apos;form'apos;);
        return {
          formVisible: form ? form.offsetWidth > 0 : false,
          formHeight: form ? form.offsetHeight : 0
        };
      });

      if (mobileElements.formVisible) {
        await this.addResult('apos;Mobile Responsive'apos;, 'apos;PASS'apos;, 'apos;Formulaire visible sur mobile'apos;);
      } else {
        await this.addResult('apos;Mobile Responsive'apos;, 'apos;FAIL'apos;, 'apos;Formulaire non visible sur mobile'apos;);
      }

      // Test tablet
      await this.page!.setViewport({ width: 768, height: 1024 });
      await this.page!.waitForTimeout(1000);
      
      const tabletElements = await this.page!.evaluate(() => {
        const form = document.querySelector('apos;form'apos;);
        return {
          formVisible: form ? form.offsetWidth > 0 : false
        };
      });

      if (tabletElements.formVisible) {
        await this.addResult('apos;Tablet Responsive'apos;, 'apos;PASS'apos;, 'apos;Formulaire visible sur tablette'apos;);
      } else {
        await this.addResult('apos;Tablet Responsive'apos;, 'apos;FAIL'apos;, 'apos;Formulaire non visible sur tablette'apos;);
      }

      // Remettre la vue desktop
      await this.page!.setViewport({ width: 1280, height: 720 });

    } catch (error) {
      await this.addResult('apos;Auth Responsive Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthPerformance(baseUrl: string) {
    try {
      const startTime = Date.now();
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      const loadTime = Date.now() - startTime;

      if (loadTime < 3000) {
        await this.addResult('apos;Auth Page Load Time'apos;, 'apos;PASS'apos;, `Temps de chargement: ${loadTime}ms`);
      } else if (loadTime < 5000) {
        await this.addResult('apos;Auth Page Load Time'apos;, 'apos;WARNING'apos;, `Temps de chargement lent: ${loadTime}ms`);
      } else {
        await this.addResult('apos;Auth Page Load Time'apos;, 'apos;FAIL'apos;, `Temps de chargement très lent: ${loadTime}ms`);
      }

    } catch (error) {
      await this.addResult('apos;Auth Performance Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthAccessibility(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Vérifier les labels
      const emailLabel = await this.page!.evaluate(() => {
        const emailInput = document.querySelector('apos;input[type="email"]'apos;);
        const label = emailInput?.getAttribute('apos;aria-label'apos;) || 
                     document.querySelector(`label[for="${emailInput?.id}"]`)?.textContent;
        return label;
      });

      const passwordLabel = await this.page!.evaluate(() => {
        const passwordInput = document.querySelector('apos;input[type="password"]'apos;);
        const label = passwordInput?.getAttribute('apos;aria-label'apos;) || 
                     document.querySelector(`label[for="${passwordInput?.id}"]`)?.textContent;
        return label;
      });

      if (emailLabel) {
        await this.addResult('apos;Email Label Accessibility'apos;, 'apos;PASS'apos;, 'apos;Label email présent'apos;);
      } else {
        await this.addResult('apos;Email Label Accessibility'apos;, 'apos;WARNING'apos;, 'apos;Label email manquant'apos;);
      }

      if (passwordLabel) {
        await this.addResult('apos;Password Label Accessibility'apos;, 'apos;PASS'apos;, 'apos;Label mot de passe présent'apos;);
      } else {
        await this.addResult('apos;Password Label Accessibility'apos;, 'apos;WARNING'apos;, 'apos;Label mot de passe manquant'apos;);
      }

      // Vérifier la navigation au clavier
      await this.page!.keyboard.press('apos;Tab'apos;);
      await this.page!.waitForTimeout(500);
      
      const focusedElement = await this.page!.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName.toLowerCase();
      });

      if (focusedElement === 'apos;input'apos;) {
        await this.addResult('apos;Keyboard Navigation'apos;, 'apos;PASS'apos;, 'apos;Navigation clavier fonctionnelle'apos;);
      } else {
        await this.addResult('apos;Keyboard Navigation'apos;, 'apos;WARNING'apos;, 'apos;Navigation clavier non testée'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Auth Accessibility Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthSecurity(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'apos;networkidle2'apos; });
      
      // Vérifier que les mots de passe sont masqués
      const passwordInput = await this.page!.$('apos;input[type="password"]'apos;);
      if (passwordInput) {
        const type = await this.page!.evaluate(el => el.getAttribute('apos;type'apos;), passwordInput);
        if (type === 'apos;password'apos;) {
          await this.addResult('apos;Password Field Security'apos;, 'apos;PASS'apos;, 'apos;Champ mot de passe sécurisé'apos;);
        } else {
          await this.addResult('apos;Password Field Security'apos;, 'apos;FAIL'apos;, 'apos;Champ mot de passe non sécurisé'apos;);
        }
      }

      // Vérifier HTTPS (si disponible)
      const protocol = this.page!.url().split('apos;://'apos;)[0];
      if (protocol === 'apos;https'apos;) {
        await this.addResult('apos;HTTPS Security'apos;, 'apos;PASS'apos;, 'apos;Connexion HTTPS active'apos;);
      } else {
        await this.addResult('apos;HTTPS Security'apos;, 'apos;WARNING'apos;, 'apos;Connexion non-HTTPS'apos;);
      }

    } catch (error) {
      await this.addResult('apos;Auth Security Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }

  private async testAuthUserJourney(baseUrl: string) {
    try {
      // Test du parcours complet : Accueil -> Inscription -> Connexion
      await this.page!.goto(baseUrl, { waitUntil: 'apos;networkidle2'apos; });
      
      // Cliquer sur Inscription
      const signUpLink = await this.page!.$('apos;a[href="/auth/signup"]'apos;);
      if (signUpLink) {
        await signUpLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'apos;networkidle2'apos; });
        
        // Remplir le formulaire d'apos;inscription
        await this.page!.type('apos;input[name="name"]'apos;, 'apos;Test User'apos;);
        await this.page!.type('apos;input[type="email"]'apos;, 'apos;test@example.com'apos;);
        await this.page!.type('apos;input[name="password"]'apos;, 'apos;password123'apos;);
        await this.page!.type('apos;input[name="confirmPassword"]'apos;, 'apos;password123'apos;);
        
        await this.addResult('apos;Sign Up Form Fill'apos;, 'apos;PASS'apos;, 'apos;Formulaire d\'apos;inscription rempli'apos;);
        
        // Retourner à la connexion
        const signInLink = await this.page!.$('apos;a[href="/auth/signin"]'apos;);
        if (signInLink) {
          await signInLink.click();
          await this.page!.waitForNavigation({ waitUntil: 'apos;networkidle2'apos; });
          
          await this.addResult('apos;User Journey Navigation'apos;, 'apos;PASS'apos;, 'apos;Navigation entre pages réussie'apos;);
        }
      }

    } catch (error) {
      await this.addResult('apos;Auth User Journey Test'apos;, 'apos;FAIL'apos;, `Erreur: ${error}`);
    }
  }
}

export async function runAuthQA(url: string): Promise<AuthQAReport> {
  const authQABot = new AuthQABot();
  return await authQABot.runAuthQA(url);
}
