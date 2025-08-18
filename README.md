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
| Variable                          | Description               | Required |
| --------------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL      | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anonymous key    | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service role key | Yes      |
| `OPENWEATHER_API_KEY`             | OpenWeatherMap API key    | Yes      |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token       | Optional |

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