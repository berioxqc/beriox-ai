'apos;use client'apos;;

import { useState, useEffect } from 'apos;react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import Layout from 'apos;@/components/Layout'apos;;
import { ApiIntegration } from 'apos;@/lib/integrations/types'apos;;

interface IntegrationConfig {
  [key: string]: any;
}

export default function IntegrationsPage() {
  const theme = useTheme();
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('apos;all'apos;);
  const [configModal, setConfigModal] = useState<{ integration: ApiIntegration; config: IntegrationConfig } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('apos;/api/integrations'apos;);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('apos;Erreur lors du chargement des intégrations:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('apos;/api/integrations/toggle'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
      console.error('apos;Erreur lors de la mise à jour:'apos;, error);
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
      const response = await fetch('apos;/api/integrations/config'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
      console.error('apos;Erreur lors de la sauvegarde:'apos;, error);
    }
  };

  const categories = [
    { id: 'apos;all'apos;, name: 'apos;Toutes'apos;, icon: 'apos;list'apos; },
    { id: 'apos;seo'apos;, name: 'apos;SEO'apos;, icon: 'apos;search'apos; },
    { id: 'apos;analytics'apos;, name: 'apos;Analytics'apos;, icon: 'apos;chart-line'apos; },
    { id: 'apos;performance'apos;, name: 'apos;Performance'apos;, icon: 'apos;tachometer-alt'apos; },
    { id: 'apos;security'apos;, name: 'apos;Sécurité'apos;, icon: 'apos;shield'apos; },
    { id: 'apos;monitoring'apos;, name: 'apos;Monitoring'apos;, icon: 'apos;heartbeat'apos; },
    { id: 'apos;ux'apos;, name: 'apos;UX'apos;, icon: 'apos;mouse-pointer'apos; },
    { id: 'apos;accessibility'apos;, name: 'apos;Accessibilité'apos;, icon: 'apos;universal-access'apos; },
    { id: 'apos;development'apos;, name: 'apos;Dev'apos;, icon: 'apos;code'apos; },
    { id: 'apos;communication'apos;, name: 'apos;Communication'apos;, icon: 'apos;comments'apos; },
  ];

  const filteredIntegrations = activeTab === 'apos;all'apos; 
    ? integrations 
    : integrations.filter(integration => integration.category === activeTab);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || 'apos;plug'apos;;
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
        <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;center'apos;, alignItems: 'apos;center'apos;, minHeight: 'apos;400px'apos; }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: 'apos;32px'apos;, color: theme.colors.neutral[400] }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 'apos;1200px'apos;, margin: 'apos;0 auto'apos;, padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h1 style={{
            fontSize: 'apos;2rem'apos;,
            fontWeight: 'apos;bold'apos;,
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
          display: 'apos;flex'apos;,
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl,
          flexWrap: 'apos;wrap'apos;
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: theme.spacing.xs,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: 'apos;8px'apos;,
                border: 'apos;none'apos;,
                backgroundColor: activeTab === category.id ? theme.colors.primary.main : 'apos;white'apos;,
                color: activeTab === category.id ? 'apos;white'apos; : theme.colors.neutral[700],
                cursor: 'apos;pointer'apos;,
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;500'apos;,
                transition: 'apos;all 0.2s'apos;
              }}
            >
              <FontAwesomeIcon icon={category.icon as any} />
              {category.name}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(auto-fill, minmax(350px, 1fr))'apos;,
          gap: theme.spacing.lg
        }}>
          {filteredIntegrations.map(integration => (
            <div
              key={integration.id}
              style={{
                backgroundColor: 'apos;white'apos;,
                borderRadius: 'apos;12px'apos;,
                padding: theme.spacing.lg,
                boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
                border: `2px solid ${integration.isEnabled ? theme.colors.primary.light : theme.colors.neutral[200]}`,
                transition: 'apos;all 0.2s'apos;
              }}
            >
              {/* Header */}
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                justifyContent: 'apos;space-between'apos;,
                marginBottom: theme.spacing.md
              }}>
                <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.sm }}>
                  <div style={{
                    width: 'apos;40px'apos;,
                    height: 'apos;40px'apos;,
                    borderRadius: 'apos;8px'apos;,
                    backgroundColor: `${getStatusColor(integration)}20`,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    justifyContent: 'apos;center'apos;
                  }}>
                    <FontAwesomeIcon 
                      icon={getCategoryIcon(integration.category) as any}
                      style={{ color: getStatusColor(integration), fontSize: 'apos;18px'apos; }}
                    />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 'apos;16px'apos;,
                      fontWeight: 'apos;bold'apos;,
                      color: theme.colors.neutral[900],
                      margin: 0
                    }}>
                      {integration.name}
                    </h3>
                    <div style={{
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;center'apos;,
                      gap: theme.spacing.xs,
                      marginTop: 'apos;2px'apos;
                    }}>
                      <span style={{
                        fontSize: 'apos;12px'apos;,
                        color: integration.isFree ? theme.colors.success : theme.colors.warning,
                        fontWeight: 'apos;500'apos;
                      }}>
                        {integration.isFree ? 'apos;Gratuit'apos; : 'apos;Payant'apos;}
                      </span>
                      <span style={{
                        width: 'apos;4px'apos;,
                        height: 'apos;4px'apos;,
                        borderRadius: 'apos;50%'apos;,
                        backgroundColor: theme.colors.neutral[300]
                      }} />
                      <span style={{
                        fontSize: 'apos;12px'apos;,
                        color: theme.colors.neutral[500],
                        textTransform: 'apos;capitalize'apos;
                      }}>
                        {integration.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label style={{
                  position: 'apos;relative'apos;,
                  display: 'apos;inline-block'apos;,
                  width: 'apos;44px'apos;,
                  height: 'apos;24px'apos;,
                  cursor: 'apos;pointer'apos;
                }}>
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={(e) => toggleIntegration(integration.id, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'apos;absolute'apos;,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: integration.isEnabled ? theme.colors.primary.main : theme.colors.neutral[300],
                    borderRadius: 'apos;24px'apos;,
                    transition: 'apos;all 0.2s'apos;,
                    cursor: 'apos;pointer'apos;
                  }}>
                    <span style={{
                      position: 'apos;absolute'apos;,
                      content: 'apos;""'apos;,
                      height: 'apos;18px'apos;,
                      width: 'apos;18px'apos;,
                      left: integration.isEnabled ? 'apos;23px'apos; : 'apos;3px'apos;,
                      bottom: 'apos;3px'apos;,
                      backgroundColor: 'apos;white'apos;,
                      borderRadius: 'apos;50%'apos;,
                      transition: 'apos;all 0.2s'apos;
                    }} />
                  </span>
                </label>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: theme.colors.neutral[600],
                lineHeight: 'apos;1.5'apos;,
                marginBottom: theme.spacing.md
              }}>
                {integration.description}
              </p>

              {/* Quota */}
              {integration.quotaLimit && (
                <div style={{ marginBottom: theme.spacing.md }}>
                  <div style={{
                    display: 'apos;flex'apos;,
                    justifyContent: 'apos;space-between'apos;,
                    alignItems: 'apos;center'apos;,
                    marginBottom: theme.spacing.xs
                  }}>
                    <span style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
                      Quota utilisé
                    </span>
                    <span style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[700], fontWeight: 'apos;500'apos; }}>
                      {integration.quotaUsed || 0} / {integration.quotaLimit}
                    </span>
                  </div>
                  <div style={{
                    width: 'apos;100%'apos;,
                    height: 'apos;4px'apos;,
                    backgroundColor: theme.colors.neutral[200],
                    borderRadius: 'apos;2px'apos;,
                    overflow: 'apos;hidden'apos;
                  }}>
                    <div style={{
                      width: `${Math.min(100, ((integration.quotaUsed || 0) / integration.quotaLimit) * 100)}%`,
                      height: 'apos;100%'apos;,
                      backgroundColor: getStatusColor(integration),
                      transition: 'apos;width 0.3s'apos;
                    }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'apos;flex'apos;,
                gap: theme.spacing.sm
              }}>
                <button
                  onClick={() => openConfigModal(integration)}
                  disabled={!integration.isEnabled}
                  style={{
                    flex: 1,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: 'apos;6px'apos;,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    backgroundColor: 'apos;white'apos;,
                    color: integration.isEnabled ? theme.colors.neutral[700] : theme.colors.neutral[400],
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;500'apos;,
                    cursor: integration.isEnabled ? 'apos;pointer'apos; : 'apos;not-allowed'apos;,
                    transition: 'apos;all 0.2s'apos;
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
                      borderRadius: 'apos;6px'apos;,
                      border: 'apos;none'apos;,
                      backgroundColor: theme.colors.primary.main,
                      color: 'apos;white'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;500'apos;,
                      cursor: 'apos;pointer'apos;,
                      transition: 'apos;all 0.2s'apos;
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
            position: 'apos;fixed'apos;,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'apos;rgba(0, 0, 0, 0.6)'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: theme.spacing.xl,
              maxWidth: 'apos;500px'apos;,
              width: 'apos;90%'apos;,
              maxHeight: 'apos;80vh'apos;,
              overflow: 'apos;auto'apos;
            }}>
              <div style={{
                display: 'apos;flex'apos;,
                justifyContent: 'apos;space-between'apos;,
                alignItems: 'apos;center'apos;,
                marginBottom: theme.spacing.lg
              }}>
                <h3 style={{
                  fontSize: 'apos;18px'apos;,
                  fontWeight: 'apos;bold'apos;,
                  color: theme.colors.neutral[900],
                  margin: 0
                }}>
                  Configuration {configModal.integration.name}
                </h3>
                <button
                  onClick={() => setConfigModal(null)}
                  style={{
                    background: 'apos;none'apos;,
                    border: 'apos;none'apos;,
                    fontSize: 'apos;20px'apos;,
                    color: theme.colors.neutral[500],
                    cursor: 'apos;pointer'apos;
                  }}
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </div>

              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{
                  display: 'apos;block'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;500'apos;,
                  color: theme.colors.neutral[700],
                  marginBottom: theme.spacing.sm
                }}>
                  Clé API / Token
                </label>
                <input
                  type="password"
                  value={configModal.config.apiKey || 'apos;'apos;}
                  onChange={(e) => setConfigModal({
                    ...configModal,
                    config: { ...configModal.config, apiKey: e.target.value }
                  })}
                  placeholder="Entrez votre clé API..."
                  style={{
                    width: 'apos;100%'apos;,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: 'apos;6px'apos;,
                    fontSize: 'apos;14px'apos;
                  }}
                />
              </div>

              <div style={{
                display: 'apos;flex'apos;,
                gap: theme.spacing.sm,
                justifyContent: 'apos;flex-end'apos;
              }}>
                <button
                  onClick={() => setConfigModal(null)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: 'apos;6px'apos;,
                    backgroundColor: 'apos;white'apos;,
                    color: theme.colors.neutral[700],
                    cursor: 'apos;pointer'apos;
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveConfig}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    border: 'apos;none'apos;,
                    borderRadius: 'apos;6px'apos;,
                    backgroundColor: theme.colors.primary.main,
                    color: 'apos;white'apos;,
                    cursor: 'apos;pointer'apos;,
                    fontWeight: 'apos;500'apos;
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
