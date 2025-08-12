import { logger } from 'apos;./logger'apos;;
import { metrics } from 'apos;./metrics'apos;;

export enum TimeEntryType {
  TIMER = 'apos;timer'apos;,
  MANUAL = 'apos;manual'apos;,
  IMPORTED = 'apos;imported'apos;
}

export enum TimeEntryStatus {
  ACTIVE = 'apos;active'apos;,
  PAUSED = 'apos;paused'apos;,
  COMPLETED = 'apos;completed'apos;,
  APPROVED = 'apos;approved'apos;,
  REJECTED = 'apos;rejected'apos;
}

export enum ProjectStatus {
  ACTIVE = 'apos;active'apos;,
  COMPLETED = 'apos;completed'apos;,
  ON_HOLD = 'apos;on_hold'apos;,
  CANCELLED = 'apos;cancelled'apos;
}

export enum ClientStatus {
  ACTIVE = 'apos;active'apos;,
  INACTIVE = 'apos;inactive'apos;,
  ARCHIVED = 'apos;archived'apos;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en secondes
  type: TimeEntryType;
  status: TimeEntryStatus;
  billable: boolean;
  hourlyRate?: number;
  tags: string[];
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    deviceId: string;
    deviceType: 'apos;desktop'apos; | 'apos;mobile'apos; | 'apos;tablet'apos;;
    appVersion: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  hourlyRate?: number;
  color?: string;
  tags: string[];
  teamMembers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: ClientStatus;
  hourlyRate?: number;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'apos;todo'apos; | 'apos;in_progress'apos; | 'apos;completed'apos;;
  priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  billableHours: number;
  status: 'apos;draft'apos; | 'apos;submitted'apos; | 'apos;approved'apos; | 'apos;rejected'apos;;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  entries: TimeEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  projectId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  receipt?: string;
  date: Date;
  status: 'apos;pending'apos; | 'apos;approved'apos; | 'apos;rejected'apos;;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  number: string;
  issueDate: Date;
  dueDate: Date;
  status: 'apos;draft'apos; | 'apos;sent'apos; | 'apos;paid'apos; | 'apos;overdue'apos; | 'apos;cancelled'apos;;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'apos;time'apos; | 'apos;expense'apos; | 'apos;product'apos;;
  timeEntryId?: string;
  expenseId?: string;
}

export interface TimeTrackingSettings {
  userId: string;
  defaultHourlyRate: number;
  currency: string;
  timezone: string;
  workDays: number[]; // 0-6 (dimanche-samedi)
  workHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  breakTime: number; // en minutes
  autoStart: boolean;
  idleDetection: boolean;
  idleThreshold: number; // en minutes
  reminders: {
    enabled: boolean;
    interval: number; // en minutes
  };
  integrations: {
    calendar: boolean;
    projectManagement: boolean;
    accounting: boolean;
  };
  notifications: {
    timesheetReminder: boolean;
    approvalNotification: boolean;
    invoiceReminder: boolean;
  };
}

export interface TimeTrackingStats {
  userId: string;
  period: 'apos;day'apos; | 'apos;week'apos; | 'apos;month'apos; | 'apos;year'apos;;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    billableHours: number;
  }[];
  productivity: {
    averageHoursPerDay: number;
    mostProductiveDay: string;
    leastProductiveDay: string;
  };
  earnings: {
    total: number;
    billable: number;
    pending: number;
  };
}

