
set -euo pipefail


python3 manage.py lms shell --command "
from django.contrib.sites.models import Site
from django_themes.models import Theme, SiteTheme

theme = Theme.objects.get(name='emi')
for domain in (
    'emi.aprende.gob.mx',
    'emi.aprende.gob.mx:8000',
    'studio.emi.aprende.gob.mx',
    'studio.emi.aprende.gob.mx:8001',
    'preview.emi.aprende.gob.mx',
    'preview.emi.aprende.gob.mx:8000',
):
    site, _ = Site.objects.get_or_create(domain=domain)
    SiteTheme.objects.update_or_create(site=site, defaults={'theme': theme})
"