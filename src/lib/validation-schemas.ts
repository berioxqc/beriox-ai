import { z } from 'apos;zod'apos;;

// ============================================================================
// SCHÉMAS DE BASE
// ============================================================================

export const BaseUserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
});

export const BasePaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['apos;asc'apos;, 'apos;desc'apos;]).default('apos;desc'apos;),
});

// ============================================================================
// SCHÉMAS D'apos;AUTHENTIFICATION
// ============================================================================

export const SignInSchema = z.object({
  email: z.string().email('apos;Email invalide'apos;),
  password: z.string().min(6, 'apos;Le mot de passe doit contenir au moins 6 caractères'apos;),
});

export const SignUpSchema = z.object({
  email: z.string().email('apos;Email invalide'apos;),
  name: z.string().min(2, 'apos;Le nom doit contenir au moins 2 caractères'apos;),
  password: z.string().min(8, 'apos;Le mot de passe doit contenir au moins 8 caractères'apos;),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('apos;Email invalide'apos;),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'apos;Token requis'apos;),
  password: z.string().min(8, 'apos;Le mot de passe doit contenir au moins 8 caractères'apos;),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// ============================================================================
// SCHÉMAS DE MISSIONS
// ============================================================================

export const CreateMissionSchema = z.object({
  prompt: z.string().min(1, 'apos;Prompt requis'apos;).max(2000, 'apos;Prompt trop long'apos;),
  objective: z.string().min(1, 'apos;Objectif requis'apos;).max(500, 'apos;Objectif trop long'apos;),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(['apos;low'apos;, 'apos;medium'apos;, 'apos;high'apos;]).default('apos;medium'apos;),
  context: z.string().max(1000, 'apos;Contexte trop long'apos;).optional(),
  details: z.string().max(2000, 'apos;Détails trop longs'apos;).optional(),
  selectedAgents: z.array(z.string()).optional(),
});

export const UpdateMissionSchema = z.object({
  id: z.string().cuid(),
  objective: z.string().min(1).max(500).optional(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(['apos;low'apos;, 'apos;medium'apos;, 'apos;high'apos;]).optional(),
  context: z.string().max(1000).optional(),
  details: z.string().max(2000).optional(),
  status: z.enum(['apos;pending'apos;, 'apos;in_progress'apos;, 'apos;completed'apos;, 'apos;failed'apos;, 'apos;cancelled'apos;]).optional(),
});

export const MissionFiltersSchema = z.object({
  status: z.enum(['apos;pending'apos;, 'apos;in_progress'apos;, 'apos;completed'apos;, 'apos;failed'apos;, 'apos;cancelled'apos;]).optional(),
  priority: z.enum(['apos;low'apos;, 'apos;medium'apos;, 'apos;high'apos;]).optional(),
  agent: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
});

// ============================================================================
// SCHÉMAS DE BRIEFS ET DELIVERABLES
// ============================================================================

export const CreateBriefSchema = z.object({
  missionId: z.string().cuid(),
  title: z.string().min(1, 'apos;Titre requis'apos;).max(200, 'apos;Titre trop long'apos;),
  content: z.string().min(1, 'apos;Contenu requis'apos;).max(5000, 'apos;Contenu trop long'apos;),
  requirements: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export const CreateDeliverableSchema = z.object({
  missionId: z.string().cuid(),
  briefId: z.string().cuid().optional(),
  title: z.string().min(1, 'apos;Titre requis'apos;).max(200, 'apos;Titre trop long'apos;),
  content: z.string().min(1, 'apos;Contenu requis'apos;).max(10000, 'apos;Contenu trop long'apos;),
  type: z.enum(['apos;report'apos;, 'apos;analysis'apos;, 'apos;strategy'apos;, 'apos;implementation'apos;, 'apos;other'apos;]),
  attachments: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// SCHÉMAS DE PAIEMENT ET ABONNEMENTS
// ============================================================================

export const CreateCheckoutSessionSchema = z.object({
  planId: z.enum(['apos;starter'apos;, 'apos;pro'apos;, 'apos;enterprise'apos;]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  couponCode: z.string().optional(),
});

export const RefundRequestSchema = z.object({
  missionId: z.string().cuid().optional(),
  amount: z.number().int().min(1).max(10, 'apos;Maximum 10 crédits par demande'apos;),
  reason: z.enum(['apos;QUALITY_ISSUE'apos;, 'apos;TECHNICAL_PROBLEM'apos;, 'apos;NOT_SATISFIED'apos;, 'apos;DUPLICATE_CHARGE'apos;, 'apos;OTHER'apos;]),
  description: z.string().min(10, 'apos;Description trop courte'apos;).max(1000, 'apos;Description trop longue'apos;),
});

export const CouponRedeemSchema = z.object({
  code: z.string().min(1, 'apos;Code requis'apos;).max(50, 'apos;Code trop long'apos;),
});

// ============================================================================
// SCHÉMAS D'apos;ADMINISTRATION
// ============================================================================

export const GrantPremiumAccessSchema = z.object({
  userEmail: z.string().email('apos;Email invalide'apos;),
  planId: z.enum(['apos;starter'apos;, 'apos;pro'apos;, 'apos;enterprise'apos;]),
  duration: z.number().int().min(1).max(365, 'apos;Durée maximale: 365 jours'apos;),
  notes: z.string().max(500).optional(),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['apos;user'apos;, 'apos;admin'apos;, 'apos;super_admin'apos;]),
});

// ============================================================================
// SCHÉMAS DE MESSAGERIE
// ============================================================================

export const SendEmailSchema = z.object({
  subject: z.string().min(1, 'apos;Sujet requis'apos;).max(200, 'apos;Sujet trop long'apos;),
  body: z.string().min(1, 'apos;Corps requis'apos;).max(10000, 'apos;Corps trop long'apos;),
  bodyHtml: z.string().max(20000).optional(),
  toEmail: z.string().email('apos;Email destinataire invalide'apos;),
  toName: z.string().max(100).optional(),
  ccEmails: z.array(z.string().email()).optional(),
  bccEmails: z.array(z.string().email()).optional(),
  templateId: z.string().cuid().optional(),
  variables: z.record(z.any()).optional(),
  priority: z.enum(['apos;LOW'apos;, 'apos;NORMAL'apos;, 'apos;HIGH'apos;, 'apos;URGENT'apos;]).default('apos;NORMAL'apos;),
  botId: z.string().cuid().optional(),
  ticketId: z.string().cuid().optional(),
});

export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(1, 'apos;Sujet requis'apos;).max(200, 'apos;Sujet trop long'apos;),
  description: z.string().min(10, 'apos;Description trop courte'apos;).max(2000, 'apos;Description trop longue'apos;),
  category: z.enum(['apos;GENERAL'apos;, 'apos;TECHNICAL'apos;, 'apos;BILLING'apos;, 'apos;FEATURE_REQUEST'apos;, 'apos;BUG_REPORT'apos;]),
  priority: z.enum(['apos;LOW'apos;, 'apos;NORMAL'apos;, 'apos;HIGH'apos;, 'apos;URGENT'apos;]).default('apos;NORMAL'apos;),
  attachments: z.array(z.string()).optional(),
});

// ============================================================================
// SCHÉMAS DE RECOMMANDATIONS IA
// ============================================================================

export const BotRecommendationFiltersSchema = z.object({
  type: z.enum(['apos;performance'apos;, 'apos;security'apos;, 'apos;ux'apos;, 'apos;business'apos;, 'apos;technical'apos;]).optional(),
  priority: z.enum(['apos;low'apos;, 'apos;medium'apos;, 'apos;high'apos;, 'apos;critical'apos;]).optional(),
  status: z.enum(['apos;pending'apos;, 'apos;approved'apos;, 'apos;rejected'apos;, 'apos;implemented'apos;]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const UpdateRecommendationSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['apos;pending'apos;, 'apos;approved'apos;, 'apos;rejected'apos;, 'apos;implemented'apos;]),
  implementationNotes: z.string().max(2000).optional(),
});

// ============================================================================
// SCHÉMAS DE MÉTRIQUES ET ANALYTICS
// ============================================================================

export const MetricsActionSchema = z.object({
  action: z.enum(['apos;page_view'apos;, 'apos;button_click'apos;, 'apos;form_submit'apos;, 'apos;error'apos;, 'apos;performance'apos;]),
  category: z.string().max(50).optional(),
  label: z.string().max(100).optional(),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export const AnalyticsConnectionSchema = z.object({
  platform: z.enum(['apos;google_analytics'apos;, 'apos;mixpanel'apos;, 'apos;amplitude'apos;, 'apos;hotjar'apos;]),
  config: z.record(z.any()),
  isActive: z.boolean().default(true),
});

// ============================================================================
// SCHÉMAS DE VALIDATION GLOBALE
// ============================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(ValidationErrorSchema).optional(),
  timestamp: z.string().datetime(),
});

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Valide les données d'apos;une requête avec un schéma Zod
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('apos;.'apos;),
        message: err.message,
        code: err.code,
      }));
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }
    throw new Error('apos;Invalid request data'apos;);
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
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('apos;.'apos;),
        message: err.message,
        code: err.code,
      }));
      throw new Error(`Query validation failed: ${JSON.stringify(validationErrors)}`);
    }
    throw new Error('apos;Invalid query parameters'apos;);
  }
}

/**
 * Crée une réponse d'apos;erreur de validation standardisée
 */
export function createValidationErrorResponse(errors: z.ZodError) {
  const validationErrors = errors.errors.map(err => ({
    field: err.path.join('apos;.'apos;),
    message: err.message,
    code: err.code,
  }));

  return {
    success: false,
    error: 'apos;Validation failed'apos;,
    errors: validationErrors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crée une réponse de succès standardisée
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// TYPES EXPORTÉS
// ============================================================================

export type SignInData = z.infer<typeof SignInSchema>;
export type SignUpData = z.infer<typeof SignUpSchema>;
export type CreateMissionData = z.infer<typeof CreateMissionSchema>;
export type UpdateMissionData = z.infer<typeof UpdateMissionSchema>;
export type CreateBriefData = z.infer<typeof CreateBriefSchema>;
export type CreateDeliverableData = z.infer<typeof CreateDeliverableSchema>;
export type SendEmailData = z.infer<typeof SendEmailSchema>;
export type CreateSupportTicketData = z.infer<typeof CreateSupportTicketSchema>;
export type RefundRequestData = z.infer<typeof RefundRequestSchema>;
export type GrantPremiumAccessData = z.infer<typeof GrantPremiumAccessSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
