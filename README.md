# The Great Calculator

A modern, feature-rich calculator web application with scientific functions and a responsive design.

## Features

- 🧮 Basic arithmetic operations
- 📐 Scientific functions (sin, cos, tan, log, ln)
- 💾 Memory operations (M+, M-, MR, MC)
- 🌗 Dark/Light theme support
- 📱 Responsive design for all devices
- 🎯 Degree/Radian mode
- ⌨️ Keyboard support
- 📜 Operation history display

## Live Demo

Visit [The Great Calculator](https://bleckwolf25.github.io/TheGreatCalculator) to try it out!

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Jest for testing

## Getting Started

1. Clone the repository:

    ```bash
   git clone https://github.com/BleckWolf25/TheGreatCalculator.git
    ```

2. Open `index.html` in your browser

## Development

To run tests:

```bash
npm install
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by iOS Calculator

## Automated Releases & Changelog

This project uses [semantic-release](https://semantic-release.gitbook.io/) for fully automated versioning and changelog generation. All changes are documented in [CHANGELOG.md](./CHANGELOG.md).

### How it works

- Version numbers are determined from commit messages using [Conventional Commits](https://www.conventionalcommits.org/).
- On each release, the changelog is updated automatically.
- No manual version bumps or changelog edits are needed.

### Releasing

To trigger a release and update the changelog, run:

```sh
npm run semantic-release
```

> **Note:** Releases are typically run in CI, but you can run them locally if you have push access.

### Commit Message Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`, `docs:`, etc.)
- Example: `feat(export): add PDF export option`
