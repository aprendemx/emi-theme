from __future__ import annotations

import os
from glob import glob
import typing as t

import importlib_resources
from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS
from tutor.__about__ import __version_suffix__

from .__about__ import __version__

# ------------------------------------------------------------------------------
# Handle version suffix in nightly mode
# ------------------------------------------------------------------------------
if __version_suffix__:
    __version__ += "-" + __version_suffix__

# ------------------------------------------------------------------------------
# Theme configuration
# ------------------------------------------------------------------------------
config: t.Dict[str, t.Dict[str, t.Any]] = {
    "defaults": {
        "VERSION": __version__,
        "WELCOME_MESSAGE": "Plataforma de entrenamiento digital para EMI",
        "PRIMARY_COLOR": "#481720",
        "ACCENT_COLOR": "#A67F00",
        "HIGHLIGHT_COLOR": "#FFE19F",
        "ENABLE_DARK_TOGGLE": True,
        "FOOTER_NAV_LINKS": [
            {"title": "Sobre el proyecto", "url": "/about"},
            {"title": "Boletín informativo", "url": "https://mail.mexicox.gob.mx/lists/?p=subscribe"},
            {"title": "Código de honor", "url": "/honor"},
            {"title": "Aviso de privacidad", "url": "/tos"},
            {"title": "Preguntas frecuentes", "url": "/help"},
            {"title": "Contacto", "url": "/contact"},
            {"title": "Soporte", "url": "https://soporte.mexicox.gob.mx"},
        ],
    },
    "unique": {},
    "overrides": {},
}

# ------------------------------------------------------------------------------
# Templates and static assets
# ------------------------------------------------------------------------------
hooks.Filters.ENV_TEMPLATE_ROOTS.add_item(
    str(importlib_resources.files("emi") / "templates")
)
hooks.Filters.ENV_TEMPLATE_TARGETS.add_items([
    ("emi", "build/openedx/themes"),
])
hooks.Filters.ENV_PATTERNS_INCLUDE.add_items([
    r"emi/lms/static/sass/partials/lms/theme/",
    r"emi/cms/static/sass/partials/cms/theme/",
])

# La tarea de init del tema se retiro: importaba django_themes.models
# (inexistente) y usaba pipefail con dash. Su funcion la cubre
# `tutor local do settheme emi`.

# ------------------------------------------------------------------------------
# Override Docker image names
# ------------------------------------------------------------------------------
@hooks.Filters.CONFIG_DEFAULTS.add(priority=hooks.priorities.LOW)
def _override_openedx_docker_image(
    items: list[tuple[str, t.Any]]
) -> list[tuple[str, t.Any]]:
    openedx_image = ""
    mfe_image = ""
    for k, v in items:
        if k == "DOCKER_IMAGE_OPENEDX":
            openedx_image = v
        elif k == "MFE_DOCKER_IMAGE":
            mfe_image = v
    if openedx_image:
        items.append(("DOCKER_IMAGE_OPENEDX", f"{openedx_image}-emi"))
    if mfe_image:
        items.append(("MFE_DOCKER_IMAGE", f"{mfe_image}-emi"))
    return items

# ------------------------------------------------------------------------------
# Load all config entries into Tutor
# ------------------------------------------------------------------------------
hooks.Filters.CONFIG_DEFAULTS.add_items(
    [(f"INDIGO_{key}", value) for key, value in config["defaults"].items()]
)
hooks.Filters.CONFIG_UNIQUE.add_items(
    [(f"INDIGO_{key}", value) for key, value in config["unique"].items()]
)
hooks.Filters.CONFIG_OVERRIDES.add_items(
    list(config["overrides"].items())
)

# ------------------------------------------------------------------------------
# NPM patches for Indigo branding
# ------------------------------------------------------------------------------
# ------------------------------------------------------------------------------
# Inyectar colores y componentes en TODOS los MFEs
# ------------------------------------------------------------------------------
hooks.Filters.ENV_PATCHES.add_item(
    (
        "mfe-env-config-runtime-definitions",
        f"""
// --- Colores personalizados EMI (todos los MFEs) ---
MFE_CONFIG['PRIMARY_COLOR']   = '{config['defaults']['PRIMARY_COLOR']}';
MFE_CONFIG['SECONDARY_COLOR'] = '{config['defaults']['ACCENT_COLOR']}';
MFE_CONFIG['HIGHLIGHT_COLOR'] = '{config['defaults']['HIGHLIGHT_COLOR']}';
"""
    )
)

# ------------------------------------------------------------------------------
# Include dark-theme.js in Django PIPELINE and toggle flag
# ------------------------------------------------------------------------------
hooks.Filters.ENV_PATCHES.add_items([
    (
        "openedx-common-assets-settings",
        """
javascript_files = ['base_application', 'application', 'certificates_wv']
dark_theme_filepath = ['emi/js/dark-theme.js']

for filename in javascript_files:
    if filename in PIPELINE['JAVASCRIPT']:
        PIPELINE['JAVASCRIPT'][filename]['source_filenames'] += dark_theme_filepath
"""
    ),
    (
        "openedx-lms-development-settings",
        """
javascript_files = ['base_application', 'application', 'certificates_wv']
dark_theme_filepath = ['emi/js/dark-theme.js']

for filename in javascript_files:
    if filename in PIPELINE['JAVASCRIPT']:
        PIPELINE['JAVASCRIPT'][filename]['source_filenames'] += dark_theme_filepath

MFE_CONFIG['INDIGO_ENABLE_DARK_TOGGLE'] = {{ INDIGO_ENABLE_DARK_TOGGLE }}
"""
    ),
    (
        "openedx-lms-production-settings",
        """
MFE_CONFIG['INDIGO_ENABLE_DARK_TOGGLE'] = {{ INDIGO_ENABLE_DARK_TOGGLE }}
"""
    ),
])

# ------------------------------------------------------------------------------
# Load any additional patches from emi/patches/ (temporalmente comentado)
# ------------------------------------------------------------------------------
# for path in glob(
#     os.path.join(
#         str(importlib_resources.files("emi") / "patches"),
#         "*",
#     )
# ):
#     with open(path, encoding="utf-8") as patch_file:
#         hooks.Filters.ENV_PATCHES.add_item((os.path.basename(path), patch_file.read()))

