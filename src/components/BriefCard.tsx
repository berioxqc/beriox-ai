"use client"
import React from 'react'
import Icon from '@/components/ui/Icon'
interface BriefCardProps {
  brief: {
    id: string
    agent: string
    contentJson: any
    status: string
    createdAt: string
  }
  agentInfo: {
    name: string
    role: string
    color: string
    icon: string
    age: number
  }
  onRestart?: (agentName: string) => void
}

export const BriefCard: React.FC<BriefCardProps> = ({ brief, agentInfo, onRestart }) => {
  // Fonction pour formater le contenu du brief
  const formatBriefContent = (contentJson: any): string => {
    if (typeof contentJson === 'string') {
      return contentJson
    }
    if (contentJson.brief) {
      return contentJson.brief
    }
    if (contentJson.content) {
      return contentJson.content
    }
    return JSON.stringify(contentJson, null, 2)
  }
  // Fonction pour formater le contenu en HTML avec style
  const formatAsStyledHtml = (content: string): JSX.Element => {
    const lines = content.split('\n')
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
            )
          }
          if (line.startsWith('## ')) {
            return (
              <h4 key={index} style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: agentInfo.color, 
                marginBottom: '8px', 
                marginTop: '20px'
              }}>
                {line.substring(3)}
              </h4>
            )
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
            )
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
            )
          }
          
          // Gras
          if (line.includes('**')) {
            const parts = line.split('**')
            return (
              <div key={index} style={{ marginBottom: '8px' }}>
                {parts.map((part, i) => 
                  i % 2 === 1 ? 
                    <strong key={i} style={{ color: agentInfo.color }}>{part}</strong> : 
                    part
                )}
              </div>
            )
          }
          
          // Ligne vide
          if (line.trim() === '') {
            return <div key={index} style={{ height: '12px' }} />
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
          )
        })}
      </div>
    )
  }
  const content = formatBriefContent(brief.contentJson)
  const formattedDate = new Date(brief.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Terminé', color: '#10b981', bgColor: '#d1fae5' }
      case 'in_progress':
        return { label: 'En cours', color: '#f59e0b', bgColor: '#fef3c7' }
      case 'queued':
        return { label: 'En attente', color: '#6b7280', bgColor: '#f3f4f6' }
      case 'failed':
        return { label: 'Échoué', color: '#ef4444', bgColor: '#fee2e2' }
      default:
        return { label: status, color: '#6b7280', bgColor: '#f3f4f6' }
    }
  }
  const statusInfo = getStatusInfo(brief.status)
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: `2px solid ${agentInfo.color}20`,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      marginBottom: '20px',
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.5s ease-out'
    }}>
      {/* En-tête de la carte */}
      <div style={{
        backgroundColor: `${agentInfo.color}10`,
        padding: '16px 20px',
        borderBottom: `1px solid ${agentInfo.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Avatar de l'agent */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: agentInfo.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            <Icon name={agentInfo.icon} size="1x" />
          </div>
          
          {/* Informations de l'agent */}
          <div>
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
            </div>
          </div>
        </div>
        
        {/* Statut et actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Statut */}
          <div style={{
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.color,
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {statusInfo.label}
          </div>
          
          {/* Bouton de redémarrage */}
          {onRestart && (
            <button
              onClick={() => onRestart(agentInfo.name)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: agentInfo.color,
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${agentInfo.color}dd`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = agentInfo.color
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
        padding: '20px',
        color: '#374151',
        fontSize: '14px'
      }}>
        {formatAsStyledHtml(content)}
        
        {/* Métadonnées */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${agentInfo.color}20`,
          fontSize: '12px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Créé le {formattedDate}</span>
          <span style={{ fontStyle: 'italic' }}>
            Brief pour {agentInfo.name}
          </span>
        </div>
      </div>
    </div>
  )
}
// Styles CSS pour l'animation
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0
      transform: translateY(20px)
    }
    to {
      opacity: 1
      transform: translateY(0)
    }
  }
`
// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default BriefCard