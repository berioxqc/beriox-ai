"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface OnboardingData {
  industry: string;
  company: string;
  role: string;
  experience: string;
  goals: string[];
  preferredAgents: string[];
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    industry: '',
    company: '',
    role: '',
    experience: '',
    goals: [],
    preferredAgents: []
  });

  const totalSteps = 4;

  // Redirection si pas connecté
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const industries = [
    { id: 'tech', name: 'Technologie', icon: 'laptop-code' },
    { id: 'marketing', name: 'Marketing/Publicité', icon: 'bullhorn' },
    { id: 'ecommerce', name: 'E-commerce', icon: 'shopping-cart' },
    { id: 'consulting', name: 'Conseil', icon: 'handshake' },
    { id: 'education', name: 'Éducation', icon: 'graduation-cap' },
    { id: 'healthcare', name: 'Santé', icon: 'heartbeat' },
    { id: 'finance', name: 'Finance', icon: 'chart-line' },
    { id: 'other', name: 'Autre', icon: 'ellipsis-h' }
  ];

  const experiences = [
    { id: 'beginner', name: 'Débutant', desc: 'Nouveau dans le domaine' },
    { id: 'intermediate', name: 'Intermédiaire', desc: '2-5 ans d\'expérience' },
    { id: 'advanced', name: 'Avancé', desc: '5+ ans d\'expérience' },
    { id: 'expert', name: 'Expert', desc: '10+ ans, je forme les autres' }
  ];

  const availableGoals = [
    { id: 'content', name: 'Créer du contenu', icon: 'pen-fancy' },
    { id: 'wordpress', name: 'Gérer WordPress', icon: 'wordpress' },
    { id: 'seo', name: 'Améliorer le SEO', icon: 'search' },
    { id: 'social', name: 'Réseaux sociaux', icon: 'share-alt' },
    { id: 'design', name: 'Design & Créatif', icon: 'palette' },
    { id: 'analytics', name: 'Analyse & Data', icon: 'chart-bar' },
    { id: 'automation', name: 'Automatisation', icon: 'robot' },
    { id: 'strategy', name: 'Stratégie business', icon: 'chess' }
  ];

  const agents = [
    { id: 'KarineAI', name: 'KarineAI', desc: 'Stratégie & Organisation', icon: 'bullseye', color: '#ec4899' },
    { id: 'HugoAI', name: 'HugoAI', desc: 'Développement & Tech', icon: 'code', color: '#3b82f6' },
    { id: 'JPBot', name: 'JPBot', desc: 'Analyse & Data', icon: 'chart-line', color: '#6366f1' },
    { id: 'ElodieAI', name: 'ÉlodieAI', desc: 'Contenu & Créatif', icon: 'pen-fancy', color: '#8b5cf6' },
    { id: 'ClaraLaCloseuse', name: 'Clara', desc: 'Conversion & Vente', icon: 'dollar-sign', color: '#f59e0b' },
    { id: 'FauconLeMaitreFocus', name: 'Faucon', desc: 'Focus & Simplicité', icon: 'eye', color: '#6b7280' }
  ];

  const handleArrayToggle = (field: keyof Pick<OnboardingData, 'goals' | 'preferredAgents'>, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return data.industry && data.company && data.role;
      case 2:
        return data.experience;
      case 3:
        return data.goals.length > 0;
      case 4:
        return data.preferredAgents.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Sauvegarder les données d'onboarding
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Marquer l'onboarding comme terminé
        localStorage.setItem('beriox_onboarding_completed', 'true');
        
        // Rediriger vers l'accueil
        router.push('/?welcome=true');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur onboarding:', error);
      // Continuer quand même vers l'accueil
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e3e8ee',
          borderTop: '4px solid #635bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header avec progression */}
        <div style={{
          background: 'linear-gradient(135deg, #635bff, #3b82f6)',
          color: 'white',
          padding: '32px 32px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FontAwesomeIcon icon="rocket" style={{ fontSize: '28px' }} />
          </div>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            Bienvenue sur Beriox AI !
          </h1>
          
          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            margin: '0 0 24px 0'
          }}>
            Quelques questions pour personnaliser votre expérience
          </p>

          {/* Barre de progression */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'white',
              height: '100%',
              width: `${(currentStep / totalSteps) * 100}%`,
              borderRadius: '20px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          <div style={{
            fontSize: '14px',
            opacity: 0.8,
            marginTop: '8px'
          }}>
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>

        {/* Contenu des étapes */}
        <div style={{ padding: '32px' }}>
          
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Parlez-nous de vous
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Secteur d'activité */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    marginBottom: '12px'
                  }}>
                    Dans quel secteur travaillez-vous ?
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '8px'
                  }}>
                    {industries.map(industry => (
                      <button
                        key={industry.id}
                        onClick={() => setData({...data, industry: industry.id})}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: data.industry === industry.id ? '#635bff' : 'white',
                          color: data.industry === industry.id ? 'white' : '#6b7280',
                          border: `1px solid ${data.industry === industry.id ? '#635bff' : '#e3e8ee'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FontAwesomeIcon icon={industry.icon as any} style={{ fontSize: '16px' }} />
                        {industry.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entreprise */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    marginBottom: '8px'
                  }}>
                    Nom de votre entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => setData({...data, company: e.target.value})}
                    placeholder="Ex: Ma Super Entreprise Inc."
                    style={{
                      width: &apos;100%&apos;,
                      padding: &apos;12px 16px&apos;,
                      border: &apos;1px solid #e3e8ee&apos;,
                      borderRadius: &apos;8px&apos;,
                      fontSize: &apos;14px&apos;,
                      outline: &apos;none&apos;,
                      transition: &apos;border-color 0.2s&apos;
                    }}
                    onFocus={(e) => e.target.style.borderColor = &apos;#635bff&apos;}
                    onBlur={(e) => e.target.style.borderColor = &apos;#e3e8ee&apos;}
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    marginBottom: '8px'
                  }}>
                    Votre rôle/fonction
                  </label>
                  <input
                    type="text"
                    value={data.role}
                    onChange={(e) => setData({...data, role: e.target.value})}
                    placeholder="Ex: Directeur marketing, Développeur web, Entrepreneur..."
                    style={{
                      width: &apos;100%&apos;,
                      padding: &apos;12px 16px&apos;,
                      border: &apos;1px solid #e3e8ee&apos;,
                      borderRadius: &apos;8px&apos;,
                      fontSize: &apos;14px&apos;,
                      outline: &apos;none&apos;,
                      transition: &apos;border-color 0.2s&apos;
                    }}
                    onFocus={(e) => e.target.style.borderColor = &apos;#635bff&apos;}
                    onBlur={(e) => e.target.style.borderColor = &apos;#e3e8ee&apos;}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Expérience */}
          {currentStep === 2 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                Quel est votre niveau d&apos;expérience ?
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                Cela nous aide à adapter nos conseils à votre niveau
              </p>

              <div style={{ display: 'grid', gap: '12px' }}>
                {experiences.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setData({...data, experience: exp.id})}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: data.experience === exp.id ? '#635bff' : 'white',
                      color: data.experience === exp.id ? 'white' : '#374151',
                      border: `1px solid ${data.experience === exp.id ? '#635bff' : '#e3e8ee'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {exp.name}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      opacity: 0.8
                    }}>
                      {exp.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 3: Objectifs */}
          {currentStep === 3 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                Quels sont vos objectifs principaux ?
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                Sélectionnez tout ce qui vous intéresse (plusieurs choix possibles)
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                {availableGoals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleArrayToggle('goals', goal.id)}
                    style={{
                      padding: '16px 12px',
                      backgroundColor: data.goals.includes(goal.id) ? '#10b981' : 'white',
                      color: data.goals.includes(goal.id) ? 'white' : '#374151',
                      border: `1px solid ${data.goals.includes(goal.id) ? '#10b981' : '#e3e8ee'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FontAwesomeIcon icon={goal.icon as any} style={{ fontSize: '20px' }} />
                    {goal.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 4: Agents préférés */}
          {currentStep === 4 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                Choisissez vos agents IA préférés
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                Ces agents seront activés par défaut pour vos missions
              </p>

              <div style={{ display: 'grid', gap: '12px' }}>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleArrayToggle('preferredAgents', agent.id)}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: data.preferredAgents.includes(agent.id) ? `${agent.color}15` : 'white',
                      color: data.preferredAgents.includes(agent.id) ? agent.color : '#374151',
                      border: `1px solid ${data.preferredAgents.includes(agent.id) ? agent.color : '#e3e8ee'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: data.preferredAgents.includes(agent.id) ? agent.color : '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon 
                        icon={agent.icon as any} 
                        style={{ 
                          color: data.preferredAgents.includes(agent.id) ? 'white' : '#6b7280',
                          fontSize: '18px'
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '2px'
                      }}>
                        {agent.name}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        opacity: 0.8
                      }}>
                        {agent.desc}
                      </div>
                    </div>
                    {data.preferredAgents.includes(agent.id) && (
                      <FontAwesomeIcon 
                        icon="check-circle" 
                        style={{ 
                          color: agent.color,
                          fontSize: '20px'
                        }} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer avec boutons */}
        <div style={{
          padding: '24px 32px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e3e8ee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: currentStep === 1 ? '#9ca3af' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FontAwesomeIcon icon="arrow-left" />
            Précédent
          </button>

          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i + 1 <= currentStep ? '#635bff' : '#d1d5db',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: canProceedToNext() ? '#635bff' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: canProceedToNext() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Finalisation...
              </>
            ) : currentStep === totalSteps ? (
              <>
                Terminer
                <FontAwesomeIcon icon="check" />
              </>
            ) : (
              <>
                Suivant
                <FontAwesomeIcon icon="arrow-right" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
