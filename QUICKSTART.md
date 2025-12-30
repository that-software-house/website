# Quick Start Guide

Get the THAT Software House replica running in 3 minutes!

## Local Development

```bash
# 1. Install dependencies
yarn install

# 2. (Optional) Set up Supabase
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start development server
yarn dev
```

Visit `http://localhost:5173` to see your application!

## Build for Production

```bash
# Build the app
yarn build

# Preview production build
yarn preview
```

## Quick Deploy to EC2

### Minimum Requirements
- AWS Free Tier EC2 instance (t2.micro)
- Amazon Linux 2023 or Ubuntu 22.04

### Fastest Deployment Method

```bash
# On your EC2 instance
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git
sudo npm install -g yarn serve

# Clone and build
git clone <your-repo-url>
cd tsh-replica
yarn install
yarn build

# Serve on port 80
sudo serve -s dist -l 80
```

Access at `http://your-ec2-ip`

## Project Structure

```
src/
├── components/     # All React components
├── lib/           # Supabase configuration
├── App.jsx        # Main app component
└── index.css      # Global styles
```

## Key Features

- **Responsive Design** - Works on all devices
- **Dark Theme** - Professional dark color scheme
- **Inter Tight Font** - Modern typography
- **Component-Based** - Easy to maintain and extend
- **Optimized Build** - Fast loading times

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Need Help?

See the full README.md for detailed deployment instructions and troubleshooting.