class TimeTrackingManager {
  private timeEntries: Map<string, TimeEntry> = new Map();
  private projects: Map<string, Project> = new Map();
  private clients: Map<string, Client> = new Map();
  private tasks: Map<string, Task> = new Map();
  private timesheets: Map<string, Timesheet> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private settings: Map<string, TimeTrackingSettings> = new Map();
  private activeTimers: Map<string, TimeEntry> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Créer des données de démonstration
    this.createDefaultClient();
    this.createDefaultProject();
    this.createDefaultTasks();
  }

  private createDefaultClient() {
    const client: Client = {
      id: 'apos;demo-client-1'apos;,
      name: 'apos;Client Démo'apos;,
      email: 'apos;demo@client.com'apos;,
      status: ClientStatus.ACTIVE,
      hourlyRate: 75,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clients.set(client.id, client);
  }

  private createDefaultProject() {
    const project: Project = {
      id: 'apos;demo-project-1'apos;,
      name: 'apos;Projet Démo'apos;,
      description: 'apos;Projet de démonstration pour le Time Tracking'apos;,
      clientId: 'apos;demo-client-1'apos;,
      status: ProjectStatus.ACTIVE,
      startDate: new Date(),
      budget: 5000,
      hourlyRate: 75,
      color: 'apos;#3B82F6'apos;,
      tags: ['apos;démo'apos;, 'apos;time-tracking'apos;],
      teamMembers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(project.id, project);
  }

  private createDefaultTasks() {
    const tasks = [
      {
        id: 'apos;demo-task-1'apos;,
        name: 'apos;Configuration initiale'apos;,
        description: 'apos;Configuration du système de Time Tracking'apos;,
        status: 'apos;completed'apos; as const,
        priority: 'apos;high'apos; as const,
        estimatedHours: 2,
        tags: ['apos;setup'apos;, 'apos;configuration'apos;]
      },
      {
        id: 'apos;demo-task-2'apos;,
        name: 'apos;Tests et validation'apos;,
        description: 'apos;Tests du système de Time Tracking'apos;,
        status: 'apos;in_progress'apos; as const,
        priority: 'apos;medium'apos; as const,
        estimatedHours: 4,
        tags: ['apos;testing'apos;, 'apos;validation'apos;]
      },
      {
        id: 'apos;demo-task-3'apos;,
        name: 'apos;Documentation'apos;,
        description: 'apos;Rédaction de la documentation'apos;,
        status: 'apos;todo'apos; as const,
        priority: 'apos;low'apos; as const,
        estimatedHours: 3,
        tags: ['apos;documentation'apos;]
      }
    ];

    tasks.forEach(task => {
      const fullTask: Task = {
        ...task,
        projectId: 'apos;demo-project-1'apos;,
        actualHours: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.tasks.set(fullTask.id, fullTask);
    });
  }

  // Gestion des entrées de temps
  startTimer(userId: string, projectId: string, description: string, taskId?: string): TimeEntry {
    // Arrêter le timer actuel s'apos;il y en a un
    this.stopActiveTimer(userId);

    const entry: TimeEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      taskId,
      description,
      startTime: new Date(),
      duration: 0,
      type: TimeEntryType.TIMER,
      status: TimeEntryStatus.ACTIVE,
      billable: true,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timeEntries.set(entry.id, entry);
    this.activeTimers.set(userId, entry);

    logger.info(`Timer started for user: ${userId}`, {
      action: 'apos;timer_started'apos;,
      metadata: { userId, projectId, taskId, entryId: entry.id }
    });

    metrics.increment('apos;timer_started'apos;, 1, {
      userId,
      projectId,
      hasTask: taskId ? 'apos;true'apos; : 'apos;false'apos;
    });

    return entry;
  }

  stopTimer(userId: string): TimeEntry | null {
    const activeEntry = this.activeTimers.get(userId);
    if (!activeEntry) return null;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 1000);

    activeEntry.endTime = endTime;
    activeEntry.duration = duration;
    activeEntry.status = TimeEntryStatus.COMPLETED;
    activeEntry.updatedAt = new Date();

    this.timeEntries.set(activeEntry.id, activeEntry);
    this.activeTimers.delete(userId);

    logger.info(`Timer stopped for user: ${userId}`, {
      action: 'apos;timer_stopped'apos;,
      metadata: { userId, entryId: activeEntry.id, duration }
    });

    metrics.increment('apos;timer_stopped'apos;, 1, {
      userId,
      projectId: activeEntry.projectId,
      duration: Math.floor(duration / 60) // en minutes
    });

    return activeEntry;
  }

  pauseTimer(userId: string): TimeEntry | null {
    const activeEntry = this.activeTimers.get(userId);
    if (!activeEntry) return null;

    activeEntry.status = TimeEntryStatus.PAUSED;
    activeEntry.updatedAt = new Date();

    this.timeEntries.set(activeEntry.id, activeEntry);

    logger.info(`Timer paused for user: ${userId}`, {
      action: 'apos;timer_paused'apos;,
      metadata: { userId, entryId: activeEntry.id }
    });

    return activeEntry;
  }

  resumeTimer(userId: string): TimeEntry | null {
    const activeEntry = this.activeTimers.get(userId);
    if (!activeEntry || activeEntry.status !== TimeEntryStatus.PAUSED) return null;

    activeEntry.status = TimeEntryStatus.ACTIVE;
    activeEntry.updatedAt = new Date();

    this.timeEntries.set(activeEntry.id, activeEntry);

    logger.info(`Timer resumed for user: ${userId}`, {
      action: 'apos;timer_resumed'apos;,
      metadata: { userId, entryId: activeEntry.id }
    });

    return activeEntry;
  }

  private stopActiveTimer(userId: string): void {
    const activeEntry = this.activeTimers.get(userId);
    if (activeEntry) {
      this.stopTimer(userId);
    }
  }

  addManualEntry(
    userId: string,
    projectId: string,
    description: string,
    startTime: Date,
    endTime: Date,
    taskId?: string,
    billable: boolean = true,
    tags: string[] = []
  ): TimeEntry {
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const entry: TimeEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      taskId,
      description,
      startTime,
      endTime,
      duration,
      type: TimeEntryType.MANUAL,
      status: TimeEntryStatus.COMPLETED,
      billable,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timeEntries.set(entry.id, entry);

    logger.info(`Manual entry added for user: ${userId}`, {
      action: 'apos;manual_entry_added'apos;,
      metadata: { userId, projectId, duration, billable }
    });

    metrics.increment('apos;manual_entry_added'apos;, 1, {
      userId,
      projectId,
      billable: billable.toString()
    });

    return entry;
  }

  updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): TimeEntry | null {
    const entry = this.timeEntries.get(entryId);
    if (!entry) return null;

    const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
    this.timeEntries.set(entryId, updatedEntry);

    logger.info(`Time entry updated: ${entryId}`, {
      action: 'apos;time_entry_updated'apos;,
      metadata: { entryId, userId: entry.userId }
    });

    return updatedEntry;
  }

  deleteTimeEntry(entryId: string): boolean {
    const entry = this.timeEntries.get(entryId);
    if (!entry) return false;

    this.timeEntries.delete(entryId);

    logger.info(`Time entry deleted: ${entryId}`, {
      action: 'apos;time_entry_deleted'apos;,
      metadata: { entryId, userId: entry.userId }
    });

    return true;
  }

  getTimeEntries(userId: string, filters?: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: TimeEntryStatus;
    billable?: boolean;
  }): TimeEntry[] {
    let entries = Array.from(this.timeEntries.values()).filter(entry => entry.userId === userId);

    if (filters) {
      if (filters.projectId) {
        entries = entries.filter(entry => entry.projectId === filters.projectId);
      }
      if (filters.startDate) {
        entries = entries.filter(entry => entry.startTime >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(entry => entry.startTime <= filters.endDate!);
      }
      if (filters.status) {
        entries = entries.filter(entry => entry.status === filters.status);
      }
      if (filters.billable !== undefined) {
        entries = entries.filter(entry => entry.billable === filters.billable);
      }
    }

    return entries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  getActiveTimer(userId: string): TimeEntry | null {
    return this.activeTimers.get(userId) || null;
  }

  // Gestion des projets
  createProject(project: Omit<Project, 'apos;id'apos; | 'apos;createdAt'apos; | 'apos;updatedAt'apos;>): Project {
    const newProject: Project = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(newProject.id, newProject);

    logger.info(`Project created: ${newProject.name}`, {
      action: 'apos;project_created'apos;,
      metadata: { projectId: newProject.id, clientId: newProject.clientId }
    });

    return newProject;
  }

  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(projectId, updatedProject);

    return updatedProject;
  }

  getProjects(userId?: string): Project[] {
    let projects = Array.from(this.projects.values());
    
    if (userId) {
      // Filtrer par membres de l'apos;équipe
      projects = projects.filter(project => project.teamMembers.includes(userId));
    }

    return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Gestion des clients
  createClient(client: Omit<Client, 'apos;id'apos; | 'apos;createdAt'apos; | 'apos;updatedAt'apos;>): Client {
    const newClient: Client = {
      ...client,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.clients.set(newClient.id, newClient);

    logger.info(`Client created: ${newClient.name}`, {
      action: 'apos;client_created'apos;,
      metadata: { clientId: newClient.id }
    });

    return newClient;
  }

  getClients(): Client[] {
    return Array.from(this.clients.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Gestion des tâches
  createTask(task: Omit<Task, 'apos;id'apos; | 'apos;createdAt'apos; | 'apos;updatedAt'apos;>): Task {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(newTask.id, newTask);

    logger.info(`Task created: ${newTask.name}`, {
      action: 'apos;task_created'apos;,
      metadata: { taskId: newTask.id, projectId: newTask.projectId }
    });

    return newTask;
  }

  getTasks(projectId?: string): Task[] {
    let tasks = Array.from(this.tasks.values());
    
    if (projectId) {
      tasks = tasks.filter(task => task.projectId === projectId);
    }

    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Gestion des feuilles de temps
  createTimesheet(userId: string, weekStart: Date): Timesheet {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const entries = this.getTimeEntries(userId, {
      startDate: weekStart,
      endDate: weekEnd
    });

    const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 3600;
    const billableHours = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0) / 3600;

    const timesheet: Timesheet = {
      id: `timesheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      weekStart,
      weekEnd,
      totalHours,
      billableHours,
      status: 'apos;draft'apos;,
      entries,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timesheets.set(timesheet.id, timesheet);

    logger.info(`Timesheet created for user: ${userId}`, {
      action: 'apos;timesheet_created'apos;,
      metadata: { userId, timesheetId: timesheet.id, totalHours, billableHours }
    });

    return timesheet;
  }

  submitTimesheet(timesheetId: string): Timesheet | null {
    const timesheet = this.timesheets.get(timesheetId);
    if (!timesheet) return null;

    timesheet.status = 'apos;submitted'apos;;
    timesheet.updatedAt = new Date();

    this.timesheets.set(timesheetId, timesheet);

    logger.info(`Timesheet submitted: ${timesheetId}`, {
      action: 'apos;timesheet_submitted'apos;,
      metadata: { timesheetId, userId: timesheet.userId }
    });

    return timesheet;
  }

  approveTimesheet(timesheetId: string, approvedBy: string): Timesheet | null {
    const timesheet = this.timesheets.get(timesheetId);
    if (!timesheet) return null;

    timesheet.status = 'apos;approved'apos;;
    timesheet.approvedBy = approvedBy;
    timesheet.approvedAt = new Date();
    timesheet.updatedAt = new Date();

    this.timesheets.set(timesheetId, timesheet);

    logger.info(`Timesheet approved: ${timesheetId}`, {
      action: 'apos;timesheet_approved'apos;,
      metadata: { timesheetId, approvedBy }
    });

    return timesheet;
  }

  // Gestion des dépenses
  addExpense(expense: Omit<Expense, 'apos;id'apos; | 'apos;createdAt'apos; | 'apos;updatedAt'apos;>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.expenses.set(newExpense.id, newExpense);

    logger.info(`Expense added: ${newExpense.description}`, {
      action: 'apos;expense_added'apos;,
      metadata: { expenseId: newExpense.id, userId: newExpense.userId, amount: newExpense.amount }
    });

    return newExpense;
  }

  getExpenses(userId?: string, projectId?: string): Expense[] {
    let expenses = Array.from(this.expenses.values());
    
    if (userId) {
      expenses = expenses.filter(expense => expense.userId === userId);
    }
    
    if (projectId) {
      expenses = expenses.filter(expense => expense.projectId === projectId);
    }

    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Gestion des factures
  createInvoice(invoice: Omit<Invoice, 'apos;id'apos; | 'apos;createdAt'apos; | 'apos;updatedAt'apos;>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.invoices.set(newInvoice.id, newInvoice);

    logger.info(`Invoice created: ${newInvoice.number}`, {
      action: 'apos;invoice_created'apos;,
      metadata: { invoiceId: newInvoice.id, clientId: newInvoice.clientId, total: newInvoice.total }
    });

    return newInvoice;
  }

  getInvoices(clientId?: string): Invoice[] {
    let invoices = Array.from(this.invoices.values());
    
    if (clientId) {
      invoices = invoices.filter(invoice => invoice.clientId === clientId);
    }

    return invoices.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }

  // Statistiques et rapports
  getTimeTrackingStats(userId: string, period: 'apos;day'apos; | 'apos;week'apos; | 'apos;month'apos; | 'apos;year'apos;): TimeTrackingStats {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'apos;day'apos;:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'apos;week'apos;:
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'apos;month'apos;:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'apos;year'apos;:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const entries = this.getTimeEntries(userId, { startDate, endDate: now });
    const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 3600;
    const billableHours = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0) / 3600;

    // Grouper par projet
    const projectStats = new Map<string, { hours: number; billableHours: number }>();
    entries.forEach(entry => {
      const project = this.projects.get(entry.projectId);
      if (!project) return;

      const current = projectStats.get(entry.projectId) || { hours: 0, billableHours: 0 };
      current.hours += entry.duration / 3600;
      if (entry.billable) {
        current.billableHours += entry.duration / 3600;
      }
      projectStats.set(entry.projectId, current);
    });

    const projects = Array.from(projectStats.entries()).map(([projectId, stats]) => {
      const project = this.projects.get(projectId);
      return {
        projectId,
        projectName: project?.name || 'apos;Projet inconnu'apos;,
        hours: stats.hours,
        billableHours: stats.billableHours
      };
    });

    return {
      userId,
      period,
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      projects,
      productivity: {
        averageHoursPerDay: totalHours / 7, // Simplifié
        mostProductiveDay: 'apos;Lundi'apos;, // Simplifié
        leastProductiveDay: 'apos;Dimanche'apos; // Simplifié
      },
      earnings: {
        total: billableHours * 75, // Taux horaire par défaut
        billable: billableHours * 75,
        pending: 0 // À calculer selon les factures
      }
    };
  }

  // Paramètres utilisateur
  getUserSettings(userId: string): TimeTrackingSettings {
    const defaultSettings: TimeTrackingSettings = {
      userId,
      defaultHourlyRate: 75,
      currency: 'apos;CAD'apos;,
      timezone: 'apos;America/Montreal'apos;,
      workDays: [1, 2, 3, 4, 5], // Lundi à vendredi
      workHours: {
        start: 'apos;09:00'apos;,
        end: 'apos;17:00'apos;
      },
      breakTime: 60,
      autoStart: false,
      idleDetection: true,
      idleThreshold: 5,
      reminders: {
        enabled: true,
        interval: 30
      },
      integrations: {
        calendar: false,
        projectManagement: false,
        accounting: false
      },
      notifications: {
        timesheetReminder: true,
        approvalNotification: true,
        invoiceReminder: true
      }
    };

    return this.settings.get(userId) || defaultSettings;
  }

  updateUserSettings(userId: string, updates: Partial<TimeTrackingSettings>): TimeTrackingSettings {
    const currentSettings = this.getUserSettings(userId);
    const updatedSettings = { ...currentSettings, ...updates };
    
    this.settings.set(userId, updatedSettings);

    logger.info(`User settings updated: ${userId}`, {
      action: 'apos;user_settings_updated'apos;,
      metadata: { userId }
    });

    return updatedSettings;
  }

  // Utilitaires
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  calculateBillableAmount(entry: TimeEntry, hourlyRate?: number): number {
    const rate = hourlyRate || entry.hourlyRate || 75;
    return (entry.duration / 3600) * rate;
  }

  // Nettoyage et maintenance
  cleanupOldData(daysToKeep: number = 365): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Nettoyer les entrées de temps anciennes
    for (const [id, entry] of this.timeEntries.entries()) {
      if (entry.createdAt < cutoffDate) {
        this.timeEntries.delete(id);
      }
    }

    logger.info(`Old data cleaned up`, {
      action: 'apos;old_data_cleaned'apos;,
      metadata: { cutoffDate, daysToKeep }
    });
  }
}

// Instance globale
export const timeTrackingManager = new TimeTrackingManager();

// Fonctions utilitaires
export const startTimer = (userId: string, projectId: string, description: string, taskId?: string) => {
  return timeTrackingManager.startTimer(userId, projectId, description, taskId);
};

export const stopTimer = (userId: string) => {
  return timeTrackingManager.stopTimer(userId);
};

export const pauseTimer = (userId: string) => {
  return timeTrackingManager.pauseTimer(userId);
};

export const resumeTimer = (userId: string) => {
  return timeTrackingManager.resumeTimer(userId);
};

export const addManualEntry = (
  userId: string,
  projectId: string,
  description: string,
  startTime: Date,
  endTime: Date,
  taskId?: string,
  billable?: boolean,
  tags?: string[]
) => {
  return timeTrackingManager.addManualEntry(userId, projectId, description, startTime, endTime, taskId, billable, tags);
};

export const getTimeEntries = (userId: string, filters?: any) => {
  return timeTrackingManager.getTimeEntries(userId, filters);
};

export const getActiveTimer = (userId: string) => {
  return timeTrackingManager.getActiveTimer(userId);
};

export const createProject = (project: any) => {
  return timeTrackingManager.createProject(project);
};

export const getProjects = (userId?: string) => {
  return timeTrackingManager.getProjects(userId);
};

export const createClient = (client: any) => {
  return timeTrackingManager.createClient(client);
};

export const getClients = () => {
  return timeTrackingManager.getClients();
};

export const createTask = (task: any) => {
  return timeTrackingManager.createTask(task);
};

export const getTasks = (projectId?: string) => {
  return timeTrackingManager.getTasks(projectId);
};

export const createTimesheet = (userId: string, weekStart: Date) => {
  return timeTrackingManager.createTimesheet(userId, weekStart);
};

export const submitTimesheet = (timesheetId: string) => {
  return timeTrackingManager.submitTimesheet(timesheetId);
};

export const approveTimesheet = (timesheetId: string, approvedBy: string) => {
  return timeTrackingManager.approveTimesheet(timesheetId, approvedBy);
};

export const addExpense = (expense: any) => {
  return timeTrackingManager.addExpense(expense);
};

export const getExpenses = (userId?: string, projectId?: string) => {
  return timeTrackingManager.getExpenses(userId, projectId);
};

export const createInvoice = (invoice: any) => {
  return timeTrackingManager.createInvoice(invoice);
};

export const getInvoices = (clientId?: string) => {
  return timeTrackingManager.getInvoices(clientId);
};

export const getTimeTrackingStats = (userId: string, period: 'apos;day'apos; | 'apos;week'apos; | 'apos;month'apos; | 'apos;year'apos;) => {
  return timeTrackingManager.getTimeTrackingStats(userId, period);
};

export const getUserSettings = (userId: string) => {
  return timeTrackingManager.getUserSettings(userId);
};

export const updateUserSettings = (userId: string, updates: any) => {
  return timeTrackingManager.updateUserSettings(userId, updates);
};

export const formatDuration = (seconds: number) => {
  return timeTrackingManager.formatDuration(seconds);
};
