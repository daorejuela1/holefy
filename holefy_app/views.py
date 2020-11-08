from django.views.generic import CreateView, UpdateView, ListView
from .serializers import PlaceSerializer
from .models import Place, Profile
from rest_framework import viewsets
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from django.http import HttpResponse
from django.conf import settings


class AddPlaceView(CreateView):
    model = Place
    template_name = "live_demo/place_form.html"
    success_url = "/index/"
    fields = ("location", "address", "level", "name")

    def form_valid(self, form):
        if not self.request.user.is_authenticated:
            redirect('%s?next=%s' % (settings.LOGIN_URL, self.request.path))
        instance = form.save(commit=True)
        user = self.request.user
        instance.users.add(Profile.objects.get(user=user))
        return redirect('/')

def ChangePlaceView(request, pk):
    instance = Place.objects.get(pk=pk)
    user = request.user
    instance.users.add(Profile.objects.get(user=user))
    return redirect('/')



class PlacesView(ListView):
    model = Place
    template_name = "live_demo/index.html"
    ordering = ["-created_at", ]

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})