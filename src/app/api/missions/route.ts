import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callJson } from "@/lib/openai";
import { enqueueSplitBriefs } from "@/queues/splitBriefs.queue";
import { evaluatePriority } from "@/utils/priorityEvaluator";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { withAuth } from "@/lib/auth-middleware";

export const runtime = "nodejs";

// Fonctions pour générer des réponses personnalisées par agent
function generateKarineResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  if (lower.includes('apos;article'apos;) || lower.includes('apos;blog'apos;) || lower.includes('apos;contenu'apos;)) {
    return `# 📝 Plan Editorial - KarineAI

Salut ! 😊 J'apos;ai analysé ta demande d'apos;article et voici ma stratégie bien organisée :

## 🎯 Angle d'apos;approche recommandé
${lower.includes('apos;wordpress'apos;) ? 'apos;- **Approche pratique** : Guide étape par étape avec captures d\'apos;écran'apos; : 'apos;'apos;}
${lower.includes('apos;seo'apos;) ? 'apos;- **Focus SEO** : Optimisé pour les moteurs de recherche'apos; : 'apos;'apos;}
${lower.includes('apos;tendance'apos;) ? 'apos;- **Actualité** : Intégrer les dernières nouveautés'apos; : 'apos;'apos;}
- **Ton accessible** : Éviter le jargon technique
- **Structure claire** : Intro, développement, conclusion actionnable

## ✍️ Structure proposée
1. **Hook accrocheur** (première phrase qui capte l'apos;attention)
2. **Problème identifié** (pourquoi c'apos;est important maintenant)
3. **Solution détaillée** (le cœur de l'apos;article)
4. **Exemples concrets** (cas pratiques)
5. **Call-to-action** (prochaine étape pour le lecteur)

## 🎨 Conseils de présentation
- **Sous-titres clairs** pour faciliter la lecture
- **Listes à puces** pour les points importants
- **Images/captures** si nécessaire
- **Longueur optimale** : 800-1200 mots

*Comme toujours, je structure tout pour que ce soit clair et efficace ! 💝*`;
  }

  if (lower.includes('apos;wordpress'apos;) || lower.includes('apos;site'apos;)) {
    return `# 🔧 Diagnostic WordPress - KarineAI

Hey ! 😊 J'apos;ai regardé ton problème WordPress et voici ma méthode structurée :

## 🔍 Diagnostic initial
- **Identifier la cause** : Plugin récent ? Mise à jour ? Changement d'apos;hébergement ?
- **Reproduire le problème** : Quand ça arrive ? Sur quelles pages ?
- **Impact utilisateur** : Qui est affecté ? Fréquence du problème ?

## 🛠️ Plan de résolution
1. **Sauvegarde complète** (toujours en premier !)
2. **Mode maintenance** (si nécessaire)
3. **Tests par élimination** :
   - Désactiver plugins récents
   - Tester avec thème par défaut
   - Vérifier logs d'apos;erreur

## 📋 Checklist de vérification
- [ ] Plugins à jour ?
- [ ] Thème compatible ?
- [ ] PHP version OK ?
- [ ] Espace disque suffisant ?
- [ ] Certificat SSL valide ?

## 🎯 Prochaines étapes
Je te recommande de commencer par la sauvegarde, puis on procède étape par étape. Pas de panique, on va régler ça méthodiquement !

*Mon approche : toujours sauvegarder d'apos;abord, puis analyser calmement 💪*`;
  }

  if (lower.includes('apos;seo'apos;) || lower.includes('apos;référencement'apos;)) {
    return `# 📈 Audit SEO Express - KarineAI

Coucou ! 😊 Voici mon analyse SEO structurée pour ton projet :

## 🎯 Points d'apos;amélioration prioritaires
1. **Mots-clés principaux** : Définir 3-5 expressions cibles
2. **Contenu optimisé** : Titres, méta-descriptions, structure H1-H6
3. **Vitesse de chargement** : Images optimisées, cache activé
4. **Mobile-friendly** : Responsive design essentiel

## 📊 Plan d'apos;action immédiat
### Technique (urgent)
- Installer un plugin SEO (Yoast ou RankMath)
- Optimiser les images (compression + alt text)
- Activer la mise en cache
- Vérifier Google Search Console

### Contenu (important)
- Recherche de mots-clés pertinents
- Optimiser les pages existantes
- Créer du contenu régulièrement
- Améliorer le maillage interne

## 🚀 Objectifs réalistes
- **Court terme** (1 mois) : Corriger les erreurs techniques
- **Moyen terme** (3 mois) : Améliorer le positionnement sur 5 mots-clés
- **Long terme** (6 mois) : Augmenter le trafic organique de 30%

*Mon secret : y aller étape par étape, sans se décourager ! Le SEO c'apos;est un marathon, pas un sprint 🏃‍♀️*`;
  }

  // Réponse générique mais personnalisée
  return `# 💡 Recommandations - KarineAI

Salut ! 😊 J'apos;ai bien analysé ta demande et voici ma stratégie organisée :

## 🎯 Mon analyse
${context ? `**Contexte compris** : ${context}` : 'apos;'apos;}
Cette mission me semble ${lower.includes('apos;urgent'apos;) ? 'apos;urgente'apos; : 'apos;importante'apos;} et j'apos;ai préparé un plan structuré pour t'apos;aider.

## 📋 Plan d'apos;action recommandé
1. **Étape 1** : Définir clairement l'apos;objectif
2. **Étape 2** : Rassembler les ressources nécessaires  
3. **Étape 3** : Mettre en place méthodiquement
4. **Étape 4** : Tester et ajuster si besoin

## ✨ Mes conseils pratiques
- **Commence simple** : Mieux vaut bien faire peu que mal faire beaucoup
- **Documente tout** : Tu me remercieras plus tard !
- **Teste régulièrement** : Pour éviter les mauvaises surprises
- **Demande des retours** : L'apos;avis des utilisateurs est précieux

## 🎪 Prochaines étapes
Je pense qu'apos;on peut s'apos;attaquer à ça étape par étape. Tu veux qu'apos;on détaille une partie en particulier ?

*Comme d'apos;habitude, j'apos;ai tout organisé pour que ce soit clair et faisable ! 💝*`;
}

function generateHugoResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  if (lower.includes('apos;wordpress'apos;) || lower.includes('apos;plugin'apos;) || lower.includes('apos;site'apos;)) {
    return `# 💻 Solution Technique - HugoAI

Yo ! 🎮 J'apos;ai regardé ton truc WordPress, voici ce que je vois :

## 🔧 Diagnostic technique
\`\`\`
Problème détecté : ${lower.includes('apos;lent'apos;) ? 'apos;Performance'apos; : lower.includes('apos;bug'apos;) ? 'apos;Conflit logiciel'apos; : 'apos;Configuration'apos;}
Niveau de difficulté : ${lower.includes('apos;urgent'apos;) ? 'apos;Critique'apos; : 'apos;Modéré'apos;}
Temps estimé : ${lower.includes('apos;simple'apos;) ? 'apos;30 min'apos; : 'apos;2-3h'apos;}
\`\`\`

## ⚡ Solutions techniques
### Option 1 : Fix rapide
- Désactiver tous les plugins
- Réactiver un par un pour identifier le coupable
- Alternative : passer en mode debug

### Option 2 : Approche pro
- Cloner le site en local/staging
- Analyser les logs d'apos;erreur PHP
- Tester les corrections sans risque

## 🛠️ Outils recommandés
- **Query Monitor** : Pour debugger les performances
- **Health Check** : Diagnostic automatique WordPress  
- **WP-CLI** : Si tu veux faire du terminal (mon préféré 😎)

## 🎯 Code snippet utile
\`\`\`php
// Debug mode dans wp-config.php
define('apos;WP_DEBUG'apos;, true);
define('apos;WP_DEBUG_LOG'apos;, true);
define('apos;WP_DEBUG_DISPLAY'apos;, false);
\`\`\`

*Astuce de dev : toujours backup avant de toucher quoi que ce soit ! 🔥*`;
  }

  if (lower.includes('apos;design'apos;) || lower.includes('apos;css'apos;) || lower.includes('apos;style'apos;)) {
    return `# 🎨 Amélioration Design - HugoAI

Salut mec ! 🎮 Alors, on va styliser tout ça :

## 🖼️ Analyse visuelle
- **Style actuel** : ${lower.includes('apos;moderne'apos;) ? 'apos;Plutôt clean'apos; : 'apos;À rafraîchir'apos;}
- **Problèmes identifiés** : Lisibilité, cohérence, responsive
- **Potentiel d'apos;amélioration** : Énorme ! 🚀

## 🎨 Recommandations design
### Couleurs
- **Palette principale** : 3 couleurs max
- **Contraste** : Respecter les standards d'apos;accessibilité
- **Cohérence** : Même palette partout

### Typography  
- **Fonts** : Max 2 polices différentes
- **Hiérarchie** : H1 > H2 > H3 bien définie
- **Lisibilité** : Taille minimum 16px sur mobile

## 💡 CSS moderne à tester
\`\`\`css
/* Variables CSS pour la cohérence */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-main: 'apos;Inter'apos;, sans-serif;
}

/* Grid moderne */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

## 🎯 Prochaine étape
Tu veux qu'apos;on commence par quoi ? Les couleurs ? La typo ? Ou direct un mockup ?

*Mon truc : itérer vite, tester souvent ! 🔥*`;
  }

  // Réponse générique technique
  return `# ⚡ Analysis Technique - HugoAI

Hey ! 🎮 J'apos;ai checké ta demande, voici mon take technique :

## 🔍 Ce que je vois
${context ? `**Context** : ${context}` : 'apos;'apos;}
Niveau technique requis : ${lower.includes('apos;simple'apos;) ? 'apos;Facile'apos; : lower.includes('apos;complexe'apos;) ? 'apos;Avancé'apos; : 'apos;Intermédiaire'apos;}

## 🛠️ Approche technique
1. **Setup propre** : Environnement de dev/test
2. **Itération rapide** : Prototype → Test → Améliore
3. **Documentation** : Code commenté pour plus tard
4. **Backup/Versioning** : Git ou au minimum backup

## 💡 Recommandations tech
- **Outils modernes** : Utilise les dernières versions stables
- **Performance first** : Optimise dès le début
- **Mobile-first** : Design responsive par défaut
- **Accessibilité** : Standards WCAG de base

## 🚀 Quick wins possibles
- Optimisation images (WebP + compression)
- Minification CSS/JS
- Cache navigateur activé
- CDN si pertinent

Tu veux qu'apos;on dive plus profond sur un aspect en particulier ?

*Dev tip : commence simple, complexifie seulement si nécessaire ! 🔥*`;
}

function generateJPBotResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  return `# 📊 Analyse Factuelle - JPBot

Analyse terminée. Données collectées. Rapport généré.

## 🔢 Métriques pertinentes
- **Complexité estimée** : ${lower.includes('apos;simple'apos;) ? 'apos;Faible (2/10)'apos; : lower.includes('apos;complexe'apos;) ? 'apos;Élevée (8/10)'apos; : 'apos;Moyenne (5/10)'apos;}
- **Temps requis** : ${lower.includes('apos;urgent'apos;) ? 'apos;< 24h'apos; : lower.includes('apos;rapide'apos;) ? 'apos;< 48h'apos; : 'apos;3-5 jours'apos;}
- **Ressources nécessaires** : ${lower.includes('apos;budget'apos;) ? 'apos;Budget confirmé requis'apos; : 'apos;Ressources internes suffisantes'apos;}

## 📈 Points de mesure clés
${lower.includes('apos;seo'apos;) ? 'apos;- Position actuelle dans SERP\n- Score PageSpeed (mobile/desktop)\n- Taux de clic organique'apos; : 'apos;'apos;}
${lower.includes('apos;site'apos;) || lower.includes('apos;wordpress'apos;) ? 'apos;- Temps de chargement moyen\n- Taux de rebond\n- Conversion rate'apos; : 'apos;'apos;}
${lower.includes('apos;article'apos;) || lower.includes('apos;contenu'apos;) ? 'apos;- Temps de lecture moyen\n- Taux d\'apos;engagement\n- Partages sociaux'apos; : 'apos;'apos;}

## ⚠️ Risques identifiés
1. **Technique** : ${lower.includes('apos;wordpress'apos;) ? 'apos;Conflit plugins potentiel'apos; : 'apos;Compatibilité navigateurs'apos;}
2. **Délai** : ${lower.includes('apos;urgent'apos;) ? 'apos;Timeline serrée = risque qualité'apos; : 'apos;Planning réaliste'apos;}
3. **Ressources** : Validation expertise requise

## 🎯 KPIs recommandés
- Mesure baseline avant intervention
- Tracking continu pendant implémentation  
- Rapport performance post-déploiement
- ROI calculé sur 30/60/90 jours

## 📋 Checklist validation
- [ ] Objectifs SMART définis
- [ ] Métriques de succès établies
- [ ] Plan de rollback préparé
- [ ] Tests utilisateurs planifiés

Recommandation : Procéder par phases mesurables. Éviter optimisation prématurée.

*Données > Opinions. Mesurer > Supposer.*`;
}

function generateElodieResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  if (lower.includes('apos;article'apos;) || lower.includes('apos;blog'apos;) || lower.includes('apos;contenu'apos;)) {
    return `# ✨ Création de Contenu - ÉlodieAI

Coucou ! 🎵 J'apos;ai lu ta demande et j'apos;ai déjà plein d'apos;idées qui bouillonnent...

## 🎨 Vision créative
L'apos;article que tu veux, je le vois déjà : **${lower.includes('apos;guide'apos;) ? 'apos;un guide pratique qui accompagne vraiment'apos; : lower.includes('apos;tendance'apos;) ? 'apos;un contenu d\'apos;actualité qui fait réfléchir'apos; : 'apos;un contenu qui marque et inspire'apos;}**.

## ✍️ Approche éditoriale
### Ton & Style
- **Personnalité** : ${lower.includes('apos;professionnel'apos;) ? 'apos;Expertise accessible'apos; : lower.includes('apos;décontracté'apos;) ? 'apos;Convivial et proche'apos; : 'apos;Équilibre pro/humain'apos;}
- **Rythme** : Phrases variées, respiration naturelle
- **Engagement** : Questions rhétoriques, interpellation du lecteur

### Structure narrative
1. **Accroche émotionnelle** - On capte dès la première ligne
2. **Storytelling** - Pourquoi c'apos;est important MAINTENANT
3. **Valeur ajoutée** - Le cœur de ton expertise
4. **Inspiration** - Ce que ça va changer pour eux

## 🌟 Éléments différenciants
- **Exemples concrets** tirés de l'apos;expérience réelle
- **Analogies parlantes** pour expliquer le complexe
- **Call-to-action naturels** qui ne forcent pas
- **Personnalité transparente** - on sent l'apos;humain derrière

## 📝 Conseils rédactionnels
- **Mots de transition** fluides entre les paragraphes
- **Champ lexical** riche mais accessible
- **Rythme de lecture** : alterner courts/longs paragraphes
- **SEO naturel** : mots-clés intégrés organiquement

${lower.includes('apos;seo'apos;) ? 'apos;## 🔍 Optimisation SEO douce\n- Title accrocheur (60 caractères max)\n- Meta description qui donne envie (150 caractères)\n- Structure H1/H2/H3 logique\n- Mots-clés naturellement intégrés'apos; : 'apos;'apos;}

*Mon petit plus : j'apos;ajoute toujours une pointe d'apos;émotion qui fait la différence ✨*`;
  }

  if (lower.includes('apos;réseaux'apos;) || lower.includes('apos;social'apos;) || lower.includes('apos;instagram'apos;)) {
    return `# 📱 Stratégie Social Media - ÉlodieAI

Hello ! 🎵 Alors, on va faire vibrer tes réseaux sociaux ?

## 🎨 Ligne éditoriale
### Personnalité de marque
- **Ton** : ${lower.includes('apos;professionnel'apos;) ? 'apos;Expert bienveillant'apos; : lower.includes('apos;fun'apos;) ? 'apos;Complice et inspirant'apos; : 'apos;Authentique et proche'apos;}
- **Valeurs** : Transparence, expertise, humanité
- **Style visuel** : Cohérent, reconnaissable, chaleureux

### Types de contenus
1. **Inspirational** (40%) - Citations, success stories, behind-the-scenes
2. **Educational** (30%) - Tips, tutoriels, explications
3. **Conversational** (20%) - Questions, sondages, interactions
4. **Promotional** (10%) - Produits/services (avec subtilité)

## ✨ Idées de posts créatifs
### Format Stories
- **Polls interactifs** : "Quel est ton plus gros défi ?"
- **Behind the scenes** : Process de création
- **Tips express** : 1 conseil en 15 secondes

### Posts feed
- **Carrousels éducatifs** : Guide en plusieurs slides
- **Citations visuelles** : Tes meilleures phrases
- **User-generated content** : Témoignages clients

## 📅 Planning éditorial type
- **Lundi** : Motivation/Inspiration
- **Mercredi** : Contenu éducatif/Tips
- **Vendredi** : Interaction/Question communauté
- **Dimanche** : Personnel/Behind-the-scenes

*Mon secret : l'apos;authenticité touche plus que la perfection ! 🌟*`;
  }

  // Réponse générique créative
  return `# 🎨 Vision Créative - ÉlodieAI

Salut ! 🎵 J'apos;ai capté l'apos;essence de ce que tu veux créer...

## ✨ Ma vision
${context ? `**Inspiration** : ${context}` : 'apos;'apos;}
Je sens que ce projet a un potentiel énorme pour **vraiment connecter** avec ton audience.

## 🎨 Approche créative
### Émotion avant tout
- **Identifier le feeling** qu'apos;on veut transmettre
- **Choisir les mots** qui résonnent vraiment  
- **Créer l'apos;expérience** plus que le simple contenu

### Storytelling naturel
1. **Hook émotionnel** - Pourquoi ça compte
2. **Développement personnel** - Ton expertise unique
3. **Transformation** - Ce que ça change pour eux
4. **Inspiration** - L'apos;envie d'apos;agir

## 💡 Éléments signature
- **Authenticité** : Ton style personnel transparent
- **Accessibilité** : Complexe rendu simple
- **Inspiration** : Toujours finir sur une note positive
- **Interaction** : Inviter à la conversation

## 🌟 Petits détails qui font la différence
- Métaphores parlantes pour expliquer
- Questions qui font réfléchir
- Exemples tirés du quotidien
- Ton personnel qui transparaît

Tu veux qu'apos;on explore ensemble quelle direction créative te ressemble le plus ?

*Mon truc : créer du contenu qui fait du bien autant qu'apos;il informe ✨*`;
}

function generateClaraResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  if (lower.includes('apos;vente'apos;) || lower.includes('apos;conversion'apos;) || lower.includes('apos;commercial'apos;)) {
    return `# 💰 Stratégie de Conversion - ClaraLaCloseuse

Hey ! ☕ Café serré et let'apos;s go, on va faire du chiffre !

## 🎯 Angle d'apos;attaque commercial
- **Pain point identifié** : ${lower.includes('apos;leads'apos;) ? 'apos;Génération de prospects'apos; : lower.includes('apos;conversion'apos;) ? 'apos;Taux de transformation'apos; : 'apos;Acquisition clients'apos;}
- **Urgence créée** : Pourquoi MAINTENANT et pas plus tard
- **Solution évidente** : Ton offre comme LA réponse

## 🔥 Hooks qui convertissent
1. **Statistique choc** : "97% des entreprises échouent parce que..."
2. **Question directe** : "Et si je te disais que tu peux doubler tes ventes en 30 jours ?"
3. **Témoignage client** : "Comme Sarah qui est passée de 2k à 15k€/mois"

## 💡 Structure de vente imparable
### Page de vente
- **Headline** : Bénéfice + urgence + preuve sociale
- **Sous-titre** : Développer la promesse principale
- **Bullet points** : 3-5 bénéfices concrets et mesurables
- **Témoignages** : Preuve sociale authentique
- **CTA principal** : Action claire, bénéfice répété

### Email de vente
- **Subject** : Curiosité + bénéfice (ex: "Cette erreur te coûte 3000€/mois")
- **Accroche** : Empathie + identification du problème
- **Solution** : Présentation naturelle de ton offre
- **Urgence** : Limitation temporelle ou quantité

## 🚀 CTAs qui font cliquer
- "Oui, je veux doubler mes ventes !" 
- "Je récupère ma méthode gratuite"
- "J'apos;accède à ma formation maintenant"

*Mon secret : vendre l'apos;émotion, justifier avec la logique ! 💪*`;
  }

  if (lower.includes('apos;réseaux'apos;) || lower.includes('apos;social'apos;) || lower.includes('apos;posts'apos;)) {
    return `# 📱 Posts qui Engagent - ClaraLaCloseuse

Salut ! ☕ On va faire des posts qui font réagir et convertir !

## 🎯 Formats qui marchent
### Posts inspirants
- **Citation + photo perso** : Authenticité + message fort
- **Behind the scenes** : Montrer les coulisses du succès
- **Transformation** : Avant/après de tes clients

### Posts éducatifs
- **Tips en carrousel** : 5 slides max, 1 conseil par slide
- **Erreurs communes** : "5 erreurs qui tuent ton business"
- **Checklist pratique** : Actionnable immédiatement

## 💡 Techniques d'apos;engagement
### Accroches qui stoppent le scroll
- "Arrête tout ce que tu fais et lis ça..."
- "Cette erreur m'apos;a coûté 10k€ (ne la fais pas)"
- "Plot twist : ce conseil va changer ta vie"

### Questions qui font réagir
- "Qui est d'apos;accord avec moi ?"
- "Raconte-moi en commentaire ton plus gros défi"
- "Vrai ou faux ? [affirmation controversée]"

## 🔥 Call-to-actions subtils
- "Sauvegarde ce post si tu veux t'apos;en souvenir !"
- "Tag quelqu'apos;un qui a besoin de voir ça"
- "Partage si ça t'apos;a aidé !"
- "DM moi si tu veux en savoir plus"

## 📅 Planning optimal
- **Lundi** : Motivation/Inspiration (démarrer la semaine fort)
- **Mercredi** : Contenu éducatif (valeur ajoutée)
- **Vendredi** : Interaction/Question (engagement weekend)

*Astuce de pro : 80% de valeur, 20% de vente. Toujours ! 🎯*`;
  }

  // Réponse générique commerciale
  return `# 🎯 Optimisation Conversion - ClaraLaCloseuse

Hey ! ☕ On va transformer ça en machine à ventes !

## 🔍 Diagnostic express
${context ? `**Contexte** : ${context}` : 'apos;'apos;}
Je vois du potentiel énorme pour **augmenter significativement** tes conversions.

## 💰 Quick wins immédiats
1. **Headline plus punch** : Bénéfice clair en 5 secondes
2. **Preuve sociale visible** : Témoignages, logos clients, chiffres
3. **Urgence authentique** : Vraie limitation de temps ou stock
4. **CTA irrésistible** : Action + bénéfice + urgence

## 🚀 Optimisations prioritaires
### Copywriting
- **Titre** : Problème résolu + bénéfice chiffré
- **Sous-titres** : Guider le regard vers l'apos;action
- **Bullet points** : Transformer caractéristiques en bénéfices
- **Témoignages** : Spécifiques, avec résultats mesurables

### Psychologie de vente
- **Réciprocité** : Donner avant de demander
- **Rareté** : Limitation crédible
- **Autorité** : Preuves d'apos;expertise
- **Social proof** : "Déjà +1000 clients satisfaits"

## 🎯 Tests à lancer
- A/B test sur le titre principal
- Couleur du bouton CTA
- Position des témoignages
- Longueur du texte de vente

Tu veux qu'apos;on se concentre sur quel élément en premier ?

*Ma règle d'apos;or : tester, mesurer, optimiser, répéter ! 💪*`;
}

