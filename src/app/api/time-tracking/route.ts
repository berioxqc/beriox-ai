import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
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
} from 'apos;@/lib/time-tracking'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Obtenir les entrées de temps
async function getTimeEntriesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('apos;projectId'apos;);
    const startDate = searchParams.get('apos;startDate'apos;);
    const endDate = searchParams.get('apos;endDate'apos;);
    const status = searchParams.get('apos;status'apos;);
    const billable = searchParams.get('apos;billable'apos;);

    const filters: any = {};
    if (projectId) filters.projectId = projectId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (status) filters.status = status;
    if (billable !== null) filters.billable = billable === 'apos;true'apos;;

    const entries = getTimeEntries(session.user.id, filters);

    logger.info('apos;Time entries requested'apos;, {
      action: 'apos;time_entries_requested'apos;,
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
    logger.error('apos;Failed to get time entries'apos;, error as Error, {
      action: 'apos;time_entries_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get time entries'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir le timer actif
async function getActiveTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const activeTimer = getActiveTimer(session.user.id);

    return NextResponse.json({
      activeTimer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get active timer'apos;, error as Error, {
      action: 'apos;active_timer_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get active timer'apos; },
      { status: 500 }
    );
  }
}

// POST - Démarrer un timer
async function startTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, description, taskId } = body;

    if (!projectId || !description) {
      return NextResponse.json(
        { error: 'apos;Project ID and description are required'apos; },
        { status: 400 }
      );
    }

    const entry = startTimer(session.user.id, projectId, description, taskId);

    logger.info('apos;Timer started'apos;, {
      action: 'apos;timer_started'apos;,
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
    logger.error('apos;Failed to start timer'apos;, error as Error, {
      action: 'apos;timer_start_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to start timer'apos; },
      { status: 500 }
    );
  }
}

// PUT - Arrêter un timer
async function stopTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const entry = stopTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'apos;No active timer found'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Timer stopped'apos;, {
      action: 'apos;timer_stopped'apos;,
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
    logger.error('apos;Failed to stop timer'apos;, error as Error, {
      action: 'apos;timer_stop_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to stop timer'apos; },
      { status: 500 }
    );
  }
}

// PUT - Mettre en pause un timer
async function pauseTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const entry = pauseTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'apos;No active timer found'apos; },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to pause timer'apos;, error as Error, {
      action: 'apos;timer_pause_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to pause timer'apos; },
      { status: 500 }
    );
  }
}

// PUT - Reprendre un timer
async function resumeTimerHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const entry = resumeTimer(session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'apos;No paused timer found'apos; },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to resume timer'apos;, error as Error, {
      action: 'apos;timer_resume_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to resume timer'apos; },
      { status: 500 }
    );
  }
}

