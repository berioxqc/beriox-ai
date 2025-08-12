import { prisma } from 'apos;./prisma.ts'apos;;

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
  type: 'apos;index'apos; | 'apos;query'apos; | 'apos;maintenance'apos; | 'apos;structure'apos;;
  priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos;;
  title: string;
  description: string;
  impact: string;
  effort: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  sql?: string;
}

export class DatabaseOptimizer {
  /**
   * Analyser les performances de la base de données
   */
  async analyzeDatabase(): Promise<DatabaseMetrics> {
    console.log('apos;🔍 Analyse de la base de données...'apos;);

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
          pg_size_pretty(pg_total_relation_size(schemaname||'apos;.'apos;||tablename)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'apos;.'apos;||tablename)) as table_size,
          pg_size_pretty(pg_indexes_size(schemaname||'apos;.'apos;||tablename)) as index_size
        FROM pg_stat_user_tables 
        WHERE schemaname = 'apos;public'apos;
        ORDER BY pg_total_relation_size(schemaname||'apos;.'apos;||tablename) DESC
      `;

      return result as TableStats[];
    } catch (error) {
      console.error('apos;Erreur lors de la récupération des stats des tables:'apos;, error);
      return [];
    }
  }

  /**
   * Obtenir l'apos;utilisation des index
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
        WHERE schemaname = 'apos;public'apos;
        ORDER BY idx_scan DESC
      `;