function generateFauconResponse(objective: string, context?: string) {
  const lower = objective.toLowerCase();
  
  return `# 🎯 Focus Essentiel - FauconLeMaitreFocus

Focus. Analyse. Action.

## 🧠 Épuration mission
**Objectif réel** : ${objective.length > 50 ? objective.substring(0, 50) + 'apos;...'apos; : objective}
**Complexité détectée** : ${lower.includes('apos;simple'apos;) ? 'apos;Minimale'apos; : lower.includes('apos;complexe'apos;) ? 'apos;Élevée - Simplification requise'apos; : 'apos;Modérée'apos;}
**Priorité absolue** : ${lower.includes('apos;urgent'apos;) ? 'apos;CRITIQUE'apos; : lower.includes('apos;important'apos;) ? 'apos;HAUTE'apos; : 'apos;NORMALE'apos;}

## ⚡ Élimination superflue
**À garder** :
- Action principale qui résout le problème
- Mesure de réussite claire et unique
- Délai réaliste et non négociable

**À éliminer** :
- Fonctionnalités "nice-to-have"
- Perfectionnisme paralysant  
- Complexité inutile

## 🎯 Plan minimaliste
1. **Action #1** : ${lower.includes('apos;article'apos;) ? 'apos;Écrire contenu principal'apos; : lower.includes('apos;wordpress'apos;) ? 'apos;Identifier cause racine'apos; : lower.includes('apos;seo'apos;) ? 'apos;Audit technique de base'apos; : 'apos;Première étape critique'apos;}

2. **Mesure** : ${lower.includes('apos;article'apos;) ? 'apos;Article publié + 1 retour lecteur'apos; : lower.includes('apos;wordpress'apos;) ? 'apos;Problème résolu = site fonctionnel'apos; : lower.includes('apos;seo'apos;) ? 'apos;3 erreurs techniques corrigées'apos; : 'apos;Objectif mesurable atteint'apos;}

3. **Délai** : ${lower.includes('apos;urgent'apos;) ? 'apos;24h maximum'apos; : lower.includes('apos;rapide'apos;) ? 'apos;48h'apos; : 'apos;72h max'apos;}

## 🧘‍♂️ Méditation focus
*"Qu'apos;est-ce qui, fait aujourd'apos;hui, rendra cette mission accomplie ?"*

**Réponse** : ${lower.includes('apos;article'apos;) ? 'apos;Un contenu publié qui aide vraiment'apos; : lower.includes('apos;wordpress'apos;) ? 'apos;Un site qui fonctionne parfaitement'apos; : lower.includes('apos;seo'apos;) ? 'apos;Visibilité Google améliorée'apos; : 'apos;Résultat concret livré'apos;}

## ⚠️ Pièges à éviter
- Syndrome fonctionnalité magique
- Perfectionnisme avant publication
- Procrastination par sur-recherche
- Complexification progressive

**Action immédiate** : Commencer par le plus simple qui fonctionne.

*Principe : Simple. Efficace. Maintenant.*`;
}

