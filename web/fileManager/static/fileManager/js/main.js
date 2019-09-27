//lock_Unlock function
$(document).ready(function(){

    //Al caricamento della pagina se il video è bloccato rende il bottone del lockUnlock scuro
    var buttonLockUnlock = $(".lockUnlock")
    console.log(buttonLockUnlock[0])
    if(buttonLockUnlock[0]== null){
        buttonLockUnlock=$('#lockunlock-video-detail')
    }
    if(buttonLockUnlock[0] != null){
        console.log(buttonLockUnlock)
        for (var i=0, max=buttonLockUnlock.length; i<max; i++){
            console.log(buttonLockUnlock[i])
            if(buttonLockUnlock[i].getAttribute("data-is-global") != "True"){
                buttonLockUnlock[i].style.color="#fff";
                buttonLockUnlock[i].style.backgroundColor="#343a40";
            }
        }
    }


    $('.lockUnlock').click(function(){
        console.log("Entrato, funzione lockUnlock");

        var videoID;
        videoID=$(this).attr("data-taker");
        var userId;
        userId=$(this).attr("data-user-id");
        var uploaderVideoId;
        uploaderVideoId=$(this).attr("data-uploader-video-id");

        if(userId==uploaderVideoId){
            //sistemando i colori del bottone lock/unlock
            //$("[data-is-global="++"]")

            if(this.getAttribute("data-is-global") == "True"){
                this.style.color="#fff";
                this.style.backgroundColor="black";
                this.setAttribute("data-is-global", "False")
            }else{
                if(this.getAttribute("data-is-global") == "False"){
                    this.style.color="black";
                    this.style.backgroundColor="#fff";
                    this.setAttribute("data-is-global", "True")
                }
            }

            $.ajax(
            {
                data:{
                    video_id: videoID
                },
                type:"POST",
                url: "lockUnlockView/",
                "X-CSRFToken": getCookie("csrftoken"),
                success: function(data){console.log(data);},
                dataType: "json",
            })
        }else{
            Swal.fire({
                type: 'error',
                title: 'Forbitten',
                text: "Only the uploader user can modify the video's properties",
                //footer: '<a href>Why do I have this issue?</a>'
            })
        }
    });
    //Add Video Button
    $('.videoAddButton').click(function(){
        console.log("Entrato, funzione videoAddButton");
        $("#hidden-add-video-id")[0].style.display = "block";
    });
    $(window).click(function(event){
        modal =$("#hidden-add-video-id")[0]
        if (event.target == modal) {
            modal.style.display = "none";
            if ($(".hidden-upload-loader")[0].style.display=="flex") {
                $(".hidden-upload-video-spinner")[0].style.display="flex"
            }
        }
    });
    $('.options-cancel-add-video-button').click(function(){
        console.log("Entrato, funzione annulla aggiungi Video");
        $("#hidden-add-video-id")[0].style.display = "none";
        if ($(".hidden-upload-loader")[0].style.display=="flex") {
                $(".hidden-upload-video-spinner")[0].style.display="flex"
        }
    });
    $('.save-upload-button').click(function(){
        console.log("funzione Upload and Convert video");
        var form= $("#my-upload-form-id")[0]
        if( form.checkValidity()){
            $(".hidden-upload-loader")[0].style.display = "flex";
        }
    });
    //Delete Video Button
    $('.deleteVideo').click(function(){
        console.log("Entrato, funzione deleteVideo");
        var loggedUserId=$('#logged-user-id').attr("data-logged-user");
        var uploaderUserId=$(this).attr("data-uploader-user-id");

        if(loggedUserId==uploaderUserId){
            Swal.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    var taker=$(this).attr("data-taker")
                    console.log(taker)
                    console.log(this)
                    $("#" + taker).hide();
                    $.ajax(
                    {
                        data:{
                            video_id: taker
                        },
                        type:"POST",
                        url: "confirmDeleteVideo/",
                        "X-CSRFToken": getCookie("csrftoken"),
                        success: function(data){console.log(data);},
                        dataType: "json",
                    })
                    Swal.fire(
                       'Deleted!',
                       'Your video has been deleted.',
                       'success'
                    )
                }
            })
        }else{
            Swal.fire({
                type: 'error',
                title: 'Forbitten',
                text: "Only the uploader user can delete the video",
            })
        }
    });

    //Download JSON file
    $('.downloadJson').click(function(e){
        e.preventDefault();
        console.log("entered in download JSON function")

        var videoId;
        videoId=$(this).attr("data-taker");
        console.log(videoId)

        $.get("downloadJsonVideoAnnotations/",
            {video_id: videoId},
            function(data){
                console.log("Returned function of download json annotations")
                console.log(data)
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "annotations.json");
                dlAnchorElem.click();
            }
        );
    });
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});