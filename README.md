<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8ec3e99e-71ab-4ab6-b37a-f644e3d0fd04

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
## Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name (e.g., `wedding-website`)
   - Configure settings (vercel.json will be used automatically)

4. **Set Environment Variables** (if needed):
   ```bash
   vercel env add GEMINI_API_KEY
   ```

5. **Your site will be live** at `https://your-project-name.vercel.app`

## Deploy to GitHub Pages

The project includes GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Push your changes to the `main` branch
2. Go to your repository Settings > Pages
3. Set source to "GitHub Actions"
4. The workflow will automatically build and deploy your site
