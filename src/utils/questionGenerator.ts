import { openai } from 'apos;@/lib/openai'apos;;

export interface AlignmentQuestion {
  id: string;
  emoji: string;
  label: string;
  placeholder: string;
}

export async function generateAlignmentQuestions(objective: string): Promise<AlignmentQuestion[]> {
  try {
    const prompt = `
Analyse cet objectif de mission et génère exactement 3 questions d'apos;alignement pertinentes pour aider les agents IA à mieux comprendre les besoins spécifiques.

Objectif de la mission: "${objective}"

Instructions:
1. Les questions doivent être spécifiques à ce type de mission
2. Elles doivent aider à clarifier le contexte, la cible, et les contraintes
3. Chaque question doit avoir un emoji pertinent
4. Les questions doivent être courtes et directes
5. Retourne UNIQUEMENT un JSON valide avec ce format:

[
  {
    "id": "question1",
    "emoji": "📋",
    "label": "Question spécifique au contexte",
    "placeholder": "Exemple de réponse attendue..."
  },
  {
    "id": "question2", 
    "emoji": "🎯",
    "label": "Question sur la cible/objectif",
    "placeholder": "Exemple de réponse attendue..."
  },
  {
    "id": "question3",
    "emoji": "⚠️",
    "label": "Question sur les contraintes/spécificités",
    "placeholder": "Exemple de réponse attendue..."
  }
]

Exemples d'apos;adaptation selon le type de mission:
- Marketing → questions sur audience, budget, canaux
- Développement → questions sur technologie, utilisateurs, délais  
- Design → questions sur style, marque, public cible
- Business → questions sur marché, concurrence, ressources

Génère maintenant les 3 questions pour cette mission:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('apos;Pas de réponse de OpenAI'apos;);
    }

    // Nettoyer la réponse et parser le JSON
    const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, 'apos;'apos;);
    const questions: AlignmentQuestion[] = JSON.parse(cleanResponse);

    // Validation
    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error('apos;Format de réponse invalide'apos;);
    }

    // Vérifier que chaque question a les champs requis
    questions.forEach((q, index) => {
      if (!q.id || !q.emoji || !q.label || !q.placeholder) {
        throw new Error(`Question ${index + 1} manque des champs requis`);
      }
    });

    return questions;

  } catch (error) {
    console.error('apos;Erreur lors de la génération des questions:'apos;, error);
    
    // Fallback vers des questions génériques en cas d'apos;erreur
    return [
      {
        id: "context",
        emoji: "📋",
        label: "Quel est le contexte spécifique de cette mission ?",
        placeholder: "Décrivez le contexte, l'apos;environnement ou la situation actuelle..."
      },
      {
        id: "target", 
        emoji: "🎯",
        label: "Qui est votre cible prioritaire ?",
        placeholder: "Décrivez votre audience, vos utilisateurs ou vos clients cibles..."
      },
      {
        id: "constraints",
        emoji: "⚠️", 
        label: "Y a-t-il des contraintes importantes à respecter ?",
        placeholder: "Budget, délais, contraintes techniques ou légales..."
      }
    ];
  }
}
