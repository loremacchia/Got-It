from django.shortcuts import render, redirect, render_to_response
from .models import Video, AnnotationVideo, User, GlobalAnnotationVideo, Taxonomy,FrameLevelAnnotation
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .forms import VideoForm, GlobalAnnotationForm
from django.views.generic import DetailView, CreateView, ListView
from django.views.generic.edit import BaseCreateView
from django.core import serializers
from django.contrib.auth.decorators import login_required
import json
from itertools import chain
import cv2

class VideoListView(ListView, BaseCreateView):
    model = Video
    success_url = '.'
    template_name = 'fileManager/videoManager.html'
    context_object_name = 'videos'
    form_class = VideoForm

    def form_valid(self, form):
        form.instance.userUploader = self.request.user
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        self.object = None
        self.object_list = self.get_queryset()

        form_class = self.get_form_class()
        form = self.get_form(form_class)

        kwargs.update({'object_list': self.object_list, 'form': form})

        context = super(VideoListView, self).get_context_data(**kwargs)
        return context

'''def videosPage(request):
    print(request)
    if request.method == 'POST':
        form = VideoForm(request.POST, request.FILES)
        print("entered in videosPage for saving, POST request")
        if form.is_valid():
            print("saving")
            form.save()
            return redirect(reverse('videosPage'))
    else:
        print("this method is not a post")
        form = VideoForm()

    videos = Video.objects.all()
    context = {
        'videos': videos,
        'form': form,
    }
    return render(request, 'fileManager/videoManager.html', context)
'''

class VideoDetailView(DetailView):
    model = Video

    def get_context_data(self, **kwargs):
        if(self.request.method == 'GET'):
            print("AJEJEJ BRAZORF")
        context = super(VideoDetailView, self).get_context_data(**kwargs)
        video_id = context['object'].id

        videos = Video.objects.filter(pk=video_id).first()
        globalAnnotationsList= videos.globalannotationvideo_set.all()
        context.update({
            'globalAnnotationsList': globalAnnotationsList,
        })
        return context

    """def post(self, request, *args, **kwargs):
        if request.method == 'POST':
            form=self.form_class(request.POST)
            form.instance.user = request.user
            consideredVideo=Video.objects.filter(pk=kwargs.get('pk', None)).first()
            form.instance.video = consideredVideo

            if form.is_valid():
                globalAnno = GlobalAnnotationVideo(user=self.request.user, tag=request.POST['tag'], video=consideredVideo, firstTime=request.POST['firstTime'], secondTime=request.POST['secondTime'])
                globalAnno.save()
        print(request.path_info)
        self.object = self.get_object()
        return HttpResponseRedirect(".")
        #return render(request, request.path_info, context=self.get_context_data())
    """
def lockUnlockViewDetail(request, pk=None):
    print("entered in lockUnlockViewDetail function")
    return lockUnlockFuncion(request)

def lockUnlockFuncion(request):

    if request.method == 'POST':
        video_id=request.POST['video_id']
        consideredVideo = Video.objects.filter(pk=video_id).first()
        consideredVideo.setLockUnlock()
        return HttpResponse("Success, lock-unlock function")
    else:
        return HttpResponse("Request method is not a GET")

def confirmDeleteVideoDetail(request, pk=None):
    return confirmDeleteVideo(request)

def confirmDeleteVideo(request):

    if request.method == 'POST':
        video_id = request.POST['video_id']
        print(video_id)
        Video.objects.filter(pk=video_id).delete()
        print("Redirecting to the video Page")
        return redirect(reverse('videosPage'))
    else:
        print("confirmDeleteVideo results to be not a Post View")
        return HttpResponse("Request method is not a GET")
'''
class VideoListView(ListView):
    model = Video
    template_name = 'fileManager/videoManager.html'
    context_object_name = 'videos'
    form_class = VideoForm

class VideoCreateView(CreateView):
    model = Video
    form_class = VideoForm
'''
def downloadJsonVideoAnnotationsDetail(request, pk=None):
    return downloadJsonVideoAnnotations(request)

