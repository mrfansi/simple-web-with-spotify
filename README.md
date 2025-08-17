# Simple Web with Spotify Integration

A modern web application built with **Next.js 15** featuring Spotify music integration, admin dashboard, and real-time floating music player.

## ✨ Features

- **🎵 Floating Spotify Player**: Always visible music player in bottom-right corner
- **👨‍💼 Admin Dashboard**: Centralized control for music selection and settings
- **🎼 Multi-format Support**: Play tracks, playlists, and albums
- **⚡ Real-time Sync**: Settings changes instantly reflected across all pages
- **🔐 Single Authorization**: One-time Spotify OAuth setup for entire application
- **🎛️ Playback Controls**: Autoplay and looping configuration

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui components  
- **Database**: SQLite with Prisma ORM
- **Real-time**: Socket.IO
- **Music API**: Spotify Web API
- **TypeScript**: Full type safety
- **Development**: Turbopack for fast HMR

## 📦 Prerequisites

1. **Node.js 18+** installed
2. **Spotify Developer Account**: 
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Note your `Client ID` and `Client Secret`
   - Add `http://localhost:3000/api/spotify/callback` to Redirect URIs

## ⚙️ Environment Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd simple-web-with-spotify
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Spotify credentials in `.env`:
   ```bash
   # Spotify Configuration
   SPOTIFY_CLIENT_ID="your_actual_client_id"
   SPOTIFY_CLIENT_SECRET="your_actual_client_secret"
   ```

3. **Setup database**:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

## 🏃‍♂️ Getting Started

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

3. **Visit the Admin Dashboard** at [http://localhost:3000/admin](http://localhost:3000/admin)

4. **Connect to Spotify** and start selecting your music!

## 🎮 How to Use

### Admin Dashboard (`/admin`)
- **Connect Spotify**: One-time OAuth setup
- **Search Music**: Find tracks, playlists, or albums
- **Configure Settings**: Toggle autoplay and loop options
- **Real-time Preview**: See changes instantly

### Floating Player
- **Automatic Display**: Appears when music is selected
- **Interactive Controls**: Minimize, mute, or close
- **Real-time Updates**: Syncs with admin changes
- **Cross-page Persistence**: Available on all pages

## 🛠️ Advanced Configuration

### Custom Server (Optional)
For advanced Socket.IO configurations, you can create a custom server:

```javascript
// server.js
const { createServer } = require('http')
const next = require('next')
const { setupRealtimeServer } = require('./src/lib/realtime/socket-server')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })
  
  // Initialize Socket.IO
  setupRealtimeServer(server)
  
  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
  })
})
```

## 🚀 Deployment

### Environment Variables for Production

Make sure to configure these environment variables in your production environment:

```bash
# Database (Production)
DATABASE_URL="file:./prod.db"  # or your production database URL

# Spotify Configuration (Production)
SPOTIFY_CLIENT_ID="your_production_client_id"
SPOTIFY_CLIENT_SECRET="your_production_client_secret"
SPOTIFY_REDIRECT_URI="https://yourdomain.com/api/spotify/callback"

# Real-time Communication (Production)
NEXT_PUBLIC_SOCKET_URL="https://yourdomain.com"

# Security
NEXTAUTH_SECRET="your-production-super-secret-jwt-key"
```

### Deploy on Vercel

1. **Connect your repository** to [Vercel](https://vercel.com/new)

2. **Configure environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all the production environment variables listed above

3. **Update Spotify App Settings**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add your production domain to Redirect URIs: `https://yourdomain.vercel.app/api/spotify/callback`

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Deploy on Other Platforms

#### Railway / Render / Heroku

1. **Configure environment variables** in your platform's dashboard
2. **Build command**: `npm run build`
3. **Start command**: `npm run start`
4. **Ensure SQLite support** or configure PostgreSQL/MySQL

#### Self-hosted (VPS/Docker)

1. **Build the application**:
   ```bash
   npm run build
   npm run start
   ```

2. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "spotify-web" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure reverse proxy** (Nginx example):
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Socket.IO Connection Issues**:
   - Ensure `NEXT_PUBLIC_SOCKET_URL` matches your domain
   - Check firewall settings for WebSocket connections

2. **Spotify OAuth Errors**:
   - Verify redirect URIs in Spotify Dashboard
   - Check client ID and secret are correctly set
   - Ensure HTTPS in production

3. **Database Issues**:
   - Run `npx prisma migrate deploy` in production
   - For PostgreSQL/MySQL, update `DATABASE_URL` accordingly

4. **Build Errors**:
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Performance Tips

- Enable caching for API routes
- Use CDN for static assets
- Consider upgrading to PostgreSQL for better performance
- Monitor Socket.IO connection limits

## 📚 API Reference

### Spotify Endpoints

- `GET /api/spotify/login` - Initiate OAuth flow
- `GET /api/spotify/callback` - Handle OAuth callback
- `GET /api/spotify/search?q=query&type=track` - Search music
- `GET /api/spotify/playback` - Get current settings
- `POST /api/spotify/update-setting` - Update music settings

### WebSocket Events

- `setting:update` - Emitted when music settings change
- `connection` - Client connected to real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music integration
- [Prisma](https://prisma.io) for database management
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Socket.IO](https://socket.io) for real-time communication
