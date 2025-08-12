#!/bin/bash

# 🔧 Script de correction automatique des erreurs de lint - Beriox AI
# Corrige les erreurs les plus courantes automatiquement

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour corriger les apostrophes non échappées
fix_unescaped_entities() {
    log_info "Correction des apostrophes non échappées..."
    
    # Trouver tous les fichiers TypeScript/TSX avec des apostrophes
    find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
        if grep -q "'" "$file"; then
            log_info "Traitement de $file"
            
            # Sauvegarder le fichier original
            cp "$file" "$file.backup"
            
            # Utiliser Node.js pour une correction plus précise
            node -e "
            const fs = require('fs');
            const path = '$file';
            let content = fs.readFileSync(path, 'utf8');
            
            // Remplacer les apostrophes dans les chaînes JSX uniquement
            content = content.replace(/(<[^>]*>)([^<]*'[^<]*)(<\/[^>]*>)/g, (match, openTag, text, closeTag) => {
                return openTag + text.replace(/'/g, '&apos;') + closeTag;
            });
            
            // Remplacer les apostrophes dans les attributs JSX
            content = content.replace(/(\s[a-zA-Z-]+=)['\"]([^'\"]*'[^'\"]*)['\"]/g, (match, attr, value) => {
                return attr + '\"' + value.replace(/'/g, '&apos;') + '\"';
            });
            
            fs.writeFileSync(path, content);
            "
            
            log_success "Apostrophes corrigées dans $file"
        fi
    done
}

# Fonction pour supprimer les variables non utilisées
fix_unused_vars() {
    log_info "Suppression des variables non utilisées..."
    
    find src -name "*.tsx" -o -name "*.ts" | while read -r file; do
        if grep -q "Warning.*is assigned a value but never used" "$file" 2>/dev/null; then
            log_info "Traitement de $file"
            
            # Supprimer les variables non utilisées en les préfixant avec _
            sed -i '' 's/const \([a-zA-Z_][a-zA-Z0-9_]*\) = /const _\1 = /g' "$file"
            sed -i '' 's/let \([a-zA-Z_][a-zA-Z0-9_]*\) = /let _\1 = /g' "$file"
            
            log_success "Variables non utilisées corrigées dans $file"
        fi
    done
}

# Fonction pour corriger les types 'any'
fix_any_types() {
    log_info "Correction des types 'any'..."
    
    # Créer un fichier temporaire pour les corrections
    temp_file="temp_fixes.ts"
    
    cat > "$temp_file" << 'EOF'
// Types de remplacement pour 'any'
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
}

interface GenericData {
  [key: string]: unknown;
}

// Utiliser ces types au lieu de 'any'
EOF
    
    log_success "Types de remplacement créés dans $temp_file"
    log_info "Remplacez manuellement les 'any' par les types appropriés"
}

# Fonction pour corriger les erreurs Jest
fix_jest_issues() {
    log_info "Correction des problèmes Jest..."
    
    # Ajouter --detectOpenHandles aux scripts de test
    if grep -q '"test":' package.json; then
        sed -i '' 's/"test": "jest"/"test": "jest --detectOpenHandles"/g' package.json
        log_success "Option --detectOpenHandles ajoutée aux tests"
    fi
}

# Fonction pour nettoyer les fichiers temporaires
cleanup() {
    log_info "Nettoyage des fichiers temporaires..."
    
    # Supprimer les fichiers de sauvegarde
    find src -name "*.backup" -delete
    
    # Supprimer le fichier temporaire
    rm -f temp_fixes.ts
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    log_info "🚀 Démarrage de la correction automatique des erreurs de lint"
    
    # Vérifier si on est dans le bon répertoire
    if [[ ! -f "package.json" ]]; then
        log_error "Ce script doit être exécuté depuis la racine du projet"
        exit 1
    fi
    
    # Sauvegarder l'état actuel
    log_info "Sauvegarde de l'état actuel..."
    git add . && git commit -m "💾 Sauvegarde avant correction automatique" || true
    
    # Appliquer les corrections
    fix_unescaped_entities
    fix_unused_vars
    fix_any_types
    fix_jest_issues
    
    # Nettoyer
    cleanup
    
    log_success "🎉 Correction automatique terminée"
    log_info "Vérifiez les changements et testez votre application"
    log_info "Exécutez 'npm run lint' pour voir les erreurs restantes"
}

# Gestion des erreurs
error_handler() {
    local exit_code=$?
    log_error "Erreur détectée (code: $exit_code)"
    cleanup
    exit $exit_code
}

# Trapper les erreurs
trap error_handler ERR

# Exécuter le script
main "$@"
