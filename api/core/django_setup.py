import os
import django

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "devtrack.settings"
)

django.setup()