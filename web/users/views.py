from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm
from django.contrib.auth import authenticate, login

#todo mettere le funzioni hover sui pulsanti della navbar che ora fanno bianco su bianco

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            new_user =  form.save()
            messages.success(request, f'Your account has been created! You are now able to Login')
            new_user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'],)
            login(request, new_user)
            return redirect('videosPage')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form })
