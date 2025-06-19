'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { SidebarProvider, Sidebar } from '@/components/sidebar'
import SessionInfo from '@/components/session-info'

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

interface MarketResearch {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  executiveSummary?: string
  marketPosition?: string
  competitors?: any
  opportunities?: any
  threats?: any
  recommendations?: any
  aiAnalysis?: string
  lastUpdated: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface Note {
  id: string
  title: string
  content?: string
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  filename: string
  filesize: number
  mimetype: string
  blobUrl: string
  createdAt: string
  updatedAt: string
}

const sidebarSections = [
  {
    links: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        ),
      },
      {
        label: 'Companies',
        href: '/companies',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        isActive: true,
      },
    ],
  },
]

export default function CompanyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [marketResearch, setMarketResearch] = useState<MarketResearch | null>(null)
  const [isResearchLoading, setIsResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTasksLoading, setIsTasksLoading] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: ''
  })
  const [notes, setNotes] = useState<Note[]>([])
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  })
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`)
      if (response.ok) {
        const companyData = await response.json()
        setCompany(companyData)
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching company:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, router])

  const fetchMarketResearch = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/market-research`)
      if (response.ok) {
        const researchData = await response.json()
        setMarketResearch(researchData)
      }
    } catch (error) {
      console.error('Error fetching market research:', error)
    }
  }, [companyId])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/tasks`)
      if (response.ok) {
        const tasksData = await response.json()
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }, [companyId])

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/notes`)
      if (response.ok) {
        const notesData = await response.json()
        setNotes(notesData)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }, [companyId])

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/documents`)
      if (response.ok) {
        const documentsData = await response.json()
        setDocuments(documentsData)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }, [companyId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && companyId) {
      fetchCompany()
      fetchMarketResearch()
      fetchTasks()
      fetchNotes()
      fetchDocuments()
    }
  }, [status, companyId, fetchCompany, fetchMarketResearch, fetchTasks, fetchNotes, fetchDocuments])

  const startMarketResearch = async () => {
    setIsResearchLoading(true)
    setResearchError(null)
    
    try {
      const response = await fetch(`/api/companies/${companyId}/market-research`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        pollResearchStatus()
      } else {
        setResearchError(data.error || 'Failed to start market research')
      }
    } catch (error) {
      console.error('Error starting market research:', error)
      setResearchError('Failed to start market research')
    } finally {
      setIsResearchLoading(false)
    }
  }

  const pollResearchStatus = async () => {
    const maxAttempts = 30
    let attempts = 0
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/market-research`)
        if (response.ok) {
          const data = await response.json()
          setMarketResearch(data)
          
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            return
          }
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000)
        }
      } catch (error) {
        console.error('Error polling research status:', error)
      }
    }
    
    poll()
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return
    
    setIsTasksLoading(true)
    try {
      const response = await fetch(`/api/companies/${companyId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
        })
      })
      
      if (response.ok) {
        const task = await response.json()
        setTasks(prev => [task, ...prev])
        setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
        setShowCreateTask(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsTasksLoading(false)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      const response = await fetch(`/api/companies/${companyId}/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const createNote = async () => {
    if (!newNote.title.trim()) return
    
    setIsNotesLoading(true)
    try {
      const response = await fetch(`/api/companies/${companyId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content || null
        })
      })
      
      if (response.ok) {
        const note = await response.json()
        setNotes(prev => [note, ...prev])
        setNewNote({ title: '', content: '' })
        setShowCreateNote(false)
      }
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setIsNotesLoading(false)
    }
  }

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note))
        setEditingNote(null)
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      const response = await fetch(`/api/companies/${companyId}/notes/${noteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const uploadDocument = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/companies/${companyId}/documents`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const document = await response.json()
        setDocuments(prev => [document, ...prev])
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/companies/${companyId}/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      uploadDocument(files[0])
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      uploadDocument(files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('pdf')) return '📄'
    if (mimetype.includes('image')) return '🖼️'
    if (mimetype.includes('video')) return '🎥'
    if (mimetype.includes('audio')) return '🎵'
    if (mimetype.includes('text') || mimetype.includes('document')) return '📝'
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return '📊'
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📋'
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦'
    return '📁'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company not found</h2>
          <p className="text-gray-600 mb-4">The company you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'market-research', label: 'Market Research', icon: '🔍' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar sections={sidebarSections} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <SessionInfo />

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.description && (
                      <p className="text-gray-600 mt-1">{company.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Created {new Date(company.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Total Tasks</h3>
                        <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                        <p className="text-sm text-blue-600">
                          {tasks.filter(t => t.status === 'COMPLETED').length} completed
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-900 mb-2">Notes</h3>
                        <p className="text-2xl font-bold text-green-600">{notes.length}</p>
                        <p className="text-sm text-green-600">
                          {notes.length === 0 ? 'No notes yet' : `${notes.length} notes`}
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-medium text-purple-900 mb-2">Documents</h3>
                        <p className="text-2xl font-bold text-purple-600">{documents.length}</p>
                        <p className="text-sm text-purple-600">
                          {documents.length === 0 ? 'No documents yet' : `${documents.length} files`}
                        </p>
                      </div>
                    </div>

                    {/* Market Research Summary */}
                    {marketResearch && marketResearch.status === 'COMPLETED' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <span className="mr-2">🔍</span>
                            Latest Market Research
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Completed {new Date(marketResearch.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Executive Summary */}
                          {marketResearch.executiveSummary && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">📋</span>
                                Executive Summary
                              </h4>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {marketResearch.executiveSummary.length > 200 
                                  ? marketResearch.executiveSummary.substring(0, 200) + '...' 
                                  : marketResearch.executiveSummary}
                              </p>
                            </div>
                          )}

                          {/* Key Competitors */}
                          {marketResearch.competitors && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">🏢</span>
                                Key Competitors
                              </h4>
                              <div className="space-y-2">
                                {(() => {
                                  try {
                                    const competitors = JSON.parse(marketResearch.competitors)
                                    return competitors.slice(0, 3).map((competitor: any, index: number) => (
                                      <div key={index} className="text-sm">
                                        <span className="font-medium text-gray-900">
                                          {competitor.name || competitor.title || competitor}
                                        </span>
                                        {competitor.description && competitor.description !== '' && (
                                          <p className="text-gray-600 mt-1">
                                            {competitor.description.length > 80 
                                              ? competitor.description.substring(0, 80) + '...'
                                              : competitor.description}
                                          </p>
                                        )}
                                      </div>
                                    ))
                                  } catch {
                                    return <p className="text-sm text-gray-600">Competitor data available</p>
                                  }
                                })()}
                                {(() => {
                                  try {
                                    const competitors = JSON.parse(marketResearch.competitors)
                                    if (competitors.length > 3) {
                                      return (
                                        <p className="text-xs text-gray-500 mt-2">
                                          +{competitors.length - 3} more competitors
                                        </p>
                                      )
                                    }
                                  } catch {}
                                  return null
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Top Opportunities */}
                          {marketResearch.opportunities && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">🚀</span>
                                Growth Opportunities
                              </h4>
                              <div className="space-y-2">
                                {(() => {
                                  try {
                                    const opportunities = JSON.parse(marketResearch.opportunities)
                                    return opportunities.slice(0, 2).map((opportunity: any, index: number) => (
                                      <div key={index} className="text-sm">
                                        <span className="font-medium text-green-700">
                                          {opportunity.title || opportunity}
                                        </span>
                                        {opportunity.description && opportunity.description !== '' && (
                                          <p className="text-gray-600 mt-1">
                                            {opportunity.description.length > 100 
                                              ? opportunity.description.substring(0, 100) + '...'
                                              : opportunity.description}
                                          </p>
                                        )}
                                      </div>
                                    ))
                                  } catch {
                                    return <p className="text-sm text-gray-600">Growth opportunities identified</p>
                                  }
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Key Threats */}
                          {marketResearch.threats && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">⚠️</span>
                                Key Threats
                              </h4>
                              <div className="space-y-2">
                                {(() => {
                                  try {
                                    const threats = JSON.parse(marketResearch.threats)
                                    return threats.slice(0, 2).map((threat: any, index: number) => (
                                      <div key={index} className="text-sm">
                                        <span className="font-medium text-red-700">
                                          {threat.title || threat}
                                        </span>
                                        {threat.description && threat.description !== '' && (
                                          <p className="text-gray-600 mt-1">
                                            {threat.description.length > 100 
                                              ? threat.description.substring(0, 100) + '...'
                                              : threat.description}
                                          </p>
                                        )}
                                      </div>
                                    ))
                                  } catch {
                                    return <p className="text-sm text-gray-600">Risk factors identified</p>
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setActiveTab('market-research')}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center"
                          >
                            View Full Market Research Report
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Market Research CTA when no research exists */}
                    {(!marketResearch || marketResearch.status !== 'COMPLETED') && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              🔍 Get AI Market Research
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Generate comprehensive market analysis, competitor insights, and strategic recommendations powered by AI.
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Market Position Analysis
                              </span>
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Competitor Landscape
                              </span>
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Growth Opportunities
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('market-research')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Start Research
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start by adding tasks, notes, or uploading documents to see activity here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'market-research' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">AI Market Research</h3>
                      <button 
                        onClick={startMarketResearch}
                        disabled={isResearchLoading || (marketResearch?.status === 'IN_PROGRESS')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isResearchLoading || (marketResearch?.status === 'IN_PROGRESS') ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Start AI Research
                          </>
                        )}
                      </button>
                    </div>

                    {researchError && (
                      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{researchError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!marketResearch ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No research data available</h3>
                        <p className="mt-1 text-sm text-gray-500">Get AI-powered insights about this company&apos;s market position, competitors, and opportunities.</p>
                        <div className="mt-6">
                          <button 
                            onClick={startMarketResearch}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Start Market Research
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className={`border rounded-lg p-4 ${
                          marketResearch.status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
                          marketResearch.status === 'FAILED' ? 'bg-red-50 border-red-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              marketResearch.status === 'COMPLETED' ? 'bg-green-500' :
                              marketResearch.status === 'FAILED' ? 'bg-red-500' :
                              'bg-blue-500 animate-pulse'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              marketResearch.status === 'COMPLETED' ? 'text-green-800' :
                              marketResearch.status === 'FAILED' ? 'text-red-800' :
                              'text-blue-800'
                            }`}>
                              {marketResearch.status === 'COMPLETED' ? 'Research Completed' :
                               marketResearch.status === 'FAILED' ? 'Research Failed' :
                               'Research In Progress'}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(marketResearch.lastUpdated).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {marketResearch.status === 'COMPLETED' && (
                          <div className="space-y-6">
                            {marketResearch.executiveSummary && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">📋 Executive Summary</h4>
                                <p className="text-gray-700 leading-relaxed">{marketResearch.executiveSummary}</p>
                              </div>
                            )}

                            {marketResearch.marketPosition && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">🎯 Market Position</h4>
                                <p className="text-gray-700 leading-relaxed">{marketResearch.marketPosition}</p>
                              </div>
                            )}

                            {marketResearch.competitors && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">🏢 Key Competitors</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    try {
                                      const competitors = JSON.parse(marketResearch.competitors)
                                      return competitors.map((competitor: any, index: number) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                          <h5 className="font-medium text-gray-900">{competitor.name || competitor.title || competitor}</h5>
                                          {(competitor.description && competitor.description !== '') && (
                                            <p className="text-sm text-gray-600 mt-1">{competitor.description}</p>
                                          )}
                                        </div>
                                      ))
                                    } catch {
                                      return <p className="text-gray-600">Unable to parse competitor data</p>
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {marketResearch.opportunities && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">🚀 Opportunities</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    try {
                                      const opportunities = JSON.parse(marketResearch.opportunities)
                                      return opportunities.map((opportunity: any, index: number) => (
                                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                          <h5 className="font-medium text-gray-900">{opportunity.title || opportunity}</h5>
                                          {(opportunity.description && opportunity.description !== '') && (
                                            <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                                          )}
                                        </div>
                                      ))
                                    } catch {
                                      return <p className="text-gray-600">Unable to parse opportunities data</p>
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {marketResearch.threats && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">⚠️ Threats</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    try {
                                      const threats = JSON.parse(marketResearch.threats)
                                      return threats.map((threat: any, index: number) => (
                                        <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                                          <h5 className="font-medium text-gray-900">{threat.title || threat}</h5>
                                          {(threat.description && threat.description !== '') && (
                                            <p className="text-sm text-gray-600 mt-1">{threat.description}</p>
                                          )}
                                        </div>
                                      ))
                                    } catch {
                                      return <p className="text-gray-600">Unable to parse threats data</p>
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {marketResearch.recommendations && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">💡 Strategic Recommendations</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    try {
                                      const recommendations = JSON.parse(marketResearch.recommendations)
                                      return recommendations.map((recommendation: any, index: number) => (
                                        <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                                          <h5 className="font-medium text-gray-900">{recommendation.title || recommendation}</h5>
                                          {(recommendation.description && recommendation.description !== '') && (
                                            <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                                          )}
                                        </div>
                                      ))
                                    } catch {
                                      return <p className="text-gray-600">Unable to parse recommendations data</p>
                                    }
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                      <button
                        onClick={() => setShowCreateTask(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Task
                      </button>
                    </div>

                    {/* Create Task Form */}
                    {showCreateTask && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                              type="text"
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter task title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              rows={3}
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter task description"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                              <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                              <input
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={createTask}
                              disabled={!newTask.title.trim() || isTasksLoading}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                              {isTasksLoading ? 'Creating...' : 'Create Task'}
                            </button>
                            <button
                              onClick={() => {
                                setShowCreateTask(false)
                                setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
                              }}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks List */}
                    {tasks.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first task for this company.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setShowCreateTask(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Task
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.map((task) => (
                          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            {editingTask?.id === task.id ? (
                              <div className="space-y-4">
                                <input
                                  type="text"
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                                <textarea
                                  rows={3}
                                  value={editingTask.description || ''}
                                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => updateTask(task.id, editingTask)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingTask(null)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-gray-600 mb-3">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <button
                                      onClick={() => setEditingTask(task)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <select
                                      value={task.status}
                                      onChange={(e) => updateTask(task.id, { status: e.target.value as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' })}
                                      className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(task.status)}`}
                                    >
                                      <option value="TODO">To Do</option>
                                      <option value="IN_PROGRESS">In Progress</option>
                                      <option value="COMPLETED">Completed</option>
                                    </select>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    {task.dueDate && (
                                      <span className="text-xs text-gray-500">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Created {new Date(task.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                      <button
                        onClick={() => setShowCreateNote(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Note
                      </button>
                    </div>

                    {/* Create Note Form */}
                    {showCreateNote && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Create New Note</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                              type="text"
                              value={newNote.title}
                              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter note title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                              rows={6}
                              value={newNote.content}
                              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter note content"
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={createNote}
                              disabled={!newNote.title.trim() || isNotesLoading}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                              {isNotesLoading ? 'Creating...' : 'Create Note'}
                            </button>
                            <button
                              onClick={() => {
                                setShowCreateNote(false)
                                setNewNote({ title: '', content: '' })
                              }}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes List */}
                    {notes.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start documenting important information and insights about this company.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setShowCreateNote(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notes.map((note) => (
                          <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            {editingNote?.id === note.id ? (
                              <div className="space-y-4">
                                <input
                                  type="text"
                                  value={editingNote.title}
                                  onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                                <textarea
                                  rows={6}
                                  value={editingNote.content || ''}
                                  onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => updateNote(note.id, editingNote)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNote(null)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">{note.title}</h4>
                                    {note.content && (
                                      <div className="text-gray-700 whitespace-pre-wrap mb-3">
                                        {note.content}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <button
                                      onClick={() => setEditingNote(note)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => deleteNote(note.id)}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>
                                    Created {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                  {note.updatedAt !== note.createdAt && (
                                    <span>
                                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                      <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Upload Document
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
                        dragActive 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here</h3>
                          <p className="text-gray-600">or click "Upload Document" to browse</p>
                          <p className="text-sm text-gray-500 mt-2">Supports PDFs, images, documents, and more</p>
                        </>
                      )}
                    </div>

                    {/* Documents List */}
                    {documents.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload contracts, reports, presentations, and other important files.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((document) => (
                          <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-2xl">
                                  {getFileIcon(document.mimetype)}
                                </div>
                                <div>
                                  <h4 className="text-lg font-medium text-gray-900">{document.filename}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{formatFileSize(document.filesize)}</span>
                                    <span>•</span>
                                    <span>Uploaded {new Date(document.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={document.blobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </a>
                                <button
                                  onClick={() => deleteDocument(document.id)}
                                  className="text-red-400 hover:text-red-600 p-2"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Company Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          defaultValue={company.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={3}
                          defaultValue={company.description || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          defaultValue={company.website || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
} 