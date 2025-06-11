import os
from curl_project.constants import API_ENVS, ENV_DEV, ENV_PROD

env = os.getenv("API_ENV", ENV_DEV)

if env not in API_ENVS:
    raise ValueError(f"Invalid API_ENV: {env}. Must be one of: {API_ENVS}")

if env == ENV_PROD:
    from .prod import *
else:
    from .dev import *
