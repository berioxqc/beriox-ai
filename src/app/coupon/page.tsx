"use client";
import { useState } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Icon from "@/components/ui/Icon";
import { useTheme, useStyles } from "@/hooks/useTheme";
import Link from "next/link";

export default function CouponPage() {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    access?: {
      planId: string;
      expiresAt: string;
      daysRemaining: number;
    };
  } | null>(null);

  const theme = useTheme();
  const styles = useStyles();

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          access: data.access
        });
        setCouponCode(""); // Vider le champ
      } else {
        setResult({
          success: false,
          message: data.error || "Erreur lors de l'utilisation du coupon"
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erreur de connexion. Veuillez réessayer."
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      'starter': 'Starter',
      'pro': 'Professionnel',
      'enterprise': 'Enterprise'
    };
    return plans[planId] || planId;
  };

  return (
    <AuthGuard>
      <Layout>
        <div style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
          padding: '40px 20px'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px'
              }}>🎫</div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 16px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Utiliser un coupon
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Saisissez votre code coupon pour débloquer un accès premium
              </p>
            </div>

            {/* Formulaire */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0a2540',
                  marginBottom: '8px',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Code coupon
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PREMIUM3MOIS, STARTER2024..."
                  style={{
                    width: &apos;100%&apos;,
                    padding: &apos;16px 20px&apos;,
                    border: &apos;2px solid #e3e8ee&apos;,
                    borderRadius: &apos;12px&apos;,
                    fontSize: &apos;16px&apos;,
                    fontFamily: "-apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, sans-serif",
                    outline: &apos;none&apos;,
                    transition: &apos;border-color 0.2s&apos;,
                    textTransform: &apos;uppercase&apos;,
                    letterSpacing: &apos;1px&apos;,
                    fontWeight: &apos;500&apos;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = &apos;#e3e8ee&apos;;
                  }}
                  onKeyPress={(e) => {
                    if (e.key === &apos;Enter&apos;) {
                      handleRedeemCoupon();
                    }
                  }}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleRedeemCoupon}
                disabled={!couponCode.trim() || loading}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading && couponCode.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Vérification...
                  </>
                ) : (
                  <>
                    <Icon name="gift" />
                    Utiliser le coupon
                  </>
                )}
              </button>
            </div>

            {/* Résultat */}
            {result && (
              <div style={{
                background: result.success ? '#10b981' : '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: result.success && result.access ? '16px' : '0'
                }}>
                  <Icon 
                    name={result.success ? "check" : "times"} 
                    size={24}
                  />
                  <div>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      {result.success ? "🎉 Coupon appliqué !" : "❌ Erreur"}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      opacity: 0.9,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.success && result.access && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        marginBottom: '4px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        Plan activé
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        {getPlanName(result.access.planId)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        marginBottom: '4px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        Durée
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        {result.access.daysRemaining} jours
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link 
                href="/"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <Icon name="home" />
                Retour au tableau de bord
              </Link>
              
              <Link 
                href="/pricing"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <Icon name="credit-card" />
                Voir les plans
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    </AuthGuard>
  );
}
