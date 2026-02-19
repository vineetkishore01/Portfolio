# Installing Graphics Card Driver on Fedora Server

Here is a complete, step-by-step guide for setting up your NVIDIA GTX 1050 Ti on a Fedora server to enable hardware transcoding in Jellyfin.

### 📘 Summary of the Process

This guide resolves the common issues of conflicting drivers, missing runtimes, and misconfigured containers that you encountered. It ensures that:

1. Your Fedora server can use the NVIDIA GPU.
2. Docker containers (like Jellyfin) have secure GPU access.
3. Jellyfin is configured to use the GPU for video transcoding, including HDR content.
4. Need to turn off secure boot else the driver won’t work. 

---

### 🛠️ **Step 1: Install the NVIDIA Graphics Driver**

First, install the proprietary driver and ensure it replaces the default `nouveau` driver.

1. **Enable the RPM Fusion repository (non-free):**
    
    ```bash
    sudo dnf install <https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$>(rpm -E %fedora).noarch.rpm
    
    ```
    
2. **Install the NVIDIA driver and build tools:**
    
    ```bash
    sudo dnf install akmod-nvidia kernel-devel
    sudo dnf install xorg-x11-drv-nvidia-cuda # For CUDA and nvidia-smi
    
    ```
    
3. **Verify the driver loads after a reboot:**
You should see a table showing your **GTX 1050 Ti**.
    
    ```bash
    sudo reboot
    nvidia-smi
    
    ```
    

---

### 🔗 **Step 2: Install the NVIDIA Container Toolkit (Correct Version)**

This toolkit allows Docker to pass the GPU to containers. The version in Fedora's default repository (`golang-github-nvidia-container-toolkit`) is incomplete and **must be replaced**.

1. **Remove any conflicting Fedora package:**
    
    ```bash
    sudo dnf remove golang-github-nvidia-container-toolkit
    
    ```
    
2. **Add NVIDIA's official repository:**
    
    ```bash
    curl -s -L <https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo> | sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
    
    ```
    
3. **Install the official toolkit packages:**
    
    ```bash
    sudo dnf install nvidia-container-toolkit nvidia-container-toolkit-base
    
    ```
    
4. **Verify the critical runtime binary exists:**
    
    ```bash
    which nvidia-container-runtime
    # Should output: /usr/sbin/nvidia-container-runtime
    
    ```
    

---

### 🐳 **Step 3: Configure Docker to Use the NVIDIA Runtime**

Tell Docker how to find and use the NVIDIA runtime you just installed.

1. **Create the Docker daemon configuration:**
This creates/modifies `/etc/docker/daemon.json`.
    
    ```bash
    sudo nvidia-ctk runtime configure --runtime=docker
    
    ```
    
2. **Restart Docker to apply the changes:**
    
    ```bash
    sudo systemctl restart docker
    
    ```
    
3. **Test GPU access from a container:**
You should see the same **GTX 1050 Ti** output from inside the container.
    
    ```bash
    docker run --rm --runtime=nvidia --gpus all ubuntu:22.04 nvidia-smi
    
    ```
    

---

### 📦 **Step 4: Configure Your Jellyfin Container**

Your container needs the right permissions and device access.

1. **Add your user to the `video` group** (for GPU hardware access):
    
    ```bash
    sudo usermod -aG video $USER
    # Log out and back in for this to take effect.
    
    ```
    
2. **Update your `docker-compose.yml`** for the Jellyfin service. Ensure it includes:
    
    ```yaml
    services:
      jellyfin:
        image: lscr.io/linuxserver/jellyfin:latest
        runtime: nvidia
        deploy:
          resources:
            reservations:
              devices:
                - driver: nvidia
                  count: all
                  capabilities: [gpu]
        volumes:
          # ... your config, media volumes ...
          # Add these device volumes if GPU access inside the container fails:
          - /dev/nvidia-caps:/dev/nvidia-caps
          - /dev/nvidia0:/dev/nvidia0
          - /dev/nvidiactl:/dev/nvidiactl
          - /dev/nvidia-modeset:/dev/nvidia-modeset
          - /dev/nvidia-uvm:/dev/nvidia-uvm
          - /dev/nvidia-uvm-tools:/dev/nvidia-uvm-tools
        environment:
          - NVIDIA_VISIBLE_DEVICES=all
          - NVIDIA_DRIVER_CAPABILITIES=all,compute,utility,video
    
    ```
    
3. **Restart your Jellyfin stack:**
    
    ```bash
    docker-compose down && docker-compose up -d
    
    ```
    
4. **Verify GPU access inside the Jellyfin container:**
You should see NVIDIA libraries listed.
    
    ```bash
    docker exec -it jellyfin ldconfig -p | grep -i nvidia
    
    ```
    

---

### ⚙️ **Step 5: Configure Jellyfin Playback Settings**

Final step: enable hardware acceleration in the Jellyfin web interface.

