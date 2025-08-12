import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  timeTrackingManager,
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
  addManualEntry,
  getTimeEntries,
  getActiveTimer,
  createProject,
  getProjects,
  createClient,
  getClients,
  createTask,
  getTasks,
  createTimesheet,
  submitTimesheet,
  approveTimesheet,
  addExpense,
  getExpenses,
  createInvoice,
  getInvoices,
  getTimeTrackingStats,
  getUserSettings,
  updateUserSettings
} from '@/lib/time-tracking';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

// GET - Obtenir les entrées de temps
async function getTimeEntriesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const billable = searchParams.get('billable');

    const filters: any = {};
    if (projectId) filters.projectId = projectId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (status) filters.status = status;
    if (billable !== null) filters.billable = billable === 'true';

    const entries = getTimeEntries(session.user.id, filters);

    logger.info('Time entries requested', {
      action: 'time_entries_requested',
      metadata: {
        userId: session.user.id,
        filters,
        count: entries.length
      }
    });

    return NextResponse.json({
      entries,
      count: entries.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get time entries', error as Error, {
      action: 'time_entries_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get time entries' },
      { status: 500 }
    );
  }
}

// GET - Obtenir le timer actif
async function getActiveTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeTimer = getActiveTimer(session.user.id);

    return NextResponse.json({
      activeTimer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get active timer', error as Error, {
      action: 'active_timer_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get active timer' },
      { status: 500 }
    );
  }
}

// POST - Démarrer un timer
async function startTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, description, taskId } = body;

    if (!projectId || !description) {
      return NextResponse.json(
        { error: 'Project ID and description are required' },
        { status: 400 }
      );
    }

    const entry = startTimer(session.user.id, projectId, description, taskId);

    logger.info('Timer started', {
      action: 'timer_started',
      metadata: {
        userId: session.user.id,
        projectId,
        taskId,
        entryId: entry.id
      }
    });

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to start timer', error as Error, {
      action: 'timer_start_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    );
  }
}

// PUT - Arrêter un timer
async function stopTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entry = stopTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'No active timer found' },
        { status: 404 }
      );
    }

    logger.info('Timer stopped', {
      action: 'timer_stopped',
      metadata: {
        userId: session.user.id,
        entryId: entry.id,
        duration: entry.duration
      }
    });

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to stop timer', error as Error, {
      action: 'timer_stop_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    );
  }
}

// PUT - Mettre en pause un timer
async function pauseTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entry = pauseTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'No active timer found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to pause timer', error as Error, {
      action: 'timer_pause_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to pause timer' },
      { status: 500 }
    );
  }
}

// PUT - Reprendre un timer
async function resumeTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entry = resumeTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'No paused timer found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to resume timer', error as Error, {
      action: 'timer_resume_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to resume timer' },
      { status: 500 }
    );
  }
}

// POST - Ajouter une entrée manuelle
async function addManualEntryHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, description, startTime, endTime, taskId, billable, tags } = body;

    if (!projectId || !description || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Project ID, description, start time, and end time are required' },
        { status: 400 }
      );
    }

    const entry = addManualEntry(
      session.user.id,
      projectId,
      description,
      new Date(startTime),
      new Date(endTime),
      taskId,
      billable,
      tags
    );

    logger.info('Manual entry added', {
      action: 'manual_entry_added',
      metadata: {
        userId: session.user.id,
        projectId,
        duration: entry.duration,
        billable: entry.billable
      }
    });

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to add manual entry', error as Error, {
      action: 'manual_entry_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to add manual entry' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les projets
async function getProjectsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = getProjects(session.user.id);

    return NextResponse.json({
      projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get projects', error as Error, {
      action: 'projects_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    );
  }
}

// POST - Créer un projet
async function createProjectHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const project = createProject(body);

    logger.info('Project created', {
      action: 'project_created',
      metadata: {
        userId: session.user.id,
        projectId: project.id,
        projectName: project.name
      }
    });

    return NextResponse.json({
      project,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to create project', error as Error, {
      action: 'project_creation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les clients
async function getClientsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clients = getClients();

    return NextResponse.json({
      clients,
      count: clients.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get clients', error as Error, {
      action: 'clients_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get clients' },
      { status: 500 }
    );
  }
}

// POST - Créer un client
async function createClientHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const client = createClient(body);

    logger.info('Client created', {
      action: 'client_created',
      metadata: {
        userId: session.user.id,
        clientId: client.id,
        clientName: client.name
      }
    });

    return NextResponse.json({
      client,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to create client', error as Error, {
      action: 'client_creation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les tâches
async function getTasksHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const tasks = getTasks(projectId || undefined);

    return NextResponse.json({
      tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get tasks', error as Error, {
      action: 'tasks_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get tasks' },
      { status: 500 }
    );
  }
}

// POST - Créer une tâche
async function createTaskHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const task = createTask(body);

    logger.info('Task created', {
      action: 'task_created',
      metadata: {
        userId: session.user.id,
        taskId: task.id,
        taskName: task.name,
        projectId: task.projectId
      }
    });

    return NextResponse.json({
      task,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to create task', error as Error, {
      action: 'task_creation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// POST - Créer une feuille de temps
async function createTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { weekStart } = body;

    if (!weekStart) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      );
    }

    const timesheet = createTimesheet(session.user.id, new Date(weekStart));

    logger.info('Timesheet created', {
      action: 'timesheet_created',
      metadata: {
        userId: session.user.id,
        timesheetId: timesheet.id,
        totalHours: timesheet.totalHours
      }
    });

    return NextResponse.json({
      timesheet,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to create timesheet', error as Error, {
      action: 'timesheet_creation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to create timesheet' },
      { status: 500 }
    );
  }
}

