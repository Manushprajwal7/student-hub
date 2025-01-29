'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calendar, GraduationCap, Home, LifeBuoy, Megaphone, Users2, School } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
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

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-t-muted/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container px-2">
        <div className="grid grid-cols-4 gap-0 divide-x divide-muted/20">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

