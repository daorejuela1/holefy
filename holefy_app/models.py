from django.db import models
from mapbox_location_field.models import LocationField, AddressAutoHiddenField
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    PhoneNumber = models.CharField(max_length=45, null=True, default='', blank=True)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Every time a new user is created, a new profile
     and curriculum is also created
    Args:
        sender : Model that sends the data
        instance : Instance of the model
        created (boolean): Value to know if the instance is created
    """
    if created:
        Profile.objects.create(user=instance)



@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Every time a new user is created,
    a new profile and curriculum is also created
    Args:
        sender : Model that sends the data
        instance : Instance of the model
        created (boolean): Value to know if the instance is created
    """
    instance.profile.save()

class Place(models.Model):
    GRIETA = 1
    NORMAL = 2
    MORTAL = 3
    Danger = [
        (GRIETA, 'Grieta'),
        (NORMAL, 'Normal'),
        (MORTAL, 'Mortal'),
    ]

    location = LocationField(
        map_attrs={"style": "mapbox://styles/mapbox/streets-v11", "center": (-76.51972, 3.44), "marker_color": "DodgerBlue"})
    created_at = models.DateTimeField(auto_now_add=True)
    address = AddressAutoHiddenField()
    name = models.CharField(max_length=8)
    level = models.IntegerField(choices=Danger)
    users = models.ManyToManyField('Profile', related_name='places', blank=True)