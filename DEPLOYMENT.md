# 🚀 Guide de Déploiement - Beriox AI

## 📋 Prérequis

### **Environnement de Production**
- **Node.js** : Version 18+ (recommandé 20+)
- **PostgreSQL** : Version 14+ (recommandé 15+)
- **Redis** : Version 6+ (optionnel, pour le cache)
- **SMTP** : Serveur SMTP pour les emails (Gmail, SendGrid, etc.)

### **Services Externes**
- **Vercel** : Déploiement et hosting
- **Stripe** : Paiements et abonnements
- **NextAuth.js** : Authentification
- **Google Analytics** : Analytics et tracking

## 🔧 Configuration

### **1. Variables d'Environnement**

Créer un fichier `.env.local` avec les variables suivantes :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/beriox"

# NextAuth.js
NEXTAUTH_URL="https://beriox-ai.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="support@beriox.ai"
SMTP_PASS="your-app-password"

# Redis (optionnel)
REDIS_URL="redis://localhost:6379"

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### **2. Base de Données**

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# (Optionnel) Créer une migration
npx prisma migrate dev --name init
```

### **3. Installation des Dépendances**

```bash
# Installer les dépendances
npm install

# Vérifier les vulnérabilités
npm audit

# Construire l'application
npm run build
```

## 🚀 Déploiement sur Vercel

### **1. Configuration Vercel**

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Définir les paramètres de build :
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
   - **Install Command** : `npm install`

### **2. Variables d'Environnement Vercel**

Ajouter toutes les variables d'environnement dans l'interface Vercel :
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

### **3. Déploiement**

```bash
# Déployer sur Vercel
vercel --prod

# Ou via Git
git push origin main
```

## 🔒 Sécurité

### **1. Headers de Sécurité**

L'application inclut automatiquement :
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

### **2. Rate Limiting**

Le middleware inclut un rate limiting configuré :
- 100 requêtes par minute par IP
- 1000 requêtes par heure par utilisateur

### **3. Validation des Données**

- Validation Zod pour tous les formulaires
- Sanitisation des inputs
- Protection CSRF

## 📊 Monitoring

### **1. Vercel Analytics**

Activer Vercel Analytics pour :
- Performance des pages
- Erreurs et exceptions
- Métriques utilisateur

### **2. Logs**

```bash
# Voir les logs Vercel
vercel logs

# Logs en temps réel
vercel logs --follow
```

### **3. Métriques de Performance**

- Core Web Vitals
- Temps de réponse API
- Utilisation base de données
- Taux d'erreur

## 🔧 Maintenance

### **1. Mises à Jour**

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit fix

# Redéployer
vercel --prod
```

### **2. Sauvegarde Base de Données**

```bash
# Sauvegarde PostgreSQL
pg_dump beriox > backup_$(date +%Y%m%d).sql

# Restauration
psql beriox < backup_20241201.sql
```

### **3. Optimisations**

```bash
# Analyser les performances
npm run analyze

# Optimiser les images
npm run optimize-images

# Vérifier la taille du bundle
npm run build:analyze
```

## 🚨 Troubleshooting

### **Erreurs Courantes**

1. **Erreur de connexion base de données**
   - Vérifier `DATABASE_URL`
   - Vérifier les permissions PostgreSQL

2. **Erreur d'authentification**
   - Vérifier `NEXTAUTH_SECRET`
   - Vérifier les OAuth providers

3. **Erreur d'envoi d'email**
   - Vérifier la configuration SMTP
   - Vérifier les credentials

4. **Erreur Stripe**
   - Vérifier les clés API Stripe
   - Vérifier les webhooks

### **Logs de Debug**

```bash
# Activer les logs détaillés
DEBUG=* npm run dev

# Logs Prisma
DEBUG=prisma:* npm run dev
```

## 📈 Performance

### **Optimisations Implémentées**

- ✅ **Index de base de données** : 150+ index pour optimiser les requêtes
- ✅ **Code splitting** : Chargement à la demande des composants
- ✅ **Optimisation des images** : Next.js Image avec formats modernes
- ✅ **Cache Redis** : Cache des données fréquentes
- ✅ **CDN Vercel** : Distribution globale du contenu

### **Métriques Cibles**

- **LCP** : < 2.5s
- **FID** : < 100ms
- **CLS** : < 0.1
- **TTFB** : < 600ms
- **Bundle Size** : < 500KB

## 🎯 Checklist de Déploiement

### **Avant le Déploiement**
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Tests passés
- [ ] Build réussi
- [ ] Sécurité vérifiée

### **Après le Déploiement**
- [ ] Site accessible
- [ ] Authentification fonctionnelle
- [ ] Emails envoyés
- [ ] Paiements Stripe
- [ ] Analytics actifs
- [ ] Monitoring configuré

### **Post-Déploiement**
- [ ] Sauvegarde automatique
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Équipe formée

## 📞 Support

Pour toute question ou problème :
- **Email** : support@beriox.ai
- **Documentation** : https://docs.beriox.ai
- **GitHub Issues** : https://github.com/beriox-ai/issues

---

**Beriox AI** - Votre équipe d'agents IA intelligents 🤖
