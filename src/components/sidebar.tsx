'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  isActive?: boolean
}

interface SidebarSection {
  title?: string
  links: SidebarLink[]
}

interface SidebarContextProps {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isMobileOpen: boolean
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

const sidebarVariants = {
  expanded: { width: '280px' },
  collapsed: { width: '72px' },
}

const contentVariants = {
  show: { opacity: 1, x: 0 },
  hide: { opacity: 0, x: -10 },
}

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

const SidebarHeader: React.FC = () => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-16 items-center border-b border-gray-200 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <motion.div
          variants={contentVariants}
          animate={isCollapsed ? 'hide' : 'show'}
          className="flex flex-col"
        >
          {!isCollapsed && (
            <>
              <span className="text-sm font-semibold text-gray-900">My App</span>
              <span className="text-xs text-gray-500">Dashboard</span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const SidebarNav: React.FC<{ sections: SidebarSection[] }> = ({ sections }) => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex-1 px-3 py-4 overflow-y-auto">
      <nav className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            {section.title && !isCollapsed && (
              <h4 className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                {section.title}
              </h4>
            )}
            <div className="space-y-1">
              {section.links.map((link, linkIndex) => (
                <SidebarNavItem key={linkIndex} link={link} />
              ))}
            </div>
            {sectionIndex < sections.length - 1 && <div className="my-4 border-t border-gray-200" />}
          </div>
        ))}
      </nav>
    </div>
  )
}

const SidebarNavItem: React.FC<{ link: SidebarLink }> = ({ link }) => {
  const { isCollapsed } = useSidebar()

  return (
    <a
      href={link.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 h-10 rounded-md text-sm font-medium transition-colors',
        link.isActive 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        isCollapsed && 'px-2 justify-center'
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {link.icon}
      </span>
      <motion.div
        variants={contentVariants}
        animate={isCollapsed ? 'hide' : 'show'}
        className="flex flex-1 items-center justify-between"
      >
        {!isCollapsed && (
          <>
            <span>{link.label}</span>
            {link.badge && (
              <span className="ml-auto bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {link.badge}
              </span>
            )}
          </>
        )}
      </motion.div>
    </a>
  )
}

const SidebarFooter: React.FC = () => {
  const { isCollapsed } = useSidebar()
  const { data: session } = useSession()

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {session?.user?.email?.[0].toUpperCase() || 'U'}
          </span>
        </div>
        <motion.div
          variants={contentVariants}
          animate={isCollapsed ? 'hide' : 'show'}
          className="flex flex-1 items-center justify-between"
        >
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-xs text-gray-500 hover:text-gray-700 text-left"
              >
                Sign out
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const MobileSidebar: React.FC<{ sections: SidebarSection[] }> = ({ sections }) => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar()

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 md:hidden bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-sm font-semibold">My App</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMobileOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="fixed inset-0 z-50 bg-white md:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-semibold">My App</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 flex-col">
            <SidebarNav sections={sections} />
            <SidebarFooter />
          </div>
        </motion.div>
      )}
    </>
  )
}

export const Sidebar: React.FC<{ sections: SidebarSection[] }> = ({ sections }) => {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <>
      <MobileSidebar sections={sections} />
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden h-screen flex-col border-r border-gray-200 bg-white md:flex"
      >
        <SidebarHeader />
        <SidebarNav sections={sections} />
        <SidebarFooter />
      </motion.aside>
    </>
  )
} 