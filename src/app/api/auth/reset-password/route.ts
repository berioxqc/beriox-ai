import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Trouver le token de réinitialisation
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token de réinitialisation invalide' },
        { status: 400 }
      );
    }

    // Vérifier si le token a expiré
    if (resetToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      });

      return NextResponse.json(
        { error: 'Token de réinitialisation expiré' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Supprimer le token de réinitialisation
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
