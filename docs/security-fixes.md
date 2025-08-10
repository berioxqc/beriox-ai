# Plan d'Action - Correction des Problèmes de Sécurité

## 🚨 Problèmes Critiques Identifiés

### 1. Variables d'Environnement Sensibles
**Problème** : Les clés sensibles sont exposées dans le fichier .env
**Impact** : Compromission complète de la sécurité
**Solution** : Créer un fichier .env.example et documenter la configuration

### 2. Routes API Sans Authentification
**Problème** : 15 routes API accessibles sans authentification
**Impact** : Accès non autorisé aux données
**Solution** : Ajouter l'authentification sur toutes les routes sensibles

## 🔧 Corrections Immédiates

### 1. Créer .env.example
```bash
# Copier le fichier .env actuel
cp .env .env.example

# Remplacer les vraies valeurs par des placeholders
sed -i '' 's/=.*/=YOUR_VALUE_HERE/g' .env.example
```

### 2. Ajouter l'authentification aux routes API

#### Route: `/api/agents/config/route.ts`
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  
  // ... reste du code
}
```

#### Route: `/api/analytics/callback/route.ts`
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  
  // ... reste du code
}
```

### 3. Ajouter la validation des données

#### Utiliser Zod pour la validation
```typescript
import { z } from "zod";

const missionSchema = z.object({
  prompt: z.string().min(1).max(1000),
  details: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = missionSchema.parse(body);
    
    // ... reste du code
  } catch (error) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}
```

## 📋 Liste des Routes à Corriger

### Routes Critiques (Authentification requise)
- [ ] `/api/agents/config/route.ts`
- [ ] `/api/analytics/callback/route.ts`
- [ ] `/api/missions/[id]/briefs/route.ts`
- [ ] `/api/missions/[id]/deliverables/route.ts`
- [ ] `/api/missions/[id]/regenerate-report/route.ts`
- [ ] `/api/missions/[id]/report/route.ts`
- [ ] `/api/missions/[id]/restart-agent/route.ts`
- [ ] `/api/user/profile/route.ts`

### Routes Publiques (Authentification optionnelle)
- [ ] `/api/health/route.ts` - Endpoint de santé
- [ ] `/api/stripe/webhook/route.ts` - Webhook Stripe (signature requise)
- [ ] `/api/stt/route.ts` - Speech-to-text

### Routes Admin (Authentification + Rôle admin)
- [ ] `/api/admin/coupons/route.ts`
- [ ] `/api/admin/premium-access/route.ts`

## 🛡️ Améliorations de Sécurité

### 1. Middleware d'Authentification
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Routes protégées
  const protectedRoutes = [
    '/api/missions',
    '/api/user',
    '/api/admin',
    '/api/agents'
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Vérifier l'authentification
    const token = request.cookies.get('next-auth.session-token');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 2. Validation Globale
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const validateRequest = async <T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> => {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    throw new Error('Données invalides');
  }
};
```

### 3. Rate Limiting
```typescript
// src/lib/rate-limit.ts
import { NextResponse } from 'next/server';

const rateLimit = new Map();

export function checkRateLimit(ip: string, limit: number = 100, window: number = 60000) {
  const now = Date.now();
  const windowStart = now - window;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter((time: number) => time > windowStart);
  rateLimit.set(ip, requests);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  return true;
}
```

## 🎯 Priorités d'Implémentation

### Phase 1 (Critique - À faire immédiatement)
1. ✅ Créer .env.example
2. 🔄 Ajouter authentification aux routes critiques
3. 🔄 Implémenter validation Zod

### Phase 2 (Important - Cette semaine)
1. 🔄 Middleware d'authentification
2. 🔄 Rate limiting
3. 🔄 Validation globale

### Phase 3 (Amélioration - Prochaine semaine)
1. 🔄 Audit de sécurité automatisé
2. 🔄 Monitoring des tentatives d'intrusion
3. 🔄 Chiffrement des données sensibles

## 📊 Métriques de Succès

- [ ] Score de sécurité > 80/100
- [ ] 0 problème critique
- [ ] Toutes les routes protégées
- [ ] Validation des données sur 100% des endpoints
- [ ] Tests de sécurité automatisés

## 🔍 Tests de Sécurité

### Tests à Implémenter
```bash
# Test d'authentification
curl -X GET http://localhost:3000/api/missions
# Doit retourner 401

# Test de validation
curl -X POST http://localhost:3000/api/missions \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Doit retourner 400

# Test de rate limiting
for i in {1..101}; do
  curl -X GET http://localhost:3000/api/health
done
# Doit bloquer après 100 requêtes
```

## 🚀 Prochaines Étapes

1. **Immédiat** : Corriger les routes critiques
2. **Cette semaine** : Implémenter le middleware
3. **Prochaine semaine** : Tests de sécurité complets
4. **Mensuel** : Audit de sécurité automatisé
