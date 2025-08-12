# 🚨 TODO - ÉLÉMENTS DÉPRÉCIÉS À REMPLACER

## 📋 **PRIORITÉ HAUTE**

### 🔐 **NextAuth.js v4 → v5 (CRITIQUE)**
**Impact** : Sécurité et compatibilité
**Statut** : ❌ **DÉPRÉCIÉ** - NextAuth v4 n'est plus maintenu

**Fichiers à mettre à jour** :
- `src/lib/auth.ts` - Configuration principale
- `src/app/api/auth/[...nextauth]/route.ts` - Route API
- Tous les imports `next-auth/react` → `@auth/react`
- Tous les imports `next-auth/next` → `@auth/next`

**Actions requises** :
```bash
npm uninstall next-auth
npm install @auth/core @auth/next @auth/react
```

**Fichiers impactés** (50+ fichiers) :
- `src/app/competitors/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/Navigation.tsx`
- `src/components/AuthProvider.tsx`
- `src/hooks/useAuthGuard.tsx`
- Et 45+ autres fichiers...

---

### 🧪 **Jest Configuration (MOYENNE)**
**Impact** : Tests et CI/CD
**Statut** : ✅ **CORRIGÉ** - Options mises à jour

**Corrections appliquées** :
- `moduleNameMapping` → `moduleNameMapper` ✅
- `testURL` → `testEnvironmentOptions.url` ✅
- `timers` → `fakeTimers` ✅
- Suppression de `jest-junit` reporter ✅

---

## 📋 **PRIORITÉ MOYENNE**

### 🔧 **Rate Limiting (MOYENNE)**
**Impact** : Performance et sécurité
**Statut** : ⚠️ **À VÉRIFIER**

**Fichiers** :
- `src/lib/rate-limit.ts` - Utilise `legacyHeaders: false`

**Actions requises** :
- Vérifier si `legacyHeaders` est toujours nécessaire
- Mettre à jour vers les nouvelles options d'Express Rate Limit

---

### 🧪 **Test Utilities (FAIBLE)**
**Impact** : Tests
**Statut** : ⚠️ **À CORRIGER**

**Fichiers** :
- `jest.setup.js` - `addListener/removeListener` dépréciés
- `src/lib/testing/test-utils.tsx` - Mêmes méthodes dépréciées

**Actions requises** :
```javascript
// Remplacer
addListener: jest.fn(), // deprecated
removeListener: jest.fn(), // deprecated

// Par
on: jest.fn(),
off: jest.fn(),
```

---

## 📋 **PRIORITÉ FAIBLE**

### 📦 **Scripts Legacy (FAIBLE)**
**Impact** : Maintenance
**Statut** : ⚠️ **À NETTOYER**

**Fichiers** :
- `package.json` - Scripts `qa:legacy` et `security:legacy`

**Actions requises** :
- Supprimer ou renommer les scripts legacy
- Mettre à jour vers les nouvelles versions

---

### 📊 **Analytics (FAIBLE)**
**Impact** : Monitoring
**Statut** : ℹ️ **INFORMATION**

**Fichiers** :
- `GOOGLE_ANALYTICS_SETUP.md` - Mentionne "Tag Assistant Legacy"

**Actions requises** :
- Mettre à jour la documentation
- Recommander Google Tag Assistant (nouvelle version)

---

## 🚀 **PLAN D'ACTION RECOMMANDÉ**

### **Phase 1 - Critique (1-2 jours)**
1. **Migration NextAuth v4 → v5**
   - Sauvegarder la configuration actuelle
   - Installer les nouvelles dépendances
   - Mettre à jour tous les imports
   - Tester l'authentification complète

### **Phase 2 - Tests (1 jour)**
1. **Corriger les test utilities**
   - Mettre à jour `jest.setup.js`
   - Mettre à jour `test-utils.tsx`
   - Vérifier que tous les tests passent

### **Phase 3 - Nettoyage (1 jour)**
1. **Supprimer les éléments legacy**
   - Nettoyer les scripts dépréciés
   - Mettre à jour la documentation
   - Vérifier le rate limiting

---

## 📊 **IMPACT ESTIMÉ**

| Élément | Impact | Effort | Risque | Priorité |
|---------|--------|--------|--------|----------|
| NextAuth v4→v5 | 🔴 **CRITIQUE** | 2 jours | 🔴 **ÉLEVÉ** | **URGENT** |
| Jest Config | 🟡 **MOYEN** | 2h | 🟢 **FAIBLE** | ✅ **TERMINÉ** |
| Test Utils | 🟡 **MOYEN** | 4h | 🟢 **FAIBLE** | **HAUTE** |
| Rate Limiting | 🟡 **MOYEN** | 2h | 🟡 **MOYEN** | **MOYENNE** |
| Scripts Legacy | 🟢 **FAIBLE** | 1h | 🟢 **FAIBLE** | **FAIBLE** |

---

## 🔍 **COMMANDES DE VÉRIFICATION**

```bash
# Vérifier les dépendances dépréciées
npm audit

# Vérifier les warnings Jest
npm run test

# Vérifier les imports NextAuth
grep -r "next-auth" src/

# Vérifier les éléments legacy
grep -r "legacy\|deprecated" src/
```

---

## 📝 **NOTES IMPORTANTES**

1. **NextAuth v5** est une réécriture majeure - nécessite une migration complète
2. **Tester exhaustivement** après chaque changement
3. **Sauvegarder** avant chaque modification majeure
4. **Documenter** les changements pour l'équipe

---

**Dernière mise à jour** : 12 août 2025
**Statut global** : 🟡 **EN COURS** - 1/5 éléments critiques corrigés
