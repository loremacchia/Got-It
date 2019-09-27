from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from homePage import views as homePage_views
from users import views as users_views

path('/save_test/',homePage_views.save_test, name='save_test'),