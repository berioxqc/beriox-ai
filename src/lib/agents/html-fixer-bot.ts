import { logger } from 'apos;@/lib/logger'apos;;
import * as fs from 'apos;fs'apos;;
import * as path from 'apos;path'apos;;

export interface HTMLFixerBot {
  name: "HTMLFixerBot";
  specialty: "Code Quality & Syntax Fixing";
  personality: "Méticuleux et précis, spécialiste de la correction syntaxique";
  capabilities: string[];
  patterns: Record<string, string>;
  safety: {
    backup: boolean;
    validation: boolean;
    dryRun: boolean;
    rollback: boolean;
  };
}

export interface HTMLFixResult {
  filePath: string;
  originalContent: string;
  fixedContent: string;
  changes: Array<{
    pattern: string;
    replacement: string;
    count: number;
    lines: number[];
  }>;
  isValid: boolean;
  error?: string;
}

export interface HTMLFixReport {
  totalFiles: number;
  fixedFiles: number;
  totalChanges: number;
  errors: string[];
  results: HTMLFixResult[];
  summary: {
    apostrophes: number;
    quotes: number;
    ampersands: number;
    other: number;
  };
}

export class HTMLFixerBotService {
  private patterns: Record<string, string> = {
    "'": "'apos;",
    "&quot;": 'apos;"'apos;,
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&nbsp;": " ",
    "&hellip;": "...",
    "&mdash;": "—",
    "&ndash;": "–"
  };

  private fileExtensions = ['apos;.tsx'apos;, 'apos;.ts'apos;, 'apos;.jsx'apos;, 'apos;.js'apos;];
  private excludeDirs = ['apos;node_modules'apos;, 'apos;.git'apos;, 'apos;.next'apos;, 'apos;dist'apos;, 'apos;build'apos;];

  /**
   * Analyse et corrige les caractères HTML mal encodés dans le projet
   */
  async fixHTMLEncoding(projectRoot: string = process.cwd(), dryRun: boolean = true): Promise<HTMLFixReport> {
    logger.info('apos;🔧 HTMLFixerBot: Début de l\'apos;analyse des fichiers'apos;, { projectRoot, dryRun });

    const report: HTMLFixReport = {
      totalFiles: 0,
      fixedFiles: 0,
      totalChanges: 0,
      errors: [],
      results: [],
      summary: {
        apostrophes: 0,
        quotes: 0,
        ampersands: 0,
        other: 0
      }
    };

    try {
      // Récupérer tous les fichiers à analyser
      const files = this.getAllFiles(projectRoot);
      report.totalFiles = files.length;

      logger.info(`📁 HTMLFixerBot: ${files.length} fichiers trouvés à analyser`);

      // Analyser chaque fichier
      for (const filePath of files) {
        try {
          const result = await this.fixFile(filePath, dryRun);
          report.results.push(result);

          if (result.changes.length > 0) {
            report.fixedFiles++;
            report.totalChanges += result.changes.reduce((sum, change) => sum + change.count, 0);

            // Mettre à jour le résumé
            result.changes.forEach(change => {
              if (change.pattern === "'") {
                report.summary.apostrophes += change.count;
              } else if (change.pattern === "&quot;") {
                report.summary.quotes += change.count;
              } else if (change.pattern === "&amp;") {
                report.summary.ampersands += change.count;
              } else {
                report.summary.other += change.count;
              }
            });
          }
        } catch (error) {
          const errorMsg = `Erreur lors du traitement de ${filePath}: ${error}`;
          logger.error(errorMsg);
          report.errors.push(errorMsg);
        }
      }

      logger.info('apos;✅ HTMLFixerBot: Analyse terminée'apos;, {
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
  private async fixFile(filePath: string, dryRun: boolean): Promise<HTMLFixResult> {
    const result: HTMLFixResult = {
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
      for (const [pattern, replacement] of Object.entries(this.patterns)) {
        const matches = this.findMatches(result.fixedContent, pattern);
        
        if (matches.length > 0) {
          result.changes.push({
            pattern,
            replacement,
            count: matches.length,
            lines: matches.map(match => match.line)
          });

          // Remplacer les occurrences
          result.fixedContent = result.fixedContent.replace(new RegExp(pattern, 'apos;g'apos;), replacement);
        }
      }

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
   * Trouve toutes les occurrences d'apos;un pattern dans le contenu
   */
  private findMatches(content: string, pattern: string): Array<{ line: number; column: number }> {
    const matches: Array<{ line: number; column: number }> = [];
    const lines = content.split('apos;\n'apos;);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      let columnIndex = 0;

      while (true) {
        const index = line.indexOf(pattern, columnIndex);
        if (index === -1) break;

        matches.push({
          line: lineIndex + 1,
          column: index + 1
        });

        columnIndex = index + pattern.length;
      }
    }

    return matches;
  }

  /**
   * Valide la syntaxe du contenu corrigé
   */
  private async validateSyntax(content: string, filePath: string): Promise<boolean> {
    try {
      const ext = path.extname(filePath);

      if (ext === 'apos;.ts'apos; || ext === 'apos;.tsx'apos;) {
        // Validation TypeScript basique
        return this.validateTypeScript(content);
      } else if (ext === 'apos;.js'apos; || ext === 'apos;.jsx'apos;) {
        // Validation JavaScript basique
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
    // Même logique que TypeScript pour les vérifications basiques
    return this.validateTypeScript(content);
  }

  /**
   * Génère un rapport détaillé
   */
  generateDetailedReport(report: HTMLFixReport): string {
    let output = 'apos;'apos;;

    output += 'apos;🔧 RAPPORT HTMLFixerBot\n'apos;;
    output += 'apos;='apos;.repeat(50) + 'apos;\n\n'apos;;

    output += `📊 RÉSUMÉ GÉNÉRAL\n`;
    output += `- Fichiers analysés: ${report.totalFiles}\n`;
    output += `- Fichiers corrigés: ${report.fixedFiles}\n`;
    output += `- Total des corrections: ${report.totalChanges}\n`;
    output += `- Erreurs: ${report.errors.length}\n\n`;

    output += `📈 DÉTAIL DES CORRECTIONS\n`;
    output += `- Apostrophes ('): ${report.summary.apostrophes}\n`;
    output += `- Guillemets (&quot;): ${report.summary.quotes}\n`;
    output += `- Et commercial (&amp;): ${report.summary.ampersands}\n`;
    output += `- Autres: ${report.summary.other}\n\n`;

    if (report.results.length > 0) {
      output += `📁 FICHIERS CORRIGÉS\n`;
      report.results
        .filter(result => result.changes.length > 0)
        .forEach(result => {
          output += `\n${result.filePath}\n`;
          output += `  - Corrections: ${result.changes.length}\n`;
          output += `  - Total: ${result.changes.reduce((sum, change) => sum + change.count, 0)}\n`;
          result.changes.forEach(change => {
            output += `    • ${change.pattern} → ${change.replacement}: ${change.count} fois\n`;
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
export const htmlFixerBot = new HTMLFixerBotService();
