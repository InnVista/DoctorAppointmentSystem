from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve
from django.conf import settings
import os

FRONTEND_DIR = os.path.join(settings.BASE_DIR, '..', 'frontend')

def custom_serve(request, path):
    ext = os.path.splitext(path)[1].lower()

    if ext == '.html' and not path.startswith('pages/'):
        path = os.path.join('pages', path)
    elif ext == '.css' and not path.startswith('css/'):
        path = os.path.join('css', path)
    elif ext == '.js' and not path.startswith('js/'):
        path = os.path.join('js', path)
    elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'] and not path.startswith('images/'):
        path = os.path.join('images', path)

    return serve(request, path, document_root=FRONTEND_DIR)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/appointments/', include('appointments.urls')),

    # Serve root as index.html using custom_serve
    re_path(r'^$', lambda req: custom_serve(req, 'index.html')),

    # Catch-all route
    re_path(r'^(?P<path>.*)$', custom_serve),
]
