import { prisma } from './prisma.ts';

export interface DatabaseMetrics {
  tableStats: TableStats[];
  indexUsage: IndexUsage[];
  slowQueries: SlowQuery[];
  recommendations: OptimizationRecommendation[];
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  lastVacuum?: Date;
  lastAnalyze?: Date;
}

export interface IndexUsage {
  indexName: string;
  tableName: string;
  scans: number;
  tuplesRead: number;
  tuplesFetched: number;
  usagePercentage: number;
}

export interface SlowQuery {
  query: string;
  avgTime: number;
  calls: number;
  totalTime: number;
}

export interface OptimizationRecommendation {
  type: 'index' | 'query' | 'maintenance' | 'structure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  sql?: string;
}

export class DatabaseOptimizer {
  /**
   * Analyser les performances de la base de données
   */
  async analyzeDatabase(): Promise<DatabaseMetrics> {
    console.log('🔍 Analyse de la base de données...');

    const tableStats = await this.getTableStats();
    const indexUsage = await this.getIndexUsage();
    const slowQueries = await this.getSlowQueries();
    const recommendations = await this.generateRecommendations(tableStats, indexUsage, slowQueries);

    return {
      tableStats,
      indexUsage,
      slowQueries,
      recommendations
    };
  }

  /**
   * Obtenir les statistiques des tables
   */
  private async getTableStats(): Promise<TableStats[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
          pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `;

      return result as TableStats[];
    } catch (error) {
      console.error('Erreur lors de la récupération des stats des tables:', error);
      return [];
    }
  }

  /**
   * Obtenir l'utilisation des index
   */
  private async getIndexUsage(): Promise<IndexUsage[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched,
          CASE 
            WHEN idx_scan > 0 THEN 
              ROUND((idx_tup_fetch::float / idx_tup_read::float) * 100, 2)
            ELSE 0 
          END as usage_percentage
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `;

      return result as IndexUsage[];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisation des index:', error);
      return [];
    }
  }

  /**
   * Obtenir les requêtes lentes
   */
  private async getSlowQueries(): Promise<SlowQuery[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time as avg_time,
          rows
        FROM pg_stat_statements 
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_time DESC 
        LIMIT 10
      `;

      return result as SlowQuery[];
    } catch (error) {
      console.error('Erreur lors de la récupération des requêtes lentes:', error);
      return [];
    }
  }

  /**
   * Générer des recommandations d'optimisation
   */
  private async generateRecommendations(
    tableStats: TableStats[],
    indexUsage: IndexUsage[],
    slowQueries: SlowQuery[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyser les tables avec beaucoup de dead rows
    const tablesWithDeadRows = tableStats.filter(table => 
      (table as any).dead_rows > (table as any).live_rows * 0.1
    );

    if (tablesWithDeadRows.length > 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'high',
        title: 'VACUUM des tables avec beaucoup de dead rows',
        description: `${tablesWithDeadRows.length} table(s) ont plus de 10% de dead rows`,
        impact: 'Amélioration des performances et libération d\'espace disque',
        effort: 'low',
        sql: tablesWithDeadRows.map(table => `VACUUM ANALYZE "${table.tableName}";`).join('\n')
      });
    }

    // Analyser les index non utilisés
    const unusedIndexes = indexUsage.filter(index => index.scans === 0);
    if (unusedIndexes.length > 0) {
      recommendations.push({
        type: 'index',
        priority: 'medium',
        title: 'Supprimer les index non utilisés',
        description: `${unusedIndexes.length} index non utilisés détectés`,
        impact: 'Réduction de l\'espace disque et amélioration des performances d\'écriture',
        effort: 'low',
        sql: unusedIndexes.map(index => `DROP INDEX IF EXISTS "${index.indexName}";`).join('\n')
      });
    }

    // Analyser les requêtes lentes
    const verySlowQueries = slowQueries.filter(query => query.avgTime > 100);
    if (verySlowQueries.length > 0) {
      recommendations.push({
        type: 'query',
        priority: 'critical',
        title: 'Optimiser les requêtes très lentes',
        description: `${verySlowQueries.length} requête(s) avec un temps moyen > 100ms`,
        impact: 'Amélioration significative des temps de réponse',
        effort: 'high'
      });
    }

    // Vérifier les tables sans index sur les clés étrangères
    const tablesWithoutFKIndexes = await this.findTablesWithoutFKIndexes();
    if (tablesWithoutFKIndexes.length > 0) {
      recommendations.push({
        type: 'index',
        priority: 'high',
        title: 'Ajouter des index sur les clés étrangères',
        description: `${tablesWithoutFKIndexes.length} table(s) sans index sur les FK`,
        impact: 'Amélioration des performances des jointures',
        effort: 'medium',
        sql: tablesWithoutFKIndexes.map(fk => 
          `CREATE INDEX CONCURRENTLY "idx_${fk.tableName}_${fk.columnName}" ON "${fk.tableName}" ("${fk.columnName}");`
        ).join('\n')
      });
    }

    // Vérifier les tables avec beaucoup de données
    const largeTables = tableStats.filter(table => {
      const sizeMB = parseInt((table as any).total_size.replace(/[^\d]/g, ''));
      return sizeMB > 100; // Plus de 100MB
    });

    if (largeTables.length > 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Partitionner les grandes tables',
        description: `${largeTables.length} table(s) de plus de 100MB détectées`,
        impact: 'Amélioration des performances des requêtes sur grandes tables',
        effort: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Trouver les tables sans index sur les clés étrangères
   */
  private async findTablesWithoutFKIndexes(): Promise<any[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = tc.table_name 
          AND indexdef LIKE '%' || kcu.column_name || '%'
        )
      `;

      return result as any[];
    } catch (error) {
      console.error('Erreur lors de la recherche des FK sans index:', error);
      return [];
    }
  }

  /**
   * Exécuter les recommandations d'optimisation
   */
  async executeOptimizations(recommendations: OptimizationRecommendation[]): Promise<void> {
    console.log('🚀 Exécution des optimisations...');

    for (const recommendation of recommendations) {
      if (recommendation.sql && recommendation.priority === 'high') {
        try {
          console.log(`📝 Exécution: ${recommendation.title}`);
          await prisma.$executeRawUnsafe(recommendation.sql);
          console.log(`✅ Succès: ${recommendation.title}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'exécution de ${recommendation.title}:`, error);
        }
      }
    }
  }

  /**
   * Générer un rapport d'optimisation
   */
  async generateOptimizationReport(): Promise<string> {
    const metrics = await this.analyzeDatabase();
    
    let report = '# Rapport d\'Optimisation de la Base de Données\n\n';
    
    // Statistiques des tables
    report += '## 📊 Statistiques des Tables\n\n';
    report += '| Table | Lignes | Taille | Index | Total |\n';
    report += '|-------|--------|--------|-------|-------|\n';
    
    metrics.tableStats.forEach(table => {
      report += `| ${table.tableName} | ${(table as any).live_rows || 0} | ${(table as any).table_size || 'N/A'} | ${(table as any).index_size || 'N/A'} | ${(table as any).total_size || 'N/A'} |\n`;
    });
    
    // Index les plus utilisés
    report += '\n## 🔍 Index les Plus Utilisés\n\n';
    report += '| Index | Table | Scans | Efficacité |\n';
    report += '|-------|-------|-------|------------|\n';
    
    metrics.indexUsage.slice(0, 10).forEach(index => {
      report += `| ${index.indexName} | ${index.tableName} | ${index.scans} | ${index.usagePercentage}% |\n`;
    });
    
    // Recommandations
    report += '\n## 🎯 Recommandations d\'Optimisation\n\n';
    
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    const sortedRecommendations = metrics.recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    sortedRecommendations.forEach(rec => {
      report += `### ${rec.priority.toUpperCase()}: ${rec.title}\n\n`;
      report += `${rec.description}\n\n`;
      report += `**Impact:** ${rec.impact}\n\n`;
      report += `**Effort:** ${rec.effort}\n\n`;
      
      if (rec.sql) {
        report += '```sql\n';
        report += rec.sql;
        report += '\n```\n\n';
      }
    });
    
    return report;
  }
}

// Instance singleton
export const databaseOptimizer = new DatabaseOptimizer();
