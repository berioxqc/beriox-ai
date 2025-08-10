#!/usr/bin/env node

/**
 * Script pour configurer info@beriox.ca comme super-admin
 * Beriox AI
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupSuperAdmin() {
  const superAdminEmail = 'info@beriox.ca';
  
  console.log('🔧 Configuration du super-admin...');
  console.log(`📧 Email: ${superAdminEmail}`);
  
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email: superAdminEmail }
    });

    if (existingUser) {
      // Mettre à jour le rôle existant
      if (existingUser.role === 'SUPER_ADMIN') {
        console.log('✅ L\'utilisateur est déjà super-admin');
        return;
      }

      console.log('🔄 Mise à jour du rôle utilisateur...');
      await prisma.user.update({
        where: { email: superAdminEmail },
        data: { role: 'SUPER_ADMIN' }
      });
      
      console.log('✅ Rôle mis à jour vers SUPER_ADMIN');
    } else {
      // Créer un nouvel utilisateur super-admin
      console.log('🆕 Création d\'un nouvel utilisateur super-admin...');
      
      const newUser = await prisma.user.create({
        data: {
          email: superAdminEmail,
          name: 'Beriox Admin',
          role: 'SUPER_ADMIN',
          emailVerified: new Date(),
          // Créer aussi les crédits utilisateur
          userCredits: {
            create: {
              credits: 1000, // Crédits de départ
              plan: 'enterprise',
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
            }
          }
        }
      });
      
      console.log('✅ Utilisateur super-admin créé avec succès');
      console.log(`🆔 ID: ${newUser.id}`);
    }

    // Vérifier la configuration
    const verifiedUser = await prisma.user.findUnique({
      where: { email: superAdminEmail },
      include: {
        userCredits: true
      }
    });

    console.log('\n📊 Configuration finale:');
    console.log(`👤 Nom: ${verifiedUser.name}`);
    console.log(`📧 Email: ${verifiedUser.email}`);
    console.log(`🔑 Rôle: ${verifiedUser.role}`);
    console.log(`📅 Créé le: ${verifiedUser.createdAt}`);
    console.log(`💳 Crédits: ${verifiedUser.userCredits?.credits || 0}`);

    console.log('\n🎉 Configuration du super-admin terminée avec succès !');
    console.log('🔐 L\'utilisateur info@beriox.ca a maintenant accès à toutes les fonctionnalités d\'administration.');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration du super-admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  setupSuperAdmin()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupSuperAdmin };
