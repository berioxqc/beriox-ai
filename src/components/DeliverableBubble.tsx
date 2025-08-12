"use client";
import React from 'react';
import Icon from '@/components/ui/Icon';

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
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content.content) {
      return content.content;
    }
    if (typeof content === 'object' && content.response) {
      return content.response;
    }
    return JSON.stringify(content, null, 2);
  };

  // Fonction pour formater le contenu en HTML avec style
  const formatAsStyledHtml = (content: string): JSX.Element => {
    const lines = content.split('\n');
    return (
      <div style={{ lineHeight: '1.6' }}>
        {lines.map((line, index) => {
          // Titres
          if (line.startsWith('# ')) {
            return (
              <h3 key={index} style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#0a2540', 
                marginBottom: '12px', 
                marginTop: index > 0 ? '24px' : '0',
                borderBottom: `2px solid ${agentInfo.color}`,
                paddingBottom: '4px'
              }}>
                {line.substring(2)}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h4 key={index} style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#0a2540', 
                marginBottom: '8px', 
                marginTop: '20px',
                color: agentInfo.color
              }}>
                {line.substring(3)}
              </h4>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h5 key={index} style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#425466', 
                marginBottom: '6px', 
                marginTop: '16px' 
              }}>
                {line.substring(4)}
              </h5>
            );
          }
          
          // Listes
          if (line.startsWith('- ')) {
            return (
              <div key={index} style={{ 
                marginLeft: '16px', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <span style={{ 
                  color: agentInfo.color, 
                  marginRight: '8px', 
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          
          // Gras
          if (line.includes('**')) {
            const parts = line.split('**');
            return (
              <div key={index} style={{ marginBottom: '8px' }}>
                {parts.map((part, i) => 
                  i % 2 === 1 ? 
                    <strong key={i} style={{ color: agentInfo.color }}>{part}</strong> : 
                    part
                )}
              </div>
            );
          }
          
          // Ligne vide
          if (line.trim() === '') {
            return <div key={index} style={{ height: '12px' }} />;
          }
          
          // Texte normal
          return (
            <div key={index} style={{ 
              marginBottom: '8px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  const content = formatContent(deliverable.output);
  const formattedDate = new Date(deliverable.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{
      marginBottom: '24px',
      animation: 'slideIn 0.5s ease-out'
    }}>
      {/* En-tête de la bulle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '12px'
      }}>
        {/* Avatar de l'agent */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: agentInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: `0 4px 12px ${agentInfo.color}40`
        }}>
          <Icon name={agentInfo.icon} size="lg" />
        </div>
        
        {/* Informations de l'agent */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0a2540',
            marginBottom: '2px'
          }}>
            {agentInfo.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
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
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Livré
        </div>
      </div>
      
      {/* Contenu de la bulle */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: `2px solid ${agentInfo.color}20`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        marginLeft: '60px'
      }}>
        {/* Pointe de la bulle */}
        <div style={{
          position: 'absolute',
          left: '-8px',
          top: '20px',
          width: '0',
          height: '0',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: `8px solid ${agentInfo.color}20`
        }} />
        
        {/* Contenu formaté */}
        <div style={{
          color: '#374151',
          fontSize: '14px'
        }}>
          {formatAsStyledHtml(content)}
        </div>
        
        {/* Signature de l'agent */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${agentInfo.color}20`,
          fontSize: '12px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Livré par {agentInfo.name} • {formattedDate}
        </div>
      </div>
    </div>
  );
};

// Styles CSS pour l'animation
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
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DeliverableBubble;
