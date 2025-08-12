import { logger } from 'apos;./logger'apos;;
import { metrics } from 'apos;./metrics'apos;;

export enum FormFieldType {
  TEXT = 'apos;text'apos;,
  EMAIL = 'apos;email'apos;,
  PASSWORD = 'apos;password'apos;,
  NUMBER = 'apos;number'apos;,
  SELECT = 'apos;select'apos;,
  MULTISELECT = 'apos;multiselect'apos;,
  CHECKBOX = 'apos;checkbox'apos;,
  RADIO = 'apos;radio'apos;,
  TEXTAREA = 'apos;textarea'apos;,
  DATE = 'apos;date'apos;,
  DATETIME = 'apos;datetime'apos;,
  FILE = 'apos;file'apos;,
  URL = 'apos;url'apos;,
  PHONE = 'apos;phone'apos;,
  CURRENCY = 'apos;currency'apos;
}

export enum ValidationRule {
  REQUIRED = 'apos;required'apos;,
  EMAIL = 'apos;email'apos;,
  MIN_LENGTH = 'apos;min_length'apos;,
  MAX_LENGTH = 'apos;max_length'apos;,
  PATTERN = 'apos;pattern'apos;,
  MIN_VALUE = 'apos;min_value'apos;,
  MAX_VALUE = 'apos;max_value'apos;,
  CUSTOM = 'apos;custom'apos;
}

export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  validationConfig?: Record<string, any>;
  helpText?: string;
  errorMessage?: string;
  disabled?: boolean;
  hidden?: boolean;
  order: number;
  group?: string;
  dependencies?: string[]; // IDs des champs dont dépend ce champ
}

export interface FormConfig {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  cancelButtonText?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // en millisecondes
  validationMode?: 'apos;onBlur'apos; | 'apos;onChange'apos; | 'apos;onSubmit'apos;;
  showProgress?: boolean;
  allowDraft?: boolean;
  maxRetries?: number;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  analytics?: {
    trackAbandonment?: boolean;
    trackTimeSpent?: boolean;
    trackErrors?: boolean;
  };
}

export interface FormData {
  formId: string;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
  progress: number; // 0-100
  startTime: Date;
  lastActivity: Date;
  completed: boolean;
  submitted: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  draft?: boolean;
  retryCount: number;
}

export interface FormAnalytics {
  formId: string;
  totalStarts: number;
  totalCompletions: number;
  totalAbandonments: number;
  averageTimeSpent: number; // en secondes
  averageProgress: number;
  errorRate: number;
  fieldErrors: Record<string, number>;
  completionRate: number;
  abandonmentRate: number;
  topAbandonmentPoints: Array<{ field: string; count: number }>;
  userJourney: Array<{ action: string; timestamp: Date; data?: any }>;
}

export interface FormOptimization {
  formId: string;
  suggestions: Array<{
    type: 'apos;field_order'apos; | 'apos;field_removal'apos; | 'apos;field_addition'apos; | 'apos;validation'apos; | 'apos;ui_improvement'apos;;
    priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
    description: string;
    impact: number; // 0-100
    implementation: string;
  }>;
  aBTestVariants: Array<{
    id: string;
    name: string;
    changes: Record<string, any>;
    performance: {
      completionRate: number;
      averageTime: number;
      errorRate: number;
    };
  }>;
}

class FormOptimizer {
  private forms: Map<string, FormConfig> = new Map();
  private formData: Map<string, FormData> = new Map();
  private analytics: Map<string, FormAnalytics> = new Map();
  private optimizations: Map<string, FormOptimization> = new Map();

  constructor() {
    this.initializeDefaultForms();
  }

