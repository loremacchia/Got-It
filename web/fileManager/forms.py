from django import forms
from .models import Video, GlobalAnnotationVideo

class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ["name", "videoFile1", "isGlobal"]
        labels = {
            "videoFile1": "Videofile",
            "isGlobal": "Do you want the video to be public? (Other users would be able to add and modify the annotations)"
        }

class GlobalAnnotationForm(forms.ModelForm):
    class Meta:
        model= GlobalAnnotationVideo
        fields= ["tag", "firstTime", "secondTime"]

    """def is_valid(self):
        form = self.request.GET['form']
        form.instance.user = self.request.user
        print(self.request.GET['object'])
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!56")
        form.instance.video = self.request.GET['object']
        return super().form_valid(self)"""