// Wrapper les handlers avec l'apos;authentification
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    // Récupérer l'apos;utilisateur pour vérifier son rôle
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Construire la requête selon le rôle
    let whereClause: any = {};
    
    // Si ce n'apos;est pas un super admin, filtrer par utilisateur
    if (user.role !== 'apos;SUPER_ADMIN'apos;) {
      whereClause.userId = user.id;
    }
    // Les super admins voient toutes les missions

    const missions = await prisma.mission.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        objective: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deadline: true,
        priority: true,
        context: true,
        source: true,
        notionPageId: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });
    
    return NextResponse.json({ missions });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ missions: [] });
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    // Récupérer l'apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { prompt, objective, deadline, priority, context, details, selectedAgents } = body || {};

    let fields = { objective, deadline, priority, context, details, selectedAgents } as any;

    // Extraction intelligente avec OpenAI si c'apos;est un prompt
    if (prompt && !objective) {
      try {
        const schema = {
          type: "object",
          properties: {
            objective: { type: "string" },
            deadline: { type: "string", nullable: true },
            priority: { type: "string", nullable: true },
            context: { type: "string", nullable: true }
          },
          required: ["objective"],
          additionalProperties: false
        } as const;
        
        const extracted = await callJson(
          "Tu es un extracteur de champs pour créer une mission.",
          `Extrait les champs à partir de: ${prompt}. Retourne uniquement JSON avec objective, deadline (ISO ou texte), priority (low|medium|high), context.`,
          schema as any
        );
        fields = { ...fields, ...extracted };
      } catch (e) {
        // Fallback: utiliser le prompt comme objectif
        fields.objective = prompt;
      }
    }

    if (!fields.objective) {
      return NextResponse.json({ error: "objective is required" }, { status: 400 });
    }

    // 🤖 ÉVALUATION AUTOMATIQUE DE PRIORITÉ PAR PRIORITYBOT
    let finalPriority = fields.priority;
    let priorityReasoning = "";
    
    if (!finalPriority || finalPriority === "auto") {
      console.log("🤖 PriorityBot évalue la priorité de la mission...");
      const evaluation = evaluatePriority(fields.objective, fields.context || "");
      finalPriority = evaluation.priority;
      priorityReasoning = evaluation.reasoning;
      console.log(`⚡ PriorityBot recommande: ${finalPriority} (score: ${evaluation.score})`);
    }

    const mission = await prisma.mission.create({
      data: {
        source: "manual",
        sourceEventId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        objective: fields.objective,
        deadline: fields.deadline ? new Date(fields.deadline) : null,
        priority: finalPriority || "medium",
        context: fields.context || null,
        status: "received",
        userId: user.id
      }
    });

    // Enregistrer l'apos;évaluation de PriorityBot dans un champ spécial de la mission
    // PriorityBot ne crée pas de briefs ni de livrables
    if (priorityReasoning) {
      console.log("📝 Enregistrement de l'apos;analyse PriorityBot...");
      try {
        await prisma.mission.update({
          where: { id: mission.id },
          data: {
            context: JSON.stringify({
              priorityEvaluation: {
                priority: finalPriority,
                reasoning: priorityReasoning,
                timestamp: new Date().toISOString(),
                agent: "PriorityBot"
              },
              originalContext: fields.context
            })
          }
        });
      } catch (error) {
        console.error("Erreur enregistrement PriorityBot:", error);
      }
    }

    // 🚀 ORCHESTRATION AUTOMATIQUE SIMPLIFIÉE (sans workers externes)
    console.log("Mission créée:", mission.id, "- Lancement de l'apos;orchestration directe");
    
    // Récupérer les agents actifs si pas spécifié
    let activeAgents = fields.selectedAgents;
    if (!activeAgents || activeAgents.length === 0) {
      try {
        // Configuration par défaut des agents actifs
        activeAgents = ["KarineAI", "HugoAI", "JPBot", "ElodieAI"];
        
        // TODO: Dans le futur, récupérer depuis la config utilisateur
        // const configResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agents/config`);
        // if (configResponse.ok) {
        //   const config = await configResponse.json();
        //   activeAgents = config.activeAgents;
        // }
      } catch (error) {
        console.error("Erreur récupération config agents:", error);
        activeAgents = ["KarineAI", "HugoAI", "JPBot", "ElodieAI"];
      }
    }

    // Simulation immédiate du processus complet
    setTimeout(async () => {
      try {
        await simulateCompleteWorkflow(mission.id, activeAgents);
      } catch (error) {
        console.error("Erreur orchestration:", error);
      }
    }, 1000);

    return NextResponse.json({ missionId: mission.id });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