// PUT - Soumettre une feuille de temps
async function submitTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { timesheetId } = body;

    if (!timesheetId) {
      return NextResponse.json(
        { error: 'Timesheet ID is required' },
        { status: 400 }
      );
    }

    const timesheet = submitTimesheet(timesheetId);

    if (!timesheet) {
      return NextResponse.json(
        { error: 'Timesheet not found' },
        { status: 404 }
      );
    }

    logger.info('Timesheet submitted', {
      action: 'timesheet_submitted',
      metadata: {
        userId: session.user.id,
        timesheetId
      }
    });

    return NextResponse.json({
      timesheet,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to submit timesheet', error as Error, {
      action: 'timesheet_submit_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to submit timesheet' },
      { status: 500 }
    );
  }
}

// PUT - Approuver une feuille de temps (admin uniquement)
async function approveTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { timesheetId } = body;

    if (!timesheetId) {
      return NextResponse.json(
        { error: 'Timesheet ID is required' },
        { status: 400 }
      );
    }

    const timesheet = approveTimesheet(timesheetId, session.user.id);

    if (!timesheet) {
      return NextResponse.json(
        { error: 'Timesheet not found' },
        { status: 404 }
      );
    }

    logger.info('Timesheet approved', {
      action: 'timesheet_approved',
      metadata: {
        approvedBy: session.user.id,
        timesheetId
      }
    });

    return NextResponse.json({
      timesheet,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to approve timesheet', error as Error, {
      action: 'timesheet_approval_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to approve timesheet' },
      { status: 500 }
    );
  }
}

// POST - Ajouter une dépense
async function addExpenseHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const expense = addExpense(body);

    logger.info('Expense added', {
      action: 'expense_added',
      metadata: {
        userId: session.user.id,
        expenseId: expense.id,
        amount: expense.amount
      }
    });

    return NextResponse.json({
      expense,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to add expense', error as Error, {
      action: 'expense_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les dépenses
async function getExpensesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const expenses = getExpenses(session.user.id, projectId || undefined);

    return NextResponse.json({
      expenses,
      count: expenses.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get expenses', error as Error, {
      action: 'expenses_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get expenses' },
      { status: 500 }
    );
  }
}

// POST - Créer une facture
async function createInvoiceHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const invoice = createInvoice(body);

    logger.info('Invoice created', {
      action: 'invoice_created',
      metadata: {
        userId: session.user.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        total: invoice.total
      }
    });

    return NextResponse.json({
      invoice,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('Failed to create invoice', error as Error, {
      action: 'invoice_creation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les factures
async function getInvoicesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const invoices = getInvoices(clientId || undefined);

    return NextResponse.json({
      invoices,
      count: invoices.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get invoices', error as Error, {
      action: 'invoices_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get invoices' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les statistiques
async function getStatsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'week';

    const stats = getTimeTrackingStats(session.user.id, period);

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get stats', error as Error, {
      action: 'stats_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les paramètres utilisateur
async function getUserSettingsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = getUserSettings(session.user.id);

    return NextResponse.json({
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get user settings', error as Error, {
      action: 'user_settings_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get user settings' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres utilisateur
async function updateUserSettingsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = updateUserSettings(session.user.id, body);

    logger.info('User settings updated', {
      action: 'user_settings_updated',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json({
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to update user settings', error as Error, {
      action: 'user_settings_update_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'entries':
      return getTimeEntriesHandler(request);
    case 'active-timer':
      return getActiveTimerHandler(request);
    case 'projects':
      return getProjectsHandler(request);
    case 'clients':
      return getClientsHandler(request);
    case 'tasks':
      return getTasksHandler(request);
    case 'expenses':
      return getExpensesHandler(request);
    case 'invoices':
      return getInvoicesHandler(request);
    case 'stats':
      return getStatsHandler(request);
    case 'settings':
      return getUserSettingsHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: entries, active-timer, projects, clients, tasks, expenses, invoices, stats, or settings' },
        { status: 400 }
      );
  }
}, 'time-tracking');

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'start-timer':
      return startTimerHandler(request);
    case 'manual-entry':
      return addManualEntryHandler(request);
    case 'create-project':
      return createProjectHandler(request);
    case 'create-client':
      return createClientHandler(request);
    case 'create-task':
      return createTaskHandler(request);
    case 'create-timesheet':
      return createTimesheetHandler(request);
    case 'add-expense':
      return addExpenseHandler(request);
    case 'create-invoice':
      return createInvoiceHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: start-timer, manual-entry, create-project, create-client, create-task, create-timesheet, add-expense, or create-invoice' },
        { status: 400 }
      );
  }
}, 'time-tracking');

export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'stop-timer':
      return stopTimerHandler(request);
    case 'pause-timer':
      return pauseTimerHandler(request);
    case 'resume-timer':
      return resumeTimerHandler(request);
    case 'submit-timesheet':
      return submitTimesheetHandler(request);
    case 'approve-timesheet':
      return approveTimesheetHandler(request);
    case 'update-settings':
      return updateUserSettingsHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: stop-timer, pause-timer, resume-timer, submit-timesheet, approve-timesheet, or update-settings' },
        { status: 400 }
      );
  }
}, 'time-tracking');
