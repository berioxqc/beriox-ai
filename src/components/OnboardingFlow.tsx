"use client";

import { useEffect, useState, ReactNode } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import {
  faChevronLeft,
  faChevronRight,
  faTimes,
  faCheck,
  faPlay,
  faPause,
  faLightbulb,
  faUser,
  faCog,
  faRocket,
  faEye,
  faLink,
  faCreditCard,
  faTrophy
} from 'apos;@fortawesome/free-solid-svg-icons'apos;;
import {
  OnboardingProgress,
  OnboardingStep,
  OnboardingStepType
} from 'apos;@/lib/onboarding'apos;;

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

interface OnboardingState {
  progress: OnboardingProgress | null;
  currentStep: OnboardingStep | null;
  loading: boolean;
  error: string | null;
  stepData: Record<string, any>;
}

export default function OnboardingFlow({ onComplete, onSkip, className = 'apos;'apos; }: OnboardingFlowProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<OnboardingState>({
    progress: null,
    currentStep: null,
    loading: true,
    error: null,
    stepData: {}
  });

  // Charger le progrès d'apos;onboarding
  const loadProgress = async () => {
    if (!session?.user?.id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('apos;/api/onboarding?action=progress'apos;);
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          progress: data.progress,
          currentStep: data.currentStep,
          loading: false
        }));
      } else {
        // Si pas de progrès, démarrer l'apos;onboarding
        await startOnboarding();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'apos;Erreur lors du chargement de l\'apos;onboarding'apos;
      }));
    }
  };

  // Démarrer l'apos;onboarding
  const startOnboarding = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('apos;/api/onboarding?action=start'apos;, {
        method: 'apos;POST'apos;
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          progress: data.progress,
          currentStep: data.currentStep,
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'apos;Erreur lors du démarrage de l\'apos;onboarding'apos;
      }));
    }
  };

  // Passer à l'apos;étape suivante
  const nextStep = async (stepData?: Record<string, any>) => {
    if (!session?.user?.id || !state.currentStep) return;

    try {
      const response = await fetch('apos;/api/onboarding?action=next'apos;, {
        method: 'apos;PUT'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify({ stepData })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.nextStep) {
          setState(prev => ({
            ...prev,
            progress: data.progress,
            currentStep: data.nextStep
          }));
        } else {
          // Onboarding terminé
          if (onComplete) {
            onComplete();
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'apos;Erreur lors du passage à l\'apos;étape suivante'apos;
      }));
    }
  };

  // Passer une étape
  const skipStep = async () => {
    if (!session?.user?.id || !state.currentStep) return;

    try {
      const response = await fetch('apos;/api/onboarding?action=skip'apos;, {
        method: 'apos;PUT'apos;
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.nextStep) {
          setState(prev => ({
            ...prev,
            progress: data.progress,
            currentStep: data.nextStep
          }));
        } else {
          // Onboarding terminé
          if (onComplete) {
            onComplete();
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'apos;Erreur lors du passage de l\'apos;étape'apos;
      }));
    }
  };

  // Valider une étape
  const validateStep = async (stepData: any): Promise<boolean> => {
    if (!session?.user?.id || !state.currentStep) return false;

    try {
      const response = await fetch('apos;/api/onboarding?action=validate'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify({ stepData })
      });

      if (response.ok) {
        const data = await response.json();
        return data.isValid;
      }
    } catch (error) {
      console.error('apos;Validation error:'apos;, error);
    }

    return false;
  };

  // Mettre à jour les données d'apos;étape
  const updateStepData = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      stepData: { ...prev.stepData, [key]: value }
    }));
  };

  // Charger le progrès au montage
  useEffect(() => {
    loadProgress();
  }, [session?.user?.id]);

  if (!session?.user?.id) {
    return null;
  }

  if (state.loading) {
    return (
      <div className={`onboarding-loading ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'apos;onboarding...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`onboarding-error ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={loadProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.currentStep) {
    return null;
  }

  return (
    <div className={`onboarding-flow ${className}`}>
      {/* Header avec progrès */}
      <div className="onboarding-header bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-gray-600"
                title="Passer l'apos;onboarding"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {state.currentStep.title}
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Étape {state.progress?.completedSteps.length || 0} sur 8
            </div>
          </div>
          
          {/* Barre de progrès */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress?.completionRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="onboarding-content flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {state.currentStep.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {state.currentStep.description}
                </p>

                {/* Composant spécifique à l'apos;étape */}
                <OnboardingStepComponent
                  step={state.currentStep}
                  stepData={state.stepData}
                  onUpdateData={updateStepData}
                  onNext={nextStep}
                  onSkip={skipStep}
                  onValidate={validateStep}
                />
              </div>
            </div>

            {/* Sidebar avec conseils */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Conseils</h3>
                </div>
                
                {state.currentStep.config.hints && (
                  <ul className="space-y-3">
                    {state.currentStep.config.hints.map((hint, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Temps estimé */}
                <div className="mt-6 pt-4 border-t border-blue-200">
                  <div className="flex items-center text-sm text-blue-700">
                    <FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-2" />
                    Temps estimé : {Math.round(state.currentStep.estimatedTime / 60)} min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour les étapes spécifiques
interface OnboardingStepComponentProps {
  step: OnboardingStep;
  stepData: Record<string, any>;
  onUpdateData: (key: string, value: any) => void;
  onNext: (stepData?: Record<string, any>) => void;
  onSkip: () => void;
  onValidate: (stepData: any) => Promise<boolean>;
}

function OnboardingStepComponent({
  step,
  stepData,
  onUpdateData,
  onNext,
  onSkip,
  onValidate
}: OnboardingStepComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await onValidate(stepData);
      if (isValid) {
        onNext(stepData);
      } else {
        setError(step.config.errorMessage || 'apos;Veuillez corriger les erreurs avant de continuer'apos;);
      }
    } catch (error) {
      setError('apos;Erreur lors de la validation'apos;);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (step.isSkippable) {
      onSkip();
    }
  };

  // Rendu selon le type d'apos;étape
  switch (step.type) {
    case OnboardingStepType.WELCOME:
      return <WelcomeStep step={step} onNext={handleNext} loading={loading} />;

    case OnboardingStepType.PROFILE_SETUP:
      return (
        <ProfileSetupStep
          step={step}
          stepData={stepData}
          onUpdateData={onUpdateData}
          onNext={handleNext}
          onSkip={handleSkip}
          loading={loading}
          error={error}
        />
      );

    case OnboardingStepType.PREFERENCES:
      return (
        <PreferencesStep
          step={step}
          stepData={stepData}
          onUpdateData={onUpdateData}
          onNext={handleNext}
          onSkip={handleSkip}
          loading={loading}
        />
      );

    case OnboardingStepType.FIRST_MISSION:
      return (
        <FirstMissionStep
          step={step}
          onNext={handleNext}
          loading={loading}
        />
      );

    case OnboardingStepType.FEATURES_TOUR:
      return (
        <FeaturesTourStep
          step={step}
          onNext={handleNext}
          onSkip={handleSkip}
          loading={loading}
        />
      );

    case OnboardingStepType.INTEGRATIONS:
      return (
        <IntegrationsStep
          step={step}
          stepData={stepData}
          onUpdateData={onUpdateData}
          onNext={handleNext}
          onSkip={handleSkip}
          loading={loading}
        />
      );

    case OnboardingStepType.BILLING:
      return (
        <BillingStep
          step={step}
          onNext={handleNext}
          onSkip={handleSkip}
          loading={loading}
        />
      );

    case OnboardingStepType.COMPLETION:
      return (
        <CompletionStep
          step={step}
          onNext={handleNext}
          loading={loading}
        />
      );

    default:
      return <div>Étape non reconnue</div>;
  }
}

// Composants pour chaque type d'apos;étape
function WelcomeStep({ step, onNext, loading }: any) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🚀</div>
      <p className="text-lg text-gray-600 mb-8">
        Bienvenue dans votre voyage avec Beriox AI !
      </p>
      <button
        onClick={onNext}
        disabled={loading}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'apos;Chargement...'apos; : 'apos;Commencer'apos;}
      </button>
    </div>
  );
}

function ProfileSetupStep({ step, stepData, onUpdateData, onNext, onSkip, loading, error }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            value={stepData.name || 'apos;'apos;}
            onChange={(e) => onUpdateData('apos;name'apos;, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Votre nom complet"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entreprise *
          </label>
          <input
            type="text"
            value={stepData.company || 'apos;'apos;}
            onChange={(e) => onUpdateData('apos;company'apos;, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nom de votre entreprise"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poste *
          </label>
          <input
            type="text"
            value={stepData.role || 'apos;'apos;}
            onChange={(e) => onUpdateData('apos;role'apos;, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Votre poste"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industrie
          </label>
          <select
            value={stepData.industry || 'apos;'apos;}
            onChange={(e) => onUpdateData('apos;industry'apos;, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionnez une industrie</option>
            <option value="tech">Technologie</option>
            <option value="ecommerce">E-commerce</option>
            <option value="marketing">Marketing</option>
            <option value="consulting">Conseil</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Compléter plus tard
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'apos;Sauvegarde...'apos; : 'apos;Sauvegarder et continuer'apos;}
        </button>
      </div>
    </div>
  );
}

function PreferencesStep({ step, stepData, onUpdateData, onNext, onSkip, loading }: any) {
  const categories = ['apos;seo'apos;, 'apos;content'apos;, 'apos;analytics'apos;, 'apos;competitors'apos;, 'apos;social'apos;];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sélectionnez vos domaines d'apos;intérêt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <label key={category} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.categories?.includes(category) || false}
                onChange={(e) => {
                  const current = stepData.categories || [];
                  const updated = e.target.checked
                    ? [...current, category]
                    : current.filter((c: string) => c !== category);
                  onUpdateData('apos;categories'apos;, updated);
                }}
                className="mr-3"
              />
              <span className="capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Passer cette étape
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'apos;Sauvegarde...'apos; : 'apos;Sauvegarder les préférences'apos;}
        </button>
      </div>
    </div>
  );
}

function FirstMissionStep({ step, onNext, loading }: any) {
  return (
    <div className="text-center space-y-6">
      <div className="text-4xl">🎯</div>
      <h3 className="text-xl font-semibold text-gray-900">
        Créez votre première mission IA
      </h3>
      <p className="text-gray-600">
        Lancez votre première mission pour voir Beriox AI en action !
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {['apos;seo_audit'apos;, 'apos;content_analysis'apos;, 'apos;competitor_research'apos;].map((template) => (
          <div key={template} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <div className="text-2xl mb-2">
              {template === 'apos;seo_audit'apos; ? 'apos;🔍'apos; : template === 'apos;content_analysis'apos; ? 'apos;📝'apos; : 'apos;📊'apos;}
            </div>
            <h4 className="font-medium text-gray-900 capitalize">
              {template.replace('apos;_'apos;, 'apos; 'apos;)}
            </h4>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={loading}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'apos;Création...'apos; : 'apos;Créer ma première mission'apos;}
      </button>
    </div>
  );
}

function FeaturesTourStep({ step, onNext, onSkip, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Découvrez les fonctionnalités
        </h3>
        <p className="text-gray-600">
          Explorez les principales fonctionnalités de Beriox AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['apos;dashboard'apos;, 'apos;missions'apos;, 'apos;analytics'apos;, 'apos;integrations'apos;].map((feature) => (
          <div key={feature} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-2xl mr-3">
                {feature === 'apos;dashboard'apos; ? 'apos;📊'apos; : feature === 'apos;missions'apos; ? 'apos;🎯'apos; : feature === 'apos;analytics'apos; ? 'apos;📈'apos; : 'apos;🔗'apos;}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 capitalize">{feature}</h4>
                <p className="text-sm text-gray-600">
                  {feature === 'apos;dashboard'apos; ? 'apos;Vue d\'apos;ensemble de vos données'apos; :
                   feature === 'apos;missions'apos; ? 'apos;Gérez vos missions IA'apos; :
                   feature === 'apos;analytics'apos; ? 'apos;Analysez vos performances'apos; : 'apos;Connectez vos outils'apos;}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Passer le tour
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'apos;Terminaison...'apos; : 'apos;Terminer le tour'apos;}
        </button>
      </div>
    </div>
  );
}

function IntegrationsStep({ step, stepData, onUpdateData, onNext, onSkip, loading }: any) {
  const integrations = [
    { id: 'apos;google_analytics'apos;, name: 'apos;Google Analytics'apos;, icon: 'apos;📊'apos; },
    { id: 'apos;google_search_console'apos;, name: 'apos;Google Search Console'apos;, icon: 'apos;🔍'apos; },
    { id: 'apos;semrush'apos;, name: 'apos;SEMrush'apos;, icon: 'apos;📈'apos; },
    { id: 'apos;slack'apos;, name: 'apos;Slack'apos;, icon: 'apos;💬'apos; }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Connectez vos outils
        </h3>
        <p className="text-gray-600">
          Intégrez vos outils existants pour une expérience optimale
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <label key={integration.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={stepData.integrations?.includes(integration.id) || false}
              onChange={(e) => {
                const current = stepData.integrations || [];
                const updated = e.target.checked
                  ? [...current, integration.id]
                  : current.filter((i: string) => i !== integration.id);
                onUpdateData('apos;integrations'apos;, updated);
              }}
              className="mr-3"
            />
            <div className="flex items-center">
              <span className="text-2xl mr-3">{integration.icon}</span>
              <span>{integration.name}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Plus tard
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'apos;Connexion...'apos; : 'apos;Connecter mes outils'apos;}
        </button>
      </div>
    </div>
  );
}

function BillingStep({ step, onNext, onSkip, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Configurez votre facturation
        </h3>
        <p className="text-gray-600">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['apos;Starter'apos;, 'apos;Professional'apos;, 'apos;Enterprise'apos;].map((plan) => (
          <div key={plan} className="p-4 border border-gray-200 rounded-lg text-center">
            <h4 className="font-semibold text-gray-900 mb-2">{plan}</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {plan === 'apos;Starter'apos; ? 'apos;Gratuit'apos; : plan === 'apos;Professional'apos; ? 'apos;$29/mois'apos; : 'apos;Sur mesure'apos;}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {plan === 'apos;Starter'apos; ? 'apos;Pour commencer'apos; : 
               plan === 'apos;Professional'apos; ? 'apos;Pour les équipes'apos; : 'apos;Pour les entreprises'apos;}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Continuer l'apos;essai gratuit
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'apos;Configuration...'apos; : 'apos;Choisir un plan'apos;}
        </button>
      </div>
    </div>
  );
}

function CompletionStep({ step, onNext, loading }: any) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <h3 className="text-2xl font-bold text-gray-900">
        Félicitations !
      </h3>
      <p className="text-lg text-gray-600">
        Vous êtes prêt à utiliser Beriox AI au maximum de son potentiel.
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center text-green-600">
          <FontAwesomeIcon icon={faCheck} className="w-5 h-5 mr-2" />
          <span>Onboarding terminé avec succès !</span>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={loading}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'apos;Redirection...'apos; : 'apos;Aller au dashboard'apos;}
      </button>
    </div>
  );
}
