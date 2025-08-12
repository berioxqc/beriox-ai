"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { useTheme, useStyles } from '@/hooks/useTheme'
interface Company {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  email?: string
  rating?: number
  reviewCount?: number
  types: string[]
  location: {
    lat: number
    lng: number
  }
  placeId: string
  hasWebsite: boolean
  hasEmail: boolean
  hasPhone: boolean
  lastUpdated: Date
}

interface SearchFilters {
  query: string
  location: string
  radius: number
  type: string
  hasWebsite?: boolean
  limit: number
}

interface FilterOptions {
  industries: string[]
  employeeCount?: string
  revenue?: string
  location: string
  hasWebsite?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
}

export default function CompanyTargetingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const styles = useStyles()
  // États
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [campaignName, setCampaignName] = useState('')
  const [notes, setNotes] = useState('')
  // Filtres de recherche
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    radius: 5000,
    type: '',
    hasWebsite: undefined,
    limit: 20
  })
  // Filtres avancés
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    industries: [],
    location: '',
    hasWebsite: undefined,
    hasEmail: undefined,
    hasPhone: undefined
  })
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    withWebsite: 0,
    withoutWebsite: 0,
    withEmail: 0,
    withPhone: 0
  })
  // Vérification des permissions
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.email) {
      router.push('/auth/signin')
      return
    }

    // Vérifier si l'utilisateur est admin
    fetch('/api/auth/check-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requiredRoles: ['admin', 'super_admin'] })
    }).then(res => {
      if (!res.ok) {
        router.push('/dashboard')
      }
    })
  }, [session, status, router])
  // Calculer les statistiques
  useEffect(() => {
    const total = companies.length
    const withWebsite = companies.filter(c => c.hasWebsite).length
    const withoutWebsite = total - withWebsite
    const withEmail = companies.filter(c => c.hasEmail).length
    const withPhone = companies.filter(c => c.hasPhone).length
    setStats({ total, withWebsite, withoutWebsite, withEmail, withPhone })
  }, [companies])
  // Rechercher des entreprises
  const searchCompanies = async () => {
    if (!searchFilters.query.trim()) return
    setSearching(true)
    try {
      const params = new URLSearchParams({
        action: 'search',
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, value]) => value !== undefined && value !== '')
        )
      })
      const response = await fetch(`/api/admin/company-targeting?${params}`)
      const data = await response.json()
      if (data.success) {
        setCompanies(data.companies)
        setFilteredCompanies(data.companies)
        setSelectedCompanies(new Set())
      } else {
        console.error('Erreur de recherche:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setSearching(false)
    }
  }
  // Filtrer les entreprises
  const filterCompanies = async () => {
    if (companies.length === 0) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'filter',
        companies: JSON.stringify(companies),
        ...Object.fromEntries(
          Object.entries(filterOptions).filter(([_, value]) => 
            value !== undefined && value !== '' && 
            (Array.isArray(value) ? value.length > 0 : true)
          )
        )
      })
      const response = await fetch(`/api/admin/company-targeting?${params}`)
      const data = await response.json()
      if (data.success) {
        setFilteredCompanies(data.companies)
        setSelectedCompanies(new Set())
      }
    } catch (error) {
      console.error('Erreur lors du filtrage:', error)
    } finally {
      setLoading(false)
    }
  }
  // Sauvegarder les entreprises sélectionnées
  const saveSelectedCompanies = async () => {
    if (selectedCompanies.size === 0) return
    setLoading(true)
    try {
      const selectedCompaniesList = companies.filter(c => selectedCompanies.has(c.id))
      const response = await fetch('/api/admin/company-targeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: selectedCompaniesList,
          campaignName: campaignName || 'Campagne par défaut',
          notes
        })
      })
      const data = await response.json()
      if (data.success) {
        alert(`${data.count} entreprises sauvegardées avec succès !`)
        setSelectedCompanies(new Set())
        setCampaignName('')
        setNotes('')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }
  // Sélectionner/désélectionner une entreprise
  const toggleCompanySelection = (companyId: string) => {
    const newSelected = new Set(selectedCompanies)
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId)
    } else {
      newSelected.add(companyId)
    }
    setSelectedCompanies(newSelected)
  }
  // Sélectionner/désélectionner toutes les entreprises
  const toggleAllCompanies = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      setSelectedCompanies(new Set())
    } else {
      setSelectedCompanies(new Set(filteredCompanies.map(c => c.id)))
    }
  }
  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Icon name="target" className={styles.titleIcon} />
          Ciblage d'Entreprises
        </h1>
        <p className={styles.subtitle}>
          Recherchez et ciblez des entreprises avec Google Places API
        </p>
      </div>

      {/* Section de recherche */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recherche d'Entreprises</h2>
        
        <div className={styles.searchForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Recherche</label>
              <input
                type="text"
                value={searchFilters.query}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Ex: restaurants, agences marketing, etc."
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Localisation</label>
              <input
                type="text"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Paris, France"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rayon (mètres)</label>
              <select
                value={searchFilters.radius}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                className={styles.select}
              >
                <option value={1000}>1 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={25000}>25 km</option>
                <option value={50000}>50 km</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type d'entreprise</label>
              <input
                type="text"
                value={searchFilters.type}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Ex: restaurant, store, etc."
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Site web</label>
              <select
                value={searchFilters.hasWebsite === undefined ? '' : searchFilters.hasWebsite.toString()}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  hasWebsite: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className={styles.select}
              >
                <option value="">Tous</option>
                <option value="true">Avec site web</option>
                <option value="false">Sans site web</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Limite</label>
              <select
                value={searchFilters.limit}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className={styles.select}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <button
            onClick={searchCompanies}
            disabled={searching || !searchFilters.query.trim()}
            className={styles.primaryButton}
          >
            {searching ? (
              <>
                <Icon name="spinner" className={styles.spinner} />
                Recherche en cours...
              </>
            ) : (
              <>
                <Icon name="search" />
                Rechercher
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {companies.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Statistiques</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.withWebsite}</div>
              <div className={styles.statLabel}>Avec site web</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.withoutWebsite}</div>
              <div className={styles.statLabel}>Sans site web</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.withEmail}</div>
              <div className={styles.statLabel}>Avec email</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.withPhone}</div>
              <div className={styles.statLabel}>Avec téléphone</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres avancés */}
      {companies.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Filtres Avancés</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Industries</label>
              <input
                type="text"
                value={filterOptions.industries.join(', ')}
                onChange={(e) => setFilterOptions(prev => ({ 
                  ...prev, 
                  industries: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
                placeholder="Ex: restaurant, retail, technology"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Localisation</label>
              <input
                type="text"
                value={filterOptions.location}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Filtrer par localisation"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Site web</label>
              <select
                value={filterOptions.hasWebsite === undefined ? '' : filterOptions.hasWebsite.toString()}
                onChange={(e) => setFilterOptions(prev => ({ 
                  ...prev, 
                  hasWebsite: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className={styles.select}
              >
                <option value="">Tous</option>
                <option value="true">Avec site web</option>
                <option value="false">Sans site web</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <select
                value={filterOptions.hasEmail === undefined ? '' : filterOptions.hasEmail.toString()}
                onChange={(e) => setFilterOptions(prev => ({ 
                  ...prev, 
                  hasEmail: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className={styles.select}
              >
                <option value="">Tous</option>
                <option value="true">Avec email</option>
                <option value="false">Sans email</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Téléphone</label>
              <select
                value={filterOptions.hasPhone === undefined ? '' : filterOptions.hasPhone.toString()}
                onChange={(e) => setFilterOptions(prev => ({ 
                  ...prev, 
                  hasPhone: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className={styles.select}
              >
                <option value="">Tous</option>
                <option value="true">Avec téléphone</option>
                <option value="false">Sans téléphone</option>
              </select>
            </div>
          </div>

          <button
            onClick={filterCompanies}
            disabled={loading}
            className={styles.secondaryButton}
          >
            {loading ? (
              <>
                <Icon name="spinner" className={styles.spinner} />
                Filtrage...
              </>
            ) : (
              <>
                <Icon name="filter" />
                Filtrer
              </>
            )}
          </button>
        </div>
      )}

      {/* Liste des entreprises */}
      {filteredCompanies.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Entreprises ({filteredCompanies.length})
            </h2>
            
            <div className={styles.actions}>
              <button
                onClick={toggleAllCompanies}
                className={styles.secondaryButton}
              >
                {selectedCompanies.size === filteredCompanies.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            </div>
          </div>

          <div className={styles.companiesGrid}>
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className={`${styles.companyCard} ${
                  selectedCompanies.has(company.id) ? styles.selected : ''
                }`}
                onClick={() => toggleCompanySelection(company.id)}
              >
                <div className={styles.companyHeader}>
                  <input
                    type="checkbox"
                    checked={selectedCompanies.has(company.id)}
                    onChange={() => toggleCompanySelection(company.id)}
                    className={styles.checkbox}
                  />
                  <h3 className={styles.companyName}>{company.name}</h3>
                </div>

                <div className={styles.companyDetails}>
                  <p className={styles.companyAddress}>
                    <Icon name="map-pin" className={styles.icon} />
                    {company.address}
                  </p>
                  
                  {company.phone && (
                    <p className={styles.companyContact}>
                      <Icon name="phone" className={styles.icon} />
                      {company.phone}
                    </p>
                  )}
                  
                  {company.website && (
                    <p className={styles.companyContact}>
                      <Icon name="globe" className={styles.icon} />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {company.website}
                      </a>
                    </p>
                  )}
                  
                  {company.email && (
                    <p className={styles.companyContact}>
                      <Icon name="mail" className={styles.icon} />
                      {company.email}
                    </p>
                  )}
                </div>

                <div className={styles.companyMeta}>
                  <div className={styles.badges}>
                    {company.hasWebsite && (
                      <span className={styles.badge}>Site web</span>
                    )}
                    {company.hasEmail && (
                      <span className={styles.badge}>Email</span>
                    )}
                    {company.hasPhone && (
                      <span className={styles.badge}>Téléphone</span>
                    )}
                  </div>
                  
                  {company.rating && (
                    <div className={styles.rating}>
                      <Icon name="star" className={styles.starIcon} />
                      {company.rating} ({company.reviewCount} avis)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sauvegarde des entreprises sélectionnées */}
      {selectedCompanies.size > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Sauvegarder les Entreprises Sélectionnées ({selectedCompanies.size})
          </h2>
          
          <div className={styles.saveForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom de la campagne</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ex: Campagne Restaurants Paris"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur cette campagne..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <button
              onClick={saveSelectedCompanies}
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? (
                <>
                  <Icon name="spinner" className={styles.spinner} />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Icon name="save" />
                  Sauvegarder {selectedCompanies.size} entreprise(s)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