def downloadJsonVideoAnnotations(request):
    video_id = request.GET['video_id']
    print(video_id)

    videos = Video.objects.filter(pk=video_id).first()
    localAnnotations = videos.annotationvideo_set.all()
    print(localAnnotations)
    for localAnno in localAnnotations:
        frameLevelAnnotations = localAnno.framelevelannotation_set.all()
        localAnnotations=list(chain(localAnnotations, frameLevelAnnotations))
    globalAnnotation=videos.globalannotationvideo_set.all()
    print(globalAnnotation)
    annotations = list(chain(localAnnotations, globalAnnotation))

    videoList = []
    videoList.append(videos)
    annotations = list(chain(videoList, annotations))

    cv2video = cv2.VideoCapture(str(videos.videoFile))
    height = cv2video.get(cv2.CAP_PROP_FRAME_HEIGHT)
    width = cv2video.get(cv2.CAP_PROP_FRAME_WIDTH)
    framecount = cv2video.get(cv2.CAP_PROP_FRAME_COUNT)
    frames_per_sec = cv2video.get(cv2.CAP_PROP_FPS)
    print("Video Dimension: height:{} width:{}".format(height, width))
    print("frame per sec:", frames_per_sec)
    print("Video duration (sec):", framecount / frames_per_sec)

    json_str = serializers.serialize('json', annotations)
    print(json_str)
    json_str = json_str[1:]
    print(json_str)
    json_str = str({"fps": frames_per_sec})+","+ json_str
    json_str = str({"height": height})+","+json_str
    json_str = "["+str({"width": width})+","+json_str

    print(json_str)

    return JsonResponse(json_str, safe=False)

def getJsonVideoAnnotations(request, pk=None):
    video_id = request.GET['video_id']
    username = request.GET['username']
    if(username == ""):
        frameAnno = FrameLevelAnnotation.objects.select_related('annotationVideo').filter(annotationVideo__video=video_id).all()
        annotations = AnnotationVideo.objects.filter(video=video_id)
    else:
        user = User.objects.get(username=username)
        frameAnno = FrameLevelAnnotation.objects.select_related('annotationVideo').filter(annotationVideo__video=video_id, annotationVideo__user=user).all()
        annotations = AnnotationVideo.objects.filter(video=video_id, user=user)
    combined = list(chain(annotations,frameAnno))
    json_str = serializers.serialize('json',combined)
    return JsonResponse(json_str, safe=False)


def insertAnnotation(request, pk=None):
    annotation = json.loads(request.GET['annotation'])
    video = Video.objects.filter(pk=request.GET['video_id']).first()
    user = User.objects.get(username=request.GET['username'])

    videoAnno = AnnotationVideo(
        user=user,
        username = user.username,
        video=video,
        tag=annotation['tag'],
        firstTime = annotation['firstTime'],
        secondTime = annotation['secondTime'],
        type = annotation['type'],
        color = annotation['color'],
    )
    videoAnno.save()
    frameAnno = FrameLevelAnnotation(
        firstPointX=annotation['firstX'],
        firstPointY=annotation['firstY'],
        deltaX=annotation['deltaX'],
        deltaY=annotation['deltaY'],
        reminderX = annotation['reminderX'],
        reminderY = annotation['reminderY'],
        frame=annotation['frame'],
        annotationVideo = videoAnno,
    )
    frameAnno.save()
    return getJsonVideoAnnotations(request)


