import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { CompetitorMonitoringService, CompetitorMonitoringConfig } from "@/lib/competitor-monitoring";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Configuration du monitoring concurrentiel
const getCompetitorConfig = (): CompetitorMonitoringConfig => {
  return {
    similarWebApiKey: process.env.SIMILARWEB_API_KEY,
    semrushApiKey: process.env.SEMRUSH_API_KEY,
    domains: process.env.COMPETITOR_DOMAINS?.split('apos;,'apos;) || [],
    frequency: 'apos;weekly'apos;,
    enabled: true,
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        premiumAccess: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier l'apos;accès premium pour le monitoring concurrentiel
    const basePlan = user.planId || 'apos;free'apos;;
    const hasPremiumAccess = user.premiumAccess && 
      user.premiumAccess.isActive && 
      user.premiumAccess.endDate > new Date();

    if (basePlan === 'apos;free'apos; && !hasPremiumAccess) {
      return NextResponse.json({ 
        error: "Le monitoring concurrentiel est réservé aux plans premium",
        upgradeRequired: true,
        upgradeUrl: "/pricing"
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('apos;domain'apos;);
    const action = searchParams.get('apos;action'apos;);

    const config = getCompetitorConfig();
    const competitorService = new CompetitorMonitoringService(config);

    switch (action) {
      case 'apos;analyze'apos;:
        if (!domain) {
          return NextResponse.json({ error: "Le paramètre 'apos;domain'apos; est requis" }, { status: 400 });
        }

        logger.info(`🔍 Analyse concurrentielle demandée pour ${domain}`);
        const report = await competitorService.analyzeDomain(domain);
        
        return NextResponse.json({
          success: true,
          report,
        });

      case 'apos;latest'apos;:
        if (!domain) {
          return NextResponse.json({ error: "Le paramètre 'apos;domain'apos; est requis" }, { status: 400 });
        }

        const latestReport = await competitorService.getLatestReport(domain);
        
        return NextResponse.json({
          success: true,
          report: latestReport,
        });

      case 'apos;history'apos;:
        if (!domain) {
          return NextResponse.json({ error: "Le paramètre 'apos;domain'apos; est requis" }, { status: 400 });
        }

        const limit = parseInt(searchParams.get('apos;limit'apos;) || 'apos;30'apos;);
        const history = await competitorService.getReportHistory(domain, limit);
        
        return NextResponse.json({
          success: true,
          history,
        });

      case 'apos;config'apos;:
        return NextResponse.json({
          success: true,
          config: {
            enabled: config.enabled,
            domains: config.domains,
            frequency: config.frequency,
            hasSimilarWeb: !!config.similarWebApiKey,
            hasSemrush: !!config.semrushApiKey,
          },
        });

      default:
        return NextResponse.json({
          success: true,
          message: "API de monitoring concurrentiel disponible",
          endpoints: {
            analyze: "/api/competitors?action=analyze&domain=example.com",
            latest: "/api/competitors?action=latest&domain=example.com",
            history: "/api/competitors?action=history&domain=example.com&limit=30",
            config: "/api/competitors?action=config",
          },
        });
    }

  } catch (error) {
    logger.error(`❌ Erreur API concurrents: ${error}`);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        premiumAccess: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier l'apos;accès premium
    const basePlan = user.planId || 'apos;free'apos;;
    const hasPremiumAccess = user.premiumAccess && 
      user.premiumAccess.isActive && 
      user.premiumAccess.endDate > new Date();

    if (basePlan === 'apos;free'apos; && !hasPremiumAccess) {
      return NextResponse.json({ 
        error: "Le monitoring concurrentiel est réservé aux plans premium",
        upgradeRequired: true,
        upgradeUrl: "/pricing"
      }, { status: 403 });
    }

    const body = await request.json();
    const { domains, action } = body;

    const config = getCompetitorConfig();
    const competitorService = new CompetitorMonitoringService(config);

    switch (action) {
      case 'apos;analyze_multiple'apos;:
        if (!domains || !Array.isArray(domains)) {
          return NextResponse.json({ error: "Le paramètre 'apos;domains'apos; (array) est requis" }, { status: 400 });
        }

        logger.info(`🔍 Analyse concurrentielle multiple demandée pour ${domains.length} domaines`);
        const reports = await competitorService.analyzeAllDomains();
        
        return NextResponse.json({
          success: true,
          reports,
          analyzed: reports.length,
          total: domains.length,
        });

      case 'apos;setup_monitoring'apos;:
        // TODO: Sauvegarder la configuration de monitoring pour l'apos;utilisateur
        return NextResponse.json({
          success: true,
          message: "Configuration de monitoring sauvegardée",
        });

      default:
        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
    }

  } catch (error) {
    logger.error(`❌ Erreur API concurrents POST: ${error}`);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
