import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      )
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token de vérification invalide' },
        { status: 400 }
      )
    }

    // Vérifier si le token a expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      })
      return NextResponse.json(
        { error: 'Token de vérification expiré' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier l'email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })
    // Supprimer le token de vérification
    await prisma.verificationToken.delete({
      where: { token }
    })
    // Envoyer l'email de bienvenue
    await sendWelcomeEmail(user.email!, user.name)
    return NextResponse.json({
      message: 'Email vérifié avec succès ! Votre compte est maintenant actif.',
      userId: user.id
    })
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
