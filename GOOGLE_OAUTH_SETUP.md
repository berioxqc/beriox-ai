# Configuration Google OAuth pour Beriox AI

## Configuration requise

Pour configurer l'authentification Google OAuth, vous devez :

1. **Créer un projet Google Cloud Console**
2. **Configurer l'API OAuth 2.0**
3. **Obtenir les clés Client ID et Client Secret**
4. **Configurer les URLs de redirection**

## Configuration locale

1. Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=beriox-ai-nextauth-secret-2024

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/beriox_ai"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here

# Sentry Configuration
SENTRY_DSN=your-sentry-dsn-here

# Google Analytics
NEXT_PUBLIC_GA_ID=G-4BNMH2FQMZ

# Environment
NODE_ENV=development
```

## Configuration Vercel

1. Allez dans votre dashboard Vercel
2. Sélectionnez le projet Beriox AI
3. Allez dans "Settings" > "Environment Variables"
4. Ajoutez les variables suivantes :

```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=beriox-ai-nextauth-secret-2024
```

## URLs de redirection autorisées

Assurez-vous que les URLs suivantes sont configurées dans la console Google Cloud :

### URLs de redirection autorisées
- `http://localhost:3000/api/auth/callback/google`
- `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### Origines JavaScript autorisées
- `http://localhost:3000`
- `https://your-vercel-domain.vercel.app`

## Test de l'authentification

1. Démarrez l'application locale : `npm run dev`
2. Allez sur `http://localhost:3000/auth/signin`
3. Cliquez sur "Continuer avec Google"
4. Vous devriez être redirigé vers Google pour l'authentification
5. Après authentification, vous serez redirigé vers `/missions`

## Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection est correctement configurée dans Google Cloud Console
- Assurez-vous que `NEXTAUTH_URL` correspond à votre domaine

### Erreur "invalid_client"
- Vérifiez que le Client ID et Client Secret sont corrects
- Assurez-vous que l'application OAuth est activée dans Google Cloud Console

### Problème de connexion persistante
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Assurez-vous que les cookies sont correctement configurés

## Sécurité

⚠️ **Important :** Ne jamais commiter les clés OAuth dans le code source. Utilisez toujours des variables d'environnement.

Les clés fournies sont spécifiques à ce projet et ne doivent pas être partagées publiquement.

## Instructions pour obtenir les clés

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Allez dans "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configurez les URLs de redirection autorisées
6. Copiez le Client ID et Client Secret
7. Ajoutez-les à vos variables d'environnement
