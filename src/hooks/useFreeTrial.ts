"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MAX_FREE_TRIALS = 10;
const TRIAL_KEY = "beriox_free_trials";

export function useFreeTrial() {
  const { data: session } = useSession();
  const [trialsUsed, setTrialsUsed] = useState(0);
  const [hasTrialsLeft, setHasTrialsLeft] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    // Si l'apos;utilisateur est connecté, il n'apos;a pas de limite d'apos;essais
    if (session) {
      setHasTrialsLeft(true);
      setTrialsUsed(0);
      return;
    }

    // Récupérer le nombre d'apos;essais utilisés depuis localStorage
    const stored = localStorage.getItem(TRIAL_KEY);
    const used = stored ? parseInt(stored, 10) : 0;
    setTrialsUsed(used);
    setHasTrialsLeft(used < MAX_FREE_TRIALS);
  }, [session]);

  const useTrial = () => {
    if (session) {
      // Utilisateur connecté, pas de limite
      return true;
    }

    if (trialsUsed >= MAX_FREE_TRIALS) {
      setShowTrialModal(true);
      return false;
    }

    // Incrémenter le compteur d'apos;essais
    const newCount = trialsUsed + 1;
    setTrialsUsed(newCount);
    localStorage.setItem(TRIAL_KEY, newCount.toString());
    
    if (newCount >= MAX_FREE_TRIALS) {
      setHasTrialsLeft(false);
      // Montrer le modal après un court délai pour laisser l'apos;action se terminer
      setTimeout(() => setShowTrialModal(true), 1000);
    }

    return true;
  };

  const getTrialsLeft = () => {
    if (session) return Infinity;
    return Math.max(0, MAX_FREE_TRIALS - trialsUsed);
  };

  const resetTrials = () => {
    localStorage.removeItem(TRIAL_KEY);
    setTrialsUsed(0);
    setHasTrialsLeft(true);
    setShowTrialModal(false);
  };

  const closeTrialModal = () => {
    setShowTrialModal(false);
  };

  return {
    trialsUsed,
    trialsLeft: getTrialsLeft(),
    hasTrialsLeft,
    showTrialModal,
    useTrial,
    resetTrials,
    closeTrialModal,
    isAuthenticated: !!session
  };
}
