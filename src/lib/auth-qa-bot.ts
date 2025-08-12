import puppeteer from 'puppeteer';

interface AuthQAResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    
    // Configuration de la page
    await this.page.setViewport({ width: 1280, height: 720 });
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Intercepter les erreurs console
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async addResult(test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
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
      
      console.log('🔐 Démarrage du QA Bot d\'Authentification...');
      
      // Tests de la page d'accueil
      await this.testHomepage(baseUrl);
      
      // Tests des pages d'authentification
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
      
      // Tests d'accessibilité
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
          passed: this.results.filter(r => r.status === 'PASS').length,
          failed: this.results.filter(r => r.status === 'FAIL').length,
          warnings: this.results.filter(r => r.status === 'WARNING').length,
          totalDuration
        }
      };
    } finally {
      await this.cleanup();
    }
  }

  private async testHomepage(baseUrl: string) {
    try {
      await this.page!.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Vérifier que la page se charge
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Homepage Load', 'PASS', 'Page d\'accueil chargée avec succès');
      } else {
        await this.addResult('Homepage Load', 'FAIL', `Titre incorrect: ${title}`);
      }

      // Vérifier les liens d'authentification
      const signInLink = await this.page!.$('a[href="/auth/signin"]');
      const signUpLink = await this.page!.$('a[href="/auth/signup"]');
      
      if (signInLink) {
        await this.addResult('Sign In Link', 'PASS', 'Lien de connexion présent');
      } else {
        await this.addResult('Sign In Link', 'FAIL', 'Lien de connexion manquant');
      }
      
      if (signUpLink) {
        await this.addResult('Sign Up Link', 'PASS', 'Lien d\'inscription présent');
      } else {
        await this.addResult('Sign Up Link', 'FAIL', 'Lien d\'inscription manquant');
      }

      // Vérifier que le contenu principal s'affiche
      const heroText = await this.page!.$('h1');
      if (heroText) {
        const text = await this.page!.evaluate(el => el.textContent, heroText);
        if (text?.includes('agents IA')) {
          await this.addResult('Hero Content', 'PASS', 'Contenu principal affiché');
        } else {
          await this.addResult('Hero Content', 'WARNING', 'Contenu principal partiellement affiché');
        }
      } else {
        await this.addResult('Hero Content', 'FAIL', 'Contenu principal manquant');
      }

    } catch (error) {
      await this.addResult('Homepage Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testSignInPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      
      // Vérifier le titre
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Sign In Page Title', 'PASS', 'Page de connexion chargée');
      } else {
        await this.addResult('Sign In Page Title', 'FAIL', `Titre incorrect: ${title}`);
      }

      // Vérifier les éléments du formulaire
      const emailInput = await this.page!.$('input[type="email"]');
      const passwordInput = await this.page!.$('input[type="password"]');
      const submitButton = await this.page!.$('button[type="submit"]');
      const googleButton = await this.page!.$$('button');

      if (emailInput) {
        await this.addResult('Email Input', 'PASS', 'Champ email présent');
      } else {
        await this.addResult('Email Input', 'FAIL', 'Champ email manquant');
      }

      if (passwordInput) {
        await this.addResult('Password Input', 'PASS', 'Champ mot de passe présent');
      } else {
        await this.addResult('Password Input', 'FAIL', 'Champ mot de passe manquant');
      }

      if (submitButton) {
        await this.addResult('Submit Button', 'PASS', 'Bouton de soumission présent');
      } else {
        await this.addResult('Submit Button', 'FAIL', 'Bouton de soumission manquant');
      }

      // Vérifier le bouton Google
      const googleButtonText = await this.page!.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent?.includes('Google'));
      });
      
      if (googleButtonText) {
        await this.addResult('Google Button', 'PASS', 'Bouton Google présent');
      } else {
        await this.addResult('Google Button', 'WARNING', 'Bouton Google non trouvé');
      }

      // Vérifier les liens
      const forgotPasswordLink = await this.page!.$('a[href="/auth/forgot-password"]');
      const signUpLink = await this.page!.$('a[href="/auth/signup"]');

      if (forgotPasswordLink) {
        await this.addResult('Forgot Password Link', 'PASS', 'Lien mot de passe oublié présent');
      } else {
        await this.addResult('Forgot Password Link', 'FAIL', 'Lien mot de passe oublié manquant');
      }

      if (signUpLink) {
        await this.addResult('Sign Up Link on Sign In', 'PASS', 'Lien d\'inscription présent');
      } else {
        await this.addResult('Sign Up Link on Sign In', 'FAIL', 'Lien d\'inscription manquant');
      }

    } catch (error) {
      await this.addResult('Sign In Page Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testSignUpPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signup`, { waitUntil: 'networkidle2' });
      
      // Vérifier le titre
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Sign Up Page Title', 'PASS', 'Page d\'inscription chargée');
      } else {
        await this.addResult('Sign Up Page Title', 'FAIL', `Titre incorrect: ${title}`);
      }

      // Vérifier les éléments du formulaire
      const nameInput = await this.page!.$('input[name="name"]');
      const emailInput = await this.page!.$('input[type="email"]');
      const passwordInput = await this.page!.$('input[name="password"]');
      const confirmPasswordInput = await this.page!.$('input[name="confirmPassword"]');
      const submitButton = await this.page!.$('button[type="submit"]');

      if (nameInput) {
        await this.addResult('Name Input', 'PASS', 'Champ nom présent');
      } else {
        await this.addResult('Name Input', 'FAIL', 'Champ nom manquant');
      }

      if (emailInput) {
        await this.addResult('Sign Up Email Input', 'PASS', 'Champ email présent');
      } else {
        await this.addResult('Sign Up Email Input', 'FAIL', 'Champ email manquant');
      }

      if (passwordInput) {
        await this.addResult('Sign Up Password Input', 'PASS', 'Champ mot de passe présent');
      } else {
        await this.addResult('Sign Up Password Input', 'FAIL', 'Champ mot de passe manquant');
      }

      if (confirmPasswordInput) {
        await this.addResult('Confirm Password Input', 'PASS', 'Champ confirmation mot de passe présent');
      } else {
        await this.addResult('Confirm Password Input', 'FAIL', 'Champ confirmation mot de passe manquant');
      }

      if (submitButton) {
        await this.addResult('Sign Up Submit Button', 'PASS', 'Bouton de soumission présent');
      } else {
        await this.addResult('Sign Up Submit Button', 'FAIL', 'Bouton de soumission manquant');
      }

      // Vérifier le lien de connexion
      const signInLink = await this.page!.$('a[href="/auth/signin"]');
      if (signInLink) {
        await this.addResult('Sign In Link on Sign Up', 'PASS', 'Lien de connexion présent');
      } else {
        await this.addResult('Sign In Link on Sign Up', 'FAIL', 'Lien de connexion manquant');
      }

    } catch (error) {
      await this.addResult('Sign Up Page Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testForgotPasswordPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/forgot-password`, { waitUntil: 'networkidle2' });
      
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Forgot Password Page Title', 'PASS', 'Page mot de passe oublié chargée');
      } else {
        await this.addResult('Forgot Password Page Title', 'FAIL', `Titre incorrect: ${title}`);
      }

      const emailInput = await this.page!.$('input[type="email"]');
      const submitButton = await this.page!.$('button[type="submit"]');

      if (emailInput) {
        await this.addResult('Forgot Password Email Input', 'PASS', 'Champ email présent');
      } else {
        await this.addResult('Forgot Password Email Input', 'FAIL', 'Champ email manquant');
      }

      if (submitButton) {
        await this.addResult('Forgot Password Submit Button', 'PASS', 'Bouton de soumission présent');
      } else {
        await this.addResult('Forgot Password Submit Button', 'FAIL', 'Bouton de soumission manquant');
      }

    } catch (error) {
      await this.addResult('Forgot Password Page Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testResetPasswordPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/reset-password?token=test`, { waitUntil: 'networkidle2' });
      
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Reset Password Page Title', 'PASS', 'Page réinitialisation mot de passe chargée');
      } else {
        await this.addResult('Reset Password Page Title', 'FAIL', `Titre incorrect: ${title}`);
      }

      const passwordInput = await this.page!.$('input[name="password"]');
      const confirmPasswordInput = await this.page!.$('input[name="confirmPassword"]');
      const submitButton = await this.page!.$('button[type="submit"]');

      if (passwordInput) {
        await this.addResult('Reset Password Input', 'PASS', 'Champ mot de passe présent');
      } else {
        await this.addResult('Reset Password Input', 'FAIL', 'Champ mot de passe manquant');
      }

      if (confirmPasswordInput) {
        await this.addResult('Reset Confirm Password Input', 'PASS', 'Champ confirmation présent');
      } else {
        await this.addResult('Reset Confirm Password Input', 'FAIL', 'Champ confirmation manquant');
      }

      if (submitButton) {
        await this.addResult('Reset Password Submit Button', 'PASS', 'Bouton de soumission présent');
      } else {
        await this.addResult('Reset Password Submit Button', 'FAIL', 'Bouton de soumission manquant');
      }

    } catch (error) {
      await this.addResult('Reset Password Page Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testVerifyPage(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/verify?token=test`, { waitUntil: 'networkidle2' });
      
      const title = await this.page!.title();
      if (title.includes('Beriox AI')) {
        await this.addResult('Verify Page Title', 'PASS', 'Page de vérification chargée');
      } else {
        await this.addResult('Verify Page Title', 'FAIL', `Titre incorrect: ${title}`);
      }

      // Vérifier qu'il y a du contenu de vérification
      const content = await this.page!.evaluate(() => document.body.textContent);
      if (content?.includes('vérification') || content?.includes('verification')) {
        await this.addResult('Verify Page Content', 'PASS', 'Contenu de vérification présent');
      } else {
        await this.addResult('Verify Page Content', 'WARNING', 'Contenu de vérification non détecté');
      }

    } catch (error) {
      await this.addResult('Verify Page Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthNavigation(baseUrl: string) {
    try {
      // Test navigation depuis la page d'accueil
      await this.page!.goto(baseUrl, { waitUntil: 'networkidle2' });
      
      // Cliquer sur le lien de connexion
      const signInLink = await this.page!.$('a[href="/auth/signin"]');
      if (signInLink) {
        await signInLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
        
        const currentUrl = this.page!.url();
        if (currentUrl.includes('/auth/signin')) {
          await this.addResult('Navigation to Sign In', 'PASS', 'Navigation vers connexion réussie');
        } else {
          await this.addResult('Navigation to Sign In', 'FAIL', `URL incorrecte: ${currentUrl}`);
        }
      }

      // Test navigation vers l'inscription
      const signUpLink = await this.page!.$('a[href="/auth/signup"]');
      if (signUpLink) {
        await signUpLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
        
        const currentUrl = this.page!.url();
        if (currentUrl.includes('/auth/signup')) {
          await this.addResult('Navigation to Sign Up', 'PASS', 'Navigation vers inscription réussie');
        } else {
          await this.addResult('Navigation to Sign Up', 'FAIL', `URL incorrecte: ${currentUrl}`);
        }
      }

    } catch (error) {
      await this.addResult('Auth Navigation Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthForms(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      
      // Test remplissage du formulaire
      await this.page!.type('input[type="email"]', 'test@example.com');
      await this.page!.type('input[type="password"]', 'password123');
      
      const emailValue = await this.page!.evaluate(() => {
        const input = document.querySelector('input[type="email"]') as HTMLInputElement;
        return input?.value;
      });
      
      const passwordValue = await this.page!.evaluate(() => {
        const input = document.querySelector('input[type="password"]') as HTMLInputElement;
        return input?.value;
      });

      if (emailValue === 'test@example.com') {
        await this.addResult('Form Email Input', 'PASS', 'Saisie email fonctionnelle');
      } else {
        await this.addResult('Form Email Input', 'FAIL', 'Saisie email non fonctionnelle');
      }

      if (passwordValue === 'password123') {
        await this.addResult('Form Password Input', 'PASS', 'Saisie mot de passe fonctionnelle');
      } else {
        await this.addResult('Form Password Input', 'FAIL', 'Saisie mot de passe non fonctionnelle');
      }

    } catch (error) {
      await this.addResult('Auth Forms Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthResponsive(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      
      // Test mobile
      await this.page!.setViewport({ width: 375, height: 667 });
      await this.page!.waitForTimeout(1000);
      
      const mobileElements = await this.page!.evaluate(() => {
        const form = document.querySelector('form');
        return {
          formVisible: form ? form.offsetWidth > 0 : false,
          formHeight: form ? form.offsetHeight : 0
        };
      });

      if (mobileElements.formVisible) {
        await this.addResult('Mobile Responsive', 'PASS', 'Formulaire visible sur mobile');
      } else {
        await this.addResult('Mobile Responsive', 'FAIL', 'Formulaire non visible sur mobile');
      }

      // Test tablet
      await this.page!.setViewport({ width: 768, height: 1024 });
      await this.page!.waitForTimeout(1000);
      
      const tabletElements = await this.page!.evaluate(() => {
        const form = document.querySelector('form');
        return {
          formVisible: form ? form.offsetWidth > 0 : false
        };
      });

      if (tabletElements.formVisible) {
        await this.addResult('Tablet Responsive', 'PASS', 'Formulaire visible sur tablette');
      } else {
        await this.addResult('Tablet Responsive', 'FAIL', 'Formulaire non visible sur tablette');
      }

      // Remettre la vue desktop
      await this.page!.setViewport({ width: 1280, height: 720 });

    } catch (error) {
      await this.addResult('Auth Responsive Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthPerformance(baseUrl: string) {
    try {
      const startTime = Date.now();
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;

      if (loadTime < 3000) {
        await this.addResult('Auth Page Load Time', 'PASS', `Temps de chargement: ${loadTime}ms`);
      } else if (loadTime < 5000) {
        await this.addResult('Auth Page Load Time', 'WARNING', `Temps de chargement lent: ${loadTime}ms`);
      } else {
        await this.addResult('Auth Page Load Time', 'FAIL', `Temps de chargement très lent: ${loadTime}ms`);
      }

    } catch (error) {
      await this.addResult('Auth Performance Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthAccessibility(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      
      // Vérifier les labels
      const emailLabel = await this.page!.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        const label = emailInput?.getAttribute('aria-label') || 
                     document.querySelector(`label[for="${emailInput?.id}"]`)?.textContent;
        return label;
      });

      const passwordLabel = await this.page!.evaluate(() => {
        const passwordInput = document.querySelector('input[type="password"]');
        const label = passwordInput?.getAttribute('aria-label') || 
                     document.querySelector(`label[for="${passwordInput?.id}"]`)?.textContent;
        return label;
      });

      if (emailLabel) {
        await this.addResult('Email Label Accessibility', 'PASS', 'Label email présent');
      } else {
        await this.addResult('Email Label Accessibility', 'WARNING', 'Label email manquant');
      }

      if (passwordLabel) {
        await this.addResult('Password Label Accessibility', 'PASS', 'Label mot de passe présent');
      } else {
        await this.addResult('Password Label Accessibility', 'WARNING', 'Label mot de passe manquant');
      }

      // Vérifier la navigation au clavier
      await this.page!.keyboard.press('Tab');
      await this.page!.waitForTimeout(500);
      
      const focusedElement = await this.page!.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName.toLowerCase();
      });

      if (focusedElement === 'input') {
        await this.addResult('Keyboard Navigation', 'PASS', 'Navigation clavier fonctionnelle');
      } else {
        await this.addResult('Keyboard Navigation', 'WARNING', 'Navigation clavier non testée');
      }

    } catch (error) {
      await this.addResult('Auth Accessibility Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthSecurity(baseUrl: string) {
    try {
      await this.page!.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
      
      // Vérifier que les mots de passe sont masqués
      const passwordInput = await this.page!.$('input[type="password"]');
      if (passwordInput) {
        const type = await this.page!.evaluate(el => el.getAttribute('type'), passwordInput);
        if (type === 'password') {
          await this.addResult('Password Field Security', 'PASS', 'Champ mot de passe sécurisé');
        } else {
          await this.addResult('Password Field Security', 'FAIL', 'Champ mot de passe non sécurisé');
        }
      }

      // Vérifier HTTPS (si disponible)
      const protocol = this.page!.url().split('://')[0];
      if (protocol === 'https') {
        await this.addResult('HTTPS Security', 'PASS', 'Connexion HTTPS active');
      } else {
        await this.addResult('HTTPS Security', 'WARNING', 'Connexion non-HTTPS');
      }

    } catch (error) {
      await this.addResult('Auth Security Test', 'FAIL', `Erreur: ${error}`);
    }
  }

  private async testAuthUserJourney(baseUrl: string) {
    try {
      // Test du parcours complet : Accueil -> Inscription -> Connexion
      await this.page!.goto(baseUrl, { waitUntil: 'networkidle2' });
      
      // Cliquer sur Inscription
      const signUpLink = await this.page!.$('a[href="/auth/signup"]');
      if (signUpLink) {
        await signUpLink.click();
        await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Remplir le formulaire d'inscription
        await this.page!.type('input[name="name"]', 'Test User');
        await this.page!.type('input[type="email"]', 'test@example.com');
        await this.page!.type('input[name="password"]', 'password123');
        await this.page!.type('input[name="confirmPassword"]', 'password123');
        
        await this.addResult('Sign Up Form Fill', 'PASS', 'Formulaire d\'inscription rempli');
        
        // Retourner à la connexion
        const signInLink = await this.page!.$('a[href="/auth/signin"]');
        if (signInLink) {
          await signInLink.click();
          await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
          
          await this.addResult('User Journey Navigation', 'PASS', 'Navigation entre pages réussie');
        }
      }

    } catch (error) {
      await this.addResult('Auth User Journey Test', 'FAIL', `Erreur: ${error}`);
    }
  }
}

export async function runAuthQA(url: string): Promise<AuthQAReport> {
  const authQABot = new AuthQABot();
  return await authQABot.runAuthQA(url);
}
