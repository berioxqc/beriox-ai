"use client";

import { useEffect, useState } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import {
  faCheck, faTimes, faExclamationTriangle, faInfoCircle,
  faSave, faPlay, faPause, faStop, faChartLine, faLightbulb,
  faUser, faEnvelope, faBuilding, faFileAlt, faLock,
  faEye, faEyeSlash, faSpinner, faCheckCircle, faTimesCircle
} from 'apos;@fortawesome/free-solid-svg-icons'apos;;
import {
  FormConfig,
  FormField,
  FormFieldType,
  FormData,
  FormAnalytics,
  FormOptimization
} from 'apos;@/lib/form-optimization'apos;;

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

export default function FormOptimizer({ formId = 'apos;contact-form'apos;, className = 'apos;'apos; }: FormOptimizerProps) {
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
        throw new Error('apos;Failed to load form'apos;);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'apos;Erreur lors du chargement du formulaire'apos;, 
        loading: false 
      }));
    }
  };

  // Démarrer le formulaire
  const startForm = async () => {
    if (!session?.user?.id || !state.form) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('apos;/api/form-optimization?action=start'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
        throw new Error('apos;Failed to start form'apos;);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'apos;Erreur lors du démarrage du formulaire'apos;, 
        loading: false 
      }));
    }
  };

  // Mettre à jour un champ
  const updateField = async (fieldId: string, value: any) => {
    if (!state.formData) return;

    try {
      const response = await fetch('apos;/api/form-optimization?action=update'apos;, {
        method: 'apos;PUT'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
      console.error('apos;Failed to update field:'apos;, error);
    }
  };

  // Valider le formulaire
  const validateForm = async () => {
    if (!state.formData) return;

    try {
      const response = await fetch('apos;/api/form-optimization?action=validate'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
      console.error('apos;Failed to validate form:'apos;, error);
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
      const response = await fetch('apos;/api/form-optimization?action=submit'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
        throw new Error('apos;Failed to submit form'apos;);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'apos;Erreur lors de la soumission'apos;, 
        loading: false 
      }));
    }
  };

  // Sauvegarder le brouillon
  const saveDraft = async () => {
    if (!state.formData) return;

    try {
      const response = await fetch('apos;/api/form-optimization?action=save-draft'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify({ sessionId: state.formData.sessionId })
      });

      if (response.ok) {
        // Afficher une notification de succès
        console.log('apos;Brouillon sauvegardé'apos;);
      }
    } catch (error) {
      console.error('apos;Failed to save draft:'apos;, error);
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
      console.error('apos;Failed to load analytics:'apos;, error);
    }
  };

  // Générer les optimisations
  const generateOptimizations = async () => {
    if (!session?.user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('apos;/api/form-optimization?action=optimizations'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
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
        throw new Error('apos;Failed to generate optimizations'apos;);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'apos;Erreur lors de la génération des optimisations'apos;, 
        loading: false 
      }));
    }
  };

  // Rendu d'apos;un champ
  const renderField = (field: FormField) => {
    const value = state.formData?.data[field.id] || 'apos;'apos;;
    const errors = state.formData?.errors[field.id] || [];
    const isActive = state.currentStep === field.order - 1;

    const handleChange = (newValue: any) => {
      updateField(field.id, newValue);
    };

    const handleBlur = () => {
      if (state.form?.validationMode === 'apos;onBlur'apos;) {
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
        className={`form-field ${isActive ? 'apos;active'apos; : 'apos;'apos;} ${errors.length > 0 ? 'apos;error'apos; : 'apos;'apos;}`}
        style={{
          marginBottom: 'apos;24px'apos;,
          opacity: isActive ? 1 : 0.6,
          transition: 'apos;all 0.3s ease'apos;
        }}
      >
        <label 
          htmlFor={field.id}
          style={{
            display: 'apos;block'apos;,
            marginBottom: 'apos;8px'apos;,
            fontWeight: 'apos;600'apos;,
            color: 'apos;#374151'apos;,
            fontSize: 'apos;14px'apos;
          }}
        >
          {field.required && <span style={{ color: 'apos;#ef4444'apos; }}>*</span>} {field.label}
        </label>

        <div style={{ position: 'apos;relative'apos; }}>
          <FontAwesomeIcon 
            icon={getFieldIcon()} 
            style={{
              position: 'apos;absolute'apos;,
              left: 'apos;12px'apos;,
              top: 'apos;50%'apos;,
              transform: 'apos;translateY(-50%)'apos;,
              color: 'apos;#9ca3af'apos;,
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
                width: 'apos;100%'apos;,
                minHeight: 'apos;100px'apos;,
                padding: 'apos;12px 12px 12px 40px'apos;,
                border: errors.length > 0 ? 'apos;2px solid #ef4444'apos; : 'apos;2px solid #e5e7eb'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                resize: 'apos;vertical'apos;,
                transition: 'apos;border-color 0.2s ease'apos;,
                backgroundColor: field.disabled ? 'apos;#f9fafb'apos; : 'apos;#ffffff'apos;
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
                width: 'apos;100%'apos;,
                padding: 'apos;12px 12px 12px 40px'apos;,
                border: errors.length > 0 ? 'apos;2px solid #ef4444'apos; : 'apos;2px solid #e5e7eb'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                backgroundColor: field.disabled ? 'apos;#f9fafb'apos; : 'apos;#ffffff'apos;
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
            <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos; }}>
              <input
                type="checkbox"
                id={field.id}
                checked={value}
                onChange={(e) => handleChange(e.target.checked)}
                onBlur={handleBlur}
                disabled={field.disabled}
                style={{
                  width: 'apos;18px'apos;,
                  height: 'apos;18px'apos;,
                  accentColor: 'apos;#3b82f6'apos;
                }}
              />
              <span style={{ fontSize: 'apos;14px'apos;, color: 'apos;#374151'apos; }}>
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
                width: 'apos;100%'apos;,
                padding: 'apos;12px 12px 12px 40px'apos;,
                border: errors.length > 0 ? 'apos;2px solid #ef4444'apos; : 'apos;2px solid #e5e7eb'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                transition: 'apos;border-color 0.2s ease'apos;,
                backgroundColor: field.disabled ? 'apos;#f9fafb'apos; : 'apos;#ffffff'apos;
              }}
            />
          )}
        </div>

        {field.helpText && (
          <p style={{
            marginTop: 'apos;4px'apos;,
            fontSize: 'apos;12px'apos;,
            color: 'apos;#6b7280'apos;,
            fontStyle: 'apos;italic'apos;
          }}>
            {field.helpText}
          </p>
        )}

        {errors.length > 0 && (
          <div style={{
            marginTop: 'apos;4px'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: 'apos;4px'apos;
          }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'apos;#ef4444'apos;, fontSize: 'apos;12px'apos; }} />
            <span style={{ fontSize: 'apos;12px'apos;, color: 'apos;#ef4444'apos; }}>
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
        background: 'apos;#ffffff'apos;,
        borderRadius: 'apos;12px'apos;,
        padding: 'apos;24px'apos;,
        boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
        marginTop: 'apos;24px'apos;
      }}>
        <h3 style={{
          fontSize: 'apos;18px'apos;,
          fontWeight: 'apos;600'apos;,
          marginBottom: 'apos;16px'apos;,
          color: 'apos;#111827'apos;
        }}>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: 'apos;8px'apos;, color: 'apos;#3b82f6'apos; }} />
          Analytics du Formulaire
        </h3>

        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
          gap: 'apos;16px'apos;,
          marginBottom: 'apos;24px'apos;
        }}>
          <div style={{
            background: 'apos;#f0f9ff'apos;,
            padding: 'apos;16px'apos;,
            borderRadius: 'apos;8px'apos;,
            border: 'apos;1px solid #bae6fd'apos;
          }}>
            <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#0369a1'apos; }}>
              {state.analytics.totalStarts}
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#0369a1'apos; }}>Démarrages</div>
          </div>

          <div style={{
            background: 'apos;#f0fdf4'apos;,
            padding: 'apos;16px'apos;,
            borderRadius: 'apos;8px'apos;,
            border: 'apos;1px solid #bbf7d0'apos;
          }}>
            <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#15803d'apos; }}>
              {state.analytics.totalCompletions}
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#15803d'apos; }}>Complétions</div>
          </div>

          <div style={{
            background: 'apos;#fef3c7'apos;,
            padding: 'apos;16px'apos;,
            borderRadius: 'apos;8px'apos;,
            border: 'apos;1px solid #fde68a'apos;
          }}>
            <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#d97706'apos; }}>
              {state.analytics.totalAbandonments}
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#d97706'apos; }}>Abandons</div>
          </div>

          <div style={{
            background: 'apos;#f3e8ff'apos;,
            padding: 'apos;16px'apos;,
            borderRadius: 'apos;8px'apos;,
            border: 'apos;1px solid #d8b4fe'apos;
          }}>
            <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#7c3aed'apos; }}>
              {state.analytics.completionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#7c3aed'apos; }}>Taux de complétion</div>
          </div>
        </div>

        <div style={{
          background: 'apos;#f9fafb'apos;,
          padding: 'apos;16px'apos;,
          borderRadius: 'apos;8px'apos;,
          marginBottom: 'apos;16px'apos;
        }}>
          <h4 style={{
            fontSize: 'apos;14px'apos;,
            fontWeight: 'apos;600'apos;,
            marginBottom: 'apos;8px'apos;,
            color: 'apos;#374151'apos;
          }}>
            Points d'apos;abandon principaux
          </h4>
          {state.analytics.topAbandonmentPoints.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 'apos;20px'apos; }}>
              {state.analytics.topAbandonmentPoints.slice(0, 3).map((point, index) => (
                <li key={index} style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>
                  {point.field}: {point.count} abandons
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, margin: 0 }}>
              Aucun point d'apos;abandon identifié
            </p>
          )}
        </div>

        <button
          onClick={generateOptimizations}
          disabled={state.loading}
          style={{
            background: 'apos;#3b82f6'apos;,
            color: 'apos;#ffffff'apos;,
            border: 'apos;none'apos;,
            padding: 'apos;12px 24px'apos;,
            borderRadius: 'apos;8px'apos;,
            fontSize: 'apos;14px'apos;,
            fontWeight: 'apos;600'apos;,
            cursor: state.loading ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
            opacity: state.loading ? 0.6 : 1,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: 'apos;8px'apos;
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
        background: 'apos;#ffffff'apos;,
        borderRadius: 'apos;12px'apos;,
        padding: 'apos;24px'apos;,
        boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
        marginTop: 'apos;24px'apos;
      }}>
        <h3 style={{
          fontSize: 'apos;18px'apos;,
          fontWeight: 'apos;600'apos;,
          marginBottom: 'apos;16px'apos;,
          color: 'apos;#111827'apos;
        }}>
          <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: 'apos;8px'apos;, color: 'apos;#f59e0b'apos; }} />
          Suggestions d'apos;Optimisation
        </h3>

        {state.optimization.suggestions.length > 0 ? (
          <div style={{ marginBottom: 'apos;24px'apos; }}>
            {state.optimization.suggestions.map((suggestion, index) => (
              <div 
                key={index}
                style={{
                  background: suggestion.priority === 'apos;high'apos; ? 'apos;#fef2f2'apos; : 
                             suggestion.priority === 'apos;medium'apos; ? 'apos;#fffbeb'apos; : 'apos;#f0f9ff'apos;,
                  border: suggestion.priority === 'apos;high'apos; ? 'apos;1px solid #fecaca'apos; :
                          suggestion.priority === 'apos;medium'apos; ? 'apos;1px solid #fed7aa'apos; : 'apos;1px solid #bae6fd'apos;,
                  borderRadius: 'apos;8px'apos;,
                  padding: 'apos;16px'apos;,
                  marginBottom: 'apos;12px'apos;
                }}
              >
                <div style={{
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;,
                  marginBottom: 'apos;8px'apos;
                }}>
                  <FontAwesomeIcon 
                    icon={suggestion.priority === 'apos;high'apos; ? faExclamationTriangle : faInfoCircle}
                    style={{ 
                      color: suggestion.priority === 'apos;high'apos; ? 'apos;#dc2626'apos; : 
                             suggestion.priority === 'apos;medium'apos; ? 'apos;#d97706'apos; : 'apos;#0369a1'apos;
                    }}
                  />
                  <span style={{
                    fontSize: 'apos;12px'apos;,
                    fontWeight: 'apos;600'apos;,
                    textTransform: 'apos;uppercase'apos;,
                    color: suggestion.priority === 'apos;high'apos; ? 'apos;#dc2626'apos; : 
                           suggestion.priority === 'apos;medium'apos; ? 'apos;#d97706'apos; : 'apos;#0369a1'apos;
                  }}>
                    {suggestion.priority}
                  </span>
                  <span style={{
                    fontSize: 'apos;12px'apos;,
                    color: 'apos;#6b7280'apos;
                  }}>
                    Impact: {suggestion.impact}%
                  </span>
                </div>
                <p style={{
                  fontSize: 'apos;14px'apos;,
                  color: 'apos;#374151'apos;,
                  margin: 'apos;0 0 8px 0'apos;
                }}>
                  {suggestion.description}
                </p>
                <p style={{
                  fontSize: 'apos;12px'apos;,
                  color: 'apos;#6b7280'apos;,
                  margin: 0,
                  fontStyle: 'apos;italic'apos;
                }}>
                  {suggestion.implementation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos;, fontStyle: 'apos;italic'apos; }}>
            Aucune suggestion d'apos;optimisation pour le moment
          </p>
        )}

        <h4 style={{
          fontSize: 'apos;16px'apos;,
          fontWeight: 'apos;600'apos;,
          marginBottom: 'apos;12px'apos;,
          color: 'apos;#374151'apos;
        }}>
          Variantes A/B suggérées
        </h4>
        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(auto-fit, minmax(250px, 1fr))'apos;,
          gap: 'apos;16px'apos;
        }}>
          {state.optimization.aBTestVariants.map((variant, index) => (
            <div 
              key={index}
              style={{
                background: 'apos;#f9fafb'apos;,
                border: 'apos;1px solid #e5e7eb'apos;,
                borderRadius: 'apos;8px'apos;,
                padding: 'apos;16px'apos;
              }}
            >
              <h5 style={{
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;600'apos;,
                marginBottom: 'apos;8px'apos;,
                color: 'apos;#374151'apos;
              }}>
                {variant.name}
              </h5>
              <ul style={{
                fontSize: 'apos;12px'apos;,
                color: 'apos;#6b7280'apos;,
                margin: 0,
                paddingLeft: 'apos;16px'apos;
              }}>
                {Object.entries(variant.changes).map(([key, value]) => (
                  <li key={key}>
                    {key}: {typeof value === 'apos;boolean'apos; ? (value ? 'apos;Oui'apos; : 'apos;Non'apos;) : value}
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
        display: 'apos;flex'apos;,
        justifyContent: 'apos;center'apos;,
        alignItems: 'apos;center'apos;,
        padding: 'apos;40px'apos;,
        fontSize: 'apos;16px'apos;,
        color: 'apos;#6b7280'apos;
      }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 'apos;8px'apos; }} />
        Chargement du formulaire...
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{
        background: 'apos;#fef2f2'apos;,
        border: 'apos;1px solid #fecaca'apos;,
        borderRadius: 'apos;8px'apos;,
        padding: 'apos;16px'apos;,
        color: 'apos;#dc2626'apos;,
        textAlign: 'apos;center'apos;
      }}>
        <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: 'apos;8px'apos; }} />
        {state.error}
      </div>
    );
  }

  if (!state.form) {
    return (
      <div style={{
        textAlign: 'apos;center'apos;,
        padding: 'apos;40px'apos;,
        color: 'apos;#6b7280'apos;
      }}>
        Formulaire non trouvé
      </div>
    );
  }

  return (
    <div className={`form-optimizer ${className}`} style={{ maxWidth: 'apos;800px'apos;, margin: 'apos;0 auto'apos; }}>
      {/* En-tête du formulaire */}
      <div style={{
        background: 'apos;#ffffff'apos;,
        borderRadius: 'apos;12px'apos;,
        padding: 'apos;24px'apos;,
        boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
        marginBottom: 'apos;24px'apos;
      }}>
        <h2 style={{
          fontSize: 'apos;24px'apos;,
          fontWeight: 'apos;700'apos;,
          marginBottom: 'apos;8px'apos;,
          color: 'apos;#111827'apos;
        }}>
          {state.form.name}
        </h2>
        {state.form.description && (
          <p style={{
            fontSize: 'apos;14px'apos;,
            color: 'apos;#6b7280'apos;,
            margin: 0
          }}>
            {state.form.description}
          </p>
        )}

        {/* Barre de progression */}
        {state.form.showProgress && state.formData && (
          <div style={{ marginTop: 'apos;16px'apos; }}>
            <div style={{
              display: 'apos;flex'apos;,
              justifyContent: 'apos;space-between'apos;,
              alignItems: 'apos;center'apos;,
              marginBottom: 'apos;8px'apos;
            }}>
              <span style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos; }}>
                Progression
              </span>
              <span style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos; }}>
                {state.formData.progress}%
              </span>
            </div>
            <div style={{
              width: 'apos;100%'apos;,
              height: 'apos;8px'apos;,
              background: 'apos;#e5e7eb'apos;,
              borderRadius: 'apos;4px'apos;,
              overflow: 'apos;hidden'apos;
            }}>
              <div style={{
                width: `${state.formData.progress}%`,
                height: 'apos;100%'apos;,
                background: 'apos;linear-gradient(90deg, #3b82f6, #8b5cf6)'apos;,
                transition: 'apos;width 0.3s ease'apos;
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {!state.formData ? (
        <div style={{
          background: 'apos;#ffffff'apos;,
          borderRadius: 'apos;12px'apos;,
          padding: 'apos;24px'apos;,
          boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
          textAlign: 'apos;center'apos;
        }}>
          <p style={{
            fontSize: 'apos;16px'apos;,
            color: 'apos;#374151'apos;,
            marginBottom: 'apos;24px'apos;
          }}>
            Prêt à commencer le formulaire ?
          </p>
          <button
            onClick={startForm}
            disabled={state.loading}
            style={{
              background: 'apos;#3b82f6'apos;,
              color: 'apos;#ffffff'apos;,
              border: 'apos;none'apos;,
              padding: 'apos;12px 24px'apos;,
              borderRadius: 'apos;8px'apos;,
              fontSize: 'apos;16px'apos;,
              fontWeight: 'apos;600'apos;,
              cursor: state.loading ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
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
          background: 'apos;#ffffff'apos;,
          borderRadius: 'apos;12px'apos;,
          padding: 'apos;24px'apos;,
          boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;
        }}>
          <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
            {state.form.fields
              .sort((a, b) => a.order - b.order)
              .map(renderField)
            }

            <div style={{
              display: 'apos;flex'apos;,
              gap: 'apos;12px'apos;,
              marginTop: 'apos;32px'apos;,
              flexWrap: 'apos;wrap'apos;
            }}>
              {state.form.allowDraft && (
                <button
                  type="button"
                  onClick={saveDraft}
                  style={{
                    background: 'apos;#f3f4f6'apos;,
                    color: 'apos;#374151'apos;,
                    border: 'apos;1px solid #d1d5db'apos;,
                    padding: 'apos;12px 24px'apos;,
                    borderRadius: 'apos;8px'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    cursor: 'apos;pointer'apos;,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;
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
                  background: state.formData.submitted ? 'apos;#10b981'apos; : 'apos;#3b82f6'apos;,
                  color: 'apos;#ffffff'apos;,
                  border: 'apos;none'apos;,
                  padding: 'apos;12px 24px'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: state.loading || state.formData.submitted ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
                  opacity: state.loading ? 0.6 : 1,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;
                }}
              >
                {state.loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : state.formData.submitted ? (
                  <FontAwesomeIcon icon={faCheckCircle} />
                ) : (
                  <FontAwesomeIcon icon={faCheck} />
                )}
                {state.formData.submitted ? 'apos;Soumis'apos; : state.form.submitButtonText || 'apos;Soumettre'apos;}
              </button>
            </div>
          </form>

          {/* Message de succès */}
          {state.formData.submitted && state.form.successMessage && (
            <div style={{
              background: 'apos;#f0fdf4'apos;,
              border: 'apos;1px solid #bbf7d0'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginTop: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'apos;#15803d'apos; }} />
              <span style={{ color: 'apos;#15803d'apos;, fontWeight: 'apos;600'apos; }}>
                {state.form.successMessage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'apos;action */}
      <div style={{
        display: 'apos;flex'apos;,
        gap: 'apos;12px'apos;,
        marginTop: 'apos;24px'apos;,
        justifyContent: 'apos;center'apos;
      }}>
        <button
          onClick={() => setState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
          style={{
            background: 'apos;#f3f4f6'apos;,
            color: 'apos;#374151'apos;,
            border: 'apos;1px solid #d1d5db'apos;,
            padding: 'apos;8px 16px'apos;,
            borderRadius: 'apos;6px'apos;,
            fontSize: 'apos;12px'apos;,
            fontWeight: 'apos;600'apos;,
            cursor: 'apos;pointer'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: 'apos;6px'apos;
          }}
        >
          <FontAwesomeIcon icon={faChartLine} />
          {state.showAnalytics ? 'apos;Masquer'apos; : 'apos;Afficher'apos;} Analytics
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, showOptimization: !prev.showOptimization }))}
          style={{
            background: 'apos;#f3f4f6'apos;,
            color: 'apos;#374151'apos;,
            border: 'apos;1px solid #d1d5db'apos;,
            padding: 'apos;8px 16px'apos;,
            borderRadius: 'apos;6px'apos;,
            fontSize: 'apos;12px'apos;,
            fontWeight: 'apos;600'apos;,
            cursor: 'apos;pointer'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: 'apos;6px'apos;
          }}
        >
          <FontAwesomeIcon icon={faLightbulb} />
          {state.showOptimization ? 'apos;Masquer'apos; : 'apos;Afficher'apos;} Optimisations
        </button>
      </div>

      {/* Analytics */}
      {state.showAnalytics && renderAnalytics()}

      {/* Optimisations */}
      {state.showOptimization && renderOptimizations()}
    </div>
  );
}
