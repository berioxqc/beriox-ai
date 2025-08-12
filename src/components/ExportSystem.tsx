"use client";
import React, { useState } from 'apos;react'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

interface ExportData {
  id: string;
  name: string;
  type: 'apos;performance'apos; | 'apos;seo'apos; | 'apos;security'apos; | 'apos;competitor'apos; | 'apos;custom'apos;;
  data: any;
  lastUpdated: Date;
}

interface ExportSystemProps {
  data?: ExportData[];
  onExport?: (format: string, data: ExportData[]) => void;
}

const mockExportData: ExportData[] = [
  {
    id: 'apos;1'apos;,
    name: 'apos;Rapport Performance Global'apos;,
    type: 'apos;performance'apos;,
    data: {
      bpi: 87,
      traffic: 15420,
      conversions: 234,
      revenue: 45600,
      trends: {
        bpi: 'apos;+5.2%'apos;,
        traffic: 'apos;+12.3%'apos;,
        conversions: 'apos;+8.7%'apos;,
        revenue: 'apos;+15.4%'apos;
      }
    },
    lastUpdated: new Date()
  },
  {
    id: 'apos;2'apos;,
    name: 'apos;Analyse SEO Complète'apos;,
    type: 'apos;seo'apos;,
    data: {
      score: 92,
      keywords: 145,
      backlinks: 1234,
      pages: 67,
      issues: [
        { type: 'apos;warning'apos;, message: 'apos;Meta descriptions manquantes'apos;, count: 12 },
        { type: 'apos;error'apos;, message: 'apos;Images sans alt'apos;, count: 8 },
        { type: 'apos;info'apos;, message: 'apos;Opportunités d\'apos;optimisation'apos;, count: 23 }
      ]
    },
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 'apos;3'apos;,
    name: 'apos;Veille Concurrentielle'apos;,
    type: 'apos;competitor'apos;,
    data: {
      competitors: [
        { name: 'apos;Competitor A'apos;, price: 29.99, features: 15, rating: 4.2 },
        { name: 'apos;Competitor B'apos;, price: 39.99, features: 18, rating: 4.5 },
        { name: 'apos;Competitor C'apos;, price: 24.99, features: 12, rating: 3.8 }
      ],
      opportunities: [
        'apos;Prix 20% plus bas que la concurrence'apos;,
        'apos;Fonctionnalités uniques identifiées'apos;,
        'apos;Gaps dans l\'apos;offre concurrentielle'apos;
      ]
    },
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }
];

export const ExportSystem: React.FC<ExportSystemProps> = ({
  data = mockExportData,
  onExport
}) => {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'apos;pdf'apos; | 'apos;excel'apos; | 'apos;csv'apos;>('apos;pdf'apos;);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [customTemplate, setCustomTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDataSelection = (dataId: string) => {
    setSelectedData(prev => 
      prev.includes(dataId) 
        ? prev.filter(id => id !== dataId)
        : [...prev, dataId]
    );
  };

  const handleSelectAll = () => {
    setSelectedData(data.map(item => item.id));
  };

  const handleSelectNone = () => {
    setSelectedData([]);
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      alert('apos;Veuillez sélectionner au moins un élément à exporter'apos;);
      return;
    }

    setIsExporting(true);
    
    // Simuler l'apos;export
    setTimeout(() => {
      setIsExporting(false);
      onExport?.(exportFormat, data.filter(item => selectedData.includes(item.id)));
      alert(`Export ${exportFormat.toUpperCase()} généré avec succès !`);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'apos;performance'apos;: return 'apos;chart-line'apos;;
      case 'apos;seo'apos;: return 'apos;search'apos;;
      case 'apos;security'apos;: return 'apos;shield'apos;;
      case 'apos;competitor'apos;: return 'apos;users'apos;;
      case 'apos;custom'apos;: return 'apos;cog'apos;;
      default: return 'apos;file'apos;;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'apos;performance'apos;: return 'apos;#3b82f6'apos;;
      case 'apos;seo'apos;: return 'apos;#10b981'apos;;
      case 'apos;security'apos;: return 'apos;#f59e0b'apos;;
      case 'apos;competitor'apos;: return 'apos;#8b5cf6'apos;;
      case 'apos;custom'apos;: return 'apos;#6b7280'apos;;
      default: return 'apos;#6b7280'apos;;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('apos;fr-FR'apos;, {
      day: 'apos;2-digit'apos;,
      month: 'apos;2-digit'apos;,
      year: 'apos;numeric'apos;,
      hour: 'apos;2-digit'apos;,
      minute: 'apos;2-digit'apos;
    }).format(date);
  };

  return (
    <div className="export-system">
      <div className="export-header">
        <h2>Export de Données</h2>
        <p>Générez des rapports personnalisés avec vos données Beriox AI</p>
      </div>

      <div className="export-content">
        {/* Sélection des données */}
        <div className="data-selection">
          <div className="section-header">
            <h3>Données à exporter</h3>
            <div className="selection-controls">
              <button onClick={handleSelectAll} className="select-all-btn">
                <Icon name="check" size="sm" />
                Tout sélectionner
              </button>
              <button onClick={handleSelectNone} className="select-none-btn">
                <Icon name="times" size="sm" />
                Aucune
              </button>
            </div>
          </div>

          <div className="data-grid">
            {data.map(item => (
              <div 
                key={item.id}
                className={`data-item ${selectedData.includes(item.id) ? 'apos;selected'apos; : 'apos;'apos;}`}
                onClick={() => handleDataSelection(item.id)}
              >
                <div className="data-item-header">
                  <div className="data-icon" style={{ color: getTypeColor(item.type) }}>
                    <Icon name={getTypeIcon(item.type)} size="lg" />
                  </div>
                  <div className="data-info">
                    <h4>{item.name}</h4>
                    <p>Mis à jour le {formatDate(item.lastUpdated)}</p>
                  </div>
                  <div className="data-checkbox">
                    <Icon 
                      name={selectedData.includes(item.id) ? 'apos;check-circle'apos; : 'apos;circle'apos;} 
                      size="lg"
                      style={{ color: selectedData.includes(item.id) ? 'apos;#10b981'apos; : 'apos;#d1d5db'apos; }}
                    />
                  </div>
                </div>
                
                {selectedData.includes(item.id) && (
                  <div className="data-preview">
                    <div className="preview-header">
                      <span>Aperçu des données</span>
                    </div>
                    <div className="preview-content">
                      {item.type === 'apos;performance'apos; && (
                        <div className="performance-preview">
                          <div className="metric">
                            <span className="metric-label">BPI</span>
                            <span className="metric-value">{item.data.bpi}</span>
                            <span className="metric-trend positive">{item.data.trends.bpi}</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Trafic</span>
                            <span className="metric-value">{item.data.traffic.toLocaleString()}</span>
                            <span className="metric-trend positive">{item.data.trends.traffic}</span>
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'apos;seo'apos; && (
                        <div className="seo-preview">
                          <div className="seo-score">
                            <span className="score-label">Score SEO</span>
                            <span className="score-value">{item.data.score}/100</span>
                          </div>
                          <div className="seo-stats">
                            <span>{item.data.keywords} mots-clés</span>
                            <span>{item.data.backlinks} backlinks</span>
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'apos;competitor'apos; && (
                        <div className="competitor-preview">
                          <div className="competitor-count">
                            {item.data.competitors.length} concurrents analysés
                          </div>
                          <div className="opportunity-count">
                            {item.data.opportunities.length} opportunités identifiées
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options d'apos;export */}
        <div className="export-options">
          <div className="section-header">
            <h3>Options d'apos;export</h3>
          </div>

          <div className="options-grid">
            <div className="option-group">
              <label>Format d'apos;export</label>
              <div className="format-buttons">
                <button 
                  className={`format-btn ${exportFormat === 'apos;pdf'apos; ? 'apos;active'apos; : 'apos;'apos;}`}
                  onClick={() => setExportFormat('apos;pdf'apos;)}
                >
                  <Icon name="file" size="sm" />
                  PDF
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'apos;excel'apos; ? 'apos;active'apos; : 'apos;'apos;}`}
                  onClick={() => setExportFormat('apos;excel'apos;)}
                >
                  <Icon name="file" size="sm" />
                  Excel
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'apos;csv'apos; ? 'apos;active'apos; : 'apos;'apos;}`}
                  onClick={() => setExportFormat('apos;csv'apos;)}
                >
                  <Icon name="file" size="sm" />
                  CSV
                </button>
              </div>
            </div>

            <div className="option-group">
              <label>Contenu</label>
              <div className="content-options">
                <label className="checkbox-option">
                  <input 
                    type="checkbox" 
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                  />
                  <Icon name="chart-line" size="sm" />
                  Inclure les graphiques
                </label>
                <label className="checkbox-option">
                  <input 
                    type="checkbox" 
                    checked={customTemplate}
                    onChange={(e) => setCustomTemplate(e.target.checked)}
                  />
                  <Icon name="cog" size="sm" />
                  Template personnalisé
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="export-actions">
          <button 
            className="export-button"
            onClick={handleExport}
            disabled={selectedData.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Icon name="spinner" spin size="sm" />
                Génération en cours...
              </>
            ) : (
              <>
                <Icon name="download" size="sm" />
                Exporter ({selectedData.length} éléments)
              </>
            )}
          </button>
          
          <div className="export-info">
            <Icon name="info-circle" size="sm" />
            <span>
              L'apos;export sera généré avec les données les plus récentes et inclura 
              {includeCharts ? 'apos; des graphiques interactifs'apos; : 'apos; des données tabulaires'apos;}.
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .export-system {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .export-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .export-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .export-header p {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }

        .export-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .selection-controls {
          display: flex;
          gap: 8px;
        }

        .select-all-btn, .select-none-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-all-btn:hover, .select-none-btn:hover {
          background: #f1f5f9;
        }

        .data-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 32px;
        }

        .data-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .data-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .data-item.selected {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .data-item-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .data-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
        }

        .data-info {
          flex: 1;
        }

        .data-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .data-info p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .data-checkbox {
          flex-shrink: 0;
        }

        .data-preview {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .preview-header {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .performance-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .metric-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .metric-trend {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .metric-trend.positive {
          background: #dcfce7;
          color: #166534;
        }

        .seo-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .seo-score {
          text-align: center;
        }

        .score-label {
          font-size: 12px;
          color: #64748b;
          display: block;
          margin-bottom: 4px;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
        }

        .seo-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .competitor-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .competitor-count, .opportunity-count {
          font-size: 13px;
          color: #64748b;
        }

        .export-options {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .options-grid {
          display: grid;
          gap: 24px;
        }

        .option-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .format-buttons {
          display: flex;
          gap: 8px;
        }

        .format-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .format-btn:hover {
          background: #f1f5f9;
        }

        .format-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .content-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
        }

        .checkbox-option input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
        }

        .export-actions {
          text-align: center;
        }

        .export-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .export-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .export-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 12px 20px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          color: #0369a1;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .export-system {
            padding: 16px;
          }

          .data-item-header {
            flex-direction: column;
            text-align: center;
          }

          .performance-preview {
            grid-template-columns: 1fr;
          }

          .format-buttons {
            flex-direction: column;
          }

          .export-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ExportSystem;
