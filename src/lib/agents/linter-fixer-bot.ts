import { logger } from 'apos;@/lib/logger'apos;;
import * as fs from 'apos;fs'apos;;
import * as path from 'apos;path'apos;;

export interface LinterFixResult {
  filePath: string;
  originalContent: string;
  fixedContent: string;
  changes: Array<{
    type: 'apos;unused_variable'apos; | 'apos;any_type'apos; | 'apos;missing_deps'apos; | 'apos;unused_import'apos; | 'apos;unescaped_entity'apos;;
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
  private fileExtensions = ['apos;.tsx'apos;, 'apos;.ts'apos;, 'apos;.jsx'apos;, 'apos;.js'apos;];
  private excludeDirs = ['apos;node_modules'apos;, 'apos;.git'apos;, 'apos;.next'apos;, 'apos;dist'apos;, 'apos;build'apos;];

  /**
   * Analyse et corrige les erreurs de linter dans le projet
   */
  async fixLinterErrors(projectRoot: string = process.cwd(), dryRun: boolean = true): Promise<LinterFixReport> {
    logger.info('apos;🧹 LinterFixerBot: Début de l\'apos;analyse des erreurs de linter'apos;, { projectRoot, dryRun });

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
                case 'apos;unused_variable'apos;:
                  report.summary.unusedVariables++;
                  break;
                case 'apos;any_type'apos;:
                  report.summary.anyTypes++;
                  break;
                case 'apos;missing_deps'apos;:
                  report.summary.missingDeps++;
                  break;
                case 'apos;unused_import'apos;:
                  report.summary.unusedImports++;
                  break;
                case 'apos;unescaped_entity'apos;:
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

      logger.info('apos;✅ LinterFixerBot: Analyse terminée'apos;, {
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
        // Vérifier l'apos;extension
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
      originalContent: 'apos;'apos;,
      fixedContent: 'apos;'apos;,
      changes: [],
      isValid: true
    };

    try {
      // Lire le contenu du fichier
      result.originalContent = fs.readFileSync(filePath, 'apos;utf-8'apos;);
      result.fixedContent = result.originalContent;

      // Appliquer les corrections
      await this.fixUnusedVariables(result);
      await this.fixAnyTypes(result);
      await this.fixMissingDependencies(result);
      await this.fixUnusedImports(result);
      await this.fixUnescapedEntities(result);

      // Valider la syntaxe si ce n'apos;est pas un dry run
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
          result.error = 'apos;Syntaxe invalide après correction'apos;;
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
    const lines = result.fixedContent.split('apos;\n'apos;);
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
            // Ajouter un underscore pour indiquer que c'apos;est intentionnel
            const fixedLine = line.replace(
              new RegExp(`\\b${varName}\\b`, 'apos;g'apos;),
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
        type: 'apos;unused_variable'apos;,
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
    const lines = result.fixedContent.split('apos;\n'apos;);
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les types `any`
      const anyPattern = /:\s*any\b/g;
      
      if (anyPattern.test(line)) {
        // Essayer d'apos;inférer un type plus spécifique
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
        type: 'apos;any_type'apos;,
        line: change.line,
        description: `Type 'apos;any'apos; remplacé par un type plus spécifique`,
        fix: change.fixed.trim()
      });
    });
  }

  /**
   * Corrige les dépendances manquantes dans useEffect
   */
  private async fixMissingDependencies(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('apos;\n'apos;);
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
            
            result.fixedContent = beforeEnd + `}, [${dependencies.join('apos;, 'apos;)}])` + afterEnd;
            
            result.changes.push({
              type: 'apos;missing_deps'apos;,
              line: i + 1,
              description: `Dépendances manquantes ajoutées: [${dependencies.join('apos;, 'apos;)}]`,
              fix: `useEffect(() => { ... }, [${dependencies.join('apos;, 'apos;)}])`
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
    const lines = result.fixedContent.split('apos;\n'apos;);
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les imports
      const importPattern = /import\s+{([^}]+)}\s+from\s+['apos;"][^'apos;"]+['apos;"]/;
      
      if (importPattern.test(line)) {
        const match = line.match(importPattern);
        if (match) {
          const imports = match[1].split('apos;,'apos;).map(imp => imp.trim());
          const usedImports = imports.filter(imp => this.isImportUsed(result.fixedContent, imp));
          const unusedImports = imports.filter(imp => !this.isImportUsed(result.fixedContent, imp));
          
          if (unusedImports.length > 0) {
            if (usedImports.length > 0) {
              const fixedLine = line.replace(
                `{${imports.join('apos;, 'apos;)}}`,
                `{${usedImports.join('apos;, 'apos;)}}`
              );
              
              changes.push({
                line: i + 1,
                original: line,
                fixed: fixedLine
              });
            } else {
              // Supprimer complètement l'apos;import s'apos;il n'apos;y a plus d'apos;imports utilisés
              changes.push({
                line: i + 1,
                original: line,
                fixed: 'apos;'apos;
              });
            }
          }
        }
      }
    }

    // Appliquer les changements
    changes.forEach(change => {
      if (change.fixed === 'apos;'apos;) {
        // Supprimer la ligne
        result.fixedContent = result.fixedContent.replace(change.original + 'apos;\n'apos;, 'apos;'apos;);
      } else {
        result.fixedContent = result.fixedContent.replace(change.original, change.fixed);
      }
      
      result.changes.push({
        type: 'apos;unused_import'apos;,
        line: change.line,
        description: `Import non utilisé supprimé`,
        fix: change.fixed || 'apos;(ligne supprimée)'apos;
      });
    });
  }

  /**
   * Corrige les entités non échappées
   */
  private async fixUnescapedEntities(result: LinterFixResult): Promise<void> {
    const lines = result.fixedContent.split('apos;\n'apos;);
    const changes: Array<{ line: number; original: string; fixed: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter les apostrophes et guillemets non échappés dans JSX
      const unescapedPatterns = [
        { pattern: /'apos;([^'apos;]*)'apos;/g, replacement: "'$1'" },
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
        type: 'apos;unescaped_entity'apos;,
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
    const lines = content.split('apos;\n'apos;);
    
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern pour détecter l'apos;utilisation de la variable
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'apos;g'apos;);
      
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
    const specialVars = ['apos;React'apos;, 'apos;useState'apos;, 'apos;useEffect'apos;, 'apos;useCallback'apos;, 'apos;useMemo'apos;, 'apos;props'apos;, 'apos;state'apos;];
    return specialVars.includes(varName) || varName.startsWith('apos;_'apos;);
  }

  /**
   * Infère un type à partir du contexte
   */
  private inferTypeFromContext(line: string): string | null {
    // Logique simple d'apos;inférence de type
    if (line.includes('apos;[]'apos;)) return 'apos;any[]'apos;;
    if (line.includes('apos;{}'apos;)) return 'apos;Record<string, any>'apos;;
    if (line.includes('apos;string'apos;)) return 'apos;string'apos;;
    if (line.includes('apos;number'apos;)) return 'apos;number'apos;;
    if (line.includes('apos;boolean'apos;)) return 'apos;boolean'apos;;
    if (line.includes('apos;Date'apos;)) return 'apos;Date'apos;;
    if (line.includes('apos;Promise'apos;)) return 'apos;Promise<any>'apos;;
    
    return 'apos;unknown'apos;;
  }

  /**
   * Trouve les dépendances manquantes dans un useEffect
   */
  private findMissingDependencies(content: string, startLine: number): string[] {
    const lines = content.split('apos;\n'apos;);
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
      if (line.includes('apos;}, ['apos;)) break;
    }
    
    return dependencies;
  }

