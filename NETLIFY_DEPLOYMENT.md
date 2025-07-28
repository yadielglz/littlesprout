# Netlify Deployment Guide for LittleSprout

## Quick Deploy

### Option 1: Deploy from Git (Recommended)

1. **Connect your repository:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select the `littlesprout` repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (or latest LTS)

3. **Environment Variables (if needed):**
   - Go to Site settings → Environment variables
   - Add any Firebase configuration variables if not using public config

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app

### Option 2: Manual Deploy

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Drag and drop:**
   - Go to [Netlify](https://app.netlify.com/)
   - Drag the `dist` folder to the deploy area
   - Your site will be live instantly

## Configuration Files

- `netlify.toml` - Main configuration file
- `public/_redirects` - SPA routing support
- Updated `vite.config.ts` - Base path set to root for Netlify

## Features Included

✅ **SPA Routing** - All routes will work correctly  
✅ **Security Headers** - XSS protection, content type options  
✅ **Caching** - Optimized caching for static assets  
✅ **Auto-deploy** - Deploys on every push to main branch  
✅ **Preview Deploys** - Automatic preview for pull requests  

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify

## Environment Variables

If you need to add environment variables for Firebase or other services:

1. Go to Site settings → Environment variables
2. Add variables like:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.

## Troubleshooting

- **Build fails**: Check the build logs in Netlify dashboard
- **Routes not working**: Ensure `_redirects` file is in the `public` folder
- **Environment variables**: Make sure they're prefixed with `VITE_` for Vite to include them

## Performance

Your app is optimized for Netlify with:
- Code splitting for better loading performance
- Optimized caching headers
- Compressed assets
- CDN distribution worldwide 