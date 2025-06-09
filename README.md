# The Great Calculator

A modern, enterprise-grade scientific calculator web application with advanced features, accessibility support, and Progressive Web App capabilities. Built with a modular architecture and comprehensive testing suite.

## ✨ Features

### 🧮 Core Calculator Functions

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Scientific Functions**: Trigonometric (sin, cos, tan), logarithmic (ln, log), exponential, factorial
- **Advanced Math**: Square root, power functions, parentheses support
- **Memory Operations**: Store, recall, clear memory (MS, MR, MC)
- **Constants**: π (Pi) and other mathematical constants

### 🎨 User Experience

- **Dual Themes**: Dark/Light mode with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Touch & Gesture Support**: Swipe gestures and haptic feedback
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Visual Feedback**: Button animations and state indicators

### ♿ Accessibility Features

- **Screen Reader Support**: ARIA labels, live regions, and semantic HTML
- **Keyboard Navigation**: Tab order, focus management, and shortcuts
- **Motor Accessibility**: Large touch targets, dwell control, sticky keys
- **Cognitive Support**: Simplified interface options, confirmations, contextual help
- **Visual Accessibility**: High contrast mode, large text, color blindness support
- **Voice Control**: Speech recognition for hands-free operation

### 📱 Progressive Web App (PWA)

- **Offline Support**: Full functionality without internet connection
- **Installable**: Add to home screen on mobile and desktop
- **Service Worker**: Background sync and caching strategies
- **App-like Experience**: Native app feel with web technologies

### 🔧 Advanced Features

- **Undo/Redo**: Multi-level operation history with state management
- **Formula Management**: Save and recall custom formulas
- **PDF Export**: Export calculation history and results
- **Performance Monitoring**: Real-time performance metrics and optimization
- **Error Boundaries**: Graceful error handling and recovery
- **Bundle Optimization**: Code splitting and lazy loading

## 🌐 Live Demo

Visit **[The Great Calculator](https://the-great-calculator.vercel.app)** to try it out!

## 🛠️ Technologies & Architecture

### Frontend Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **JavaScript (ES6+)**: Modular architecture with ES modules
- **Vite**: Build tool with HMR and optimization
- **PWA**: Service Worker, Web App Manifest, and offline capabilities

### Development Tools

- **TypeScript**: Type annotations and JSDoc documentation
- **ESLint**: Code linting with security and accessibility rules
- **Prettier**: Code formatting and style consistency
- **Jest**: Unit testing with 95%+ coverage requirement
- **Playwright**: End-to-end testing and accessibility auditing

### Infrastructure & Deployment

- **Vercel**: Serverless deployment with edge functions
- **GitHub Actions**: CI/CD pipeline with automated testing and deployment
- **CodeQL**: Security analysis and vulnerability scanning
- **Dependabot**: Automated dependency updates

### Performance & Monitoring

- **Web Vitals**: Core Web Vitals monitoring and optimization
- **Bundle Analysis**: Code splitting and tree shaking
- **Performance API**: Real-time performance metrics
- **Error Tracking**: Comprehensive error boundary system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser with ES6+ support

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/BleckWolf25/TheGreatCalculator.git
   cd TheGreatCalculator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Alternative: Direct Usage

For quick testing, you can open `index.html` directly in a modern browser, though some features may require a local server.

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run end-to-end tests
npm run test:all        # Run all tests

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier

# PWA & Performance
npm run build:pwa       # Build PWA version
npm run optimize        # Run bundle optimization
npm run analyze         # Analyze bundle size

# Deployment
npm run deploy          # Deploy to Vercel
npm run deploy:preview  # Deploy preview version
```

### Testing Strategy

- **Unit Tests**: Jest with 95%+ coverage requirement
- **E2E Tests**: Playwright for cross-browser testing
- **Accessibility Tests**: Automated a11y auditing with axe-core
- **Performance Tests**: Lighthouse CI and Web Vitals monitoring

### Project Structure

```text
src/
├── js/
│   ├── modules/           # Modular calculator components
│   │   ├── core/         # Core functionality (state, operations)
│   │   ├── ui/           # User interface components
│   │   ├── accessibility/ # Accessibility features
│   │   ├── export/       # Export functionality
│   │   ├── performance/  # Performance monitoring
│   │   └── vercel/       # Vercel integration
│   ├── main.js           # Application entry point
│   └── moduleLoader.js   # Dynamic module loading
├── css/                  # Stylesheets
├── styles/               # Theme files
└── assets/               # Static assets
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes** following our coding standards
4. **Run tests:**

   ```bash
   npm run test:all
   npm run lint
   ```

5. **Commit using Conventional Commits:**

   ```bash
   git commit -m "feat(calculator): add new scientific function"
   ```

6. **Push and create a Pull Request**

### Coding Standards

- **ES6+ JavaScript** with JSDoc documentation
- **Semantic HTML5** with ARIA attributes
- **CSS3** with custom properties and modern features
- **95%+ test coverage** for new features
- **Accessibility-first** development approach

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/modifications
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: iOS Calculator and Material Design
- **Accessibility Guidelines**: WCAG 2.1 AA standards
- **Performance Best Practices**: Web.dev and Core Web Vitals
- **Testing Methodologies**: Testing Library and Playwright communities

## 🔄 Automated Releases

This project uses [semantic-release](https://semantic-release.gitbook.io/) for fully automated versioning and changelog generation.

### How It Works

- **Automated Versioning**: Version numbers determined from commit messages
- **Changelog Generation**: Automatic changelog updates in [CHANGELOG.md](./CHANGELOG.md)
- **GitHub Releases**: Automated release creation with release notes
- **CI/CD Integration**: Releases triggered by GitHub Actions

### Release Process

Releases are automatically triggered when commits are pushed to the `main` branch. The release type is determined by commit message prefixes:

- `fix:` → Patch release (1.0.1)
- `feat:` → Minor release (1.1.0)
- `feat!:` or `BREAKING CHANGE:` → Major release (2.0.0)

## 📊 Project Status

- ✅ **Production Ready**: Deployed and actively maintained
- ✅ **PWA Compliant**: Installable with offline support
- ✅ **Accessibility Compliant**: WCAG 2.1 AA standards
- ✅ **Performance Optimized**: Core Web Vitals passing
- ✅ **Security Hardened**: Regular security audits and updates

## 🔗 Links

- **Live Demo**: [the-great-calculator.vercel.app](https://the-great-calculator.vercel.app)
- **Repository**: [GitHub](https://github.com/BleckWolf25/TheGreatCalculator)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/BleckWolf25/TheGreatCalculator/issues)
- **Discussions**: [Community Discussions](https://github.com/BleckWolf25/TheGreatCalculator/discussions)

---

## 👨‍💻 Author

**Built with ❤️ by [Bleckwolf25](https://github.com/BleckWolf25)**

> Making mathematics accessible to everyone
