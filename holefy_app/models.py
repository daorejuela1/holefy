from django.db import models
from mapbox_location_field.models import LocationField, AddressAutoHiddenField


class Place(models.Model):
    location = LocationField(
        map_attrs={"style": "mapbox://styles/mapbox/streets-v11", "center": (-76.51972, 3.44)})
    created_at = models.DateTimeField(auto_now_add=True)
    address = AddressAutoHiddenField()
