# Vercel Deployment Guide for MapleBear

## Prerequisites
1. **Node.js**: Ensure you have Node.js installed (LTS version recommended).
2. **Vercel Account**: Create an account at [Vercel](https://vercel.com/signup).
3. **Git**: Make sure git is installed on your machine.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/leduearddo005-cmd/Maplebear.git
   cd Maplebear
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Build Instructions
1. Build the project for production:
   ```bash
   npm run build
   ```

2. Preview the build locally:
   ```bash
   npm start
   ```

## Environment Variables
Add the following environment variables in your Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: URL for the API.
- `NEXT_PUBLIC_API_KEY`: Your API key.

## Troubleshooting Tips
- If you encounter issues, check the Vercel deployment logs in the dashboard.
- Ensure all environment variables are set correctly.
- For build failures, run the build command locally to catch errors.