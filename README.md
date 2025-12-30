# THAT Software House - Website Replica

A replica of the THAT Software House website built with React, Vite, and Supabase. This project is optimized for deployment on AWS EC2 free tier instances.

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Backend**: Supabase
- **Styling**: CSS3 with CSS Variables
- **Font**: Inter Tight (Google Fonts)

## Project Structure

```
tsh-replica/
├── src/
│   ├── components/
│   │   ├── Header.jsx & Header.css
│   │   ├── Hero.jsx & Hero.css
│   │   ├── Services.jsx & Services.css
│   │   ├── Portfolio.jsx & Portfolio.css
│   │   ├── SMBPackage.jsx & SMBPackage.css
│   │   └── Footer.jsx & Footer.css
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── .env.example
└── package.json
```

## Local Development Setup

### Prerequisites

- Node.js 16+ installed
- Yarn package manager
- Supabase account (optional, for backend features)

### Installation Steps

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tsh-replica
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
yarn build
```

The optimized build will be created in the `dist/` directory.

Preview the production build locally:
```bash
yarn preview
```

## Deployment to AWS EC2 Free Tier

### Step 1: Launch EC2 Instance

1. Sign in to AWS Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"
4. Choose **Amazon Linux 2023** or **Ubuntu Server 22.04 LTS** (both eligible for free tier)
5. Select **t2.micro** instance type (free tier eligible)
6. Configure Security Group:
   - SSH (Port 22) - Your IP
   - HTTP (Port 80) - Anywhere (0.0.0.0/0)
   - HTTPS (Port 443) - Anywhere (0.0.0.0/0)
   - Custom TCP (Port 5173 or 3000 for development) - Anywhere
7. Create or select an existing key pair
8. Launch the instance

### Step 2: Connect to EC2 Instance

```bash
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

For Ubuntu:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 3: Install Node.js and Yarn

For Amazon Linux 2023:
```bash
# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Yarn
sudo npm install -g yarn

# Install Git
sudo yum install git -y
```

For Ubuntu:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
sudo npm install -g yarn

# Install Git
sudo apt install git -y
```

### Step 4: Deploy the Application

```bash
# Clone your repository
git clone <your-repo-url>
cd tsh-replica

# Install dependencies
yarn install

# Create environment file
nano .env
# Add your Supabase credentials, then save (Ctrl+X, Y, Enter)

# Build the application
yarn build
```

### Step 5: Serve with a Production Server

#### Option A: Using serve (Recommended for quick setup)

```bash
# Install serve globally
sudo npm install -g serve

# Serve the built application on port 80
sudo serve -s dist -l 80
```

To run in background:
```bash
# Install PM2
sudo npm install -g pm2

# Start the application with PM2
pm2 serve dist 80 --name tsh-replica --spa

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command output instructions
```

#### Option B: Using Nginx (Recommended for production)

```bash
# Install Nginx
# For Amazon Linux:
sudo yum install nginx -y

# For Ubuntu:
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Copy built files to Nginx directory
sudo cp -r dist/* /usr/share/nginx/html/

# Restart Nginx
sudo systemctl restart nginx
```

Configure Nginx for SPA routing:
```bash
sudo nano /etc/nginx/conf.d/tsh-replica.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Step 6: Access Your Application

Open your browser and navigate to:
- `http://your-ec2-public-ip`
- Or your configured domain name

## Supabase Setup (Optional)

If you plan to use Supabase for backend features:

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings > API
3. Add them to your `.env` file
4. Create necessary tables and configure Row Level Security (RLS)

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Features

- Responsive design matching the original THAT Software House website
- Dark theme with professional typography
- Service showcase sections
- Portfolio/Works display
- SMB Package highlight
- Contact information and footer
- Optimized for performance and SEO

## Performance Optimization

The build is optimized for production with:
- Code splitting
- Asset optimization
- Minification
- Tree shaking

## Monitoring and Logs (PM2)

If using PM2:

```bash
# View logs
pm2 logs tsh-replica

# Monitor application
pm2 monit

# Restart application
pm2 restart tsh-replica

# Stop application
pm2 stop tsh-replica
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 80
sudo lsof -i :80
# Kill the process
sudo kill -9 <PID>
```

### Firewall issues
Ensure your EC2 Security Group allows inbound traffic on ports 80 and 443.

### Application not loading
Check logs:
```bash
pm2 logs
# or
sudo systemctl status nginx
sudo journalctl -u nginx
```

## Costs

This setup uses AWS Free Tier:
- EC2 t2.micro: 750 hours/month free for 12 months
- Data transfer: 100 GB/month free outbound
- Supabase: Free tier with 500 MB database

## License

This is a replica project for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
