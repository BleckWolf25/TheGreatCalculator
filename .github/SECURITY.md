# Security Policy

## Supported Versions

We actively support the following versions of The Great Calculator:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in The Great Calculator, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Send an email to: [security@example.com] (replace with your actual email)
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 5 business days
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

### Security Measures

Our application implements several security measures:

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HTTPS Only**: All traffic is encrypted
- **Security Headers**: Comprehensive security headers implemented
- **Input Validation**: All user inputs are validated and sanitized
- **Dependency Scanning**: Regular automated dependency vulnerability scanning
- **Code Analysis**: Static code analysis with CodeQL

### Responsible Disclosure

We follow responsible disclosure practices:

1. We will work with you to understand and resolve the issue
2. We will not take legal action against researchers who:
   - Report vulnerabilities responsibly
   - Do not access or modify user data
   - Do not disrupt our services
3. We may publicly acknowledge your contribution (with your permission)

### Security Best Practices for Users

- Keep your browser updated
- Use HTTPS when accessing the calculator
- Be cautious when using the calculator on public/shared computers
- Report any suspicious behavior

## Security Features

### Client-Side Security
- Input sanitization and validation
- XSS protection
- CSRF protection
- Secure cookie handling

### Infrastructure Security
- HTTPS enforcement
- Security headers
- Regular security updates
- Monitoring and logging

### Development Security
- Secure coding practices
- Regular security audits
- Dependency vulnerability scanning
- Automated security testing

## Contact

For security-related questions or concerns:
- Email: [security@example.com]
- For general issues: Create a GitHub issue (non-security related only)

Thank you for helping keep The Great Calculator secure!