1. Log in to your Jellyfin dashboard (**Dashboard → Playback**).
2. Set **Hardware acceleration** to **`NVIDIA NVENC`**.
3. Check **Enable hardware encoding**.
4. **Important for GTX 1050 Ti:** In the **Encoding** section, **uncheck "HEVC"** (your card does *not* support HEVC 10-bit encoding, only decoding).
5. For HDR content, you can test with **Enable tone mapping** on. If colors look washed out, try different tone mapping methods (`OpenCL` vs `CUDA`) or disable it.

---

### 🧪 **Verification and Troubleshooting**

- **Test Transcoding:** Play a video and run `nvidia-smi` on the host. An `ffmpeg` process should appear under "Processes."
- **If colors are washed out (HDR content):** This is often a tone mapping issue. Try disabling "Enable HDR tone mapping" in Jellyfin's Playback settings or adjusting the tone mapping algorithm.
- **No GPU processes:** Ensure the Jellyfin container can see the devices (`docker exec -it jellyfin ls -la /dev/ | grep nvidia`).

This consolidated guide captures the complete process we worked through. Save these notes, and you'll be able to set up GPU transcoding on this or another Fedora server in the future.

---

Second Installation (This worked perfectly…paste it into AI and ask the commands to run)

# Complete NVIDIA Driver & Container Toolkit Setup Manual for Fedora/Docker

## 📋 **Prerequisites**

- **Operating System**: Fedora (Tested on Fedora 42/43)
- **Root Access**: All commands require `sudo`
- **Internet Connection**: Required for downloading packages
- **Backup**: Backup your `docker-compose.yml` before making changes

---

## 🔧 **PART 1: NVIDIA DRIVER INSTALLATION**

### **Step 1.1: Clean System (If Reinstalling)**

```bash
# Stop Docker
sudo systemctl stop docker

# Remove all NVIDIA packages
sudo dnf remove -y "*nvidia*" "*cuda*" nvidia-container-toolkit golang-github-nvidia-container-toolkit

# Clean repository files
sudo rm -f /etc/yum.repos.d/*nvidia*.repo

# Remove orphaned packages
sudo dnf autoremove -y

```

### **Step 1.2: Enable RPM Fusion Repositories**

```bash
# Enable free and non-free RPM Fusion repositories
sudo dnf install <https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$>(rpm -E %fedora).noarch.rpm <https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$>(rpm -E %fedora).noarch.rpm

# Verify repositories
sudo dnf repolist | grep -i fusion

```

### **Step 1.3: Install NVIDIA Driver & CUDA Tools**

```bash
# Install NVIDIA driver with kernel module support
sudo dnf install akmod-nvidia xorg-x11-drv-nvidia-cuda

# Rebuild kernel modules
sudo akmods --force

# Update initramfs
sudo dracut --force

```

### **Step 1.4: Reboot (MANDATORY)**

```bash
sudo reboot

```

### **Step 1.5: Verify Driver Installation**

```bash
# Check driver version and GPU status
nvidia-smi

# Verify kernel module is loaded
lsmod | grep nvidia

# Check driver details
cat /proc/driver/nvidia/version

```

**Expected Output**: `nvidia-smi` should display a table with GPU information, driver version, and CUDA version.

---

## 📦 **PART 2: NVIDIA CONTAINER TOOLKIT INSTALLATION**

### **Step 2.1: Install Prerequisites**

```bash
sudo dnf install -y curl

```

### **Step 2.2: Add NVIDIA Container Toolkit Repository**

```bash
# Download and add the official repository
curl -s -L <https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo> | \\
  sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo

```

### **Step 2.3: Install Container Toolkit**

```bash
# Install all required packages (version 1.18.1 as of writing)
export NVIDIA_CONTAINER_TOOLKIT_VERSION=1.18.1-1
sudo dnf install -y \\
    nvidia-container-toolkit-${NVIDIA_CONTAINER_TOOLKIT_VERSION} \\
    nvidia-container-toolkit-base-${NVIDIA_CONTAINER_TOOLKIT_VERSION} \\
    libnvidia-container-tools-${NVIDIA_CONTAINER_TOOLKIT_VERSION} \\
    libnvidia-container1-${NVIDIA_CONTAINER_TOOLKIT_VERSION}

```

---

## 🐳 **PART 3: DOCKER CONFIGURATION**

### **Step 3.1: Configure Docker Runtime**

```bash
# Configure Docker to use NVIDIA runtime
sudo nvidia-ctk runtime configure --runtime=docker

# Verify the configuration
sudo cat /etc/docker/daemon.json

```

**Expected Content in `/etc/docker/daemon.json`:**

```json
{
  "runtimes": {
    "nvidia": {
      "path": "/usr/bin/nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}

```

### **Step 3.2: Restart Docker**

```bash
sudo systemctl restart docker

```

### **Step 3.3: Verify Docker Configuration**

```bash
# Check available runtimes
docker info | grep -i runtime

# Expected output should include 'nvidia'

```

---

## 🧪 **PART 4: VERIFICATION TESTS**

### **Test 4.1: Basic GPU Access Test**

```bash
# Test with explicit runtime flag
docker run --rm --runtime=nvidia nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi

```

### **Test 4.2: Alternative Test Method**

