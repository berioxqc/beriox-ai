import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateRequest, validateQueryParams } from '@/lib/validation-schemas';
import { errorHandlerMiddleware, AuthenticationError, AuthorizationError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schémas de validation
const CompanySearchSchema = z.object({
  query: z.string().min(1, 'Recherche requise').max(100, 'Recherche trop longue'),
  location: z.string().optional(),
  radius: z.number().min(100).max(50000).default(5000), // en mètres
  type: z.string().optional(), // type d'entreprise
  hasWebsite: z.boolean().optional(), // filtrer par présence de site web
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

const CompanyFilterSchema = z.object({
  industries: z.array(z.string()).optional(),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  revenue: z.enum(['<1M', '1M-10M', '10M-100M', '100M+']).optional(),
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
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is required');
    }
  }

  /**
   * Rechercher des entreprises avec Google Places API
   */
  async searchCompanies(params: z.infer<typeof CompanySearchSchema>): Promise<Company[]> {
    const { query, location, radius, type, hasWebsite, limit, offset } = params;

    try {
      // Recherche de base avec Google Places
      const searchUrl = `${this.baseUrl}/textsearch/json`;
      const searchParams = new URLSearchParams({
        query: `${query} ${type || ''}`.trim(),
        location: location || '',
        radius: radius.toString(),
        type: 'establishment',
        key: this.apiKey
      });

      const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json();

      if (searchData.status !== 'OK') {
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
       console.error('Google Places search failed:', error);
       throw error;
     }
  }

  /**
   * Obtenir les détails d'une entreprise
   */
  private async getCompanyDetails(placeId: string): Promise<Company> {
    const detailsUrl = `${this.baseUrl}/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,formatted_address,formatted_phone_number,website,email,rating,user_ratings_total,types,geometry,place_id',
      key: this.apiKey
    });

    const response = await fetch(`${detailsUrl}?${params}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Failed to get company details: ${data.status}`);
    }

    const result = data.result;
    const website = result.website || '';
    const email = result.email || '';
    const phone = result.formatted_phone_number || '';

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
    throw new AuthenticationError('Non authentifié');
  }

  // Vérifier les permissions admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    throw new AuthorizationError('Accès administrateur requis');
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'search':
      const searchParams = validateQueryParams(request.nextUrl.searchParams, CompanySearchSchema);
      const companies = await placesService.searchCompanies(searchParams);
      
             console.log('Company search performed:', {
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

    case 'filter':
      const filterParams = validateQueryParams(request.nextUrl.searchParams, CompanyFilterSchema);
      const companiesToFilter = JSON.parse(searchParams.get('companies') || '[]');
      const filteredCompanies = await placesService.filterCompanies(companiesToFilter, filterParams);

      return NextResponse.json({
        success: true,
        companies: filteredCompanies,
        total: filteredCompanies.length,
        filters: filterParams
      });

    default:
      return NextResponse.json({
        error: 'Action invalide. Utilisez: search ou filter'
      }, { status: 400 });
  }
});

// POST - Sauvegarder des entreprises ciblées
export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new AuthenticationError('Non authentifié');
  }

  // Vérifier les permissions admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    throw new AuthorizationError('Accès administrateur requis');
  }

  const body = await request.json();
  const { companies, campaignName, notes } = body;

  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    throw new Error('Liste d\'entreprises requise');
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
      campaignName: campaignName || 'Default Campaign',
      notes: notes || '',
      addedBy: session.user.email,
      status: 'pending'
    }))
  });

         console.log('Targeted companies saved:', {
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
