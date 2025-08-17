import Image from "next/image";
import Link from "next/link";
import { Music, Settings, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <main className="text-center space-y-16">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-green-600 p-4 rounded-full">
                  <Music className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Simple Web
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern web application with integrated <span className="font-semibold text-green-600">Spotify</span> music player.
              Experience seamless music control across your entire website.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild>
                <Link href="/admin">
                  <Settings className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a 
                  href="https://github.com/yourusername/simple-web-with-spotify" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Source Code
                </a>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Floating Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Always-visible music player in the bottom-right corner. Minimizable and fully interactive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Real-time Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Settings changes in admin dashboard instantly reflect across all pages using WebSocket.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-600" />
                  Multi-format Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Play individual tracks, playlists, or entire albums with autoplay and loop controls.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <ol className="text-left space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-medium flex items-center justify-center">1</span>
                <span>Visit the <Link href="/admin" className="font-medium text-blue-600 hover:underline">Admin Dashboard</Link> to connect your Spotify account</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full text-sm font-medium flex items-center justify-center">2</span>
                <span>Search and select your favorite tracks, playlists, or albums</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full text-sm font-medium flex items-center justify-center">3</span>
                <span>The floating player will appear on all pages with your selected music</span>
              </li>
            </ol>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="text-center py-8 border-t mt-16">
          <div className="flex gap-6 justify-center flex-wrap text-sm text-muted-foreground">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org/learn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn Next.js
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              GitHub
            </a>
            <span className="text-xs">
              Built with Next.js 15 + Spotify Web API
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
