#!/bin/bash

# --- Update system packages ---
sudo yum update -y

# --- Install Node.js LTS (using NodeSource) ---
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# --- [Optional] Install Git if you need to clone your repo ---
# sudo yum install -y git

# --- Create a directory for your application code ---
# cd /home/ec2-user
# git clone https://github.com/your-org/your-repo.git my-app
# cd my-app

# If your code is already on the instance, cd to that directory
cd /home/ec2-user/my-app

# --- Install dependencies using npm ci ---
npm ci

# --- (Optional) Ensure ts-node is available locally ---
# It should be installed as a dev dependency, so npx can call it directly.
# If you want to install it globally:
# sudo npm install -g ts-node typescript

# --- Set up a cron job to run `ts-node src/main.ts` every minute ---
CRON_COMMAND="cd /home/ec2-user/my-app && /usr/bin/npx ts-node src/main.ts"
CRON_SCHEDULE="* * * * *"

# Write out current crontab, remove any existing line matching our command, then add the new line
( crontab -l 2>/dev/null | grep -v -F "$CRON_COMMAND" ; echo "$CRON_SCHEDULE $CRON_COMMAND" ) | crontab -
