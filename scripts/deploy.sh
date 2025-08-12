#!/bin/bash

# 🚀 Script de Déploiement Rapide Beriox AI
# Détection d'erreurs et monitoring en temps réel

set -e  # Arrêter sur la première erreur

# Configuration
PROJECT_NAME="beriox-ai"
DEPLOYMENT_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_INTERVAL=10  # 10 secondes
MAX_HEALTH_CHECK_ATTEMPTS=30  # 5 minutes max

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
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

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI n'est pas installé, installation..."
        npm install -g vercel
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Vérification de l'état du repository
check_repository_status() {
    log_info "Vérification de l'état du repository..."
    
    # Vérifier s'il y a des changements non commités
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Il y a des changements non commités"
        read -p "Voulez-vous les commiter avant le déploiement? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "🚀 Auto-commit avant déploiement - $(date)"
        else
            log_error "Déploiement annulé - changements non commités"
            exit 1
        fi
    fi
    
    # Vérifier s'il y a des commits non poussés
    if [[ -n $(git log --oneline origin/main..HEAD) ]]; then
        log_info "Poussage des commits vers GitHub..."
        git push origin main
    fi
    
    log_success "Repository à jour"
}

# Tests pré-déploiement
run_pre_deployment_tests() {
    log_info "Exécution des tests pré-déploiement..."
    
    # Tests unitaires
    log_info "Tests unitaires..."
    if ! npm run test:coverage; then
        log_error "Tests unitaires échoués"
        exit 1
    fi
    
    # Linting
    log_info "Vérification du code..."
    if ! npm run lint; then
        log_error "Linting échoué"
        exit 1
    fi
    
    # Build test
    log_info "Test de build..."
    if ! npm run build; then
        log_error "Build échoué"
        exit 1
    fi
    
    log_success "Tous les tests pré-déploiement sont passés"
}

# Déploiement
deploy() {
    log_info "Démarrage du déploiement..."
    
    # Déploiement sur Vercel
    log_info "Déploiement sur Vercel..."
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [[ -z "$DEPLOYMENT_URL" ]]; then
        log_error "Échec du déploiement - URL non trouvée"
        exit 1
    fi
    
    log_success "Déploiement terminé: $DEPLOYMENT_URL"
    echo "$DEPLOYMENT_URL" > .deployment_url
    
    # Attendre que le déploiement soit actif
    log_info "Attente de l'activation du déploiement..."
    sleep 30
}

# Vérification de santé
health_check() {
    local url=$1
    local attempt=1
    
    log_info "Vérification de santé du déploiement..."
    
    while [[ $attempt -le $MAX_HEALTH_CHECK_ATTEMPTS ]]; do
        log_info "Tentative $attempt/$MAX_HEALTH_CHECK_ATTEMPTS..."
        
        # Vérification de base
        if curl -f -s "$url/api/health" > /dev/null; then
            log_success "Health check réussi"
            return 0
        fi
        
        # Vérification détaillée si la base échoue
        if curl -f -s "$url/api/health/advanced" > /dev/null; then
            log_success "Health check avancé réussi"
            return 0
        fi
        
        log_warning "Health check échoué, nouvelle tentative dans $HEALTH_CHECK_INTERVAL secondes..."
        sleep $HEALTH_CHECK_INTERVAL
        ((attempt++))
    done
    
    log_error "Health check échoué après $MAX_HEALTH_CHECK_ATTEMPTS tentatives"
    return 1
}

# Tests post-déploiement
run_post_deployment_tests() {
    local url=$1
    
    log_info "Exécution des tests post-déploiement..."
    
    # Tests de fumée
    log_info "Tests de fumée..."
    if ! curl -f -s "$url" > /dev/null; then
        log_error "Test de fumée échoué - page d'accueil inaccessible"
        return 1
    fi
    
    # Tests d'API
    log_info "Tests d'API..."
    if ! curl -f -s "$url/api/health" > /dev/null; then
        log_error "Test d'API échoué - endpoint health inaccessible"
        return 1
    fi
    
    # Tests de performance
    log_info "Tests de performance..."
    local response_time=$(curl -w "%{time_total}" -o /dev/null -s "$url/api/health")
    if (( $(echo "$response_time > 5" | bc -l) )); then
        log_warning "Temps de réponse élevé: ${response_time}s"
    else
        log_success "Temps de réponse acceptable: ${response_time}s"
    fi
    
    log_success "Tous les tests post-déploiement sont passés"
    return 0
}

# Monitoring en temps réel
start_monitoring() {
    local url=$1
    
    log_info "Démarrage du monitoring en temps réel..."
    
    # Monitoring pendant 5 minutes
    local monitoring_duration=300
    local start_time=$(date +%s)
    
    while [[ $(($(date +%s) - start_time)) -lt $monitoring_duration ]]; do
        local current_time=$(date '+%H:%M:%S')
        
        # Vérification de santé
        if curl -f -s "$url/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}[$current_time] ✅ Service opérationnel${NC}"
        else
            echo -e "${RED}[$current_time] ❌ Service défaillant${NC}"
        fi
        
        # Vérification des performances
        local response_time=$(curl -w "%{time_total}" -o /dev/null -s "$url/api/health" 2>/dev/null || echo "0")
        if (( $(echo "$response_time > 2" | bc -l 2>/dev/null || echo "0") )); then
            echo -e "${YELLOW}[$current_time] ⚠️  Temps de réponse: ${response_time}s${NC}"
        fi
        
        sleep 30
    done
    
    log_success "Monitoring terminé"
}

# Nettoyage
cleanup() {
    log_info "Nettoyage..."
    
    # Supprimer le fichier temporaire
    if [[ -f .deployment_url ]]; then
        rm .deployment_url
    fi
    
    log_success "Nettoyage terminé"
}

# Gestion des erreurs
error_handler() {
    local exit_code=$?
    log_error "Erreur détectée (code: $exit_code)"
    
    # Tentative de rollback si nécessaire
    if [[ -f .deployment_url ]]; then
        local deployment_url=$(cat .deployment_url)
        log_warning "Tentative de rollback vers la version précédente..."
        # Ici vous pouvez ajouter la logique de rollback
    fi
    
    cleanup
    exit $exit_code
}

# Configuration des gestionnaires d'erreurs
trap error_handler ERR
trap cleanup EXIT

# Fonction principale
main() {
    log_info "🚀 Démarrage du déploiement Beriox AI"
    
    # Vérifications préliminaires
    check_prerequisites
    check_repository_status
    
    # Tests pré-déploiement
    run_pre_deployment_tests
    
    # Déploiement
    deploy
    
    # Récupération de l'URL de déploiement
    if [[ ! -f .deployment_url ]]; then
        log_error "URL de déploiement non trouvée"
        exit 1
    fi
    
    local deployment_url=$(cat .deployment_url)
    
    # Vérification de santé
    if ! health_check "$deployment_url"; then
        log_error "Le déploiement n'est pas en bonne santé"
        exit 1
    fi
    
    # Tests post-déploiement
    if ! run_post_deployment_tests "$deployment_url"; then
        log_error "Les tests post-déploiement ont échoué"
        exit 1
    fi
    
    # Monitoring
    start_monitoring "$deployment_url"
    
    log_success "🎉 Déploiement réussi!"
    log_info "URL: $deployment_url"
    log_info "Health check: $deployment_url/api/health"
    log_info "Monitoring: $deployment_url/api/monitoring/health"
}

# Exécution du script
main "$@"
