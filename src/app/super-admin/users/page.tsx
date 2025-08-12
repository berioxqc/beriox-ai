"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessGuard from "@/components/AccessGuard";
import { Icon } from "@/components/ui/Icon";
import { useTheme, useStyles } from "@/hooks/useTheme";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'apos;USER'apos; | 'apos;ADMIN'apos; | 'apos;SUPER_ADMIN'apos;;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  credits?: number;
  plan?: string;
}

interface UserManagementStats {
  total: number;
  users: number;
  admins: number;
  superAdmins: number;
  active: number;
  premium: number;
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const styles = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('apos;'apos;);
  const [roleFilter, setRoleFilter] = useState<string>('apos;all'apos;);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Vérifier si l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return (
      <AuthGuard>
        <AccessGuard superAdminOnly={true}>
          <Layout>
            <div style={{
              display: 'apos;flex'apos;,
              flexDirection: 'apos;column'apos;,
              alignItems: 'apos;center'apos;,
              justifyContent: 'apos;center'apos;,
              minHeight: 'apos;60vh'apos;,
              textAlign: 'apos;center'apos;,
              gap: 'apos;24px'apos;
            }}>
              <div style={{ fontSize: 'apos;64px'apos;, color: 'apos;#ef4444'apos; }}>🚫</div>
              <div>
                <h2 style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#ef4444'apos;, margin: 'apos;0 0 12px 0'apos; }}>
                  Accès Super-Admin Refusé
                </h2>
                <p style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;16px'apos;, margin: 'apos;0 0 32px 0'apos; }}>
                  Seul info@beriox.ca peut accéder au panneau Super-Admin.
                </p>
              </div>
            </div>
          </Layout>
        </AccessGuard>
      </AuthGuard>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('apos;/api/super-admin/users'apos;);
      
      if (!response.ok) {
        throw new Error('apos;Erreur lors de la récupération des utilisateurs'apos;);
      }
      
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error('apos;Erreur:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingRole(true);
      const response = await fetch('apos;/api/super-admin/users/role'apos;, {
        method: 'apos;PUT'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('apos;Erreur lors de la mise à jour du rôle'apos;);
      }

      // Mettre à jour la liste des utilisateurs
      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('apos;Erreur:'apos;, error);
    } finally {
      setUpdatingRole(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'apos;all'apos; || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'apos;SUPER_ADMIN'apos;: return 'apos;#dc2626'apos;;
      case 'apos;ADMIN'apos;: return 'apos;#ea580c'apos;;
      case 'apos;USER'apos;: return 'apos;#059669'apos;;
      default: return 'apos;#6b7280'apos;;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'apos;SUPER_ADMIN'apos;: return 'apos;Super Admin'apos;;
      case 'apos;ADMIN'apos;: return 'apos;Admin'apos;;
      case 'apos;USER'apos;: return 'apos;Utilisateur'apos;;
      default: return role;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            minHeight: 'apos;60vh'apos;
          }}>
            <Icon name="spinner" style={{ fontSize: 'apos;32px'apos; }} />
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={styles.container}>
          {/* Header */}
          <div style={{
            display: 'apos;flex'apos;,
            justifyContent: 'apos;space-between'apos;,
            alignItems: 'apos;center'apos;,
            marginBottom: 'apos;32px'apos;,
            paddingBottom: 'apos;16px'apos;,
            borderBottom: `1px solid ${theme.border}`
          }}>
            <div>
              <h1 style={styles.h1}>Gestion des Utilisateurs</h1>
              <p style={styles.subtitle}>
                Gérez les utilisateurs et assignez les rôles d'apos;administration
              </p>
            </div>
            <div style={{
              display: 'apos;flex'apos;,
              gap: 'apos;12px'apos;,
              alignItems: 'apos;center'apos;
            }}>
              <Icon name="users" style={{ fontSize: 'apos;24px'apos;, color: theme.primary }} />
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{
              display: 'apos;grid'apos;,
              gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
              gap: 'apos;16px'apos;,
              marginBottom: 'apos;32px'apos;
            }}>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid ${theme.primary}`
              }}>
                <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: theme.primary }}>
                  {stats.total}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: 'apos;14px'apos; }}>
                  Total Utilisateurs
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #059669`
              }}>
                <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#059669'apos; }}>
                  {stats.users}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: 'apos;14px'apos; }}>
                  Utilisateurs
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #ea580c`
              }}>
                <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#ea580c'apos; }}>
                  {stats.admins}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: 'apos;14px'apos; }}>
                  Admins
                </div>
              </div>
              <div style={{
                ...styles.card,
                borderLeft: `4px solid #dc2626`
              }}>
                <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#dc2626'apos; }}>
                  {stats.superAdmins}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: 'apos;14px'apos; }}>
                  Super Admins
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{
            display: 'apos;flex'apos;,
            gap: 'apos;16px'apos;,
            marginBottom: 'apos;24px'apos;,
            flexWrap: 'apos;wrap'apos;
          }}>
            <div style={{ flex: 'apos;1'apos;, minWidth: 'apos;300px'apos; }}>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...styles.input,
                  width: 'apos;100%'apos;
                }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                ...styles.select,
                minWidth: 'apos;150px'apos;
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
              overflowX: 'apos;auto'apos;
            }}>
              <table style={{
                width: 'apos;100%'apos;,
                borderCollapse: 'apos;collapse'apos;
              }}>
                <thead>
                  <tr style={{
                    borderBottom: `1px solid ${theme.border}`
                  }}>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;left'apos;,
                      padding: 'apos;12px 16px'apos;
                    }}>
                      Utilisateur
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;left'apos;,
                      padding: 'apos;12px 16px'apos;
                    }}>
                      Rôle
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;left'apos;,
                      padding: 'apos;12px 16px'apos;
                    }}>
                      Statut
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;left'apos;,
                      padding: 'apos;12px 16px'apos;
                    }}>
                      Crédits
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;left'apos;,
                      padding: 'apos;12px 16px'apos;
                    }}>
                      Inscription
                    </th>
                    <th style={{
                      ...styles.th,
                      textAlign: 'apos;center'apos;,
                      padding: 'apos;12px 16px'apos;
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
                        padding: 'apos;16px'apos;,
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;center'apos;,
                        gap: 'apos;12px'apos;
                      }}>
                        <div style={{
                          width: 'apos;40px'apos;,
                          height: 'apos;40px'apos;,
                          borderRadius: 'apos;50%'apos;,
                          backgroundColor: theme.primary,
                          display: 'apos;flex'apos;,
                          alignItems: 'apos;center'apos;,
                          justifyContent: 'apos;center'apos;,
                          color: 'apos;white'apos;,
                          fontWeight: 'apos;600'apos;
                        }}>
                          {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 'apos;600'apos;,
                            color: theme.text
                          }}>
                            {user.name || 'apos;Sans nom'apos;}
                          </div>
                          <div style={{
                            color: theme.textSecondary,
                            fontSize: 'apos;14px'apos;
                          }}>
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <span style={{
                          padding: 'apos;4px 8px'apos;,
                          borderRadius: 'apos;4px'apos;,
                          fontSize: 'apos;12px'apos;,
                          fontWeight: 'apos;600'apos;,
                          backgroundColor: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role)
                        }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div style={{
                          display: 'apos;flex'apos;,
                          alignItems: 'apos;center'apos;,
                          gap: 'apos;8px'apos;
                        }}>
                          <div style={{
                            width: 'apos;8px'apos;,
                            height: 'apos;8px'apos;,
                            borderRadius: 'apos;50%'apos;,
                            backgroundColor: user.emailVerified ? 'apos;#059669'apos; : 'apos;#dc2626'apos;
                          }} />
                          <span style={{
                            fontSize: 'apos;14px'apos;,
                            color: theme.textSecondary
                          }}>
                            {user.emailVerified ? 'apos;Vérifié'apos; : 'apos;Non vérifié'apos;}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div style={{
                          color: theme.text,
                          fontWeight: 'apos;600'apos;
                        }}>
                          {user.credits || 0}
                        </div>
                        <div style={{
                          color: theme.textSecondary,
                          fontSize: 'apos;12px'apos;
                        }}>
                          {user.plan || 'apos;Gratuit'apos;}
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div style={{
                          color: theme.textSecondary,
                          fontSize: 'apos;14px'apos;
                        }}>
                          {new Date(user.createdAt).toLocaleDateString('apos;fr-FR'apos;)}
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos;, textAlign: 'apos;center'apos; }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          style={{
                            ...styles.button,
                            padding: 'apos;8px 16px'apos;,
                            fontSize: 'apos;14px'apos;
                          }}
                        >
                          <Icon name="edit" style={{ marginRight: 'apos;8px'apos; }} />
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
            position: 'apos;fixed'apos;,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'apos;rgba(0, 0, 0, 0.5)'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            zIndex: 1000
          }}>
            <div style={{
              ...styles.card,
              maxWidth: 'apos;500px'apos;,
              width: 'apos;90%'apos;,
              maxHeight: 'apos;90vh'apos;,
              overflow: 'apos;auto'apos;
            }}>
              <h3 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                margin: 'apos;0 0 16px 0'apos;,
                color: theme.text
              }}>
                Modifier le rôle de {selectedUser.name || selectedUser.email}
              </h3>
              
              <div style={{ marginBottom: 'apos;24px'apos; }}>
                <label style={{
                  display: 'apos;block'apos;,
                  marginBottom: 'apos;8px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.text
                }}>
                  Nouveau rôle
                </label>
                <select
                  defaultValue={selectedUser.role}
                  style={{
                    ...styles.select,
                    width: 'apos;100%'apos;
                  }}
                  id="roleSelect"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div style={{
                display: 'apos;flex'apos;,
                gap: 'apos;12px'apos;,
                justifyContent: 'apos;flex-end'apos;
              }}>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
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
                    const select = document.getElementById('apos;roleSelect'apos;) as HTMLSelectElement;
                    updateUserRole(selectedUser.id, select.value);
                  }}
                  style={{
                    ...styles.button,
                    backgroundColor: theme.primary
                  }}
                  disabled={updatingRole}
                >
                  {updatingRole ? (
                    <>
                      <Icon name="spinner" style={{ marginRight: 'apos;8px'apos; }} />
                      Mise à jour...
                    </>
                  ) : (
                    'apos;Mettre à jour'apos;
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AuthGuard>
  );
}
