"""Environment settings, read once from environment variables."""
import os
from dataclasses import dataclass

# Base URL per environment. Add staging/qa entries here when they exist.
ENVIRONMENTS = {
    "prod": "https://automationexercise.com",
}


def _flag(name, default):
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    env: str
    base_url: str
    timeout: float
    retries: int
    max_ms: int
    allow_writes: bool
    ui_headed: bool

    @property
    def api_url(self):
        return f"{self.base_url}/api"


def load_settings():
    env = os.getenv("API_ENV", "prod").strip().lower()
    if env not in ENVIRONMENTS and not os.getenv("API_BASE_URL"):
        raise ValueError(f"Unknown API_ENV '{env}'. Known: {', '.join(ENVIRONMENTS)} (or set API_BASE_URL)")
    return Settings(
        env=env,
        base_url=os.getenv("API_BASE_URL", ENVIRONMENTS.get(env, "")).rstrip("/"),
        timeout=float(os.getenv("API_TIMEOUT", "30")),
        retries=int(os.getenv("API_RETRIES", "2")),
        max_ms=int(os.getenv("API_MAX_MS", "5000")),
        allow_writes=_flag("API_ALLOW_WRITES", True),
        ui_headed=_flag("UI_HEADED", False),
    )


settings = load_settings()
