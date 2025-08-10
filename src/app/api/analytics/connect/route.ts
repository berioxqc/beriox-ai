import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { googleAnalyticsService } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Initie la connexion Google Analytics
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Générer l'URL d'autorisation
    const authUrl = googleAnalyticsService.getAuthUrl(session.user.email);
    
    return NextResponse.json({ 
      authUrl,
      message: "Redirection vers Google Analytics pour autorisation"
    });

  } catch (error) {
    console.error("❌ Analytics connect error:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la connexion" 
    }, { status: 500 });
  }
}
