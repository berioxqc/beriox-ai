# 🚀 Lignes Directrices de Développement - Beriox AI

## 📋 **Règles Fondamentales**

### 1. **Priorité : Fonctionnalité > Perfection**
- ✅ **FONCTIONNEL** avant tout
- ✅ **DÉPLOYABLE** en production
- ✅ **STABLE** et fiable
- ❌ Pas de refactoring inutile
- ❌ Pas d'optimisation prématurée

### 2. **Stratégie de Développement**
```
1. Test local → 2. Commit → 3. Push → 4. Déploiement Vercel → 5. Test production
```

### 3. **Gestion des Erreurs**
- **Erreurs critiques** : Corriger immédiatement
- **Warnings** : Ignorer temporairement (ESLint désactivé)
- **Problèmes de base de données** : Utiliser JWT au lieu de Prisma
- **Conflits de dépendances** : Downgrader vers version stable

## 🔧 **Configuration Technique**

### **Authentification**
```typescript
// ✅ UTILISER : JWT Strategy (pas de base de données)
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
}

// ❌ ÉVITER : PrismaAdapter (problèmes de DB)
// adapter: PrismaAdapter(prisma),
```

### **Pages et Composants**
```typescript
// ✅ UTILISER : Pages autonomes
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Contenu direct */}
    </div>
  )
}

// ❌ ÉVITER : Dépendances complexes
// <Layout><AuthGuard>{children}</AuthGuard></Layout>
```

### **Dépendances**
```json
// ✅ VERSIONS STABLES
"nodemailer": "6.10.1",
"next-auth": "^4.24.11"

// ❌ ÉVITER : Versions récentes instables
"nodemailer": "^7.0.5"
```

## 🚫 **Interdictions Strictes**

### **Ne JAMAIS faire :**
1. **Modifier ESLint** pendant le développement
2. **Utiliser Prisma** pour l'authentification
3. **Créer des scripts auto-fix** complexes
4. **Refactorer** du code qui fonctionne
5. **Ajouter des dépendances** non essentielles
6. **Modifier la configuration** Next.js/Vercel
7. **Utiliser des composants** avec dépendances multiples

### **Ne JAMAIS toucher :**
- `eslint.config.mjs`
- `next.config.js`
- `vercel.json`
- `package.json` (sauf versions critiques)
- `.npmrc`

## ✅ **Bonnes Pratiques**

### **Structure des Pages**
```typescript
"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Icon from "@/components/ui/Icon"

export default function PageName() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  // 1. Gestion des états de chargement
  if (loading || status === 'loading') {
    return <LoadingComponent />
  }

  // 2. Gestion de l'authentification
  if (status === 'unauthenticated') {
    return <AuthRequiredComponent />
  }

  // 3. Contenu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Contenu */}
    </div>
  )
}
```

### **Gestion des Erreurs**
```typescript
// ✅ Gestion simple des erreurs
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    console.error('Erreur API:', response.status)
    return
  }
  const data = await response.json()
} catch (error) {
  console.error('Erreur:', error)
  // Continuer sans planter
}
```

### **Styles et Design**
```typescript
// ✅ Classes Tailwind cohérentes
className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"

// ✅ Couleurs cohérentes
// Purple: from-purple-600 to-purple-700
// Blue: from-blue-600 to-blue-700
// Background: from-purple-900 via-blue-900 to-indigo-900
```

## 🔄 **Workflow de Développement**

### **1. Avant de commencer**
```bash
# Vérifier l'état actuel
git status
npm run dev  # Tester localement
```

### **2. Développement**
```bash
# Modifier le code
# Tester localement sur http://localhost:3000
# Vérifier que ça fonctionne
```

### **3. Commit et Push**
```bash
git add .
git commit -m "🔧 Fix: Description claire du changement"
git push
```

### **4. Déploiement**
```bash
vercel --prod
```

### **5. Test Production**
```bash
# Vérifier l'URL de déploiement
# Tester les fonctionnalités critiques
```

## 🚨 **Signaux d'Alerte**

### **Arrêter immédiatement si :**
- ❌ Build échoue
- ❌ Erreurs de base de données
- ❌ Conflits de dépendances
- ❌ Pages blanches
- ❌ Authentification cassée

### **Actions immédiates :**
1. **Revert** du dernier commit
2. **Rollback** vers version stable
3. **Diagnostic** du problème
4. **Correction** minimale
5. **Test** avant de continuer

## 📝 **Documentation**

### **Fichiers à maintenir :**
- `TODO.md` - Tâches et priorités
- `DEVELOPMENT_GUIDELINES.md` - Ce fichier
- `GOOGLE_OAUTH_SETUP.md` - Configuration OAuth
- `README.md` - Instructions générales

### **Logs et Debug**
```typescript
// ✅ Logs utiles
console.log("🔐 Connexion:", user.email)
console.log("📊 Données reçues:", data)

// ❌ Logs verbeux
console.log("Debug complet:", { user, session, token, ... })
```

## 🎯 **Objectifs Prioritaires**

### **Phase 1 : Stabilité** ✅
- [x] Déploiement Vercel fonctionnel
- [x] Authentification Google basique
- [x] Pages principales accessibles
- [x] Pas d'erreurs critiques

### **Phase 2 : Fonctionnalités** 🔄
- [ ] Pages publiques sans authentification
- [ ] Interface utilisateur cohérente
- [ ] Navigation fluide
- [ ] Performance acceptable

### **Phase 3 : Optimisation** ⏳
- [ ] Réactivation ESLint
- [ ] Nettoyage du code
- [ ] Tests automatisés
- [ ] Documentation complète

## 🚀 **Commandes Rapides**

```bash
# Démarrage rapide
npm run dev

# Déploiement rapide
git add . && git commit -m "🔧 Fix" && git push && vercel --prod

# Rollback rapide
git reset --hard HEAD~1 && git push --force

# Nettoyage
pkill -f "next dev"
```

---

**⚠️ RÈGLE D'OR : Si ça fonctionne, ne le cassez pas !**

**🎯 OBJECTIF : Application déployée et fonctionnelle en production**
