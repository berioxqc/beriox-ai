import { ApiResponse } from './types'
export class SlackAPI {
  private token: string
  private baseUrl = 'https://slack.com/api'
  constructor(token: string) {
    this.token = token
  }

  async sendMessage(channel: string, text: string, blocks?: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text,
          blocks,
        }),
      })
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Slack API error')
      }

      return {
        success: true,
        data: data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async sendMissionNotification(channel: string, mission: any): Promise<ApiResponse<any>> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚀 Nouvelle Mission Beriox AI',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Objectif:* ${mission.objective}\n*Priorité:* ${mission.priority || 'Auto'}\n*Statut:* ${mission.status}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Agents mobilisés:* ${mission.agents?.join(', ') || 'Aucun'}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Voir la mission',
            },
            url: `${process.env.NEXTAUTH_URL}/missions/${mission.id}`,
            style: 'primary',
          },
        ],
      },
    ]
    return this.sendMessage(channel, `Nouvelle mission créée: ${mission.objective}`, blocks)
  }

  async sendReportNotification(channel: string, mission: any, report: any): Promise<ApiResponse<any>> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Rapport Mission Terminée',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Mission:* ${mission.objective}\n*Résumé:* ${report.summary}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Prochaines étapes:* ${report.nextSteps || 'Aucune action définie'}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Voir le rapport',
            },
            url: `${process.env.NEXTAUTH_URL}/missions/${mission.id}`,
            style: 'primary',
          },
        ],
      },
    ]
    return this.sendMessage(channel, `Rapport de mission disponible: ${mission.objective}`, blocks)
  }

  async sendAlertNotification(channel: string, alert: any): Promise<ApiResponse<any>> {
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨',
    }
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji[alert.severity as keyof typeof severityEmoji]} Alerte ${alert.type}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Service:* ${alert.service}\n*Sévérité:* ${alert.severity}\n*Description:* ${alert.description}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Détecté le ${new Date(alert.timestamp).toLocaleString('fr-FR')}`,
          },
        ],
      },
    ]
    return this.sendMessage(channel, `Alerte ${alert.type}: ${alert.description}`, blocks)
  }

  async getChannels(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Slack API error')
      }

      return {
        success: true,
        data: data.channels?.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private,
          isMember: channel.is_member,
        })) || [],
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async testConnection(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth.test`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: data.ok,
        data: data.ok ? data : null,
        error: data.ok ? undefined : data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
