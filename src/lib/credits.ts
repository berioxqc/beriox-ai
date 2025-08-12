import { prisma } from "./prisma"
export interface CreditUsage {
  userId: string
  planId: string
  creditsUsed: number
  creditsLimit: number
  resetDate: Date
}

export interface RefundRequest {
  id: string
  userId: string
  missionId?: string
  amount: number
  reason: string
  description: string
  status: string
  createdAt: Date
  reviewedAt?: Date
  adminNotes?: string
}

export class CreditsService {
  /**
   * Initialise ou récupère les crédits d'un utilisateur
   */
  static async getUserCredits(userId: string, planId: string = "free"): Promise<CreditUsage> {
    let userCredits = await prisma.userCredits.findUnique({
      where: { userId }
    })
    if (!userCredits) {
      const creditsLimit = this.getCreditsLimitForPlan(planId)
      const resetDate = this.calculateNextResetDate()
      userCredits = await prisma.userCredits.create({
        data: {
          userId,
          planId,
          creditsLimit,
          resetDate,
          creditsUsed: 0
        }
      })
    }

    return userCredits
  }

  /**
   * Consomme des crédits pour un utilisateur
   */
  static async consumeCredits(userId: string, amount: number): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId)
    if (userCredits.creditsUsed + amount > userCredits.creditsLimit) {
      return false; // Pas assez de crédits
    }

    await prisma.userCredits.update({
      where: { userId },
      data: {
        creditsUsed: {
          increment: amount
        }
      }
    })
    return true
  }

  /**
   * Demande un remboursement
   */
  static async requestRefund(
    userId: string,
    amount: number,
    reason: string,
    description: string,
    missionId?: string
  ): Promise<RefundRequest> {
    const userCredits = await this.getUserCredits(userId)
    if (userCredits.creditsUsed < amount) {
      throw new Error("Vous ne pouvez pas demander un remboursement pour plus de crédits que vous n'en avez utilisés")
    }

    const refundRequest = await prisma.refundRequest.create({
      data: {
        userId,
        missionId,
        amount,
        reason,
        description,
        userCreditsId: userCredits.id
      }
    })
    return refundRequest
  }

  /**
   * Traite une demande de remboursement (admin)
   */
  static async processRefund(
    refundId: string,
    status: "APPROVED" | "REJECTED",
    adminNotes?: string,
    reviewedBy?: string
  ): Promise<void> {
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: { userCredits: true }
    })
    if (!refundRequest) {
      throw new Error("Demande de remboursement non trouvée")
    }

    if (refundRequest.status !== "PENDING") {
      throw new Error("Cette demande a déjà été traitée")
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      adminNotes
    }
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy
    }

    if (status === "APPROVED") {
      // Rembourser les crédits
      await prisma.$transaction([
        prisma.refundRequest.update({
          where: { id: refundId },
          data: updateData
        }),
        prisma.userCredits.update({
          where: { id: refundRequest.userCreditsId },
          data: {
            creditsUsed: {
              decrement: refundRequest.amount
            }
          }
        })
      ])
    } else {
      // Juste mettre à jour le statut
      await prisma.refundRequest.update({
        where: { id: refundId },
        data: updateData
      })
    }
  }

  /**
   * Reset mensuel des crédits
   */
  static async resetMonthlyCredits(): Promise<void> {
    const usersToReset = await prisma.userCredits.findMany({
      where: {
        resetDate: {
          lte: new Date()
        }
      }
    })
    for (const userCredits of usersToReset) {
      const nextResetDate = this.calculateNextResetDate()
      await prisma.userCredits.update({
        where: { id: userCredits.id },
        data: {
          creditsUsed: 0,
          resetDate: nextResetDate
        }
      })
    }
  }

  /**
   * Obtient les limites de crédits selon le plan
   */
  static getCreditsLimitForPlan(planId: string): number {
    switch (planId) {
      case "free": return 5
      case "pro": return 50
      case "enterprise": return 200
      default: return 5
    }
  }

  /**
   * Calcule la prochaine date de reset (jour de l'abonnement)
   */
  static calculateNextResetDate(): Date {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return nextMonth
  }

  /**
   * Vérifie si un utilisateur peut utiliser une fonctionnalité
   */
  static async canUseFeature(userId: string, featureCost: number = 1): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId)
    return userCredits.creditsUsed + featureCost <= userCredits.creditsLimit
  }

  /**
   * Obtient les statistiques de crédits pour l'admin
   */
  static async getAdminStats() {
    const totalUsers = await prisma.userCredits.count()
    const totalCreditsUsed = await prisma.userCredits.aggregate({
      _sum: {
        creditsUsed: true
      }
    })
    const pendingRefunds = await prisma.refundRequest.count({
      where: { status: "PENDING" }
    })
    return {
      totalUsers,
      totalCreditsUsed: totalCreditsUsed._sum.creditsUsed || 0,
      pendingRefunds
    }
  }
}
