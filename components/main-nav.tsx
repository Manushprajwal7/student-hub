"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Moon, Search, Sun, User, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { NotificationsBell } from "@/components/notifications/notifications-bell"
import { useAuth } from "@/components/providers/auth-provider"
import { LogoutConfirmation } from "@/components/auth/logout-confirmation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchContent, type SearchResult } from "@/lib/actions/search"

export default function MainNav() {
  const { user, signOut } = useAuth()
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  const { data: searchResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["search", searchQuery],
    queryFn: () => searchContent(searchQuery),
    enabled: searchQuery.length > 0 && open,
  })

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setSearchQuery("")
    router.push(result.url)
  }

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2 font-bold hover:opacity-80">
          <span className="hidden md:inline-block">Student Hub</span>
          <span className="md:hidden">SH</span>
        </Link>
        <div className="flex-1 max-w-[50%] md:max-w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-start">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                {searchQuery || <span className="hidden md:inline">Search resources, posts, or events...</span>}
                <span className="md:hidden">Search...</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] md:w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Search resources, posts, or events..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    searchResults?.map((result) => (
                      <CommandItem key={result.id} value={result.title} onSelect={() => handleSelect(result)}>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {result.type.replace("-", " ")}
                          </span>
                        </div>
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-2">
          <NotificationsBell />
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onSelect={() => setShowLogoutDialog(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
      <LogoutConfirmation open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={signOut} />
    </header>
  )
}

