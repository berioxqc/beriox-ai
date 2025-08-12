#!/bin/bash

# 🚀 Script de Déploiement Ultra-Optimisé Beriox AI
# Détection d'erreurs précise et diagnostic intelligent

set -e  # Arrêter sur la première erreur
set -o pipefail  # Capturer les erreurs dans les pipes

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

# Fonctions utilitaires avancées
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

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}🔍 DEBUG: $1${NC}"
    fi
}

log_step() {
    echo -e "${BLUE}📋 ÉTAPE: $1${NC}"
}

log_diagnostic() {
    echo -e "${YELLOW}🔬 DIAGNOSTIC: $1${NC}"
}

log_fix() {
    echo -e "${GREEN}🔧 CORRECTION: $1${NC}"
}

# Vérification des prérequis avec diagnostic avancé
check_prerequisites() {
    log_step "Vérification des prérequis avec diagnostic avancé"
    
    local missing_tools=()
    local version_issues=()
    
    # Vérifier Node.js avec version
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    else
        local node_version=$(node --version)
        log_debug "Node.js version: $node_version"
        if [[ ! "$node_version" =~ ^v(18|20|21) ]]; then
            version_issues+=("Node.js $node_version (recommandé: v18, v20, ou v21)")
        fi
    fi
    
    # Vérifier npm avec version
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    else
        local npm_version=$(npm --version)
        log_debug "npm version: $npm_version"
        if [[ ! "$npm_version" =~ ^[89] ]]; then
            version_issues+=("npm $npm_version (recommandé: v8 ou v9)")
        fi
    fi
    
    # Vérifier Vercel CLI avec version
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI n'est pas installé, installation..."
        npm install -g vercel@latest
    else
        local vercel_version=$(vercel --version 2>/dev/null || echo "unknown")
        log_debug "Vercel CLI version: $vercel_version"
    fi
    
    # Vérifier Git avec version
    if ! command -v git &> /dev/null; then
        missing_tools+=("Git")
    else
        local git_version=$(git --version | cut -d' ' -f3)
        log_debug "Git version: $git_version"
    fi
    
    # Vérifier les variables d'environnement critiques
    local missing_env=()
    [[ -z "$VERCEL_TOKEN" ]] && missing_env+=("VERCEL_TOKEN")
    [[ -z "$VERCEL_ORG_ID" ]] && missing_env+=("VERCEL_ORG_ID")
    [[ -z "$VERCEL_PROJECT_ID" ]] && missing_env+=("VERCEL_PROJECT_ID")
    
    # Rapport de diagnostic
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Outils manquants: ${missing_tools[*]}"
        log_diagnostic "Installez les outils manquants avant de continuer"
        exit 1
    fi
    
    if [[ ${#version_issues[@]} -gt 0 ]]; then
        log_warning "Versions potentiellement problématiques:"
        for issue in "${version_issues[@]}"; do
            echo "  - $issue"
        done
    fi
    
    if [[ ${#missing_env[@]} -gt 0 ]]; then
        log_warning "Variables d'environnement manquantes: ${missing_env[*]}"
        log_diagnostic "Ces variables sont nécessaires pour le déploiement automatique"
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

# Tests pré-déploiement avec diagnostic détaillé
run_pre_deployment_tests() {
    log_step "Exécution des tests pré-déploiement avec diagnostic détaillé"
    
    local test_results=()
    local build_time_start
    local build_time_end
    
    # Vérification des dépendances
    log_info "Vérification des dépendances..."
    if ! npm ci --silent; then
        log_error "Installation des dépendances échouée"
        log_diagnostic "Problème possible: conflit de versions ou dépendances corrompues"
        log_fix "Essayez: rm -rf node_modules package-lock.json && npm install"
        exit 1
    fi
    
    # Tests unitaires avec capture d'erreurs détaillées
    log_info "Tests unitaires..."
    build_time_start=$(date +%s)
    if npm run test 2>&1 | tee test-output.log; then
        test_results+=("✅ Tests unitaires")
        log_debug "Tests unitaires réussis"
    else
        test_results+=("❌ Tests unitaires")
        log_error "Tests unitaires échoués"
        log_diagnostic "Consultez test-output.log pour les détails"
        
        # Analyse des erreurs de test
        if grep -q "Cannot read properties of undefined" test-output.log; then
            log_diagnostic "Erreur: Propriété undefined - problème de configuration Jest"
            log_fix "Vérifiez jest.config.js pour les options invalides"
        fi
        if grep -q "Module not found" test-output.log; then
            log_diagnostic "Erreur: Module non trouvé - problème d'import"
            log_fix "Vérifiez les imports et les alias de modules"
        fi
        if grep -q "SyntaxError" test-output.log; then
            log_diagnostic "Erreur: Syntaxe invalide - problème de code"
            log_fix "Vérifiez la syntaxe TypeScript/JavaScript"
        fi
        exit 1
    fi
    build_time_end=$(date +%s)
    log_debug "Temps des tests: $((build_time_end - build_time_start))s"
    
    # Linting avec capture d'erreurs
    log_info "Vérification du code..."
    if npm run lint 2>&1 | tee lint-output.log; then
        test_results+=("✅ Linting")
        log_debug "Linting réussi"
    else
        test_results+=("❌ Linting")
        log_error "Linting échoué"
        log_diagnostic "Consultez lint-output.log pour les détails"
        
        # Analyse des erreurs de linting
        if grep -q "unused variable" lint-output.log; then
            log_diagnostic "Erreur: Variables non utilisées"
            log_fix "Supprimez ou utilisez les variables non utilisées"
        fi
        if grep -q "missing semicolon" lint-output.log; then
            log_diagnostic "Erreur: Points-virgules manquants"
            log_fix "Ajoutez les points-virgules manquants"
        fi
        exit 1
    fi
    
    # Build test avec timing et diagnostic
    log_info "Test de build..."
    build_time_start=$(date +%s)
    if npm run build 2>&1 | tee build-output.log; then
        test_results+=("✅ Build")
        build_time_end=$(date +%s)
        log_debug "Temps de build: $((build_time_end - build_time_start))s"
        
        # Analyse de la taille du build
        local build_size=$(du -sh .next 2>/dev/null | cut -f1)
        log_debug "Taille du build: $build_size"
        
        if [[ $((build_time_end - build_time_start)) -gt 120 ]]; then
            log_warning "Build lent détecté (>2min)"
            log_diagnostic "Considérez optimiser les imports et réduire la taille des bundles"
        fi
    else
        test_results+=("❌ Build")
        build_time_end=$(date +%s)
        log_error "Build échoué après $((build_time_end - build_time_start))s"
        log_diagnostic "Consultez build-output.log pour les détails"
        
        # Analyse des erreurs de build
        if grep -q "Module not found" build-output.log; then
            log_diagnostic "Erreur: Module non trouvé lors du build"
            log_fix "Vérifiez les imports et les chemins de fichiers"
        fi
        if grep -q "Type error" build-output.log; then
            log_diagnostic "Erreur: Erreur de type TypeScript"
            log_fix "Corrigez les erreurs de type avant le build"
        fi
        if grep -q "Memory" build-output.log; then
            log_diagnostic "Erreur: Problème de mémoire"
            log_fix "Augmentez la mémoire Node.js: NODE_OPTIONS='--max-old-space-size=4096'"
        fi
        exit 1
    fi
    
    # Rapport final
    log_success "Résultats des tests pré-déploiement:"
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
}

# Déploiement avec diagnostic avancé
deploy() {
    log_step "Démarrage du déploiement avec diagnostic avancé"
    
    local deployment_start=$(date +%s)
    local deployment_log="deployment.log"
    
    # Capture complète du déploiement
    log_info "Déploiement sur Vercel..."
    if vercel --prod --yes 2>&1 | tee "$deployment_log"; then
        # Extraction de l'URL de déploiement
        DEPLOYMENT_URL=$(grep -o 'https://[^[:space:]]*' "$deployment_log" | head -1)
        
        if [[ -z "$DEPLOYMENT_URL" ]]; then
            log_error "Échec du déploiement - URL non trouvée"
            log_diagnostic "Consultez $deployment_log pour les détails"
            
            # Analyse des erreurs de déploiement
            if grep -q "Build failed" "$deployment_log"; then
                log_diagnostic "Erreur: Build échoué sur Vercel"
                log_fix "Vérifiez les logs de build dans le dashboard Vercel"
            fi
            if grep -q "Environment variables" "$deployment_log"; then
                log_diagnostic "Erreur: Variables d'environnement manquantes"
                log_fix "Configurez les variables d'environnement dans Vercel"
            fi
            if grep -q "Authentication" "$deployment_log"; then
                log_diagnostic "Erreur: Problème d'authentification Vercel"
                log_fix "Vérifiez votre token Vercel: vercel login"
            fi
            exit 1
        fi
        
        local deployment_end=$(date +%s)
        local deployment_time=$((deployment_end - deployment_start))
        
        log_success "Déploiement terminé en ${deployment_time}s: $DEPLOYMENT_URL"
        echo "$DEPLOYMENT_URL" > .deployment_url
        
        # Analyse des performances de déploiement
        if [[ $deployment_time -gt 300 ]]; then
            log_warning "Déploiement lent détecté (>5min)"
            log_diagnostic "Considérez optimiser la taille du bundle"
        fi
        
        # Attendre que le déploiement soit actif
        log_info "Attente de l'activation du déploiement..."
        sleep 30
    else
        log_error "Échec du déploiement Vercel"
        log_diagnostic "Consultez $deployment_log pour les détails"
        exit 1
    fi
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
