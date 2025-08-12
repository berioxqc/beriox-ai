// 🔍 Bot de Vérification d'Intégrité des Fichiers - Beriox AI
// Détecte et corrige automatiquement les fichiers corrompus

import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'
export interface FileIntegrityIssue {
  filePath: string
  issueType: 'corrupted' | 'syntax_error' | 'missing_import' | 'invalid_encoding'
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  lineNumber?: number
  columnNumber?: number
  suggestedFix?: string
}

export interface FileIntegrityReport {
  totalFiles: number
  corruptedFiles: number
  issues: FileIntegrityIssue[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recommendations: string[]
}

export class FileIntegrityBot {
  private readonly srcDir = path.join(process.cwd(), 'src')
  private readonly fileExtensions = ['.ts', '.tsx', '.js', '.jsx']
  private readonly corruptedPatterns = [
    /'/g, // Apostrophes mal échappées
    /'/g, // Double échappement
    /import.*'/g, // Imports corrompus
    /from.*'/g, // From corrompus
  ]
  /**
   * Analyse l'intégrité de tous les fichiers du projet
   */
  async analyzeProjectIntegrity(): Promise<FileIntegrityReport> {
    logger.info('🔍 Démarrage de l\'analyse d\'intégrité des fichiers...')
    const issues: FileIntegrityIssue[] = []
    const files = this.getAllSourceFiles()
    for (const filePath of files) {
      const fileIssues = await this.analyzeFileIntegrity(filePath)
      issues.push(...fileIssues)
    }
    
    const report = this.generateReport(files.length, issues)
    await this.logReport(report)
    return report
  }

