import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id
    const { agent } = await req.json()
    if (!agent) {
      return NextResponse.json({ error: "Agent name required" }, { status: 400 })
    }

    console.log(`🔄 Redémarrage de ${agent} pour la mission ${missionId}`)
    // Supprimer les anciens briefs et livrables de cet agent
    await prisma.deliverable.deleteMany({
      where: { missionId, agent }
    })
    await prisma.brief.deleteMany({
      where: { missionId, agent }
    })
    // Recréer le brief et le livrable pour cet agent
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })
    const objective = mission?.objective || ""
    const agentBriefs: Record<string, string> = {
      "KarineAI": `**Mission:** ${objective}

Salut mon petit méthodique ! 😊 Voici ce que j'ai préparé pour toi avec mon sourire habituel.

**Tes objectifs:**
- Découpe ce projet en tâches simples et faisables
- Structure la stratégie marketing globale avec ta rigueur habituelle
- Assure-toi que les délais sont réalistes (tu sais comme j'aime quand tout roule!)
- Coordonne avec Hugo pour la partie tech et Élodie pour le contenu

**Charge estimée:** Moyenne - tu gères ça les doigts dans le nez!
**Délai:** À toi de voir, mais garde-nous un peu de marge comme toujours 💝

*Gestion & Structuration - 46 ans*`,

      "HugoAI": `💻 **Brief de HugoAI (28 ans)** - Développeur Web
    
Mission: ${objective}

Salut mec! 🎮 Sors ton hoodie préféré, on a du boulot!

**Stack à analyser:**
- Contraintes techniques pour cette mission
- Architecture recommandée
- Outils et frameworks optimaux
- Timeline de développement réaliste

**Ton style:** Efficace mais détendu - comme d'hab!
**Collab:** Karine pour le cadrage, Élodie pour l'UX/UI

**Setup:** Café ✓ Playlist ✓ Mode focus ✓`,

      "JPBot": `📊 **Brief de JPBot** - Analyste Data & Performance
    
Mission: ${objective}

Analyse requise. Données à traiter. Optimisation en cours.

**Périmètre d'analyse:**
- KPIs pertinents à définir
- Métriques de performance
- Outils de tracking recommandés
- Dashboards de suivi

**Méthodologie:** Factuelle. Précise. Actionnable.
**Livrables:** Tableaux de bord + recommandations chiffrées.

*"Les données ne mentent jamais. Les interprétations parfois."*`,

      "ElodieAI": `✍️ **Brief d'ElodieAI (31 ans)** - Rédactrice & Content Manager
    
Mission: ${objective}

Coucou Élodie! 🎵 Mets ta playlist lo-fi, on va créer quelque chose de beau!

**Ton terrain de jeu:**
- Contenus optimisés SEO pour cette mission
- Tone-of-Voice adapté à la cible
- Guidelines EEAT respectées
- UX writing qui guide naturellement

**Style:** Calme, précise, créative - comme tu aimes!
**Collaboration:** Hugo pour les projets web, Clara pour les révisions croisées

**Bonus:** N'hésite pas avec tes jeux de mots discrets, ça fait toujours la différence! ✨`,

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
- Garde uniquement l'essentiel
- Assure-toi que c'est réalisable rapidement
- Ramène tout à l'objectif principal

**Méthode:** Minimaliste. Direct. Efficace.
**Délai:** Le plus court possible sans sacrifier la qualité.

**Méditation du jour:** "Que faut-il vraiment pour réussir cette mission?" 🧘‍♂️`
    }
    const agentDeliverables: Record<string, { content: string }> = {
      "KarineAI": {
        content: `# Stratégie Marketing - ${objective}

## Positionnement
- **Proposition de valeur unique**: Innovation technologique accessible
- **Cible principale**: Professionnels 25-45 ans, early adopters
- **Différenciation**: Simplicité d'usage + performance premium

## Messages clés
1. "La solution qui simplifie votre quotidien"
2. "Performance sans compromis"
3. "Conçu pour les professionnels exigeants"

## Plan de contenu
- **Blog**: 3 articles/semaine sur les use cases
- **Social Media**: Stories quotidiennes, posts 2x/jour
- **Email**: Newsletter hebdomadaire + séquences d'onboarding
- **Webinaires**: Sessions démo bi-mensuelles

## KPIs
- Brand awareness: +40% en 6 mois
- Engagement rate: >5% sur tous les canaux
- Lead generation: 500 leads qualifiés/mois`
      },
      "HugoAI": {
        content: `# Acquisition Payante - ${objective}

## Budget recommandé
- **Total mensuel**: 20 000 CAD$
- **Google Ads**: 60% (12 000 CAD$)
- **Facebook/Meta**: 25% (5 000 CAD$)
- **LinkedIn**: 15% (3 000 CAD$)

## Stratégie par canal
### Google Ads
- Campagnes Search: mots-clés haute intention
- Display: remarketing audiences chaudes
- YouTube: vidéos démo produit

### Meta (Facebook/Instagram)
- Lookalike audiences basées sur clients actuels
- Retargeting visiteurs site web
- Tests créatifs A/B constants

### LinkedIn
- Sponsored Content pour décideurs
- Message Ads personnalisés
- Event promotion pour webinaires

## Optimisations
- CPA cible: 195 CAD$
- ROAS minimum: 4:1
- Tests créatifs hebdomadaires`
      },
      "JPBot": {
        content: `# Analyse Performance - ${objective}

## Métriques principales
- **Trafic**: +25% MoM
- **Conversions**: 3.2% (objectif: 4%)
- **CAC**: 165 CAD$ (budget: 195 CAD$)
- **LTV**: 1 157 CAD$ (ratio LTV/CAC: 7:1)

## Insights data
1. **Peak traffic**: Mardi-Jeudi 14h-17h
2. **Meilleur canal**: Organic Search (42% conversions)
3. **Device**: Mobile 68%, Desktop 32%
4. **Géo**: Paris (31%), Lyon (18%), Marseille (12%)

## Recommandations
- Optimiser mobile-first (68% trafic)
- Renforcer SEO longue traîne
- A/B tester CTA sur landing pages
- Implémenter tracking avancé GA4

## Alertes
⚠️ Bounce rate élevé sur mobile (67%)
⚠️ Temps de chargement >3s sur 23% pages`
      },
      "ElodieAI": {
        content: `# Stratégie Contenu - ${objective}

## Ligne éditoriale
**Ton**: Professionnel mais accessible, expert sans être intimidant
**Angle**: "Comment faire mieux avec moins d'effort"
**Valeurs**: Efficacité, simplicité, résultats concrets

## Planning éditorial (4 semaines)
### Semaine 1: Éducation
- Article: "Les 5 erreurs qui coûtent cher"
- Vidéo: Démo 3 minutes
- Newsletter: Tips & tricks hebdo

### Semaine 2: Social proof
- Case study client
- Témoignages vidéo
- Posts LinkedIn success stories

### Semaine 3: Comparaison
- "Nous vs Concurrents"
- Guide choix solution
- FAQ approfondie

### Semaine 4: Conversion
- Free trial promotion
- Webinaire exclusif
- Offre limitée temps

## SEO
- 15 mots-clés principaux identifiés
- Cocon sémantique structuré
- Netlinking 5 backlinks/mois`
      },
      "ClaraLaCloseuse": {
        content: `# Optimisation Conversion - ${objective}

## Landing page
**Headline**: "Transformez votre [problème] en opportunité en 30 jours"
**Sous-titre**: "Rejoignez 2 847 professionnels qui ont déjà fait le choix de l'efficacité"

### Structure page
1. **Hero**: Promesse + vidéo 90s
2. **Social proof**: Logos + témoignages
3. **Features**: 3 bénéfices clés avec icônes
4. **Pricing**: Offre claire, urgence
5. **FAQ**: 8 objections principales
6. **CTA final**: "Commencer maintenant - Gratuit 14 jours"

## Email sequences
### Séquence bienvenue (7 emails)
- J+0: "Bienvenue + guide démarrage"
- J+2: "Votre premier succès en 5 min"
- J+5: "Case study: +127% en 3 mois"
- J+7: "Les 3 erreurs à éviter absolument"
- J+10: "Offre spéciale -30% (48h)"
- J+12: "Dernière chance"
- J+14: "Feedback + prochaines étapes"

## A/B tests
- CTA couleur: Orange vs Vert
- Headline: Bénéfice vs Problème
- Social proof: Chiffres vs Témoignages`
      },
      "FauconLeMaitreFocus": {
        content: `# Focalisation Stratégique - ${objective}

## Essentiel uniquement
**1 objectif**: Acquisition clients qualifiés
**1 métrique**: CAC < 150€
**1 canal**: Google Ads Search (ROI prouvé)

## Éliminations
❌ Social media organique (ROI faible)
❌ Influenceurs (budget/résultat incertain)  
❌ Events physiques (coût/lead élevé)
❌ Print/Radio (tracking impossible)

## Planning focus 30 jours
### Semaine 1-2: Fondations
- Landing page optimisée
- Tracking conversions parfait
- 10 mots-clés haute intention

### Semaine 3-4: Optimisation
- Tests A/B quotidiens
- Ajustements enchères
- Expansion mots-clés rentables

## Discipline quotidienne
- 1h analyse performance
- 1 optimisation par jour
- 0 nouvelle initiative sans ROI prouvé

**Mantra**: "Faire moins, mieux, mesurer tout."

## Planning hebdomadaire
- Lundi: Analyse weekend + ajustements
- Mercredi: Ajustements tactiques  
- Vendredi: Préparation semaine suivante`
      }
    }
    // Créer le nouveau brief
    if (agentBriefs[agent]) {
      await prisma.brief.create({
        data: {
          missionId,
          agent,
          contentJson: agentBriefs[agent],
          status: "done"
        }
      })
    }

    // Créer le nouveau livrable après un délai
    setTimeout(async () => {
      if (agentDeliverables[agent]) {
        await prisma.deliverable.create({
          data: {
            missionId,
            agent,
            output: agentDeliverables[agent]
          }
        })
        console.log(`✅ ${agent} redémarré avec succès pour la mission ${missionId}`)
      }
    }, 3000); // 3 secondes de délai pour simuler le travail

    return NextResponse.json({ 
      success: true, 
      message: `${agent} redémarré avec succès` 
    })
  } catch (error) {
    console.error("Restart Agent Error:", error)
    return NextResponse.json({ 
      error: "Erreur lors du redémarrage de l'agent" 
    }, { status: 500 })
  }
}