// POST - Ajouter une entrée manuelle
async function addManualEntryHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, description, startTime, endTime, taskId, billable, tags } = body;

    if (!projectId || !description || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'apos;Project ID, description, start time, and end time are required'apos; },
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

    logger.info('apos;Manual entry added'apos;, {
      action: 'apos;manual_entry_added'apos;,
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
    logger.error('apos;Failed to add manual entry'apos;, error as Error, {
      action: 'apos;manual_entry_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to add manual entry'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les projets
async function getProjectsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const projects = getProjects(session.user.id);

    return NextResponse.json({
      projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get projects'apos;, error as Error, {
      action: 'apos;projects_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get projects'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer un projet
async function createProjectHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const project = createProject(body);

    logger.info('apos;Project created'apos;, {
      action: 'apos;project_created'apos;,
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
    logger.error('apos;Failed to create project'apos;, error as Error, {
      action: 'apos;project_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create project'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les clients
async function getClientsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const clients = getClients();

    return NextResponse.json({
      clients,
      count: clients.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get clients'apos;, error as Error, {
      action: 'apos;clients_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get clients'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer un client
async function createClientHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const client = createClient(body);

    logger.info('apos;Client created'apos;, {
      action: 'apos;client_created'apos;,
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
    logger.error('apos;Failed to create client'apos;, error as Error, {
      action: 'apos;client_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create client'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les tâches
async function getTasksHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('apos;projectId'apos;);

    const tasks = getTasks(projectId || undefined);

    return NextResponse.json({
      tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get tasks'apos;, error as Error, {
      action: 'apos;tasks_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get tasks'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer une tâche
async function createTaskHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const task = createTask(body);

    logger.info('apos;Task created'apos;, {
      action: 'apos;task_created'apos;,
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
    logger.error('apos;Failed to create task'apos;, error as Error, {
      action: 'apos;task_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create task'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer une feuille de temps
async function createTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { weekStart } = body;

    if (!weekStart) {
      return NextResponse.json(
        { error: 'apos;Week start date is required'apos; },
        { status: 400 }
      );
    }

    const timesheet = createTimesheet(session.user.id, new Date(weekStart));

    logger.info('apos;Timesheet created'apos;, {
      action: 'apos;timesheet_created'apos;,
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
    logger.error('apos;Failed to create timesheet'apos;, error as Error, {
      action: 'apos;timesheet_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create timesheet'apos; },
      { status: 500 }
    );
  }
}

// PUT - Soumettre une feuille de temps
async function submitTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { timesheetId } = body;

    if (!timesheetId) {
      return NextResponse.json(
        { error: 'apos;Timesheet ID is required'apos; },
        { status: 400 }
      );
    }

    const timesheet = submitTimesheet(timesheetId);

    if (!timesheet) {
      return NextResponse.json(
        { error: 'apos;Timesheet not found'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Timesheet submitted'apos;, {
      action: 'apos;timesheet_submitted'apos;,
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
    logger.error('apos;Failed to submit timesheet'apos;, error as Error, {
      action: 'apos;timesheet_submit_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to submit timesheet'apos; },
      { status: 500 }
    );
  }
}

// PUT - Approuver une feuille de temps (admin uniquement)
async function approveTimesheetHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { timesheetId } = body;

    if (!timesheetId) {
      return NextResponse.json(
        { error: 'apos;Timesheet ID is required'apos; },
        { status: 400 }
      );
    }

    const timesheet = approveTimesheet(timesheetId, session.user.id);

    if (!timesheet) {
      return NextResponse.json(
        { error: 'apos;Timesheet not found'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Timesheet approved'apos;, {
      action: 'apos;timesheet_approved'apos;,
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
    logger.error('apos;Failed to approve timesheet'apos;, error as Error, {
      action: 'apos;timesheet_approval_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to approve timesheet'apos; },
      { status: 500 }
    );
  }
}

// POST - Ajouter une dépense
async function addExpenseHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const expense = addExpense(body);

    logger.info('apos;Expense added'apos;, {
      action: 'apos;expense_added'apos;,
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
    logger.error('apos;Failed to add expense'apos;, error as Error, {
      action: 'apos;expense_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to add expense'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les dépenses
async function getExpensesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('apos;projectId'apos;);

    const expenses = getExpenses(session.user.id, projectId || undefined);

    return NextResponse.json({
      expenses,
      count: expenses.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get expenses'apos;, error as Error, {
      action: 'apos;expenses_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get expenses'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer une facture
async function createInvoiceHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const invoice = createInvoice(body);

    logger.info('apos;Invoice created'apos;, {
      action: 'apos;invoice_created'apos;,
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
    logger.error('apos;Failed to create invoice'apos;, error as Error, {
      action: 'apos;invoice_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create invoice'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les factures
async function getInvoicesHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('apos;clientId'apos;);

    const invoices = getInvoices(clientId || undefined);

    return NextResponse.json({
      invoices,
      count: invoices.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get invoices'apos;, error as Error, {
      action: 'apos;invoices_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get invoices'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les statistiques
async function getStatsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('apos;period'apos;) as 'apos;day'apos; | 'apos;week'apos; | 'apos;month'apos; | 'apos;year'apos; || 'apos;week'apos;;

    const stats = getTimeTrackingStats(session.user.id, period);

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get stats'apos;, error as Error, {
      action: 'apos;stats_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get stats'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les paramètres utilisateur
async function getUserSettingsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const settings = getUserSettings(session.user.id);

    return NextResponse.json({
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get user settings'apos;, error as Error, {
      action: 'apos;user_settings_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get user settings'apos; },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres utilisateur
async function updateUserSettingsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = updateUserSettings(session.user.id, body);

    logger.info('apos;User settings updated'apos;, {
      action: 'apos;user_settings_updated'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json({
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to update user settings'apos;, error as Error, {
      action: 'apos;user_settings_update_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to update user settings'apos; },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;entries'apos;:
      return getTimeEntriesHandler(request);
    case 'apos;active-timer'apos;:
      return getActiveTimerHandler(request);
    case 'apos;projects'apos;:
      return getProjectsHandler(request);
    case 'apos;clients'apos;:
      return getClientsHandler(request);
    case 'apos;tasks'apos;:
      return getTasksHandler(request);
    case 'apos;expenses'apos;:
      return getExpensesHandler(request);
    case 'apos;invoices'apos;:
      return getInvoicesHandler(request);
    case 'apos;stats'apos;:
      return getStatsHandler(request);
    case 'apos;settings'apos;:
      return getUserSettingsHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: entries, active-timer, projects, clients, tasks, expenses, invoices, stats, or settings'apos; },
        { status: 400 }
      );
  }
}, 'apos;time-tracking'apos;);

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;start-timer'apos;:
      return startTimerHandler(request);
    case 'apos;manual-entry'apos;:
      return addManualEntryHandler(request);
    case 'apos;create-project'apos;:
      return createProjectHandler(request);
    case 'apos;create-client'apos;:
      return createClientHandler(request);
    case 'apos;create-task'apos;:
      return createTaskHandler(request);
    case 'apos;create-timesheet'apos;:
      return createTimesheetHandler(request);
    case 'apos;add-expense'apos;:
      return addExpenseHandler(request);
    case 'apos;create-invoice'apos;:
      return createInvoiceHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: start-timer, manual-entry, create-project, create-client, create-task, create-timesheet, add-expense, or create-invoice'apos; },
        { status: 400 }
      );
  }
}, 'apos;time-tracking'apos;);

export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;stop-timer'apos;:
      return stopTimerHandler(request);
    case 'apos;pause-timer'apos;:
      return pauseTimerHandler(request);
    case 'apos;resume-timer'apos;:
      return resumeTimerHandler(request);
    case 'apos;submit-timesheet'apos;:
      return submitTimesheetHandler(request);
    case 'apos;approve-timesheet'apos;:
      return approveTimesheetHandler(request);
    case 'apos;update-settings'apos;:
      return updateUserSettingsHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: stop-timer, pause-timer, resume-timer, submit-timesheet, approve-timesheet, or update-settings'apos; },
        { status: 400 }
      );
  }
}, 'apos;time-tracking'apos;);
