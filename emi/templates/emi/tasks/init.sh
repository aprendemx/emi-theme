
set -euo pipefail


python3 manage.py lms shell --command "
from django.contrib.sites.models import Site
from django_themes.models import Theme, SiteTheme

theme = Theme.objects.get(name='emi')
for domain in (
    '{{ LMS_HOST }}',
    '{{ LMS_HOST }}:8000',
    '{{ CMS_HOST }}',
    '{{ CMS_HOST }}:8001',
    '{{ PREVIEW_LMS_HOST }}',
    '{{ PREVIEW_LMS_HOST }}:8000',
):
    site, _ = Site.objects.get_or_create(domain=domain)
    SiteTheme.objects.update_or_create(site=site, defaults={'theme': theme})
"