  /**
   * Trouve la fin d'apos;un useEffect
   */
  private findUseEffectEnd(content: string, startLine: number): number {
    const lines = content.split('apos;\n'apos;);
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('apos;}, ['apos;)) {
        return content.indexOf(line) + line.length;
      }
    }
    
    return -1;
  }

  /**
   * Vérifie si un import est utilisé dans le fichier
   */
  private isImportUsed(content: string, importName: string): boolean {
    const usagePattern = new RegExp(`\\b${importName}\\b`, 'apos;g'apos;);
    return usagePattern.test(content);
  }

  /**
   * Valide la syntaxe du contenu corrigé
   */
  private async validateSyntax(content: string, filePath: string): Promise<boolean> {
    try {
      const ext = path.extname(filePath);

      if (ext === 'apos;.ts'apos; || ext === 'apos;.tsx'apos;) {
        return this.validateTypeScript(content);
      } else if (ext === 'apos;.js'apos; || ext === 'apos;.jsx'apos;) {
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
          const singleQuotes = (content.match(/'apos;/g) || []).length;
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
    let output = 'apos;'apos;;

    output += 'apos;🧹 RAPPORT LinterFixerBot\n'apos;;
    output += 'apos;='apos;.repeat(50) + 'apos;\n\n'apos;;

    output += `📊 RÉSUMÉ GÉNÉRAL\n`;
    output += `- Fichiers analysés: ${report.totalFiles}\n`;
    output += `- Fichiers corrigés: ${report.fixedFiles}\n`;
    output += `- Total des corrections: ${report.totalChanges}\n`;
    output += `- Erreurs: ${report.errors.length}\n\n`;

    output += `📈 DÉTAIL DES CORRECTIONS\n`;
    output += `- Variables non utilisées: ${report.summary.unusedVariables}\n`;
    output += `- Types 'apos;any'apos;: ${report.summary.anyTypes}\n`;
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
