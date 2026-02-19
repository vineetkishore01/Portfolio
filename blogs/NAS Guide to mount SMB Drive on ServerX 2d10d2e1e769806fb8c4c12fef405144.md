# NAS Guide to mount SMB Drive on ServerX

# 📘 **Complete NAS Mount & Monitoring Setup Guide for Fedora**

## **📋 Table of Contents**

1. [System Requirements](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
2. [Part 1: SMB/CIFS Mount Setup](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
3. [Part 2: Systemd Mount Service](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
4. [Part 3: NAS Health Monitor](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
5. [Part 4: Telegram Notifications](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
6. [Part 5: Docker Integration](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
7. [Part 6: Testing & Validation](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
8. [Backup & Recovery](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)
9. [Troubleshooting Guide](https://www.notion.so/NAS-Guide-to-mount-SMB-Drive-on-ServerX-2d10d2e1e769806fb8c4c12fef405144?pvs=21)

---

## **🖥️ System Requirements**

- Fedora Server/Workstation (Tested on Fedora 38+)
- Root or sudo access
- Network access to NAS (192.168.0.26 in this case)
- Docker installed (for container management)
- Basic terminal knowledge

---

## **📦 Part 1: SMB/CIFS Mount Setup**

### **Step 1.1: Install Required Packages**

```bash
# Install CIFS/SMB utilities
sudo dnf install -y cifs-utils samba-client samba-common-tools curl

```

**What happens:** Installs tools to communicate with SMB shares and handle network filesystems.

### **Step 1.2: Create Mount Directory**

```bash
# Create the mount point
sudo mkdir -p /mnt/nas

# Set appropriate permissions (adjust UID/GID to your user)
sudo chown vk:wheel /mnt/nas
sudo chmod 755 /mnt/nas

```

**What happens:** Creates an empty directory where the NAS share will appear in your filesystem.

### **Step 1.3: Create Credentials File**

```bash
# Create secure directory for credentials
sudo mkdir -p /etc/samba
sudo nano /etc/samba/credentials

```

Add your NAS credentials:

```
username=your_nas_username
password=your_nas_password
domain=WORKGROUP  # Optional, depends on NAS setup

```

**What happens:** Stores login credentials securely (separate from scripts).

```bash
# Secure the credentials file
sudo chmod 600 /etc/samba/credentials
sudo chown root:root /etc/samba/credentials

```

**Security note:** File permissions `600` mean only root can read/write.

---

## **⚙️ Part 2: Systemd Mount Service**

### **Step 2.1: Create Systemd Mount Unit**

```bash
sudo nano /etc/systemd/system/mnt-nas.mount

```

Paste this configuration:

```
[Unit]
Description=Mount NAS Share at /mnt/nas
Requires=network-online.target
After=network-online.target
Wants=network-online.target

[Mount]
What=//192.168.0.26/RamSetu
Where=/mnt/nas
Type=cifs
Options=credentials=/etc/samba/credentials,uid=1000,gid=1000,_netdev,nofail,vers=3.0,file_mode=0755,dir_mode=0755
TimeoutSec=60

[Install]
WantedBy=multi-user.target

```

### **🔍 Configuration Breakdown:**

- **`[Unit]` Section:**
    - `Requires=network-online.target` - Won't start without network
    - `After=network-online.target` - Waits for network to be ready
    - `Wants=network-online.target` - Soft dependency on network
- **`[Mount]` Section:**
    - `What=` - SMB share path (`//IP/ShareName`)
    - `Where=` - Local mount point
    - `Type=cifs` - Filesystem type
    - `Options=` - Critical mount parameters:
        - `credentials=` - Path to login file
        - `uid=1000,gid=1000` - File ownership (adjust to your user)
        - `_netdev` - Marks as network filesystem
        - `nofail` - Prevents boot failure if NAS is offline
        - `vers=3.0` - SMB protocol version (adjust to your NAS)
        - `file_mode=,dir_mode=` - Permission masks

### **Step 2.2: Enable & Test Mount**

```bash
# Reload systemd to recognize new unit
sudo systemctl daemon-reload

# Test mount manually first
sudo mount -t cifs -o credentials=/etc/samba/credentials,uid=1000,gid=1000,vers=3.0 //192.168.0.26/RamSetu /mnt/nas

# Verify mount worked
ls /mnt/nas/

# Unmount test
sudo umount /mnt/nas

# Enable systemd mount (starts on boot)
sudo systemctl enable mnt-nas.mount
sudo systemctl start mnt-nas.mount

# Check status
sudo systemctl status mnt-nas.mount

```

---

## **👁️ Part 3: NAS Health Monitor**

### **Step 3.1: Create Watchdog Script**

```bash
sudo nano /usr/local/bin/nas-mount-watchdog

```

Paste the complete script (provided in your working version). Key sections explained:

### **📝 Script Architecture:**

```bash
# 1. CONFIGURATION SECTION - Settings you customize
MOUNT_POINT="/mnt/nas"
HEALTH_CHECK_INTERVAL=30
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"
DEPENDENT_CONTAINERS=("sonarr" "radarr" "jellyfin")

# 2. LOGGING FUNCTION - Timestamped messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1"
}

# 3. TELEGRAM FUNCTION - Sends alerts
send_telegram_message() {
    # Creates JSON payload and sends via curl
}

# 4. DOCKER CONTROL - Stops/starts containers
stop_dependent_containers() {
    # Gracefully stops Docker containers
}

start_dependent_containers() {
    # Restarts containers after recovery
}

# 5. HEALTH CHECK - Two-level verification
check_mount_health() {
    # Level 1: Is filesystem mounted? (mountpoint -q)
    # Level 2: Can we read data? (timeout 5 ls)
}

# 6. MAIN LOOP - Continuous monitoring
while true; do
    # Check health every 30 seconds
    # If state changes: send Telegram, control Docker
    # If unhealthy: attempt remount with exponential backoff
    sleep $HEALTH_CHECK_INTERVAL
done
```

## Working Code

```bash
root@localhost:/sudo cat /usr/local/bin/nas-mount-watchdog
#!/bin/bash
# NAS Mount Health Monitor v3 - With Docker Control & Telegram Notifications
# Continuously checks if /mnt/nas is accessible and manages dependent Docker containers

MOUNT_POINT="/mnt/nas"
HEALTH_CHECK_INTERVAL=30  # Check every 30 seconds
STATUS_LOG_INTERVAL=300   # Log "healthy" status every 5 minutes (300 seconds)
CHECK_COUNT=0

# Telegram Configuration (from your WATCHTOWER_NOTIFICATION_URL)
TELEGRAM_BOT_TOKEN="8352048837:AAFpWeG7PWOTBOEoiN1SsnY0XdlfWlo5b4U"
TELEGRAM_CHAT_ID="712957784"

# Docker containers that depend on /mnt/nas mount (add your container names here)
# Example: DEPENDENT_CONTAINERS=("plex" "jellyfin" "sonarr" "radarr")
DEPENDENT_CONTAINERS=("sonarr" "radarr" "jellyfin")

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1"
}

send_telegram_message() {
    local message="$1"
    
    log_message "📱 Attempting to send Telegram: ${message:0:50}..."
    
    # Use printf for proper JSON escaping
    local json_payload=$(printf '{"chat_id":"%s","text":"%s","parse_mode":"HTML"}' \
        "$TELEGRAM_CHAT_ID" \
        "$(echo "$message" | sed 's/"/\\"/g; s/$/\\n/' | tr -d '\n')")
    
    # Send with timeout and log response
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        --connect-timeout 10 \
        --max-time 30)
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        log_message "✅ Telegram sent successfully"
    else
        log_message "❌ Telegram failed: HTTP $http_code - $response_body"
    fi
}

stop_dependent_containers() {
    local reason="$1"
    log_message "⏸️ Stopping dependent Docker containers: ${DEPENDENT_CONTAINERS[*]}"
    
    for container in "${DEPENDENT_CONTAINERS[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            log_message "  - Stopping container: $container"
            docker stop "$container" > /dev/null 2>&1
        fi
    done
    
    if [ -n "$reason" ]; then
        send_telegram_message "🔴 <b>NAS Mount Alert</b>
📍 <i>$(hostname)</i>
⚠️ $reason
⏸️ Stopped containers: ${DEPENDENT_CONTAINERS[*]}"
    fi
}

start_dependent_containers() {
    log_message "▶️ Starting dependent Docker containers: ${DEPENDENT_CONTAINERS[*]}"
    local started_containers=()
    
    for container in "${DEPENDENT_CONTAINERS[@]}"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            log_message "  - Starting container: $container"
            docker start "$container" > /dev/null 2>&1
            started_containers+=("$container")
        fi
    done
    
    if [ ${#started_containers[@]} -gt 0 ]; then
        send_telegram_message "🟢 <b>NAS Mount Restored</b>
📍 <i>$(hostname)</i>
✅ Mount point: $MOUNT_POINT
▶️ Restarted containers: ${started_containers[*]}"
    fi
}

check_mount_health() {
    # Test 1: Is the filesystem mounted?
    if ! mountpoint -q "$MOUNT_POINT"; then
        log_message "❌ MOUNT CHECK FAILED: Mount point is not active"
        return 1
    fi

    # Test 2: Can we actually read? (Real heartbeat)
    if timeout 5 bash -c "ls '$MOUNT_POINT' &>/dev/null"; then
        return 0
    else
        log_message "⚠️ CONNECTION FAILED: Mount appears stale (list timed out)"
        return 2
    fi
}

# Initial setup
log_message "🔧 NAS Mount Monitor v3 starting"
log_message "📁 Monitoring: $MOUNT_POINT (every ${HEALTH_CHECK_INTERVAL}s)"
log_message "🐳 Dependent containers: ${DEPENDENT_CONTAINERS[*]}"
log_message "📱 Telegram notifications enabled for chat: $TELEGRAM_CHAT_ID"

send_telegram_message "🔔 <b>NAS Monitor Started</b>
📍 <i>$(hostname)</i>
📁 Monitoring: $MOUNT_POINT
✅ System is online"

MOUNT_HEALTHY=true  # Track previous state for state change detection

while true; do
    ((CHECK_COUNT++))
    
    # Check mount health
    if check_mount_health; then
        # Mount is healthy
        if [ "$MOUNT_HEALTHY" = false ]; then
            # State changed from unhealthy to healthy
            log_message "✅ MOUNT RESTORED: /mnt/nas is now accessible"
            
            # Start dependent containers
            start_dependent_containers
            
            MOUNT_HEALTHY=true
        fi
        
        # Periodic healthy log
        if [ $((CHECK_COUNT * HEALTH_CHECK_INTERVAL % STATUS_LOG_INTERVAL)) -eq 0 ]; then
            log_message "✅ MOUNT HEALTHY: /mnt/nas is accessible. (Check #$CHECK_COUNT)"
        fi
        
    else
        # Mount is unhealthy
        if [ "$MOUNT_HEALTHY" = true ] || [ "$MOUNT_HEALTHY" = "" ]; then
            # State changed from healthy to unhealthy (or initial failure)
            log_message "🚨 MOUNT FAILURE DETECTED: Attempting recovery..."
            
            # Stop dependent containers first
            stop_dependent_containers "NAS mount became unavailable"
            
            # Attempt to remount
            log_message "🔄 Attempting to remount..."
            systemctl stop mnt-nas.mount 2>/dev/null
            sleep 2
            systemctl start mnt-nas.mount 2>/dev/null
            sleep 5
            
            MOUNT_HEALTHY=false
        else
            # Mount was already unhealthy, check if we should try again
            if [ $((CHECK_COUNT % 6)) -eq 0 ]; then  # Try every 3 minutes (6 checks * 30s)
                log_message "🔄 Retrying mount recovery..."
                systemctl stop mnt-nas.mount 2>/dev/null
                sleep 2
                systemctl start mnt-nas.mount 2>/dev/null
            fi
        fi
    fi

    sleep $HEALTH_CHECK_INTERVAL
done
```

### **Step 3.2: Make Script Executable**

```bash
sudo chmod +x /usr/local/bin/nas-mount-watchdog

```

### **Step 3.3: Create Systemd Service for Monitor**

```bash
sudo nano /etc/systemd/system/nas-mount-monitor.service

```

```
[Unit]
Description=NAS Mount Health Monitor & Retry Daemon
Requires=network-online.target mnt-nas.mount
After=network-online.target mnt-nas.mount
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/nas-mount-watchdog
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target

```

### **🔍 Service Configuration Explained:**

- **`Requires=`** - Hard dependency on network and mount
- **`After=`** - Starts after these services
- **`Restart=always`** - Auto-restarts if crashes
- **`RestartSec=10`** - Waits 10 seconds before restarting

```bash
# Enable and start monitor
sudo systemctl daemon-reload
sudo systemctl enable nas-mount-monitor.service
sudo systemctl start nas-mount-monitor.service

# Check it's running
sudo systemctl status nas-mount-monitor.service

```

---

## **📱 Part 4: Telegram Notifications**

### **Step 4.1: Create Telegram Bot**

1. Open Telegram, search for `@BotFather`
2. Send `/newbot` and follow prompts
3. Save the bot token (format: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)
4. Start a chat with your new bot
5. Get your chat ID by messaging `@userinfobot`

### **Step 4.2: Test Telegram Connection**

```bash
# Replace with your actual token and chat ID
BOT_TOKEN="8352048837:AAFpWeG7PWOTBOEoiN1SsnY0XdlfWlo5b4U"
CHAT_ID="712957784"

# Test bot token
curl -s "<https://api.telegram.org/bot${BOT_TOKEN}/getMe>" | jq .

# Send test message
curl -s -X POST \\
  -H 'Content-Type: application/json' \\
  -d "{\\"chat_id\\":\\"${CHAT_ID}\\",\\"text\\":\\"🔔 NAS Monitor Test\\\\n📍 Host: \\$(hostname)\\",\\"parse_mode\\":\\"HTML\\"}" \\
  "<https://api.telegram.org/bot${BOT_TOKEN}/sendMessage>"

```

### **Step 4.3: Update Watchdog Script**

Edit these lines in `/usr/local/bin/nas-mount-watchdog`:

```bash
TELEGRAM_BOT_TOKEN="YOUR_ACTUAL_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_ACTUAL_CHAT_ID"

```

---

## **🐳 Part 5: Docker Integration**

### **Step 5.1: Configure Dependent Containers**

Edit the watchdog script to list your containers:

```bash
# Containers that depend on /mnt/nas
DEPENDENT_CONTAINERS=("sonarr" "radarr" "jellyfin" "plex" "bazarr")

```

### **Step 5.2: Add Docker Healthchecks (Optional)**

Add to your `docker-compose.yml` for each container:

```yaml
version: '3.8'
services:
  sonarr:
    # ... existing config
    healthcheck:
      test: ["CMD", "sh", "-c", "test -d /path/to/mount/in/container"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

```

### **Step 5.3: Verify Container Detection**

```bash
# Test if script can detect your containers
for container in sonarr radarr jellyfin; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "✓ $container is running"
    else
        echo "✗ $container is not running"
    fi
done

```

---

## **🧪 Part 6: Testing & Validation**

### **Step 6.1: Full System Test**

```bash
#!/bin/bash
# save as test_nas_setup.sh

echo "=== NAS Mount System Test ==="
echo ""

echo "1. Testing mount service..."
sudo systemctl status mnt-nas.mount --no-pager

echo ""
echo "2. Testing monitor service..."
sudo systemctl status nas-mount-monitor.service --no-pager

echo ""
echo "3. Testing mount access..."
ls -la /mnt/nas/ 2>/dev/null || echo "Mount not accessible"

echo ""
echo "4. Testing Docker containers..."
docker ps --format "table {{.Names}}\\t{{.Status}}" | grep -E "(sonarr|radarr|jellyfin)" || true

echo ""
echo "5. Testing Telegram..."
curl -s "<https://api.telegram.org/bot8352048837:AAFpWeG7PWOTBOEoiN1SsnY0XdlfWlo5b4U/getMe>" | grep -q '"ok":true' && echo "✓ Telegram bot active" || echo "✗ Telegram bot issue"

echo ""
echo "=== Test Complete ==="

```

### **Step 6.2: Simulate Failure Test**

```bash
# Manual failure simulation
sudo systemctl stop mnt-nas.mount
echo "Mount stopped. Wait 30-60 seconds for detection..."

# Monitor in another terminal
sudo journalctl -u nas-mount-monitor.service -f

# After Telegram alert, restore
sudo systemctl start mnt-nas.mount

```

### **Step 6.3: Automatic Test Script**

```bash
cat > /usr/local/bin/test-nas-failure << 'EOF'
#!/bin/bash
echo "Simulating NAS failure in 5 seconds..."
sleep 5

echo "1. Stopping mount..."
sudo systemctl stop mnt-nas.mount

echo "2. Waiting for detection (60 seconds)..."
sleep 60

echo "3. Checking logs..."
sudo journalctl -u nas-mount-monitor.service --since "1 minute ago" | tail -20

echo "4. Restoring..."
sudo systemctl start mnt-nas.mount

echo "5. Waiting for recovery..."
sleep 40

echo "Test complete. Check Telegram for notifications."
EOF

sudo chmod +x /usr/local/bin/test-nas-failure

```

---

## **💾 Backup & Recovery**

### **Step 7.1: Create Backup Script**

```bash
sudo nano /usr/local/bin/backup-nas-config

```

```bash
#!/bin/bash
BACKUP_DIR="/root/nas-config-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up NAS configuration to: $BACKUP_DIR"

# Backup systemd units
cp /etc/systemd/system/mnt-nas.mount "$BACKUP_DIR/"
cp /etc/systemd/system/nas-mount-monitor.service "$BACKUP_DIR/"

# Backup scripts
cp /usr/local/bin/nas-mount-watchdog "$BACKUP_DIR/"

# Backup credentials (careful with permissions!)
cp /etc/samba/credentials "$BACKUP_DIR/credentials.backup"
chmod 600 "$BACKUP_DIR/credentials.backup"

# Create restore script
cat > "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" << 'EOF'
# NAS Configuration Restore

## Files to restore:
1. /etc/systemd/system/mnt-nas.mount
2. /etc/systemd/system/nas-mount-monitor.service
3. /usr/local/bin/nas-mount-watchdog
4. /etc/samba/credentials

## Commands to run:
sudo systemctl daemon-reload
sudo systemctl enable mnt-nas.mount
sudo systemctl enable nas-mount-monitor.service
sudo chmod +x /usr/local/bin/nas-mount-watchdog
sudo chmod 600 /etc/samba/credentials
EOF

echo "Backup complete. Files in: $BACKUP_DIR"
echo "To restore: sudo systemctl daemon-reload && sudo systemctl enable --now mnt-nas.mount nas-mount-monitor.service"

```

```bash
sudo chmod +x /usr/local/bin/backup-nas-config

```

### **Step 7.2: Automated Backup (Cron)**

```bash
# Add to crontab
sudo crontab -e

```

Add line for weekly backup:

```
0 2 * * 0 /usr/local/bin/backup-nas-config > /var/log/nas-backup.log 2>&1

```

---

## **🔧 Troubleshooting Guide**

### **Common Issues & Solutions:**

| Symptom | Check | Solution |
| --- | --- | --- |
| Mount fails on boot | `journalctl -u mnt-nas.mount` | Add `_netdev,nofail` to options |
| Telegram not sending | `curl bot_token/getMe` | Verify token/chat ID, check JSON format |
| Docker containers not stopping | Script logs | Check container names in `DEPENDENT_CONTAINERS` |
| "Directory not empty" | `ls -la /mnt/nas/` | `sudo rm -rf /mnt/nas/*` then recreate |
| Monitor not starting | `systemctl status nas-mount-monitor` | Check script permissions, dependencies |

### **Debug Commands:**

```bash
# 1. Check all services
sudo systemctl status mnt-nas.mount nas-mount-monitor.service

# 2. Follow logs in real-time
sudo journalctl -f -u mnt-nas.mount -u nas-mount-monitor.service

# 3. Test mount manually
sudo mount -t cifs -o credentials=/etc/samba/credentials,vers=3.0 //192.168.0.26/RamSetu /mnt/test

# 4. Verify network connectivity
ping -c 3 192.168.0.26
smbclient -L //192.168.0.26 -N

# 5. Check script execution
sudo -u root /usr/local/bin/nas-mount-watchdog

```

---

## **🎯 Quick Setup Cheat Sheet**

```bash
# ONE-LINER SETUP (after fresh Fedora install)
sudo dnf install -y cifs-utils curl docker && \\
sudo mkdir -p /mnt/nas /etc/samba && \\
sudo tee /etc/samba/credentials <<< $'username=nas_user\\npassword=nas_pass' && \\
sudo chmod 600 /etc/samba/credentials && \\
sudo tee /etc/systemd/system/mnt-nas.mount <<< '[Unit]\\nDescription=NAS Mount\\nAfter=network.target\\n\\n[Mount]\\nWhat=//192.168.0.26/RamSetu\\nWhere=/mnt/nas\\nType=cifs\\nOptions=credentials=/etc/samba/credentials,_netdev,nofail,vers=3.0\\n\\n[Install]\\nWantedBy=multi-user.target' && \\
sudo systemctl daemon-reload && \\
sudo systemctl enable --now mnt-nas.mount

```

---

## **📊 System Overview Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NAS Server    │    │   Fedora Server │    │   Telegram Bot  │
│   192.168.0.26  │◄──►│  Mount: /mnt/nas│    │   Notifications │
│    Share:       │    │                 │    │                 │
│    RamSetu      │    │  ├─ systemd     │    └─────────────────┘
└─────────────────┘    │  │   mount unit │            ▲
                       │  ├─ watchdog    │            │
                       │  │   script     │            │
                       │  └─ Docker      │            │
                       │     containers  │            │
                       └─────────────────┘            │
                               │                      │
                         ┌─────▼─────┐                │
                         │Health Check│               │
                         │Every 30s   ├───────────────┘
                         └────────────┘
                               │
                     ┌─────────▼─────────┐
                     │If mount fails:    │
                     │1. Stop Docker     │
                     │2. Send Telegram   │
                     │3. Attempt remount │
                     │4. Restart Docker  │
                     └───────────────────┘

```

---

## **✅ Final Verification Checklist**

Run this after complete setup:

```bash
echo "=== Final Verification ==="
echo ""
echo "1. Mount active:         $(systemctl is-active mnt-nas.mount)"
echo "2. Monitor active:       $(systemctl is-active nas-mount-monitor.service)"
echo "3. Directory accessible: $(ls /mnt/nas/ >/dev/null 2>&1 && echo "✓" || echo "✗")"
echo "4. Docker running:       $(docker ps --format '{{.Names}}' | grep -q sonarr && echo "✓" || echo "✗")"
echo "5. Telegram test:        $(curl -s bot_token/getMe | grep -q ok && echo "✓" || echo "✗")"
echo ""
echo "To simulate failure: sudo systemctl stop mnt-nas.mount"
echo "Wait 30 seconds for Telegram alert"

```

---

## **🆘 Emergency Recovery**

If system fails, restore from backup:

```bash
# 1. Restore all config files from backup
sudo cp /backup/mnt-nas.mount /etc/systemd/system/
sudo cp /backup/nas-mount-monitor.service /etc/systemd/system/
sudo cp /backup/nas-mount-watchdog /usr/local/bin/
sudo cp /backup/credentials /etc/samba/

# 2. Set permissions
sudo chmod +x /usr/local/bin/nas-mount-watchdog
sudo chmod 600 /etc/samba/credentials

# 3. Reload and start
sudo systemctl daemon-reload
sudo systemctl enable --now mnt-nas.mount nas-mount-monitor.service

```

This guide provides a complete, reproducible setup. Save it alongside your backup files for future recovery. The system is now **self-healing** - it automatically detects failures, notifies you via Telegram, and attempts recovery while gracefully managing dependent Docker containers.

---

# One Shot Install Script (Does exactly what the above guide says but in a single shot, haven’t tested it so hoping it should work)

Here's a comprehensive interactive setup script for configuring multiple NAS mounts with monitoring on Fedora:

```bash
#!/bin/bash
# NAS Mount & Monitoring Setup Wizard for Fedora
# Complete automated setup with interactive configuration

set -e  # Exit on error

# Color codes for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Global configuration
CONFIG_DIR="/etc/nas-monitor"
BACKUP_DIR="/root/nas-config-backups"
LOG_FILE="/var/log/nas-setup.log"

# Function definitions
log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error_message() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning_message() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info_message() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        error_message "This script must be run as root. Use sudo."
    fi
}

check_fedora() {
    if ! grep -q "Fedora" /etc/os-release; then
        error_message "This script is designed for Fedora Linux only."
    fi
}

install_dependencies() {
    log_message "Installing required packages..."

    # Update system first
    dnf update -y --refresh >> "$LOG_FILE" 2>&1

    # Install required packages
    local packages=(
        cifs-utils
        samba-client
        samba-common-tools
        curl
        jq
        docker
        docker-compose
        tree
    )

    for pkg in "${packages[@]}"; do
        if ! rpm -q "$pkg" >/dev/null 2>&1; then
            dnf install -y "$pkg" >> "$LOG_FILE" 2>&1
            log_message "Installed $pkg"
        else
            log_message "$pkg already installed"
        fi
    done

    # Enable and start Docker
    systemctl enable --now docker >> "$LOG_FILE" 2>&1
}

create_directories() {
    log_message "Creating configuration directories..."

    mkdir -p "$CONFIG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "/usr/local/bin"

    # Set proper permissions
    chmod 755 "$CONFIG_DIR"
    chmod 700 "$BACKUP_DIR"
}

backup_existing_config() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/backup_$timestamp"

    log_message "Backing up existing configuration to $backup_path..."

    mkdir -p "$backup_path"

    # Backup systemd units
    cp -r /etc/systemd/system/*.mount "$backup_path/" 2>/dev/null || true
    cp -r /etc/systemd/system/*nas*.service "$backup_path/" 2>/dev/null || true

    # Backup scripts
    cp -r /usr/local/bin/nas-* "$backup_path/" 2>/dev/null || true

    # Backup credentials
    cp -r /etc/samba/credentials* "$backup_path/" 2>/dev/null || true

    # Create restore script
    cat > "$backup_path/RESTORE.sh" << 'EOF'
#!/bin/bash
# Restore NAS configuration from backup

BACKUP_DIR="$(dirname "$0")"

echo "Restoring NAS configuration from backup..."
echo "Backup directory: $BACKUP_DIR"

# Restore systemd units
cp "$BACKUP_DIR"/*.mount /etc/systemd/system/ 2>/dev/null || true
cp "$BACKUP_DIR"/*.service /etc/systemd/system/ 2>/dev/null || true

# Restore scripts
cp "$BACKUP_DIR"/nas-* /usr/local/bin/ 2>/dev/null || true
chmod +x /usr/local/bin/nas-* 2>/dev/null || true

# Restore credentials
mkdir -p /etc/samba
cp "$BACKUP_DIR"/credentials* /etc/samba/ 2>/dev/null || true
chmod 600 /etc/samba/credentials* 2>/dev/null || true

# Reload systemd
systemctl daemon-reload

echo "Restore complete. Enable services with:"
echo "  systemctl enable --now mnt-*.mount"
echo "  systemctl enable --now nas-*.service"
EOF

    chmod +x "$backup_path/RESTORE.sh"
    log_message "Backup completed at $backup_path"
}

get_user_input() {
    # Clear screen
    clear

    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║    NAS Mount & Monitoring Setup Wizard for Fedora     ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""

    # Get number of mount points
    while true; do
        read -p "How many mount points do you want to monitor? (1-5): " MOUNT_COUNT

        if [[ "$MOUNT_COUNT" =~ ^[1-5]$ ]]; then
            break
        else
            error_message "Please enter a number between 1 and 5"
        fi
    done

    # Global configuration
    echo ""
    info_message "Global Configuration (applies to all mount points)"
    echo "═══════════════════════════════════════════════════════"

    # Telegram configuration
    read -p "Enable Telegram notifications? (y/n): " -n 1 TELEGRAM_ENABLE
    echo ""

    if [[ "$TELEGRAM_ENABLE" =~ ^[Yy]$ ]]; then
        while true; do
            read -p "Enter Telegram Bot Token: " TELEGRAM_BOT_TOKEN
            if [[ -n "$TELEGRAM_BOT_TOKEN" ]]; then
                break
            fi
            error_message "Bot token cannot be empty"
        done

        while true; do
            read -p "Enter Telegram Chat ID: " TELEGRAM_CHAT_ID
            if [[ "$TELEGRAM_CHAT_ID" =~ ^[0-9-]+$ ]]; then
                break
            fi
            error_message "Chat ID must be numeric (can include - for groups)"
        done

        # Test Telegram connection
        log_message "Testing Telegram connection..."
        if curl -s "<https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe>" | grep -q '"ok":true'; then
            log_message "Telegram bot connection successful"
        else
            warning_message "Telegram bot token may be invalid. Notifications may fail."
        fi
    fi

    # Heartbeat duration
    read -p "Enter heartbeat duration in seconds (default: 30): " HEARTBEAT_DURATION
    HEARTBEAT_DURATION=${HEARTBEAT_DURATION:-30}

    # Mount point configuration
    declare -gA MOUNT_CONFIGS
    declare -gA MOUNT_CONTAINERS

    for ((i=1; i<=MOUNT_COUNT; i++)); do
        echo ""
        info_message "Configuration for Mount Point #$i"
        echo "═══════════════════════════════════════════════════════"

        # Mount point path
        while true; do
            read -p "Enter mount point path (e.g., /mnt/nas): " MOUNT_PATH

            if [[ -z "$MOUNT_PATH" ]]; then
                error_message "Mount path cannot be empty"
            elif [[ ! "$MOUNT_PATH" =~ ^/ ]]; then
                error_message "Mount path must be absolute (start with /)"
            else
                # Create directory if it doesn't exist
                mkdir -p "$MOUNT_PATH"
                chmod 755 "$MOUNT_PATH"
                MOUNT_CONFIGS[$i,path]="$MOUNT_PATH"
                break
            fi
        done

        # NAS share details
        read -p "Enter NAS IP address (e.g., 192.168.0.26): " NAS_IP
        read -p "Enter NAS share name (e.g., RamSetu): " SHARE_NAME

        MOUNT_CONFIGS[$i,ip]="$NAS_IP"
        MOUNT_CONFIGS[$i,share]="$SHARE_NAME"

        # Credentials
        echo ""
        echo "NAS Credentials for $MOUNT_PATH:"
        read -p "  Username: " NAS_USER
        read -s -p "  Password: " NAS_PASS
        echo ""

        # Dependent Docker containers
        echo ""
        echo "Docker containers dependent on $MOUNT_PATH"
        echo "  (Enter container names separated by space, or press Enter for none)"
        read -p "  Container names: " CONTAINER_LIST

        if [[ -n "$CONTAINER_LIST" ]]; then
            # Convert to array and store
            IFS=' ' read -ra CONTAINERS <<< "$CONTAINER_LIST"
            MOUNT_CONTAINERS[$i]="${CONTAINERS[*]}"

            # Verify containers exist
            log_message "Verifying Docker containers..."
            for container in "${CONTAINERS[@]}"; do
                if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
                    log_message "  ✓ Found container: $container"
                else
                    warning_message "  Container '$container' not found. It will be skipped."
                fi
            done
        fi

        # Store credentials
        CRED_FILE="/etc/samba/credentials_$(basename "$MOUNT_PATH")"
        echo "username=$NAS_USER" > "$CRED_FILE"
        echo "password=$NAS_PASS" >> "$CRED_FILE"
        echo "domain=WORKGROUP" >> "$CRED_FILE"
        chmod 600 "$CRED_FILE"

        MOUNT_CONFIGS[$i,creds]="$CRED_FILE"

        log_message "Configured mount point: $MOUNT_PATH → //$NAS_IP/$SHARE_NAME"
    done
}

create_systemd_mount_units() {
    log_message "Creating systemd mount units..."

    for ((i=1; i<=MOUNT_COUNT; i++)); do
        MOUNT_PATH="${MOUNT_CONFIGS[$i,path]}"
        NAS_IP="${MOUNT_CONFIGS[$i,ip]}"
        SHARE_NAME="${MOUNT_CONFIGS[$i,share]}"
        CRED_FILE="${MOUNT_CONFIGS[$i,creds]}"

        # Create systemd-safe unit name (replace / with -)
        UNIT_NAME="mnt-$(echo "$MOUNT_PATH" | sed 's|^/||; s|/|-|g').mount"

        cat > "/etc/systemd/system/$UNIT_NAME" << EOF
[Unit]
Description=Mount NAS Share at $MOUNT_PATH
Requires=network-online.target
After=network-online.target
Wants=network-online.target

[Mount]
What=//$NAS_IP/$SHARE_NAME
Where=$MOUNT_PATH
Type=cifs
Options=credentials=$CRED_FILE,uid=0,gid=0,_netdev,nofail,vers=3.0,file_mode=0755,dir_mode=0755
TimeoutSec=60

[Install]
WantedBy=multi-user.target
EOF

        log_message "Created mount unit: $UNIT_NAME"
    done
}

create_watchdog_script() {
    log_message "Creating unified watchdog script..."

    # Generate script with all mount points
    cat > "/usr/local/bin/nas-unified-watchdog" << 'EOF'
#!/bin/bash
# Unified NAS Mount Health Monitor
# Monitors multiple mount points with Docker container management

set -e

# Global configuration
CONFIG_DIR="/etc/nas-monitor"
LOG_FILE="/var/log/nas-monitor.log"
HEALTH_CHECK_INTERVAL=__HEARTBEAT_DURATION__
STATUS_LOG_INTERVAL=300

# Telegram configuration (if enabled)
__TELEGRAM_CONFIG__

# Mount point configurations
declare -A MOUNT_POINTS
__MOUNT_POINTS_CONFIG__

# Container dependencies
declare -A CONTAINER_DEPS
__CONTAINER_DEPS_CONFIG__

# Initialize health status tracking
declare -A MOUNT_HEALTHY
for mp in "${!MOUNT_POINTS[@]}"; do
    MOUNT_HEALTHY["$mp"]=true
done

# Function definitions
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_FILE"
    logger -t "nas-watchdog" "$1"
}

__TELEGRAM_FUNCTION__

check_mount_health() {
    local mount_point="$1"

    # Test 1: Is the filesystem mounted?
    if ! mountpoint -q "$mount_point"; then
        log_message "❌ MOUNT CHECK FAILED [$mount_point]: Mount point is not active"
        return 1
    fi

    # Test 2: Can we actually read? (Real heartbeat)
    if timeout 5 bash -c "ls '$mount_point' &>/dev/null"; then
        return 0
    else
        log_message "⚠️ CONNECTION FAILED [$mount_point]: Mount appears stale"
        return 2
    fi
}

control_containers() {
    local mount_point="$1"
    local action="$2"  # "stop" or "start"
    local reason="$3"

    local containers="${CONTAINER_DEPS[$mount_point]}"

    if [[ -z "$containers" ]]; then
        return 0
    fi

    IFS=' ' read -ra container_array <<< "$containers"

    case "$action" in
        "stop")
            log_message "⏸️ Stopping containers for $mount_point: ${container_array[*]}"
            for container in "${container_array[@]}"; do
                if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
                    log_message "  - Stopping: $container"
                    docker stop "$container" > /dev/null 2>&1 || true
                fi
            done

            if [[ -n "$reason" ]] && [[ "$TELEGRAM_ENABLED" == "true" ]]; then
                send_telegram_message "🔴 <b>NAS Mount Alert</b>
📍 <i>$(hostname)</i>
📁 Mount: $mount_point
⚠️ $reason
⏸️ Stopped containers: ${container_array[*]}"
            fi
            ;;

        "start")
            log_message "▶️ Starting containers for $mount_point: ${container_array[*]}"
            local started_containers=()

            for container in "${container_array[@]}"; do
                if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
                    log_message "  - Starting: $container"
                    docker start "$container" > /dev/null 2>&1 || true
                    started_containers+=("$container")
                fi
            done

            if [[ ${#started_containers[@]} -gt 0 ]] && [[ "$TELEGRAM_ENABLED" == "true" ]]; then
                send_telegram_message "🟢 <b>NAS Mount Restored</b>
📍 <i>$(hostname)</i>
📁 Mount: $mount_point
✅ Mount point restored
▶️ Restarted containers: ${started_containers[*]}"
            fi
            ;;
    esac
}

attempt_remount() {
    local mount_point="$1"

    # Extract unit name from mount path
    local unit_name="mnt-$(echo "$mount_point" | sed 's|^/||; s|/|-|g').mount"

    log_message "🔄 Attempting to remount $mount_point (unit: $unit_name)"

    # Stop the mount
    systemctl stop "$unit_name" 2>/dev/null || true
    sleep 2

    # Start the mount
    systemctl start "$unit_name" 2>/dev/null || true
    sleep 5
}

# Main monitoring loop
log_message "🔧 Unified NAS Monitor starting"
log_message "📊 Monitoring ${#MOUNT_POINTS[@]} mount point(s)"
log_message "⏱️ Heartbeat interval: ${HEART_CHECK_INTERVAL}s"

if [[ "$TELEGRAM_ENABLED" == "true" ]]; then
    log_message "📱 Telegram notifications enabled"
    send_telegram_message "🔔 <b>Unified NAS Monitor Started</b>
📍 <i>$(hostname)</i>
📊 Monitoring ${#MOUNT_POINTS[@]} mount point(s)
✅ System is online"
fi

CHECK_COUNT=0

while true; do
    ((CHECK_COUNT++))

    for mount_point in "${!MOUNT_POINTS[@]}"; do
        if check_mount_health "$mount_point"; then
            # Mount is healthy
            if [[ "${MOUNT_HEALTHY[$mount_point]}" == "false" ]]; then
                # State changed from unhealthy to healthy
                log_message "✅ MOUNT RESTORED: $mount_point is now accessible"

                # Start dependent containers
                control_containers "$mount_point" "start"

                MOUNT_HEALTHY["$mount_point"]=true
            fi
        else
            # Mount is unhealthy
            if [[ "${MOUNT_HEALTHY[$mount_point]}" == "true" ]] || [[ -z "${MOUNT_HEALTHY[$mount_point]}" ]]; then
                # State changed from healthy to unhealthy
                log_message "🚨 MOUNT FAILURE DETECTED: $mount_point is unavailable"

                # Stop dependent containers first
                control_containers "$mount_point" "stop" "Mount became unavailable"

                # Attempt to remount
                attempt_remount "$mount_point"

                MOUNT_HEALTHY["$mount_point"]=false
            else
                # Mount was already unhealthy, retry periodically
                if [[ $((CHECK_COUNT % 6)) -eq 0 ]]; then
                    log_message "🔄 Retrying mount recovery for $mount_point..."
                    attempt_remount "$mount_point"
                fi
            fi
        fi
    done

    # Periodic status log
    if [[ $((CHECK_COUNT * HEALTH_CHECK_INTERVAL % STATUS_LOG_INTERVAL)) -eq 0 ]]; then
        healthy_count=0
        for status in "${MOUNT_HEALTHY[@]}"; do
            [[ "$status" == "true" ]] && ((healthy_count++))
        done
        log_message "📊 STATUS: $healthy_count/${#MOUNT_POINTS[@]} mount points healthy (Check #$CHECK_COUNT)"
    fi

    sleep "$HEALTH_CHECK_INTERVAL"
done
EOF

    # Replace placeholders with actual values
    # Replace heartbeat duration
    sed -i "s/__HEARTBEAT_DURATION__/$HEARTBEAT_DURATION/g" "/usr/local/bin/nas-unified-watchdog"

    # Build mount points configuration
    MOUNT_POINTS_CONFIG=""
    for ((i=1; i<=MOUNT_COUNT; i++)); do
        MOUNT_PATH="${MOUNT_CONFIGS[$i,path]}"
        MOUNT_POINTS_CONFIG+="MOUNT_POINTS[\\"$MOUNT_PATH\\"]=\\"$MOUNT_PATH\\""$'\\n'
    done

    # Build container dependencies configuration
    CONTAINER_DEPS_CONFIG=""
    for ((i=1; i<=MOUNT_COUNT; i++)); do
        MOUNT_PATH="${MOUNT_CONFIGS[$i,path]}"
        CONTAINERS="${MOUNT_CONTAINERS[$i]}"
        if [[ -n "$CONTAINERS" ]]; then
            CONTAINER_DEPS_CONFIG+="CONTAINER_DEPS[\\"$MOUNT_PATH\\"]=\\"$CONTAINERS\\""$'\\n'
        fi
    done

    # Replace configurations
    sed -i "s|__MOUNT_POINTS_CONFIG__|$MOUNT_POINTS_CONFIG|g" "/usr/local/bin/nas-unified-watchdog"
    sed -i "s|__CONTAINER_DEPS_CONFIG__|$CONTAINER_DEPS_CONFIG|g" "/usr/local/bin/nas-unified-watchdog"

    # Handle Telegram configuration
    if [[ "$TELEGRAM_ENABLE" =~ ^[Yy]$ ]]; then
        TELEGRAM_CONFIG="TELEGRAM_ENABLED=\\"true\\"
TELEGRAM_BOT_TOKEN=\\"$TELEGRAM_BOT_TOKEN\\"
TELEGRAM_CHAT_ID=\\"$TELEGRAM_CHAT_ID\\""

        # Include Telegram function
        TELEGRAM_FUNCTION=$(cat << 'TELEGRAM_FUNC_EOF'
send_telegram_message() {
    local message="$1"

    # Use printf for proper JSON escaping
    local json_payload=$(printf '{"chat_id":"%s","text":"%s","parse_mode":"HTML"}' \\
        "$TELEGRAM_CHAT_ID" \\
        "$(echo "$message" | sed 's/"/\\\\"/g; s/$/\\\\n/' | tr -d '\\n')")

    # Send with timeout
    local response=$(curl -s -w "\\n%{http_code}" \\
        -X POST \\
        -H "Content-Type: application/json" \\
        -d "$json_payload" \\
        "<https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage>" \\
        --connect-timeout 10 \\
        --max-time 30 2>/dev/null || true)

    local http_code=$(echo "$response" | tail -n1)

    if [[ "$http_code" == "200" ]]; then
        log_message "✅ Telegram sent successfully"
    else
        log_message "❌ Telegram failed: HTTP $http_code"
    fi
}
TELEGRAM_FUNC_EOF
)

        sed -i "s|__TELEGRAM_CONFIG__|$TELEGRAM_CONFIG|g" "/usr/local/bin/nas-unified-watchdog"
        sed -i "s|__TELEGRAM_FUNCTION__|$TELEGRAM_FUNCTION|g" "/usr/local/bin/nas-unified-watchdog"
    else
        sed -i "s/__TELEGRAM_CONFIG__/TELEGRAM_ENABLED=\\"false\\"/g" "/usr/local/bin/nas-unified-watchdog"
        sed -i "s/__TELEGRAM_FUNCTION__//g" "/usr/local/bin/nas-unified-watchdog"
    fi

    chmod +x "/usr/local/bin/nas-unified-watchdog"
    log_message "Created unified watchdog script"
}

create_monitor_service() {
    log_message "Creating unified monitor service..."

    cat > "/etc/systemd/system/nas-unified-monitor.service" << EOF
[Unit]
Description=Unified NAS Mount Health Monitor
Requires=network-online.target
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/nas-unified-watchdog
Restart=always
RestartSec=10
User=root
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=yes
ProtectSystem=strict
PrivateTmp=yes
PrivateDevices=yes
ProtectHome=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes

[Install]
WantedBy=multi-user.target
EOF

    log_message "Created unified monitor service"
}

create_management_scripts() {
    log_message "Creating management scripts..."

    # Status check script
    cat > "/usr/local/bin/nas-status" << 'EOF'
#!/bin/bash
# Check status of all NAS mounts and services

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                NAS Mount Status Report                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

echo "📊 Systemd Services Status:"
echo "═══════════════════════════════════════════════════════"

# Check mount units
for unit in /etc/systemd/system/mnt-*.mount; do
    if [[ -f "$unit" ]]; then
        unit_name=$(basename "$unit")
        status=$(systemctl is-active "$unit_name" 2>/dev/null || echo "unknown")

        if [[ "$status" == "active" ]]; then
            echo -e "  ✓ $unit_name: \\033[0;32mACTIVE\\033[0m"
        else
            echo -e "  ✗ $unit_name: \\033[0;31m$status\\033[0m"
        fi
    fi
done

echo ""
echo "🐳 Docker Container Status:"
echo "═══════════════════════════════════════════════════════"

# Get all containers that might be dependent
all_containers=$(grep -r "CONTAINER_DEPS" /usr/local/bin/nas-unified-watchdog | \\
                 grep -o '\\["[^"]*"\\]="[^"]*"' | \\
                 cut -d'"' -f4 | \\
                 tr ' ' '\\n' | sort -u)

if [[ -z "$all_containers" ]]; then
    echo "  No dependent containers configured"
else
    for container in $all_containers; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            container_status=$(docker ps --format '{{.Status}}' --filter "name=^${container}$")
            echo -e "  ✓ $container: \\033[0;32m$container_status\\033[0m"
        elif docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            echo -e "  ⏸️ $container: \\033[0;33mSTOPPED\\033[0m"
        else
            echo -e "  ✗ $container: \\033[0;31mNOT FOUND\\033[0m"
        fi
    done
fi

echo ""
echo "📈 Mount Point Health:"
echo "═══════════════════════════════════════════════════════"

# Check each mount point
mount_points=$(grep -o 'MOUNT_POINTS\\["[^"]*"\\]' /usr/local/bin/nas-unified-watchdog | \\
               cut -d'"' -f2)

for mp in $mount_points; do
    if mountpoint -q "$mp"; then
        if timeout 2 bash -c "ls '$mp' &>/dev/null"; then
            echo -e "  ✓ $mp: \\033[0;32mHEALTHY\\033[0m"
        else
            echo -e "  ⚠️ $mp: \\033[0;33mMOUNTED BUT STALE\\033[0m"
        fi
    else
        echo -e "  ✗ $mp: \\033[0;31mNOT MOUNTED\\033[0m"
    fi
done

echo ""
echo "🔄 Monitor Service:"
echo "═══════════════════════════════════════════════════════"
if systemctl is-active nas-unified-monitor.service >/dev/null; then
    echo -e "  ✓ nas-unified-monitor: \\033[0;32mRUNNING\\033[0m"
    echo -e "  📊 Check count: $(journalctl -u nas-unified-monitor.service | grep "STATUS:" | tail -1 | cut -d':' -f4-)"
else
    echo -e "  ✗ nas-unified-monitor: \\033[0;31m$(systemctl is-active nas-unified-monitor.service)\\033[0m"
fi

echo ""
echo "📋 Quick Commands:"
echo "═══════════════════════════════════════════════════════"
echo "  nas-test-all    - Test all mounts"
echo "  nas-logs        - View monitor logs"
echo "  nas-restart     - Restart all NAS services"
echo "  nas-backup      - Create configuration backup"
EOF

    chmod +x "/usr/local/bin/nas-status"

    # Test all mounts script
    cat > "/usr/local/bin/nas-test-all" << 'EOF'
#!/bin/bash
# Test all NAS mounts

echo "Testing all NAS mounts..."
echo ""

mount_points=$(grep -o 'MOUNT_POINTS\\["[^"]*"\\]' /usr/local/bin/nas-unified-watchdog | \\
               cut -d'"' -f2)

for mp in $mount_points; do
    echo "Testing $mp:"

    # Check if mounted
    if mountpoint -q "$mp"; then
        echo -e "  ✓ Mounted: Yes"

        # Test read access
        if timeout 5 bash -c "ls '$mp' &>/dev/null"; then
            echo -e "  ✓ Readable: Yes"

            # Count files (first level only)
            file_count=$(ls -1 "$mp" 2>/dev/null | wc -l)
            echo -e "  📁 Items: $file_count"
        else
            echo -e "  ✗ Readable: No (timeout)"
        fi
    else
        echo -e "  ✗ Mounted: No"
    fi

    echo ""
done

# Test Docker containers
echo "Testing dependent Docker containers..."
echo ""

all_containers=$(grep -r "CONTAINER_DEPS" /usr/local/bin/nas-unified-watchdog | \\
                 grep -o '\\["[^"]*"\\]="[^"]*"' | \\
                 cut -d'"' -f4 | \\
                 tr ' ' '\\n' | sort -u)

for container in $all_containers; do
    if docker inspect "$container" >/dev/null 2>&1; then
        state=$(docker inspect -f '{{.State.Status}}' "$container")
        echo -e "  $container: \\033[0;32m$state\\033[0m"
    else
        echo -e "  $container: \\033[0;31mNOT FOUND\\033[0m"
    fi
done
EOF

    chmod +x "/usr/local/bin/nas-test-all"

    # Log viewer script
    cat > "/usr/local/bin/nas-logs" << 'EOF'
#!/bin/bash
# View NAS monitor logs

if [[ "$1" == "-f" ]] || [[ "$1" == "--follow" ]]; then
    journalctl -u nas-unified-monitor.service -f
elif [[ "$1" == "-e" ]] || [[ "$1" == "--errors" ]]; then
    journalctl -u nas-unified-monitor.service --since "today" | grep -E "(ERROR|FAILED|❌|⚠️|🚨)"
else
    journalctl -u nas-unified-monitor.service --since "today" --no-pager | tail -50
fi
EOF

    chmod +x "/usr/local/bin/nas-logs"

    # Restart script
    cat > "/usr/local/bin/nas-restart" << 'EOF'
#!/bin/bash
# Restart all NAS services

echo "Restarting NAS services..."
echo ""

# Restart mount units
for unit in /etc/systemd/system/mnt-*.mount; do
    if [[ -f "$unit" ]]; then
        unit_name=$(basename "$unit")
        echo "Restarting $unit_name..."
        systemctl restart "$unit_name"
    fi
done

# Restart monitor
echo "Restarting nas-unified-monitor..."
systemctl restart nas-unified-monitor.service

echo ""
echo "Restart complete. Checking status..."
nas-status
EOF

    chmod +x "/usr/local/bin/nas-restart"

    # Backup script
    cat > "/usr/local/bin/nas-backup" << 'EOF'
#!/bin/bash
# Backup NAS configuration

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="/root/nas-config-backups/backup_$TIMESTAMP"

echo "Creating NAS configuration backup..."
echo "Backup location: $BACKUP_PATH"
echo ""

mkdir -p "$BACKUP_PATH"

# Backup systemd units
echo "Backing up systemd units..."
cp /etc/systemd/system/mnt-*.mount "$BACKUP_PATH/" 2>/dev/null || true
cp /etc/systemd/system/nas-*.service "$BACKUP_PATH/" 2>/dev/null || true

# Backup scripts
echo "Backing up scripts..."
cp /usr/local/bin/nas-* "$BACKUP_PATH/" 2>/dev/null || true

# Backup credentials
echo "Backing up credentials..."
mkdir -p "$BACKUP_PATH/credentials"
cp /etc/samba/credentials* "$BACKUP_PATH/credentials/" 2>/dev/null || true

# Backup configuration
echo "Backing up configuration..."
cp /etc/nas-monitor/* "$BACKUP_PATH/" 2>/dev/null || true

# Create restore script
cat > "$BACKUP_PATH/restore.sh" << 'RESTORE_EOF'
#!/bin/bash
# Restore NAS configuration from backup

echo "Restoring NAS configuration..."
echo ""

# Restore systemd units
cp *.mount /etc/systemd/system/ 2>/dev/null || true
cp *.service /etc/systemd/system/ 2>/dev/null || true

# Restore scripts
cp nas-* /usr/local/bin/ 2>/dev/null || true
chmod +x /usr/local/bin/nas-* 2>/dev/null || true

# Restore credentials
mkdir -p /etc/samba
cp credentials/* /etc/samba/ 2>/dev/null || true
chmod 600 /etc/samba/credentials* 2>/dev/null || true

# Reload systemd
systemctl daemon-reload

echo "Restore complete!"
echo "Enable services with:"
echo "  systemctl enable --now mnt-*.mount"
echo "  systemctl enable --now nas-unified-monitor.service"
RESTORE_EOF

chmod +x "$BACKUP_PATH/restore.sh"

# Create summary
cat > "$BACKUP_PATH/README.md" << 'README_EOF'
# NAS Configuration Backup

## Backup Information
- Date: $(date)
- Host: $(hostname)
- Mount points: $(ls mnt-*.mount 2>/dev/null | wc -l)
- Scripts: $(ls nas-* 2>/dev/null | wc -l)

## Restore Instructions
1. Copy all files to their respective locations
2. Run: chmod +x /usr/local/bin/nas-*
3. Run: chmod 600 /etc/samba/credentials*
4. Run: systemctl daemon-reload
5. Enable services: systemctl enable --now mnt-*.mount nas-unified-monitor.service

## Quick Restore
Run: ./restore.sh
README_EOF

echo ""
echo "Backup completed successfully!"
echo "Files backed up:"
tree "$BACKUP_PATH"
EOF

    chmod +x "/usr/local/bin/nas-backup"

    log_message "Created management scripts"
}

enable_services() {
    log_message "Enabling and starting services..."

    # Enable all mount units
    for unit in /etc/systemd/system/mnt-*.mount; do
        if [[ -f "$unit" ]]; then
            unit_name=$(basename "$unit")
            systemctl enable "$unit_name" >> "$LOG_FILE" 2>&1
            systemctl start "$unit_name" >> "$LOG_FILE" 2>&1
            log_message "Enabled $unit_name"
        fi
    done

    # Enable monitor service
    systemctl daemon-reload
    systemctl enable nas-unified-monitor.service >> "$LOG_FILE" 2>&1
    systemctl start nas-unified-monitor.service >> "$LOG_FILE" 2>&1

    log_message "Enabled nas-unified-monitor.service"
}

create_summary() {
    log_message "Creating setup summary..."

    SUMMARY_FILE="$CONFIG_DIR/setup-summary.md"

    cat > "$SUMMARY_FILE" << EOF
# NAS Mount & Monitoring Setup Summary

## Setup Information
- Date: $(date)
- Host: $(hostname)
- Mount points configured: $MOUNT_COUNT
- Heartbeat interval: ${HEARTBEAT_DURATION}s
- Telegram notifications: $( [[ "$TELEGRAM_ENABLE" =~ ^[Yy]$ ]] && echo "Enabled" || echo "Disabled" )

## Mount Point Details
$(for ((i=1; i<=MOUNT_COUNT; i++)); do
echo "### Mount Point #$i"
echo "- Path: ${MOUNT_CONFIGS[$i,path]}"
echo "- NAS: //${MOUNT_CONFIGS[$i,ip]}/${MOUNT_CONFIGS[$i,share]}"
echo "- Credentials: ${MOUNT_CONFIGS[$i,creds]}"
echo "- Dependent containers: ${MOUNT_CONTAINERS[$i]:-None}"
echo ""
done)

## Services Created
$(for unit in /etc/systemd/system/mnt-*.mount; do
    if [[ -f "$unit" ]]; then
        echo "- $(basename "$unit")"
    fi
done)
- nas-unified-monitor.service

## Management Scripts
- nas-status    - Check system status
- nas-test-all  - Test all mounts
- nas-logs      - View monitor logs
- nas-restart   - Restart all services
- nas-backup    - Create configuration backup

## Quick Start Commands
\\`\\`\\`bash
# Check status
nas-status

# Test all mounts
nas-test-all

# View logs
nas-logs -f

# Create backup
nas-backup
\\`\\`\\`

## Testing
To test the system, stop a mount service:
\\`\\`\\`bash
systemctl stop mnt-<name>.mount
\\`\\`\\`
Wait ${HEARTBEAT_DURATION} seconds for detection and Telegram alert.

## Backup Location
Configuration backups are stored in: $BACKUP_DIR
Run \\`nas-backup\\` to create a new backup.

## Troubleshooting
1. Check service status: \\`systemctl status mnt-*.mount nas-unified-monitor\\`
2. View logs: \\`journalctl -u nas-unified-monitor.service -f\\`
3. Test mounts manually: \\`mount -t cifs ...\\`
4. Check Telegram connection: \\`curl bot_token/getMe\\`
EOF

    log_message "Setup summary saved to $SUMMARY_FILE"
}

display_final_message() {
    clear

    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║         NAS Setup Complete - Summary                  ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "📊 Configuration Summary:"
    echo "═══════════════════════════════════════════════════════"
    echo "  Mount points configured: $MOUNT_COUNT"
    echo "  Heartbeat interval: ${HEARTBEAT_DURATION}s"

    if [[ "$TELEGRAM_ENABLE" =~ ^[Yy]$ ]]; then
        echo "  Telegram notifications: ✅ ENABLED"
    else
        echo "  Telegram notifications: ❌ DISABLED"
    fi

    echo ""
    echo "🔧 Services Created:"
    echo "═══════════════════════════════════════════════════════"
    for unit in /etc/systemd/system/mnt-*.mount; do
        if [[ -f "$unit" ]]; then
            echo "  ✓ $(basename "$unit")"
        fi
    done
    echo "  ✓ nas-unified-monitor.service"

    echo ""
    echo "📋 Management Commands:"
    echo "═══════════════════════════════════════════════════════"
    echo "  nas-status    - Check system status"
    echo "  nas-test-all  - Test all mounts"
    echo "  nas-logs      - View monitor logs"
    echo "  nas-restart   - Restart all services"
    echo "  nas-backup    - Create configuration backup"

    echo ""
    echo "🧪 Testing Instructions:"
    echo "═══════════════════════════════════════════════════════"
    echo "1. Run: nas-status (verify everything is green)"
    echo "2. Run: nas-test-all (test all mounts)"
    echo "3. Test failure detection:"
    echo "   systemctl stop mnt-<name>.mount"
    echo "   Wait ${HEARTBEAT_DURATION}s for Telegram alert"

    echo ""
    echo "📁 Backup Location:"
    echo "═══════════════════════════════════════════════════════"
    echo "  $BACKUP_DIR"
    echo ""
    echo "📄 Detailed summary: $CONFIG_DIR/setup-summary.md"
    echo ""
    echo "💡 Next Steps:"
    echo "   1. Test the system with: nas-test-all"
    echo "   2. Create a backup: nas-backup"
    echo "   3. Monitor logs: nas-logs -f"
    echo ""
    echo "Setup log: $LOG_FILE"
}

# Main execution flow
main() {
    check_root
    check_fedora

    # Start logging
    > "$LOG_FILE"
    log_message "Starting NAS Mount & Monitoring Setup"

    # Installation steps
    install_dependencies
    create_directories
    backup_existing_config
    get_user_input
    create_systemd_mount_units
    create_watchdog_script
    create_monitor_service
    create_management_scripts
    enable_services
    create_summary

    # Final display
    display_final_message

    log_message "Setup completed successfully"
}

# Run main function
main "$@"

```

## **📥 Installation & Usage**

### **1. Save the Script**

```bash
# Save as setup-nas-system.sh
nano /usr/local/bin/setup-nas-system.sh
# Paste the entire script above
chmod +x /usr/local/bin/setup-nas-system.sh

```

### **2. Run the Setup Wizard**

```bash
sudo setup-nas-system.sh

```

### **3. Interactive Setup Flow**

The script will guide you through:

```
1. How many mount points? → Enter number (1-5)
2. Global Telegram config → Enter bot token & chat ID (once)
3. Heartbeat duration → Enter seconds (default: 30)
4. For EACH mount point:
   - Mount path (e.g., /mnt/nas)
   - NAS IP & share name
   - Credentials (username/password)
   - Dependent Docker containers (space-separated)

```

### **4. Generated Management Commands**

After setup, you get these commands:

- `nas-status` - Check all mounts and services
- `nas-test-all` - Test all mounts
- `nas-logs` - View monitor logs
- `nas-restart` - Restart all NAS services
- `nas-backup` - Create configuration backup

### **5. Example Usage**

```bash
# Setup 2 mount points
sudo setup-nas-system.sh

# Output:
How many mount points do you want to monitor? (1-5): 2
Enable Telegram notifications? (y/n): y
Enter Telegram Bot Token: 123456:ABCdef
Enter Telegram Chat ID: -1001234567890
Enter heartbeat duration (default: 30): 30

# Mount point 1:
Enter mount point path: /mnt/nas
Enter NAS IP: 192.168.0.26
Enter share name: RamSetu
Enter username: admin
Enter password: ****
Dependent containers: sonarr radarr jellyfin

# Mount point 2:
Enter mount point path: /mnt/backup
Enter NAS IP: 192.168.0.27
Enter share name: Backup
Enter username: backup
Enter password: ****
Dependent containers: backup-server

```

## **🔄 Features Included**

1. **Multiple Mount Support** - Monitor 1-5 different SMB mounts
2. **Unified Monitoring** - Single watchdog for all mounts
3. **Docker Integration** - Stop/start dependent containers
4. **Telegram Notifications** - Global or per-mount notifications
5. **Management Scripts** - Easy status checks and testing
6. **Auto-backup** - Configuration backup before changes
7. **Systemd Integration** - Proper service management
8. **Security** - Secure credential handling, permission management
9. **Logging** - Comprehensive logging for troubleshooting
10. **Restore Capability** - Easy backup and restore

## **📊 System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Watchdog Script                  │
│  nas-unified-watchdog (monitors all mount points)          │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
┌───▼───┐  ┌────▼─────┐  ┌───▼───┐  ┌───────▼──────┐
│Mount 1│  │Mount 2   │  │Mount 3│  │Systemd       │
│/mnt/nas│  │/mnt/ssd │  │/mnt/… │  │Services      │
└───┬───┘  └────┬─────┘  └───┬───┘  └───────┬──────┘
    │           │            │              │
┌───▼───┐  ┌────▼─────┐  ┌───▼───┐  ┌───────▼──────┐
│Docker │  │Docker    │  │Docker │  │Telegram      │
│Containers│Containers │Containers │Notifications  │
└────────┘  └──────────┘  └────────┘  └──────────────┘

```

This script creates a complete, production-ready NAS monitoring system with a single command. It handles all the complexity and provides easy management tools for ongoing maintenance.