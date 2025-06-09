# HTTPS Development Setup

This guide explains how to set up HTTPS for local development with The Great Calculator.

## Quick Start

1. **Using .env file (Recommended)**:

   ```bash
   # Set VITE_HTTPS=true in your .env file
   echo "VITE_HTTPS=true" > .env
   npm run dev
   ```

2. **Using npm script**:

   ```bash
   npm run dev:https
   ```

3. **Using environment variable**:

   ```bash
   VITE_HTTPS=true npm run dev
   ```

## SSL Certificate Setup

### Option 1: mkcert (Recommended)

1. **Install mkcert**:

   ```bash
   # macOS
   brew install mkcert

   # Windows (with Chocolatey)
   choco install mkcert

   # Linux
   # See: https://github.com/FiloSottile/mkcert#installation
   ```

2. **Install local CA**:

   ```bash
   mkcert -install
   ```

3. **Generate certificates**:

   ```bash
   mkcert localhost 127.0.0.1 ::1
   mkdir -p certs
   mv localhost+2.pem certs/localhost.pem
   mv localhost+2-key.pem certs/localhost-key.pem
   ```

### Option 2: Vite Built-in HTTPS

If you don't have mkcert installed, Vite will automatically use self-signed certificates. You'll see a browser warning that you can safely ignore for development.

## Configuration

The HTTPS setup is configured in `vite.config.js`:

- **Environment Variables**: `VITE_HTTPS=true` or `HTTPS=true`
- **Certificate Location**: `./certs/localhost.pem` and `./certs/localhost-key.pem`
- **Fallback**: Vite's built-in self-signed certificates

## Troubleshooting

### "Connection not secure" Error

This usually means:

1. Certificates are not trusted by your browser
2. Certificates have expired or invalid dates
3. Certificate doesn't match the hostname

**Solution**: Use mkcert to generate properly trusted certificates.

### Environment Variable Not Working

Make sure:

1. `.env` file is in the project root
2. Variable is named `VITE_HTTPS` (not just `HTTPS`)
3. Value is exactly `true` (lowercase)

### Certificate Files Not Found

The config will automatically fall back to Vite's built-in HTTPS if custom certificates aren't found in the `./certs/` directory.

## Security Notes

- **Development Only**: These certificates are for local development only
- **Trust Store**: mkcert installs a local CA in your system's trust store
- **Git Ignore**: Certificate files should not be committed to version control

## Browser Access

Once HTTPS is enabled, access your app at:

- **Local**: <https://localhost:1000/>
- **Network**: https://[your-ip]:1000/

The browser should show a secure connection (🔒) when using mkcert certificates.
