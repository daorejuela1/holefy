from django.urls import re_path, path

from .views import AddPlaceView, ChangePlaceView, PlacesView
from .views import PlaceViewSet, signup
from django.contrib.auth.decorators import login_required
from . import views as core_views
urlpatterns = [
    re_path("^$", login_required(AddPlaceView.as_view()), name="add"),
    re_path("^places/(?P<pk>[0-9]+)/$", login_required(ChangePlaceView), name="change"),
    re_path("^index/$", login_required(PlacesView.as_view()), name="index"),
    path('api/v1/holes/', PlaceViewSet.as_view({'get': 'list'}), name='viewset'),
    path('accounts/profile/', PlaceViewSet.as_view({'get': 'list'}), name='viewset'),
    path('signup/', core_views.signup, name='signup'),
]
