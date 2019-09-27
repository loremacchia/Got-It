from django.db import models
from django.contrib.auth.models import User
import subprocess
import os
from leonardoAnnotator import settings
from django.db.models.signals import post_save


class Video(models.Model):

    userUploader = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=500)
    videoFile = models.FileField(upload_to='uploads/', null=True)
    videoFile1 = models.FileField(upload_to='uploads/', null=True)
    #videoFile2 = models.FileField(upload_to='uploads/', null=True)
    isGlobal = models.BooleanField(default=True)

    def __str__(self):
        return str(self.name) + ": " + str(self.videoFile)

    def setLockUnlock(self):
        if(self.isGlobal):
            self.isGlobal = False
        else:
            if(self.isGlobal==False):
                self.isGlobal = True
        self.save()

def convert_video(sender, **kwargs):
    if kwargs['created']:
        video_object = kwargs['instance']
        print(video_object)
        input_file_path = video_object.videoFile1.path
        print(input_file_path)
        output_file_path = settings.MEDIA_ROOT + "/uploads/" + video_object.name + str(video_object.id) + ".webm"
        print(settings.FFMPEG_PATH)
        subprocess.call([settings.FFMPEG_PATH+'ffmpeg',
                         '-y',
                         '-i',
                         input_file_path,
                         '-c:v',
                         'libvpx',
                         '-crf',
                         '10',
                         '-preset',
                         'veryfast',
                         '-c:a',
                         'libvorbis',
                         '-r',
                         '30',
                         output_file_path,
                         ]
                        )

        video_object.videoFile = output_file_path
        output_file_path1 = settings.MEDIA_ROOT + "/uploads/" + video_object.name + str(video_object.id) + ".mp4"
        subprocess.call([settings.FFMPEG_PATH + 'ffmpeg',
                         '-y',
                         '-i',
                         input_file_path,
                         #'-c:v',
                         #'libvpx',
                         '-crf',
                         '10',
                         '-preset',
                         'veryfast',
                         '-c:a',
                         'libvorbis',
                         '-r',
                         '30',
                         output_file_path1,
                         ]
                        )
        video_object.videoFile1 = output_file_path1
        os.remove(input_file_path)


        #video_object.videoFile2 = output_file_path
        """output_file_path2 = settings.MEDIA_ROOT + "/uploads/" + video_object.name + str(video_object.id) + ".ogg"
        subprocess.call([settings.FFMPEG_PATH + 'ffmpeg',
                         '-y',
                         '-i',
                         input_file_path,
                         '-c:v',
                         'libvpx',
                         '-crf',
                         '10',
                         '-preset',
                         'veryfast',
                         '-c:a',
                         'libvorbis',
                         '-r',
                         '30',
                         output_file_path2,
                         ]
                        )
        video_object.videoFile2 = output_file_path2"""
        super(Video, video_object).save()

post_save.connect(convert_video, sender=Video)


class AnnotationVideo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, default='DEFAULT NAME')
    tag = models.CharField(max_length=50, default='DEFAULT STRING')
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, default='rectangle')
    color = models.CharField(max_length=50, default='white')
    date = models.DateTimeField(auto_now=True)
    firstTime = models.CharField(max_length=8, default="0:00")
    secondTime = models.CharField(max_length=8, default="0:00")

    def __str__(self):
        return str(self.user) + " " + str(self.tag)

class FrameLevelAnnotation(models.Model):
    firstPointX = models.FloatField(default=0)
    firstPointY = models.FloatField(default=0)
    deltaX = models.FloatField(default=0)
    deltaY = models.FloatField(default=0)
    reminderX = models.FloatField(default=0)
    reminderY = models.FloatField(default=0)
    frame = models.IntegerField(default=0)
    annotationVideo = models.ForeignKey(AnnotationVideo, on_delete=models.CASCADE)

class GlobalAnnotationVideo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tag = models.CharField(max_length=50, default='DEFAULT STRING')
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    firstTime = models.CharField(max_length=8,default="0:00")
    secondTime = models.CharField(max_length=8,default="0:00")

class Taxonomy(models.Model):
    parent = models.CharField(max_length=50, default='#')
    text = models.CharField(max_length=50, default='NEW_ITEM')
    video = models.ForeignKey(Video, on_delete=models.CASCADE)


