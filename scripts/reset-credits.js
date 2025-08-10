#!/usr/bin/env node

/**
 * Script pour reset mensuel des crédits utilisateurs
 * À exécuter quotidiennement via cron job
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetMonthlyCredits() {
  try {
    console.log('🔄 Début du reset mensuel des crédits...');
    
    // Trouver tous les utilisateurs dont la date de reset est passée
    const usersToReset = await prisma.userCredits.findMany({
      where: {
        resetDate: {
          lte: new Date()
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 ${usersToReset.length} utilisateurs à reset`);

    if (usersToReset.length === 0) {
      console.log('✅ Aucun utilisateur à reset aujourd\'hui');
      return;
    }

    let resetCount = 0;
    let errorCount = 0;

    for (const userCredits of usersToReset) {
      try {
        // Calculer la prochaine date de reset (jour de l'abonnement)
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        
        // Reset des crédits
        await prisma.userCredits.update({
          where: { id: userCredits.id },
          data: {
            creditsUsed: 0,
            resetDate: nextMonth
          }
        });

        console.log(`✅ Reset crédits pour ${userCredits.user.email} (${userCredits.creditsLimit} crédits)`);
        resetCount++;

        // Optionnel : Envoyer un email de notification
        // await sendResetNotification(userCredits.user.email, userCredits.creditsLimit);

      } catch (error) {
        console.error(`❌ Erreur lors du reset pour ${userCredits.user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Résumé du reset:`);
    console.log(`✅ ${resetCount} utilisateurs resetés avec succès`);
    console.log(`❌ ${errorCount} erreurs`);
    console.log(`📊 Total traité: ${usersToReset.length}`);

  } catch (error) {
    console.error('💥 Erreur générale lors du reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour envoyer une notification email (optionnel)
async function sendResetNotification(email, creditsLimit) {
  // Implémenter l'envoi d'email ici
  console.log(`📧 Email de notification envoyé à ${email} (${creditsLimit} crédits disponibles)`);
}

// Exécuter le script
if (require.main === module) {
  resetMonthlyCredits()
    .then(() => {
      console.log('🎉 Reset mensuel terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { resetMonthlyCredits };
