'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';
import { ApiIntegration } from '@/lib/integrations/types';

interface IntegrationConfig {
  [key: string]: any;
}

export default function IntegrationsPage() {
  const theme = useTheme();
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [configModal, setConfigModal] = useState<{ integration: ApiIntegration; config: IntegrationConfig } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des intégrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });

      if (response.ok) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === id ? { ...integration, isEnabled: enabled } : integration
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const openConfigModal = (integration: ApiIntegration) => {
    setConfigModal({
      integration,
      config: integration.config || {},
    });
  };

  const saveConfig = async () => {
    if (!configModal) return;

    try {
      const response = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: configModal.integration.id,
          config: configModal.config,
        }),
      });

      if (response.ok) {
        setIntegrations(prev =>
          prev.map(integration =>
            integration.id === configModal.integration.id
              ? { ...integration, config: configModal.config }
              : integration
          )
        );
        setConfigModal(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: 'list' },
    { id: 'seo', name: 'SEO', icon: 'search' },
    { id: 'analytics', name: 'Analytics', icon: 'chart-line' },
    { id: 'performance', name: 'Performance', icon: 'tachometer-alt' },
    { id: 'security', name: 'Sécurité', icon: 'shield' },
    { id: 'monitoring', name: 'Monitoring', icon: 'heartbeat' },
    { id: 'ux', name: 'UX', icon: 'mouse-pointer' },
    { id: 'accessibility', name: 'Accessibilité', icon: 'universal-access' },
    { id: 'development', name: 'Dev', icon: 'code' },
    { id: 'communication', name: 'Communication', icon: 'comments' },
  ];

  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === activeTab);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || 'plug';
  };

  const getStatusColor = (integration: ApiIntegration) => {
    if (!integration.isEnabled) return theme.colors.neutral[400];
    if (integration.quotaLimit && integration.quotaUsed) {
      const percentage = (integration.quotaUsed / integration.quotaLimit) * 100;
      if (percentage > 90) return theme.colors.error;
      if (percentage > 70) return theme.colors.warning;
    }
    return theme.colors.success;
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '32px', color: theme.colors.neutral[400] }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="plug" style={{ marginRight: theme.spacing.sm, color: theme.colors.primary.main }} />
            Intégrations API
          </h1>
          <p style={{ color: theme.colors.neutral[600] }}>
            Gérez vos intégrations avec les services externes pour enrichir vos analyses.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl,
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === category.id ? theme.colors.primary.main : 'white',
                color: activeTab === category.id ? 'white' : theme.colors.neutral[700],
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <FontAwesomeIcon icon={category.icon as any} />
              {category.name}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {filteredIntegrations.map(integration => (
            <div
              key={integration.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: theme.spacing.lg,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: `2px solid ${integration.isEnabled ? theme.colors.primary.light : theme.colors.neutral[200]}`,
                transition: 'all 0.2s'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: `${getStatusColor(integration)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FontAwesomeIcon 
                      icon={getCategoryIcon(integration.category) as any}
                      style={{ color: getStatusColor(integration), fontSize: '18px' }}
                    />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: theme.colors.neutral[900],
                      margin: 0
                    }}>
                      {integration.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                      marginTop: '2px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: integration.isFree ? theme.colors.success : theme.colors.warning,
                        fontWeight: '500'
                      }}>
                        {integration.isFree ? 'Gratuit' : 'Payant'}
                      </span>
                      <span style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: theme.colors.neutral[300]
                      }} />
                      <span style={{
                        fontSize: '12px',
                        color: theme.colors.neutral[500],
                        textTransform: 'capitalize'
                      }}>
                        {integration.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={(e) => toggleIntegration(integration.id, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: integration.isEnabled ? theme.colors.primary.main : theme.colors.neutral[300],
                    borderRadius: '24px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: integration.isEnabled ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }} />
                  </span>
                </label>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: theme.colors.neutral[600],
                lineHeight: '1.5',
                marginBottom: theme.spacing.md
              }}>
                {integration.description}
              </p>

              {/* Quota */}
              {integration.quotaLimit && (
                <div style={{ marginBottom: theme.spacing.md }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.xs
                  }}>
                    <span style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
                      Quota utilisé
                    </span>
                    <span style={{ fontSize: '12px', color: theme.colors.neutral[700], fontWeight: '500' }}>
                      {integration.quotaUsed || 0} / {integration.quotaLimit}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: theme.colors.neutral[200],
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, ((integration.quotaUsed || 0) / integration.quotaLimit) * 100)}%`,
                      height: '100%',
                      backgroundColor: getStatusColor(integration),
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: theme.spacing.sm
              }}>
                <button
                  onClick={() => openConfigModal(integration)}
                  disabled={!integration.isEnabled}
                  style={{
                    flex: 1,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: '6px',
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    backgroundColor: 'white',
                    color: integration.isEnabled ? theme.colors.neutral[700] : theme.colors.neutral[400],
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: integration.isEnabled ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <FontAwesomeIcon icon="cog" style={{ marginRight: theme.spacing.xs }} />
                  Configurer
                </button>

                {integration.isEnabled && (
                  <button
                    onClick={() => {/* Test connection */}}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: theme.colors.primary.main,
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FontAwesomeIcon icon="play" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Modal */}
        {configModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: theme.spacing.xl,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.lg
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: theme.colors.neutral[900],
                  margin: 0
                }}>
                  Configuration {configModal.integration.name}
                </h3>
                <button
                  onClick={() => setConfigModal(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: theme.colors.neutral[500],
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </div>

              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.colors.neutral[700],
                  marginBottom: theme.spacing.sm
                }}>
                  Clé API / Token
                </label>
                <input
                  type="password"
                  value={configModal.config.apiKey || ''}
                  onChange={(e) => setConfigModal({
                    ...configModal,
                    config: { ...configModal.config, apiKey: e.target.value }
                  })}
                  placeholder="Entrez votre clé API..."
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setConfigModal(null)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: theme.colors.neutral[700],
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveConfig}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: theme.colors.primary.main,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
