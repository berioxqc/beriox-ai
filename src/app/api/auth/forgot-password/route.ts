import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { sendPasswordResetEmail } from 'apos;@/lib/email'apos;;
import crypto from 'apos;crypto'apos;;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'apos;Email requis'apos; },
        { status: 400 }
      );
    }

    // Validation de l'apos;email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'apos;Format d\'apos;email invalide'apos; },
        { status: 400 }
      );
    }

    // Vérifier si l'apos;utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'apos;email existe ou non
      return NextResponse.json({
        message: 'apos;Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'apos;
      });
    }

    // Supprimer les anciens tokens de réinitialisation
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Créer un nouveau token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('apos;hex'apos;);
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      }
    });

    // Envoyer l'apos;email de réinitialisation
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.name);

    if (!emailSent) {
      // Supprimer le token si l'apos;email n'apos;a pas pu être envoyé
      await prisma.verificationToken.delete({
        where: { token: resetToken }
      });

      return NextResponse.json(
        { error: 'apos;Erreur lors de l\'apos;envoi de l\'apos;email. Veuillez réessayer.'apos; },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'apos;Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'apos;
    });

  } catch (error) {
    console.error('apos;Erreur lors de la demande de réinitialisation:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