  private initializeDefaultForms() {
    // Formulaire de contact optimisé
    this.addForm({
      id: 'apos;contact-form'apos;,
      name: 'apos;Formulaire de Contact'apos;,
      description: 'apos;Formulaire de contact optimisé pour la conversion'apos;,
      fields: [
        {
          id: 'apos;name'apos;,
          name: 'apos;name'apos;,
          type: FormFieldType.TEXT,
          label: 'apos;Nom complet'apos;,
          placeholder: 'apos;Votre nom complet'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH],
          validationConfig: { min_length: 2 },
          order: 1
        },
        {
          id: 'apos;email'apos;,
          name: 'apos;email'apos;,
          type: FormFieldType.EMAIL,
          label: 'apos;Email'apos;,
          placeholder: 'apos;votre@email.com'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.EMAIL],
          order: 2
        },
        {
          id: 'apos;company'apos;,
          name: 'apos;company'apos;,
          type: FormFieldType.TEXT,
          label: 'apos;Entreprise'apos;,
          placeholder: 'apos;Nom de votre entreprise'apos;,
          required: false,
          order: 3
        },
        {
          id: 'apos;message'apos;,
          name: 'apos;message'apos;,
          type: FormFieldType.TEXTAREA,
          label: 'apos;Message'apos;,
          placeholder: 'apos;Décrivez votre projet...'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH],
          validationConfig: { min_length: 10 },
          order: 4
        }
      ],
      submitButtonText: 'apos;Envoyer le message'apos;,
      autoSave: true,
      autoSaveInterval: 30000, // 30 secondes
      validationMode: 'apos;onBlur'apos;,
      showProgress: true,
      allowDraft: true,
      maxRetries: 3,
      successMessage: 'apos;Message envoyé avec succès !'apos;,
      analytics: {
        trackAbandonment: true,
        trackTimeSpent: true,
        trackErrors: true
      }
    });

    // Formulaire d'apos;inscription optimisé
    this.addForm({
      id: 'apos;signup-form'apos;,
      name: 'apos;Inscription'apos;,
      description: 'apos;Formulaire d\'apos;inscription avec validation progressive'apos;,
      fields: [
        {
          id: 'apos;firstName'apos;,
          name: 'apos;firstName'apos;,
          type: FormFieldType.TEXT,
          label: 'apos;Prénom'apos;,
          placeholder: 'apos;Votre prénom'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 1
        },
        {
          id: 'apos;lastName'apos;,
          name: 'apos;lastName'apos;,
          type: FormFieldType.TEXT,
          label: 'apos;Nom'apos;,
          placeholder: 'apos;Votre nom'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 2
        },
        {
          id: 'apos;email'apos;,
          name: 'apos;email'apos;,
          type: FormFieldType.EMAIL,
          label: 'apos;Email'apos;,
          placeholder: 'apos;votre@email.com'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.EMAIL],
          order: 3
        },
        {
          id: 'apos;password'apos;,
          name: 'apos;password'apos;,
          type: FormFieldType.PASSWORD,
          label: 'apos;Mot de passe'apos;,
          placeholder: 'apos;Créez un mot de passe sécurisé'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH, ValidationRule.PATTERN],
          validationConfig: { 
            min_length: 8,
            pattern: 'apos;^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'apos;
          },
          helpText: 'apos;Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'apos;,
          order: 4
        },
        {
          id: 'apos;confirmPassword'apos;,
          name: 'apos;confirmPassword'apos;,
          type: FormFieldType.PASSWORD,
          label: 'apos;Confirmer le mot de passe'apos;,
          placeholder: 'apos;Confirmez votre mot de passe'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.CUSTOM],
          validationConfig: { 
            custom: (value: string, formData: Record<string, any>) => value === formData.password 
          },
          dependencies: ['apos;password'apos;],
          order: 5
        },
        {
          id: 'apos;acceptTerms'apos;,
          name: 'apos;acceptTerms'apos;,
          type: FormFieldType.CHECKBOX,
          label: 'apos;J\'apos;accepte les conditions d\'apos;utilisation'apos;,
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 6
        }
      ],
      submitButtonText: 'apos;Créer mon compte'apos;,
      validationMode: 'apos;onChange'apos;,
      showProgress: true,
      successMessage: 'apos;Compte créé avec succès !'apos;,
      redirectUrl: 'apos;/dashboard'apos;,
      analytics: {
        trackAbandonment: true,
        trackTimeSpent: true,
        trackErrors: true
      }
    });
  }

  // Gestion des formulaires
  addForm(config: FormConfig): void {
    this.forms.set(config.id, config);
    
    // Initialiser les analytics
    this.analytics.set(config.id, {
      formId: config.id,
      totalStarts: 0,
      totalCompletions: 0,
      totalAbandonments: 0,
      averageTimeSpent: 0,
      averageProgress: 0,
      errorRate: 0,
      fieldErrors: {},
      completionRate: 0,
      abandonmentRate: 0,
      topAbandonmentPoints: [],
      userJourney: []
    });

    logger.info(`Form added: ${config.name}`, {
      action: 'apos;form_added'apos;,
      metadata: { formId: config.id, fieldCount: config.fields.length }
    });
  }

  getForm(formId: string): FormConfig | null {
    return this.forms.get(formId) || null;
  }

  getAllForms(): FormConfig[] {
    return Array.from(this.forms.values());
  }

  // Gestion des données de formulaire
  startForm(formId: string, userId?: string): FormData {
    const form = this.forms.get(formId);
    if (!form) {
      throw new Error(`Form not found: ${formId}`);
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const formData: FormData = {
      formId,
      userId,
      sessionId,
      data: {},
      progress: 0,
      startTime: new Date(),
      lastActivity: new Date(),
      completed: false,
      submitted: false,
      errors: {},
      warnings: {},
      retryCount: 0
    };

    this.formData.set(sessionId, formData);

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formId);
    if (analytics) {
      analytics.totalStarts++;
      analytics.userJourney.push({
        action: 'apos;form_started'apos;,
        timestamp: new Date(),
        data: { userId, sessionId }
      });
    }

    logger.info(`Form started: ${formId}`, {
      action: 'apos;form_started'apos;,
      metadata: { formId, userId, sessionId }
    });

    metrics.recordUserAction('apos;form_started'apos;, userId, { formId });

    return formData;
  }

  updateFormData(sessionId: string, fieldId: string, value: any): FormData | null {
    const formData = this.formData.get(sessionId);
    if (!formData) return null;

    const form = this.forms.get(formData.formId);
    if (!form) return null;

    // Mettre à jour les données
    formData.data[fieldId] = value;
    formData.lastActivity = new Date();

    // Valider le champ
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      const fieldErrors = this.validateField(field, value, formData.data);
      if (fieldErrors.length > 0) {
        formData.errors[fieldId] = fieldErrors;
      } else {
        delete formData.errors[fieldId];
      }
    }

    // Calculer le progrès
    formData.progress = this.calculateProgress(form, formData.data);

    // Sauvegarder automatiquement si configuré
    if (form.autoSave) {
      this.saveDraft(sessionId);
    }

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId);
    if (analytics) {
      analytics.userJourney.push({
        action: 'apos;field_updated'apos;,
        timestamp: new Date(),
        data: { fieldId, value, progress: formData.progress }
      });
    }

    logger.info(`Form data updated: ${fieldId}`, {
      action: 'apos;form_data_updated'apos;,
      metadata: { formId: formData.formId, fieldId, sessionId, progress: formData.progress }
    });

    return formData;
  }

  validateForm(sessionId: string): { isValid: boolean; errors: Record<string, string[]> } {
    const formData = this.formData.get(sessionId);
    if (!formData) {
      return { isValid: false, errors: {} };
    }

    const form = this.forms.get(formData.formId);
    if (!form) {
      return { isValid: false, errors: {} };
    }

    const errors: Record<string, string[]> = {};

    // Valider tous les champs
    for (const field of form.fields) {
      if (field.required || formData.data[field.id]) {
        const fieldErrors = this.validateField(field, formData.data[field.id], formData.data);
        if (fieldErrors.length > 0) {
          errors[field.id] = fieldErrors;
        }
      }
    }

    formData.errors = errors;

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId);
    if (analytics) {
      Object.keys(errors).forEach(fieldId => {
        analytics.fieldErrors[fieldId] = (analytics.fieldErrors[fieldId] || 0) + 1;
      });
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  private validateField(field: FormField, value: any, formData: Record<string, any>): string[] {
    const errors: string[] = [];

    if (!field.validation) return errors;

    for (const rule of field.validation) {
      switch (rule) {
        case ValidationRule.REQUIRED:
          if (!value || (typeof value === 'apos;string'apos; && value.trim() === 'apos;'apos;)) {
            errors.push(field.errorMessage || `${field.label} est requis`);
          }
          break;

        case ValidationRule.EMAIL:
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(field.errorMessage || 'apos;Format d\'apos;email invalide'apos;);
          }
          break;

        case ValidationRule.MIN_LENGTH:
          const minLength = field.validationConfig?.min_length || 0;
          if (value && typeof value === 'apos;string'apos; && value.length < minLength) {
            errors.push(field.errorMessage || `${field.label} doit contenir au moins ${minLength} caractères`);
          }
          break;

        case ValidationRule.MAX_LENGTH:
          const maxLength = field.validationConfig?.max_length || 0;
          if (value && typeof value === 'apos;string'apos; && value.length > maxLength) {
            errors.push(field.errorMessage || `${field.label} ne peut pas dépasser ${maxLength} caractères`);
          }
          break;

        case ValidationRule.PATTERN:
          const pattern = field.validationConfig?.pattern;
          if (pattern && value && !new RegExp(pattern).test(value)) {
            errors.push(field.errorMessage || `${field.label} ne respecte pas le format requis`);
          }
          break;

        case ValidationRule.MIN_VALUE:
          const minValue = field.validationConfig?.min_value;
          if (minValue !== undefined && value && Number(value) < minValue) {
            errors.push(field.errorMessage || `${field.label} doit être au moins ${minValue}`);
          }
          break;

        case ValidationRule.MAX_VALUE:
          const maxValue = field.validationConfig?.max_value;
          if (maxValue !== undefined && value && Number(value) > maxValue) {
            errors.push(field.errorMessage || `${field.label} ne peut pas dépasser ${maxValue}`);
          }
          break;

        case ValidationRule.CUSTOM:
          const customValidator = field.validationConfig?.custom;
          if (customValidator && typeof customValidator === 'apos;function'apos;) {
            try {
              if (!customValidator(value, formData)) {
                errors.push(field.errorMessage || `${field.label} n'apos;est pas valide`);
              }
            } catch (error) {
              errors.push('apos;Erreur de validation personnalisée'apos;);
            }
          }
          break;
      }
    }

    return errors;
  }

  private calculateProgress(form: FormConfig, data: Record<string, any>): number {
    const requiredFields = form.fields.filter(f => f.required);
    if (requiredFields.length === 0) return 100;

    const completedFields = requiredFields.filter(field => {
      const value = data[field.id];
      return value && (typeof value !== 'apos;string'apos; || value.trim() !== 'apos;'apos;);
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  // Soumission de formulaire
  submitForm(sessionId: string): { success: boolean; errors?: Record<string, string[]>; data?: FormData } {
    const formData = this.formData.get(sessionId);
    if (!formData) {
      return { success: false, errors: {} };
    }

    const form = this.forms.get(formData.formId);
    if (!form) {
      return { success: false, errors: {} };
    }

    // Valider le formulaire
    const validation = this.validateForm(sessionId);
    if (!validation.isValid) {
      formData.retryCount++;
      
      // Mettre à jour les analytics
      const analytics = this.analytics.get(formData.formId);
      if (analytics) {
        analytics.userJourney.push({
          action: 'apos;form_submission_failed'apos;,
          timestamp: new Date(),
          data: { errors: validation.errors, retryCount: formData.retryCount }
        });
      }

      logger.warn(`Form submission failed: ${formData.formId}`, {
        action: 'apos;form_submission_failed'apos;,
        metadata: { formId: formData.formId, sessionId, errors: validation.errors }
      });

      return { success: false, errors: validation.errors };
    }

    // Marquer comme soumis
    formData.submitted = true;
    formData.completed = true;
    formData.progress = 100;

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId);
    if (analytics) {
      analytics.totalCompletions++;
      analytics.averageTimeSpent = this.calculateAverageTimeSpent(formData.formId);
      analytics.completionRate = (analytics.totalCompletions / analytics.totalStarts) * 100;
      analytics.userJourney.push({
        action: 'apos;form_submitted'apos;,
        timestamp: new Date(),
        data: { timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000 }
      });
    }

    logger.info(`Form submitted: ${formData.formId}`, {
      action: 'apos;form_submitted'apos;,
      metadata: { formId: formData.formId, sessionId, timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000 }
    });

    metrics.recordUserAction('apos;form_submitted'apos;, formData.userId, { 
      formId: formData.formId,
      timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000
    });

    return { success: true, data: formData };
  }

  // Sauvegarde de brouillon
  saveDraft(sessionId: string): boolean {
    const formData = this.formData.get(sessionId);
    if (!formData) return false;

    formData.draft = true;
    formData.lastActivity = new Date();

    logger.info(`Form draft saved: ${formData.formId}`, {
      action: 'apos;form_draft_saved'apos;,
      metadata: { formId: formData.formId, sessionId }
    });

    return true;
  }

  // Abandon de formulaire
  abandonForm(sessionId: string, reason?: string): boolean {
    const formData = this.formData.get(sessionId);
    if (!formData || formData.submitted) return false;

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId);
    if (analytics) {
      analytics.totalAbandonments++;
      analytics.abandonmentRate = (analytics.totalAbandonments / analytics.totalStarts) * 100;
      analytics.userJourney.push({
        action: 'apos;form_abandoned'apos;,
        timestamp: new Date(),
        data: { 
          reason,
          progress: formData.progress,
          timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000
        }
      });

      // Identifier le point d'apos;abandon
      const lastField = this.getLastActiveField(formData);
      if (lastField) {
        const existingPoint = analytics.topAbandonmentPoints.find(p => p.field === lastField);
        if (existingPoint) {
          existingPoint.count++;
        } else {
          analytics.topAbandonmentPoints.push({ field: lastField, count: 1 });
        }
        analytics.topAbandonmentPoints.sort((a, b) => b.count - a.count);
      }
    }

    logger.info(`Form abandoned: ${formData.formId}`, {
      action: 'apos;form_abandoned'apos;,
      metadata: { 
        formId: formData.formId, 
        sessionId, 
        reason, 
        progress: formData.progress 
      }
    });

    metrics.recordUserAction('apos;form_abandoned'apos;, formData.userId, { 
      formId: formData.formId,
      progress: formData.progress,
      reason
    });

    return true;
  }

  private getLastActiveField(formData: FormData): string | null {
    const form = this.forms.get(formData.formId);
    if (!form) return null;

    // Trouver le dernier champ rempli
    const filledFields = form.fields
      .filter(f => formData.data[f.id])
      .sort((a, b) => b.order - a.order);

    return filledFields.length > 0 ? filledFields[0].id : null;
  }

  private calculateAverageTimeSpent(formId: string): number {
    const analytics = this.analytics.get(formId);
    if (!analytics || analytics.totalCompletions === 0) return 0;

    // Calculer le temps moyen basé sur les soumissions récentes
    const recentSubmissions = analytics.userJourney
      .filter(j => j.action === 'apos;form_submitted'apos;)
      .slice(-10); // 10 dernières soumissions

    if (recentSubmissions.length === 0) return 0;

    const totalTime = recentSubmissions.reduce((sum, journey) => {
      return sum + (journey.data?.timeSpent || 0);
    }, 0);

    return totalTime / recentSubmissions.length;
  }

  // Analytics et optimisations
  getFormAnalytics(formId: string): FormAnalytics | null {
    return this.analytics.get(formId) || null;
  }

  generateOptimizations(formId: string): FormOptimization {
    const analytics = this.analytics.get(formId);
    const form = this.forms.get(formId);
    
    if (!analytics || !form) {
      return { formId, suggestions: [], aBTestVariants: [] };
    }

    const suggestions: FormOptimization['apos;suggestions'apos;] = [];

    // Analyser les points d'apos;abandon
    if (analytics.topAbandonmentPoints.length > 0) {
      const topAbandonment = analytics.topAbandonmentPoints[0];
      suggestions.push({
        type: 'apos;field_order'apos;,
        priority: 'apos;high'apos;,
        description: `Le champ "${topAbandonment.field}" cause ${topAbandonment.count} abandons. Considérer le déplacer ou le simplifier.`,
        impact: Math.min(90, topAbandonment.count * 10),
        implementation: 'apos;Réorganiser les champs ou simplifier la validation'apos;
      });
    }

    // Analyser le taux de complétion
    if (analytics.completionRate < 50) {
      suggestions.push({
        type: 'apos;ui_improvement'apos;,
        priority: 'apos;high'apos;,
        description: `Taux de complétion faible (${analytics.completionRate.toFixed(1)}%). Améliorer l\'apos;UX.`,
        impact: 80,
        implementation: 'apos;Ajouter des indicateurs de progression, simplifier les champs'apos;
      });
    }

    // Analyser le temps moyen
    if (analytics.averageTimeSpent > 300) { // Plus de 5 minutes
      suggestions.push({
        type: 'apos;field_removal'apos;,
        priority: 'apos;medium'apos;,
        description: `Temps moyen élevé (${Math.round(analytics.averageTimeSpent)}s). Considérer supprimer des champs non essentiels.`,
        impact: 60,
        implementation: 'apos;Identifier et supprimer les champs optionnels'apos;
      });
    }

    // Analyser les erreurs de validation
    const topErrorField = Object.entries(analytics.fieldErrors)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topErrorField) {
      suggestions.push({
        type: 'apos;validation'apos;,
        priority: 'apos;medium'apos;,
        description: `Le champ "${topErrorField[0]}" génère ${topErrorField[1]} erreurs. Améliorer la validation.`,
        impact: 50,
        implementation: 'apos;Clarifier les messages d\'apos;erreur et ajouter des exemples'apos;
      });
    }

    // Générer des variantes A/B
    const aBTestVariants = [
      {
        id: 'apos;variant-1'apos;,
        name: 'apos;Formulaire simplifié'apos;,
        changes: {
          removeOptionalFields: true,
          progressiveValidation: true,
          inlineHelp: true
        },
        performance: {
          completionRate: 0,
          averageTime: 0,
          errorRate: 0
        }
      },
      {
        id: 'apos;variant-2'apos;,
        name: 'apos;Formulaire en étapes'apos;,
        changes: {
          multiStep: true,
          progressIndicator: true,
          autoSave: true
        },
        performance: {
          completionRate: 0,
          averageTime: 0,
          errorRate: 0
        }
      }
    ];

    const optimization: FormOptimization = {
      formId,
      suggestions,
      aBTestVariants
    };

    this.optimizations.set(formId, optimization);

    logger.info(`Form optimizations generated: ${formId}`, {
      action: 'apos;form_optimizations_generated'apos;,
      metadata: { 
        formId, 
        suggestionsCount: suggestions.length,
        completionRate: analytics.completionRate 
      }
    });

    return optimization;
  }

  // Utilitaires
  getFormData(sessionId: string): FormData | null {
    return this.formData.get(sessionId) || null;
  }

  getAllFormData(): FormData[] {
    return Array.from(this.formData.values());
  }

  cleanupOldData(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 heures par défaut
    const cutoffTime = new Date().getTime() - maxAge;
    
    for (const [sessionId, formData] of this.formData.entries()) {
      if (formData.lastActivity.getTime() < cutoffTime && !formData.submitted) {
        this.formData.delete(sessionId);
      }
    }

    logger.info('apos;Old form data cleaned up'apos;, {
      action: 'apos;form_data_cleaned'apos;,
      metadata: { maxAge, cutoffTime: new Date(cutoffTime) }
    });
  }
}

// Instance globale
export const formOptimizer = new FormOptimizer();

// Fonctions utilitaires
export const addForm = (config: FormConfig) => {
  return formOptimizer.addForm(config);
};

export const getForm = (formId: string) => {
  return formOptimizer.getForm(formId);
};

export const getAllForms = () => {
  return formOptimizer.getAllForms();
};

export const startForm = (formId: string, userId?: string) => {
  return formOptimizer.startForm(formId, userId);
};

export const updateFormData = (sessionId: string, fieldId: string, value: any) => {
  return formOptimizer.updateFormData(sessionId, fieldId, value);
};

export const validateForm = (sessionId: string) => {
  return formOptimizer.validateForm(sessionId);
};

export const submitForm = (sessionId: string) => {
  return formOptimizer.submitForm(sessionId);
};

export const saveDraft = (sessionId: string) => {
  return formOptimizer.saveDraft(sessionId);
};

export const abandonForm = (sessionId: string, reason?: string) => {
  return formOptimizer.abandonForm(sessionId, reason);
};

export const getFormAnalytics = (formId: string) => {
  return formOptimizer.getFormAnalytics(formId);
};

export const generateOptimizations = (formId: string) => {
  return formOptimizer.generateOptimizations(formId);
};
