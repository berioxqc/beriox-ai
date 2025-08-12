"use client";
import { useState } from 'react';
import { Plan, PlanService } from '@/lib/plans';
import Icon from '@/components/ui/Icon';

interface PricingCardProps {
  plan: Plan;
  onSelect: (planId: string) => void;
  isPopular?: boolean;
}

export default function PricingCard({ plan, onSelect, isPopular = false }: PricingCardProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  
  const priceInfo = PlanService.formatPriceWithTaxes(plan);
  const taxes = PlanService.getCanadianTaxes(plan.price);
  
  const annualPrice = PlanService.getAnnualPrice(plan);
  const annualTaxes = PlanService.getCanadianTaxes(annualPrice / 12);
  
  const displayPrice = isAnnual ? annualPrice / 12 : plan.price;
  const displayTaxes = isAnnual ? annualTaxes : taxes;
  const displayTotal = displayPrice + displayTaxes.total;

  return (
    <div className={`
      relative bg-white rounded-2xl shadow-lg border-2 p-8 transition-all duration-300 hover:shadow-xl
      ${isPopular ? 'border-purple-500 scale-105' : 'border-gray-200 hover:border-purple-300'}
    `}>
      {/* Badge populaire */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
            ⭐ Le plus populaire
          </span>
        </div>
      )}

      {/* En-tête */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {plan.id === 'free' ? 'Parfait pour commencer' : 
           plan.id === 'starter' ? 'Pour les petites équipes' :
           plan.id === 'pro' ? 'Pour les professionnels' : 'Pour les grandes entreprises'}
        </p>
      </div>

      {/* Prix */}
      <div className="text-center mb-6">
        {plan.price === 0 ? (
          <div className="text-4xl font-bold text-gray-900">Gratuit</div>
        ) : (
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {displayPrice.toFixed(2)} $
              <span className="text-lg text-gray-500">/mois</span>
            </div>
            
            {/* Toggle annuel/mensuel */}
            <div className="flex items-center justify-center mt-4 space-x-4">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Annuel
                <span className="ml-1 text-xs text-green-600 font-semibold">(-17%)</span>
              </span>
            </div>

            {/* Prix annuel */}
            {isAnnual && (
              <div className="mt-2 text-sm text-gray-600">
                {annualPrice.toFixed(2)} $ facturés annuellement
              </div>
            )}
          </div>
        )}
      </div>

      {/* Taxes canadiennes */}
      {plan.price > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowTaxes(!showTaxes)}
            className="w-full text-left text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <Icon name="info-circle" size={16} className="inline mr-1" />
            {showTaxes ? 'Masquer' : 'Voir'} les taxes (TPS/TVQ)
          </button>
          
          {showTaxes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span>Prix de base:</span>
                <span>{displayPrice.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between mb-1 text-gray-600">
                <span>TPS (5%):</span>
                <span>{displayTaxes.tps.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>TVQ (9.975%):</span>
                <span>{displayTaxes.tvq.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total par mois:</span>
                <span>{displayTotal.toFixed(2)} $</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fonctionnalités */}
      <div className="mb-8">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Icon name="check" size={16} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bouton d'action */}
      <button
        onClick={() => onSelect(plan.id)}
        className={`
          w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200
          ${plan.price === 0 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg'
          }
        `}
      >
        {plan.price === 0 ? 'Commencer gratuitement' : 
         isAnnual ? `S'abonner annuellement` : 'Commencer l\'essai'}
      </button>

      {/* Note sur l'essai */}
      {plan.price > 0 && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Essai gratuit de 14 jours • Annulation à tout moment
        </p>
      )}
    </div>
  );
}
