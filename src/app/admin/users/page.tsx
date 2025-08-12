"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faUsers, 
  faCrown, 
  faUser, 
  faEnvelope, 
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faTrash,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons"
interface User {
  id: string
  email: string
  name: string
  createdAt: string
  lastLogin: string
  isActive: boolean
  isPremium: boolean
  planId?: string
  missionsCount: number
  credits: number
}

export default function UsersAdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const fetchUsers = async () => {
    try {
      // Simuler des données d'utilisateurs pour la démo
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'info@beriox.ca',
          name: 'Admin Beriox',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-08-10T14:22:00Z',
          isActive: true,
          isPremium: true,
          planId: 'enterprise',
          missionsCount: 156,
          credits: 9999
        },
        {
          id: '2',
          email: 'john.doe@example.com',
          name: 'John Doe',
          createdAt: '2024-03-20T09:15:00Z',
          lastLogin: '2024-08-09T16:45:00Z',
          isActive: true,
          isPremium: true,
          planId: 'competitor-intelligence',
          missionsCount: 89,
          credits: 450
        },
        {
          id: '3',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          createdAt: '2024-05-10T11:20:00Z',
          lastLogin: '2024-08-08T13:30:00Z',
          isActive: true,
          isPremium: false,
          missionsCount: 23,
          credits: 150
        },
        {
          id: '4',
          email: 'bob.wilson@example.com',
          name: 'Bob Wilson',
          createdAt: '2024-06-05T14:45:00Z',
          lastLogin: '2024-08-07T10:15:00Z',
          isActive: false,
          isPremium: false,
          missionsCount: 5,
          credits: 50
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Vérifier si l'utilisateur est admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return (
      <AuthGuard>
        <Layout>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: '24px'
          }}>
            <div style={{ fontSize: '64px', color: '#ef4444' }}>🚫</div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '0 0 12px 0' }}>
                Accès Refusé
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 32px 0' }}>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <Link
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#635bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    )
  }
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ||
                         (filter === 'premium' && user.isPremium) ||
                         (filter === 'active' && user.isActive) ||
                         (filter === 'inactive' && !user.isActive)
    return matchesSearch && matchesFilter
  })
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', color: '#6b7280' }}>Chargement...</div>
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Link
                href="/super-admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour au Super-Admin
              </Link>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: '#3b82f6', fontSize: '24px' }} />
              <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0' }}>
                Gestion des Utilisateurs
              </h1>
            </div>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
              Gérer les comptes utilisateurs, permissions et accès premium
            </p>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Utilisateurs</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{users.length}</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Utilisateurs Premium</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {users.filter(u => u.isPremium).length}
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Utilisateurs Actifs</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {users.filter(u => u.isActive).length}
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Nouveaux ce mois</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {users.filter(u => {
                  const createdAt = new Date(u.createdAt)
                  const now = new Date()
                  return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '300px'
              }}
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="premium">Utilisateurs premium</option>
              <option value="active">Utilisateurs actifs</option>
              <option value="inactive">Utilisateurs inactifs</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>
                Liste des Utilisateurs ({filteredUsers.length})
              </h2>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Utilisateur
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Statut
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Plan
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Missions
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Crédits
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Dernière connexion
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {user.name}
                            {user.email === 'info@beriox.ca' && (
                              <FontAwesomeIcon 
                                icon={faCrown} 
                                style={{ color: '#f59e0b', marginLeft: '8px' }} 
                              />
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {user.email}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Inscrit le {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {user.isActive ? (
                            <>
                              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} />
                              <span style={{ color: '#10b981', fontSize: '14px' }}>Actif</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444', fontSize: '14px' }}>Inactif</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {user.isPremium ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faCrown} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                              {user.planId === 'enterprise' ? 'Enterprise' : 
                               user.planId === 'competitor-intelligence' ? 'Competitor Intelligence' : 'Premium'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Gratuit</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>
                          {user.missionsCount}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                          {user.credits}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(user.lastLogin)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  )
}
