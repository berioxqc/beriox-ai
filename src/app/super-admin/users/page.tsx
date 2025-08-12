"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import AccessGuard from "@/components/AccessGuard"
import { Icon } from "@/components/ui/Icon"
import { useTheme, useStyles } from "@/hooks/useTheme"
interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  emailVerified: boolean
  createdAt: string
  lastLogin?: string
  credits?: number
  plan?: string
}

interface UserManagementStats {
  total: number
  users: number
  admins: number
  superAdmins: number
  active: number
  premium: number
}

export default function UserManagementPage() {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const styles = useStyles()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserManagementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)
  // Vérifier si l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return (
      <AuthGuard>
        <AccessGuard superAdminOnly={true}>
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
                  Accès Super-Admin Refusé
                </h2>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 32px 0' }}>
                  Seul info@beriox.ca peut accéder au panneau Super-Admin.
                </p>
              </div>
            </div>
          </Layout>
        </AccessGuard>
      </AuthGuard>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/users')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }
      
      const data = await response.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingRole(true)
      const response = await fetch('/api/super-admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du rôle')
      }

      // Mettre à jour la liste des utilisateurs
      await fetchUsers()
      setShowRoleModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setUpdatingRole(false)
    }
  }
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#dc2626'
      case 'ADMIN': return '#ea580c'
      case 'USER': return '#059669'
      default: return '#6b7280'
    }
  }
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Admin'
      case 'USER': return 'Utilisateur'
      default: return role
    }
  }
  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
          }}>
            <Icon name="spinner" style={{ fontSize: '32px' }} />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={styles.container}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <div>
              <h1 style={styles.h1}>Gestion des Utilisateurs</h1>
              <p style={styles.subtitle}>
                Gérez les utilisateurs et assignez les rôles d'administration
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <Icon name="users" style={{ fontSize: '24px', color: theme.primary }} />
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid ${theme.primary}`
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.primary }}>
                  {stats.total}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                  Total Utilisateurs
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #059669`
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {stats.users}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                  Utilisateurs
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #ea580c`
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>
                  {stats.admins}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                  Admins
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #dc2626`
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                  {stats.superAdmins}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                  Super Admins
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...styles.input,
                  width: '100%'
                }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                ...styles.select,
                minWidth: '150px'
              }}
            >
              <option value="all">Tous les rôles</option>
              <option value="USER">Utilisateurs</option>
              <option value="ADMIN">Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={styles.card}>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: `1px solid ${theme.border}`
                  }}>
                    <th style={{
                      ...styles.th,
                      textAlign: 'left',
                      padding: '12px 16px'
                    }}>
                      Utilisateur
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'left',
                      padding: '12px 16px'
                    }}>
                      Rôle
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'left',
                      padding: '12px 16px'
                    }}>
                      Statut
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'left',
                      padding: '12px 16px'
                    }}>
                      Crédits
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'left',
                      padding: '12px 16px'
                    }}>
                      Inscription
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'center',
                      padding: '12px 16px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      <td style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: theme.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: theme.text
                          }}>
                            {user.name || 'Sans nom'}
                          </div>
                          <div style={{
                            color: theme.textSecondary,
                            fontSize: '14px'
                          }}>
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role)
                        }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: user.emailVerified ? '#059669' : '#dc2626'
                          }} />
                          <span style={{
                            fontSize: '14px',
                            color: theme.textSecondary
                          }}>
                            {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          color: theme.text,
                          fontWeight: '600'
                        }}>
                          {user.credits || 0}
                        </div>
                        <div style={{
                          color: theme.textSecondary,
                          fontSize: '12px'
                        }}>
                          {user.plan || 'Gratuit'}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          color: theme.textSecondary,
                          fontSize: '14px'
                        }}>
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowRoleModal(true)
                          }}
                          style={{
                            ...styles.button,
                            padding: '8px 16px',
                            fontSize: '14px'
                          }}
                        >
                          <Icon name="edit" style={{ marginRight: '8px' }} />
                          Modifier le rôle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Role Update Modal */}
        {showRoleModal && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              ...styles.card,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: theme.text
              }}>
                Modifier le rôle de {selectedUser.name || selectedUser.email}
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: theme.text
                }}>
                  Nouveau rôle
                </label>
                <select
                  defaultValue={selectedUser.role}
                  style={{
                    ...styles.select,
                    width: '100%'
                  }}
                  id="roleSelect"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedUser(null)
                  }}
                  style={{
                    ...styles.button,
                    backgroundColor: theme.border,
                    color: theme.text
                  }}
                  disabled={updatingRole}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const select = document.getElementById('roleSelect') as HTMLSelectElement
                    updateUserRole(selectedUser.id, select.value)
                  }}
                  style={{
                    ...styles.button,
                    backgroundColor: theme.primary
                  }}
                  disabled={updatingRole}
                >
                  {updatingRole ? (
                    <>
                      <Icon name="spinner" style={{ marginRight: '8px' }} />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AuthGuard>
  )
}
