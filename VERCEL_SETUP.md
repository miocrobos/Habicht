# Vercel GitHub Actions Setup

## Required Secrets

To enable automatic deployments, add these secrets to your GitHub repository:

### 1. Get Your Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token (name it "GitHub Actions")
3. Copy the token

### 2. Add Secrets to GitHub
1. Go to https://github.com/miocrobos/Habicht/settings/secrets/actions
2. Click "New repository secret"
3. Add this secret:
   - Name: `VERCEL_TOKEN`
   - Value: [paste your Vercel token]

### 3. Get Project IDs (Optional - for advanced configuration)
Run these commands in your local project:
```bash
vercel link
cat .vercel/project.json
```

## How It Works

Once the secrets are added:
- Every push to `main` branch triggers a deployment
- GitHub Actions builds and deploys to Vercel
- Changes appear on www.habicht-volleyball.ch within 2-3 minutes

## Manual Deployment

If you need to deploy manually:
```bash
vercel --prod
```
