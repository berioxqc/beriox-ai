"use client";
import React from 'apos;react'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

interface BriefCardProps {
  brief: {
    id: string;
    agent: string;
    contentJson: any;
    status: string;
    createdAt: string;
  };
  agentInfo: {
    name: string;
    role: string;
    color: string;
    icon: string;
    age: number;
  };
  onRestart?: (agentName: string) => void;
}

export const BriefCard: React.FC<BriefCardProps> = ({ brief, agentInfo, onRestart }) => {
  // Fonction pour formater le contenu du brief
  const formatBriefContent = (contentJson: any): string => {
    if (typeof contentJson === 'apos;string'apos;) {
      return contentJson;
    }
    if (contentJson.brief) {
      return contentJson.brief;
    }
    if (contentJson.content) {
      return contentJson.content;
    }
    return JSON.stringify(contentJson, null, 2);
  };

  // Fonction pour formater le contenu en HTML avec style
  const formatAsStyledHtml = (content: string): JSX.Element => {
    const lines = content.split('apos;\n'apos;);
    return (
      <div style={{ lineHeight: 'apos;1.6'apos; }}>
        {lines.map((line, index) => {
          // Titres
          if (line.startsWith('apos;# 'apos;)) {
            return (
              <h3 key={index} style={{ 
                fontSize: 'apos;18px'apos;, 
                fontWeight: 'apos;700'apos;, 
                color: 'apos;#0a2540'apos;, 
                marginBottom: 'apos;12px'apos;, 
                marginTop: index > 0 ? 'apos;24px'apos; : 'apos;0'apos;,
                borderBottom: `2px solid ${agentInfo.color}`,
                paddingBottom: 'apos;4px'apos;
              }}>
                {line.substring(2)}
              </h3>
            );
          }
          if (line.startsWith('apos;## 'apos;)) {
            return (
              <h4 key={index} style={{ 
                fontSize: 'apos;16px'apos;, 
                fontWeight: 'apos;600'apos;, 
                color: agentInfo.color, 
                marginBottom: 'apos;8px'apos;, 
                marginTop: 'apos;20px'apos;
              }}>
                {line.substring(3)}
              </h4>
            );
          }
          if (line.startsWith('apos;### 'apos;)) {
            return (
              <h5 key={index} style={{ 
                fontSize: 'apos;14px'apos;, 
                fontWeight: 'apos;600'apos;, 
                color: 'apos;#425466'apos;, 
                marginBottom: 'apos;6px'apos;, 
                marginTop: 'apos;16px'apos; 
              }}>
                {line.substring(4)}
              </h5>
            );
          }
          
          // Listes
          if (line.startsWith('apos;- 'apos;)) {
            return (
              <div key={index} style={{ 
                marginLeft: 'apos;16px'apos;, 
                marginBottom: 'apos;8px'apos;,
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;
              }}>
                <span style={{ 
                  color: agentInfo.color, 
                  marginRight: 'apos;8px'apos;, 
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;bold'apos;
                }}>•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          
          // Gras
          if (line.includes('apos;**'apos;)) {
            const parts = line.split('apos;**'apos;);
            return (
              <div key={index} style={{ marginBottom: 'apos;8px'apos; }}>
                {parts.map((part, i) => 
                  i % 2 === 1 ? 
                    <strong key={i} style={{ color: agentInfo.color }}>{part}</strong> : 
                    part
                )}
              </div>
            );
          }
          
          // Ligne vide
          if (line.trim() === 'apos;'apos;) {
            return <div key={index} style={{ height: 'apos;12px'apos; }} />;
          }
          
          // Texte normal
          return (
            <div key={index} style={{ 
              marginBottom: 'apos;8px'apos;,
              fontSize: 'apos;14px'apos;,
              lineHeight: 'apos;1.6'apos;
            }}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  const content = formatBriefContent(brief.contentJson);
  const formattedDate = new Date(brief.createdAt).toLocaleString('apos;fr-FR'apos;, {
    day: 'apos;2-digit'apos;,
    month: 'apos;2-digit'apos;,
    year: 'apos;numeric'apos;,
    hour: 'apos;2-digit'apos;,
    minute: 'apos;2-digit'apos;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'apos;completed'apos;:
        return { label: 'apos;Terminé'apos;, color: 'apos;#10b981'apos;, bgColor: 'apos;#d1fae5'apos; };
      case 'apos;in_progress'apos;:
        return { label: 'apos;En cours'apos;, color: 'apos;#f59e0b'apos;, bgColor: 'apos;#fef3c7'apos; };
      case 'apos;queued'apos;:
        return { label: 'apos;En attente'apos;, color: 'apos;#6b7280'apos;, bgColor: 'apos;#f3f4f6'apos; };
      case 'apos;failed'apos;:
        return { label: 'apos;Échoué'apos;, color: 'apos;#ef4444'apos;, bgColor: 'apos;#fee2e2'apos; };
      default:
        return { label: status, color: 'apos;#6b7280'apos;, bgColor: 'apos;#f3f4f6'apos; };
    }
  };

  const statusInfo = getStatusInfo(brief.status);

  return (
    <div style={{
      backgroundColor: 'apos;white'apos;,
      borderRadius: 'apos;16px'apos;,
      border: `2px solid ${agentInfo.color}20`,
      boxShadow: 'apos;0 4px 20px rgba(0, 0, 0, 0.08)'apos;,
      overflow: 'apos;hidden'apos;,
      marginBottom: 'apos;20px'apos;,
      transition: 'apos;all 0.3s ease'apos;,
      animation: 'apos;slideIn 0.5s ease-out'apos;
    }}>
      {/* En-tête de la carte */}
      <div style={{
        backgroundColor: `${agentInfo.color}10`,
        padding: 'apos;16px 20px'apos;,
        borderBottom: `1px solid ${agentInfo.color}20`,
        display: 'apos;flex'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;space-between'apos;
      }}>
        <div style={{
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          gap: 'apos;12px'apos;
        }}>
          {/* Avatar de l'apos;agent */}
          <div style={{
            width: 'apos;40px'apos;,
            height: 'apos;40px'apos;,
            borderRadius: 'apos;50%'apos;,
            backgroundColor: agentInfo.color,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            color: 'apos;white'apos;,
            fontSize: 'apos;16px'apos;,
            fontWeight: 'apos;bold'apos;
          }}>
            <Icon name={agentInfo.icon} size="1x" />
          </div>
          
          {/* Informations de l'apos;agent */}
          <div>
            <div style={{
              fontSize: 'apos;16px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;2px'apos;
            }}>
              {agentInfo.name}
            </div>
            <div style={{
              fontSize: 'apos;12px'apos;,
              color: 'apos;#64748b'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <span>{agentInfo.role}</span>
              <span>•</span>
              <span>{agentInfo.age} ans</span>
            </div>
          </div>
        </div>
        
        {/* Statut et actions */}
        <div style={{
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          gap: 'apos;12px'apos;
        }}>
          {/* Statut */}
          <div style={{
            padding: 'apos;4px 12px'apos;,
            borderRadius: 'apos;20px'apos;,
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.color,
            fontSize: 'apos;12px'apos;,
            fontWeight: 'apos;500'apos;
          }}>
            {statusInfo.label}
          </div>
          
          {/* Bouton de redémarrage */}
          {onRestart && (
            <button
              onClick={() => onRestart(agentInfo.name)}
              style={{
                padding: 'apos;6px 12px'apos;,
                borderRadius: 'apos;8px'apos;,
                backgroundColor: agentInfo.color,
                color: 'apos;white'apos;,
                border: 'apos;none'apos;,
                fontSize: 'apos;12px'apos;,
                fontWeight: 'apos;500'apos;,
                cursor: 'apos;pointer'apos;,
                transition: 'apos;all 0.2s ease'apos;,
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;6px'apos;
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${agentInfo.color}dd`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = agentInfo.color;
              }}
            >
              <Icon name="refresh" size="xs" />
              Redémarrer
            </button>
          )}
        </div>
      </div>
      
      {/* Contenu du brief */}
      <div style={{
        padding: 'apos;20px'apos;,
        color: 'apos;#374151'apos;,
        fontSize: 'apos;14px'apos;
      }}>
        {formatAsStyledHtml(content)}
        
        {/* Métadonnées */}
        <div style={{
          marginTop: 'apos;16px'apos;,
          paddingTop: 'apos;12px'apos;,
          borderTop: `1px solid ${agentInfo.color}20`,
          fontSize: 'apos;12px'apos;,
          color: 'apos;#6b7280'apos;,
          display: 'apos;flex'apos;,
          justifyContent: 'apos;space-between'apos;,
          alignItems: 'apos;center'apos;
        }}>
          <span>Créé le {formattedDate}</span>
          <span style={{ fontStyle: 'apos;italic'apos; }}>
            Brief pour {agentInfo.name}
          </span>
        </div>
      </div>
    </div>
  );
};

// Styles CSS pour l'apos;animation
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Injecter les styles
if (typeof document !== 'apos;undefined'apos;) {
  const styleSheet = document.createElement('apos;style'apos;);
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default BriefCard;
