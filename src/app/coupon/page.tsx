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
      const response = await fetch('apos;/api/coupons/redeem'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
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
          message: data.error || "Erreur lors de l'apos;utilisation du coupon"
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
      'apos;starter'apos;: 'apos;Starter'apos;,
      'apos;pro'apos;: 'apos;Professionnel'apos;,
      'apos;enterprise'apos;: 'apos;Enterprise'apos;
    };
    return plans[planId] || planId;
  };

  return (
    <AuthGuard>
      <Layout>
        <div style={{
          minHeight: 'apos;100vh'apos;,
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
          padding: 'apos;40px 20px'apos;
        }}>
          <div style={{
            maxWidth: 'apos;600px'apos;,
            margin: 'apos;0 auto'apos;
          }}>
            {/* Header */}
            <div style={{
              textAlign: 'apos;center'apos;,
              marginBottom: 'apos;40px'apos;
            }}>
              <div style={{
                fontSize: 'apos;64px'apos;,
                marginBottom: 'apos;20px'apos;
              }}>🎫</div>
              <h1 style={{
                fontSize: 'apos;32px'apos;,
                fontWeight: 'apos;700'apos;,
                color: 'apos;white'apos;,
                margin: 'apos;0 0 16px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Utiliser un coupon
              </h1>
              <p style={{
                fontSize: 'apos;18px'apos;,
                color: 'apos;rgba(255, 255, 255, 0.9)'apos;,
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Saisissez votre code coupon pour débloquer un accès premium
              </p>
            </div>

            {/* Formulaire */}
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;16px'apos;,
              padding: 'apos;40px'apos;,
              boxShadow: 'apos;0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'apos;,
              marginBottom: 'apos;24px'apos;
            }}>
              <div style={{ marginBottom: 'apos;24px'apos; }}>
                <label style={{
                  display: 'apos;block'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: 'apos;#0a2540'apos;,
                  marginBottom: 'apos;8px'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  Code coupon
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PREMIUM3MOIS, STARTER2024..."
                  style={{
                    width: 'apos;100%'apos;,
                    padding: 'apos;16px 20px'apos;,
                    border: 'apos;2px solid #e3e8ee'apos;,
                    borderRadius: 'apos;12px'apos;,
                    fontSize: 'apos;16px'apos;,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                    outline: 'apos;none'apos;,
                    transition: 'apos;border-color 0.2s'apos;,
                    textTransform: 'apos;uppercase'apos;,
                    letterSpacing: 'apos;1px'apos;,
                    fontWeight: 'apos;500'apos;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'apos;#e3e8ee'apos;;
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'apos;Enter'apos;) {
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
                  width: 'apos;100%'apos;,
                  background: loading ? 'apos;#9ca3af'apos; : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: 'apos;white'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;12px'apos;,
                  padding: 'apos;16px 24px'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: loading ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
                  transition: 'apos;all 0.2s'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  gap: 'apos;8px'apos;
                }}
                onMouseEnter={(e) => {
                  if (!loading && couponCode.trim()) {
                    e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                    e.currentTarget.style.boxShadow = 'apos;0 10px 25px -5px rgba(0, 0, 0, 0.2)'apos;;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                  e.currentTarget.style.boxShadow = 'apos;none'apos;;
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 'apos;20px'apos;,
                      height: 'apos;20px'apos;,
                      border: 'apos;2px solid rgba(255, 255, 255, 0.3)'apos;,
                      borderTop: 'apos;2px solid white'apos;,
                      borderRadius: 'apos;50%'apos;,
                      animation: 'apos;spin 1s linear infinite'apos;
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
                background: result.success ? 'apos;#10b981'apos; : 'apos;#ef4444'apos;,
                color: 'apos;white'apos;,
                borderRadius: 'apos;12px'apos;,
                padding: 'apos;20px'apos;,
                marginBottom: 'apos;24px'apos;,
                boxShadow: 'apos;0 10px 25px -5px rgba(0, 0, 0, 0.1)'apos;
              }}>
                <div style={{
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;12px'apos;,
                  marginBottom: result.success && result.access ? 'apos;16px'apos; : 'apos;0'apos;
                }}>
                  <Icon 
                    name={result.success ? "check" : "times"} 
                    size={24}
                  />
                  <div>
                    <h3 style={{
                      margin: 'apos;0 0 4px 0'apos;,
                      fontSize: 'apos;18px'apos;,
                      fontWeight: 'apos;600'apos;,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                    }}>
                      {result.success ? "🎉 Coupon appliqué !" : "❌ Erreur"}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: 'apos;14px'apos;,
                      opacity: 0.9,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                    }}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.success && result.access && (
                  <div style={{
                    background: 'apos;rgba(255, 255, 255, 0.2)'apos;,
                    borderRadius: 'apos;8px'apos;,
                    padding: 'apos;16px'apos;,
                    display: 'apos;grid'apos;,
                    gridTemplateColumns: 'apos;repeat(auto-fit, minmax(150px, 1fr))'apos;,
                    gap: 'apos;16px'apos;
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'apos;12px'apos;,
                        opacity: 0.8,
                        marginBottom: 'apos;4px'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                      }}>
                        Plan activé
                      </div>
                      <div style={{
                        fontSize: 'apos;16px'apos;,
                        fontWeight: 'apos;600'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                      }}>
                        {getPlanName(result.access.planId)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'apos;12px'apos;,
                        opacity: 0.8,
                        marginBottom: 'apos;4px'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                      }}>
                        Durée
                      </div>
                      <div style={{
                        fontSize: 'apos;16px'apos;,
                        fontWeight: 'apos;600'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
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
              display: 'apos;flex'apos;,
              gap: 'apos;16px'apos;,
              justifyContent: 'apos;center'apos;,
              flexWrap: 'apos;wrap'apos;
            }}>
              <Link 
                href="/"
                style={{
                  background: 'apos;rgba(255, 255, 255, 0.2)'apos;,
                  color: 'apos;white'apos;,
                  textDecoration: 'apos;none'apos;,
                  padding: 'apos;12px 24px'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;500'apos;,
                  transition: 'apos;all 0.2s'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'apos;rgba(255, 255, 255, 0.3)'apos;;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'apos;rgba(255, 255, 255, 0.2)'apos;;
                }}
              >
                <Icon name="home" />
                Retour au tableau de bord
              </Link>
              
              <Link 
                href="/pricing"
                style={{
                  background: 'apos;rgba(255, 255, 255, 0.2)'apos;,
                  color: 'apos;white'apos;,
                  textDecoration: 'apos;none'apos;,
                  padding: 'apos;12px 24px'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;500'apos;,
                  transition: 'apos;all 0.2s'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;8px'apos;
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'apos;rgba(255, 255, 255, 0.3)'apos;;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'apos;rgba(255, 255, 255, 0.2)'apos;;
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
