"use client";
import { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import Icon from '@/components/ui/Icon';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookiesPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Charger les préférences existantes
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setSaved(true);
    
    // Activer Google Analytics si accepté
    if (preferences.analytics) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    }
    
    setTimeout(() => setSaved(false), 3000);
  };

  const resetPreferences = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🍪 Gestion des cookies
          </h1>
          <p className="text-lg text-gray-600">
            Gérez vos préférences de cookies et contrôlez comment nous utilisons vos données.
          </p>
        </div>

        {/* Message de confirmation */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Icon name="check-circle" className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Vos préférences ont été enregistrées avec succès !
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Types de cookies
          </h2>

          <div className="space-y-6">
            {/* Cookies nécessaires */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies nécessaires</h3>
                  <p className="text-sm text-gray-600">
                    Ces cookies sont essentiels au fonctionnement du site web
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-500">Toujours actif</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Utilisation :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Maintenir votre session de connexion</li>
                  <li>Assurer la sécurité du site</li>
                  <li>Mémoriser vos préférences de base</li>
                  <li>Permettre la navigation entre les pages</li>
                </ul>
              </div>
            </div>

            {/* Cookies d'analyse */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies d'analyse</h3>
                  <p className="text-sm text-gray-600">
                    Nous aident à comprendre comment vous utilisez notre site
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Utilisation :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Analyser le trafic du site</li>
                  <li>Comprendre les pages les plus visitées</li>
                  <li>Mesurer les performances du site</li>
                  <li>Améliorer l'expérience utilisateur</li>
                </ul>
                <p className="mt-2 text-xs text-gray-400">
                  <strong>Services :</strong> Google Analytics, statistiques de visite
                </p>
              </div>
            </div>

            {/* Cookies marketing */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies marketing</h3>
                  <p className="text-sm text-gray-600">
                    Utilisés pour vous proposer des contenus personnalisés
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Utilisation :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Personnaliser les publicités</li>
                  <li>Suivre les conversions</li>
                  <li>Analyser l'efficacité des campagnes</li>
                  <li>Proposer du contenu pertinent</li>
                </ul>
                <p className="mt-2 text-xs text-gray-400">
                  <strong>Services :</strong> Publicités ciblées, réseaux sociaux
                </p>
              </div>
            </div>

            {/* Cookies de préférences */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de préférences</h3>
                  <p className="text-sm text-gray-600">
                    Mémorisent vos choix pour améliorer votre expérience
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferences: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Utilisation :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Mémoriser votre langue préférée</li>
                  <li>Sauvegarder vos paramètres d'affichage</li>
                  <li>Personnaliser l'interface</li>
                  <li>Rappeler vos préférences de contenu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={savePreferences}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enregistrer mes préférences
          </button>
          <button
            onClick={resetPreferences}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        {/* Informations légales */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations légales
          </h3>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Conformément à la <strong>Loi 25</strong> du Québec et au <strong>RGPD</strong> européen, 
              nous vous informons que :
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vous avez le droit de refuser les cookies non essentiels</li>
              <li>Vous pouvez modifier vos préférences à tout moment</li>
              <li>Vos données sont traitées de manière sécurisée</li>
              <li>Nous ne vendons jamais vos données personnelles</li>
            </ul>
            <p className="mt-4">
              Pour plus d'informations, consultez notre{' '}
              <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                Politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
