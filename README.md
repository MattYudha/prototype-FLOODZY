# 🌊 Floodzy - Real-time Flood Detection & Weather Monitoring System

<div align="center">
  <img src="https://raw.githubusercontent.com/mattyudha/floodzy/main/public/images/floodzy-logo.png" alt="Floodzy Logo" width="200"/>
  
  <p align="center">
    <strong>Advanced flood detection and weather monitoring platform for Indonesia</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  </p>
  
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-documentation">Documentation</a> •
    <a href="#-contributing">Contributing</a> •
    <a href="#-license">License</a>
  </p>
</div>

---

## 🚀 Overview

Floodzy is a cutting-edge platform designed to provide real-time flood detection and weather monitoring across Indonesia. Built with modern web technologies, it offers an intuitive interface and integrated data sources to help communities, authorities, and organizations make informed decisions for disaster mitigation.

### 🎯 Mission
To create a comprehensive, accessible, and reliable flood monitoring system that empowers communities with real-time information for better disaster preparedness and response.

---

## ✨ Features

### 🗺️ **Interactive Mapping**
- Real-time flood risk visualization using Leaflet
- Weather station and water level monitoring points
- Responsive map controls with custom markers

### 🌡️ **Weather Monitoring**
- Live weather data (temperature, humidity, wind speed)
- Integration with OpenWeatherMap API
- Location-specific weather forecasts

### 🚨 **Flood Detection & Alerts**
- Early warning system based on integrated data sources
- Real-time flood risk assessment
- Automated alert notifications

### 📍 **Region Selection**
- Granular location selection (Province → Regency/City → District)
- Localized data display
- Regional-specific monitoring

### 🔧 **Infrastructure Monitoring**
- Flood pump status tracking
- Water level monitoring stations
- Equipment operational status

### 📱 **Modern UI/UX**
- Responsive design for all devices
- Smooth animations with Framer Motion
- Dark/light theme support
- Intuitive dashboard interface

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td align="center"><strong>Backend</strong></td>
    <td align="center"><strong>Database</strong></td>
    <td align="center"><strong>APIs</strong></td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://nextjs.org/static/favicon/favicon-32x32.png" width="20"/> Next.js 13<br/>
      <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20"/> TypeScript<br/>
      <img src="https://tailwindcss.com/favicon-32x32.png" width="20"/> Tailwind CSS<br/>
      <img src="https://www.framer.com/favicon-32x32.png" width="20"/> Framer Motion
    </td>
    <td align="center">
      <img src="https://nextjs.org/static/favicon/favicon-32x32.png" width="20"/> Next.js API Routes<br/>
      <img src="https://supabase.com/favicon/favicon-32x32.png" width="20"/> Supabase<br/>
      🔧 Custom Hooks<br/>
      📊 Recharts
    </td>
    <td align="center">
      <img src="https://supabase.com/favicon/favicon-32x32.png" width="20"/> Supabase<br/>
      🗄️ PostgreSQL<br/>
      🔄 Real-time subscriptions<br/>
      🔐 Row Level Security
    </td>
    <td align="center">
      🌤️ OpenWeatherMap<br/>
      🗺️ Overpass API<br/>
      🏛️ PUPR/Sihka/GEO API<br/>
      📡 Custom APIs
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.14.0 or higher, v18+ recommended)
- **npm** or **yarn**
- **OpenWeatherMap API key**
- **Supabase project**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mattyudha/floodzy.git
   cd floodzy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   
   # OpenWeatherMap API
   OPENWEATHER_API_KEY="your_openweathermap_api_key"
   
   # Optional: Mapbox (if using Mapbox features)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your_mapbox_token"
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

### 🎯 Getting API Keys

- **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org/api)
- **Supabase**: Create a project at [supabase.com](https://supabase.com)

---

## 📁 Project Structure

```
floodzy/
├── 📁 app/
│   ├── 📁 api/              # API routes (regional, water-level, pump-status)
│   ├── 📄 globals.css       # Global styles & Tailwind configuration
│   ├── 📄 layout.tsx        # Main application layout
│   └── 📄 page.tsx          # Homepage dashboard
├── 📁 components/
│   ├── 📁 dashboard/        # Dashboard statistics components
│   ├── 📁 flood/            # Flood warning components
│   ├── 📁 layout/           # Header & sidebar components
│   ├── 📁 map/              # Interactive map components
│   ├── 📁 region-selector/  # Region selection dropdown
│   ├── 📁 ui/               # Shadcn/ui components
│   └── 📁 weather/          # Weather display components
├── 📁 hooks/                # Custom React hooks
├── 📁 lib/                  # Utilities & API services
├── 📁 public/               # Static assets
├── 📁 types/                # TypeScript type definitions
└── 📄 Configuration files
```

---

## 🎨 Usage

### Basic Usage

1. **Select Location**: Use the region dropdown to choose your area of interest
2. **View Map**: Interactive map shows flood-prone areas and monitoring stations
3. **Monitor Weather**: Real-time weather data for selected locations
4. **Check Alerts**: View flood warnings and pump status updates

### Advanced Features

- **Custom Regions**: Add your own monitoring points
- **Historical Data**: Access past flood and weather records
- **API Integration**: Connect with external monitoring systems

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable names

---

## 📖 Documentation

### API Documentation

- **Regional Data API**: `/api/regional-data`
- **Water Level API**: `/api/water-level`
- **Pump Status API**: `/api/pump-status`
- **Weather API**: `/api/weather`

### Custom Hooks

- `useRegionData`: Manage regional data state
- `useMediaQuery`: Handle responsive design
- `useTheme`: Theme management
- `useDebounce`: Debounced input handling
- `useToast`: Toast notifications

### Components

Detailed component documentation available in the `/docs` directory.

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token | Optional |

### Deployment

The app is optimized for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Custom VPS**

---

## 📊 Performance

- **Lighthouse Score**: 95+ for Performance, Accessibility, Best Practices
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Mobile Optimized**: Responsive design for all devices

---

## 🛡️ Security

- **Environment Variables**: Secure API key management
- **Row Level Security**: Supabase RLS policies
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Proper cross-origin resource sharing

---

## 🌟 Roadmap

### Phase 1 (Current)
- [x] Basic flood monitoring
- [x] Weather integration
- [x] Interactive mapping
- [x] Region selection

### Phase 2 (Next)
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Machine learning predictions
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Satellite imagery integration
- [ ] IoT sensor network
- [ ] Community reporting system
- [ ] Emergency response integration

---

## 🎉 Acknowledgments

- **OpenWeatherMap** for weather data API
- **Supabase** for backend infrastructure
- **Leaflet** for interactive mapping
- **Next.js** team for the amazing framework
- **Indonesian Ministry of Public Works** for flood data

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mattyudha/floodzy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mattyudha/floodzy/discussions)
- **Email**: dewarahmat12334@gmail.com

---

MIT License

Copyright (c) 2025 Matt 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
