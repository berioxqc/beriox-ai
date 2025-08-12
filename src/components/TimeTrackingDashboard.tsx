"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faPause,
  faStop,
  faPlus,
  faClock,
  faProjectDiagram,
  faUsers,
  faTasks,
  faFileInvoiceDollar,
  faChartBar,
  faCog,
  faCalendarAlt,
  faDollarSign,
  faReceipt,
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import {
  TimeEntry,
  Project,
  Client,
  Task,
  TimeTrackingStats,
  TimeTrackingSettings
} from '@/lib/time-tracking'
interface TimeTrackingDashboardProps {
  className?: string
}

interface DashboardState {
  activeTimer: TimeEntry | null
  timeEntries: TimeEntry[]
  projects: Project[]
  clients: Client[]
  tasks: Task[]
  stats: TimeTrackingStats | null
  settings: TimeTrackingSettings | null
  loading: boolean
  error: string | null
  currentView: 'timer' | 'entries' | 'projects' | 'clients' | 'tasks' | 'timesheet' | 'expenses' | 'invoices' | 'stats' | 'settings'
}

export default function TimeTrackingDashboard({ className = '' }: TimeTrackingDashboardProps) {
  const { data: session } = useSession()
  const [state, setState] = useState<DashboardState>({
    activeTimer: null,
    timeEntries: [],
    projects: [],
    clients: [],
    tasks: [],
    stats: null,
    settings: null,
    loading: true,
    error: null,
    currentView: 'timer'
  })
  // Charger les données initiales
  const loadInitialData = async () => {
    if (!session?.user?.id) return
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      // Charger en parallèle
      const [
        activeTimerRes,
        entriesRes,
        projectsRes,
        clientsRes,
        tasksRes,
        statsRes,
        settingsRes
      ] = await Promise.all([
        fetch('/api/time-tracking?action=active-timer'),
        fetch('/api/time-tracking?action=entries'),
        fetch('/api/time-tracking?action=projects'),
        fetch('/api/time-tracking?action=clients'),
        fetch('/api/time-tracking?action=tasks'),
        fetch('/api/time-tracking?action=stats&period=week'),
        fetch('/api/time-tracking?action=settings')
      ])
      const activeTimer = activeTimerRes.ok ? (await activeTimerRes.json()).activeTimer : null
      const entries = entriesRes.ok ? (await entriesRes.json()).entries : []
      const projects = projectsRes.ok ? (await projectsRes.json()).projects : []
      const clients = clientsRes.ok ? (await clientsRes.json()).clients : []
      const tasks = tasksRes.ok ? (await tasksRes.json()).tasks : []
      const stats = statsRes.ok ? (await statsRes.json()).stats : null
      const settings = settingsRes.ok ? (await settingsRes.json()).settings : null
      setState(prev => ({
        ...prev,
        activeTimer,
        timeEntries: entries,
        projects,
        clients,
        tasks,
        stats,
        settings,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données'
      }))
    }
  }
  // Démarrer un timer
  const startTimer = async (projectId: string, description: string, taskId?: string) => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/time-tracking?action=start-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, description, taskId })
      })
      if (response.ok) {
        const { entry } = await response.json()
        setState(prev => ({ ...prev, activeTimer: entry }))
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du timer:', error)
    }
  }
  // Arrêter le timer actif
  const stopTimer = async () => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/time-tracking?action=stop-timer', {
        method: 'PUT'
      })
      if (response.ok) {
        const { entry } = await response.json()
        setState(prev => ({ 
          ...prev, 
          activeTimer: null,
          timeEntries: [entry, ...prev.timeEntries]
        }))
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du timer:', error)
    }
  }
  // Mettre en pause le timer
  const pauseTimer = async () => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/time-tracking?action=pause-timer', {
        method: 'PUT'
      })
      if (response.ok) {
        const { entry } = await response.json()
        setState(prev => ({ ...prev, activeTimer: entry }))
      }
    } catch (error) {
      console.error('Erreur lors de la pause du timer:', error)
    }
  }
  // Reprendre le timer
  const resumeTimer = async () => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/time-tracking?action=resume-timer', {
        method: 'PUT'
      })
      if (response.ok) {
        const { entry } = await response.json()
        setState(prev => ({ ...prev, activeTimer: entry }))
      }
    } catch (error) {
      console.error('Erreur lors de la reprise du timer:', error)
    }
  }
  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    return `${minutes}m`
  }
  // Calculer la durée actuelle du timer
  const getCurrentDuration = (): number => {
    if (!state.activeTimer) return 0
    const now = new Date().getTime()
    const start = new Date(state.activeTimer.startTime).getTime()
    return Math.floor((now - start) / 1000)
  }
  // Charger les données au montage
  useEffect(() => {
    loadInitialData()
  }, [session?.user?.id])
  // Mettre à jour le timer actif toutes les secondes
  useEffect(() => {
    if (!state.activeTimer) return
    const interval = setInterval(() => {
      // Forcer la mise à jour du rendu pour le timer
      setState(prev => ({ ...prev }))
    }, 1000)
    return () => clearInterval(interval)
  }, [state.activeTimer])
  if (!session?.user?.id) {
    return null
  }

  if (state.loading) {
    return (
      <div className={`time-tracking-loading ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du Time Tracking...</p>
          </div>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className={`time-tracking-error ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`time-tracking-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Time Tracking
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setState(prev => ({ ...prev, currentView: 'settings' }))}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Paramètres"
              >
                <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'timer', label: 'Timer', icon: faClock },
              { id: 'entries', label: 'Entrées', icon: faClock },
              { id: 'projects', label: 'Projets', icon: faProjectDiagram },
              { id: 'clients', label: 'Clients', icon: faUsers },
              { id: 'tasks', label: 'Tâches', icon: faTasks },
              { id: 'timesheet', label: 'Feuilles', icon: faCalendarAlt },
              { id: 'expenses', label: 'Dépenses', icon: faReceipt },
              { id: 'invoices', label: 'Factures', icon: faFileInvoiceDollar },
              { id: 'stats', label: 'Statistiques', icon: faChartBar }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setState(prev => ({ ...prev, currentView: item.id as any }))}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  state.currentView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {state.currentView === 'timer' && (
            <TimerView
              activeTimer={state.activeTimer}
              projects={state.projects}
              tasks={state.tasks}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onPauseTimer={pauseTimer}
              onResumeTimer={resumeTimer}
              formatDuration={formatDuration}
              getCurrentDuration={getCurrentDuration}
            />
          )}

          {state.currentView === 'entries' && (
            <EntriesView
              entries={state.timeEntries}
              projects={state.projects}
              formatDuration={formatDuration}
            />
          )}

          {state.currentView === 'projects' && (
            <ProjectsView projects={state.projects} clients={state.clients} />
          )}

          {state.currentView === 'clients' && (
            <ClientsView clients={state.clients} />
          )}

          {state.currentView === 'tasks' && (
            <TasksView tasks={state.tasks} projects={state.projects} />
          )}

          {state.currentView === 'timesheet' && (
            <TimesheetView />
          )}

          {state.currentView === 'expenses' && (
            <ExpensesView />
          )}

          {state.currentView === 'invoices' && (
            <InvoicesView />
          )}

          {state.currentView === 'stats' && (
            <StatsView stats={state.stats} formatDuration={formatDuration} />
          )}

          {state.currentView === 'settings' && (
            <SettingsView settings={state.settings} />
          )}
        </div>
      </div>
    </div>
  )
}

// Composant Timer
interface TimerViewProps {
  activeTimer: TimeEntry | null
  projects: Project[]
  tasks: Task[]
  onStartTimer: (projectId: string, description: string, taskId?: string) => void
  onStopTimer: () => void
  onPauseTimer: () => void
  onResumeTimer: () => void
  formatDuration: (seconds: number) => string
  getCurrentDuration: () => number
}

function TimerView({
  activeTimer,
  projects,
  tasks,
  onStartTimer,
  onStopTimer,
  onPauseTimer,
  onResumeTimer,
  formatDuration,
  getCurrentDuration
}: TimerViewProps) {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [description, setDescription] = useState('')
  const handleStartTimer = () => {
    if (!selectedProject || !description.trim()) return
    onStartTimer(selectedProject, description.trim(), selectedTask || undefined)
    setDescription('')
  }
  const projectTasks = tasks.filter(task => task.projectId === selectedProject)
  return (
    <div className="space-y-6">
      {/* Timer actif */}
      {activeTimer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Timer Actif
            </h2>
            <div className="text-4xl font-mono text-blue-600 mb-6">
              {formatDuration(getCurrentDuration())}
            </div>
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-2">
                {activeTimer.description}
              </p>
              <p className="text-sm text-gray-500">
                {projects.find(p => p.id === activeTimer.projectId)?.name}
                {activeTimer.taskId && (
                  <span> • {tasks.find(t => t.id === activeTimer.taskId)?.name}</span>
                )}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              {activeTimer.status === 'active' ? (
                <>
                  <button
                    onClick={onPauseTimer}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    <FontAwesomeIcon icon={faPause} className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                  <button
                    onClick={onStopTimer}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faStop} className="w-4 h-4 mr-2" />
                    Arrêter
                  </button>
                </>
              ) : (
                <button
                  onClick={onResumeTimer}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-2" />
                  Reprendre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nouveau timer */}
      {!activeTimer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Démarrer un nouveau timer
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projet *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tâche (optionnel)
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Aucune tâche spécifique</option>
                  {projectTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Que faites-vous ?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleStartTimer}
              disabled={!selectedProject || !description.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-2" />
              Démarrer le timer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant Entrées de temps
interface EntriesViewProps {
  entries: TimeEntry[]
  projects: Project[]
  formatDuration: (seconds: number) => string
}

function EntriesView({ entries, projects, formatDuration }: EntriesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Entrées de temps
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Ajouter manuellement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facturable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {projects.find(p => p.id === entry.projectId)?.name || 'Projet inconnu'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(entry.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.billable ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500" />
                    ) : (
                      <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Composant Projets
interface ProjectsViewProps {
  projects: Project[]
  clients: Client[]
}

function ProjectsView({ projects, clients }: ProjectsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Projets
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {clients.find(c => c.id === project.clientId)?.name || 'Client inconnu'}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              ></div>
            </div>
            
            {project.description && (
              <p className="text-sm text-gray-600 mb-4">
                {project.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Statut: {project.status}</span>
              {project.budget && (
                <span>Budget: ${project.budget}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant Clients
interface ClientsViewProps {
  clients: Client[]
}

function ClientsView({ clients }: ClientsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Clients
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Nouveau client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {client.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {client.email}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Statut: {client.status}</span>
              {client.hourlyRate && (
                <span>${client.hourlyRate}/h</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant Tâches
interface TasksViewProps {
  tasks: Task[]
  projects: Project[]
}

function TasksView({ tasks, projects }: TasksViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Tâches
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {task.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              {projects.find(p => p.id === task.projectId)?.name || 'Projet inconnu'}
            </p>

            {task.description && (
              <p className="text-sm text-gray-600 mb-4">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Statut: {task.status}</span>
              {task.estimatedHours && (
                <span>Estimé: {task.estimatedHours}h</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant Feuilles de temps (placeholder)
function TimesheetView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Feuilles de temps
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  )
}

// Composant Dépenses (placeholder)
function ExpensesView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Dépenses
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  )
}

// Composant Factures (placeholder)
function InvoicesView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Factures
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  )
}

// Composant Statistiques
interface StatsViewProps {
  stats: TimeTrackingStats | null
  formatDuration: (seconds: number) => string
}

function StatsView({ stats, formatDuration }: StatsViewProps) {
  if (!stats) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Statistiques
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Statistiques - {stats.period}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Heures totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(stats.totalHours * 3600)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faDollarSign} className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Heures facturables</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(stats.billableHours * 3600)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faChartBar} className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.earnings.billable.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Projets
        </h3>
        <div className="space-y-4">
          {stats.projects.map((project) => (
            <div key={project.projectId} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {project.projectName}
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{formatDuration(project.hours * 3600)}</span>
                <span>${project.billableHours * 75}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Composant Paramètres (placeholder)
function SettingsView({ settings }: { settings: TimeTrackingSettings | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Paramètres
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  )
}
