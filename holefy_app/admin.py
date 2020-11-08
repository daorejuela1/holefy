from django.contrib import admin
from mapbox_location_field.admin import MapAdmin
from .models import Place, Profile

admin.site.register(Place, MapAdmin)
admin.site.register(Profile)
# Register your models here.
