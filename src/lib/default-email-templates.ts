import { MessagingService } from './messaging-service'
export const defaultEmailTemplates = [
  {
    name: 'Bienvenue Beriox',
    description: 'Email de bienvenue pour les nouveaux utilisateurs',
    subject: 'Bienvenue chez Beriox AI - Votre équipe d\'agents IA',
    body: `Bonjour {{userName}},

Bienvenue chez Beriox AI ! Nous sommes ravis de vous compter parmi nos utilisateurs.

Beriox AI vous offre une équipe d'agents IA spécialisés pour automatiser et optimiser vos processus business :

🤖 **Nos Agents IA :**
- Karine : Analyste de données et insights
- Hugo : Développeur et optimiseur technique
- JP Bot : Stratège business et marketing
- Elodie : QA et assurance qualité

🚀 **Pour commencer :**
1. Explorez votre dashboard
2. Créez votre première mission
3. Découvrez nos agents IA
4. Consultez nos recommandations personnalisées

Si vous avez des questions, notre équipe support est là pour vous aider.

Bienvenue dans l'avenir de l'automatisation !

L'équipe Beriox AI`,
    bodyHtml: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bienvenue chez Beriox AI</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; text-align: center;">Bienvenue chez Beriox AI</h1>
        
        <p>Bonjour <strong>{{userName}}</strong>,</p>
        
        <p>Bienvenue chez Beriox AI ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
        
        <p>Beriox AI vous offre une équipe d'agents IA spécialisés pour automatiser et optimiser vos processus business :</p>
        
        <h2 style="color: #6366f1;">🤖 Nos Agents IA :</h2>
        <ul>
            <li><strong>Karine :</strong> Analyste de données et insights</li>
            <li><strong>Hugo :</strong> Développeur et optimiseur technique</li>
            <li><strong>JP Bot :</strong> Stratège business et marketing</li>
            <li><strong>Elodie :</strong> QA et assurance qualité</li>
        </ul>
        
        <h2 style="color: #6366f1;">🚀 Pour commencer :</h2>
        <ol>
            <li>Explorez votre dashboard</li>
            <li>Créez votre première mission</li>
            <li>Découvrez nos agents IA</li>
            <li>Consultez nos recommandations personnalisées</li>
        </ol>
        
        <p>Si vous avez des questions, notre équipe support est là pour vous aider.</p>
        
        <p style="text-align: center; font-weight: bold; color: #6366f1;">
            Bienvenue dans l'avenir de l'automatisation !
        </p>
        
        <p style="text-align: center;">
            L'équipe Beriox AI
        </p>
    </div>
</body>
</html>`,
    variables: ['userName'],
    category: 'welcome'
  },
  {
    name: 'Support Ticket Créé',
    description: 'Confirmation de création d\'un ticket de support',
    subject: 'Ticket de support créé - {{ticketNumber}}',
    body: `Bonjour {{userName}},

Votre ticket de support a été créé avec succès.

**Détails du ticket :**
- Numéro : {{ticketNumber}}
- Sujet : {{ticketSubject}}
- Catégorie : {{ticketCategory}}
- Priorité : {{ticketPriority}}

Notre équipe va traiter votre demande dans les plus brefs délais. Vous recevrez une notification dès qu'une réponse sera disponible.

Vous pouvez suivre l'état de votre ticket depuis votre dashboard.

Merci de votre patience.

L'équipe support Beriox AI`,
    variables: ['userName', 'ticketNumber', 'ticketSubject', 'ticketCategory', 'ticketPriority'],
    category: 'support'
  },
  {
    name: 'Réponse Support',
    description: 'Réponse à un ticket de support',
    subject: 'Re: {{ticketSubject}} - {{ticketNumber}}',
    body: `Bonjour {{userName}},

Voici la réponse à votre ticket de support {{ticketNumber}} :

{{responseMessage}}

Si vous avez d'autres questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe support Beriox AI`,
    variables: ['userName', 'ticketNumber', 'ticketSubject', 'responseMessage'],
    category: 'support'
  },
  {
    name: 'Recommandations IA',
    description: 'Notification de nouvelles recommandations IA',
    subject: 'Nouvelles recommandations IA disponibles - {{recommendationCount}} suggestions',
    body: `Bonjour {{userName}},

Nos agents IA ont analysé votre système et généré {{recommendationCount}} nouvelles recommandations pour optimiser votre expérience.

**Recommandations prioritaires :**
{{priorityRecommendations}}

**Types de recommandations :**
- Performance : {{performanceCount}}
- Sécurité : {{securityCount}}
- UX : {{uxCount}}
- Business : {{businessCount}}
- Technique : {{technicalCount}}

Connectez-vous à votre dashboard pour consulter toutes les recommandations et commencer à les implémenter.

L'équipe Beriox AI`,
    variables: ['userName', 'recommendationCount', 'priorityRecommendations', 'performanceCount', 'securityCount', 'uxCount', 'businessCount', 'technicalCount'],
    category: 'recommendations'
  },
  {
    name: 'Mission Terminée',
    description: 'Notification de fin de mission',
    subject: 'Mission terminée - {{missionTitle}}',
    body: `Bonjour {{userName}},

Votre mission "{{missionTitle}}" a été terminée avec succès par {{agentName}}.

**Résumé de la mission :**
- Objectif : {{missionObjective}}
- Statut : Terminé
- Agent : {{agentName}}
- Durée : {{missionDuration}}

**Résultats :**
{{missionResults}}

Consultez le rapport complet dans votre dashboard pour plus de détails.

L'équipe Beriox AI`,
    variables: ['userName', 'missionTitle', 'agentName', 'missionObjective', 'missionDuration', 'missionResults'],
    category: 'missions'
  }
]
export async function createDefaultTemplates(messagingService: MessagingService, createdBy?: string) {
  console.log('📧 Création des templates d\'emails par défaut...')
  for (const template of defaultEmailTemplates) {
    try {
      await messagingService.createTemplate(template, createdBy)
      console.log(`✅ Template créé: ${template.name}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la création du template ${template.name}:`, error)
    }
  }
  
  console.log('✅ Templates d\'emails par défaut créés')
}