def modifyAnnotation(request, pk=None):
    annotation = json.loads(request.GET['annotation'])
    video = Video.objects.filter(pk=request.GET['video_id']).first()
    user = User.objects.get(username=request.GET['username'])
    id = request.GET['id']
    previousAnno = AnnotationVideo.objects.get(id=id, video=video, user = user)
    previousAnno.username = user.username
    previousAnno.tag = annotation['tag']
    previousAnno.firstTime = annotation['firstTime']
    previousAnno.secondTime = annotation['secondTime']
    previousAnno.type = annotation['type']
    previousAnno.color = annotation['color']

    previousAnno.save()

    (previousFrameAnno,created)= FrameLevelAnnotation.objects.get_or_create(annotationVideo=previousAnno, frame=annotation['frame'])
    previousFrameAnno.firstPointX = annotation['firstX']
    previousFrameAnno.firstPointY = annotation['firstY']
    previousFrameAnno.deltaX = annotation['deltaX']
    previousFrameAnno.deltaY = annotation['deltaY']
    previousFrameAnno.reminderX = annotation['reminderX']
    previousFrameAnno.reminderY = annotation['reminderY']
    previousFrameAnno.save()

    return getJsonVideoAnnotations(request)


def deleteAnnotation(request, pk=None):
    video = Video.objects.filter(pk=request.GET['video_id']).first()
    user = User.objects.get(username=request.GET['username'])
    id = request.GET['id']
    annotation = AnnotationVideo.objects.get(id=id, video=video, user=user)
    annotation.delete()
    return getJsonVideoAnnotations(request)
'''
    response = HttpResponse(json_str, content_type='application/json')
    response['Content-Disposition'] = 'attachment;filename=export.json'

    return response
'''
def makeGlobalAnnotation(request, pk=None):

    print(request.method)
    print(request.POST)
    video_id = request.POST['video_id']
    print(video_id)
    video = Video.objects.filter(pk=video_id).first()
    tag = request.POST['tag']
    firstTime = request.POST['firstTime']
    secondTime = request.POST['secondTime']
    print(tag)
    globalAnno = GlobalAnnotationVideo(user=request.user, tag=tag, video=video, firstTime=firstTime, secondTime=secondTime)

    globalAnno.save()
    return JsonResponse({'tag': tag, 'user_id': request.user.id, 'global_id':globalAnno.id, 'first_time':globalAnno.firstTime, 'second_time':globalAnno.secondTime})

def deleteGlobalAnnotation(request, pk=None):
    print("Functon delete global annotation")
    print(request.POST)
    global_id = request.POST['global_id']
    print(global_id)
    globalAnno = GlobalAnnotationVideo.objects.filter(pk=global_id).first()
    print(globalAnno)
    globalAnno.delete()
    return JsonResponse({'tag': global_id})

def modifyGlobalAnnotation(request, pk=None):
    global_id = request.POST['global_id']
    tag= request.POST['tag']
    firstTime=request.POST['first_time']
    secondTime = request.POST['second_time']
    globalAnno = GlobalAnnotationVideo.objects.filter(pk=global_id).first()
    globalAnno.tag = tag
    globalAnno.firstTime = firstTime
    globalAnno.secondTime = secondTime
    globalAnno.save()

    return JsonResponse({'tag': globalAnno.tag, 'global_id':globalAnno.id,})



def getElementTaxonomy(request, pk=None):
    video = Video.objects.filter(pk=request.GET['video_id']).first()
    taxonomy = Taxonomy.objects.filter(video=video)
    if (taxonomy != None):
        json_str = serializers.serialize('json', taxonomy)
        return JsonResponse(json_str, safe=False)
    return JsonResponse([], safe=False)

def insertElementTaxonomy(request, pk=None):
    video = Video.objects.filter(pk=request.GET['video_id']).first()
    parent = request.GET['parent']
    text = request.GET['text']
    taxElement = Taxonomy(
        parent=parent,
        text=text,
        video=video,
    )
    taxElement.save()
    return getElementTaxonomy(request)

def modifyElementTaxonomy(request, pk=None):
    id = request.GET['id']

    taxElement= Taxonomy.objects.get(id=id)
    try:
        text = request.GET['text']
        taxElement.text = text
    except:
        parent = request.GET['parent']
        if(parent != ""):
            taxElement.parent = parent
    taxElement.save()
    return getElementTaxonomy(request)

def deleteElementTaxonomy(request, pk=None):
    id = request.GET['id']
    taxElement = Taxonomy.objects.get(id=id)
    taxElement.delete()
    return getElementTaxonomy(request)
