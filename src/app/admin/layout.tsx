import type { Metadata } from 'next'
import Link from 'next/link'
import { Music, Settings, BarChart3, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Simple Web with Spotify',
  description: 'Manage your Spotify music integration settings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Spotify Admin</h2>
              <p className="text-sm text-muted-foreground">Music Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="default" className="w-full justify-start" asChild>
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Music Settings
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/analytics" aria-disabled="true">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
              <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full">
                Soon
              </span>
            </Link>
          </Button>
          
          <Separator className="my-4" />
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              View Public Site
            </Link>
          </Button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Built with Next.js & Spotify Web API
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-4xl">
          {children}
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
