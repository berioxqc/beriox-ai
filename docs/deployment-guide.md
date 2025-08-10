# 🚀 Guide de Déploiement Beriox AI

## 📊 Architecture Recommandée

### Option 1 : **Vercel + Supabase** (Recommandée - Simple)
- **Frontend/API :** Vercel (Next.js natif)
- **Database :** Supabase PostgreSQL (gratuit jusqu'à 500MB)
- **Redis :** Upstash Redis (gratuit jusqu'à 10k requêtes/jour)
- **Storage :** Vercel Blob ou Supabase Storage
- **Monitoring :** Vercel Analytics + Sentry

**Coût estimé :** 0-50€/mois selon le trafic

### Option 2 : **Railway** (All-in-One)
- **Application complète :** Railway
- **Database :** PostgreSQL inclus
- **Redis :** Inclus
- **Déploiement :** Git-based automatique

**Coût estimé :** 20-80€/mois

### Option 3 : **DigitalOcean Droplet** (Plus de contrôle)
- **Serveur :** Droplet 4GB RAM (24€/mois)
- **Database :** Managed PostgreSQL (15€/mois)
- **Redis :** Managed Redis (15€/mois)
- **Load Balancer :** Si nécessaire (12€/mois)

**Coût estimé :** 40-100€/mois

## 🎯 Plan de Déploiement Recommandé

### Phase 1 : Déploiement MVP (Vercel + Supabase)

```bash
# 1. Préparer l'environnement
npm run build  # Vérifier que tout compile

# 2. Setup Supabase
# - Créer projet sur supabase.com
# - Récupérer DATABASE_URL
# - Configurer les variables d'environnement

# 3. Setup Vercel
# - Connecter le repo GitHub
# - Configurer les variables d'environnement
# - Déployer automatiquement
```

### Variables d'Environnement Requises

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Pour Prisma migrations

# NextAuth
NEXTAUTH_URL="https://votre-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Redis (Upstash)
REDIS_URL="redis://..."

# APIs externes
GOOGLE_PAGESPEED_API_KEY="your-key"
GOOGLE_ANALYTICS_CLIENT_ID="your-client-id"
GOOGLE_ANALYTICS_CLIENT_SECRET="your-client-secret"
GOOGLE_ANALYTICS_REDIRECT_URI="https://votre-app.vercel.app/api/analytics/callback"
```

## 🔧 Optimisations pour la Production

### 1. Performance
```typescript
// next.config.js
const nextConfig = {
  // Optimizations
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Compression
  compress: true,
  
  // Images
  images: {
    domains: ['lh3.googleusercontent.com'], // Pour les avatars Google
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de sécurité
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ],
}
```

### 2. Base de Données
```sql
-- Indexes pour performance
CREATE INDEX idx_missions_user_id ON "Mission"("userId");
CREATE INDEX idx_missions_status ON "Mission"("status");
CREATE INDEX idx_missions_created_at ON "Mission"("createdAt");
CREATE INDEX idx_briefs_mission_id ON "Brief"("missionId");
CREATE INDEX idx_deliverables_mission_id ON "Deliverable"("missionId");

-- Nettoyage automatique (optionnel)
-- Supprimer les missions anciennes après 6 mois
CREATE OR REPLACE FUNCTION cleanup_old_missions()
RETURNS void AS $$
BEGIN
  DELETE FROM "Mission" 
  WHERE "createdAt" < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
```

### 3. Monitoring
```typescript
// lib/monitoring.ts
import { Sentry } from '@sentry/nextjs';

export const trackEvent = (event: string, data?: any) => {
  // Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, data);
  }
  
  // Sentry pour les erreurs
  if (data?.error) {
    Sentry.captureException(data.error);
  }
};
```

## 💰 Système de Paiement (Stripe)

### Setup Stripe
```bash
npm install stripe @stripe/stripe-js
```

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Plans disponibles
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['3 missions/mois', 'Agents de base'],
    bots: ['KarineAI', 'HugoAI', 'JPBot', 'ElodieAI']
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: 'price_xxx', // Stripe Price ID
    features: ['50 missions/mois', 'Tous les agents', 'APIs externes'],
    bots: ['all']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: 'price_yyy',
    features: ['Illimité', 'Support prioritaire', 'Intégrations custom'],
    bots: ['all', 'custom']
  }
};
```

## 📦 Script de Déploiement

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement Beriox AI..."

# 1. Tests
echo "🧪 Lancement des tests..."
npm run test

# 2. Build
echo "🏗️ Build de l'application..."
npm run build

# 3. Migration DB
echo "🗄️ Migration de la base de données..."
npx prisma migrate deploy

# 4. Seed des données (si nécessaire)
echo "🌱 Seed des données..."
npx prisma db seed

# 5. Déploiement
echo "📤 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé !"
```

## 🔐 Sécurité

### Variables Sensibles
- Utiliser Vercel Secrets ou Railway Variables
- Rotation des clés API tous les 3 mois
- Monitoring des accès avec Sentry

### Rate Limiting
```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requêtes par minute
});
```

## 📊 Monitoring de Production

### Métriques Importantes
- **Performance :** Temps de réponse API < 2s
- **Disponibilité :** Uptime > 99.9%
- **Erreurs :** Taux d'erreur < 1%
- **Usage :** Missions créées/jour, agents utilisés

### Alertes Automatiques
```typescript
// lib/alerts.ts
export const sendAlert = async (type: 'error' | 'warning', message: string) => {
  // Slack webhook
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Beriox AI Alert [${type.toUpperCase()}]: ${message}`
    })
  });
};
```

## 🎯 Checklist de Déploiement

### Avant le Déploiement
- [ ] Tests passent (unit + integration)
- [ ] Build sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] DNS configuré
- [ ] SSL activé

### Après le Déploiement
- [ ] Tests de smoke en production
- [ ] Monitoring activé
- [ ] Alertes configurées
- [ ] Backup automatique DB
- [ ] Documentation mise à jour

## 💡 Conseils d'Optimisation

### 1. **Commencer Simple**
- Déployer d'abord avec les agents de base
- Ajouter progressivement les APIs externes
- Monitorer les performances

### 2. **Scaling Progressif**
- Gratuit → Pro → Enterprise
- Ajouter Redis quand nécessaire
- Optimiser les requêtes DB selon l'usage

### 3. **Backup Strategy**
- Backup quotidien de la DB
- Versioning des déploiements
- Rollback automatique en cas d'erreur

---

**Résumé :** Avec Vercel + Supabase, ton "monstre" sera déployé en 30 minutes et coûtera quasi rien au début ! 🎉
