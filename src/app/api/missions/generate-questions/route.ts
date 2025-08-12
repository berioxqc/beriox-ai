import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { callJson } from "@/lib/openai";
import { PlanService } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les informations utilisateur et plan
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        premiumAccess: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Déterminer le plan effectif (avec accès premium temporaire)
    const basePlan = user.planId || 'apos;free'apos;;
    const effectivePlan = PlanService.getEffectivePlan(basePlan, user.premiumAccess);
    const canUseGPT = PlanService.canUseGPTQuestions(effectivePlan);
    const hasPremiumAccess = PlanService.hasPremiumAccess(user.premiumAccess);

    const body = await req.json();
    const { objective } = body;

    if (!objective || objective.trim().length === 0) {
      return NextResponse.json({ error: "Objectif de mission requis" }, { status: 400 });
    }

    // Si l'apos;utilisateur ne peut pas utiliser GPT, retourner des questions génériques
    if (!canUseGPT) {
      console.log(`🚫 Utilisateur ${user.email} (plan: ${effectivePlan}, premium: ${hasPremiumAccess}) - Questions GPT non autorisées`);
      
      const genericQuestions = [
        {
          label: "💡 Dans quel contexte avez-vous besoin d'apos;aide ?",
          placeholder: "Ex: Pour mon site web, client spécifique, projet urgent..."
        },
        {
          label: "👥 Pour qui est-ce destiné ?",
          placeholder: "Ex: Mes visiteurs, clients de ma boutique, mon équipe..."
        },
        {
          label: "⏱️ Y a-t-il des contraintes à savoir ?",
          placeholder: "Ex: À faire rapidement, style particulier, budget serré..."
        }
      ];

      return NextResponse.json({ 
        questions: genericQuestions,
        isPremium: false,
        upgradeMessage: "Débloquez les questions GPT personnalisées avec un plan payant !",
        upgradeUrl: "/pricing"
      });
    }

    console.log(`✅ Utilisateur ${user.email} (plan: ${effectivePlan}, premium: ${hasPremiumAccess}) - Questions GPT autorisées`);

    // Prompt pour GPT afin de générer 3 questions d'apos;alignement personnalisées
    const prompt = `Analyse cette demande de mission et génère exactement 3 questions d'apos;alignement stratégiques pour mieux comprendre le besoin du client.

MISSION: "${objective}"

INSTRUCTIONS:
- Génère 3 questions courtes, précises et pertinentes
- Chaque question doit aider à clarifier un aspect différent du besoin
- Questions orientées action et résultats concrets
- Ton professionnel mais accessible
- Évite les questions trop génériques

FORMAT REQUIS (JSON strict):
{
  "questions": [
    {
      "label": "🎯 [Question courte et directe]",
      "placeholder": "Ex: [exemple de réponse concrète]"
    },
    {
      "label": "📋 [Question sur le contexte/contraintes]",
      "placeholder": "Ex: [exemple de contrainte ou contexte]"
    },
    {
      "label": "✨ [Question sur l'apos;objectif ou résultat attendu]",
      "placeholder": "Ex: [exemple de résultat souhaité]"
    }
  ]
}

EXEMPLES DE BONNES QUESTIONS:
- "🎯 Quel est le problème principal que cela doit résoudre ?"
- "📋 Y a-t-il des contraintes techniques ou budgétaires ?"
- "✨ À quoi ressemblera le succès pour vous ?"

Génère maintenant 3 questions spécifiques pour cette mission.`;

    // Appel à OpenAI
    const response = await callJson({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en analyse de besoins clients. Tu génères des questions d'apos;alignement précises et pertinentes pour mieux comprendre les demandes. Réponds UNIQUEMENT en JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    // Validation de la réponse
    if (!response.questions || !Array.isArray(response.questions) || response.questions.length !== 3) {
      console.error('apos;Réponse GPT invalide:'apos;, response);
      
      // Questions de fallback si GPT échoue
      const fallbackQuestions = [
        {
          label: "🎯 Quel est l'apos;objectif principal de cette demande ?",
          placeholder: "Ex: Augmenter les ventes, améliorer l'apos;efficacité, résoudre un problème..."
        },
        {
          label: "📋 Dans quel contexte ou avec quelles contraintes ?",
          placeholder: "Ex: Budget limité, délai serré, équipe réduite, public spécifique..."
        },
        {
          label: "✨ Comment saurez-vous que c'apos;est réussi ?",
          placeholder: "Ex: Métriques précises, feedback positif, objectif atteint..."
        }
      ];

      return NextResponse.json({ questions: fallbackQuestions });
    }

    // Validation des questions individuelles
    const validatedQuestions = response.questions.map((q: any, index: number) => {
      if (!q.label || !q.placeholder) {
        return {
          label: `🎯 Question ${index + 1} sur votre besoin`,
          placeholder: "Décrivez votre besoin spécifique..."
        };
      }
      return {
        label: q.label.substring(0, 100), // Limite la longueur
        placeholder: q.placeholder.substring(0, 150)
      };
    });

    console.log('apos;✅ Questions GPT générées pour mission:'apos;, objective.substring(0, 50) + 'apos;...'apos;);
    
    return NextResponse.json({ 
      questions: validatedQuestions,
      isPremium: true,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('apos;Erreur génération questions:'apos;, error);
    
    // Questions de fallback en cas d'apos;erreur
    const fallbackQuestions = [
      {
        label: "🎯 Quel est votre objectif principal ?",
        placeholder: "Ex: Créer du contenu, résoudre un problème, améliorer un processus..."
      },
      {
        label: "📋 Quelles sont vos contraintes ?",
        placeholder: "Ex: Délai, budget, ressources, public cible..."
      },
      {
        label: "✨ Quel résultat espérez-vous ?",
        placeholder: "Ex: Augmentation des ventes, gain de temps, meilleure visibilité..."
      }
    ];

    return NextResponse.json({ 
      questions: fallbackQuestions,
      isPremium: false,
      fallback: true,
      error: "Utilisation des questions par défaut"
    });
  }
}
