import { ApiIntegration, ApiResponse } from './types';

// Gestionnaire central pour toutes les intégrations API
export class IntegrationManager {
  private integrations: Map<string, ApiIntegration> = new Map();

  // Enregistrer une intégration
  register(integration: ApiIntegration) {
    this.integrations.set(integration.id, integration);
  }

  // Obtenir toutes les intégrations
  getAll(): ApiIntegration[] {
    return Array.from(this.integrations.values());
  }

  // Obtenir les intégrations par catégorie
  getByCategory(category: string): ApiIntegration[] {
    return this.getAll().filter(integration => integration.category === category);
  }

  // Obtenir les intégrations actives
  getEnabled(): ApiIntegration[] {
    return this.getAll().filter(integration => integration.isEnabled);
  }

  // Obtenir les intégrations gratuites
  getFree(): ApiIntegration[] {
    return this.getAll().filter(integration => integration.isFree);
  }

  // Activer/désactiver une intégration
  toggle(id: string, enabled: boolean): boolean {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.isEnabled = enabled;
      return true;
    }
    return false;
  }

  // Mettre à jour la configuration d'une intégration
  updateConfig(id: string, config: Record<string, any>): boolean {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.config = { ...integration.config, ...config };
      return true;
    }
    return false;
  }

  // Mettre à jour l'utilisation des quotas
  updateQuota(id: string, used: number): boolean {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.quotaUsed = used;
      integration.lastSync = new Date();
      return true;
    }
    return false;
  }

  // Vérifier si une intégration peut être utilisée (quota)
  canUse(id: string): boolean {
    const integration = this.integrations.get(id);
    if (!integration || !integration.isEnabled) {
      return false;
    }
    
    if (integration.quotaLimit && integration.quotaUsed) {
      return integration.quotaUsed < integration.quotaLimit;
    }
    
    return true;
  }

  // Obtenir le statut des quotas
  getQuotaStatus(id: string): { used: number; limit: number; percentage: number } | null {
    const integration = this.integrations.get(id);
    if (!integration || !integration.quotaLimit) {
      return null;
    }
    
    const used = integration.quotaUsed || 0;
    const limit = integration.quotaLimit;
    const percentage = Math.round((used / limit) * 100);
    
    return { used, limit, percentage };
  }
}

// Instance globale
export const integrationManager = new IntegrationManager();
