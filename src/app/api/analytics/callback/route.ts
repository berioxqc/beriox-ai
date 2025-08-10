import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { googleAnalyticsService } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Callback OAuth2 de Google Analytics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId/email
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL('/analytics?error=access_denied', req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/analytics?error=invalid_request', req.url));
    }

    // Échanger le code contre des tokens
    const tokens = await googleAnalyticsService.exchangeCodeForTokens(code);
    if (!tokens) {
      return NextResponse.redirect(new URL('/analytics?error=token_exchange_failed', req.url));
    }

    // Récupérer les propriétés disponibles
    const properties = await googleAnalyticsService.getProperties(tokens.accessToken);
    if (!properties || properties.length === 0) {
      return NextResponse.redirect(new URL('/analytics?error=no_properties', req.url));
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: state }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/analytics?error=user_not_found', req.url));
    }

    // Sauvegarder les connexions Analytics (pour chaque propriété)
    for (const property of properties) {
      await prisma.analyticsConnection.upsert({
        where: {
          userId_propertyId: {
            userId: user.id,
            propertyId: property.id
          }
        },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          propertyName: property.name,
          websiteUrl: property.websiteUrl,
          lastSync: new Date()
        },
        create: {
          userId: user.id,
          propertyId: property.id,
          propertyName: property.name,
          websiteUrl: property.websiteUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    }

    // Redirection vers la page Analytics avec succès
    return NextResponse.redirect(new URL('/analytics?success=connected', req.url));

  } catch (error) {
    console.error("❌ Analytics callback error:", error);
    return NextResponse.redirect(new URL('/analytics?error=server_error', req.url));
  }
}
