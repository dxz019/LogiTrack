#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[LogiTrack] $*"
}

is_command() {
  command -v "$1" >/dev/null 2>&1
}

start_postgres() {
  if ! pg_isready -q; then
    log "PostgreSQL not running, attempting to start..."
    if is_command brew && [[ "$(uname -s)" == "Darwin" ]]; then
      brew services start postgresql
    elif [[ -d /etc/systemd/system ]]; then
      sudo systemctl start postgresql
    else
      sudo service postgresql start
    fi

    for i in {1..30}; do
      if pg_isready -q; then
        log "PostgreSQL is ready."
        return 0
      fi
      sleep 1
    done

    log "ERROR: PostgreSQL could not be started."
    exit 1
  else
    log "PostgreSQL is already running."
  fi
}

start_redis() {
  if is_command redis-cli; then
    if ! redis-cli ping >/dev/null 2>&1; then
      log "Redis not running, attempting to start..."
      if [[ -f /etc/redis/redis.conf ]] && [[ -d /etc/systemd/system ]]; then
        sudo systemctl start redis
      elif is_command brew && [[ "$(uname -s)" == "Darwin" ]]; then
        brew services start redis
      else
        redis-server --daemonize yes >/dev/null 2>&1 || true
      fi
    fi
  fi

  if is_command redis-cli && redis-cli ping >/dev/null 2>&1; then
    log "Redis is running."
  else
    log "WARNING: Redis is not available. The app supports graceful degradation."
  fi
}

wait_port() {
  local port=$1
  local name=$2
  local timeout=${3:-60}

  for i in $(seq 1 "$timeout"); do
    if bash -c "exec 3<>/dev/tcp/127.0.0.1/$port" >/dev/null 2>&1; then
      log "$name is up on port $port."
      return 0
    fi
    sleep 1
  done

  log "ERROR: $name did not become ready on port $port within ${timeout}s."
  exit 1
}

start_project() {
  log "Starting LogiTrack project..."

  start_postgres
  start_redis

  log "Initializing backend..."
  pushd backend >/dev/null
  npm run db:init || true
  popd >/dev/null

  pushd backend >/dev/null
  npm run dev >/tmp/logitrack_backend.log 2>&1 &
  BACKEND_PID=$!
  popd >/dev/null

  pushd frontend >/dev/null
  npm run dev >/tmp/logitrack_frontend.log 2>&1 &
  FRONTEND_PID=$!
  popd >/dev/null

  trap 'log "Shutting down..."; kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; exit 0' INT TERM EXIT

  wait_port 5000 "Backend" 60
  wait_port 5173 "Frontend" 60

  log "LogiTrack is running:"
  log "  Frontend: http://localhost:5173"
  log "  Backend:  http://localhost:5000"
  log "Press Ctrl+C to stop."

  wait
}

case "${1:-start}" in
  start)
    start_project
    ;;
  stop)
    log "Stopping LogiTrack..."
    pkill -f "node index.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    ;;
  status)
    if pg_isready -q && redis-cli ping >/dev/null 2>&1; then
      log "Database services are healthy."
    else
      log "Some services are down."
      exit 1
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
