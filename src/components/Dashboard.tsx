"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Icon from '@/components/ui/Icon'
interface Widget {
  id: string
  type: 'metric' | 'chart' | 'list' | 'alert'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: any
}

interface DashboardProps {
  widgets?: Widget[]
  onWidgetUpdate?: (widgets: Widget[]) => void
}

const defaultWidgets: Widget[] = [
  {
    id: 'performance-overview',
    type: 'metric',
    title: 'Performance Globale',
    size: 'medium',
    position: { x: 0, y: 0 },
    config: { metric: 'bpi', trend: true }
  },
  {
    id: 'recent-missions',
    type: 'list',
    title: 'Missions Récentes',
    size: 'medium',
    position: { x: 1, y: 0 },
    config: { limit: 5, showStatus: true }
  },
  {
    id: 'opportunity-radar',
    type: 'alert',
    title: 'Opportunity Radar',
    size: 'large',
    position: { x: 0, y: 1 },
    config: { showTop5: true }
  },
  {
    id: 'traffic-forecast',
    type: 'chart',
    title: 'Prévision Trafic',
    size: 'medium',
    position: { x: 1, y: 1 },
    config: { period: '30d', showTrend: true }
  }
]
export const Dashboard: React.FC<DashboardProps> = ({ 
  widgets = defaultWidgets, 
  onWidgetUpdate 
}) => {
  const { data: session } = useSession()
  const [dashboardWidgets, setDashboardWidgets] = useState<Widget[]>(widgets)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])
  const handleWidgetMove = (widgetId: string, newPosition: { x: number; y: number }) => {
    const updatedWidgets = dashboardWidgets.map(widget =>
      widget.id === widgetId ? { ...widget, position: newPosition } : widget
    )
    setDashboardWidgets(updatedWidgets)
    onWidgetUpdate?.(updatedWidgets)
  }
  const handleWidgetResize = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    const updatedWidgets = dashboardWidgets.map(widget =>
      widget.id === widgetId ? { ...widget, size: newSize } : widget
    )
    setDashboardWidgets(updatedWidgets)
    onWidgetUpdate?.(updatedWidgets)
  }
  const renderMetricWidget = (widget: Widget) => {
    const { config } = widget
    const value = config.metric === 'bpi' ? 87 : 92
    const trend = config.trend ? '+5.2%' : null
    return (
      <div className="metric-widget">
        <div className="metric-value">{value}</div>
        {trend && <div className="metric-trend positive">{trend}</div>}
        <div className="metric-label">{widget.title}</div>
      </div>
    )
  }
  const renderListWidget = (widget: Widget) => {
    const { config } = widget
    const missions = [
      { id: 1, name: 'Analyse SEO Amazon', status: 'completed', date: '2024-08-10' },
      { id: 2, name: 'Veille Concurrentielle', status: 'running', date: '2024-08-10' },
      { id: 3, name: 'Audit Performance', status: 'pending', date: '2024-08-09' },
    ].slice(0, config.limit)
    return (
      <div className="list-widget">
        {missions.map(mission => (
          <div key={mission.id} className="list-item">
            <div className="item-title">{mission.name}</div>
            <div className={`item-status ${mission.status}`}>
              <Icon name="check" size="sm" />
              {mission.status}
            </div>
          </div>
        ))}
      </div>
    )
  }
  const renderAlertWidget = (widget: Widget) => {
    const { config } = widget
    const opportunities = [
      { id: 1, title: 'Optimiser la vitesse de chargement', impact: 'high', effort: 'medium' },
      { id: 2, title: 'Améliorer le SEO mobile', impact: 'high', effort: 'low' },
      { id: 3, title: 'Créer du contenu vidéo', impact: 'medium', effort: 'high' },
    ].slice(0, config.showTop5 ? 5 : 3)
    return (
      <div className="alert-widget">
        {opportunities.map(opp => (
          <div key={opp.id} className="opportunity-item">
            <div className="opportunity-title">{opp.title}</div>
            <div className="opportunity-meta">
              <span className={`impact ${opp.impact}`}>Impact: {opp.impact}</span>
              <span className={`effort ${opp.effort}`}>Effort: {opp.effort}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const renderChartWidget = (widget: Widget) => {
    const { config } = widget
    const data = [65, 72, 68, 75, 82, 79, 85]
    return (
      <div className="chart-widget">
        <div className="chart-container">
          <div className="chart-bars">
            {data.map((value, index) => (
              <div 
                key={index} 
                className="chart-bar" 
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>
        <div className="chart-label">{widget.title}</div>
      </div>
    )
  }
  const renderWidget = (widget: Widget) => {
    const sizeClass = `widget-${widget.size}`
    return (
      <div 
        key={widget.id} 
        className={`dashboard-widget ${sizeClass} ${isEditing ? 'editable' : ''}`}
        style={{
          gridColumn: `${widget.position.x + 1} / span ${widget.size === 'large' ? 2 : 1}`,
          gridRow: `${widget.position.y + 1} / span 1`
        }}
      >
        <div className="widget-header">
          <h3>{widget.title}</h3>
          {isEditing && (
            <div className="widget-controls">
              <button onClick={() => handleWidgetResize(widget.id, 'small')}>
                <Icon name="minus" size="sm" />
              </button>
              <button onClick={() => handleWidgetResize(widget.id, 'large')}>
                <Icon name="plus" size="sm" />
              </button>
            </div>
          )}
        </div>
        
        <div className="widget-content">
          {isLoading ? (
            <div className="loading">
              <Icon name="spinner" spin size="lg" />
            </div>
          ) : (
            <>
              {widget.type === 'metric' && renderMetricWidget(widget)}
              {widget.type === 'list' && renderListWidget(widget)}
              {widget.type === 'alert' && renderAlertWidget(widget)}
              {widget.type === 'chart' && renderChartWidget(widget)}
            </>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Personnalisé</h1>
        <div className="dashboard-controls">
          <button 
            className={`edit-button ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Icon name="edit" size="sm" />
            {isEditing ? 'Terminer' : 'Personnaliser'}
          </button>
          {isEditing && (
            <button className="add-widget-button">
              <Icon name="plus" size="sm" />
              Ajouter un widget
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {dashboardWidgets.map(renderWidget)}
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 24px
          background: #f8fafc
          min-height: 100vh
        }

        .dashboard-header {
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: 32px
        }

        .dashboard-header h1 {
          font-size: 2rem
          font-weight: 700
          color: #1a1a1a
          margin: 0
        }

        .dashboard-controls {
          display: flex
          gap: 12px
        }

        .edit-button, .add-widget-button {
          display: flex
          align-items: center
          gap: 8px
          padding: 8px 16px
          border: 1px solid #e2e8f0
          border-radius: 8px
          background: white
          color: #64748b
          font-size: 14px
          font-weight: 500
          cursor: pointer
          transition: all 0.2s
        }

        .edit-button:hover, .add-widget-button:hover {
          background: #f1f5f9
          border-color: #cbd5e1
        }

        .edit-button.active {
          background: #3b82f6
          color: white
          border-color: #3b82f6
        }

        .dashboard-grid {
          display: grid
          grid-template-columns: repeat(2, 1fr)
          gap: 24px
          min-height: 600px
        }

        .dashboard-widget {
          background: white
          border-radius: 12px
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
          border: 1px solid #e2e8f0
          overflow: hidden
          transition: all 0.2s
        }

        .dashboard-widget:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
        }

        .dashboard-widget.editable {
          cursor: move
          border: 2px dashed #3b82f6
        }

        .widget-header {
          display: flex
          justify-content: space-between
          align-items: center
          padding: 16px 20px
          border-bottom: 1px solid #e2e8f0
          background: #f8fafc
        }

        .widget-header h3 {
          font-size: 16px
          font-weight: 600
          color: #1a1a1a
          margin: 0
        }

        .widget-controls {
          display: flex
          gap: 4px
        }

        .widget-controls button {
          padding: 4px 8px
          border: 1px solid #e2e8f0
          border-radius: 4px
          background: white
          color: #64748b
          cursor: pointer
          transition: all 0.2s
        }

        .widget-controls button:hover {
          background: #f1f5f9
        }

        .widget-content {
          padding: 20px
          min-height: 200px
        }

        .loading {
          display: flex
          justify-content: center
          align-items: center
          height: 200px
          color: #64748b
        }

        /* Widget types */
        .metric-widget {
          text-align: center
        }

        .metric-value {
          font-size: 3rem
          font-weight: 700
          color: #1a1a1a
          margin-bottom: 8px
        }

        .metric-trend {
          font-size: 1rem
          font-weight: 500
          margin-bottom: 8px
        }

        .metric-trend.positive {
          color: #10b981
        }

        .metric-label {
          font-size: 14px
          color: #64748b
        }

        .list-widget .list-item {
          display: flex
          justify-content: space-between
          align-items: center
          padding: 12px 0
          border-bottom: 1px solid #f1f5f9
        }

        .list-widget .list-item:last-child {
          border-bottom: none
        }

        .item-title {
          font-size: 14px
          color: #1a1a1a
          font-weight: 500
        }

        .item-status {
          display: flex
          align-items: center
          gap: 4px
          font-size: 12px
          padding: 4px 8px
          border-radius: 12px
          font-weight: 500
        }

        .item-status.completed {
          background: #dcfce7
          color: #166534
        }

        .item-status.running {
          background: #dbeafe
          color: #1e40af
        }

        .item-status.pending {
          background: #fef3c7
          color: #92400e
        }

        .alert-widget .opportunity-item {
          padding: 12px 0
          border-bottom: 1px solid #f1f5f9
        }

        .alert-widget .opportunity-item:last-child {
          border-bottom: none
        }

        .opportunity-title {
          font-size: 14px
          color: #1a1a1a
          font-weight: 500
          margin-bottom: 4px
        }

        .opportunity-meta {
          display: flex
          gap: 12px
          font-size: 12px
        }

        .impact.high {
          color: #dc2626
        }

        .impact.medium {
          color: #ea580c
        }

        .effort.low {
          color: #16a34a
        }

        .effort.medium {
          color: #ea580c
        }

        .effort.high {
          color: #dc2626
        }

        .chart-widget {
          text-align: center
        }

        .chart-container {
          height: 150px
          margin-bottom: 16px
        }

        .chart-bars {
          display: flex
          align-items: end
          justify-content: space-around
          height: 100%
          padding: 0 20px
        }

        .chart-bar {
          width: 20px
          background: linear-gradient(135deg, #3b82f6, #8b5cf6)
          border-radius: 4px 4px 0 0
          transition: all 0.3s
        }

        .chart-bar:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed)
        }

        .chart-label {
          font-size: 14px
          color: #64748b
          font-weight: 500
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr
          }
          
          .dashboard-widget {
            grid-column: 1 / span 1 !important
          }
        }
      `}</style>
    </div>
  )
}
export default Dashboard