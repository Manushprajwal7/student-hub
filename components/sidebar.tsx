'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, GraduationCap, Home, LifeBuoy, Megaphone, Users2, School } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    id: 'home',
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    id: 'issues',
    title: 'Issues',
    href: '/issues',
    icon: LifeBuoy,
  },
  {
    id: 'events',
    title: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    id: 'announcements',
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    id: 'resources',
    title: 'Resources',
    href: '/resources',
    icon: BookOpen,
  },
  {
    id: 'jobs',
    title: 'Jobs',
    href: '/jobs',
    icon: GraduationCap,
  },
  {
    id: 'study-groups',
    title: 'Study Groups',
    href: '/study-groups',
    icon: Users2,
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    href: '/scholarships',
    icon: School,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 hidden h-screen w-56 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Student Hub</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-4 no-scrollbar">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 * sidebarItems.indexOf(item),
                }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              <span>{item.title}</span>
              {pathname === item.href && (
                <motion.div
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                  layoutId="sidebar-indicator"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
           <div className="py-2  pt-20 text-center text-xs text-muted-foreground">
          Made with ❤️  ManushPrajwal
        </div>
        </nav>
      </div>
    </div>
  )
}

