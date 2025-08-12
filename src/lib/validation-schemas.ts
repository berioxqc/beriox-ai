import { z } from 'zod'
// ============================================================================
// SCHÉMAS DE BASE
// ============================================================================

export const BaseUserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
})
export const BasePaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
// ============================================================================
// SCHÉMAS D'AUTHENTIFICATION
// ============================================================================

export const SignInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})
export const SignUpSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})
// ============================================================================
// SCHÉMAS DE MISSIONS
// ============================================================================

export const CreateMissionSchema = z.object({
  prompt: z.string().min(1, 'Prompt requis').max(2000, 'Prompt trop long'),
  objective: z.string().min(1, 'Objectif requis').max(500, 'Objectif trop long'),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  context: z.string().max(1000, 'Contexte trop long').optional(),
  details: z.string().max(2000, 'Détails trop longs').optional(),
  selectedAgents: z.array(z.string()).optional(),
})
export const UpdateMissionSchema = z.object({
  id: z.string().cuid(),
  objective: z.string().min(1).max(500).optional(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  context: z.string().max(1000).optional(),
  details: z.string().max(2000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
})
export const MissionFiltersSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  agent: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
})
// ============================================================================
// SCHÉMAS DE BRIEFS ET DELIVERABLES
// ============================================================================

export const CreateBriefSchema = z.object({
  missionId: z.string().cuid(),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  content: z.string().min(1, 'Contenu requis').max(5000, 'Contenu trop long'),
  requirements: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
})
export const CreateDeliverableSchema = z.object({
  missionId: z.string().cuid(),
  briefId: z.string().cuid().optional(),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  content: z.string().min(1, 'Contenu requis').max(10000, 'Contenu trop long'),
  type: z.enum(['report', 'analysis', 'strategy', 'implementation', 'other']),
  attachments: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})
// ============================================================================
// SCHÉMAS DE PAIEMENT ET ABONNEMENTS
// ============================================================================

export const CreateCheckoutSessionSchema = z.object({
  planId: z.enum(['starter', 'pro', 'enterprise']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  couponCode: z.string().optional(),
})
export const RefundRequestSchema = z.object({
  missionId: z.string().cuid().optional(),
  amount: z.number().int().min(1).max(10, 'Maximum 10 crédits par demande'),
  reason: z.enum(['QUALITY_ISSUE', 'TECHNICAL_PROBLEM', 'NOT_SATISFIED', 'DUPLICATE_CHARGE', 'OTHER']),
  description: z.string().min(10, 'Description trop courte').max(1000, 'Description trop longue'),
})
export const CouponRedeemSchema = z.object({
  code: z.string().min(1, 'Code requis').max(50, 'Code trop long'),
})
// ============================================================================
// SCHÉMAS D'ADMINISTRATION
// ============================================================================

export const GrantPremiumAccessSchema = z.object({
  userEmail: z.string().email('Email invalide'),
  planId: z.enum(['starter', 'pro', 'enterprise']),
  duration: z.number().int().min(1).max(365, 'Durée maximale: 365 jours'),
  notes: z.string().max(500).optional(),
})
export const UpdateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['user', 'admin', 'super_admin']),
})
// ============================================================================
// SCHÉMAS DE MESSAGERIE
// ============================================================================

export const SendEmailSchema = z.object({
  subject: z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
  body: z.string().min(1, 'Corps requis').max(10000, 'Corps trop long'),
  bodyHtml: z.string().max(20000).optional(),
  toEmail: z.string().email('Email destinataire invalide'),
  toName: z.string().max(100).optional(),
  ccEmails: z.array(z.string().email()).optional(),
  bccEmails: z.array(z.string().email()).optional(),
  templateId: z.string().cuid().optional(),
  variables: z.record(z.any()).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  botId: z.string().cuid().optional(),
  ticketId: z.string().cuid().optional(),
})
export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
  description: z.string().min(10, 'Description trop courte').max(2000, 'Description trop longue'),
  category: z.enum(['GENERAL', 'TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  attachments: z.array(z.string()).optional(),
})
// ============================================================================
// SCHÉMAS DE RECOMMANDATIONS IA
// ============================================================================

export const BotRecommendationFiltersSchema = z.object({
  type: z.enum(['performance', 'security', 'ux', 'business', 'technical']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'implemented']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})
export const UpdateRecommendationSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'implemented']),
  implementationNotes: z.string().max(2000).optional(),
})
// ============================================================================
// SCHÉMAS DE MÉTRIQUES ET ANALYTICS
// ============================================================================

export const MetricsActionSchema = z.object({
  action: z.enum(['page_view', 'button_click', 'form_submit', 'error', 'performance']),
  category: z.string().max(50).optional(),
  label: z.string().max(100).optional(),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional(),
})
export const AnalyticsConnectionSchema = z.object({
  platform: z.enum(['google_analytics', 'mixpanel', 'amplitude', 'hotjar']),
  config: z.record(z.any()),
  isActive: z.boolean().default(true),
})
// ============================================================================
// SCHÉMAS DE VALIDATION GLOBALE
// ============================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
})
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(ValidationErrorSchema).optional(),
  timestamp: z.string().datetime(),
})
// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Valide les données d'une requête avec un schéma Zod
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`)
    }
    throw new Error('Invalid request data')
  }
}

/**
 * Valide les paramètres de requête avec un schéma Zod
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      throw new Error(`Query validation failed: ${JSON.stringify(validationErrors)}`)
    }
    throw new Error('Invalid query parameters')
  }
}

/**
 * Crée une réponse d'erreur de validation standardisée
 */
export function createValidationErrorResponse(errors: z.ZodError) {
  const validationErrors = errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))
  return {
    success: false,
    error: 'Validation failed',
    errors: validationErrors,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Crée une réponse de succès standardisée
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// TYPES EXPORTÉS
// ============================================================================

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>
export type CreateMissionData = z.infer<typeof CreateMissionSchema>
export type UpdateMissionData = z.infer<typeof UpdateMissionSchema>
export type CreateBriefData = z.infer<typeof CreateBriefSchema>
export type CreateDeliverableData = z.infer<typeof CreateDeliverableSchema>
export type SendEmailData = z.infer<typeof SendEmailSchema>
export type CreateSupportTicketData = z.infer<typeof CreateSupportTicketSchema>
export type RefundRequestData = z.infer<typeof RefundRequestSchema>
export type GrantPremiumAccessData = z.infer<typeof GrantPremiumAccessSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>