      return result as IndexUsage[];
    } catch (error) {
      console.error('apos;Erreur lors de la récupération de l\'apos;utilisation des index:'apos;, error);
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
        WHERE query NOT LIKE 'apos;%pg_stat_statements%'apos;
        ORDER BY mean_time DESC 
        LIMIT 10
      `;

      return result as SlowQuery[];
    } catch (error) {
      console.error('apos;Erreur lors de la récupération des requêtes lentes:'apos;, error);
      return [];
    }
  }

  /**
   * Générer des recommandations d'apos;optimisation
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
        type: 'apos;maintenance'apos;,
        priority: 'apos;high'apos;,
        title: 'apos;VACUUM des tables avec beaucoup de dead rows'apos;,
        description: `${tablesWithDeadRows.length} table(s) ont plus de 10% de dead rows`,
        impact: 'apos;Amélioration des performances et libération d\'apos;espace disque'apos;,
        effort: 'apos;low'apos;,
        sql: tablesWithDeadRows.map(table => `VACUUM ANALYZE "${table.tableName}";`).join('apos;\n'apos;)
      });
    }

    // Analyser les index non utilisés
    const unusedIndexes = indexUsage.filter(index => index.scans === 0);
    if (unusedIndexes.length > 0) {
      recommendations.push({
        type: 'apos;index'apos;,
        priority: 'apos;medium'apos;,
        title: 'apos;Supprimer les index non utilisés'apos;,
        description: `${unusedIndexes.length} index non utilisés détectés`,
        impact: 'apos;Réduction de l\'apos;espace disque et amélioration des performances d\'apos;écriture'apos;,
        effort: 'apos;low'apos;,
        sql: unusedIndexes.map(index => `DROP INDEX IF EXISTS "${index.indexName}";`).join('apos;\n'apos;)
      });
    }

    // Analyser les requêtes lentes
    const verySlowQueries = slowQueries.filter(query => query.avgTime > 100);
    if (verySlowQueries.length > 0) {
      recommendations.push({
        type: 'apos;query'apos;,
        priority: 'apos;critical'apos;,
        title: 'apos;Optimiser les requêtes très lentes'apos;,
        description: `${verySlowQueries.length} requête(s) avec un temps moyen > 100ms`,
        impact: 'apos;Amélioration significative des temps de réponse'apos;,
        effort: 'apos;high'apos;
      });
    }

    // Vérifier les tables sans index sur les clés étrangères
    const tablesWithoutFKIndexes = await this.findTablesWithoutFKIndexes();
    if (tablesWithoutFKIndexes.length > 0) {
      recommendations.push({
        type: 'apos;index'apos;,
        priority: 'apos;high'apos;,
        title: 'apos;Ajouter des index sur les clés étrangères'apos;,
        description: `${tablesWithoutFKIndexes.length} table(s) sans index sur les FK`,
        impact: 'apos;Amélioration des performances des jointures'apos;,
        effort: 'apos;medium'apos;,
        sql: tablesWithoutFKIndexes.map(fk => 
          `CREATE INDEX CONCURRENTLY "idx_${fk.tableName}_${fk.columnName}" ON "${fk.tableName}" ("${fk.columnName}");`
        ).join('apos;\n'apos;)
      });
    }

    // Vérifier les tables avec beaucoup de données
    const largeTables = tableStats.filter(table => {
      const sizeMB = parseInt((table as any).total_size.replace(/[^\d]/g, 'apos;'apos;));
      return sizeMB > 100; // Plus de 100MB
    });

    if (largeTables.length > 0) {
      recommendations.push({
        type: 'apos;maintenance'apos;,
        priority: 'apos;medium'apos;,
        title: 'apos;Partitionner les grandes tables'apos;,
        description: `${largeTables.length} table(s) de plus de 100MB détectées`,
        impact: 'apos;Amélioration des performances des requêtes sur grandes tables'apos;,
        effort: 'apos;high'apos;
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
        WHERE tc.constraint_type = 'apos;FOREIGN KEY'apos;
        AND tc.table_schema = 'apos;public'apos;
        AND NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = tc.table_name 
          AND indexdef LIKE 'apos;%'apos; || kcu.column_name || 'apos;%'apos;
        )
      `;

      return result as any[];
    } catch (error) {
      console.error('apos;Erreur lors de la recherche des FK sans index:'apos;, error);
      return [];
    }
  }

  /**
   * Exécuter les recommandations d'apos;optimisation
   */
  async executeOptimizations(recommendations: OptimizationRecommendation[]): Promise<void> {
    console.log('apos;🚀 Exécution des optimisations...'apos;);

    for (const recommendation of recommendations) {
      if (recommendation.sql && recommendation.priority === 'apos;high'apos;) {
        try {
          console.log(`📝 Exécution: ${recommendation.title}`);
          await prisma.$executeRawUnsafe(recommendation.sql);
          console.log(`✅ Succès: ${recommendation.title}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'apos;exécution de ${recommendation.title}:`, error);
        }
      }
    }
  }

  /**
   * Générer un rapport d'apos;optimisation
   */
  async generateOptimizationReport(): Promise<string> {
    const metrics = await this.analyzeDatabase();
    
    let report = 'apos;# Rapport d\'apos;Optimisation de la Base de Données\n\n'apos;;
    
    // Statistiques des tables
    report += 'apos;## 📊 Statistiques des Tables\n\n'apos;;
    report += 'apos;| Table | Lignes | Taille | Index | Total |\n'apos;;
    report += 'apos;|-------|--------|--------|-------|-------|\n'apos;;
    
    metrics.tableStats.forEach(table => {
      report += `| ${table.tableName} | ${(table as any).live_rows || 0} | ${(table as any).table_size || 'apos;N/A'apos;} | ${(table as any).index_size || 'apos;N/A'apos;} | ${(table as any).total_size || 'apos;N/A'apos;} |\n`;
    });
    
    // Index les plus utilisés
    report += 'apos;\n## 🔍 Index les Plus Utilisés\n\n'apos;;
    report += 'apos;| Index | Table | Scans | Efficacité |\n'apos;;
    report += 'apos;|-------|-------|-------|------------|\n'apos;;
    
    metrics.indexUsage.slice(0, 10).forEach(index => {
      report += `| ${index.indexName} | ${index.tableName} | ${index.scans} | ${index.usagePercentage}% |\n`;
    });
    
    // Recommandations
    report += 'apos;\n## 🎯 Recommandations d\'apos;Optimisation\n\n'apos;;
    
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
        report += 'apos;```sql\n'apos;;
        report += rec.sql;
        report += 'apos;\n```\n\n'apos;;
      }
    });
    
    return report;
  }
}

// Instance singleton
export const databaseOptimizer = new DatabaseOptimizer();
