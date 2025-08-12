import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import bcrypt from 'apos;bcryptjs'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { sendVerificationEmail } from 'apos;@/lib/email'apos;;
import crypto from 'apos;crypto'apos;;

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation des données
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'apos;Tous les champs sont requis'apos; },
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

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'apos;Le mot de passe doit contenir au moins 8 caractères'apos; },
        { status: 400 }
      );
    }

    // Vérifier si l'apos;utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'apos;Un compte avec cet email existe déjà'apos; },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le token de vérification
    const verificationToken = crypto.randomBytes(32).toString('apos;hex'apos;);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Créer l'apos;utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null, // Sera vérifié après confirmation
      }
    });

    // Créer le token de vérification
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      }
    });

    // Envoyer l'apos;email de vérification
    const emailSent = await sendVerificationEmail(email, verificationToken, name);

    if (!emailSent) {
      // Si l'apos;email n'apos;a pas pu être envoyé, supprimer l'apos;utilisateur
      await prisma.user.delete({
        where: { id: user.id }
      });
      
      return NextResponse.json(
        { error: 'apos;Erreur lors de l\'apos;envoi de l\'apos;email de vérification. Veuillez réessayer.'apos; },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'apos;Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.'apos;,
      userId: user.id
    });

  } catch (error) {
    console.error('apos;Erreur lors de l\'apos;inscription:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
