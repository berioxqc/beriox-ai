# Configuration Google OAuth pour Beriox AI

## URLs de Redirection à Configurer

Pour que l'authentification Google fonctionne correctement, vous devez configurer les URLs de redirection suivantes dans Google Console :

### 1. Aller à Google Cloud Console
- Visitez : https://console.cloud.google.com/
- Sélectionnez votre projet
- Allez dans "APIs & Services" > "Credentials"

### 2. Modifier l'OAuth 2.0 Client ID
- Trouvez votre OAuth 2.0 Client ID
- Cliquez sur "Edit" (icône crayon)

### 3. Ajouter les URLs de Redirection
Dans la section "Authorized redirect URIs", ajoutez :

```
http://localhost:3000/api/auth/callback/google
https://beriox-ai.vercel.app/api/auth/callback/google
```

### 4. Sauvegarder
- Cliquez sur "Save"
- Attendez quelques minutes pour que les changements se propagent

## Variables d'Environnement

Assurez-vous que ces variables sont configurées :

```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
NEXTAUTH_URL=https://beriox-ai.vercel.app
NEXTAUTH_SECRET=votre_secret
```

## Test de l'Authentification

1. Allez sur : https://beriox-ai.vercel.app/auth/signin
2. Cliquez sur "Continuer avec Google"
3. Sélectionnez votre compte Google
4. Vous devriez être redirigé vers le dashboard après connexion

## Dépannage

Si l'authentification ne fonctionne toujours pas :

1. **Vérifiez les logs** : Regardez les logs de l'application pour les erreurs
2. **Vérifiez les URLs** : Assurez-vous que les URLs de redirection sont exactes
3. **Attendez la propagation** : Les changements Google peuvent prendre 5-10 minutes
4. **Vérifiez les variables** : Assurez-vous que toutes les variables d'environnement sont correctes

## Support

Si vous avez des problèmes, vérifiez :
- Les logs de l'application
- La configuration Google Console
- Les variables d'environnement Vercel
