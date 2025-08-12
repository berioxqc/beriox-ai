import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { errorHandlerMiddleware, AuthenticationError } from '@/lib/error-handler'
import { validateRequest } from '@/lib/validation-schemas'
import { z } from 'zod'
const CheckRoleSchema = z.object({
  requiredRoles: z.array(z.string()).min(1, 'Au moins un rôle requis')
})
export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new AuthenticationError('Non authentifié')
  }

  const body = await request.json()
  const { requiredRoles } = validateRequest(body, CheckRoleSchema)
  // Récupérer l'utilisateur avec son rôle
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })
  if (!user) {
    throw new AuthenticationError('Utilisateur non trouvé')
  }

  const hasRequiredRole = requiredRoles.includes(user.role)
  return NextResponse.json({
    success: true,
    hasAccess: hasRequiredRole,
    userRole: user.role,
    requiredRoles
  })
})