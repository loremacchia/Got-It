$(document).ready(function(){
    //back-button
    $('#my-back-button-id').click(function(){
        location.href = "/fileManager/videosPage/";
    });
    //Dropdown buttons
    $('.dropdown-botton-manage-video').click(function(){
        manage=$("#hidden-manage-video-id")[0]
        manageDisplay(manage);
    });
    $('.dropdown-botton-local-annotations').click(function(){
        manage=$("#hidden-local-annotation-id")[0]
        manageDisplay(manage);
    });
    $('.dropdown-botton-global-annotations').click(function(){
        manage=$("#hidden-global-annotation-id")[0]
        manageDisplay(manage);
    });
    $('.dropdown-botton-taxonomy').click(function(){
        manage=$("#hidden-taxonomy-id")[0]
        manageDisplay(manage);
    });
    $('.dropdown-botton-punctual-annotations').click(function(){
        manage=$("#hidden-punctual-annotations-id")[0]
        if(manage.style.display == "flex"){
            manage.style.display = "none";
        }
        else{
            manage.style.display = "flex";
        }
    });

    function manageDisplay(manage){
        if(manage.style.display == "block"){
            manage.style.display = "none";
        }
        else{
            manage.style.display = "block";
        }
    }
    //lockUnlock video annotation
     $('#lockunlock-video-detail').click(function(){

        var taker;
        taker=$('#video-id')[0].getAttribute("data-videoid");
        var videoID = taker;
        var userId=$('#logged-user-id')[0].getAttribute("data-user");
        var uploaderVideoId=$('#video-user-id')[0].getAttribute("data-user");

        if(userId==uploaderVideoId){

            var buttonLockUnlock= $('#lockunlock-video-detail')
            //sistemando i colori del bottone lock/unlock
            if(buttonLockUnlock[0].getAttribute("data-is-global") == "True"){
                buttonLockUnlock[0].style.color="#f8f9fa";//white
                buttonLockUnlock[0].style.backgroundColor="#343a40";//black
                buttonLockUnlock[0].setAttribute("data-is-global", "False")
            }else{
                if(buttonLockUnlock[0].getAttribute("data-is-global") == "False"){
                    buttonLockUnlock[0].style.color="#343a40";//black
                    buttonLockUnlock[0].style.backgroundColor="#f8f9fa";//white
                    buttonLockUnlock[0].setAttribute("data-is-global", "True")
                }
            }

            $.ajax(
            {
                data:{
                    video_id: taker
                },
                type:"POST",
                url: "lockUnlockViewDetail/",
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
     //download annotations
     $('#download-annotation-video-detail').click(function(e){
        e.preventDefault();
        console.log("entered in download JSON function datailView")
        var taker;
        taker=$('#video-id')[0].getAttribute("data-videoid");
        console.log(taker)
        $.get("downloadJsonVideoAnnotationsDetail/",
            {video_id: taker},
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
    //delete video
    $('#delete-video-detail').click(function(){
        console.log("Entrato, funzione deleteVideoDetail");
        var loggedUserId=$('#logged-user-id').attr("data-user");
        var uploaderUserId=$('#video-user-id').attr("data-user");

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
                    var taker=$('#video-id')[0].getAttribute("data-videoid");
                    console.log(taker)
                    $('#my-back-button-id').click();
                    $.ajax(
                    {
                        data:{
                            video_id: taker
                        },
                        type:"POST",
                        url: "confirmDeleteVideoDetail/",
                        "X-CSRFToken": getCookie("csrftoken"),
                        success: function(data){
                            console.log(data);
                            $('#my-back-button-id').click();
                         },
                        dataType: "json",
                    })
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

    //Global Annotation option
    $('#submit_global_annotation').click(function(){
        var tag=document.getElementById("globa_anno_tag_id").value;
        var firstTime=document.getElementById("globa_anno_first_time_id").value;
        var secondTime=document.getElementById("globa_anno_second_time_id").value;
        var video_id=document.getElementById("submit_global_annotation").value;
        $.ajax(
        {
            data:{
                video_id: video_id,
                tag: tag,
                firstTime: firstTime,
                secondTime: secondTime,
            },
            type:"POST",
            url: "makeGlobalAnnotation/",
            dataType: "json",
            "X-CSRFToken": getCookie("csrftoken"),
            success: function(data){
                console.log(data);

                var div = document.createElement("DIV");
                conteinerDiv = $('#manage-video-box-list-anno-id')[0];
                div.classList.add("global-annotations-actual-div");
                div.setAttribute("data-global-user-id", data['user_id']);
                div.setAttribute("globalid", data['global_id']);

                var div2 = document.createElement("DIV");
                div2.classList.add("border");
                div2.classList.add("border-secondary")
                div2.classList.add("m-2")
                div2.classList.add("pl-2")
                div2.classList.add("pr-2")
                div2.classList.add("rounded")
                div2.classList.add("global-annotations-actual-div-tag")
                div2.setAttribute("modifyTagId", data['global_id']);
                div2.innerHTML=data['tag']

                div.appendChild(div2);

                var div3=document.createElement("DIV");
                div3.classList.add("side-global-annotations-actual-div-option");
                var but1=document.createElement("BUTTON");
                but1.classList.add("fas");
                but1.classList.add("fa-times");
                but1.classList.add("rounded");
                but1.classList.add("border");
                but1.classList.add("border-primary");
                but1.classList.add("btn");
                but1.classList.add("btn-outline-primary");
                but1.classList.add("my-delete-global-annotation-button");
                but1.setAttribute("data-global", data['global_id']);
                but1.setAttribute("aria-hidden", true);
                div3.appendChild(but1);
                var but2=document.createElement("BUTTON");
                but2.classList.add("fa");
                but2.classList.add("fa-pencil-square-o");
                but2.classList.add("border");
                but2.classList.add("border-primary");
                but2.classList.add("btn");
                but2.classList.add("btn-outline-primary");
                but2.classList.add("ml-2");
                but2.classList.add("mr-2");
                but2.classList.add("my-modify-global-annotation-button");
                but2.setAttribute("data-global", data['global_id']);
                but2.setAttribute("aria-hidden", true);
                div3.appendChild(but2);

                div.appendChild(div3);

                div4=document.createElement("DIV");
                div4.classList.add("conteiner-input-global-annotation-modifier");
                div4.classList.add("rounded");
                div4.classList.add("border");
                div4.classList.add("border-secondary");
                div4.setAttribute("modifyId", data['global_id']);

                div41=document.createElement("DIV");
                div41.classList.add("input-div-global-anno-create");
                div41.classList.add("m-1");
                div41.classList.add("mt-2");
                div41.classList.add("pr-4");
                p41=document.createElement("P");
                var text = document.createTextNode("Tag: ");
                p41.appendChild(text);
                input41=document.createElement("INPUT");
                input41.classList.add("rounded")
                input41.classList.add("my-small-global-anno-modify-inser")
                input41.classList.add("input-global-anno-modify-tag")
                input41.setAttribute("type", "text");
                input41.setAttribute("value", data['tag']);
                div41.appendChild(p41)
                div41.appendChild(input41)
                div4.appendChild(div41)

                div42=document.createElement("DIV");
                div42.classList.add("input-div-global-anno-create");
                div42.classList.add("m-1");
                p42=document.createElement("P");
                var text = document.createTextNode("First frame: ");
                p42.appendChild(text);
                div42inner=document.createElement("DIV");
                buttonLeft42=document.createElement("button");
                buttonLeft42.classList.add("btn");
                buttonLeft42.classList.add("btn-sm");
                buttonLeft42.classList.add("btn-light");
                buttonLeft42.classList.add("border");
                buttonLeft42.classList.add("first-left-button-modify-global-anno");
                buttonLeft42.setAttribute("modify-identifier-first", data['global_id']);
                div42inner.appendChild(buttonLeft42)
                span42left=document.createElement("span");
                span42left.classList.add("fas");
                span42left.classList.add("fa-chevron-left");
                span42left.classList.add("fa-sm");
                span42left.setAttribute("aria-hidden", true)
                buttonLeft42.appendChild(span42left)
                input42=document.createElement("INPUT");
                input42.classList.add("rounded")
                input42.classList.add("my-small-global-anno-modify-inser")
                input42.classList.add("input-global-anno-modify-first")
                input42.setAttribute("type", "text");
                input42.setAttribute("value", data['first_time']);
                input42.setAttribute("modify-identifier-first-input", data['global_id']);
                div42inner.appendChild(input42)
                buttonRight42=document.createElement("button");
                buttonRight42.classList.add("btn");
                buttonRight42.classList.add("btn-sm");
                buttonRight42.classList.add("btn-light");
                buttonRight42.classList.add("border");
                buttonRight42.classList.add("first-right-button-modify-global-anno");
                buttonRight42.setAttribute("modify-identifier-first", data['global_id']);
                span42right=document.createElement("span");
                span42right.classList.add("fas");
                span42right.classList.add("fa-chevron-right");
                span42right.classList.add("fa-sm");
                span42right.setAttribute("aria-hidden", true)
                buttonRight42.appendChild(span42right)
                div42inner.appendChild(buttonRight42)

                div42.appendChild(p42)
                div42.appendChild(div42inner)
                div4.appendChild(div42)

                div43=document.createElement("DIV");
                div43.classList.add("input-div-global-anno-create");
                div43.classList.add("m-1");
                p43=document.createElement("P");
                var text = document.createTextNode("Second frame: ");
                p43.appendChild(text);

                div43inner=document.createElement("DIV");
                buttonLeft43=document.createElement("button");
                buttonLeft43.classList.add("btn");
                buttonLeft43.classList.add("btn-sm");
                buttonLeft43.classList.add("btn-light");
                buttonLeft43.classList.add("border");
                buttonLeft43.classList.add("second-left-button-modify-global-anno");
                buttonLeft43.setAttribute("modify-identifier-second", data['global_id']);
                div43inner.appendChild(buttonLeft43)
                span43left=document.createElement("span");
                span43left.classList.add("fas");
                span43left.classList.add("fa-chevron-left");
                span43left.classList.add("fa-sm");
                span43left.setAttribute("aria-hidden", true)
                buttonLeft43.appendChild(span43left)
                input43=document.createElement("INPUT");
                input43.classList.add("rounded")
                input43.classList.add("my-small-global-anno-modify-inser")
                input43.classList.add("input-global-anno-modify-second")
                input43.setAttribute("type", "text");
                input43.setAttribute("value", data['second_time']);
                input43.setAttribute("modify-identifier-second-input", data['global_id']);
                div43inner.appendChild(input43)
                buttonRight43=document.createElement("button");
                buttonRight43.classList.add("btn");
                buttonRight43.classList.add("btn-sm");
                buttonRight43.classList.add("btn-light");
                buttonRight43.classList.add("border");
                buttonRight43.classList.add("second-right-button-modify-global-anno");
                buttonRight43.setAttribute("modify-identifier-second", data['global_id']);
                span43right=document.createElement("span");
                span43right.classList.add("fas");
                span43right.classList.add("fa-chevron-right");
                span43right.classList.add("fa-sm");
                span43right.setAttribute("aria-hidden", true)
                buttonRight43.appendChild(span43right)
                div43inner.appendChild(buttonRight43)

                div43.appendChild(p43)

                div43.appendChild(div43inner)
                div4.appendChild(div43)

                button4=document.createElement("button");
                button4.classList.add("btn")
                button4.classList.add("btn-outline-primary")
                button4.classList.add("m-2")
                button4.classList.add("mb-3")
                button4.classList.add("modify-global-annotation-button-confirm")
                button4.setAttribute("confirModifyId", data['global_id']);
                var text = document.createTextNode("Modify ");
                button4.appendChild(text);
                div4.appendChild(button4)

                conteinerDiv.appendChild(div4);

                conteinerDiv.appendChild(div);
                 $("#hidden-create-global-annotation-button-fields-id")[0].style.display = "none";
                 $(".my-cancel-create-global-anno-button")[0].style.display = "none";
            },
        });
    });
    $('#show-create-global-annotation-button').click(function(){
        var uploader_user_id=$('#video-user-id')[0].getAttribute("data-user");
        var logged_user_id=$('#logged-user-id')[0].getAttribute("data-user");
        var video_is_global=$('#video-is-global')[0].getAttribute("data-global");
        console.log(uploader_user_id)
        console.log(logged_user_id)
        console.log(video_is_global)
        if(video_is_global==true || (uploader_user_id==logged_user_id)){
            $("#hidden-create-global-annotation-button-fields-id")[0].style.display = "flex";
            $(".my-cancel-create-global-anno-button")[0].style.display = "inline-block";
        }
        else{
            $('.hidden-message-box-alert-global-annotations')[0].style.display = "block";
        }
    });
    var bolDone=false
    $(document).on("click", "#show-only-my-global-anno-button-id" , function() {
        if(bolDone==false){
        console.log("Show only my annotation function: ")
            $('.global-annotations-actual-div').each(function(){
                var currentElement = $(this);
                console.log(currentElement.data("global-user-id"))
                console.log($('#manage-video-box-list-anno-id')[0].getAttribute("data-user"))
                if( currentElement.data("global-user-id") != $('#manage-video-box-list-anno-id')[0].getAttribute("data-user")){
                    currentElement[0].style.display="none";
                }
            });
             bolDone=true;
        }else{
            if(bolDone==true){
                 $('.global-annotations-actual-div').each(function(){
                    var currentElement = $(this);
                    if( currentElement.data("global-user-id")!= $('#manage-video-box-list-anno-id')[0].getAttribute("data-user")){
                        currentElement[0].style.display="block";
                    }
                });
                bolDone=false;
            }
        }
    });
    $(".my-cancel-create-global-anno-button").click(function(){
        if($("#hidden-create-global-annotation-button-fields-id")[0].style.display == "flex"){
            $("#hidden-create-global-annotation-button-fields-id")[0].style.display = "none";
             $(".my-cancel-create-global-anno-button")[0].style.display = "none";
        }
    });
    $(document).on("click", ".my-delete-global-annotation-button" , function(e) {
        var tmp=$(this)[0]
        var taker;
        taker=tmp.getAttribute("data-global");
        console.log(taker);
        console.log($("[globalId= "+taker+"]"))
        var temp=$("[globalId= "+taker+"]")[0]
        temp.style.display="none";
        e.stopPropagation();
        $.ajax(
        {
            data:{
                global_id: taker
            },
            type:"POST",
            url: "deleteGlobalAnnotation/",
            "X-CSRFToken": getCookie("csrftoken"),
            success: function(){
                console.log("success delete global Anno");
            },
            dataType: "json",
        })
    });
    //open modify global annotation
    $(document).on("click", ".my-modify-global-annotation-button" , function(e) {
        var tmp=$(this)[0]
        var taker;
        taker=tmp.getAttribute("data-global");
        console.log(taker);
        var tagToDesapper=$("[modifyTagId= "+taker+"]")[0]
        var inputDivToShow=$("[modifyId= "+taker+"]")[0]
        tagToDesapper.style.display="none";
        inputDivToShow.style.display="flex";
        all=$(".side-global-annotations-actual-div-option");
        for (var i=0, max = all.length; i < max; i++){
            all[i].style.display="none";
        }
        e.stopPropagation();
    });
    $(document).on("click", ".modify-global-annotation-button-confirm" , function(e) {
        var tmp=$(this)[0]
        var taker;
        taker=tmp.getAttribute("confirModifyId");
        var inputDivToShow=$("[modifyId= "+taker+"]")[0];
        var tagVar=inputDivToShow.getElementsByClassName("input-global-anno-modify-tag")[0];
        var firstTimeVar=inputDivToShow.getElementsByClassName("input-global-anno-modify-first")[0];
        var secondTimeVar=inputDivToShow.getElementsByClassName("input-global-anno-modify-second")[0];
        console.log(tagVar)
        console.log(firstTimeVar)

        var tag=tagVar.value;;
        var firstTime=firstTimeVar.value;
        var secondTime=secondTimeVar.value;

        e.stopPropagation();
        inputDivToShow.style.display="none";
        var tagToDesapperNoMore = $("[modifyTagId= "+taker+"]")[0];
        tagToDesapperNoMore.style.display="flex";
        var optionDiv=$("[globalid= "+taker+"]")[0];
        optionDiv.getElementsByClassName("side-global-annotations-actual-div-option")[0].style.display="none"

        console.log(taker);
        console.log(tag);
        console.log(firstTime);
        console.log(secondTime)

        $.ajax(
        {
            data:{
                global_id: taker,
                tag: tag,
                first_time: firstTime,
                second_time: secondTime,
            },
            type:"POST",
            url: "modifyGlobalAnnotation/",
            "X-CSRFToken": getCookie("csrftoken"),
            success: function(data){
                console.log("success modify global Anno");
                $("[modifyTagId= "+data['global_id']+"]")[0].innerHTML=data['tag']
            },
            dataType: "json",
        });
    });
    //select a global annotation from the list of them
    $(document).on("click", ".global-annotations-actual-div" , function(e) {
        var all=$(".global-annotations-actual-div");
        console.log("entered funxtion that select a global annotation from the list of all of them");
        for (var i=0, max=all.length; i < max; i++){
            if(all[i].style.display!="none"){
                all[i].style.display="inline-block";
                all[i].style.width="auto";
            }
        }
        allModifiedToHide=$(".global-annotations-actual-div-tag");
        for (var i=0, max=allModifiedToHide.length; i < max; i++){
            if(allModifiedToHide[i].style.display=="none"){
                allModifiedToHide[i].style.display="flex";
            }
        }
        allModifiedToShow=$(".conteiner-input-global-annotation-modifier")
        for (var i=0, max=allModifiedToShow.length; i < max; i++){
            if(allModifiedToShow[i].style.display!="none"){
                allModifiedToShow[i].style.display="none";
            }
        }

        all=$(".global-annotations-actual-div-tag");
        for (var i=0, max=all.length; i < max; i++){
            all[i].style.width="auto";
        }
        all=$(".side-global-annotations-actual-div-option");
        for (var i=0, max=all.length; i < max; i++){
            all[i].style.display="none";
        }
        $(this)[0].style.width="100%";
        $(this)[0].style.display="flex";
        $(this)[0].style.flexDirection="row";
        $(this)[0].style.alignItems="baseline";
        var tagElement = $(this)[0].getElementsByClassName("global-annotations-actual-div-tag");
        tagElement[0].style.width="100%";
        var optionElement = $(this)[0].getElementsByClassName("side-global-annotations-actual-div-option");
        optionElement[0].style.display="flex";
        e.stopPropagation();
    });

});
