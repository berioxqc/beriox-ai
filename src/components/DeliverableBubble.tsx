"use client";
import React from 'apos;react'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

interface DeliverableBubbleProps {
  deliverable: {
    id: string;
    agent: string;
    output: any;
    createdAt: string;
  };
  agentInfo: {
    name: string;
    role: string;
    color: string;
    icon: string;
    age: number;
  };
}

export const DeliverableBubble: React.FC<DeliverableBubbleProps> = ({ deliverable, agentInfo }) => {
  // Fonction pour formater le contenu
  const formatContent = (content: any): string => {
    if (typeof content === 'apos;string'apos;) {
      return content;
    }
    if (typeof content === 'apos;object'apos; && content.content) {
      return content.content;
    }
    if (typeof content === 'apos;object'apos; && content.response) {
      return content.response;
    }
    return JSON.stringify(content, null, 2);
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
                color: 'apos;#0a2540'apos;, 
                marginBottom: 'apos;8px'apos;, 
                marginTop: 'apos;20px'apos;,
                color: agentInfo.color
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

  const content = formatContent(deliverable.output);
  const formattedDate = new Date(deliverable.createdAt).toLocaleString('apos;fr-FR'apos;, {
    day: 'apos;2-digit'apos;,
    month: 'apos;2-digit'apos;,
    year: 'apos;numeric'apos;,
    hour: 'apos;2-digit'apos;,
    minute: 'apos;2-digit'apos;
  });

  return (
    <div style={{
      marginBottom: 'apos;24px'apos;,
      animation: 'apos;slideIn 0.5s ease-out'apos;
    }}>
      {/* En-tête de la bulle */}
      <div style={{
        display: 'apos;flex'apos;,
        alignItems: 'apos;center'apos;,
        marginBottom: 'apos;12px'apos;,
        gap: 'apos;12px'apos;
      }}>
        {/* Avatar de l'apos;agent */}
        <div style={{
          width: 'apos;48px'apos;,
          height: 'apos;48px'apos;,
          borderRadius: 'apos;50%'apos;,
          backgroundColor: agentInfo.color,
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          justifyContent: 'apos;center'apos;,
          color: 'apos;white'apos;,
          fontSize: 'apos;20px'apos;,
          fontWeight: 'apos;bold'apos;,
          boxShadow: `0 4px 12px ${agentInfo.color}40`
        }}>
          <Icon name={agentInfo.icon} size="lg" />
        </div>
        
        {/* Informations de l'apos;agent */}
        <div style={{ flex: 1 }}>
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
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        {/* Indicateur de statut */}
        <div style={{
          padding: 'apos;4px 12px'apos;,
          borderRadius: 'apos;20px'apos;,
          backgroundColor: 'apos;#10b981'apos;,
          color: 'apos;white'apos;,
          fontSize: 'apos;12px'apos;,
          fontWeight: 'apos;500'apos;
        }}>
          Livré
        </div>
      </div>
      
      {/* Contenu de la bulle */}
      <div style={{
        backgroundColor: 'apos;white'apos;,
        borderRadius: 'apos;16px'apos;,
        padding: 'apos;20px'apos;,
        border: `2px solid ${agentInfo.color}20`,
        boxShadow: 'apos;0 4px 20px rgba(0, 0, 0, 0.08)'apos;,
        position: 'apos;relative'apos;,
        marginLeft: 'apos;60px'apos;
      }}>
        {/* Pointe de la bulle */}
        <div style={{
          position: 'apos;absolute'apos;,
          left: 'apos;-8px'apos;,
          top: 'apos;20px'apos;,
          width: 'apos;0'apos;,
          height: 'apos;0'apos;,
          borderTop: 'apos;8px solid transparent'apos;,
          borderBottom: 'apos;8px solid transparent'apos;,
          borderRight: `8px solid ${agentInfo.color}20`
        }} />
        
        {/* Contenu formaté */}
        <div style={{
          color: 'apos;#374151'apos;,
          fontSize: 'apos;14px'apos;
        }}>
          {formatAsStyledHtml(content)}
        </div>
        
        {/* Signature de l'apos;agent */}
        <div style={{
          marginTop: 'apos;16px'apos;,
          paddingTop: 'apos;12px'apos;,
          borderTop: `1px solid ${agentInfo.color}20`,
          fontSize: 'apos;12px'apos;,
          color: 'apos;#6b7280'apos;,
          fontStyle: 'apos;italic'apos;
        }}>
          Livré par {agentInfo.name} • {formattedDate}
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

export default DeliverableBubble;