```bash
# Test with --gpus flag
docker run --rm --gpus all nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi

```

### **Test 4.3: Extended Test (Optional)**

```bash
# Run a more comprehensive test
docker run --rm --runtime=nvidia --gpus all nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv

```

**All tests should display your GPU information without errors.**

---

## 🎬 **PART 5: DOCKER-COMPOSE CONFIGURATION**

### **Option A: Using `runtime` directive (Recommended for simplicity)**

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=all
    # ... rest of your configuration
    volumes:
      - /path/to/config:/config
      - /path/to/media:/media
    ports:
      - "8096:8096"
    restart: unless-stopped

```

### **Option B: Using `deploy.resources` (More formal)**

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    # ... rest of your configuration

```

### **Option C: Legacy devices mapping (If others fail)**

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    devices:
      - /dev/dri:/dev/dri
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    # ... rest of your configuration

```

---

## 🚨 **TROUBLESHOOTING COMMANDS**

### **Check Current State**

```bash
# 1. Driver status
nvidia-smi

# 2. Kernel modules
lsmod | grep nvidia

# 3. Toolkit installation
rpm -qa | grep nvidia-container

# 4. Docker runtimes
docker info | grep -A5 -i runtime

# 5. Container runtime binary
which nvidia-container-runtime

```

### **Common Issues & Fixes**

### **Issue 1: "nvidia-container-runtime: executable file not found"**

```bash
# Reinstall toolkit
sudo dnf reinstall nvidia-container-toolkit nvidia-container-toolkit-base

# Verify binary exists
ls -la /usr/bin/nvidia-container-runtime*

```

### **Issue 2: "Driver/library version mismatch"**

```bash
# Check versions
cat /proc/driver/nvidia/version
nvidia-smi --query-gpu=driver_version --format=csv,noheader

# Fix: Reboot or reload modules
sudo rmmod nvidia_drm nvidia_modeset nvidia_uvm nvidia
sudo modprobe nvidia

```

### **Issue 3: Docker Compose GPU errors**

```bash
# Test with simple container first
docker run --rm --runtime=nvidia nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi

# If this works, your compose syntax is wrong
# Use the exact syntax from PART 5

```

---

## 🔄 **QUICK RECOVERY SCRIPT**

Save this as `fix-nvidia-docker.sh`:

```bash
#!/bin/bash
# NVIDIA Docker Recovery Script for Fedora

echo "=== NVIDIA Docker Recovery ==="

# 1. Check NVIDIA Driver
echo "1. Checking NVIDIA driver..."
if ! command -v nvidia-smi &> /dev/null; then
    echo "ERROR: nvidia-smi not found. Install driver first."
    exit 1
fi
nvidia-smi

# 2. Reinstall Container Toolkit
echo "2. Reinstalling NVIDIA Container Toolkit..."
sudo dnf remove -y nvidia-container-toolkit golang-github-nvidia-container-toolkit
sudo rm -f /etc/yum.repos.d/nvidia-container-toolkit.repo

curl -s -L <https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo> | \\
  sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo

export NVIDIA_CONTAINER_TOOLKIT_VERSION=1.18.1-1
sudo dnf install -y \\
    nvidia-container-toolkit-${NVIDIA_CONTAINER_TOOLKIT_VERSION} \\
    nvidia-container-toolkit-base-${NVIDIA_CONTAINER_TOOLKIT_VERSION}

# 3. Reconfigure Docker
echo "3. Reconfiguring Docker..."
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 4. Test
echo "4. Testing..."
docker run --rm --runtime=nvidia nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi

echo "=== Recovery Complete ==="

```

Make it executable:

```bash
chmod +x fix-nvidia-docker.sh
sudo ./fix-nvidia-docker.sh

```

---

## 📝 **POST-INSTALLATION CHECKLIST**

✅ **Driver Works**: `nvidia-smi` shows GPU info

✅ **Toolkit Installed**: `rpm -qa | grep nvidia-container` shows packages

✅ **Docker Runtime**: `docker info | grep nvidia` shows runtime

✅ **Test Container**: `docker run --rm --runtime=nvidia nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi` works

✅ **Compose Syntax**: Using correct syntax from PART 5

---

## 💾 **BACKUP YOUR CONFIGURATION**

```bash
# Backup critical files
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
sudo cp /etc/yum.repos.d/nvidia-container-toolkit.repo /etc/yum.repos.d/nvidia-container-toolkit.repo.backup

# Export package list
rpm -qa | grep nvidia > ~/nvidia-packages-list.txt

```

---

## 🎯 **PRO TIPS**

1. **Always reboot** after driver installation
2. **Test with simple container** before fixing compose files
3. **Use `runtime: nvidia`** in compose for simplicity
4. **Keep this manual** in `/root/nvidia-docker-setup.md`
5. **Before system updates**, test GPU access with `nvidia-smi` and a Docker container

---

This manual contains everything that ultimately worked for your setup. Save it as a reference for future reinstalls. The key was using **RPM Fusion for drivers** and the **official NVIDIA repository** for the container toolkit, with the correct Docker Compose syntax.