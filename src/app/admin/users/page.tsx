"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
} from "@fortawesome/free-solid-svg-icons";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  isPremium: boolean;
  planId?: string;
  missionsCount: number;
  credits: number;
}

export default function UsersAdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Vérifier si l'apos;utilisateur est admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return (
      <AuthGuard>
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
                Accès Refusé
              </h2>
              <p style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;16px'apos;, margin: 'apos;0 0 32px 0'apos; }}>
                Vous n'apos;avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <Link
                href="/"
                style={{
                  padding: 'apos;12px 24px'apos;,
                  backgroundColor: 'apos;#635bff'apos;,
                  color: 'apos;white'apos;,
                  textDecoration: 'apos;none'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontWeight: 'apos;600'apos;
                }}
              >
                Retour à l'apos;accueil
              </Link>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simuler des données d'apos;utilisateurs pour la démo
      const mockUsers: User[] = [
        {
          id: 'apos;1'apos;,
          email: 'apos;info@beriox.ca'apos;,
          name: 'apos;Admin Beriox'apos;,
          createdAt: 'apos;2024-01-15T10:30:00Z'apos;,
          lastLogin: 'apos;2024-08-10T14:22:00Z'apos;,
          isActive: true,
          isPremium: true,
          planId: 'apos;enterprise'apos;,
          missionsCount: 156,
          credits: 9999
        },
        {
          id: 'apos;2'apos;,
          email: 'apos;john.doe@example.com'apos;,
          name: 'apos;John Doe'apos;,
          createdAt: 'apos;2024-03-20T09:15:00Z'apos;,
          lastLogin: 'apos;2024-08-09T16:45:00Z'apos;,
          isActive: true,
          isPremium: true,
          planId: 'apos;competitor-intelligence'apos;,
          missionsCount: 89,
          credits: 450
        },
        {
          id: 'apos;3'apos;,
          email: 'apos;jane.smith@example.com'apos;,
          name: 'apos;Jane Smith'apos;,
          createdAt: 'apos;2024-05-10T11:20:00Z'apos;,
          lastLogin: 'apos;2024-08-08T13:30:00Z'apos;,
          isActive: true,
          isPremium: false,
          missionsCount: 23,
          credits: 150
        },
        {
          id: 'apos;4'apos;,
          email: 'apos;bob.wilson@example.com'apos;,
          name: 'apos;Bob Wilson'apos;,
          createdAt: 'apos;2024-06-05T14:45:00Z'apos;,
          lastLogin: 'apos;2024-08-07T10:15:00Z'apos;,
          isActive: false,
          isPremium: false,
          missionsCount: 5,
          credits: 50
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('apos;Erreur lors du chargement des utilisateurs:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'apos;all'apos; ||
                         (filter === 'apos;premium'apos; && user.isPremium) ||
                         (filter === 'apos;active'apos; && user.isActive) ||
                         (filter === 'apos;inactive'apos; && !user.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('apos;fr-FR'apos;, {
      year: 'apos;numeric'apos;,
      month: 'apos;short'apos;,
      day: 'apos;numeric'apos;,
      hour: 'apos;2-digit'apos;,
      minute: 'apos;2-digit'apos;
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: 'apos;40px'apos;, textAlign: 'apos;center'apos; }}>
            <div style={{ fontSize: 'apos;24px'apos;, color: 'apos;#6b7280'apos; }}>Chargement...</div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={{ padding: 'apos;24px'apos;, maxWidth: 'apos;1400px'apos;, margin: 'apos;0 auto'apos; }}>
          {/* Header */}
          <div style={{ marginBottom: 'apos;32px'apos; }}>
            <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;16px'apos;, marginBottom: 'apos;16px'apos; }}>
              <Link
                href="/super-admin"
                style={{
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;,
                  color: 'apos;#6b7280'apos;,
                  textDecoration: 'apos;none'apos;,
                  fontSize: 'apos;14px'apos;
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour au Super-Admin
              </Link>
            </div>
            
            <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;16px'apos;, marginBottom: 'apos;8px'apos; }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: 'apos;#3b82f6'apos;, fontSize: 'apos;24px'apos; }} />
              <h1 style={{ fontSize: 'apos;32px'apos;, fontWeight: 'apos;700'apos;, margin: 'apos;0'apos; }}>
                Gestion des Utilisateurs
              </h1>
            </div>
            <p style={{ color: 'apos;#6b7280'apos;, fontSize: 'apos;16px'apos;, margin: 'apos;0'apos; }}>
              Gérer les comptes utilisateurs, permissions et accès premium
            </p>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'apos;grid'apos;, 
            gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;, 
            gap: 'apos;24px'apos;, 
            marginBottom: 'apos;32px'apos; 
          }}>
            <div style={{ 
              padding: 'apos;20px'apos;, 
              backgroundColor: 'apos;white'apos;, 
              borderRadius: 'apos;12px'apos;, 
              border: 'apos;1px solid #e5e7eb'apos;,
              boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
            }}>
              <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>Total Utilisateurs</div>
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos; }}>{users.length}</div>
            </div>
            
            <div style={{ 
              padding: 'apos;20px'apos;, 
              backgroundColor: 'apos;white'apos;, 
              borderRadius: 'apos;12px'apos;, 
              border: 'apos;1px solid #e5e7eb'apos;,
              boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
            }}>
              <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>Utilisateurs Premium</div>
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#f59e0b'apos; }}>
                {users.filter(u => u.isPremium).length}
              </div>
            </div>
            
            <div style={{ 
              padding: 'apos;20px'apos;, 
              backgroundColor: 'apos;white'apos;, 
              borderRadius: 'apos;12px'apos;, 
              border: 'apos;1px solid #e5e7eb'apos;,
              boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
            }}>
              <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>Utilisateurs Actifs</div>
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#10b981'apos; }}>
                {users.filter(u => u.isActive).length}
              </div>
            </div>
            
            <div style={{ 
              padding: 'apos;20px'apos;, 
              backgroundColor: 'apos;white'apos;, 
              borderRadius: 'apos;12px'apos;, 
              border: 'apos;1px solid #e5e7eb'apos;,
              boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
            }}>
              <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#6b7280'apos;, marginBottom: 'apos;4px'apos; }}>Nouveaux ce mois</div>
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;700'apos;, color: 'apos;#3b82f6'apos; }}>
                {users.filter(u => {
                  const createdAt = new Date(u.createdAt);
                  const now = new Date();
                  return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ 
            display: 'apos;flex'apos;, 
            gap: 'apos;16px'apos;, 
            marginBottom: 'apos;24px'apos;,
            flexWrap: 'apos;wrap'apos;
          }}>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: 'apos;12px 16px'apos;,
                border: 'apos;1px solid #d1d5db'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                minWidth: 'apos;300px'apos;
              }}
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: 'apos;12px 16px'apos;,
                border: 'apos;1px solid #d1d5db'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                backgroundColor: 'apos;white'apos;
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
            backgroundColor: 'apos;white'apos;, 
            borderRadius: 'apos;12px'apos;, 
            border: 'apos;1px solid #e5e7eb'apos;,
            boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;,
            overflow: 'apos;hidden'apos;
          }}>
            <div style={{ 
              padding: 'apos;20px'apos;, 
              borderBottom: 'apos;1px solid #e5e7eb'apos;,
              backgroundColor: 'apos;#f9fafb'apos;
            }}>
              <h2 style={{ margin: 'apos;0'apos;, fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos; }}>
                Liste des Utilisateurs ({filteredUsers.length})
              </h2>
            </div>
            
            <div style={{ overflowX: 'apos;auto'apos; }}>
              <table style={{ width: 'apos;100%'apos;, borderCollapse: 'apos;collapse'apos; }}>
                <thead>
                  <tr style={{ backgroundColor: 'apos;#f9fafb'apos; }}>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Utilisateur
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Statut
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Plan
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Missions
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Crédits
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Dernière connexion
                    </th>
                    <th style={{ padding: 'apos;16px'apos;, textAlign: 'apos;left'apos;, borderBottom: 'apos;1px solid #e5e7eb'apos;, fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: 'apos;1px solid #f3f4f6'apos; }}>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div>
                          <div style={{ fontWeight: 'apos;600'apos;, marginBottom: 'apos;4px'apos; }}>
                            {user.name}
                            {user.email === 'apos;info@beriox.ca'apos; && (
                              <FontAwesomeIcon 
                                icon={faCrown} 
                                style={{ color: 'apos;#f59e0b'apos;, marginLeft: 'apos;8px'apos; }} 
                              />
                            )}
                          </div>
                          <div style={{ fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos; }}>
                            {user.email}
                          </div>
                          <div style={{ fontSize: 'apos;12px'apos;, color: 'apos;#9ca3af'apos; }}>
                            Inscrit le {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos; }}>
                          {user.isActive ? (
                            <>
                              <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'apos;#10b981'apos; }} />
                              <span style={{ color: 'apos;#10b981'apos;, fontSize: 'apos;14px'apos; }}>Actif</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'apos;#ef4444'apos; }} />
                              <span style={{ color: 'apos;#ef4444'apos;, fontSize: 'apos;14px'apos; }}>Inactif</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        {user.isPremium ? (
                          <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: 'apos;8px'apos; }}>
                            <FontAwesomeIcon icon={faCrown} style={{ color: 'apos;#f59e0b'apos; }} />
                            <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                              {user.planId === 'apos;enterprise'apos; ? 'apos;Enterprise'apos; : 
                               user.planId === 'apos;competitor-intelligence'apos; ? 'apos;Competitor Intelligence'apos; : 'apos;Premium'apos;}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos; }}>Gratuit</span>
                        )}
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos; }}>
                          {user.missionsCount}
                        </span>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#3b82f6'apos; }}>
                          {user.credits}
                        </span>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <span style={{ fontSize: 'apos;14px'apos;, color: 'apos;#6b7280'apos; }}>
                          {formatDate(user.lastLogin)}
                        </span>
                      </td>
                      <td style={{ padding: 'apos;16px'apos; }}>
                        <div style={{ display: 'apos;flex'apos;, gap: 'apos;8px'apos; }}>
                          <button
                            style={{
                              padding: 'apos;8px 12px'apos;,
                              border: 'apos;1px solid #d1d5db'apos;,
                              borderRadius: 'apos;6px'apos;,
                              backgroundColor: 'apos;white'apos;,
                              cursor: 'apos;pointer'apos;,
                              fontSize: 'apos;12px'apos;
                            }}
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            style={{
                              padding: 'apos;8px 12px'apos;,
                              border: 'apos;1px solid #ef4444'apos;,
                              borderRadius: 'apos;6px'apos;,
                              backgroundColor: 'apos;white'apos;,
                              color: 'apos;#ef4444'apos;,
                              cursor: 'apos;pointer'apos;,
                              fontSize: 'apos;12px'apos;
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
  );
}
