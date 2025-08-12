# 📊 Configuration Google Analytics GA4 pour Beriox AI

## 🎯 Oui, c'est bien le GA4 Tracking Code qu'il faut !

### 📋 Étapes pour obtenir votre clé Google Analytics

#### 1. Créer un compte Google Analytics
1. Allez sur [analytics.google.com](https://analytics.google.com)
2. Cliquez sur "Commencer à mesurer"
3. Connectez-vous avec votre compte Google

#### 2. Créer une propriété
1. Cliquez sur "Créer une propriété"
2. Nom de la propriété : `Beriox AI`
3. Fuseau horaire : `(GMT-05:00) Eastern Time`
4. Devise : `Dollar canadien (CAD)`
5. Cliquez sur "Suivant"

#### 3. Configurer les informations de l'entreprise
1. Taille de l'entreprise : `Petite entreprise`
2. Secteur d'activité : `Technologie`
3. Utilisation prévue : `Mesurer les performances de mon site web`
4. Cliquez sur "Créer"

#### 4. Configurer le flux de données
1. Plateforme : `Web`
2. URL du site web : `https://beriox-q837s7f34-beriox.vercel.app`
3. Nom du flux : `Beriox AI Website`
4. Cliquez sur "Créer un flux"

#### 5. Obtenir le code de suivi GA4
1. Dans votre propriété GA4, allez dans **Administration** (⚙️)
2. Dans la colonne **Propriété**, cliquez sur **Flux de données**
3. Cliquez sur votre flux web
4. Cliquez sur **Balise Google** (gtag.js)
5. **Copiez le code de suivi** qui ressemble à :
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

## 🔑 Variables d'environnement à configurer

### Sur Vercel, ajoutez ces variables :

```bash
# ID de mesure GA4 (commence par G-)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Clé API Google Analytics (optionnel, pour les rapports avancés)
GOOGLE_ANALYTICS_API_KEY=AIzaSyC...

# ID de propriété GA4 (commence par GA4_)
GOOGLE_ANALYTICS_PROPERTY_ID=GA4_XXXXXXXXXX
```

## 🚀 Intégration dans l'application

### 1. Ajouter le script GA4 dans le layout
```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}', {
                page_title: 'Beriox AI',
                page_location: window.location.href,
              });
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 2. Créer un hook pour le tracking
```tsx
// src/hooks/useAnalytics.ts
export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        page_path: url,
      });
    }
  };

  return { trackEvent, trackPageView };
};
```

## 📈 Événements à tracker

### 🔐 Authentification
```tsx
// Connexion réussie
trackEvent('login', { method: 'google' });
trackEvent('login', { method: 'email' });

// Inscription
trackEvent('sign_up', { method: 'google' });
trackEvent('sign_up', { method: 'email' });

// Déconnexion
trackEvent('logout');
```

### 🎯 Actions utilisateur
```tsx
// Création de mission
trackEvent('mission_created', { agent_type: 'karine' });

// Soumission de formulaire
trackEvent('form_submit', { form_name: 'contact' });

// Clic sur CTA
trackEvent('cta_click', { cta_name: 'get_started' });

// Abonnement
trackEvent('subscription_started', { plan: 'pro' });
```

## 🔍 Vérification de l'installation

### 1. Test en temps réel
1. Allez dans GA4 → **Rapports** → **Temps réel**
2. Visitez votre site
3. Vous devriez voir votre visite apparaître

### 2. Test avec Google Tag Assistant
1. Installez l'extension Chrome "Tag Assistant Legacy"
2. Activez-la sur votre site
3. Vérifiez que GA4 est détecté

### 3. Test avec la console
```javascript
// Dans la console du navigateur
gtag('event', 'test_event', { test: true });
```

## 📊 Métriques importantes à surveiller

### 🎯 Métriques d'engagement
- **Utilisateurs actifs** : Nombre d'utilisateurs uniques
- **Sessions** : Nombre de visites
- **Pages vues** : Nombre de pages consultées
- **Temps sur le site** : Durée moyenne des sessions

### 🔐 Métriques d'authentification
- **Taux de conversion** : Inscriptions / Visites
- **Méthode de connexion** : Google vs Email
- **Abandon de formulaire** : Inscriptions commencées mais non terminées

### 💰 Métriques business
- **Prix consultés** : Visites sur la page pricing
- **Abonnements** : Conversions vers les plans payants
- **Rétention** : Utilisateurs qui reviennent

## 🛠️ Dépannage

### ❌ GA4 ne fonctionne pas
1. Vérifiez que l'ID GA4 est correct
2. Vérifiez que le script est chargé (Console → Network)
3. Vérifiez les erreurs dans la console
4. Vérifiez que le domaine est autorisé dans GA4

### ❌ Pas de données en temps réel
1. Attendez 24-48h pour les données historiques
2. Vérifiez les filtres IP dans GA4
3. Vérifiez que vous n'êtes pas en mode incognito

### ❌ Événements personnalisés non visibles
1. Vérifiez la syntaxe des événements
2. Attendez 24h pour les événements personnalisés
3. Vérifiez dans DebugView (GA4 → Configure → DebugView)

## 📞 Support

Si vous avez des problèmes avec GA4 :
1. Vérifiez la [documentation officielle GA4](https://support.google.com/analytics/answer/10089681)
2. Utilisez le [DebugView](https://support.google.com/analytics/answer/7201382)
3. Contactez le support Google Analytics
