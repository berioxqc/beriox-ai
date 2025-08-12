import { ApiResponse, UptimeData } from 'apos;./types'apos;;

export class UptimeRobotAPI {
  private apiKey: string;
  private baseUrl = 'apos;https://api.uptimerobot.com/v2'apos;;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMonitors(): Promise<ApiResponse<UptimeData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/getMonitors`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/x-www-form-urlencoded'apos;,
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'apos;json'apos;,
          logs: 'apos;1'apos;,
          log_types: 'apos;1-2'apos;, // down et up events
          logs_limit: 'apos;10'apos;,
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'apos;ok'apos;) {
        throw new Error(data.error?.message || 'apos;UptimeRobot API error'apos;);
      }

      const monitors = data.monitors?.map((monitor: any) => {
        const incidents = monitor.logs?.map((log: any) => ({
          timestamp: new Date(log.datetime * 1000),
          duration: log.duration || 0,
          reason: log.reason?.detail || 'apos;Unknown'apos;,
        })) || [];

        return {
          url: monitor.friendly_name || monitor.url,
          status: this.mapStatus(monitor.status),
          uptimePercentage: parseFloat(monitor.all_time_uptime_ratio) || 0,
          responseTime: monitor.average_response_time || 0,
          incidents,
        };
      }) || [];

      return {
        success: true,
        data: monitors,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createMonitor(url: string, friendlyName: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/newMonitor`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/x-www-form-urlencoded'apos;,
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'apos;json'apos;,
          type: 'apos;1'apos;, // HTTP(s)
          url: url,
          friendly_name: friendlyName,
          interval: 'apos;300'apos;, // 5 minutes
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'apos;ok'apos;) {
        throw new Error(data.error?.message || 'apos;Failed to create monitor'apos;);
      }

      return {
        success: true,
        data: data.monitor,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteMonitor(monitorId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/deleteMonitor`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/x-www-form-urlencoded'apos;,
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'apos;json'apos;,
          id: monitorId,
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.stat === 'apos;ok'apos;,
        data: data.stat === 'apos;ok'apos;,
        error: data.stat !== 'apos;ok'apos; ? data.error?.message : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAccountDetails(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/getAccountDetails`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/x-www-form-urlencoded'apos;,
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'apos;json'apos;,
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'apos;ok'apos;) {
        throw new Error(data.error?.message || 'apos;Failed to get account details'apos;);
      }

      return {
        success: true,
        data: data.account,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private mapStatus(status: number): 'apos;up'apos; | 'apos;down'apos; | 'apos;paused'apos; {
    switch (status) {
      case 0: return 'apos;paused'apos;;
      case 1: return 'apos;down'apos;;
      case 2: return 'apos;up'apos;;
      case 8: return 'apos;down'apos;; // seems down
      case 9: return 'apos;down'apos;; // seems up
      default: return 'apos;down'apos;;
    }
  }
}
