# The Great Calculator

> A super advanced, performant, responsive, accessible and ease of use scientific & minimal graphic calculator.

The Great Calculator is a Next.js application that provides an interactive, accessible, and fast scientific and graphing calculator. Powered by Math.js, it offers advanced mathematical features, historical logs, responsive designs, and robust graphing capabilities.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 9.0.0 or higher

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BleckWolf25/TheGreatCalculator.git
   cd TheGreatCalculator
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Available Scripts

- `pnpm dev` - Start the Next.js development server
- `pnpm build` - Compile the production application and export it as static files
- `pnpm start` - Start the production build locally
- `pnpm lint` - Run ESLint on the codebase
- `pnpm test` - Run unit and integration tests using Vitest
- `pnpm test:ui` - Run Vitest tests with an interactive UI dashboard
- `pnpm test:e2e` - Run end-to-end integration tests using Playwright
- `pnpm format` - Run Prettier to format the codebase
- `pnpm format:check` - Check formatting without making modifications

## 🏗️ Project Structure

```zsh
TheGreatCalculator/
├── .next/               # Next.js build output (generated)
├── out/                 # Next.js static HTML export (generated)
├── public/              # Static public assets (icons, PWA manifest, etc.)
├── src/
│   ├── app/             # App Router layout, pages, and global styling
│   ├── components/      # React UI components
│   │   ├── calculator/  # Specific scientific & graphic calculator modules
│   │   └── ui/          # Reusable primitive components (shadcn/ui style)
│   ├── contexts/        # React context providers (theme, history, calculator state)
│   ├── hooks/           # Custom React hooks (keyboard, theme, history)
│   ├── lib/             # Shared library functions & database integration
│   │   └── engine/      # Math compilation, graphing, and probability engines
│   └── types/           # Shared TypeScript interfaces & types
├── tests/               # Vitest unit & integration tests
├── e2e/                 # Playwright end-to-end test suite
├── package.json
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── vercel.json          # Vercel deployment settings
└── eslint.config.ts     # ESLint configuration
```

## 🧪 Testing

The project uses Vitest for unit/integration tests and Playwright for browser e2e testing.

### Run Unit Tests

```bash
pnpm test
```

### Run End-to-End Tests

```bash
pnpm test:e2e
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 📧 Contact

For questions or support, please open an issue on GitHub or contact [joao.coutinho08@gmail.com](mailto:joao.coutinho08@gmail.com).

---

Built with ❤️ using Next.js, React, Tailwind CSS, TypeScript, and Math.js
