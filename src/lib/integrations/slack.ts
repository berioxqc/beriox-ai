import { ApiResponse } from 'apos;./types'apos;;

export class SlackAPI {
  private token: string;
  private baseUrl = 'apos;https://slack.com/api'apos;;

  constructor(token: string) {
    this.token = token;
  }

  async sendMessage(channel: string, text: string, blocks?: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          channel,
          text,
          blocks,
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'apos;Slack API error'apos;);
      }

      return {
        success: true,
        data: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendMissionNotification(channel: string, mission: any): Promise<ApiResponse<any>> {
    const blocks = [
      {
        type: 'apos;header'apos;,
        text: {
          type: 'apos;plain_text'apos;,
          text: 'apos;🚀 Nouvelle Mission Beriox AI'apos;,
        },
      },
      {
        type: 'apos;section'apos;,
        text: {
          type: 'apos;mrkdwn'apos;,
          text: `*Objectif:* ${mission.objective}\n*Priorité:* ${mission.priority || 'apos;Auto'apos;}\n*Statut:* ${mission.status}`,
        },
      },
      {
        type: 'apos;section'apos;,
        text: {
          type: 'apos;mrkdwn'apos;,
          text: `*Agents mobilisés:* ${mission.agents?.join('apos;, 'apos;) || 'apos;Aucun'apos;}`,
        },
      },
      {
        type: 'apos;actions'apos;,
        elements: [
          {
            type: 'apos;button'apos;,
            text: {
              type: 'apos;plain_text'apos;,
              text: 'apos;Voir la mission'apos;,
            },
            url: `${process.env.NEXTAUTH_URL}/missions/${mission.id}`,
            style: 'apos;primary'apos;,
          },
        ],
      },
    ];

    return this.sendMessage(channel, `Nouvelle mission créée: ${mission.objective}`, blocks);
  }

  async sendReportNotification(channel: string, mission: any, report: any): Promise<ApiResponse<any>> {
    const blocks = [
      {
        type: 'apos;header'apos;,
        text: {
          type: 'apos;plain_text'apos;,
          text: 'apos;📊 Rapport Mission Terminée'apos;,
        },
      },
      {
        type: 'apos;section'apos;,
        text: {
          type: 'apos;mrkdwn'apos;,
          text: `*Mission:* ${mission.objective}\n*Résumé:* ${report.summary}`,
        },
      },
      {
        type: 'apos;section'apos;,
        text: {
          type: 'apos;mrkdwn'apos;,
          text: `*Prochaines étapes:* ${report.nextSteps || 'apos;Aucune action définie'apos;}`,
        },
      },
      {
        type: 'apos;actions'apos;,
        elements: [
          {
            type: 'apos;button'apos;,
            text: {
              type: 'apos;plain_text'apos;,
              text: 'apos;Voir le rapport'apos;,
            },
            url: `${process.env.NEXTAUTH_URL}/missions/${mission.id}`,
            style: 'apos;primary'apos;,
          },
        ],
      },
    ];

    return this.sendMessage(channel, `Rapport de mission disponible: ${mission.objective}`, blocks);
  }

  async sendAlertNotification(channel: string, alert: any): Promise<ApiResponse<any>> {
    const severityEmoji = {
      low: 'apos;🟡'apos;,
      medium: 'apos;🟠'apos;,
      high: 'apos;🔴'apos;,
      critical: 'apos;🚨'apos;,
    };

    const blocks = [
      {
        type: 'apos;header'apos;,
        text: {
          type: 'apos;plain_text'apos;,
          text: `${severityEmoji[alert.severity as keyof typeof severityEmoji]} Alerte ${alert.type}`,
        },
      },
      {
        type: 'apos;section'apos;,
        text: {
          type: 'apos;mrkdwn'apos;,
          text: `*Service:* ${alert.service}\n*Sévérité:* ${alert.severity}\n*Description:* ${alert.description}`,
        },
      },
      {
        type: 'apos;context'apos;,
        elements: [
          {
            type: 'apos;mrkdwn'apos;,
            text: `Détecté le ${new Date(alert.timestamp).toLocaleString('apos;fr-FR'apos;)}`,
          },
        ],
      },
    ];

    return this.sendMessage(channel, `Alerte ${alert.type}: ${alert.description}`, blocks);
  }

  async getChannels(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.list`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'apos;Slack API error'apos;);
      }

      return {
        success: true,
        data: data.channels?.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private,
          isMember: channel.is_member,
        })) || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testConnection(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth.test`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.ok,
        data: data.ok ? data : null,
        error: data.ok ? undefined : data.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
