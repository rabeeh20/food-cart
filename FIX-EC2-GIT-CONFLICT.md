# Fix EC2 Git Pull Conflict

## Problem
Git pull is blocked because `backend/ecosystem.config.cjs` exists on the server but is not tracked in Git.

## Solution

Choose one of these options:

---

### Option 1: Backup and Remove (Recommended)

This backs up your current file, then allows the pull:

```bash
# Backup the existing file
cp backend/ecosystem.config.cjs backend/ecosystem.config.cjs.backup

# Remove the untracked file
rm backend/ecosystem.config.cjs

# Now pull the latest code
git pull origin main

# If needed, compare the files
diff backend/ecosystem.config.cjs backend/ecosystem.config.cjs.backup
```

---

### Option 2: Stash Local Changes

This temporarily saves your local changes:

```bash
# Add the file to Git temporarily
git add backend/ecosystem.config.cjs

# Stash it
git stash

# Pull latest code
git pull origin main

# If you need the old file back, you can retrieve it from stash
# git stash pop
```

---

### Option 3: Force Overwrite (Use with Caution)

This discards your local file completely:

```bash
# Force checkout to overwrite local file
git checkout HEAD backend/ecosystem.config.cjs

# Or reset all untracked files
git clean -fd

# Then pull
git pull origin main
```

---

## Recommended Steps

Run these commands on your EC2 server:

```bash
cd /var/www/food-delivery

# Backup the current ecosystem.config.cjs
cp backend/ecosystem.config.cjs backend/ecosystem.config.cjs.backup

# Remove the untracked file
rm backend/ecosystem.config.cjs

# Pull latest code
git pull origin main

# Verify the pull succeeded
git log -1

# Continue with deployment
cd backend
npm install
pm2 restart food-delivery-backend

# Rebuild admin app
cd ../admin-app
chmod +x node_modules/.bin/vite
npm run build

# Rebuild user app
cd ../user-app
chmod +x node_modules/.bin/vite
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

## Why This Happened

The `ecosystem.config.cjs` file was created directly on your EC2 server during the initial deployment but was never committed to Git. Now it's being tracked in the repository, causing a conflict.

---

## After Resolution

Once you've successfully pulled, continue with the deployment steps from [EC2-DEPLOYMENT-STEPS.md](EC2-DEPLOYMENT-STEPS.md).
