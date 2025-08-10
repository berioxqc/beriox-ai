"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faTimes, faExclamationTriangle, faInfoCircle,
  faSave, faPlay, faPause, faStop, faChartLine, faLightbulb,
  faUser, faEnvelope, faBuilding, faFileAlt, faLock,
  faEye, faEyeSlash, faSpinner, faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  FormConfig,
  FormField,
  FormFieldType,
  FormData,
  FormAnalytics,
  FormOptimization
} from '@/lib/form-optimization';

interface FormOptimizerProps {
  formId?: string;
  className?: string;
}

interface FormState {
  form: FormConfig | null;
  formData: FormData | null;
  analytics: FormAnalytics | null;
  optimization: FormOptimization | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  showAnalytics: boolean;
  showOptimization: boolean;
}

export default function FormOptimizer({ formId = 'contact-form', className = '' }: FormOptimizerProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<FormState>({
    form: null,
    formData: null,
    analytics: null,
    optimization: null,
    loading: false,
    error: null,
    currentStep: 0,
    showAnalytics: false,
    showOptimization: false
  });

  // Charger le formulaire
  const loadForm = async () => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/form-optimization?action=forms&formId=${formId}`);
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, form: data.form, loading: false }));
      } else {
        throw new Error('Failed to load form');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors du chargement du formulaire', 
        loading: false 
      }));
    }
  };

  // Démarrer le formulaire
  const startForm = async () => {
    if (!session?.user?.id || !state.form) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/form-optimization?action=start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: state.form.id })
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          formData: data.formData, 
          loading: false,
          currentStep: 0
        }));
      } else {
        throw new Error('Failed to start form');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors du démarrage du formulaire', 
        loading: false 
      }));
    }
  };

  // Mettre à jour un champ
  const updateField = async (fieldId: string, value: any) => {
    if (!state.formData) return;

    try {
      const response = await fetch('/api/form-optimization?action=update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.formData.sessionId,
          fieldId,
          value
        })
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, formData: data.formData }));
      }
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  };

  // Valider le formulaire
  const validateForm = async () => {
    if (!state.formData) return;

    try {
      const response = await fetch('/api/form-optimization?action=validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.formData.sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          formData: { ...prev.formData!, errors: data.errors }
        }));
        return data.isValid;
      }
    } catch (error) {
      console.error('Failed to validate form:', error);
    }
    return false;
  };

  // Soumettre le formulaire
  const submitForm = async () => {
    if (!state.formData) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/form-optimization?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.formData.sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setState(prev => ({ 
            ...prev, 
            formData: data.data, 
            loading: false,
            currentStep: state.form?.fields.length || 0
          }));
          // Charger les analytics après soumission
          loadAnalytics();
        } else {
          setState(prev => ({ 
            ...prev, 
            formData: { ...prev.formData!, errors: data.errors },
            loading: false
          }));
        }
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors de la soumission', 
        loading: false 
      }));
    }
  };

  // Sauvegarder le brouillon
  const saveDraft = async () => {
    if (!state.formData) return;

    try {
      const response = await fetch('/api/form-optimization?action=save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.formData.sessionId })
      });

      if (response.ok) {
        // Afficher une notification de succès
        console.log('Brouillon sauvegardé');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Charger les analytics
  const loadAnalytics = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/form-optimization?action=analytics&formId=${formId}`);
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, analytics: data.analytics }));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Générer les optimisations
  const generateOptimizations = async () => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/form-optimization?action=optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId })
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          optimization: data.optimization, 
          loading: false,
          showOptimization: true
        }));
      } else {
        throw new Error('Failed to generate optimizations');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors de la génération des optimisations', 
        loading: false 
      }));
    }
  };

  // Rendu d'un champ
  const renderField = (field: FormField) => {
    const value = state.formData?.data[field.id] || '';
    const errors = state.formData?.errors[field.id] || [];
    const isActive = state.currentStep === field.order - 1;

    const handleChange = (newValue: any) => {
      updateField(field.id, newValue);
    };

    const handleBlur = () => {
      if (state.form?.validationMode === 'onBlur') {
        validateForm();
      }
    };

    const getFieldIcon = () => {
      switch (field.type) {
        case FormFieldType.EMAIL: return faEnvelope;
        case FormFieldType.PASSWORD: return faLock;
        case FormFieldType.TEXTAREA: return faFileAlt;
        default: return faUser;
      }
    };

    return (
      <div 
        key={field.id}
        className={`form-field ${isActive ? 'active' : ''} ${errors.length > 0 ? 'error' : ''}`}
        style={{
          marginBottom: '24px',
          opacity: isActive ? 1 : 0.6,
          transition: 'all 0.3s ease'
        }}
      >
        <label 
          htmlFor={field.id}
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}
        >
          {field.required && <span style={{ color: '#ef4444' }}>*</span>} {field.label}
        </label>

        <div style={{ position: 'relative' }}>
          <FontAwesomeIcon 
            icon={getFieldIcon()} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 1
            }}
          />

          {field.type === FormFieldType.TEXTAREA ? (
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              disabled={field.disabled}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px 12px 12px 40px',
                border: errors.length > 0 ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                transition: 'border-color 0.2s ease',
                backgroundColor: field.disabled ? '#f9fafb' : '#ffffff'
              }}
            />
          ) : field.type === FormFieldType.SELECT ? (
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={field.disabled}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: errors.length > 0 ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: field.disabled ? '#f9fafb' : '#ffffff'
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === FormFieldType.CHECKBOX ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id={field.id}
                checked={value}
                onChange={(e) => handleChange(e.target.checked)}
                onBlur={handleBlur}
                disabled={field.disabled}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                {field.label}
              </span>
            </div>
          ) : (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              disabled={field.disabled}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: errors.length > 0 ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s ease',
                backgroundColor: field.disabled ? '#f9fafb' : '#ffffff'
              }}
            />
          )}
        </div>

        {field.helpText && (
          <p style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            {field.helpText}
          </p>
        )}

        {errors.length > 0 && (
          <div style={{
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444', fontSize: '12px' }} />
            <span style={{ fontSize: '12px', color: '#ef4444' }}>
              {errors[0]}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Rendu des analytics
  const renderAnalytics = () => {
    if (!state.analytics) return null;

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#111827'
        }}>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px', color: '#3b82f6' }} />
          Analytics du Formulaire
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f0f9ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
              {state.analytics.totalStarts}
            </div>
            <div style={{ fontSize: '12px', color: '#0369a1' }}>Démarrages</div>
          </div>

          <div style={{
            background: '#f0fdf4',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
              {state.analytics.totalCompletions}
            </div>
            <div style={{ fontSize: '12px', color: '#15803d' }}>Complétions</div>
          </div>

          <div style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
              {state.analytics.totalAbandonments}
            </div>
            <div style={{ fontSize: '12px', color: '#d97706' }}>Abandons</div>
          </div>

          <div style={{
            background: '#f3e8ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #d8b4fe'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
              {state.analytics.completionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: '#7c3aed' }}>Taux de complétion</div>
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#374151'
          }}>
            Points d'abandon principaux
          </h4>
          {state.analytics.topAbandonmentPoints.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {state.analytics.topAbandonmentPoints.slice(0, 3).map((point, index) => (
                <li key={index} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  {point.field}: {point.count} abandons
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Aucun point d'abandon identifié
            </p>
          )}
        </div>

        <button
          onClick={generateOptimizations}
          disabled={state.loading}
          style={{
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: state.loading ? 'not-allowed' : 'pointer',
            opacity: state.loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {state.loading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faLightbulb} />
          )}
          Générer les optimisations
        </button>
      </div>
    );
  };

  // Rendu des optimisations
  const renderOptimizations = () => {
    if (!state.optimization) return null;

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#111827'
        }}>
          <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: '8px', color: '#f59e0b' }} />
          Suggestions d'Optimisation
        </h3>

        {state.optimization.suggestions.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            {state.optimization.suggestions.map((suggestion, index) => (
              <div 
                key={index}
                style={{
                  background: suggestion.priority === 'high' ? '#fef2f2' : 
                             suggestion.priority === 'medium' ? '#fffbeb' : '#f0f9ff',
                  border: suggestion.priority === 'high' ? '1px solid #fecaca' :
                          suggestion.priority === 'medium' ? '1px solid #fed7aa' : '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <FontAwesomeIcon 
                    icon={suggestion.priority === 'high' ? faExclamationTriangle : faInfoCircle}
                    style={{ 
                      color: suggestion.priority === 'high' ? '#dc2626' : 
                             suggestion.priority === 'medium' ? '#d97706' : '#0369a1'
                    }}
                  />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: suggestion.priority === 'high' ? '#dc2626' : 
                           suggestion.priority === 'medium' ? '#d97706' : '#0369a1'
                  }}>
                    {suggestion.priority}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    Impact: {suggestion.impact}%
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  margin: '0 0 8px 0'
                }}>
                  {suggestion.description}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  {suggestion.implementation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
            Aucune suggestion d'optimisation pour le moment
          </p>
        )}

        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#374151'
        }}>
          Variantes A/B suggérées
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {state.optimization.aBTestVariants.map((variant, index) => (
            <div 
              key={index}
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <h5 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                {variant.name}
              </h5>
              <ul style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                paddingLeft: '16px'
              }}>
                {Object.entries(variant.changes).map(([key, value]) => (
                  <li key={key}>
                    {key}: {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadForm();
  }, [session?.user?.id, formId]);

  if (!session?.user?.id) return null;

  if (state.loading && !state.form) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
        Chargement du formulaire...
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '8px' }} />
        {state.error}
      </div>
    );
  }

  if (!state.form) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280'
      }}>
        Formulaire non trouvé
      </div>
    );
  }

  return (
    <div className={`form-optimizer ${className}`} style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* En-tête du formulaire */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#111827'
        }}>
          {state.form.name}
        </h2>
        {state.form.description && (
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {state.form.description}
          </p>
        )}

        {/* Barre de progression */}
        {state.form.showProgress && state.formData && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Progression
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {state.formData.progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${state.formData.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {!state.formData ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#374151',
            marginBottom: '24px'
          }}>
            Prêt à commencer le formulaire ?
          </p>
          <button
            onClick={startForm}
            disabled={state.loading}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: state.loading ? 'not-allowed' : 'pointer',
              opacity: state.loading ? 0.6 : 1
            }}
          >
            {state.loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
            Commencer
          </button>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
            {state.form.fields
              .sort((a, b) => a.order - b.order)
              .map(renderField)
            }

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px',
              flexWrap: 'wrap'
            }}>
              {state.form.allowDraft && (
                <button
                  type="button"
                  onClick={saveDraft}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FontAwesomeIcon icon={faSave} />
                  Sauvegarder
                </button>
              )}

              <button
                type="submit"
                disabled={state.loading || state.formData.submitted}
                style={{
                  background: state.formData.submitted ? '#10b981' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: state.loading || state.formData.submitted ? 'not-allowed' : 'pointer',
                  opacity: state.loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {state.loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : state.formData.submitted ? (
                  <FontAwesomeIcon icon={faCheckCircle} />
                ) : (
                  <FontAwesomeIcon icon={faCheck} />
                )}
                {state.formData.submitted ? 'Soumis' : state.form.submitButtonText || 'Soumettre'}
              </button>
            </div>
          </form>

          {/* Message de succès */}
          {state.formData.submitted && state.form.successMessage && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#15803d' }} />
              <span style={{ color: '#15803d', fontWeight: '600' }}>
                {state.form.successMessage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FontAwesomeIcon icon={faChartLine} />
          {state.showAnalytics ? 'Masquer' : 'Afficher'} Analytics
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, showOptimization: !prev.showOptimization }))}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FontAwesomeIcon icon={faLightbulb} />
          {state.showOptimization ? 'Masquer' : 'Afficher'} Optimisations
        </button>
      </div>

      {/* Analytics */}
      {state.showAnalytics && renderAnalytics()}

      {/* Optimisations */}
      {state.showOptimization && renderOptimizations()}
    </div>
  );
}
