import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { errorHandlerMiddleware, AuthenticationError } from 'apos;@/lib/error-handler'apos;;
import { validateRequest } from 'apos;@/lib/validation-schemas'apos;;
import { z } from 'apos;zod'apos;;

const CheckRoleSchema = z.object({
  requiredRoles: z.array(z.string()).min(1, 'apos;Au moins un rôle requis'apos;)
});

export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new AuthenticationError('apos;Non authentifié'apos;);
  }

  const body = await request.json();
  const { requiredRoles } = validateRequest(body, CheckRoleSchema);

  // Récupérer l'apos;utilisateur avec son rôle
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user) {
    throw new AuthenticationError('apos;Utilisateur non trouvé'apos;);
  }

  const hasRequiredRole = requiredRoles.includes(user.role);

  return NextResponse.json({
    success: true,
    hasAccess: hasRequiredRole,
    userRole: user.role,
    requiredRoles
  });
});
