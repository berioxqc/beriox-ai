import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import bcrypt from 'apos;bcryptjs'apos;;

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'apos;Token et nouveau mot de passe requis'apos; },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'apos;Le mot de passe doit contenir au moins 8 caractères'apos; },
        { status: 400 }
      );
    }

    // Trouver le token de réinitialisation
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'apos;Token de réinitialisation invalide'apos; },
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
        { error: 'apos;Token de réinitialisation expiré'apos; },
        { status: 400 }
      );
    }

    // Trouver l'apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'apos;Utilisateur non trouvé'apos; },
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
      message: 'apos;Mot de passe mis à jour avec succès'apos;
    });

  } catch (error) {
    console.error('apos;Erreur lors de la réinitialisation du mot de passe:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
