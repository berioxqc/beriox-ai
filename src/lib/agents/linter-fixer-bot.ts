import { logger } from '@/lib/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface LinterFixResult {
  filePath: string;
  originalContent: string;
  fixedContent: string;
  changes: Array<{
    type: 'unused_variable' | 'any_type' | 'missing_deps' | 'unused_import' | 'unescaped_entity';
    line: number;
    description: string;
    fix: string;
  }>;
  isValid: boolean;
  error?: string;
}

export interface LinterFixReport {
  totalFiles: number;
  fixedFiles: number;
  totalChanges: number;
  errors: string[];
  results: LinterFixResult[];
  summary: {
    unusedVariables: number;
    anyTypes: number;
    missingDeps: number;
    unusedImports: number;
    unescapedEntities: number;
  };
}

export class LinterFixerBotService {
  private fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];
  private excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

  /**
   * Analyse et corrige les erreurs de linter dans le projet
   */
  async fixLinterErrors(projectRoot: string = process.cwd(), dryRun: boolean = true): Promise<LinterFixReport> {
    logger.info('🧹 LinterFixerBot: Début de l\'analyse des erreurs de linter', { projectRoot, dryRun });

    const report: LinterFixReport = {
      totalFiles: 0,
      fixedFiles: 0,
      totalChanges: 0,
      errors: [],
      results: [],
      summary: {
        unusedVariables: 0,
        anyTypes: 0,
        missingDeps: 0,
        unusedImports: 0,
        unescapedEntities: 0
      }
    };

    try {
      // Récupérer tous les fichiers à analyser
      const files = this.getAllFiles(projectRoot);
      report.totalFiles = files.length;

      logger.info(`📁 LinterFixerBot: ${files.length} fichiers trouvés à analyser`);

      // Analyser chaque fichier
      for (const filePath of files) {
        try {
          const result = await this.fixFile(filePath, dryRun);
          report.results.push(result);

          if (result.changes.length > 0) {
            report.fixedFiles++;
            report.totalChanges += result.changes.length;

            // Mettre à jour le résumé
            result.changes.forEach(change => {
              switch (change.type) {
                case 'unused_variable':
                  report.summary.unusedVariables++;
                  break;
                case 'any_type':
                  report.summary.anyTypes++;
                  break;
                case 'missing_deps':
                  report.summary.missingDeps++;
                  break;
                case 'unused_import':
                  report.summary.unusedImports++;
                  break;
                case 'unescaped_entity':
                  report.summary.unescapedEntities++;
                  break;
              }
            });
          }
        } catch (error) {
          const errorMsg = `Erreur lors du traitement de ${filePath}: ${error}`;
          logger.error(errorMsg);
          report.errors.push(errorMsg);
        }
      }

      logger.info('✅ LinterFixerBot: Analyse terminée', {
        totalFiles: report.totalFiles,
        fixedFiles: report.fixedFiles,
        totalChanges: report.totalChanges
      });

    } catch (error) {
      const errorMsg = `Erreur générale: ${error}`;
      logger.error(errorMsg);
      report.errors.push(errorMsg);
    }

    return report;
  }

  /**
   * Récupère tous les fichiers à analyser
   */
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Ignorer les dossiers exclus
        if (!this.excludeDirs.includes(item)) {
          files.push(...this.getAllFiles(fullPath));
        }
      } else if (stat.isFile()) {
        // Vérifier l'extension
        const ext = path.extname(item);
        if (this.fileExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Corrige un fichier spécifique
   */
  private async fixFile(filePath: string, dryRun: boolean): Promise<LinterFixResult> {
    const result: LinterFixResult = {
      filePath,
      originalContent: '',
      fixedContent: '',
      changes: [],
      isValid: true
    };

    try {
      // Lire le contenu du fichier
      result.originalContent = fs.readFileSync(filePath, 'utf-8');
      result.fixedContent = result.originalContent;

      // Appliquer les corrections
      await this.fixUnusedVariables(result);
      await this.fixAnyTypes(result);
      await this.fixMissingDependencies(result);
      await this.fixUnusedImports(result);
      await this.fixUnescapedEntities(result);

      // Valider la syntaxe si ce n'est pas un dry run
      if (!dryRun && result.changes.length > 0) {
        result.isValid = await this.validateSyntax(result.fixedContent, filePath);
        
        if (result.isValid) {
          // Créer une sauvegarde
          const backupPath = `${filePath}.backup.${Date.now()}`;
          fs.writeFileSync(backupPath, result.originalContent);
          logger.info(`💾 Sauvegarde créée: ${backupPath}`);

          // Écrire le contenu corrigé
          fs.writeFileSync(filePath, result.fixedContent);
          logger.info(`✅ Fichier corrigé: ${filePath}`);
        } else {
          result.error = 'Syntaxe invalide après correction';
          logger.warn(`⚠️ Syntaxe invalide dans ${filePath}`);
        }
      }

    } catch (error) {
      result.isValid = false;
      result.error = `Erreur de lecture/écriture: ${error}`;
      logger.error(`❌ Erreur avec ${filePath}: ${error}`);
    }

    return result;
  }

  /**
   * Corrige les variables non utilisées
   */
  private async fixUnusedVariables(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('\n');
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les variables non utilisées
      const unusedVarPatterns = [
        // const/let/var variable = ...
        /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/,
        // function parameter
        /function\s*\([^)]*\)\s*{/,
        // arrow function parameter
        /\(([^)]*)\)\s*=>/
      ];

      for (const pattern of unusedVarPatterns) {
        const match = line.match(pattern);
        if (match) {
          const varName = match[2] || match[1];
          
          // Vérifier si la variable est utilisée dans le reste du fichier
          const isUsed = this.isVariableUsed(result.fixedContent, varName, i);
          
          if (!isUsed && !this.isSpecialVariable(varName)) {
            // Ajouter un underscore pour indiquer que c'est intentionnel
            const fixedLine = line.replace(
              new RegExp(`\\b${varName}\\b`, 'g'),
              `_${varName}`
            );
            
            changes.push({
              line: i + 1,
              original: line,
              fixed: fixedLine
            });
          }
        }
      }
    }

    // Appliquer les changements
    changes.forEach(change => {
      result.fixedContent = result.fixedContent.replace(change.original, change.fixed);
      result.changes.push({
        type: 'unused_variable',
        line: change.line,
        description: `Variable non utilisée corrigée: ${change.original.trim()}`,
        fix: change.fixed.trim()
      });
    });
  }

  /**
   * Corrige les types `any`
   */
  private async fixAnyTypes(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('\n');
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les types `any`
      const anyPattern = /:\s*any\b/g;
      
      if (anyPattern.test(line)) {
        // Essayer d'inférer un type plus spécifique
        const inferredType = this.inferTypeFromContext(line);
        
        if (inferredType) {
          const fixedLine = line.replace(anyPattern, `: ${inferredType}`);
          
          changes.push({
            line: i + 1,
            original: line,
            fixed: fixedLine
          });
        }
      }
    }

    // Appliquer les changements
    changes.forEach(change => {
      result.fixedContent = result.fixedContent.replace(change.original, change.fixed);
      result.changes.push({
        type: 'any_type',
        line: change.line,
        description: `Type 'any' remplacé par un type plus spécifique`,
        fix: change.fixed.trim()
      });
    });
  }

  /**
   * Corrige les dépendances manquantes dans useEffect
   */
  private async fixMissingDependencies(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('\n');
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter useEffect avec dépendances manquantes
      const useEffectPattern = /useEffect\s*\(\s*\(\)\s*=>\s*{/;
      
      if (useEffectPattern.test(line)) {
        // Analyser le contenu du useEffect pour trouver les dépendances
        const dependencies = this.findMissingDependencies(result.fixedContent, i);
        
        if (dependencies.length > 0) {
          const fixedLine = line.replace(
            /useEffect\s*\(\s*\(\)\s*=>\s*{/,
            `useEffect(() => {`
          );
          
          // Trouver la fin du useEffect et ajouter les dépendances
          const endIndex = this.findUseEffectEnd(result.fixedContent, i);
          if (endIndex > i) {
            const beforeEnd = result.fixedContent.substring(0, endIndex);
            const afterEnd = result.fixedContent.substring(endIndex);
            
            result.fixedContent = beforeEnd + `}, [${dependencies.join(', ')}])` + afterEnd;
            
            result.changes.push({
              type: 'missing_deps',
              line: i + 1,
              description: `Dépendances manquantes ajoutées: [${dependencies.join(', ')}]`,
              fix: `useEffect(() => { ... }, [${dependencies.join(', ')}])`
            });
          }
        }
      }
    }
  }

  /**
   * Corrige les imports non utilisés
   */
  private async fixUnusedImports(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('\n');
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les imports
      const importPattern = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/;
      
      if (importPattern.test(line)) {
        const match = line.match(importPattern);
        if (match) {
          const imports = match[1].split(',').map(imp => imp.trim());
          const usedImports = imports.filter(imp => this.isImportUsed(result.fixedContent, imp));
          const unusedImports = imports.filter(imp => !this.isImportUsed(result.fixedContent, imp));
          
          if (unusedImports.length > 0) {
            if (usedImports.length > 0) {
              const fixedLine = line.replace(
                `{${imports.join(', ')}}`,
                `{${usedImports.join(', ')}}`
              );
              
              changes.push({
                line: i + 1,
                original: line,
                fixed: fixedLine
              });
            } else {
              // Supprimer complètement l'import s'il n'y a plus d'imports utilisés
              changes.push({
                line: i + 1,
                original: line,
                fixed: ''
              });
            }
          }
        }
      }
    }

    // Appliquer les changements
    changes.forEach(change => {
      if (change.fixed === '') {
        // Supprimer la ligne
        result.fixedContent = result.fixedContent.replace(change.original + '\n', '');
      } else {
        result.fixedContent = result.fixedContent.replace(change.original, change.fixed);
      }
      
      result.changes.push({
        type: 'unused_import',
        line: change.line,
        description: `Import non utilisé supprimé`,
        fix: change.fixed || '(ligne supprimée)'
      });
    });
  }

  /**
   * Corrige les entités non échappées
   */
  private async fixUnescapedEntities(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('\n');
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les apostrophes et guillemets non échappés dans JSX
      const unescapedPatterns = [
        { pattern: /'([^']*)'/g, replacement: "'$1'" },
        { pattern: /"([^"]*)"/g, replacement: "&quot;$1&quot;" }
      ];
      
      for (const { pattern, replacement } of unescapedPatterns) {
        if (pattern.test(line)) {
          const fixedLine = line.replace(pattern, replacement);
          
          if (fixedLine !== line) {
            changes.push({
              line: i + 1,
              original: line,
              fixed: fixedLine
            });
          }
        }
      }
    }

    // Appliquer les changements
    changes.forEach(change => {
      result.fixedContent = result.fixedContent.replace(change.original, change.fixed);
      result.changes.push({
        type: 'unescaped_entity',
        line: change.line,
        description: `Entité non échappée corrigée`,
        fix: change.fixed.trim()
      });
    });
  }

  /**
   * Vérifie si une variable est utilisée dans le fichier
   */
  private isVariableUsed(content: string, varName: string, startLine: number): boolean {
    const lines = content.split('\n');
    
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter l'utilisation de la variable
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
      
      if (usagePattern.test(line)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vérifie si une variable est spéciale (ne doit pas être préfixée)
   */
  private isSpecialVariable(varName: string): boolean {
    const specialVars = ['React', 'useState', 'useEffect', 'useCallback', 'useMemo', 'props', 'state'];
    return specialVars.includes(varName) || varName.startsWith('_');
  }

  /**
   * Infère un type à partir du contexte
   */
  private inferTypeFromContext(line: string): string | null {
    // Logique simple d'inférence de type
    if (line.includes('[]')) return 'any[]';
    if (line.includes('{}')) return 'Record<string, any>';
    if (line.includes('string')) return 'string';
    if (line.includes('number')) return 'number';
    if (line.includes('boolean')) return 'boolean';
    if (line.includes('Date')) return 'Date';
    if (line.includes('Promise')) return 'Promise<any>';
    
    return 'unknown';
  }

  /**
   * Trouve les dépendances manquantes dans un useEffect
   */
  private findMissingDependencies(content: string, startLine: number): string[] {
    const lines = content.split('\n');
    const dependencies: string[] = [];
    
    // Logique simplifiée pour trouver les dépendances
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      // Chercher les variables utilisées
      const varPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
      const matches = line.match(varPattern);
      
      if (matches) {
        matches.forEach(match => {
          if (!dependencies.includes(match) && !this.isSpecialVariable(match)) {
            dependencies.push(match);
          }
        });
      }
      
      // Arrêter à la fin du useEffect
      if (line.includes('}, [')) break;
    }
    
    return dependencies;
  }

  /**
   * Trouve la fin d'un useEffect
   */
  private findUseEffectEnd(content: string, startLine: number): number {
    const lines = content.split('\n');
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('}, [')) {
        return content.indexOf(line) + line.length;
      }
    }
    
    return -1;
  }

  /**
   * Vérifie si un import est utilisé dans le fichier
   */
  private isImportUsed(content: string, importName: string): boolean {
    const usagePattern = new RegExp(`\\b${importName}\\b`, 'g');
    return usagePattern.test(content);
  }

  /**
   * Valide la syntaxe du contenu corrigé
   */
  private async validateSyntax(content: string, filePath: string): Promise<boolean> {
    try {
      const ext = path.extname(filePath);

      if (ext === '.ts' || ext === '.tsx') {
        return this.validateTypeScript(content);
      } else if (ext === '.js' || ext === '.jsx') {
        return this.validateJavaScript(content);
      }

      return true;
    } catch (error) {
      logger.error(`Erreur de validation pour ${filePath}: ${error}`);
      return false;
    }
  }

  /**
   * Validation TypeScript basique
   */
  private validateTypeScript(content: string): boolean {
    try {
      // Vérifications basiques
      const checks = [
        // Vérifier les guillemets non fermés
        () => {
          const singleQuotes = (content.match(/'/g) || []).length;
          const doubleQuotes = (content.match(/"/g) || []).length;
          return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
        },
        // Vérifier les accolades non fermées
        () => {
          const openBraces = (content.match(/{/g) || []).length;
          const closeBraces = (content.match(/}/g) || []).length;
          return openBraces === closeBraces;
        },
        // Vérifier les parenthèses non fermées
        () => {
          const openParens = (content.match(/\(/g) || []).length;
          const closeParens = (content.match(/\)/g) || []).length;
          return openParens === closeParens;
        }
      ];

      return checks.every(check => check());
    } catch (error) {
      return false;
    }
  }

  /**
   * Validation JavaScript basique
   */
  private validateJavaScript(content: string): boolean {
    return this.validateTypeScript(content);
  }

  /**
   * Génère un rapport détaillé
   */
  generateDetailedReport(report: LinterFixReport): string {
    let output = '';

    output += '🧹 RAPPORT LinterFixerBot\n';
    output += '='.repeat(50) + '\n\n';

    output += `📊 RÉSUMÉ GÉNÉRAL\n`;
    output += `- Fichiers analysés: ${report.totalFiles}\n`;
    output += `- Fichiers corrigés: ${report.fixedFiles}\n`;
    output += `- Total des corrections: ${report.totalChanges}\n`;
    output += `- Erreurs: ${report.errors.length}\n\n`;

    output += `📈 DÉTAIL DES CORRECTIONS\n`;
    output += `- Variables non utilisées: ${report.summary.unusedVariables}\n`;
    output += `- Types 'any': ${report.summary.anyTypes}\n`;
    output += `- Dépendances manquantes: ${report.summary.missingDeps}\n`;
    output += `- Imports non utilisés: ${report.summary.unusedImports}\n`;
    output += `- Entités non échappées: ${report.summary.unescapedEntities}\n\n`;

    if (report.results.length > 0) {
      output += `📁 FICHIERS CORRIGÉS\n`;
      report.results
        .filter(result => result.changes.length > 0)
        .forEach(result => {
          output += `\n${result.filePath}\n`;
          output += `  - Corrections: ${result.changes.length}\n`;
          result.changes.forEach(change => {
            output += `    • Ligne ${change.line}: ${change.description}\n`;
          });
        });
    }

    if (report.errors.length > 0) {
      output += `\n❌ ERREURS\n`;
      report.errors.forEach(error => {
        output += `- ${error}\n`;
      });
    }

    return output;
  }
}

// Instance singleton
export const linterFixerBot = new LinterFixerBotService();
