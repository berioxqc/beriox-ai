import { ApiResponse } from 'apos;./types'apos;;

export class GitHubAPI {
  private token: string;
  private baseUrl = 'apos;https://api.github.com'apos;;

  constructor(token: string) {
    this.token = token;
  }

  async getRepositories(username?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = username 
        ? `${this.baseUrl}/users/${username}/repos`
        : `${this.baseUrl}/user/repos`;

      const response = await fetch(url, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();

      return {
        success: true,
        data: repos.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          lastUpdate: repo.updated_at,
          isPrivate: repo.private,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getCommits(owner: string, repo: string, since?: string): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (since) params.append('apos;since'apos;, since);

      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits?${params}`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const commits = await response.json();

      return {
        success: true,
        data: commits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url,
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getIssues(owner: string, repo: string, state: 'apos;open'apos; | 'apos;closed'apos; | 'apos;all'apos; = 'apos;open'apos;): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?state=${state}`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const issues = await response.json();

      return {
        success: true,
        data: issues.map((issue: any) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          author: issue.user.login,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          labels: issue.labels.map((label: any) => label.name),
          url: issue.html_url,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getPullRequests(owner: string, repo: string, state: 'apos;open'apos; | 'apos;closed'apos; | 'apos;all'apos; = 'apos;open'apos;): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls?state=${state}`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const prs = await response.json();

      return {
        success: true,
        data: prs.map((pr: any) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          author: pr.user.login,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          mergedAt: pr.merged_at,
          url: pr.html_url,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getContributorStats(owner: string, repo: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/stats/contributors`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const stats = await response.json();

      return {
        success: true,
        data: stats.map((stat: any) => ({
          author: stat.author.login,
          totalCommits: stat.total,
          additions: stat.weeks.reduce((sum: number, week: any) => sum + week.a, 0),
          deletions: stat.weeks.reduce((sum: number, week: any) => sum + week.d, 0),
          commits: stat.weeks.reduce((sum: number, week: any) => sum + week.c, 0),
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getRateLimit(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.token}`,
          'apos;Accept'apos;: 'apos;application/vnd.github.v3+json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.rate,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
