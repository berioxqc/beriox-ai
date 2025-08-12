import { logger } from './logger'
import { metrics } from './metrics'
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXTAREA = 'textarea',
  DATE = 'date',
  DATETIME = 'datetime',
  FILE = 'file',
  URL = 'url',
  PHONE = 'phone',
  CURRENCY = 'currency'
}

export enum ValidationRule {
  REQUIRED = 'required',
  EMAIL = 'email',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  PATTERN = 'pattern',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  CUSTOM = 'custom'
}

export interface FormField {
  id: string
  name: string
  type: FormFieldType
  label: string
  placeholder?: string
  required?: boolean
  defaultValue?: any
  options?: Array<{ value: string; label: string }>
  validation?: ValidationRule[]
  validationConfig?: Record<string, any>
  helpText?: string
  errorMessage?: string
  disabled?: boolean
  hidden?: boolean
  order: number
  group?: string
  dependencies?: string[]; // IDs des champs dont dépend ce champ
}

export interface FormConfig {
  id: string
  name: string
  description?: string
  fields: FormField[]
  submitButtonText?: string
  cancelButtonText?: string
  autoSave?: boolean
  autoSaveInterval?: number; // en millisecondes
  validationMode?: 'onBlur' | 'onChange' | 'onSubmit'
  showProgress?: boolean
  allowDraft?: boolean
  maxRetries?: number
  successMessage?: string
  errorMessage?: string
  redirectUrl?: string
  analytics?: {
    trackAbandonment?: boolean
    trackTimeSpent?: boolean
    trackErrors?: boolean
  }
}

export interface FormData {
  formId: string
  userId?: string
  sessionId: string
  data: Record<string, any>
  progress: number; // 0-100
  startTime: Date
  lastActivity: Date
  completed: boolean
  submitted: boolean
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
  draft?: boolean
  retryCount: number
}

export interface FormAnalytics {
  formId: string
  totalStarts: number
  totalCompletions: number
  totalAbandonments: number
  averageTimeSpent: number; // en secondes
  averageProgress: number
  errorRate: number
  fieldErrors: Record<string, number>
  completionRate: number
  abandonmentRate: number
  topAbandonmentPoints: Array<{ field: string; count: number }>
  userJourney: Array<{ action: string; timestamp: Date; data?: any }>
}

export interface FormOptimization {
  formId: string
  suggestions: Array<{
    type: 'field_order' | 'field_removal' | 'field_addition' | 'validation' | 'ui_improvement'
    priority: 'low' | 'medium' | 'high'
    description: string
    impact: number; // 0-100
    implementation: string
  }>
  aBTestVariants: Array<{
    id: string
    name: string
    changes: Record<string, any>
    performance: {
      completionRate: number
      averageTime: number
      errorRate: number
    }
  }>
}

class FormOptimizer {
  private forms: Map<string, FormConfig> = new Map()
  private formData: Map<string, FormData> = new Map()
  private analytics: Map<string, FormAnalytics> = new Map()
  private optimizations: Map<string, FormOptimization> = new Map()
  constructor() {
    this.initializeDefaultForms()
  }

