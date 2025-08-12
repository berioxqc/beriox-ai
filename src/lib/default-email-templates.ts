import { MessagingService } from 'apos;./messaging-service'apos;;

export const defaultEmailTemplates = [
  {
    name: 'apos;Bienvenue Beriox'apos;,
    description: 'apos;Email de bienvenue pour les nouveaux utilisateurs'apos;,
    subject: 'apos;Bienvenue chez Beriox AI - Votre équipe d\'apos;agents IA'apos;,
    body: `Bonjour {{userName}},

Bienvenue chez Beriox AI ! Nous sommes ravis de vous compter parmi nos utilisateurs.

Beriox AI vous offre une équipe d'apos;agents IA spécialisés pour automatiser et optimiser vos processus business :

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

Bienvenue dans l'apos;avenir de l'apos;automatisation !

L'apos;équipe Beriox AI`,
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
        
        <p>Beriox AI vous offre une équipe d'apos;agents IA spécialisés pour automatiser et optimiser vos processus business :</p>
        
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
            Bienvenue dans l'apos;avenir de l'apos;automatisation !
        </p>
        
        <p style="text-align: center;">
            L'apos;équipe Beriox AI
        </p>
    </div>
</body>
</html>`,
    variables: ['apos;userName'apos;],
    category: 'apos;welcome'apos;
  },
  {
    name: 'apos;Support Ticket Créé'apos;,
    description: 'apos;Confirmation de création d\'apos;un ticket de support'apos;,
    subject: 'apos;Ticket de support créé - {{ticketNumber}}'apos;,
    body: `Bonjour {{userName}},

Votre ticket de support a été créé avec succès.

**Détails du ticket :**
- Numéro : {{ticketNumber}}
- Sujet : {{ticketSubject}}
- Catégorie : {{ticketCategory}}
- Priorité : {{ticketPriority}}

Notre équipe va traiter votre demande dans les plus brefs délais. Vous recevrez une notification dès qu'apos;une réponse sera disponible.

Vous pouvez suivre l'apos;état de votre ticket depuis votre dashboard.

Merci de votre patience.

L'apos;équipe support Beriox AI`,
    variables: ['apos;userName'apos;, 'apos;ticketNumber'apos;, 'apos;ticketSubject'apos;, 'apos;ticketCategory'apos;, 'apos;ticketPriority'apos;],
    category: 'apos;support'apos;
  },
  {
    name: 'apos;Réponse Support'apos;,
    description: 'apos;Réponse à un ticket de support'apos;,
    subject: 'apos;Re: {{ticketSubject}} - {{ticketNumber}}'apos;,
    body: `Bonjour {{userName}},

Voici la réponse à votre ticket de support {{ticketNumber}} :

{{responseMessage}}

Si vous avez d'apos;autres questions, n'apos;hésitez pas à nous contacter.

Cordialement,
L'apos;équipe support Beriox AI`,
    variables: ['apos;userName'apos;, 'apos;ticketNumber'apos;, 'apos;ticketSubject'apos;, 'apos;responseMessage'apos;],
    category: 'apos;support'apos;
  },
  {
    name: 'apos;Recommandations IA'apos;,
    description: 'apos;Notification de nouvelles recommandations IA'apos;,
    subject: 'apos;Nouvelles recommandations IA disponibles - {{recommendationCount}} suggestions'apos;,
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

L'apos;équipe Beriox AI`,
    variables: ['apos;userName'apos;, 'apos;recommendationCount'apos;, 'apos;priorityRecommendations'apos;, 'apos;performanceCount'apos;, 'apos;securityCount'apos;, 'apos;uxCount'apos;, 'apos;businessCount'apos;, 'apos;technicalCount'apos;],
    category: 'apos;recommendations'apos;
  },
  {
    name: 'apos;Mission Terminée'apos;,
    description: 'apos;Notification de fin de mission'apos;,
    subject: 'apos;Mission terminée - {{missionTitle}}'apos;,
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

L'apos;équipe Beriox AI`,
    variables: ['apos;userName'apos;, 'apos;missionTitle'apos;, 'apos;agentName'apos;, 'apos;missionObjective'apos;, 'apos;missionDuration'apos;, 'apos;missionResults'apos;],
    category: 'apos;missions'apos;
  }
];

export async function createDefaultTemplates(messagingService: MessagingService, createdBy?: string) {
  console.log('apos;📧 Création des templates d\'apos;emails par défaut...'apos;);
  
  for (const template of defaultEmailTemplates) {
    try {
      await messagingService.createTemplate(template, createdBy);
      console.log(`✅ Template créé: ${template.name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du template ${template.name}:`, error);
    }
  }
  
  console.log('apos;✅ Templates d\'apos;emails par défaut créés'apos;);
}
