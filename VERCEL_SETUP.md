# 🚀 Guide de Configuration Vercel pour Beriox AI

## 📋 Variables d'environnement OBLIGATOIRES

### 1. **Authentification NextAuth**
```bash
NEXTAUTH_SECRET=votre_secret_tres_long_et_complexe_au_moins_32_caracteres
NEXTAUTH_URL=https://beriox-4ttsa32vo-beriox.vercel.app
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
```

### 2. **Base de données**
```bash
DATABASE_URL=votre_url_postgresql_ou_sqlite
```

## 📋 Variables d'environnement OPTIONNELLES

### 3. **OpenAI (pour les agents IA)**
```bash
OPENAI_API_KEY=sk-votre_cle_api_openai
```

### 4. **Stripe (pour les paiements)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### 5. **Email (Resend)**
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=votre_cle_resend
EMAIL_DEFAULT_TO=admin@beriox.ai
```

### 6. **Monitoring (Sentry)**
```bash
SENTRY_DSN=votre_dsn_sentry
NEXT_PUBLIC_SENTRY_DSN=votre_dsn_sentry_public
```

## 🔧 Étapes de configuration

### Étape 1 : Aller sur Vercel
1. Visitez https://vercel.com/beriox/beriox-ai/settings/environment-variables
2. Cliquez sur "Add New" pour chaque variable

### Étape 2 : Configurer Google OAuth
1. Allez sur https://console.cloud.google.com/apis/credentials
2. Créez un projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez ces URLs autorisées :
   - **Origines JavaScript autorisées :**
     ```
     https://beriox-4ttsa32vo-beriox.vercel.app
     http://localhost:3000
     ```
   - **URI de redirection autorisés :**
     ```
     https://beriox-4ttsa32vo-beriox.vercel.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```

### Étape 3 : Générer NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Étape 4 : Base de données
- **Option 1 :** Utilisez une base de données PostgreSQL (recommandé)
- **Option 2 :** Utilisez SQLite pour les tests

## 🎯 Variables minimales pour commencer

Pour que l'application fonctionne de base, vous avez besoin de :

```bash
NEXTAUTH_SECRET=votre_secret_32_caracteres
NEXTAUTH_URL=https://beriox-4ttsa32vo-beriox.vercel.app
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
DATABASE_URL=votre_url_base_de_donnees
```

## 🔍 Vérification

Après avoir ajouté les variables :
1. Redéployez l'application sur Vercel
2. Testez la connexion Google
3. Vérifiez que les pages se chargent correctement

## 🆘 Dépannage

### Problème : "Invalid redirect URI"
- Vérifiez que l'URI de redirection dans Google Console correspond exactement à votre URL Vercel

### Problème : "NEXTAUTH_SECRET is not set"
- Assurez-vous que NEXTAUTH_SECRET est défini et fait au moins 32 caractères

### Problème : CSS cassé
- Vérifiez que NEXTAUTH_URL est correctement défini
- Redéployez l'application après avoir ajouté les variables
