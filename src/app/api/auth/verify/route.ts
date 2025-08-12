import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { sendWelcomeEmail } from 'apos;@/lib/email'apos;;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('apos;token'apos;);

    if (!token) {
      return NextResponse.json(
        { error: 'apos;Token de vérification manquant'apos; },
        { status: 400 }
      );
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'apos;Token de vérification invalide'apos; },
        { status: 400 }
      );
    }

    // Vérifier si le token a expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      });

      return NextResponse.json(
        { error: 'apos;Token de vérification expiré'apos; },
        { status: 400 }
      );
    }

    // Trouver l'apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'apos;Utilisateur non trouvé'apos; },
        { status: 404 }
      );
    }

    // Vérifier l'apos;email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Supprimer le token de vérification
    await prisma.verificationToken.delete({
      where: { token }
    });

    // Envoyer l'apos;email de bienvenue
    await sendWelcomeEmail(user.email!, user.name);

    return NextResponse.json({
      message: 'apos;Email vérifié avec succès ! Votre compte est maintenant actif.'apos;,
      userId: user.id
    });

  } catch (error) {
    console.error('apos;Erreur lors de la vérification:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
