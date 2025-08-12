import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { validateRequest, validateQueryParams } from 'apos;@/lib/validation-schemas'apos;;
import { errorHandlerMiddleware, AuthenticationError, AuthorizationError } from 'apos;@/lib/error-handler'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { z } from 'apos;zod'apos;;

// Schémas de validation
const CompanySearchSchema = z.object({
  query: z.string().min(1, 'apos;Recherche requise'apos;).max(100, 'apos;Recherche trop longue'apos;),
  location: z.string().optional(),
  radius: z.number().min(100).max(50000).default(5000), // en mètres
  type: z.string().optional(), // type d'apos;entreprise
  hasWebsite: z.boolean().optional(), // filtrer par présence de site web
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

const CompanyFilterSchema = z.object({
  industries: z.array(z.string()).optional(),
  employeeCount: z.enum(['apos;1-10'apos;, 'apos;11-50'apos;, 'apos;51-200'apos;, 'apos;201-1000'apos;, 'apos;1000+'apos;]).optional(),
  revenue: z.enum(['apos;<1M'apos;, 'apos;1M-10M'apos;, 'apos;10M-100M'apos;, 'apos;100M+'apos;]).optional(),
  location: z.string().optional(),
  hasWebsite: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional()
});

export interface Company {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  placeId: string;
  hasWebsite: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  lastUpdated: Date;
}

class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'apos;https://maps.googleapis.com/maps/api/place'apos;;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || 'apos;'apos;;
  }

  /**
   * Vérifier si l'apos;API est configurée
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Rechercher des entreprises avec Google Places API
   */
  async searchCompanies(params: z.infer<typeof CompanySearchSchema>): Promise<Company[]> {
    const { query, location, radius, type, hasWebsite, limit, offset } = params;

    // Vérifier si l'apos;API est configurée
    if (!this.isConfigured()) {
      console.warn('apos;Google Places API not configured, returning empty results'apos;);
      return [];
    }

    try {
      // Recherche de base avec Google Places
      const searchUrl = `${this.baseUrl}/textsearch/json`;
      const searchParams = new URLSearchParams({
        query: `${query} ${type || 'apos;'apos;}`.trim(),
        location: location || 'apos;'apos;,
        radius: radius.toString(),
        type: 'apos;establishment'apos;,
        key: this.apiKey
      });

      const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json();

      if (searchData.status !== 'apos;OK'apos;) {
        throw new Error(`Google Places API error: ${searchData.status}`);
      }

      // Récupérer les détails pour chaque entreprise
      const companies: Company[] = [];
      const results = searchData.results.slice(offset, offset + limit);

      for (const result of results) {
        try {
          const details = await this.getCompanyDetails(result.place_id);
          
          // Appliquer le filtre de site web si demandé
          if (hasWebsite !== undefined) {
            if (hasWebsite && !details.website) continue;
            if (!hasWebsite && details.website) continue;
          }

          companies.push(details);
        } catch (error) {
          console.warn(`Failed to get details for place ${result.place_id}:`, error);
        }
      }

      return companies;

    } catch (error) {
      console.error('apos;Google Places search failed:'apos;, error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'apos;une entreprise
   */
  private async getCompanyDetails(placeId: string): Promise<Company> {
    const detailsUrl = `${this.baseUrl}/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'apos;name,formatted_address,formatted_phone_number,website,email,rating,user_ratings_total,types,geometry,place_id'apos;,
      key: this.apiKey
    });

    const response = await fetch(`${detailsUrl}?${params}`);
    const data = await response.json();

    if (data.status !== 'apos;OK'apos;) {
      throw new Error(`Failed to get company details: ${data.status}`);
    }

    const result = data.result;
    const website = result.website || 'apos;'apos;;
    const email = result.email || 'apos;'apos;;
    const phone = result.formatted_phone_number || 'apos;'apos;;

    return {
      id: placeId,
      name: result.name,
      address: result.formatted_address,
      phone,
      website,
      email,
      rating: result.rating,
      reviewCount: result.user_ratings_total,
      types: result.types || [],
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      placeId,
      hasWebsite: !!website,
      hasEmail: !!email,
      hasPhone: !!phone,
      lastUpdated: new Date()
    };
  }

  /**
   * Filtrer les entreprises selon des critères spécifiques
   */
  async filterCompanies(companies: Company[], filters: z.infer<typeof CompanyFilterSchema>): Promise<Company[]> {
    let filtered = [...companies];

    // Filtre par site web
    if (filters.hasWebsite !== undefined) {
      filtered = filtered.filter(company => company.hasWebsite === filters.hasWebsite);
    }

    // Filtre par email
    if (filters.hasEmail !== undefined) {
      filtered = filtered.filter(company => company.hasEmail === filters.hasEmail);
    }

    // Filtre par téléphone
    if (filters.hasPhone !== undefined) {
      filtered = filtered.filter(company => company.hasPhone === filters.hasPhone);
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(company => 
        company.address.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filtre par industrie (basé sur les types Google Places)
    if (filters.industries && filters.industries.length > 0) {
      filtered = filtered.filter(company => 
        filters.industries!.some(industry => 
          company.types.some(type => type.toLowerCase().includes(industry.toLowerCase()))
        )
      );
    }

    return filtered;
  }
}

// Instance du service
const placesService = new GooglePlacesService();

// GET - Rechercher des entreprises
export const GET = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new AuthenticationError('apos;Non authentifié'apos;);
  }

  // Vérifier les permissions admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || !['apos;admin'apos;, 'apos;super_admin'apos;].includes(user.role)) {
    throw new AuthorizationError('apos;Accès administrateur requis'apos;);
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;search'apos;:
      const searchParams = validateQueryParams(request.nextUrl.searchParams, CompanySearchSchema);
      const companies = await placesService.searchCompanies(searchParams);
      
             console.log('apos;Company search performed:'apos;, {
         userId: session.user.email, 
         query: searchParams.query,
         resultsCount: companies.length 
       });

      return NextResponse.json({
        success: true,
        companies,
        total: companies.length,
        query: searchParams.query
      });

    case 'apos;filter'apos;:
      const filterParams = validateQueryParams(request.nextUrl.searchParams, CompanyFilterSchema);
      const companiesToFilter = JSON.parse(searchParams.get('apos;companies'apos;) || 'apos;[]'apos;);
      const filteredCompanies = await placesService.filterCompanies(companiesToFilter, filterParams);

      return NextResponse.json({
        success: true,
        companies: filteredCompanies,
        total: filteredCompanies.length,
        filters: filterParams
      });

    default:
      return NextResponse.json({
        error: 'apos;Action invalide. Utilisez: search ou filter'apos;
      }, { status: 400 });
  }
});

// POST - Sauvegarder des entreprises ciblées
export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new AuthenticationError('apos;Non authentifié'apos;);
  }

  // Vérifier les permissions admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || !['apos;admin'apos;, 'apos;super_admin'apos;].includes(user.role)) {
    throw new AuthorizationError('apos;Accès administrateur requis'apos;);
  }

  const body = await request.json();
  const { companies, campaignName, notes } = body;

  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    throw new Error('apos;Liste d\'apos;entreprises requise'apos;);
  }

  // Sauvegarder les entreprises ciblées
  const savedCompanies = await prisma.targetedCompany.createMany({
    data: companies.map((company: Company) => ({
      name: company.name,
      address: company.address,
      phone: company.phone,
      website: company.website,
      email: company.email,
      placeId: company.placeId,
      location: company.location,
      hasWebsite: company.hasWebsite,
      hasEmail: company.hasEmail,
      hasPhone: company.hasPhone,
      campaignName: campaignName || 'apos;Default Campaign'apos;,
      notes: notes || 'apos;'apos;,
      addedBy: session.user.email,
      status: 'apos;pending'apos;
    }))
  });

         console.log('apos;Targeted companies saved:'apos;, {
         userId: session.user.email, 
         count: savedCompanies.count,
         campaignName 
       });

  return NextResponse.json({
    success: true,
    message: `${savedCompanies.count} entreprises sauvegardées`,
    count: savedCompanies.count
  });
});
