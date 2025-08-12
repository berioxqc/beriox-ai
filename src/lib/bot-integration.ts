import { BotRecommendationEngine } from 'apos;./bot-recommendations'apos;;
import { prisma } from 'apos;./prisma.ts'apos;;

export interface BotIntegrationConfig {
  botId: string;
  botName: string;
  botType: string;
  capabilities: string[];
  autoRecommendations: boolean;
  recommendationInterval: number; // en heures
  lastAnalysis?: Date;
}

export class BotIntegrationManager {
  private configs: Map<string, BotIntegrationConfig> = new Map();

  constructor() {
    this.initializeDefaultBots();
  }

  /**
   * Initialiser les bots par défaut
   */
  private initializeDefaultBots() {
    const defaultBots: BotIntegrationConfig[] = [
      {
        botId: 'apos;karine'apos;,
        botName: 'apos;Karine'apos;,
        botType: 'apos;analyst'apos;,
        capabilities: ['apos;performance'apos;, 'apos;security'apos;, 'apos;ux'apos;],
        autoRecommendations: true,
        recommendationInterval: 24
      },
      {
        botId: 'apos;hugo'apos;,
        botName: 'apos;Hugo'apos;,
        botType: 'apos;developer'apos;,
        capabilities: ['apos;technical'apos;, 'apos;performance'apos;],
        autoRecommendations: true,
        recommendationInterval: 12
      },
      {
        botId: 'apos;jpbot'apos;,
        botName: 'apos;JP Bot'apos;,
        botType: 'apos;business'apos;,
        capabilities: ['apos;business'apos;, 'apos;ux'apos;],
        autoRecommendations: true,
        recommendationInterval: 48
      },
      {
        botId: 'apos;elodie'apos;,
        botName: 'apos;Elodie'apos;,
        botType: 'apos;qa'apos;,
        capabilities: ['apos;security'apos;, 'apos;ux'apos;, 'apos;technical'apos;],
        autoRecommendations: true,
        recommendationInterval: 6
      }
    ];

    defaultBots.forEach(bot => {
      this.configs.set(bot.botId, bot);
    });
  }

  /**
   * Enregistrer un nouveau bot
   */
  async registerBot(config: BotIntegrationConfig): Promise<void> {
    try {
      // Vérifier si le bot existe déjà en base
      const existingBot = await prisma.bot.findUnique({
        where: { id: config.botId }
      });

      if (!existingBot) {
        // Créer le bot en base
        await prisma.bot.create({
          data: {
            id: config.botId,
            name: config.botName,
            type: config.botType,
            capabilities: config.capabilities,
            isActive: true,
            userId: 'apos;system'apos;, // Bot système
            settings: {
              autoRecommendations: config.autoRecommendations,
              recommendationInterval: config.recommendationInterval
            }
          }
        });
      }

      this.configs.set(config.botId, config);
      console.log(`✅ Bot ${config.botName} enregistré avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'apos;enregistrement du bot ${config.botName}:`, error);
      throw error;
    }
  }

  /**
   * Générer des recommandations pour un bot spécifique
   */
  async generateBotRecommendations(botId: string, userId: string): Promise<any[]> {
    const config = this.configs.get(botId);
    if (!config) {
      throw new Error(`Bot ${botId} non trouvé`);
    }

    console.log(`🤖 ${config.botName} génère des recommandations...`);

    const engine = new BotRecommendationEngine(userId);
    const allRecommendations = await engine.generateRecommendations();

    // Filtrer les recommandations selon les capacités du bot
    const botRecommendations = allRecommendations.filter(rec => 
      config.capabilities.includes(rec.type)
    );

    // Ajouter l'apos;ID du bot à chaque recommandation
    const recommendationsWithBot = botRecommendations.map(rec => ({
      ...rec,
      botId: botId
    }));

    // Sauvegarder les recommandations
    if (recommendationsWithBot.length > 0) {
      await engine.saveRecommendations(recommendationsWithBot);
    }

    // Mettre à jour la date de dernière analyse
    config.lastAnalysis = new Date();
    this.configs.set(botId, config);

    console.log(`✅ ${config.botName} a généré ${recommendationsWithBot.length} recommandations`);
    return recommendationsWithBot;
  }