async function simulateCompleteWorkflow(missionId: string, selectedAgents?: string[]) {
  console.log("🎯 Début orchestration pour mission:", missionId);
  
  // Étape 1: Capitaine Jack découpe en briefs
  await new Promise(resolve => setTimeout(resolve, 2000));
  await prisma.mission.update({ where: { id: missionId }, data: { status: "split" } });
  console.log("✅ Briefs créés");
  
  // Simulation des briefs spécialisés
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  const objective = mission?.objective || "";
  
  // Agents sélectionnés ou par défaut tous les agents (exclure PriorityBot du workflow)
  const workflowAgents = selectedAgents || ["KarineAI", "HugoAI", "JPBot", "ElodieAI", "ClaraLaCloseuse", "FauconLeMaitreFocus"];
  
  // Créer des briefs pour tous les agents de travail (pas PriorityBot)
  console.log("📝 Création des briefs pour les agents:", workflowAgents);
  
  for (const agent of workflowAgents) {
    try {
      await prisma.brief.create({
        data: {
          missionId,
          agent,
          contentJson: {
            brief: allAgentBriefs[agent] || `Brief pour ${agent}`,
            status: "queued",
            createdAt: new Date().toISOString()
          },
          status: "queued"
        }
      });
      console.log(`✅ Brief créé pour ${agent}`);
    } catch (error) {
      console.error(`❌ Erreur création brief pour ${agent}:`, error);
    }
  }
  
  const allAgentBriefs = {
    "KarineAI": `**Mission:** ${objective}

Salut mon petit méthodique ! 😊 Voici ce que j'apos;ai préparé pour toi avec mon sourire habituel.

**Tes objectifs:**
- Découpe ce projet en tâches simples et faisables
- Structure la stratégie marketing globale avec ta rigueur habituelle
- Assure-toi que les délais sont réalistes (tu sais comme j'apos;aime quand tout roule!)
- Coordonne avec Hugo pour la partie tech et Élodie pour le contenu

**Charge estimée:** Moyenne - tu gères ça les doigts dans le nez!
**Délai:** À toi de voir, mais garde-nous un peu de marge comme toujours 💝

*Gestion & Structuration - 46 ans*`,

    "HugoAI": `💻 **Brief de HugoAI (28 ans)** - Développeur Web
    
Mission: ${objective}

Salut mec! 🎮 Sors ton hoodie préféré, on a du boulot!

**Stack à analyser:**
- Contraintes techniques pour cette mission
- Architecture recommandée (WordPress/Shopify/custom?)
- Plugins et outils nécessaires
- Intégrations avec les systèmes existants

**Challenge:** Pousse jusqu'apos;à trouver LA solution parfaite. Je sais que tu vas creuser jusqu'apos;au bout comme d'apos;hab!

**Sync avec:** Élodie pour magnifier tes bases tech, et JPBot va sûrement te challenger (encore) 🙄`,

    "JPBot": `🦉 **Brief de JPBot (28 ans)** - Le Neutralisateur Ultra-Pro
    
Mission: ${objective}

Analyse froide et méthodique demandée. Pas de fluff.

**Ton rôle:**
- Relis TOUT le travail des autres
- Joue l'apos;avocat du diable sur cette mission
- Identifie les incohérences, les failles, les dérives
- Pose les questions qui dérangent mais qui sont nécessaires

**Contraintes:** Reste professionnel même si Clara va encore t'apos;agacer 😤
**Objectif:** Que ce soit "tight" et sans faille

**Note:** Capitaine Jef va valider, alors assure-toi que c'apos;est du solide.`,

    "ElodieAI": `✍️ **Brief d'apos;ÉlodieAI (32 ans)** - Rédactrice SEO & UX
    
Mission: ${objective}

Coucou Élodie! 🎵 Mets ta playlist lo-fi, on va créer quelque chose de beau!

**Ton terrain de jeu:**
- Contenus optimisés SEO pour cette mission
- Tone-of-Voice adapté à la cible
- Guidelines EEAT respectées
- UX writing qui guide naturellement

**Style:** Calme, précise, créative - comme tu aimes!
**Collaboration:** Hugo pour les projets web, Clara pour les révisions croisées

**Bonus:** N'apos;hésite pas avec tes jeux de mots discrets, ça fait toujours la différence! ✨`,

    "ClaraLaCloseuse": `🎯 **Brief de Clara La Closeuse (35 ans)** - Copywriter Commercial
    
Mission: ${objective}

Hey Clara! ☕ Café noir prêt? On va faire du punch!

**Ton défi:**
- Pages de vente qui convertissent
- Landing pages avec du chien
- CTA puissants qui font cliquer
- Hooks et slogans mémorables

**Attitude:** Rapide, futée, convaincante - montre-leur ton style pub!
**Objectif:** Optimiser les taux de conversion au max

**Team:** Béa va beta-tester tes créations, JPBot va encore faire sa tête... mais tu vas le faire rire malgré lui 😏`,

    "FauconLeMaitreFocus": `🧠 **Brief de Faucon Le Maître Focus (âge inconnu)** - Anti-Dispersion
    
Mission: ${objective}

Focus. Essentiel. Livrable.

**Épure cette mission:**
- Élimine le superflu
- Garde uniquement l'apos;essentiel
- Assure-toi que c'apos;est réalisable rapidement
- Ramène tout à l'apos;objectif principal

**Méthode:** Minimaliste. Direct. Efficace.
**Délai:** Le plus court possible sans sacrifier la qualité.

**Méditation du jour:** "Que faut-il vraiment pour réussir cette mission?" 🧘‍♂️`
  };
  
  // Créer seulement les briefs pour les agents sélectionnés
  for (const agent of workflowAgents) {
    if (allAgentBriefs[agent as keyof typeof allAgentBriefs]) {
      await prisma.brief.create({
        data: {
          missionId,
          agent,
          contentJson: allAgentBriefs[agent as keyof typeof allAgentBriefs],
          status: "done"
        }
      });
    }
  }
  
  // Étape 2: Agents travaillent
  await new Promise(resolve => setTimeout(resolve, 3000));
  await prisma.mission.update({ where: { id: missionId }, data: { status: "in_progress" } });
  console.log("✅ Agents en cours...");
  
  // Simulation des livrables spécialisés et personnalisés
  const allAgentDeliverables = {
    "KarineAI": {
      content: generateKarineResponse(objective, mission?.context)
    },
    "HugoAI": {
      content: generateHugoResponse(objective, mission?.context)
    },
    "JPBot": {
      content: generateJPBotResponse(objective, mission?.context)
    },
    "ElodieAI": {
      content: generateElodieResponse(objective, mission?.context)
    },
    "ClaraLaCloseuse": {
      content: generateClaraResponse(objective, mission?.context)
    },
    "FauconLeMaitreFocus": {
      content: generateFauconResponse(objective, mission?.context)
    },
    "Clara": {
      content: `# Scripts de Vente & Closing - ${objective}

## Qualification BANT
### Budget
- "Quel budget avez-vous alloué pour ce type de solution ?"
- "À combien estimez-vous le coût de l'apos;inaction ?"

### Authority
- "Qui d'apos;autre sera impliqué dans cette décision ?"
- "Quel est votre processus de validation habituel ?"

### Need
- "Quel est votre principal défi actuellement ?"
- "Comment mesurez-vous le succès aujourd'apos;hui ?"

### Timeline
- "Quand souhaitez-vous voir les premiers résultats ?"
- "Y a-t-il des échéances critiques à respecter ?"

## Scripts d'apos;objections
### Prix
**Objection**: "C'apos;est trop cher"
**Réponse**: "Je comprends votre préoccupation. Regardons ensemble le ROI sur 12 mois. Avec une économie de X heures/semaine à Y€/heure, l'apos;investissement se rentabilise en Z mois. Voulez-vous que nous calculions votre cas spécifique ?"

### Timing
**Objection**: "Ce n'apos;est pas le bon moment"
**Réponse**: "Quand sera le bon moment selon vous ? En attendant, chaque mois sans solution vous coûte X€. Ne serait-il pas plus coûteux d'apos;attendre ?"

### Concurrence
**Objection**: "Je regarde d'apos;autres solutions"
**Réponse**: "C'apos;est une excellente approche. Quels sont vos critères de décision prioritaires ? Permettez-moi de vous montrer comment nous excellons sur ces points précis."

## Techniques de closing
### Assumptive Close
- "Quand souhaitez-vous commencer l'apos;implémentation ?"
- "Préférez-vous commencer par le plan Pro ou Enterprise ?"

### Alternative Close
- "Vous préférez un paiement annuel ou mensuel ?"
- "Formation en présentiel ou en ligne ?"

### Urgency Close
- "Cette offre spéciale se termine vendredi"
- "Nous n'apos;avons que 2 créneaux d'apos;implémentation ce trimestre"

## Follow-up séquence
- **J+1**: Email de remerciement + ressources
- **J+3**: Étude de cas similaire
- **J+7**: Appel de suivi
- **J+14**: Proposition personnalisée
- **J+21**: Dernière chance + urgence`
    },
    "Faucon": {
      content: `# Plan d'apos;Exécution & Priorisation - ${objective}

## Phase 1: Fondations (Semaines 1-4)
### Priorité CRITIQUE
1. **Setup tracking** (Semaine 1)
   - GA4 + GTM configuration
   - Pixels Facebook/LinkedIn
   - CRM integration

2. **Assets de base** (Semaines 2-3)
   - Landing page principale
   - Email templates
   - Charte graphique finalisée

3. **Processus vente** (Semaine 4)
   - Scripts qualifiés
   - CRM workflows
   - Formation équipe

## Phase 2: Lancement (Semaines 5-8)
### Priorité HAUTE
1. **Campagnes payantes** (Semaine 5)
   - Google Ads: Search + Display
   - Budget initial: 5 000€

2. **Content marketing** (Semaines 6-7)
   - 12 articles blog
   - 20 posts sociaux
   - 2 webinaires

3. **Optimisation** (Semaine 8)
   - A/B tests landing pages
   - Ajustements campagnes
   - Analyse performances

## Phase 3: Scale (Semaines 9-16)
### Priorité MOYENNE
1. **Expansion canaux** (Semaines 9-12)
   - LinkedIn Ads
   - Partenariats
   - Influenceurs

2. **Automation avancée** (Semaines 13-16)
   - Lead scoring
   - Email séquences
   - Remarketing dynamique

## Métriques de succès
### Semaine 1-4
- ✅ Tracking setup: 100%
- ✅ Assets créés: 80%
- ✅ Processus définis: 100%

### Semaine 5-8
- 🎯 Leads générés: 200
- 🎯 Coût par lead: <50€
- 🎯 Taux conversion: >3%

### Semaine 9-16
- 🚀 Leads générés: 800
- 🚀 Revenue: 50 000€
- 🚀 ROAS: >4:1

## Ressources nécessaires
- **Budget**: 25 000€ (4 mois)
- **Équipe**: 1 PM + 2 exécutants
- **Outils**: 800€/mois
- **Temps**: 160h total

## Points de vigilance
⚠️ **Risques majeurs**
- Délai setup technique
- Qualité du trafic payant
- Conversion landing pages

🔍 **Checkpoints hebdomadaires**
- Lundi: Métriques semaine précédente
- Mercredi: Ajustements tactiques
- Vendredi: Préparation semaine suivante`
    }
  };
  
  // Créer seulement les livrables pour les agents sélectionnés
  for (const agent of workflowAgents) {
    if (allAgentDeliverables[agent as keyof typeof allAgentDeliverables]) {
      await prisma.deliverable.create({
        data: {
          missionId,
          agent,
          output: allAgentDeliverables[agent as keyof typeof allAgentDeliverables]
        }
      });
    }
  }
  
  // Étape 3: Compilation
  await new Promise(resolve => setTimeout(resolve, 2000));
  await prisma.mission.update({ where: { id: missionId }, data: { status: "compiled" } });
  console.log("✅ Rapport compilé");
  
  // Créer le rapport final
  const reportContent = `# Rapport de Mission: ${mission?.objective}

## Résumé
Mission traitée par ${workflowAgents.length} agents spécialisés.

## Agents mobilisés
${workflowAgents.map(agent => `- ${agent}`).join('apos;\n'apos;)}

## Status
Mission complétée avec succès.

## Recommandations
- Suivre les KPIs définis
- Ajuster selon les retours utilisateurs
- Mesurer l'apos;impact des actions recommandées`;

  await prisma.report.create({
    data: {
      missionId,
      summary: `Mission "${mission?.objective}" - ${workflowAgents.length} agents mobilisés`,
      detailsMd: reportContent,
      cautions: "Suivi recommandé pour validation des résultats et ajustements nécessaires",
      nextSteps: "Mise en œuvre des recommandations et mesure des KPIs définis"
    }
  });
  
  // Étape 4: Finalisation
  await new Promise(resolve => setTimeout(resolve, 1000));
  await prisma.mission.update({ where: { id: missionId }, data: { status: "notified" } });
  console.log("🎉 Mission terminée:", missionId);
}


