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
    industry: 'apos;'apos;,
    company: 'apos;'apos;,
    role: 'apos;'apos;,
    experience: 'apos;'apos;,
    goals: [],
    preferredAgents: []
  });

  const totalSteps = 4;

  // Redirection si pas connecté
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('apos;/auth/signin'apos;);
      return;
    }
  }, [session, status, router]);

  const industries = [
    { id: 'apos;tech'apos;, name: 'apos;Technologie'apos;, icon: 'apos;laptop-code'apos; },
    { id: 'apos;marketing'apos;, name: 'apos;Marketing/Publicité'apos;, icon: 'apos;bullhorn'apos; },
    { id: 'apos;ecommerce'apos;, name: 'apos;E-commerce'apos;, icon: 'apos;shopping-cart'apos; },
    { id: 'apos;consulting'apos;, name: 'apos;Conseil'apos;, icon: 'apos;handshake'apos; },
    { id: 'apos;education'apos;, name: 'apos;Éducation'apos;, icon: 'apos;graduation-cap'apos; },
    { id: 'apos;healthcare'apos;, name: 'apos;Santé'apos;, icon: 'apos;heartbeat'apos; },
    { id: 'apos;finance'apos;, name: 'apos;Finance'apos;, icon: 'apos;chart-line'apos; },
    { id: 'apos;other'apos;, name: 'apos;Autre'apos;, icon: 'apos;ellipsis-h'apos; }
  ];

  const experiences = [
    { id: 'apos;beginner'apos;, name: 'apos;Débutant'apos;, desc: 'apos;Nouveau dans le domaine'apos; },
    { id: 'apos;intermediate'apos;, name: 'apos;Intermédiaire'apos;, desc: 'apos;2-5 ans d\'apos;expérience'apos; },
    { id: 'apos;advanced'apos;, name: 'apos;Avancé'apos;, desc: 'apos;5+ ans d\'apos;expérience'apos; },
    { id: 'apos;expert'apos;, name: 'apos;Expert'apos;, desc: 'apos;10+ ans, je forme les autres'apos; }
  ];

  const availableGoals = [
    { id: 'apos;content'apos;, name: 'apos;Créer du contenu'apos;, icon: 'apos;pen-fancy'apos; },
    { id: 'apos;wordpress'apos;, name: 'apos;Gérer WordPress'apos;, icon: 'apos;wordpress'apos; },
    { id: 'apos;seo'apos;, name: 'apos;Améliorer le SEO'apos;, icon: 'apos;search'apos; },
    { id: 'apos;social'apos;, name: 'apos;Réseaux sociaux'apos;, icon: 'apos;share-alt'apos; },
    { id: 'apos;design'apos;, name: 'apos;Design & Créatif'apos;, icon: 'apos;palette'apos; },
    { id: 'apos;analytics'apos;, name: 'apos;Analyse & Data'apos;, icon: 'apos;chart-bar'apos; },
    { id: 'apos;automation'apos;, name: 'apos;Automatisation'apos;, icon: 'apos;robot'apos; },
    { id: 'apos;strategy'apos;, name: 'apos;Stratégie business'apos;, icon: 'apos;chess'apos; }
  ];

  const agents = [
    { id: 'apos;KarineAI'apos;, name: 'apos;KarineAI'apos;, desc: 'apos;Stratégie & Organisation'apos;, icon: 'apos;bullseye'apos;, color: 'apos;#ec4899'apos; },
    { id: 'apos;HugoAI'apos;, name: 'apos;HugoAI'apos;, desc: 'apos;Développement & Tech'apos;, icon: 'apos;code'apos;, color: 'apos;#3b82f6'apos; },
    { id: 'apos;JPBot'apos;, name: 'apos;JPBot'apos;, desc: 'apos;Analyse & Data'apos;, icon: 'apos;chart-line'apos;, color: 'apos;#6366f1'apos; },
    { id: 'apos;ElodieAI'apos;, name: 'apos;ÉlodieAI'apos;, desc: 'apos;Contenu & Créatif'apos;, icon: 'apos;pen-fancy'apos;, color: 'apos;#8b5cf6'apos; },
    { id: 'apos;ClaraLaCloseuse'apos;, name: 'apos;Clara'apos;, desc: 'apos;Conversion & Vente'apos;, icon: 'apos;dollar-sign'apos;, color: 'apos;#f59e0b'apos; },
    { id: 'apos;FauconLeMaitreFocus'apos;, name: 'apos;Faucon'apos;, desc: 'apos;Focus & Simplicité'apos;, icon: 'apos;eye'apos;, color: 'apos;#6b7280'apos; }
  ];

  const handleArrayToggle = (field: keyof Pick<OnboardingData, 'apos;goals'apos; | 'apos;preferredAgents'apos;>, value: string) => {
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
      // Sauvegarder les données d'apos;onboarding
      const response = await fetch('apos;/api/user/onboarding'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Marquer l'apos;onboarding comme terminé
        localStorage.setItem('apos;beriox_onboarding_completed'apos;, 'apos;true'apos;);
        
        // Rediriger vers l'apos;accueil
        router.push('apos;/?welcome=true'apos;);
      } else {
        throw new Error('apos;Erreur lors de la sauvegarde'apos;);
      }
    } catch (error) {
      console.error('apos;Erreur onboarding:'apos;, error);
      // Continuer quand même vers l'apos;accueil
      router.push('apos;/'apos;);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{
        minHeight: 'apos;100vh'apos;,
        display: 'apos;flex'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;center'apos;,
        backgroundColor: 'apos;#f8fafc'apos;
      }}>
        <div style={{
          width: 'apos;48px'apos;,
          height: 'apos;48px'apos;,
          border: 'apos;4px solid #e3e8ee'apos;,
          borderTop: 'apos;4px solid #635bff'apos;,
          borderRadius: 'apos;50%'apos;,
          animation: 'apos;spin 1s linear infinite'apos;
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'apos;100vh'apos;,
      backgroundColor: 'apos;#f8fafc'apos;,
      display: 'apos;flex'apos;,
      alignItems: 'apos;center'apos;,
      justifyContent: 'apos;center'apos;,
      padding: 'apos;20px'apos;
    }}>
      <div style={{
        maxWidth: 'apos;600px'apos;,
        width: 'apos;100%'apos;,
        backgroundColor: 'apos;white'apos;,
        borderRadius: 'apos;16px'apos;,
        boxShadow: 'apos;0 10px 25px rgba(0, 0, 0, 0.1)'apos;,
        overflow: 'apos;hidden'apos;
      }}>
        
        {/* Header avec progression */}
        <div style={{
          background: 'apos;linear-gradient(135deg, #635bff, #3b82f6)'apos;,
          color: 'apos;white'apos;,
          padding: 'apos;32px 32px 24px'apos;,
          textAlign: 'apos;center'apos;
        }}>
          <div style={{
            width: 'apos;64px'apos;,
            height: 'apos;64px'apos;,
            backgroundColor: 'apos;rgba(255, 255, 255, 0.2)'apos;,
            borderRadius: 'apos;50%'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            margin: 'apos;0 auto 16px'apos;
          }}>
            <FontAwesomeIcon icon="rocket" style={{ fontSize: 'apos;28px'apos; }} />
          </div>
          
          <h1 style={{
            fontSize: 'apos;24px'apos;,
            fontWeight: 'apos;700'apos;,
            margin: 'apos;0 0 8px 0'apos;
          }}>
            Bienvenue sur Beriox AI !
          </h1>
          
          <p style={{
            fontSize: 'apos;16px'apos;,
            opacity: 0.9,
            margin: 'apos;0 0 24px 0'apos;
          }}>
            Quelques questions pour personnaliser votre expérience
          </p>

          {/* Barre de progression */}
          <div style={{
            backgroundColor: 'apos;rgba(255, 255, 255, 0.2)'apos;,
            borderRadius: 'apos;20px'apos;,
            height: 'apos;8px'apos;,
            overflow: 'apos;hidden'apos;
          }}>
            <div style={{
              backgroundColor: 'apos;white'apos;,
              height: 'apos;100%'apos;,
              width: `${(currentStep / totalSteps) * 100}%`,
              borderRadius: 'apos;20px'apos;,
              transition: 'apos;width 0.3s ease'apos;
            }}></div>
          </div>
          
          <div style={{
            fontSize: 'apos;14px'apos;,
            opacity: 0.8,
            marginTop: 'apos;8px'apos;
          }}>
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>

        {/* Contenu des étapes */}
        <div style={{ padding: 'apos;32px'apos; }}>
          
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div>
              <h2 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                marginBottom: 'apos;24px'apos;,
                textAlign: 'apos;center'apos;
              }}>
                Parlez-nous de vous
              </h2>

              <div style={{ display: 'apos;grid'apos;, gap: 'apos;20px'apos; }}>
                {/* Secteur d'apos;activité */}
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    marginBottom: 'apos;12px'apos;
                  }}>
                    Dans quel secteur travaillez-vous ?
                  </label>
                  <div style={{
                    display: 'apos;grid'apos;,
                    gridTemplateColumns: 'apos;repeat(auto-fit, minmax(120px, 1fr))'apos;,
                    gap: 'apos;8px'apos;
                  }}>
                    {industries.map(industry => (
                      <button
                        key={industry.id}
                        onClick={() => setData({...data, industry: industry.id})}
                        style={{
                          padding: 'apos;12px 8px'apos;,
                          backgroundColor: data.industry === industry.id ? 'apos;#635bff'apos; : 'apos;white'apos;,
                          color: data.industry === industry.id ? 'apos;white'apos; : 'apos;#6b7280'apos;,
                          border: `1px solid ${data.industry === industry.id ? 'apos;#635bff'apos; : 'apos;#e3e8ee'apos;}`,
                          borderRadius: 'apos;8px'apos;,
                          cursor: 'apos;pointer'apos;,
                          fontSize: 'apos;12px'apos;,
                          fontWeight: 'apos;500'apos;,
                          textAlign: 'apos;center'apos;,
                          transition: 'apos;all 0.2s'apos;,
                          display: 'apos;flex'apos;,
                          flexDirection: 'apos;column'apos;,
                          alignItems: 'apos;center'apos;,
                          gap: 'apos;4px'apos;
                        }}
                      >
                        <FontAwesomeIcon icon={industry.icon as any} style={{ fontSize: 'apos;16px'apos; }} />
                        {industry.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entreprise */}
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Nom de votre entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => setData({...data, company: e.target.value})}
                    placeholder="Ex: Ma Super Entreprise Inc."
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px 16px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;8px'apos;,
                      fontSize: 'apos;14px'apos;,
                      outline: 'apos;none'apos;,
                      transition: 'apos;border-color 0.2s'apos;
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'apos;#635bff'apos;}
                    onBlur={(e) => e.target.style.borderColor = 'apos;#e3e8ee'apos;}
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label style={{
                    display: 'apos;block'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    marginBottom: 'apos;8px'apos;
                  }}>
                    Votre rôle/fonction
                  </label>
                  <input
                    type="text"
                    value={data.role}
                    onChange={(e) => setData({...data, role: e.target.value})}
                    placeholder="Ex: Directeur marketing, Développeur web, Entrepreneur..."
                    style={{
                      width: 'apos;100%'apos;,
                      padding: 'apos;12px 16px'apos;,
                      border: 'apos;1px solid #e3e8ee'apos;,
                      borderRadius: 'apos;8px'apos;,
                      fontSize: 'apos;14px'apos;,
                      outline: 'apos;none'apos;,
                      transition: 'apos;border-color 0.2s'apos;
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'apos;#635bff'apos;}
                    onBlur={(e) => e.target.style.borderColor = 'apos;#e3e8ee'apos;}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Expérience */}
          {currentStep === 2 && (
            <div>
              <h2 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                marginBottom: 'apos;8px'apos;,
                textAlign: 'apos;center'apos;
              }}>
                Quel est votre niveau d'apos;expérience ?
              </h2>
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: 'apos;#6b7280'apos;,
                textAlign: 'apos;center'apos;,
                marginBottom: 'apos;24px'apos;
              }}>
                Cela nous aide à adapter nos conseils à votre niveau
              </p>

              <div style={{ display: 'apos;grid'apos;, gap: 'apos;12px'apos; }}>
                {experiences.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setData({...data, experience: exp.id})}
                    style={{
                      padding: 'apos;16px 20px'apos;,
                      backgroundColor: data.experience === exp.id ? 'apos;#635bff'apos; : 'apos;white'apos;,
                      color: data.experience === exp.id ? 'apos;white'apos; : 'apos;#374151'apos;,
                      border: `1px solid ${data.experience === exp.id ? 'apos;#635bff'apos; : 'apos;#e3e8ee'apos;}`,
                      borderRadius: 'apos;12px'apos;,
                      cursor: 'apos;pointer'apos;,
                      textAlign: 'apos;left'apos;,
                      transition: 'apos;all 0.2s'apos;
                    }}
                  >
                    <div style={{
                      fontSize: 'apos;16px'apos;,
                      fontWeight: 'apos;600'apos;,
                      marginBottom: 'apos;4px'apos;
                    }}>
                      {exp.name}
                    </div>
                    <div style={{
                      fontSize: 'apos;13px'apos;,
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
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                marginBottom: 'apos;8px'apos;,
                textAlign: 'apos;center'apos;
              }}>
                Quels sont vos objectifs principaux ?
              </h2>
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: 'apos;#6b7280'apos;,
                textAlign: 'apos;center'apos;,
                marginBottom: 'apos;24px'apos;
              }}>
                Sélectionnez tout ce qui vous intéresse (plusieurs choix possibles)
              </p>

              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(140px, 1fr))'apos;,
                gap: 'apos;12px'apos;
              }}>
                {availableGoals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleArrayToggle('apos;goals'apos;, goal.id)}
                    style={{
                      padding: 'apos;16px 12px'apos;,
                      backgroundColor: data.goals.includes(goal.id) ? 'apos;#10b981'apos; : 'apos;white'apos;,
                      color: data.goals.includes(goal.id) ? 'apos;white'apos; : 'apos;#374151'apos;,
                      border: `1px solid ${data.goals.includes(goal.id) ? 'apos;#10b981'apos; : 'apos;#e3e8ee'apos;}`,
                      borderRadius: 'apos;12px'apos;,
                      cursor: 'apos;pointer'apos;,
                      fontSize: 'apos;13px'apos;,
                      fontWeight: 'apos;500'apos;,
                      textAlign: 'apos;center'apos;,
                      transition: 'apos;all 0.2s'apos;,
                      display: 'apos;flex'apos;,
                      flexDirection: 'apos;column'apos;,
                      alignItems: 'apos;center'apos;,
                      gap: 'apos;8px'apos;
                    }}
                  >
                    <FontAwesomeIcon icon={goal.icon as any} style={{ fontSize: 'apos;20px'apos; }} />
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
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                marginBottom: 'apos;8px'apos;,
                textAlign: 'apos;center'apos;
              }}>
                Choisissez vos agents IA préférés
              </h2>
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: 'apos;#6b7280'apos;,
                textAlign: 'apos;center'apos;,
                marginBottom: 'apos;24px'apos;
              }}>
                Ces agents seront activés par défaut pour vos missions
              </p>

              <div style={{ display: 'apos;grid'apos;, gap: 'apos;12px'apos; }}>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleArrayToggle('apos;preferredAgents'apos;, agent.id)}
                    style={{
                      padding: 'apos;16px 20px'apos;,
                      backgroundColor: data.preferredAgents.includes(agent.id) ? `${agent.color}15` : 'apos;white'apos;,
                      color: data.preferredAgents.includes(agent.id) ? agent.color : 'apos;#374151'apos;,
                      border: `1px solid ${data.preferredAgents.includes(agent.id) ? agent.color : 'apos;#e3e8ee'apos;}`,
                      borderRadius: 'apos;12px'apos;,
                      cursor: 'apos;pointer'apos;,
                      textAlign: 'apos;left'apos;,
                      transition: 'apos;all 0.2s'apos;,
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;center'apos;,
                      gap: 'apos;16px'apos;
                    }}
                  >
                    <div style={{
                      width: 'apos;40px'apos;,
                      height: 'apos;40px'apos;,
                      backgroundColor: data.preferredAgents.includes(agent.id) ? agent.color : 'apos;#f3f4f6'apos;,
                      borderRadius: 'apos;50%'apos;,
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;center'apos;,
                      justifyContent: 'apos;center'apos;,
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon 
                        icon={agent.icon as any} 
                        style={{ 
                          color: data.preferredAgents.includes(agent.id) ? 'apos;white'apos; : 'apos;#6b7280'apos;,
                          fontSize: 'apos;18px'apos;
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 'apos;16px'apos;,
                        fontWeight: 'apos;600'apos;,
                        marginBottom: 'apos;2px'apos;
                      }}>
                        {agent.name}
                      </div>
                      <div style={{
                        fontSize: 'apos;13px'apos;,
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
                          fontSize: 'apos;20px'apos;
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
          padding: 'apos;24px 32px'apos;,
          backgroundColor: 'apos;#f8fafc'apos;,
          borderTop: 'apos;1px solid #e3e8ee'apos;,
          display: 'apos;flex'apos;,
          justifyContent: 'apos;space-between'apos;,
          alignItems: 'apos;center'apos;
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              padding: 'apos;10px 16px'apos;,
              backgroundColor: 'apos;transparent'apos;,
              border: 'apos;1px solid #d1d5db'apos;,
              borderRadius: 'apos;8px'apos;,
              color: currentStep === 1 ? 'apos;#9ca3af'apos; : 'apos;#6b7280'apos;,
              fontSize: 'apos;14px'apos;,
              fontWeight: 'apos;500'apos;,
              cursor: currentStep === 1 ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
              transition: 'apos;all 0.2s'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;6px'apos;
            }}
          >
            <FontAwesomeIcon icon="arrow-left" />
            Précédent
          </button>

          <div style={{
            display: 'apos;flex'apos;,
            gap: 'apos;8px'apos;
          }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 'apos;8px'apos;,
                  height: 'apos;8px'apos;,
                  borderRadius: 'apos;50%'apos;,
                  backgroundColor: i + 1 <= currentStep ? 'apos;#635bff'apos; : 'apos;#d1d5db'apos;,
                  transition: 'apos;background-color 0.2s'apos;
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            style={{
              padding: 'apos;10px 20px'apos;,
              backgroundColor: canProceedToNext() ? 'apos;#635bff'apos; : 'apos;#9ca3af'apos;,
              border: 'apos;none'apos;,
              borderRadius: 'apos;8px'apos;,
              color: 'apos;white'apos;,
              fontSize: 'apos;14px'apos;,
              fontWeight: 'apos;600'apos;,
              cursor: canProceedToNext() ? 'apos;pointer'apos; : 'apos;not-allowed'apos;,
              transition: 'apos;all 0.2s'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: 'apos;16px'apos;,
                  height: 'apos;16px'apos;,
                  border: 'apos;2px solid rgba(255,255,255,0.3)'apos;,
                  borderTop: 'apos;2px solid white'apos;,
                  borderRadius: 'apos;50%'apos;,
                  animation: 'apos;spin 1s linear infinite'apos;
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
