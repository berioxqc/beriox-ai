# Configuration Cron Job - Reset Mensuel des Crédits

## 🕐 Configuration du Cron Job

### 1. Accéder au Crontab
```bash
crontab -e
```

### 2. Ajouter la tâche quotidienne
```bash
# Reset quotidien des crédits à 2h du matin
0 2 * * * cd /path/to/beriox-ai && npm run reset-credits >> /var/log/beriox-credits.log 2>&1
```

### 3. Vérifier la configuration
```bash
crontab -l
```

## 📊 Monitoring

### Logs
Les logs sont sauvegardés dans `/var/log/beriox-credits.log`

### Vérification manuelle
```bash
# Tester le script manuellement
npm run reset-credits

# Vérifier les logs
tail -f /var/log/beriox-credits.log
```

## 🔧 Configuration Avancée

### Variables d'environnement
Assurez-vous que les variables suivantes sont définies :
```bash
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

### Permissions
```bash
# Rendre le script exécutable
chmod +x scripts/reset-credits.js

# Vérifier les permissions
ls -la scripts/reset-credits.js
```

## 🚨 Alertes et Monitoring

### Email de notification (optionnel)
Décommentez la ligne dans le script pour activer les emails :
```javascript
await sendResetNotification(userCredits.user.email, userCredits.creditsLimit);
```

### Monitoring avec PM2
Si vous utilisez PM2, ajoutez au ecosystem.config.js :
```javascript
{
  name: 'beriox-cron',
  script: 'scripts/reset-credits.js',
  cron_restart: '0 2 * * *',
  autorestart: false
}
```

## 📈 Métriques

### KPIs à surveiller
- Nombre d'utilisateurs resetés par jour
- Taux d'erreur du script
- Temps d'exécution
- Utilisation des crédits après reset

### Dashboard de monitoring
Consultez la page `/admin/recommendations` pour voir les métriques en temps réel.

---

*Dernière mise à jour: Août 2024*