  /**
   * Générer des recommandations pour tous les bots
   */
  async generateAllBotRecommendations(userId: string): Promise<Map<string, any[]>> {
    const results = new Map<string, any[]>();

    for (const [botId, config] of this.configs) {
      if (config.autoRecommendations) {
        try {
          const recommendations = await this.generateBotRecommendations(botId, userId);
          results.set(botId, recommendations);
        } catch (error) {
          console.error(`❌ Erreur avec le bot ${config.botName}:`, error);
          results.set(botId, []);
        }
      }
    }

    return results;
  }

  /**
   * Vérifier si un bot doit générer des recommandations
   */
  shouldGenerateRecommendations(botId: string): boolean {
    const config = this.configs.get(botId);
    if (!config || !config.autoRecommendations) {
      return false;
    }

    if (!config.lastAnalysis) {
      return true;
    }

    const hoursSinceLastAnalysis = (Date.now() - config.lastAnalysis.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAnalysis >= config.recommendationInterval;
  }

  /**
   * Obtenir les statistiques des bots
   */
  async getBotStats(): Promise<any[]> {
    const stats = [];

    for (const [botId, config] of this.configs) {
      const recommendations = await prisma.botRecommendation.count({
        where: { botId: botId }
      });

      const pendingRecommendations = await prisma.botRecommendation.count({
        where: { 
          botId: botId,
          status: 'apos;pending'apos;
        }
      });

      const implementedRecommendations = await prisma.botRecommendation.count({
        where: { 
          botId: botId,
          status: 'apos;implemented'apos;
        }
      });

      stats.push({
        botId,
        botName: config.botName,
        botType: config.botType,
        capabilities: config.capabilities,
        totalRecommendations: recommendations,
        pendingRecommendations,
        implementedRecommendations,
        lastAnalysis: config.lastAnalysis,
        autoRecommendations: config.autoRecommendations
      });
    }

    return stats;
  }

  /**
   * Obtenir les recommandations d'apos;un bot
   */
  async getBotRecommendations(botId: string, userId: string, filters?: unknown): Promise<any[]> {
    const where: unknown = {
      botId: botId,
      userId: userId
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.priority) where.priority = filters.priority;

    return await prisma.botRecommendation.findMany({
      where,
      orderBy: [
        { priority: 'apos;desc'apos; },
        { createdAt: 'apos;desc'apos; }
      ],
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        mission: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  }

  /**
   * Mettre à jour la configuration d'apos;un bot
   */
  async updateBotConfig(botId: string, updates: Partial<BotIntegrationConfig>): Promise<void> {
    const config = this.configs.get(botId);
    if (!config) {
      throw new Error(`Bot ${botId} non trouvé`);
    }

    // Mettre à jour la configuration en mémoire
    const updatedConfig = { ...config, ...updates };
    this.configs.set(botId, updatedConfig);

    // Mettre à jour en base de données
    await prisma.bot.update({
      where: { id: botId },
      data: {
        name: updatedConfig.botName,
        type: updatedConfig.botType,
        capabilities: updatedConfig.capabilities,
        settings: {
          autoRecommendations: updatedConfig.autoRecommendations,
          recommendationInterval: updatedConfig.recommendationInterval
        }
      }
    });

    console.log(`✅ Configuration du bot ${updatedConfig.botName} mise à jour`);
  }

  /**
   * Désactiver/activer les recommandations automatiques pour un bot
   */
  async toggleAutoRecommendations(botId: string, enabled: boolean): Promise<void> {
    await this.updateBotConfig(botId, { autoRecommendations: enabled });
  }

  /**
   * Obtenir la liste des bots disponibles
   */
  getAvailableBots(): BotIntegrationConfig[] {
    return Array.from(this.configs.values());
  }
}

// Instance singleton
export const botIntegrationManager = new BotIntegrationManager();
