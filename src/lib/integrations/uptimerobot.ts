import { ApiResponse, UptimeData } from './types';

export class UptimeRobotAPI {
  private apiKey: string;
  private baseUrl = 'https://api.uptimerobot.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMonitors(): Promise<ApiResponse<UptimeData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/getMonitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'json',
          logs: '1',
          log_types: '1-2', // down et up events
          logs_limit: '10',
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'ok') {
        throw new Error(data.error?.message || 'UptimeRobot API error');
      }

      const monitors = data.monitors?.map((monitor: any) => {
        const incidents = monitor.logs?.map((log: any) => ({
          timestamp: new Date(log.datetime * 1000),
          duration: log.duration || 0,
          reason: log.reason?.detail || 'Unknown',
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'json',
          type: '1', // HTTP(s)
          url: url,
          friendly_name: friendlyName,
          interval: '300', // 5 minutes
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'ok') {
        throw new Error(data.error?.message || 'Failed to create monitor');
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'json',
          id: monitorId,
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.stat === 'ok',
        data: data.stat === 'ok',
        error: data.stat !== 'ok' ? data.error?.message : undefined,
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`UptimeRobot API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.stat !== 'ok') {
        throw new Error(data.error?.message || 'Failed to get account details');
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

  private mapStatus(status: number): 'up' | 'down' | 'paused' {
    switch (status) {
      case 0: return 'paused';
      case 1: return 'down';
      case 2: return 'up';
      case 8: return 'down'; // seems down
      case 9: return 'down'; // seems up
      default: return 'down';
    }
  }
}
