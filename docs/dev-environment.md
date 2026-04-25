# Dev environment recipes

Host-level setup notes for dependencies that don't live in `package.json`. Update when you hit a host-specific install snag worth saving the next person from.

## Host

- **OS:** Windows 11 (10.0.26200), x64
- **Shell:** Git Bash (`bash` from Git for Windows)
- **Node:** v24.12.0 (system install at `C:\Program Files\nodejs`)
- **npm:** 11.6.2 (bundled with the Node install)
- **npm cache:** `C:\Users\msmoo\AppData\Local\npm-cache` — **not** OneDrive-synced (Local profile is excluded from OneDrive)
- **npm prefix:** `C:\Users\msmoo\AppData\Roaming\npm` — global installs land here
- **Working tree:** `C:\Users\msmoo\OneDrive\Desktop\soap\freighttools.co.uk` — OneDrive-synced

## Spin up self-hosted n8n locally

The official advice is `npx -y n8n start`. **On this host, that fails** with `npm error code ECOMPROMISED, Lock compromised`. Use the global-install path below instead.

### Recipe

```bash
# One-time install (~9 minutes, 2,490 packages, ~1 GB on disk)
npm i -g n8n

# Confirm
n8n --version       # should print 2.17.7 or later

# Boot, isolated env folder (so you can wipe /reset cleanly)
mkdir -p ~/.n8n-dogfood
export N8N_USER_FOLDER=~/.n8n-dogfood
export N8N_DIAGNOSTICS_ENABLED=false
export N8N_VERSION_NOTIFICATIONS_ENABLED=false
export N8N_PERSONALIZATION_ENABLED=false
n8n start

# Wait for "Editor is now accessible via: http://localhost:5678" in the log
# Healthz: curl http://localhost:5678/healthz  →  {"status":"ok"}

# Stop (Ctrl+C in foreground, or kill by port from another shell):
powershell -Command "Get-NetTCPConnection -LocalPort 5678 -State Listen | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }"
```

`n8n` is at `C:\Users\msmoo\AppData\Roaming\npm\n8n` after install — that path is on `$PATH` automatically.

### Optional env vars
- `N8N_RUNNERS_ENABLED=true` — was needed in older n8n; **deprecated as of 2.17.7**, the boot log will warn if you set it. Drop it.
- `N8N_CUSTOM_EXTENSIONS=/abs/path/to/n8n-node-pkg` — comma-separated list of paths to load community/in-development node packages from.

### Why `npx -y n8n start` fails — root cause

The error is **not** package-integrity. Decoding the npm debug log shows:

```
verbose stack at AbortController.abort (node:internal/abort_controller:507:5)
verbose stack at Timeout.touchLock (.../node_modules/npm/node_modules/libnpmexec/lib/with-lock.js:161:18)
error code ECOMPROMISED
error Lock compromised
```

The "Lock compromised" message is from `libnpmexec`'s `with-lock.js` heartbeat — npx's coordination lock for its temp install dir, not the package-lock.json hash check. While npm is downloading and reifying ~2,500 packages, a periodic touch timer keeps the lock file's mtime fresh. If a touch attempt is preempted by an `AbortController` (Defender real-time scan, OneDrive metadata refresh, or just a slow disk during a 9-minute install on this much node_modules churn), npm aborts with ECOMPROMISED on the assumption that another npx invocation may have stolen the lock.

`npm i -g n8n` uses Arborist directly, **not `libnpmexec`**, so it doesn't run the lock heartbeat at all. That's why the global install succeeds where the npx route fails.

### Things that did **not** fix it
- `npm cache clean --force` then retry — still ECOMPROMISED (cache wasn't the cause).
- `npm cache verify` — same (cache integrity was already fine).
- Forcing a fresh cache via `npm_config_cache=/tmp/n8n-fresh-cache npx -y --prefer-online n8n start` — same (the lock heartbeat fires regardless of cache location).
- Moving cache off OneDrive — already off (cache is in `AppData\Local`, which OneDrive doesn't sync).

### When to revisit

- New npm releases sometimes adjust the `libnpmexec` lock-heartbeat timer. If you upgrade npm (`npm i -g npm@latest`) at some point, retry `npx -y n8n start` once — it may work, in which case the global install is no longer required.
- If you switch off OneDrive for the working tree, the issue may resolve since OneDrive's metadata refresh is a plausible AbortController trigger even though the cache lives elsewhere.

## Other tools

(empty — append as host-level snags surface)
