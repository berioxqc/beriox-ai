"use client";
import React, { useState } from 'react';
import { Button, Input } from '@/design-system/components';
import { designTokens } from '@/design-system/tokens';

export interface MissionFormProps {
  onSubmit: (data: { prompt: string; details: string }) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const MissionForm: React.FC<MissionFormProps> = ({
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit({ prompt: prompt.trim(), details: details.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ marginBottom: designTokens.spacing[6] }}>
        <Input
          label="🎯 Objectif de votre mission"
          placeholder="Ex: Créer un article de blog sur les tendances marketing 2024"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          fullWidth
          required
          disabled={loading}
        />
      </div>

      <div style={{ marginBottom: designTokens.spacing[6] }}>
        <Input
          label="📝 Détails supplémentaires (optionnel)"
          placeholder="Contexte, contraintes, préférences..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          fullWidth
          disabled={loading}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: designTokens.spacing[4],
        justifyContent: 'flex-end',
      }}>
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={!prompt.trim()}
        >
          Créer la mission
        </Button>
      </div>
    </form>
  );
};

export default MissionForm;
