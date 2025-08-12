import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return NextResponse.json({
        message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Supprimer les anciens tokens de réinitialisation
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Créer un nouveau token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      }
    });

    // Envoyer l'email de réinitialisation
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.name);

    if (!emailSent) {
      // Supprimer le token si l'email n'a pas pu être envoyé
      await prisma.verificationToken.delete({
        where: { token: resetToken }
      });

      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
