from django.urls import path
from fileManager import views as fileManager_views
from .views import VideoDetailView, VideoListView
from django.contrib.auth.decorators import login_required

urlpatterns = [
    path('videosPage/', login_required(VideoListView.as_view()), name='videosPage'),
    path('videosPage/lockUnlockView/', fileManager_views.lockUnlockFuncion, name='lockUnlockView'),
    path('videosPage/confirmDeleteVideo/', fileManager_views.confirmDeleteVideo, name='confirmDeleteVideo'),
    path('videosPage/downloadJsonVideoAnnotations/', fileManager_views.downloadJsonVideoAnnotations, name='downloadJsonVideoAnnotations'),
    path('video/<int:pk>/', VideoDetailView.as_view(), name='VideoDetailView'),
    path('video/<int:pk>/getJsonVideoAnnotations/', fileManager_views.getJsonVideoAnnotations,name='getJsonVideoAnnotations'),
    path('video/<int:pk>/insertAnnotation/', fileManager_views.insertAnnotation,name='insertAnnotation'),
    path('video/<int:pk>/modifyAnnotation/', fileManager_views.modifyAnnotation,name='modifyAnnotation'),
    path('video/<int:pk>/deleteAnnotation/', fileManager_views.deleteAnnotation,name='deleteAnnotation'),
    path('video/<int:pk>/makeGlobalAnnotation/', fileManager_views.makeGlobalAnnotation,name='makeGlobalAnnotation'),
    path('video/<int:pk>/lockUnlockViewDetail/', fileManager_views.lockUnlockViewDetail,name='lockUnlockViewDetail'),
    path('video/<int:pk>/downloadJsonVideoAnnotationsDetail/', fileManager_views.downloadJsonVideoAnnotationsDetail,name='downloadJsonVideoAnnotationsDetail'),
    path('video/<int:pk>/confirmDeleteVideoDetail/', fileManager_views.confirmDeleteVideoDetail,name='confirmDeleteVideoDetail'),
    path('video/<int:pk>/deleteGlobalAnnotation/', fileManager_views.deleteGlobalAnnotation,name='deleteGlobalAnnotation'),
    path('video/<int:pk>/modifyGlobalAnnotation/', fileManager_views.modifyGlobalAnnotation,name='modifyGlobalAnnotation'),
    path('video/<int:pk>/getElementTaxonomy/', fileManager_views.getElementTaxonomy,name='getElementTaxonomy'),
    path('video/<int:pk>/insertElementTaxonomy/', fileManager_views.insertElementTaxonomy,name='insertElementTaxonomy'),
    path('video/<int:pk>/modifyElementTaxonomy/', fileManager_views.modifyElementTaxonomy,name='modifyElementTaxonomy'),
    path('video/<int:pk>/deleteElementTaxonomy/', fileManager_views.deleteElementTaxonomy,name='deleteElementTaxonomy'),
]