  private initializeDefaultForms() {
    // Formulaire de contact optimisé
    this.addForm({
      id: 'contact-form',
      name: 'Formulaire de Contact',
      description: 'Formulaire de contact optimisé pour la conversion',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: FormFieldType.TEXT,
          label: 'Nom complet',
          placeholder: 'Votre nom complet',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH],
          validationConfig: { min_length: 2 },
          order: 1
        },
        {
          id: 'email',
          name: 'email',
          type: FormFieldType.EMAIL,
          label: 'Email',
          placeholder: 'votre@email.com',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.EMAIL],
          order: 2
        },
        {
          id: 'company',
          name: 'company',
          type: FormFieldType.TEXT,
          label: 'Entreprise',
          placeholder: 'Nom de votre entreprise',
          required: false,
          order: 3
        },
        {
          id: 'message',
          name: 'message',
          type: FormFieldType.TEXTAREA,
          label: 'Message',
          placeholder: 'Décrivez votre projet...',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH],
          validationConfig: { min_length: 10 },
          order: 4
        }
      ],
      submitButtonText: 'Envoyer le message',
      autoSave: true,
      autoSaveInterval: 30000, // 30 secondes
      validationMode: 'onBlur',
      showProgress: true,
      allowDraft: true,
      maxRetries: 3,
      successMessage: 'Message envoyé avec succès !',
      analytics: {
        trackAbandonment: true,
        trackTimeSpent: true,
        trackErrors: true
      }
    })
    // Formulaire d'inscription optimisé
    this.addForm({
      id: 'signup-form',
      name: 'Inscription',
      description: 'Formulaire d\'inscription avec validation progressive',
      fields: [
        {
          id: 'firstName',
          name: 'firstName',
          type: FormFieldType.TEXT,
          label: 'Prénom',
          placeholder: 'Votre prénom',
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 1
        },
        {
          id: 'lastName',
          name: 'lastName',
          type: FormFieldType.TEXT,
          label: 'Nom',
          placeholder: 'Votre nom',
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 2
        },
        {
          id: 'email',
          name: 'email',
          type: FormFieldType.EMAIL,
          label: 'Email',
          placeholder: 'votre@email.com',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.EMAIL],
          order: 3
        },
        {
          id: 'password',
          name: 'password',
          type: FormFieldType.PASSWORD,
          label: 'Mot de passe',
          placeholder: 'Créez un mot de passe sécurisé',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.MIN_LENGTH, ValidationRule.PATTERN],
          validationConfig: { 
            min_length: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          },
          helpText: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
          order: 4
        },
        {
          id: 'confirmPassword',
          name: 'confirmPassword',
          type: FormFieldType.PASSWORD,
          label: 'Confirmer le mot de passe',
          placeholder: 'Confirmez votre mot de passe',
          required: true,
          validation: [ValidationRule.REQUIRED, ValidationRule.CUSTOM],
          validationConfig: { 
            custom: (value: string, formData: Record<string, any>) => value === formData.password 
          },
          dependencies: ['password'],
          order: 5
        },
        {
          id: 'acceptTerms',
          name: 'acceptTerms',
          type: FormFieldType.CHECKBOX,
          label: 'J\'accepte les conditions d\'utilisation',
          required: true,
          validation: [ValidationRule.REQUIRED],
          order: 6
        }
      ],
      submitButtonText: 'Créer mon compte',
      validationMode: 'onChange',
      showProgress: true,
      successMessage: 'Compte créé avec succès !',
      redirectUrl: '/dashboard',
      analytics: {
        trackAbandonment: true,
        trackTimeSpent: true,
        trackErrors: true
      }
    })
  }

  // Gestion des formulaires
  addForm(config: FormConfig): void {
    this.forms.set(config.id, config)
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
    })
    logger.info(`Form added: ${config.name}`, {
      action: 'form_added',
      metadata: { formId: config.id, fieldCount: config.fields.length }
    })
  }

  getForm(formId: string): FormConfig | null {
    return this.forms.get(formId) || null
  }

  getAllForms(): FormConfig[] {
    return Array.from(this.forms.values())
  }

  // Gestion des données de formulaire
  startForm(formId: string, userId?: string): FormData {
    const form = this.forms.get(formId)
    if (!form) {
      throw new Error(`Form not found: ${formId}`)
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    }
    this.formData.set(sessionId, formData)
    // Mettre à jour les analytics
    const analytics = this.analytics.get(formId)
    if (analytics) {
      analytics.totalStarts++
      analytics.userJourney.push({
        action: 'form_started',
        timestamp: new Date(),
        data: { userId, sessionId }
      })
    }

    logger.info(`Form started: ${formId}`, {
      action: 'form_started',
      metadata: { formId, userId, sessionId }
    })
    metrics.recordUserAction('form_started', userId, { formId })
    return formData
  }

  updateFormData(sessionId: string, fieldId: string, value: any): FormData | null {
    const formData = this.formData.get(sessionId)
    if (!formData) return null
    const form = this.forms.get(formData.formId)
    if (!form) return null
    // Mettre à jour les données
    formData.data[fieldId] = value
    formData.lastActivity = new Date()
    // Valider le champ
    const field = form.fields.find(f => f.id === fieldId)
    if (field) {
      const fieldErrors = this.validateField(field, value, formData.data)
      if (fieldErrors.length > 0) {
        formData.errors[fieldId] = fieldErrors
      } else {
        delete formData.errors[fieldId]
      }
    }

    // Calculer le progrès
    formData.progress = this.calculateProgress(form, formData.data)
    // Sauvegarder automatiquement si configuré
    if (form.autoSave) {
      this.saveDraft(sessionId)
    }

    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId)
    if (analytics) {
      analytics.userJourney.push({
        action: 'field_updated',
        timestamp: new Date(),
        data: { fieldId, value, progress: formData.progress }
      })
    }

    logger.info(`Form data updated: ${fieldId}`, {
      action: 'form_data_updated',
      metadata: { formId: formData.formId, fieldId, sessionId, progress: formData.progress }
    })
    return formData
  }

  validateForm(sessionId: string): { isValid: boolean; errors: Record<string, string[]> } {
    const formData = this.formData.get(sessionId)
    if (!formData) {
      return { isValid: false, errors: {} }
    }

    const form = this.forms.get(formData.formId)
    if (!form) {
      return { isValid: false, errors: {} }
    }

    const errors: Record<string, string[]> = {}
    // Valider tous les champs
    for (const field of form.fields) {
      if (field.required || formData.data[field.id]) {
        const fieldErrors = this.validateField(field, formData.data[field.id], formData.data)
        if (fieldErrors.length > 0) {
          errors[field.id] = fieldErrors
        }
      }
    }

    formData.errors = errors
    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId)
    if (analytics) {
      Object.keys(errors).forEach(fieldId => {
        analytics.fieldErrors[fieldId] = (analytics.fieldErrors[fieldId] || 0) + 1
      })
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  }

  private validateField(field: FormField, value: any, formData: Record<string, any>): string[] {
    const errors: string[] = []
    if (!field.validation) return errors
    for (const rule of field.validation) {
      switch (rule) {
        case ValidationRule.REQUIRED:
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(field.errorMessage || `${field.label} est requis`)
          }
          break
        case ValidationRule.EMAIL:
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(field.errorMessage || 'Format d\'email invalide')
          }
          break
        case ValidationRule.MIN_LENGTH:
          const minLength = field.validationConfig?.min_length || 0
          if (value && typeof value === 'string' && value.length < minLength) {
            errors.push(field.errorMessage || `${field.label} doit contenir au moins ${minLength} caractères`)
          }
          break
        case ValidationRule.MAX_LENGTH:
          const maxLength = field.validationConfig?.max_length || 0
          if (value && typeof value === 'string' && value.length > maxLength) {
            errors.push(field.errorMessage || `${field.label} ne peut pas dépasser ${maxLength} caractères`)
          }
          break
        case ValidationRule.PATTERN:
          const pattern = field.validationConfig?.pattern
          if (pattern && value && !new RegExp(pattern).test(value)) {
            errors.push(field.errorMessage || `${field.label} ne respecte pas le format requis`)
          }
          break
        case ValidationRule.MIN_VALUE:
          const minValue = field.validationConfig?.min_value
          if (minValue !== undefined && value && Number(value) < minValue) {
            errors.push(field.errorMessage || `${field.label} doit être au moins ${minValue}`)
          }
          break
        case ValidationRule.MAX_VALUE:
          const maxValue = field.validationConfig?.max_value
          if (maxValue !== undefined && value && Number(value) > maxValue) {
            errors.push(field.errorMessage || `${field.label} ne peut pas dépasser ${maxValue}`)
          }
          break
        case ValidationRule.CUSTOM:
          const customValidator = field.validationConfig?.custom
          if (customValidator && typeof customValidator === 'function') {
            try {
              if (!customValidator(value, formData)) {
                errors.push(field.errorMessage || `${field.label} n'est pas valide`)
              }
            } catch (error) {
              errors.push('Erreur de validation personnalisée')
            }
          }
          break
      }
    }

    return errors
  }

  private calculateProgress(form: FormConfig, data: Record<string, any>): number {
    const requiredFields = form.fields.filter(f => f.required)
    if (requiredFields.length === 0) return 100
    const completedFields = requiredFields.filter(field => {
      const value = data[field.id]
      return value && (typeof value !== 'string' || value.trim() !== '')
    })
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  // Soumission de formulaire
  submitForm(sessionId: string): { success: boolean; errors?: Record<string, string[]>; data?: FormData } {
    const formData = this.formData.get(sessionId)
    if (!formData) {
      return { success: false, errors: {} }
    }

    const form = this.forms.get(formData.formId)
    if (!form) {
      return { success: false, errors: {} }
    }

    // Valider le formulaire
    const validation = this.validateForm(sessionId)
    if (!validation.isValid) {
      formData.retryCount++
      // Mettre à jour les analytics
      const analytics = this.analytics.get(formData.formId)
      if (analytics) {
        analytics.userJourney.push({
          action: 'form_submission_failed',
          timestamp: new Date(),
          data: { errors: validation.errors, retryCount: formData.retryCount }
        })
      }

      logger.warn(`Form submission failed: ${formData.formId}`, {
        action: 'form_submission_failed',
        metadata: { formId: formData.formId, sessionId, errors: validation.errors }
      })
      return { success: false, errors: validation.errors }
    }

    // Marquer comme soumis
    formData.submitted = true
    formData.completed = true
    formData.progress = 100
    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId)
    if (analytics) {
      analytics.totalCompletions++
      analytics.averageTimeSpent = this.calculateAverageTimeSpent(formData.formId)
      analytics.completionRate = (analytics.totalCompletions / analytics.totalStarts) * 100
      analytics.userJourney.push({
        action: 'form_submitted',
        timestamp: new Date(),
        data: { timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000 }
      })
    }

    logger.info(`Form submitted: ${formData.formId}`, {
      action: 'form_submitted',
      metadata: { formId: formData.formId, sessionId, timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000 }
    })
    metrics.recordUserAction('form_submitted', formData.userId, { 
      formId: formData.formId,
      timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000
    })
    return { success: true, data: formData }
  }

  // Sauvegarde de brouillon
  saveDraft(sessionId: string): boolean {
    const formData = this.formData.get(sessionId)
    if (!formData) return false
    formData.draft = true
    formData.lastActivity = new Date()
    logger.info(`Form draft saved: ${formData.formId}`, {
      action: 'form_draft_saved',
      metadata: { formId: formData.formId, sessionId }
    })
    return true
  }

  // Abandon de formulaire
  abandonForm(sessionId: string, reason?: string): boolean {
    const formData = this.formData.get(sessionId)
    if (!formData || formData.submitted) return false
    // Mettre à jour les analytics
    const analytics = this.analytics.get(formData.formId)
    if (analytics) {
      analytics.totalAbandonments++
      analytics.abandonmentRate = (analytics.totalAbandonments / analytics.totalStarts) * 100
      analytics.userJourney.push({
        action: 'form_abandoned',
        timestamp: new Date(),
        data: { 
          reason,
          progress: formData.progress,
          timeSpent: (new Date().getTime() - formData.startTime.getTime()) / 1000
        }
      })
      // Identifier le point d'abandon
      const lastField = this.getLastActiveField(formData)
      if (lastField) {
        const existingPoint = analytics.topAbandonmentPoints.find(p => p.field === lastField)
        if (existingPoint) {
          existingPoint.count++
        } else {
          analytics.topAbandonmentPoints.push({ field: lastField, count: 1 })
        }
        analytics.topAbandonmentPoints.sort((a, b) => b.count - a.count)
      }
    }

    logger.info(`Form abandoned: ${formData.formId}`, {
      action: 'form_abandoned',
      metadata: { 
        formId: formData.formId, 
        sessionId, 
        reason, 
        progress: formData.progress 
      }
    })
    metrics.recordUserAction('form_abandoned', formData.userId, { 
      formId: formData.formId,
      progress: formData.progress,
      reason
    })
    return true
  }

  private getLastActiveField(formData: FormData): string | null {
    const form = this.forms.get(formData.formId)
    if (!form) return null
    // Trouver le dernier champ rempli
    const filledFields = form.fields
      .filter(f => formData.data[f.id])
      .sort((a, b) => b.order - a.order)
    return filledFields.length > 0 ? filledFields[0].id : null
  }

  private calculateAverageTimeSpent(formId: string): number {
    const analytics = this.analytics.get(formId)
    if (!analytics || analytics.totalCompletions === 0) return 0
    // Calculer le temps moyen basé sur les soumissions récentes
    const recentSubmissions = analytics.userJourney
      .filter(j => j.action === 'form_submitted')
      .slice(-10); // 10 dernières soumissions

    if (recentSubmissions.length === 0) return 0
    const totalTime = recentSubmissions.reduce((sum, journey) => {
      return sum + (journey.data?.timeSpent || 0)
    }, 0)
    return totalTime / recentSubmissions.length
  }

  // Analytics et optimisations
  getFormAnalytics(formId: string): FormAnalytics | null {
    return this.analytics.get(formId) || null
  }

  generateOptimizations(formId: string): FormOptimization {
    const analytics = this.analytics.get(formId)
    const form = this.forms.get(formId)
    if (!analytics || !form) {
      return { formId, suggestions: [], aBTestVariants: [] }
    }

    const suggestions: FormOptimization['suggestions'] = []
    // Analyser les points d'abandon
    if (analytics.topAbandonmentPoints.length > 0) {
      const topAbandonment = analytics.topAbandonmentPoints[0]
      suggestions.push({
        type: 'field_order',
        priority: 'high',
        description: `Le champ "${topAbandonment.field}" cause ${topAbandonment.count} abandons. Considérer le déplacer ou le simplifier.`,
        impact: Math.min(90, topAbandonment.count * 10),
        implementation: 'Réorganiser les champs ou simplifier la validation'
      })
    }

    // Analyser le taux de complétion
    if (analytics.completionRate < 50) {
      suggestions.push({
        type: 'ui_improvement',
        priority: 'high',
        description: `Taux de complétion faible (${analytics.completionRate.toFixed(1)}%). Améliorer l\'UX.`,
        impact: 80,
        implementation: 'Ajouter des indicateurs de progression, simplifier les champs'
      })
    }

    // Analyser le temps moyen
    if (analytics.averageTimeSpent > 300) { // Plus de 5 minutes
      suggestions.push({
        type: 'field_removal',
        priority: 'medium',
        description: `Temps moyen élevé (${Math.round(analytics.averageTimeSpent)}s). Considérer supprimer des champs non essentiels.`,
        impact: 60,
        implementation: 'Identifier et supprimer les champs optionnels'
      })
    }

    // Analyser les erreurs de validation
    const topErrorField = Object.entries(analytics.fieldErrors)
      .sort(([,a], [,b]) => b - a)[0]
    if (topErrorField) {
      suggestions.push({
        type: 'validation',
        priority: 'medium',
        description: `Le champ "${topErrorField[0]}" génère ${topErrorField[1]} erreurs. Améliorer la validation.`,
        impact: 50,
        implementation: 'Clarifier les messages d\'erreur et ajouter des exemples'
      })
    }

    // Générer des variantes A/B
    const aBTestVariants = [
      {
        id: 'variant-1',
        name: 'Formulaire simplifié',
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
        id: 'variant-2',
        name: 'Formulaire en étapes',
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
    ]
    const optimization: FormOptimization = {
      formId,
      suggestions,
      aBTestVariants
    }
    this.optimizations.set(formId, optimization)
    logger.info(`Form optimizations generated: ${formId}`, {
      action: 'form_optimizations_generated',
      metadata: { 
        formId, 
        suggestionsCount: suggestions.length,
        completionRate: analytics.completionRate 
      }
    })
    return optimization
  }

  // Utilitaires
  getFormData(sessionId: string): FormData | null {
    return this.formData.get(sessionId) || null
  }

  getAllFormData(): FormData[] {
    return Array.from(this.formData.values())
  }

  cleanupOldData(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 heures par défaut
    const cutoffTime = new Date().getTime() - maxAge
    for (const [sessionId, formData] of this.formData.entries()) {
      if (formData.lastActivity.getTime() < cutoffTime && !formData.submitted) {
        this.formData.delete(sessionId)
      }
    }

    logger.info('Old form data cleaned up', {
      action: 'form_data_cleaned',
      metadata: { maxAge, cutoffTime: new Date(cutoffTime) }
    })
  }
}

// Instance globale
export const formOptimizer = new FormOptimizer()
// Fonctions utilitaires
export const addForm = (config: FormConfig) => {
  return formOptimizer.addForm(config)
}
export const getForm = (formId: string) => {
  return formOptimizer.getForm(formId)
}
export const getAllForms = () => {
  return formOptimizer.getAllForms()
}
export const startForm = (formId: string, userId?: string) => {
  return formOptimizer.startForm(formId, userId)
}
export const updateFormData = (sessionId: string, fieldId: string, value: any) => {
  return formOptimizer.updateFormData(sessionId, fieldId, value)
}
export const validateForm = (sessionId: string) => {
  return formOptimizer.validateForm(sessionId)
}
export const submitForm = (sessionId: string) => {
  return formOptimizer.submitForm(sessionId)
}
export const saveDraft = (sessionId: string) => {
  return formOptimizer.saveDraft(sessionId)
}
export const abandonForm = (sessionId: string, reason?: string) => {
  return formOptimizer.abandonForm(sessionId, reason)
}
export const getFormAnalytics = (formId: string) => {
  return formOptimizer.getFormAnalytics(formId)
}
export const generateOptimizations = (formId: string) => {
  return formOptimizer.generateOptimizations(formId)
}