  /**
   * Analyse l'intégrité d'un fichier spécifique
   */
  async analyzeFileIntegrity(filePath: string): Promise<FileIntegrityIssue[]> {
    const issues: FileIntegrityIssue[] = []
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      // Vérifier les patterns de corruption
      for (const pattern of this.corruptedPatterns) {
        const matches = content.match(pattern)
        if (matches) {
          issues.push({
            filePath,
            issueType: 'corrupted',
            description: `Pattern de corruption détecté: ${pattern.source}`,
            severity: 'critical',
            suggestedFix: 'Restaurer le fichier depuis Git ou corriger manuellement'
          })
        }
      }
      
      // Vérifier la syntaxe TypeScript/JavaScript
      const syntaxIssues = this.checkSyntaxIntegrity(content, filePath)
      issues.push(...syntaxIssues)
      // Vérifier les imports
      const importIssues = this.checkImportIntegrity(content, filePath)
      issues.push(...importIssues)
    } catch (error) {
      issues.push({
        filePath,
        issueType: 'corrupted',
        description: `Impossible de lire le fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        severity: 'critical',
        suggestedFix: 'Vérifier les permissions ou restaurer depuis Git'
      })
    }
    
    return issues
  }

  /**
   * Vérifie l'intégrité de la syntaxe
   */
  private checkSyntaxIntegrity(content: string, filePath: string): FileIntegrityIssue[] {
    const issues: FileIntegrityIssue[] = []
    // Vérifier les guillemets non fermés
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const singleQuotes = (line.match(/'/g) || []).length
      const doubleQuotes = (line.match(/"/g) || []).length
      if (singleQuotes % 2 !== 0) {
        issues.push({
          filePath,
          issueType: 'syntax_error',
          description: `Guillemets simples non fermés à la ligne ${i + 1}`,
          severity: 'high',
          lineNumber: i + 1,
          suggestedFix: 'Fermer les guillemets ou échapper correctement'
        })
      }
      
      if (doubleQuotes % 2 !== 0) {
        issues.push({
          filePath,
          issueType: 'syntax_error',
          description: `Guillemets doubles non fermés à la ligne ${i + 1}`,
          severity: 'high',
          lineNumber: i + 1,
          suggestedFix: 'Fermer les guillemets ou échapper correctement'
        })
      }
    }
    
    return issues
  }

  /**
   * Vérifie l'intégrité des imports
   */
  private checkImportIntegrity(content: string, filePath: string): FileIntegrityIssue[] {
    const issues: FileIntegrityIssue[] = []
    // Vérifier les imports corrompus
    const importLines = content.match(/import.*from.*['"][^'"]*['"]/g) || []
    for (const importLine of importLines) {
      if (importLine.includes('')) {
        issues.push({
          filePath,
          issueType: 'missing_import',
          description: `Import corrompu: ${importLine.trim()}`,
          severity: 'critical',
          suggestedFix: 'Corriger l\'import en remplaçant les apostrophes corrompues'
        })
      }
    }
    
    return issues
  }

  /**
   * Corrige automatiquement les fichiers corrompus
   */
  async fixCorruptedFiles(report: FileIntegrityReport): Promise<{ fixed: number; failed: number }> {
    logger.info('🔧 Démarrage de la correction automatique des fichiers corrompus...')
    let fixed = 0
    let failed = 0
    for (const issue of report.issues) {
      if (issue.severity === 'critical' && issue.issueType === 'corrupted') {
        try {
          const success = await this.fixCorruptedFile(issue.filePath)
          if (success) {
            fixed++
            logger.info(`✅ Fichier corrigé: ${issue.filePath}`)
          } else {
            failed++
            logger.error(`❌ Échec de correction: ${issue.filePath}`)
          }
        } catch (error) {
          failed++
          logger.error(`❌ Erreur lors de la correction de ${issue.filePath}:`, error)
        }
      }
    }
    
    logger.info(`🔧 Correction terminée: ${fixed} fichiers corrigés, ${failed} échecs`)
    return { fixed, failed }
  }

  /**
   * Corrige un fichier corrompu spécifique
   */
  private async fixCorruptedFile(filePath: string): Promise<boolean> {
    try {
      // Essayer de restaurer depuis Git
      const { execSync } = require('child_process')
      execSync(`git checkout HEAD -- "${filePath}"`, { stdio: 'pipe' })
      return true
    } catch (error) {
      // Si la restauration Git échoue, essayer une correction manuelle
      return this.manualFixCorruptedFile(filePath)
    }
  }

  /**
   * Correction manuelle d'un fichier corrompu
   */
  private async manualFixCorruptedFile(filePath: string): Promise<boolean> {
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      // Corriger les apostrophes corrompues
      content = content.replace(/'/g, "'")
      content = content.replace(/'/g, "'")
      // Corriger les imports
      content = content.replace(/import\s+.*\s+from\s+['"]apos;([^'"]+)apos;['"]/g, "import $1 from '$1'")
      content = content.replace(/from\s+['"]apos;([^'"]+)apos;['"]/g, "from '$1'")
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, content, 'utf8')
      return true
    } catch (error) {
      logger.error(`Erreur lors de la correction manuelle de ${filePath}:`, error)
      return false
    }
  }

  /**
   * Génère un rapport d'intégrité
   */
  private generateReport(totalFiles: number, issues: FileIntegrityIssue[]): FileIntegrityReport {
    const corruptedFiles = new Set(issues.map(issue => issue.filePath)).size
    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
    }
    const recommendations = this.generateRecommendations(issues, summary)
    return {
      totalFiles,
      corruptedFiles,
      issues,
      summary,
      recommendations
    }
  }

  /**
   * Génère des recommandations basées sur les problèmes détectés
   */
  private generateRecommendations(issues: FileIntegrityIssue[], summary: any): string[] {
    const recommendations: string[] = []
    if (summary.critical > 0) {
      recommendations.push('🚨 Fichiers critiques détectés - Restauration Git recommandée')
      recommendations.push('💡 Exécuter: git checkout HEAD -- <fichier_corrompu>')
    }
    
    if (summary.high > 0) {
      recommendations.push('⚠️ Erreurs de syntaxe détectées - Vérification manuelle requise')
      recommendations.push('💡 Utiliser: npm run lint pour identifier les problèmes')
    }
    
    if (issues.some(i => i.issueType === 'corrupted')) {
      recommendations.push('🔧 Script de correction automatique disponible')
      recommendations.push('💡 Exécuter: npm run fix:integrity')
    }
    
    if (summary.critical === 0 && summary.high === 0) {
      recommendations.push('✅ Aucun problème critique détecté - Intégrité des fichiers OK')
    }
    
    return recommendations
  }

  /**
   * Enregistre le rapport dans les logs
   */
  private async logReport(report: FileIntegrityReport): Promise<void> {
    logger.info('📊 RAPPORT D\'INTÉGRITÉ DES FICHIERS')
    logger.info(`📁 Fichiers analysés: ${report.totalFiles}`)
    logger.info(`🚨 Fichiers corrompus: ${report.corruptedFiles}`)
    logger.info(`📈 Résumé: ${report.summary.critical} critique, ${report.summary.high} élevé, ${report.summary.medium} moyen, ${report.summary.low} faible`)
    if (report.issues.length > 0) {
      logger.info('🔍 Problèmes détectés:')
      report.issues.forEach(issue => {
        logger.info(`  ${issue.severity.toUpperCase()}: ${issue.filePath} - ${issue.description}`)
      })
    }
    
    logger.info('💡 Recommandations:')
    report.recommendations.forEach(rec => {
      logger.info(`  ${rec}`)
    })
  }

  /**
   * Récupère tous les fichiers source du projet
   */
  private getAllSourceFiles(): string[] {
    const files: string[] = []
    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (this.fileExtensions.includes(path.extname(item))) {
          files.push(fullPath)
        }
      }
    }
    if (fs.existsSync(this.srcDir)) {
      walkDir(this.srcDir)
    }
    
    return files
  }

  /**
   * Vérifie l'intégrité en temps réel (pour le monitoring)
   */
  async monitorIntegrity(): Promise<void> {
    const report = await this.analyzeProjectIntegrity()
    if (report.summary.critical > 0) {
      logger.error('🚨 PROBLÈMES CRITIQUES DÉTECTÉS - Action immédiate requise')
      await this.fixCorruptedFiles(report)
    } else if (report.summary.high > 0) {
      logger.warn('⚠️ Problèmes d\'intégrité détectés - Vérification recommandée')
    } else {
      logger.info('✅ Intégrité des fichiers vérifiée - Aucun problème détecté')
    }
  }
}

// Instance singleton
export const fileIntegrityBot = new FileIntegrityBot()
// Fonction d'export pour utilisation directe
export async function checkFileIntegrity(): Promise<FileIntegrityReport> {
  return await fileIntegrityBot.analyzeProjectIntegrity()
}

export async function fixCorruptedFiles(): Promise<{ fixed: number; failed: number }> {
  const report = await fileIntegrityBot.analyzeProjectIntegrity()
  return await fileIntegrityBot.fixCorruptedFiles(report)
}

export async function monitorFileIntegrity(): Promise<void> {
  await fileIntegrityBot.monitorIntegrity()
}
