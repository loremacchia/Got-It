$(window).on('load',function(){

var player = document.querySelector('.video-player-full');
    playerContainer = document.querySelector('#video-player-container');
    video = player.querySelector('.video-player');
    bar = player.querySelector('.video-bar');
    playButton = bar.querySelector('.play-button');
    pauseButton = bar.querySelector('.pause-button');
    timeDiv = bar.querySelector('.time');
    frameCounterText = bar.querySelector('.frames');
    leftFrameSelector = bar.querySelector('#left-frame');
    rightFrameSelector = bar.querySelector('#right-frame');
    elapsedTime = timeDiv.querySelector('.time-elapsed');
    totalTime = timeDiv.querySelector('.time-total');
    progressBarContainer = bar.querySelector('.progress-bar-container');
    progressBar = bar.querySelector('.progress-bar-video');
    progressBarSelect = bar.querySelector('.select-progress');
    progressCursor = progressBar.querySelector('.bottom-cursor');
    annotationButton = bar.querySelector('.fa-pencil-alt');
    circleAnnotation = bar.querySelector('#circle-icon');
    circle = bar.querySelector('.circle');
    startTopCursor = document.querySelector('#first-top-cursor');
    endTopCursor = document.querySelector('#second-top-cursor');
    videoLength = video.duration;
    $(totalTime).text(fancyTimeFormat(videoLength));
    videoId =  $(video).attr("data-taker");
    username = $('#userId').attr("value");
    previousStartValue = null; 
    previousEndValue = null; 
    activeModeBar = document.getElementsByClassName("active-mode-bar")[0];
    leftChevronStart = document.querySelector('#start-chevron-left');
    rightChevronStart = document.querySelector('#start-chevron-right');
    leftChevronEnd = document.querySelector('#end-chevron-left');
    rightChevronEnd = document.querySelector('#end-chevron-right');
    activeModeRectangle = document.querySelector('.active-mode-rectangle');
    exitActiveModeRectangle = document.querySelector('.exit-active-mode-rectangle');
    localAnnoText = document.querySelector('#local-anno-text');
    localAnnoUser = document.querySelector('#local-anno-user');
    localAnnoDate = document.querySelector('#local-anno-date');
    localAnnoTime = document.querySelector('#local-anno-time');
    punctualAnnotationContainer = document.querySelector('#punctual-anno-container');
    uploader_user_id=$('#video-user-id')[0].getAttribute("data-user");
    logged_user_id=$('#logged-user-id')[0].getAttribute("data-user");
    video_is_global=$('#video-is-global')[0].getAttribute("data-global");
    video_is_global = (video_is_global == 'True')? true : false;
    taxonomy = null;
    tip = []; 
    localAnnoCheck = document.querySelector('#check-local-annotations');
    createTaxEl= document.getElementById("tax-element-create");
    renameTaxEl = document.getElementById("tax-element-rename");
    deleteTaxEl = document.getElementById("tax-element-delete");
    allowAnnotation = checkPermits();
    allowForeignLocalAnno = false;
    keepAnnotating = false;
    isAnnotating = false;
    isCircleAnnotation = false;
    isEditing = false;
    isEditingColor = false;
    currentPointEdit = null;
    currentFocus = -1;
    crossTraslate = false;
    topTraslate = false;
    bottomTraslate = false;
    leftTraslate = false;
    rightTraslate = false;
    videoBarModify = false;
    barModifyFirst = false;
    barModifySecond = false;
    isHovering = false;
    doneTraslate = false;
    interval = null;
    block = false;
    firstX = null;
    firstY = null;
    secondX = null;
    secondY = null;
    userAnnotations = null;
    frameRate = 30;
    timePerFrame = 1/frameRate;
    currentFrame = 0;


function getCurrentFrame(){
    return Math.trunc(frameRate*video.currentTime);
}

videoHeightCalculate();

function videoHeightCalculate(){
    const height = $(window).height() - 114 - 32 - 35.2 - 50 -32
    $(playerContainer).css({"height": height+"px"}) 
    const width = height * video.videoWidth / video.videoHeight
    $(playerContainer).css({"width": width+"px"})
    const setWidth = 100*(width+32)/$(".left-body-content").parent().width();
    $(".left-body-content").css({"width":setWidth + "%"})
    $(".right-body-content").css({"width":98 - setWidth + "%"})
}

//function to get the json file with the previous annotations
$.get("getJsonVideoAnnotations/",{video_id: videoId,username: username},
        function(data){
            
            userAnnotations = JSON.parse(data);
            console.log(userAnnotations)
        }
);

//function to play the video and to set the cursor updating interval (called by playButton click)
function play(){
    video['play']();
    interval = setInterval(updateCursor, timePerFrame*1000);
}

//function to pause the video and resetting the updating of the cursor (called by pauseButton click)
function pause(){
    video['pause']();
    if(interval != null){
        clearInterval(interval);
    }
}

//function to update the cursor while the video is playing
function updateCursor(){
    var current = video.currentTime;
    var perc = (100/videoLength)*current;
    progressCursor.style.left  = perc + '%';
    timeUpdate();
    frameUpdate();
    manageContextButtons();
}

function frameUpdate(){
    currentFrame = getCurrentFrame();
    frameCounterText.textContent = currentFrame;
    if($(document).find(".frames-counter-annotation").length != 0){
        $(".frames-counter-annotation").text(currentFrame)
    }
}

//function to update the elapsed time, called by updateCursor
function timeUpdate(){
    elapsedTime.textContent = fancyTimeFormat(video.currentTime);
}

function getProgressbarDistance(){
    return event.clientX - $(progressBarContainer).offset().left;
}

//function that enables the user to click anywhere in the progressbar and setting the video to that time
function progressBarUpdate(){
    var distance = getProgressbarDistance();
    if(distance < 0){
        distance = 0;
    }
    else if( distance > $(progressBar).width()){
        distance = progressBar.offsetWidth;
    }
    var selectTime = (distance/$(progressBarContainer).width())*videoLength;
    video.currentTime = selectTime;
    updateCursor();
}

function updateFrame(event){
    var enabled = true;
    if($(document).find(".circle-annotation").length == 1 || $(document).find(".anno-rectangle").length == 1){
        var firstTime = activeModeBar.querySelector('.start-time').textContent;
        var secondTime = activeModeBar.querySelector('.end-time').textContent;
        if(currentFrame <= convert(firstTime)*frameRate && ($(event.target).attr('id') == 'left-frame' || $(event.target).attr('id') == 'left-frame-annotation' )){
            alertWrongTimeBounds();
            enabled = false;
        }else if(currentFrame >= convert(secondTime)*frameRate && ($(event.target).attr('id') == 'right-frame' || $(event.target).attr('id') == 'right-frame-annotation' )){
            alertWrongTimeBounds();
            enabled = false;
        }
    }
    if(enabled){
        if($(event.target).attr('id') == 'right-frame' || $(event.target).attr('id') == 'right-frame-annotation' ){
            currentFrame++;
            video.currentTime += timePerFrame;
            updateCursor();
        }
        else if($(event.target).attr('id') == 'left-frame' || $(event.target).attr('id') == 'left-frame-annotation' ){
            currentFrame--;
            video.currentTime -= timePerFrame;
            updateCursor();
        }
        recreateInterface(event);
    }
}

function recreateInterface(event){
    if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
        var id = $(".rectangle-moving-icons").attr("id").replace("rectangle-moving-icons-", "");
        if(id == ""){
            finishAnnotation();
            exitFromAnno(event, true);
            var anno = searchLastAnno();
            console.log(anno)
            createActiveModeInterface(event, anno.pk)
            
        }
        else{
            var anno = getFrameAnnoFromParentId(id);
        }
        var target = document.getElementsByClassName('anno-rectangle')[0];
        target.style.width = anno.fields.deltaX +"%";
        target.style.height = anno.fields.deltaY +"%";
        target.style.left = anno.fields.firstPointX + "%";
        target.style.top = anno.fields.firstPointY +"%";
    }
    else if(document.body.contains(document.getElementsByClassName('circle-moving-icons')[0])){
        var id = $(".circle-moving-icons").attr("id").replace("circle-moving-icons-", "");
        if(id == ""){
            finishAnnotation();
            exitFromAnno(event, false);
            var anno = searchLastAnno();
            console.log(anno)
            createActiveModeInterface(event, anno.pk)
            
        }
        else{
            var anno = getFrameAnnoFromParentId(id);
        }
        var target = document.getElementsByClassName('circle-annotation')[0];
        target.style.left = anno.fields.firstPointX + "%";
        target.style.top = anno.fields.firstPointY +"%";
    }
}

function searchLastAnno(){
    var maxId = 0;
    var lastAdd = null;
    for(i= userAnnotations.length -1; i>=0; i--){
        if(maxId < parseInt(userAnnotations[i].pk) && userAnnotations[i].model == "fileManager.framelevelannotation"){
            maxId = parseInt(userAnnotations[i].pk);
            lastAdd = userAnnotations[i];
        }
    }
    return lastAdd;
}
//function that creates the basis to annotate on the video: pauses the video, set isAnnotating to true and reveals the 
//grey progressbar
function createAnnotation(){
    if(checkPermits()){
        if(allowAnnotation){
            video['pause']();
            if(!isEditing){
                if(isCircleAnnotation){isCircleAnnotation = false;$(circleAnnotation).removeClass("font-awes-button-clicked");}
                isAnnotating = true;
                $(annotationButton).addClass("font-awes-button-clicked");
                manageContextButtons();
                var perc = (video.currentTime/videoLength)*100;
                progressBarSelect.style.cssText = "opacity: 1; width: 0%;";
                progressBarSelect.style.left = perc+'%';
            }
        }
    }
    else{
        alertAnnotation();
    }
    
}

function createCircleAnnotation(){
    if(checkPermits()){
        if(allowAnnotation){
            video['pause']();
            if(!isEditing){
                if(isAnnotating){isAnnotating = false;$(annotationButton).removeClass("font-awes-button-clicked");}
                isCircleAnnotation = true;
                $(circleAnnotation).addClass("font-awes-button-clicked");
                manageContextButtons();
                var perc = (video.currentTime/videoLength)*100;
                progressBarSelect.style.cssText = "opacity: 1; width: 0%;";
                progressBarSelect.style.left = perc+'%';
            }
        }
    }
    else{
        alertAnnotation();
    }
}

//function that tracks both the annotation rectangle creation and its moving throught the axis
function trackPosition(){
    //vars for the video position in the DOM
    var videoWidth = $(video).width();
    var videoHeight = $(video).height()
    var videoLeft = $(video).offset().left;
    var videoRight = videoLeft + videoWidth;
    var videoTop = $(video).offset().top - $(window).scrollTop();
    var videoDown = videoTop + videoHeight;

    //vars for the client position in the video player
    var distanceX = event.clientX - videoLeft;
    var distanceY = event.clientY - videoTop;

    //check if the client position is inside the video box
    if(videoLeft < event.clientX && videoRight > event.clientX && videoTop < event.clientY && videoDown > event.clientY){
        //the var isAnnotating is set to true only when it is requested to create an annotation
        if(isAnnotating){
            switch(event.type){
                //when the client starts drawing the rectangle
                case 'mousedown': 
                    firstX = (distanceX/videoWidth)*100;
                    firstY = (distanceY/videoHeight)*100;
                    //a new annoRectangle is created
                    
                    if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
                        var annoRectangle = document.getElementsByClassName('anno-rectangle')[0];
                    }
                    else{
                        var annoRectangle = document.createElement("div");
                        annoRectangle.className = "anno-rectangle rounded";
                    }
                    //Set the annoRectangle parameters to the starting ones
                    annoRectangle.style.left = firstX + "%";
                    annoRectangle.style.top = firstY +"%";
                    annoRectangle.style.width = "0%";
                    annoRectangle.style.height = "0%";
                    playerContainer.appendChild(annoRectangle);
                break;
                //here the code allows the client to draw the rectangle in all the different directions
                case 'mousemove':
                        if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
                            var annoRectangle = document.getElementsByClassName('anno-rectangle')[0];
                            if(annoRectangle.style.left != "initial"){
                                var previousX = parseFloat(annoRectangle.style.left.replace("%" , ""));
                                secondX = (distanceX/videoWidth)*100 - previousX;
                            }
                            else{
                                var previousX = parseFloat(annoRectangle.style.right.replace("%" , ""));
                                secondX = (distanceX/videoWidth)*100 + previousX - 100;
                            }
                            if(annoRectangle.style.top != "initial"){
                                var previousY = parseFloat(annoRectangle.style.top.replace("%" , ""));
                                secondY = (distanceY/videoHeight)*100 - previousY;
                            }
                            else{
                                var previousY = parseFloat(annoRectangle.style.bottom.replace("%" , ""));
                                secondY = (distanceY/videoHeight)*100 + previousY - 100;
                            }
                            if(secondX >= 0){
                                if(annoRectangle.style.left == "initial" || annoRectangle.style.left == ""){
                                    annoRectangle.style.left = 100 - previousX + "%";
                                    annoRectangle.style.right = "initial";
                                }
                                annoRectangle.style.width = Math.abs(secondX) + "%";
                            }
                            else if(secondX < 0){
                                if(annoRectangle.style.right == "initial" || annoRectangle.style.right == ""){
                                    annoRectangle.style.right = 100 - previousX + "%";
                                    annoRectangle.style.left = "initial";
                                }
                                annoRectangle.style.width = Math.abs(secondX) + "%";
                            }
                            if(secondY >= 0){
                                if(annoRectangle.style.top == "initial" || annoRectangle.style.top == ""){
                                    annoRectangle.style.top = 100 - previousY + "%";
                                    annoRectangle.style.bottom = "initial";
                                }
                                annoRectangle.style.height = Math.abs(secondY) + "%";
                            }
                            else if(secondY < 0){
                                if(annoRectangle.style.bottom == "initial" || annoRectangle.style.bottom == ""){
                                    annoRectangle.style.bottom = 100 - previousY + "%";
                                    annoRectangle.style.top = "initial";
                                }
                                annoRectangle.style.height = Math.abs(secondY) + "%";
                                }
                        }
                break;
                //if the client exits from the video player or leaves the track the annotation is stopped and the 
                //interface is created
                case 'mouseup':
                case 'mouseout':
                    isAnnotating = false;
                    isEditing = true;
                    createAnnotationDivs();
                break;
            }
        }
        else if(isCircleAnnotation){
            switch(event.type){
                case 'mousedown': 
                    firstX = (distanceX/videoWidth)*100;
                    firstY = (distanceY/videoHeight)*100;
                    if(document.body.contains(document.getElementsByClassName('circle-annotation')[0])){
                        var annoCircle = document.getElementsByClassName('circle-annotation')[0];
                    }
                    else{
                        var annoCircle = document.createElement("div");
                        annoCircle.className = "circle-annotation";
                    }
                    //Set the annoRectangle parameters to the starting ones
                    annoCircle.style.left = firstX + "%";
                    annoCircle.style.top = firstY +"%";
                    playerContainer.appendChild(annoCircle);
                break;
                //here the code allows the client to draw the rectangle in all the different directions
                case 'mousemove':
                    if(document.body.contains(document.getElementsByClassName('circle-annotation')[0])){
                        var annoCircle = document.getElementsByClassName('circle-annotation')[0];
                        firstX = (distanceX/videoWidth)*100;
                        firstY = (distanceY/videoHeight)*100;
                        if(firstX <= 97 && firstX >= 0){
                            annoCircle.style.left = firstX + "%";
                        }
                        if(firstY <= 95 && firstY >= 0) {
                            annoCircle.style.top = firstY +"%";
                        }
                    }
                break;
                //if the client exits from the video player or leaves the track the annotation is stopped and the 
                //interface is created
                case 'mouseup':
                case 'mouseout':
                    isCircleAnnotation = false;
                    isEditing = true;
                    createCircleButtons();
                break;
            }
        }
        //if the client isn't annotating he wants to move the annotation rectangle's sides 
        else{
            //here the id is the one of the different buttons
            var id = event.target.id;
            switch(event.type){
                case 'mousedown':
                    switch(id){
                        case 'double-rectangle-icon':
                            crossTraslate = true;
                        break;
                        case 'top-rectangle-icon':
                            topTraslate = true;
                        break;
                        case 'bottom-rectangle-icon':
                            bottomTraslate = true;
                        break;
                        case 'left-rectangle-icon':
                            leftTraslate = true;
                        break;
                        case 'right-rectangle-icon':
                            rightTraslate = true;
                        break;
                    }
                break;
                case 'mousemove':
                    //the client can also move the contextual buttons throught the video player  
                    if(crossTraslate && $(event.target).closest(".contextual-buttons").length == 1){
                        var contextualButtons = $(event.target).closest(".contextual-buttons");
                        $(contextualButtons).trigger('mouseout');
                        doneTraslate = true;
                        var annoTag = contextualButtons.find("span.annotation-tag.shadow-apply.rounded.text-nowrap")[0];
                        var width = ($(annoTag).width()/videoWidth)*100;
                        var height = ($(annoTag).height()/video.clientHeight)*100;      
                        var nextX = (distanceX/videoWidth)*100;
                        var nextY = (distanceY/videoHeight)*100;
                        if((nextX + width) <= 100 && (nextY + height) <= 100){
                            contextualButtons.css({"left": nextX + "%", "top": nextY +"%"});
                        }
                    }
                    //real moving anno-rectangle's sides function
                    else if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
                        var annoRectangle = document.getElementsByClassName('anno-rectangle')[0];
                        var previousX = parseFloat(annoRectangle.style.left.replace("%" , ""));
                        var previousY = parseFloat(annoRectangle.style.top.replace("%" , ""));
                        var width = parseFloat(annoRectangle.style.width.replace("%" , ""));
                        var height = parseFloat(annoRectangle.style.height.replace("%" , ""));
                        var nextX = (distanceX/videoWidth)*100;
                        var nextY = (distanceY/videoHeight)*100;
                        if(crossTraslate && (nextX + width) <= 100 && (nextY + height) <= 100){
                            annoRectangle.style.left = nextX + "%";
                            annoRectangle.style.top = nextY +"%";
                            firstX = nextX;
                            firstY = nextY;
                        }
                        else if(topTraslate && nextY >= 0 && previousY - nextY + height > 3){
                            height += previousY - nextY;
                            annoRectangle.style.height = height + "%";
                            annoRectangle.style.top = nextY +"%";
                            firstY = nextY;
                            secondY = height;
                        }
                        else if(bottomTraslate && nextY <= 99 && nextY - previousY > 3){
                            height = nextY - previousY;
                            annoRectangle.style.height = height + "%";
                            secondY = height;
                        }
                        else if(leftTraslate && nextX >= 0 && previousX + width - nextX > 3){
                            width += previousX - nextX;
                            annoRectangle.style.width = width + "%";
                            annoRectangle.style.left = nextX + "%";
                            firstX = nextX;
                            secondX = width;
                        }
                        else if(rightTraslate && nextX - previousX > 3){
                            width = nextX - previousX;
                            annoRectangle.style.width = width + "%";
                            secondX = width;
                        }
                    } 
                    else if(document.body.contains(document.getElementsByClassName('circle-annotation')[0])){
                        var circleAnnotation = document.getElementsByClassName('circle-annotation')[0];
                        var previousX = parseFloat(circleAnnotation.style.left.replace("%" , ""));
                        var previousY = parseFloat(circleAnnotation.style.top.replace("%" , ""));
                        var nextX = (distanceX/videoWidth)*100;
                        var nextY = (distanceY/videoHeight)*100;
                        if(crossTraslate && (nextX + 3) <= 100 && (nextY + 1) <= 100){
                            circleAnnotation.style.left = nextX + "%";
                            circleAnnotation.style.top = nextY +"%";
                            firstX = nextX;
                            firstY = nextY;
                        }
                    }
                break;
                //if the client leaves the track all the modifying boolean are set to false
                case 'mouseup':
                    crossTraslate = false;
                    topTraslate = false;
                    bottomTraslate = false;
                    leftTraslate = false;
                    rightTraslate = false;
                    doneTraslate = false;
                break;
            }
        }
    }
}

function createCircleButtons(id = null){
    if(id == null){id = ""}
    $('<div class="circle-moving-icons fa-2x" id="circle-moving-icons-' + id + '">' + 
      '<i class="fas fa-arrows-alt white-icon" id="double-rectangle-icon"></i>'+
      '</div>').prependTo($('.circle-annotation'));
    $('.rectangle-moving-icons').css({ "display": "flex", "position":"absolute"});
    createAnnotationButton();
    createAnnotationBar();
    createSkipButtons();
    var startTime = document.getElementsByClassName('start-time')[0];
    var endTime = document.getElementsByClassName('end-time')[0];
    startTime.innerHTML = fancyTimeFormat(video.currentTime);
    endTime.innerHTML = fancyTimeFormat(video.currentTime);
}

//function to create all the buttons needed for the annotation interface 
function createAnnotationDivs(id = null){
    createRectangleButtons(id);
    createAnnotationButton();
    createAnnotationBar();
    createSkipButtons();
    var startTime = document.getElementsByClassName('start-time')[0];
    var endTime = document.getElementsByClassName('end-time')[0];
    startTime.innerHTML = fancyTimeFormat(video.currentTime);
    endTime.innerHTML = fancyTimeFormat(video.currentTime);
}

//function to create the button for moving and modifying the anno-rectangle's sides
function createRectangleButtons(id){
    if(id == null){id = ""}
    $('<div class="rectangle-moving-icons fa-2x" id="rectangle-moving-icons-' + id + '">' + 
      '<i class="fas fa-arrows-alt white-icon" id="double-rectangle-icon"></i>'+
      '<i class="fas fa-arrows-alt-v white-icon" id="top-rectangle-icon"></i>'+
      '<i class="fas fa-arrows-alt-v white-icon" id="bottom-rectangle-icon"></i>'+
      '<i class="fas fa-arrows-alt-h white-icon" id="left-rectangle-icon"></i>'+
      '<i class="fas fa-arrows-alt-h white-icon" id="right-rectangle-icon"></i>'+
      '</div>').prependTo($('.anno-rectangle'));
    $('.rectangle-moving-icons').css({ "display": "flex", "position":"absolute"});
}

function createAnnotationButton(){
    if(document.getElementsByClassName('anno-rectangle').length != 0){
        var target = document.getElementsByClassName('anno-rectangle')[0];
    }
    else{
        var target = document.getElementsByClassName('circle-annotation')[0];
    }
    //var roundedSquareButton = document.getElementsByClassName("active-mode-rectangle")[0];
    target.appendChild(activeModeRectangle);
    activeModeRectangle.style.cssText="display: flex !important; opacity:1";
    target.appendChild(exitActiveModeRectangle);
    exitActiveModeRectangle.style.cssText="display: flex !important; opacity:1";
}

function createAnnotationBar(){
    if(document.getElementsByClassName('anno-rectangle').length != 0){
        var target = document.getElementsByClassName('anno-rectangle')[0];
    }
    else{
        var target = document.getElementsByClassName('circle-annotation')[0];
    }
    target.appendChild(activeModeBar);
    activeModeBar.style.cssText="display: flex; opacity:1";
}

function createSkipButtons(){
    if(document.getElementsByClassName('anno-rectangle').length != 0){
        var target = document.getElementsByClassName('anno-rectangle')[0];
    }
    else{
        var target = document.getElementsByClassName('circle-annotation')[0];
    }
    //var roundedSquareButton = document.getElementsByClassName("active-mode-rectangle")[0];
    $('<div class="skip-buttons-container">' + 
      '<button class="fas fa-angle-double-left skip-button btn btn-sm btn-light border" id="left-frame-annotation"></button>'+
      '<button class="fas fa-angle-double-right skip-button btn btn-sm btn-light border" id="right-frame-annotation"></button>'+
      '<div class="frames-counter-annotation rounded">'+ currentFrame +'</div>'+
      '<button class="btn btn-sm btn-light text-nowrap border" id="to-start-arrow"><i class="fas fa-arrow-left"></i>Start</button>'+
      '<button class="btn btn-sm btn-light text-nowrap border" id="to-end-arrow">End<i class="fas fa-arrow-right"></i></button>'+
      '</div>').appendTo($(target));
    $("#to-start-arrow").on("click",function(event){
        keepAnnotating = true;
        var startTime = $(".start-time").text();
        startTime = convert(startTime);
        video.currentTime = startTime;
        updateCursor();
        updateFrame(event);
    })
    $("#to-end-arrow").on("click",function(event){
        keepAnnotating = true;
        var endTime = $(".end-time").text();
        endTime = convert(endTime);
        video.currentTime = endTime;
        updateCursor();
        updateFrame(event);
    })
    
}

//function to update the left hand cursor of the select time progressbar
function selectedProgressBarLeftUpdate(current){
    var initial = progressBarSelect.style.left;
    var width = progressBarSelect.style.width;
    initial = parseFloat(initial.replace("%", ""));
    width = parseFloat(width.replace("%", ""));
    var next = (current/videoLength)*100;
    progressBarSelect.style.left = next + "%";
    progressBarSelect.style.width = width + initial - next +"%";
}

//same of the latter but for the right hand one
function selectedProgressBarRightUpdate(current){
    var left = progressBarSelect.style.left;
    var width = progressBarSelect.style.width;
    left = parseFloat(left.replace("%", ""));
    width = parseFloat(width.replace("%", ""));
    var right = left + width;
    var next = (current/videoLength)*100;
    progressBarSelect.style.width = width - right + next + "%";
}

//when finish annotation is pressed a json is sent to the database; the interface and the anno-rectangle both disappear
function finishAnnotation(){
    isEditing = false;
    if($(event.target).is(".active-mode-rectangle")){keepAnnotating = false;}
    var firstTime = activeModeBar.querySelector('.start-time').textContent;
    var secondTime = activeModeBar.querySelector('.end-time').textContent;
    
    if(secondX < 0){
        firstX = firstX + secondX;
        secondX = - secondX;
    }
    if(secondY < 0){
        firstY = firstY + secondY;
        secondY = - secondY;
    }
    
    else{
        var isRectangle = false;
        if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
            isRectangle = true;
            var type = "rectangle";
            var color = "white";
            var tag = activeModeBar.querySelector('.annotation-tag').textContent;
            var id = $(".rectangle-moving-icons").attr("id").replace("rectangle-moving-icons-", "");
        }
        else{
            isRectangle = false;
            var target = document.getElementsByClassName('circle-annotation')[0];
            var type = "circle";
            var color = $(target).css("background-color");
            var id = $(".circle-moving-icons").attr("id").replace("circle-moving-icons-", "");
            secondX = 0;
            secondY = 0;
        }
        
        var tag = activeModeBar.querySelector('.annotation-tag').textContent;
        var annoData = {
            type: type,
            color: color,
            tag: tag,
            frame: currentFrame,
            firstTime: firstTime,
            secondTime: secondTime,
            firstX: firstX,
            firstY: firstY,
            deltaX: secondX,
            deltaY: secondY,
            reminderX:firstX + (secondX/2),
            reminderY:firstY + (secondY/2),
        }
        annoData = JSON.stringify(annoData);
        if(id != ""){
            $.ajax({
                type: 'GET',
                url:'modifyAnnotation/',
                async:false,
                data:{
                    annotation: annoData,
                    video_id: videoId,
                    username: username,
                    id: id
                },
                success:function(data){
                    userAnnotations = JSON.parse(data); 
                    console.log(userAnnotations);
                    if(!keepAnnotating){exitFromAnno(event,isRectangle)}; 
                }
            })
        }
        else{
            $.ajax({
                type: 'GET',
                url:'insertAnnotation/',
                async:false,
                data:{
                    annotation: annoData,
                    video_id: videoId,
                    username: username
                },
                success:function(data){
                    userAnnotations = JSON.parse(data); 
                    console.log(userAnnotations);
                    if(!keepAnnotating){exitFromAnno(event,isRectangle)}; 
                }
            })
        }
        if(!keepAnnotating){
            addToTaxonomy(tag);
            removeLocalAnnotation();
        }
        if($(document).find(".font-awes-button-clicked").length != 0){
            $($(document).find(".font-awes-button-clicked")[0]).removeClass("font-awes-button-clicked");
        }
    }
    
}

function alertWrongTimeBounds(){
    Swal.fire({
        type: 'warning',
        title: 'Cannot do it',
        text: 'Time bounds are not respected',
        confirmButtonText: 'Got it!'
    })
}

function exitFromAnno(event, isRectangle = null){
    isEditing = false;
    keepAnnotating = false;
    if(isRectangle == null){
        if(document.body.contains(document.getElementsByClassName('anno-rectangle')[0])){
            var isRectangle = true;
            $(annotationButton).removeClass("font-awes-button-clicked");
        }
        else if(document.body.contains(document.getElementsByClassName('circle-annotation')[0])){
            var isRectangle = false;
            $(circleAnnotation).removeClass("font-awes-button-clicked");
        }
    }
    disappear(activeModeBar);
    disappear(exitActiveModeRectangle);
    disappear(activeModeRectangle)
    disappear(progressBarSelect);
    activeModeBar.querySelector('.annotation-tag').textContent = "Tag";
    $(activeModeBar).appendTo(player);
    $(exitActiveModeRectangle).appendTo(player);
    $(activeModeRectangle).appendTo(player);
    var target = null;
    isRectangle ? target = $(".anno-rectangle") : target = $(".circle-annotation");
    target.find(".skip-buttons-container").remove();
    target.remove();
    manageContextButtons();
}

//a grey contextual button is created with buttons to modify the anno-rectangle or to delete the annotation
function createContextualButtons(tag,id,prevX,prevY){
    var left = prevX;
    var top = prevY;
    var html = $('<div class="contextual-buttons" id="contextual-buttons-' + id.toString() +  
                '"><span class="annotation-tag shadow-apply rounded text-nowrap" contenteditable="true">'+tag+'</span>'+
                '<button class="far fa-square fa-lg active-mode font-awes-button button shadow-apply bg-white rounded border border-warning btn btn-outline-warning"></button>'+
                '<button class="fas fa-times fa-lg exit-active-mode font-awes-button button shadow-apply rounded border border-danger btn btn-outline-danger"></button>'+
                '</div>');
    $('#contextual-buttons-container').prepend(html);
    $('.contextual-buttons').first().css({ "left": left + "%", "top": top + "%" });
}

function createCircleContButtons(id,prevX,prevY,color){
    var left = prevX;
    var top = prevY;
    var html = $('<div class="contextual-buttons circle-cont" id="contextual-buttons-' + id.toString() +  
                '"><div class="circle-annotation" style="background-color: '+ color +'"></div>'+
                '<button class="far fa-square fa-lg active-mode font-awes-button button shadow-apply bg-white rounded border border-warning btn btn-outline-warning"></button>'+
                '<button class="fas fa-times fa-lg exit-active-mode font-awes-button button shadow-apply rounded border border-danger btn btn-outline-danger"></button>'+
                '</div>');
    $('#contextual-buttons-container').prepend(html);
    $('.contextual-buttons').first().css({ "left": left + "%", "top": top + "%" });
}

function createPunctualAnno(id,tag,color){
    var counter = countPunctualTag(tag);
    var html = $('<div class="punctual-anno rounded" id="punctual-anno-' + id.toString()+
                '"><span class="punctual-anno-content mr-2 text-nowrap" contenteditable="true">' + tag +'</span>'+
                '<span class="punctual-anno-counter mr-2 ">' + counter +'</span>'+
                '<button class="color-circle mr-2 "></button>'+
                '<button class="delete-punctual-anno btn btn-light">&#10006;</button>'+
                '</div>');
    $(punctualAnnotationContainer).prepend(html);
    $('.color-circle').first().css({"background-color":color});
    
}


function manageContextButtons(){
    var current = elapsedTime.textContent;
    if(userAnnotations != null){
        for(i = 0; i < userAnnotations.length ; i++){
            if(userAnnotations[i].model=="fileManager.annotationvideo" && (convert(userAnnotations[i].fields.firstTime) > convert(current) ||  convert(current) > convert(userAnnotations[i].fields.secondTime) || 
                isEditing || isAnnotating || isCircleAnnotation || keepAnnotating || (!allowForeignLocalAnno && !(userAnnotations[i].fields.user == logged_user_id)))){
                var id = userAnnotations[i].pk;
                
                if(userAnnotations[i].fields.type == "rectangle" || userAnnotations[i].fields.type == "circle"){
                    var target = $(document).find("#contextual-buttons-" + id);
                    if(target.length != 0){
                        target.each(function(){ 
                            $(this).remove(); 
                        })
                    }
                }
                if(userAnnotations[i].fields.type == "circle"){
                    var target = $(punctualAnnotationContainer).find("#punctual-anno-" + id);
                    if(target.length != 0){
                        target.each(function(){ 
                            $(this).remove(); 
                        })
                    }
                }
            }
            else if(userAnnotations[i].model=="fileManager.annotationvideo" && (convert(userAnnotations[i].fields.firstTime) <= convert(current) && convert(current) <= convert(userAnnotations[i].fields.secondTime))){
                var id = userAnnotations[i].pk;
                var currentContButton = $(document).find("#contextual-buttons-" + id);
                var frameAnno = findCorrespondingFrameAnno(id);
                
                if(currentContButton.length == 0 && !(!allowForeignLocalAnno && !(userAnnotations[i].fields.user == logged_user_id))){
                    if(userAnnotations[i].fields.type == "rectangle"){
                        createContextualButtons(userAnnotations[i].fields.tag, id,
                                                frameAnno.fields.reminderX,frameAnno.fields.reminderY);
                    }
                    else if(userAnnotations[i].fields.type == "circle"){
                        createCircleContButtons(id,frameAnno.fields.reminderX,frameAnno.fields.reminderY,
                                                userAnnotations[i].fields.color);
                        if($(document).find("#punctual-anno-" + id).length == 0){
                            createPunctualAnno(id,userAnnotations[i].fields.tag,userAnnotations[i].fields.color);
                        }
                    }
                }
                else if(currentContButton.length == 1 && !(!allowForeignLocalAnno && !(userAnnotations[i].fields.user == logged_user_id)) &&
                ((frameAnno.fields.reminderX.toFixed(4) +"%" )!= currentContButton[0].style.left || (frameAnno.fields.reminderY.toFixed(4) + "%" )!= currentContButton[0].style.top)){
                    $(currentContButton[0]).css({ "left": frameAnno.fields.reminderX + "%", "top": frameAnno.fields.reminderY + "%" });
                }
            }
        }
    } 
}

function findCorrespondingFrameAnno(id){
    var i = 0;
    var anno = null;
    var minimumDistance = null;
    while(i < userAnnotations.length && (anno == null || (anno.fields.frame != currentFrame || anno.fields.annotationVideo != id ))){
        if(userAnnotations[i].model=="fileManager.framelevelannotation" && userAnnotations[i].fields.annotationVideo == id ){
            if(minimumDistance == null){anno = userAnnotations[i];minimumDistance = Math.abs(currentFrame - anno.fields.frame);}
            else if(Math.abs(userAnnotations[i].fields.frame - currentFrame) < minimumDistance){
                anno = userAnnotations[i];
                minimumDistance = Math.abs(userAnnotations[i].fields.frame - currentFrame);
            }    
        }
        i++;
    }
    return anno;
}

function countPunctualTag(tag){
    var counter = 0;
    for(j = 0; j < userAnnotations.length ; j++){
        if(userAnnotations[j].fields.type == "circle" && userAnnotations[j].fields.tag == tag){
            counter++;
        }
    }
    return counter;
}

function getFrameAnnoFromGivenId(id){
    var i = 0;
    var frameAnno= null;
    while(i < userAnnotations.length && frameAnno == null){
        if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.framelevelannotation" ){
            frameAnno = userAnnotations[i];
        }
        i++;
    }
    return frameAnno;
}

function createActiveModeInterface(event, idGiven = null){
    isEditing = true;
    if(idGiven == null){
        var contextualButtons = $(event.target).parent()[0];
        var id = getContButtonsId(contextualButtons)
        var currentAnno = getAnnoContButtons(contextualButtons);
        var wantedAnno = getFrameAnnoFromId(id);
    }
    else{
        var id = idGiven;
        var wantedAnno = getFrameAnnoFromGivenId(id);
        var currentAnno = getAnnoFromId(wantedAnno.fields.annotationVideo);
    }
    manageContextButtons();
    if(currentAnno.fields.type =="rectangle"){
        var target = document.createElement("div");
        target.className = "anno-rectangle rounded";
        secondX = wantedAnno.fields.deltaX;
        secondY = wantedAnno.fields.deltaY;
        target.style.width = secondX +"%";
        target.style.height = secondY +"%";
        $(annotationButton).addClass("font-awes-button-clicked");
    }
    else if(currentAnno.fields.type =="circle"){
        var target = document.createElement("div");
        target.className = "circle-annotation";
        $(target).css("background-color",currentAnno.fields.color);
        $(circleAnnotation).addClass("font-awes-button-clicked");
    }

    activeModeBar.querySelector('.annotation-tag').textContent = currentAnno.fields.tag;
    firstX = wantedAnno.fields.firstPointX;
    firstY = wantedAnno.fields.firstPointY;
    target.style.left = firstX + "%";
    target.style.top = firstY +"%";
    
    playerContainer.appendChild(target);
    if(currentAnno.fields.type =="rectangle"){
        createAnnotationDivs(currentAnno.pk);
    }
    else if(currentAnno.fields.type =="circle"){
        createCircleButtons(currentAnno.pk);
    }
    
    progressBarSelect.style.cssText = "opacity: 1; width: 0%;";
    progressBarSelect.style.left = ((video.currentTime/videoLength)*100)+'%';
    selectedProgressBarLeftUpdate(convert(currentAnno.fields.firstTime));
    $(".start-time").text(currentAnno.fields.firstTime);
    selectedProgressBarRightUpdate(convert(currentAnno.fields.secondTime));
    $(".end-time").text(currentAnno.fields.secondTime);
    updateLocalAnnotation(id);
}

function deleteContextButton(event){
    var contextualButtons = $(event.target).parent()[0];
    var id = getContButtonsId(contextualButtons);
    $(contextualButtons).remove();
    deleteAnnotation(id);
    if($(document).find("#punctual-anno-"+id).length == 1){
        var punctualAnno = $(document).find("#punctual-anno-"+id);
        $(punctualAnno).remove();
    }
    return id;
}

function deleteAnnotation(id){
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this annotation?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes'
    })
    .then((result) => {
        if (result.value) {
            $.get('deleteAnnotation',{
                video_id: videoId,
                username: username,
                id: id
            },function(data){userAnnotations = JSON.parse(data); console.log(userAnnotations);})
            Swal.fire(
                "Deleted!",
                "I have deleted your annotation!", 
                "success"
            );
        }
    });
}


function sendContextButtonsModify(event){
    var contextualButtons = $(event.target).parent()[0];
    var currentAnno = getAnnoContButtons(contextualButtons);
    var id = currentAnno.pk;
    var wantedAnno = findCorrespondingFrameAnno(id);
    var annotation = {
        type:currentAnno.fields.type,
        color: currentAnno.fields.color,
        tag: $(event.target).text(),
        frame:wantedAnno.fields.frame,
        firstTime: currentAnno.fields.firstTime,
        secondTime: currentAnno.fields.secondTime,
        firstX: wantedAnno.fields.firstPointX,
        firstY: wantedAnno.fields.firstPointY,
        deltaX: wantedAnno.fields.deltaX,
        deltaY: wantedAnno.fields.deltaY,
        reminderX: parseFloat(contextualButtons.style.left.replace("%", "")), //TODO change to percentage
        reminderY: parseFloat(contextualButtons.style.top.replace("%", ""))
    }
    console.log(annotation)
    $.get('modifyAnnotation',{
        annotation: JSON.stringify(annotation),
        video_id: videoId,
        username: username,
        id: id
    },function(data){userAnnotations = JSON.parse(data)})
    removeLocalAnnotation();
}

function getAnnoContButtons(contextualButtons){
    var id = getContButtonsId(contextualButtons)
    return getAnnoFromId(id)
}

function getAnnoFromId(id){
    var i = 0;
    var currentAnno = null;
    while(i < userAnnotations.length && currentAnno == null){
        if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
            currentAnno = userAnnotations[i];
        }
        i++;
    }
    return currentAnno;
}

function getFrameAnnoFromParentId(id){
    var i = 0;
    var currentAnno = null;
    while(i < userAnnotations.length && currentAnno == null){
        if(userAnnotations[i].model == "fileManager.framelevelannotation" && userAnnotations[i].fields.annotationVideo == id && userAnnotations[i].fields.frame == currentFrame){
            currentAnno = userAnnotations[i];
        }
        i++;
    }
    return currentAnno;
}

function getFrameAnnoFromId(id){
    var frameAnnos = getFrameAnnoListFromId(id);
    return getSpecificAnno(frameAnnos)
}

function getFrameAnnoListFromId(id){
    var i = 0;
    var frameAnnos = [];
    while(i < userAnnotations.length){
        if(userAnnotations[i].fields.annotationVideo == id && userAnnotations[i].model == "fileManager.framelevelannotation" ){
            frameAnnos.push(userAnnotations[i]);
        }
        i++;
    }
    return frameAnnos;
}

function getSpecificAnno(frameAnnos){
    var wantedAnno = null;
    var i = 0;
    while(i < frameAnnos.length && wantedAnno == null){
        if(frameAnnos[i].fields.frame == currentFrame){
            wantedAnno = frameAnnos[i];
        }
        i++;
    }
    if(wantedAnno == null){wantedAnno = frameAnnos[0]}
    return wantedAnno;
}


function getContButtonsId(contextualButtons){
    return $(contextualButtons).attr("id").replace("contextual-buttons-", "");
}


//function that makes the contextual buttons show and disappear under hover.
//its arguments are the event and the event.target called button. It checks which div button is it and animates its
//children with the library Velocity.js. The variable isHovering is used to control the bubbling of the buttons.
function hoverContButtons(event, button){
    if(!$(button).is('#contextual-buttons-container') && !isEditing && $(button).closest('.contextual-buttons').length == 1){
        if($(button).parents('.contextual-buttons').length == 1){
            button = $(button).parent();
        }
        var children = $(button).find("button");
        var id = getContButtonsId(button);
        switch(event.type){
            case('mouseover'):
                updateLocalAnnotation(id);
                if(!isHovering){
                    $(children).delay(100).velocity("transition.slideLeftIn",{stagger:50, duration:100});
                    isHovering = true;
                }
            break;
            case('mouseout'):
                removeLocalAnnotation();
                if(((crossTraslate && !doneTraslate && ($(event.target).closest(".contextual-buttons").length == 1)) || 
                    isHovering && ($(document.elementFromPoint(event.clientX,event.clientY)).closest(".contextual-buttons").length != 1))){
                    $(children).delay(100).velocity("transition.slideLeftOut",{stagger:50, duration:100});
                    isHovering = false;
                }
            break;
        }   
    }
}

//functions to make the start time and end time of the annotation's interface be clickable and changable
$('.start-time').blur(function() {
    exitEditStart();
});

function exitEditStart(){
    var start = document.querySelector('.start-time');
    var content = start.textContent;
    var time = convert(content);
    if(time >= 0 && time < videoLength && time < selectBarValues()[1]){
        selectedProgressBarLeftUpdate(time)
        video.currentTime = time;
        updateCursor();
    }
    else{
        selectedProgressBarLeftUpdate(previousStartValue);
        start.textContent = fancyTimeFormat(previousStartValue);
    }
}
 
$('.end-time').blur(function() {
    exitEditEnd();
});

function exitEditEnd(){
    var end = document.querySelector('.end-time');
    var content = end.textContent;
    var time = convert(content);
    if(time >= 0 && time < videoLength && time > selectBarValues()[0]){
        selectedProgressBarRightUpdate(time);
        video.currentTime = time;
        updateCursor();
    }
    else{
        selectedProgressBarRightUpdate(previousEndValue);
        end.textContent = fancyTimeFormat(previousEndValue);
    }
}

//function that returns the values of the select time progressbar
function selectBarValues(){
    var left = parseFloat(progressBarSelect.style.left.replace("%", ""));  
    var right =  left + parseFloat(progressBarSelect.style.width.replace("%", ""));
    var first = left*videoLength/100;
    var second = right*videoLength/100;
    return [first,second];
}

//function to enable the client to modify the start and end time of the annotation directly by the select time progressbar
//moving the left and right cursors.
function moveProgress(){
    var id = event.target.id;
    switch(event.type){
        case('mousedown'):
            switch(id){
                case 'first-top-cursor':
                    barModifyFirst = true;
                break;
                case 'second-top-cursor':
                    barModifySecond = true;
                break;
                case '':
                    videoBarModify = true;
            }   
        break;
        case('mousemove'):
            if(barModifyFirst || barModifySecond){
                var distanceX = getProgressbarDistance();
                if(distanceX < 0){
                    distanceX = 0;
                }
                else if( distanceX > $(progressBar).width()){
                    distanceX = progressBar.offsetWidth;
                }
                var selectTime = (distanceX/$(progressBar).width())*videoLength;
                if(barModifyFirst && selectTime >= selectBarValues()[1]){
                    barModifySecond = true;
                    barModifyFirst = false;
                }
                else if(barModifySecond && selectTime <= selectBarValues()[0]){
                    barModifyFirst = true;
                    barModifySecond = false;
                }
                else if(barModifyFirst && selectTime < selectBarValues()[1]){
                    var start = document.querySelector('.start-time');
                    selectedProgressBarLeftUpdate(selectTime);
                    video.currentTime = selectTime;
                    updateCursor();
                    start.textContent = fancyTimeFormat(selectTime);
                }
                else if(barModifySecond && selectTime > selectBarValues()[0]){
                    var end = document.querySelector('.end-time');
                    selectedProgressBarRightUpdate(selectTime);
                    video.currentTime = selectTime;
                    updateCursor();
                    end.textContent = fancyTimeFormat(selectTime);
                }
            }
            else if(videoBarModify){
                progressBarUpdate();
                updateFrame(event);
            }
        break;
        case('mouseup'):
        case('mouseout'):
            barModifyFirst = false;
            barModifySecond = false;
            videoBarModify = false;
        break;
    }
}

$(localAnnoCheck).on('click',function(){
    if(allowForeignLocalAnno){
        allowForeignLocalAnno = false;
        manageContextButtons();
        $(localAnnoCheck).find("i").text('clear');
        $(localAnnoCheck).parent().find("p").text("I don't want to see other's annotations");
        $.get("getJsonVideoAnnotations/",{video_id: videoId,username: username},
            function(data){
                userAnnotations = JSON.parse(data);
            }
        );
    }
    else{
        allowForeignLocalAnno = true;
        $(localAnnoCheck).find("i").text('check');
        $(localAnnoCheck).parent().find("p").text("I want to see other's annotations");
        $.get("getJsonVideoAnnotations/",{video_id: videoId,username: ""},
            function(data){
                userAnnotations = JSON.parse(data);
                manageContextButtons();
            }
        );
    }
})

function updateLocalAnnotation(id){
    var currentAnno = getAnnoFromId(id)
    if(currentAnno != null){
        localAnnoText.textContent = currentAnno.fields.tag;
        localAnnoUser.textContent = currentAnno.fields.username;
        localAnnoDate.textContent = currentAnno.fields.date.substr(0,10);
        localAnnoTime.textContent = currentAnno.fields.date.substr(11,8);
    }
}

function removeLocalAnnotation(){
    localAnnoText.textContent = "";
    localAnnoUser.textContent = "";
    localAnnoDate.textContent = "";
    localAnnoTime.textContent = "";
}

function startEditColor(circle){
    pause();
    if(!isEditingColor){
        isEditingColor = true;
        currentPointEdit = circle;
        $('<div id="picker"></div>').appendTo($('.picker-form'));
        $('#picker').farbtastic(circle);
        $('#picker').velocity("transition.perspectiveRightIn",{ duration:500})
        rgb = $(circle).css("background-color");
        $.farbtastic('#picker').setColor(rgb2hex(rgb));
    }
}

function rgb2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
   

function sendColorCircleModify(){
    isEditingColor = false;
    var punctualAnno = $(currentPointEdit).closest(".punctual-anno");
    var id = $(punctualAnno).attr("id").replace("punctual-anno-", "");
    $("#contextual-buttons-"+id).find(".circle-annotation").css({"border": "2px solid black"})
    var color = $(currentPointEdit).css("background-color");
    var tag = $(punctualAnno).find(".punctual-anno-content").text();
    var currentAnno = getAnnoFromId(id);
    var wantedAnno = findCorrespondingFrameAnno(id);
    currentAnno.fields.tag = tag;
    var annotation = {
        type:currentAnno.fields.type,
        color: color,
        tag: tag,
        frame:wantedAnno.fields.frame,
        firstTime: currentAnno.fields.firstTime,
        secondTime: currentAnno.fields.secondTime,
        firstX: wantedAnno.fields.firstPointX,
        firstY: wantedAnno.fields.firstPointY,
        deltaX: wantedAnno.fields.deltaX,
        deltaY: wantedAnno.fields.deltaY,
        reminderX: wantedAnno.fields.reminderX,
        reminderY: wantedAnno.fields.reminderY,
    }
    $.ajax({
        type: 'GET',
        url:'modifyAnnotation/',
        async:false,
        data:{
            annotation: JSON.stringify(annotation),
            video_id: videoId,
            username: username,
            id: id
        },
        success:function(data){
            userAnnotations = JSON.parse(data);
            var target = $(document).find("#contextual-buttons-" + id);
            $(target).remove();
        }
    })
    currentPointEdit = null;
    $('#picker').velocity("transition.perspectiveRightOut",{ duration:500})
    $('#picker').remove();
}


function checkPermits(){
    return (video_is_global || (uploader_user_id == logged_user_id));
}













$(function(){
    $.get('getElementTaxonomy', {
        video_id: videoId
    }, function (data) {
        fitTaxonomy(data)
        console.log(taxonomy)
        createJSTree(taxonomy);
    })
})

function fitTaxonomy(data) {
    var taxData = JSON.parse(data)
    console.log(taxData)
    taxonomy = [];
    for(i = 0; i<taxData.length; i++){
        taxonomy.push({"id":(taxData[i].pk).toString(), "parent":taxData[i].fields.parent, "text":taxData[i].fields.text})
    }
    console.log(taxonomy)
    if(tip.length == 0){
        setTip();
    }
}

function setTip() {
    for(i = 0; i < taxonomy.length ; i++){
        tip.push(taxonomy[i].text);
    }
    console.log(tip)
}


function createJSTree(taxData) {
    $('#taxonomy').jstree({
        'core': {
            "check_callback": true,
            'data': taxData
        },
        "plugins": ["wholerow", "dnd", "contextmenu", "search", "unique", "sort", "types"],
        "search": {
            "case_sensitive": false,
            "show_only_matches": true
        },
        "types": {
            "default": {
                "icon": false
            }
        },
        
        "contextmenu": {
            "items": function ($node) {
            var tree = $("#taxonomy").jstree(true);
            
            //questi sotto i bottoni del menù che si apre cliccando col tasto dx su un elemento di tassonomia 
            //da integrare queste funzioni con django
            return {
                "Create": {
                    "separator_before": false,
                    "separator_after": false,
                    "label": "Create",
                    "action": function () {
                        var parentId = $node.id;
                        createEl(parentId);
                    }
                },
                "Rename": {
                    "separator_before": false,
                    "separator_after": false,
                    "label": "Rename",
                    "action": function () {
                        tree.edit($node, null, function (node, status) {
                            console.log("old name: " + node.original.text);
                            console.log("new: " + node.text);
                            console.log(arguments);
                            var index = tip.indexOf(node.original.text);
                            var nodeId = $node.id;;
                            $.get('modifyElementTaxonomy', {
                                video_id: videoId,
                                id: nodeId,
                                text: node.text, 
                            }, function (data) {
                                fitTaxonomy(data)
                                if (index > -1) {
                                    tip.splice(index, 1);
                                }
                                tip.push(node.text);
                            })
                        });
                    }
                },
                "Remove": {
                    "separator_before": false,
                    "separator_after": false,
                    "label": "Remove",
                    "action": function () {
                        var nodeId = $node.id;
                        var index = tip.indexOf($node.text);
                        deleteChildrenTaxEl(nodeId)
                        $.get('deleteElementTaxonomy', {
                            video_id: videoId,
                            id: nodeId,
                        }, function (data) {
                            fitTaxonomy(data)
                            if (index > -1) {
                                tip.splice(index, 1);
                            }
                        })
                        tree.delete_node($node);
                    }
                }
            };
            }
        }
    });
}


function deleteChildrenTaxEl(id){
    for(i=0; i<taxonomy.length; i++){
        if(taxonomy[i].parent == id){
            $.get('deleteElementTaxonomy', {
                video_id: videoId,
                id: taxonomy[i].id,
            }, function (data) {
                var index = tip.indexOf(taxonomy[i].text);
                fitTaxonomy(data)
                if (index > -1) {
                    tip.splice(index, 1);
                }
            })
            deleteChildrenTaxEl(taxonomy[i].id);
        }        
    }
}
  //quelsta è la riga per cercare gli elementi dentro la tassonomia, si può levare oppure va integrata con django
$(".search-taxonomy").keyup(function () {
    var search = $(this).val();
    $('#taxonomy').jstree('search', search);
});

function searchLastTax(){
    var maxId = 0;
    var lastAdd = null;
    for(i= taxonomy.length -1; i>=0; i--){
        if(maxId < parseInt(taxonomy[i].id)){
            maxId = parseInt(taxonomy[i].id);
            lastAdd = taxonomy[i];
        }
    }
    return lastAdd;
}
  //questo è il bottone create e anche qui si dovrà richiamre delle funzioni che accedono alla tabella di django
function createEl(parentId = null,text = null) {
    if(parentId == null){
        var parent = '#';
    }
    else{
        var parent = parentId;
    }
    if(text == null){
        var text = 'New node';
    }
    console.log(parent)
    $node = $('#taxonomy').jstree(true).create_node(parent, {
        text: text,
        type: 'default'
    });
    var i = 0;
    while(i < taxonomy.length && !$node){
        if(taxonomy[i].text == text){
            $node = false;
        }
        i++;
    }
    if($node != false){
        $('#taxonomy').jstree(true).deselect_all();
        $('#taxonomy').jstree(true).select_node($node);
        console.log($("#taxonomy").jstree('get_selected', true));
        if($("#taxonomy").jstree('get_selected', true).length != 0){
            var text = $("#taxonomy").jstree('get_selected', true)[0].text
            $.get('insertElementTaxonomy', {
                video_id: videoId,
                parent: parent,
                text: text,
            }, function (data) {
                fitTaxonomy(data)
                console.log(taxonomy.length)
                var id = searchLastTax().id;
                console.log(id)
                $('#taxonomy').jstree(true).set_id($node,id)
                tip.push(text);
                Swal.fire({
                    type: "success",
                    title: "Added",
                    text: "Added correctly!", 
                });
            }) 

        }
    }
    else{
        Swal.fire({
            type: 'warning',
            title: 'Cannot do it',
            text: 'You have to rename '+ text +' if you want to create a new element',
            confirmButtonText: 'Got it!'
        })
    }
}

createTaxEl.addEventListener('click', function(){
    createEl();
});

//stessa quastione per rename e delete 
// in inputoptions bisogna fare il collegamento con gli elementi salvati nella tabella della tassonomia su django
function renameEl() {
    var options = {}
    $.map(taxonomy,
        function(o) {
            options[o.id.toString()] = o.text;
    });
    var id;
    Swal.fire({
        title: 'Rename',
        text: "Select the item that you want to rename:",
        input: 'select',
        inputOptions: options,
        inputPlaceholder: 'Select an element',
        showCancelButton: true,
        inputValidator: function (value) {
            return new Promise(function (resolve) {
                if (value !== '') {
                    resolve();
                } else {
                    resolve('You need to select an item');
                }
            });
        }
    }).then(function (result) {
        if (result.value) {
            id = result.value;
            console.log(id,result)
            Swal.fire({
                title: 'Write the new name of the element',
                input: 'text',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to write something!'
                    }
                }
            }).then(function (result) {
                console.log(result,id)
                $.get('modifyElementTaxonomy', {
                    video_id: videoId,
                    id: id,
                    text: result.value,
                }, function (data) {
                    fitTaxonomy(data)
                    var node = $('#taxonomy').jstree(true).get_node("#"+id)
                    $('#taxonomy').jstree(true).rename_node(node,result.value);
                    Swal.fire({
                        type: 'success',
                        text: 'You modified correctly: ' + result.value
                    });
                })
            });
        }
    });
}

renameTaxEl.addEventListener('click', renameEl);

function deleteEl() {
    var options = {}
    $.map(taxonomy,
        function(o) {
            options[o.id.toString()] = o.text;
    });
    Swal.fire({
        title: 'Delete',
        text: "Select the item that you want to delete:",
        input: 'select',
        inputOptions: options,
        inputPlaceholder: 'Select an element',
        showCancelButton: true,
        inputValidator: function (value) {
            return new Promise(function (resolve) {
                if (value !== '') {
                    resolve();
                } else {
                    resolve('You need to select an item');
                }
            });
        }
    }).then(function (result) {
        if (result.value) {
            deleteChildrenTaxEl(result.value)
            var i = 0;
            while(i < taxonomy.length && result.value != taxonomy[i].id){
                console.log(result.value,taxonomy[i].id)
                i++;
            }
            var text = taxonomy[i].text;
            $.get('deleteElementTaxonomy', {
                id: result.value,
                video_id: videoId,
            }, function (data) {
                fitTaxonomy(data);
                console.log($("#"+result.value), $("#taxonomy"))
                var node = $('#taxonomy').jstree(true).get_node("#"+result.value)
                $('#taxonomy').jstree(true).delete_node(node);
                Swal.fire({
                    type: 'success',
                    text: 'You have deleted: ' + text,
                });
            })
        }
    });
}

deleteTaxEl.addEventListener('click', deleteEl);



$(document).on('dnd_stop.vakata',function(e, data) {
    console.log(data)
    var id = data.data.nodes[0];
    console.log($('#taxonomy').jstree(true).get_node(data.element).parent)
    if(data.event.target.parentNode.id != "target"){
        if($('#taxonomy').jstree(true).get_node(data.element).parent != undefined )
            var newParent = $('#taxonomy').jstree(true).get_node(data.element).parent;
            
        else
            var newParent = data.event.target.parentNode.id;
        console.log(id,newParent)
        $.get('modifyElementTaxonomy', {
            video_id: videoId,
            id: id,
            parent: newParent 
        }, function (data) {
            fitTaxonomy(data)
        })
    }
})



function addToTaxonomy(text){
    var i = 0;
    var found = false;
    while(i<taxonomy.length && !found){
        if(taxonomy[i].text == text){found = true;}
        i++;
    }
    if(!found){
        Swal.fire({
            title: "Add to taxonomy",
            text: "Do you want to add the tag to taxonomy?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        })
        .then((result) => {
            console.log(result);
            if (result.value) {
                createEl("#",text);
            }
        });
    }
    
}
















//function that converts a time expressed in seconds in one expressed in hours:mins:secs
function fancyTimeFormat(time){
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

//function that converts a time expressed in hours:mins:secs in one expressed in seconds
function convert(input) {
    var parts = input.split(':'),
        minutes = +parts[0],
        seconds = +parts[1];
    return (minutes * 60 + seconds);
}

//general function to make an object disappear
function disappear(object){
    object.style.cssText="display: none; opacity:0";
    //$(object).delay(400).velocity("transition.flipYOut",{ duration:200});
}



$(window).resize(function() {
    videoHeightCalculate();
});

playButton.addEventListener('click',play);
pauseButton.addEventListener('click',pause);
progressBar.addEventListener('click', progressBarUpdate);
//video.addEventListener('timeupdate', manageContextButtons);
rightFrameSelector.addEventListener('click',updateFrame);
leftFrameSelector.addEventListener('click',updateFrame);
document.addEventListener('mouseover',function(e){
    if(e.target && !crossTraslate && $(event.target).parent(".contextual-buttons").length == 1 || 
                                     $(event.target).attr('class') == 'contextual-buttons'){
        hoverContButtons(e, e.target);
    }
});
$(document).mouseout(function(e){
    if(e.target){
        hoverContButtons(e, e.target);
    }
});
annotationButton.addEventListener('click',createAnnotation);
circleAnnotation.addEventListener('click',createCircleAnnotation);
//functions for the anno-rectangle creation
video.addEventListener('mousedown',trackPosition);
video.addEventListener('mousemove',trackPosition);
video.addEventListener('mouseup',trackPosition);
video.addEventListener('mouseout',trackPosition);
//functions for the anno-rectangle modify
document.addEventListener('mousedown',trackPosition);
document.addEventListener('mousemove',trackPosition);
document.addEventListener('mouseup',trackPosition);
activeModeRectangle.addEventListener('click',finishAnnotation);
exitActiveModeRectangle.addEventListener('click',exitFromAnno);
//functions to make contextual buttons, start and end time clickable
$(document).click(function(){
    
    if($(event.target).is(".annotation-tag.shadow-apply.rounded.text-nowrap") && $(document).find("#double-rectangle-icon").length == 0){
        var contextualButtons = $(event.target).parent();
        var id = getContButtonsId(contextualButtons);
        var currentAnno = getAnnoContButtons(contextualButtons);
        if(currentAnno.fields.user == logged_user_id){
            $(contextualButtons).prepend('<div class="rectangle-moving-icons fa-2x" id="rectangle-moving-icons-">' + 
                                        '<div class="fas fa-arrows-alt white-icon" id="double-rectangle-icon"></div>'+
                                        '</div>');
            updateLocalAnnotation(id);
        }
        else{
            alertOtherUserAnnotation();
        }
    }
    else if($(event.target).is(".active-mode")){
        var contextualButtons = $(event.target).parent()[0];
        var id = getContButtonsId(contextualButtons)
        var currentAnno = getAnnoContButtons(contextualButtons);
        if(currentAnno.fields.user == logged_user_id){
            keepAnnotating = false;
            console.log(id)
            createActiveModeInterface(event);
        }
        else{
            alertOtherUserAnnotation();
        }
        
    }
    else if($(event.target).is(".exit-active-mode")){
        var contextualButtons = $(event.target).parent()[0];
        var id = getContButtonsId(contextualButtons)
        var currentAnno = getAnnoContButtons(contextualButtons);
        if(currentAnno.fields.user == logged_user_id){
            keepAnnotating = false;
            deleteContextButton(event);
            removeLocalAnnotation();
        }
        else{
            alertOtherUserAnnotation();
        }
    }
    else if($(event.target).is(".start-time")){
        var start = document.querySelector('.start-time');
        previousStartValue = convert(start.textContent);
    }
    else if($(event.target).is(".end-time")){
        var end = document.querySelector('.end-time');
        previousEndValue = convert(end.textContent);
    }
    else if($(event.target).is(".color-circle")){
        var punctualAnno = $(event.target).closest(".punctual-anno");
        var id = $(punctualAnno).attr("id").replace("punctual-anno-", "");
        var i = 0;
        var currentAnno = null;
        while(i < userAnnotations.length && currentAnno == null){
            if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
                currentAnno = userAnnotations[i];
            }
            i++;
        }
        if(currentAnno.fields.user == logged_user_id){
            startEditColor(event.target);
            $("#contextual-buttons-"+id).find(".circle-annotation").css({"border": "2px solid white"})
        }
        else{
            alertOtherUserAnnotation();
        }
    }
    else if($(event.target).is(".punctual-anno-content")){
        pause();
    }
    else if($(event.target).is(".delete-punctual-anno")){
        var punctualAnno = $(event.target).closest(".punctual-anno");
        var id = $(punctualAnno).attr("id").replace("punctual-anno-", "");
        console.log(id)
        var i = 0;
        var currentAnno = null;
        while(i < userAnnotations.length && currentAnno == null){
            if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
                currentAnno = userAnnotations[i];
            }
            i++;
        }
        if(currentAnno.fields.user == logged_user_id){
            deleteAnnotation(id);
            var contextualButtons = $(document).find("#contextual-buttons-"+id);
            $(contextualButtons).remove();
            $(punctualAnno).remove();
        }
        else{
            alertOtherUserAnnotation();
        }
    }
    else if($(event.target).is("#left-frame-annotation")){
        keepAnnotating = true;
        finishAnnotation();
        updateFrame(event);
    }
    else if($(event.target).is("#right-frame-annotation")){
        keepAnnotating = true;
        finishAnnotation();
        updateFrame(event);
    }
    if(!$(event.target).is(".color-circle") && !$(event.target).closest(".farbtastic").length == 1 && isEditingColor){
        sendColorCircleModify();
    }
    if((isAnnotating || isCircleAnnotation)&& $(event.target).closest(".left-body-content").length == 0){
        isAnnotating = false;
        isCircleAnnotation = false;
        $(circleAnnotation).removeClass("font-awes-button-clicked");
        $(annotationButton).removeClass("font-awes-button-clicked");
        disappear(progressBarSelect);
    }
});

$(document).on('keydown',function(event){
    
    if(($(event.target).attr('class') == "annotation-tag shadow-apply rounded text-nowrap" || 
        $(event.target).attr('class') == "annotation-tag shadow rounded bg-white text-nowrap" ||
        $(event.target).attr('class') == "punctual-anno-content mr-2 text-nowrap")){
        var target = event.target;
        console.log(target)
        if($(target).hasClass("annotation-tag shadow-apply rounded text-nowrap")){
            var contextualButtons = $(event.target).parent();
            var id = getContButtonsId(contextualButtons);
            var currentAnno = getAnnoContButtons(contextualButtons);
        }
        else if($(target).hasClass("annotation-tag shadow rounded bg-white text-nowrap")){
            if($(document).find(".rectangle-moving-icons").length != 0){
                var id = $(".rectangle-moving-icons").attr("id").replace("rectangle-moving-icons-", "");
            }
            else{
                var id = $(".circle-moving-icons").attr("id").replace("circle-moving-icons-", "");
            }
            if(id == ""){
                recreateInterface(event);
            }
            var i = 0;
            var currentAnno = null;
            while(i < userAnnotations.length && currentAnno == null){
                if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
                    currentAnno = userAnnotations[i];
                }
                i++;
            }
        }
        else if($(target).hasClass("punctual-anno-content")){
            var punctualAnno = $(event.target).closest(".punctual-anno");
            var id = $(punctualAnno).attr("id").replace("punctual-anno-", "");
            var i = 0;
            var currentAnno = null;
            while(i < userAnnotations.length && currentAnno == null){
                if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
                    currentAnno = userAnnotations[i];
                }
                i++;
            }
        }
        if(currentAnno.fields.user == logged_user_id){
            if(event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13){
                setTimeout(function(){
                    autocomplete(target);
                }, 20)}
            else{
                var x = document.getElementById($(event.target).attr('class') + "autocomplete-list");
                if (x) x = x.getElementsByTagName("div");
                if (event.keyCode == 40) {
                    event.preventDefault();
                    currentFocus++;
                    addActive(x);
                } else if (event.keyCode == 38) {
                    event.preventDefault();
                    currentFocus--;
                    addActive(x);
                } else if (event.keyCode == 13) {
                    event.preventDefault();
                    if (currentFocus > -1) {
                        if (x) {
                            $(target).text(x[currentFocus].getElementsByTagName("input")[0].value);
                            modifyAnnoDataBase(target,event);
                            closeAllLists(target)
                            addToTaxonomy($(target).text());
                            currentFocus = -1;
                        }
                    }
                    else{
                        if($(event.target).is(".annotation-tag.shadow-apply.rounded.text-nowrap")){
                            var arrowRect = $(document).find(".rectangle-moving-icons");
                            arrowRect.remove();
                            sendContextButtonsModify(event);
                            removeLocalAnnotation();
                            addToTaxonomy($(event.target).text());
                        }
                        else if($(event.target).is(".punctual-anno-content")){
                            currentPointEdit = $(event.target).parent().find(".color-circle");
                            sendColorCircleModify();
                            var text = $(event.target).text();
                            addToTaxonomy(text);
                            var counter = countPunctualTag(text);
                            $(".punctual-anno.rounded").each(function(){
                                if($(this).find(".punctual-anno-content").text() == text){
                                    $(this).find(".punctual-anno-counter").text(counter);
                                }
                            });
                            
                        }
                    }
                }
            }
        }
        else{
            alertOtherUserAnnotation();
        }
        
    }
    else if(event.keyCode == 13 ){        
        event.preventDefault();
        
        if($(event.target).is(".start-time")){
            exitEditStart();
        }
        else if($(event.target).is(".end-time")){
            exitEditEnd();
        } 
    }
});


function alertAnnotation(){
    Swal.fire({
        type: 'warning',
        title: 'Cannot do it',
        text: 'The uploader user has locked up the video',
        confirmButtonText: 'Got it!'
    })
}

function alertOtherUserAnnotation(){
    Swal.fire({
        type: 'warning',
        title: 'Cannot do it',
        text: 'This annotation is created by another user',
        confirmButtonText: 'Got it!'
    })
}

function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    $(x[currentFocus]).addClass("autocomplete-active rounded");
}

function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
        $(x[i]).removeClass("autocomplete-active rounded");
    }
}

function closeAllLists(inp,elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

function modifyAnnoDataBase(inp,e){
    var x = document.getElementsByClassName("autocomplete-items");
    if(x.length != 0){
        x = x[0];
        var target = null;
        var id = "";
        switch(x.id){
            case("punctual-anno-content mr-2 text-nowrapautocomplete-list"): 
                id = $(x.parentNode).attr("id").replace("punctual-anno-", "");
                target = $($(x).parent()).find(".punctual-anno-content");
            break;
            case("annotation-tag shadow-apply rounded text-nowrapautocomplete-list"):
                id = $(x.parentNode).attr("id").replace("contextual-buttons-", "");
                target = $(x).parent().find(".annotation-tag");
            break;
            case("annotation-tag shadow rounded bg-white text-nowrapautocomplete-list"):
            break;
        }
        closeAllLists(inp,e.target);
        if(id!=""){
            var currentAnno = getAnnoFromId(id);
            var wantedAnno = findCorrespondingFrameAnno(id);
            currentAnno.fields.tag = target.text();
            var annotation = {
                type:currentAnno.fields.type,
                color: currentAnno.fields.color,
                tag: currentAnno.fields.tag,
                firstTime: currentAnno.fields.firstTime,
                secondTime: currentAnno.fields.secondTime,
                frame:wantedAnno.fields.frame,
                firstX: wantedAnno.fields.firstPointX,
                firstY: wantedAnno.fields.firstPointY,
                deltaX: wantedAnno.fields.deltaX,
                deltaY: wantedAnno.fields.deltaY,
                reminderX: wantedAnno.fields.reminderX,
                reminderY: wantedAnno.fields.reminderY
            }
            $.get('modifyAnnotation',{
                annotation: JSON.stringify(annotation),
                video_id: videoId,
                username: username,
                id: id
            },function(data){
                userAnnotations = JSON.parse(data);
                console.log(userAnnotations)
            })
        }
    }
}

function autocomplete(inp) {
    var a, b, i, val = $(inp).text();
    closeAllLists(inp);
    if (!val) {
        return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", $(inp).attr('class') + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items rounded shadow-apply");
    inp.parentNode.appendChild(a);
    for (i = 0; i < tip.length; i++) {
        if (tip[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("div");
            b.setAttribute("class", "text-nowrap ")
            b.innerHTML = "<strong>" + tip[i].substr(0, val.length) + "</strong>";
            b.innerHTML += tip[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + tip[i] + "'>";
            b.addEventListener("click", function (e) {
                $(inp).text(this.getElementsByTagName("input")[0].value);
                modifyAnnoDataBase(inp,e);
                closeAllLists(inp);
            });
            a.appendChild(b);
        }
    }
   
    document.addEventListener("click", function (e) {
        modifyAnnoDataBase(inp,e);
    });
}






progressCursor.ondragstart = function() {
    return false;
};
startTopCursor.ondragstart = function() {
    return false;
};
endTopCursor.ondragstart = function() {
    return false;
};
progressBarContainer.addEventListener('mousedown',moveProgress);
progressBarContainer.addEventListener('mousemove',moveProgress);
progressBarContainer.addEventListener('mouseup',moveProgress);
//functions to modify start and end time by the surrourndig chevrons
leftChevronStart.addEventListener('click',function(){
    var start = document.querySelector('.start-time');
    var current = convert(start.textContent);
    if(current > 0){
        current--;
        selectedProgressBarLeftUpdate(current);
        video.currentTime = current;
        updateCursor();
        start.textContent = fancyTimeFormat(current);
    }
});

rightChevronStart.addEventListener('click',function(){
    var start = document.querySelector('.start-time');
    var end = document.querySelector('.end-time');
    var current = convert(start.textContent);
    if(current < videoLength && current < convert(end.textContent)){
        if(checkBounds(current, 1)){
            current++;
            selectedProgressBarLeftUpdate(current);
            video.currentTime = current;
            updateCursor();
            start.textContent = fancyTimeFormat(current);
        }
        else{
            alertAnnoIsThere()
        }
        
    }
});
leftChevronEnd.addEventListener('click',function(){
    var start = document.querySelector('.start-time');
    var end = document.querySelector('.end-time');
    var current = convert(end.textContent);
    if(current > 0 && current > convert(start.textContent)){
        if(checkBounds(current, -1)){
            current--;
            selectedProgressBarRightUpdate(current);
            video.currentTime = current;
            updateCursor();
            end.textContent = fancyTimeFormat(current);
        }
        else{
            alertAnnoIsThere()
        }
        
    }
});
rightChevronEnd.addEventListener('click',function(){
    var end = document.querySelector('.end-time');
    var current = convert(end.textContent);
    if(current < videoLength - 1){
        current++;
        selectedProgressBarRightUpdate(current);
        video.currentTime = current;
        updateCursor();
        end.textContent = fancyTimeFormat(current);
    }  
});

function checkBounds(current,add){
    console.log(current*frameRate,current,frameRate)
    if(add < 0){
        var bound2 = current*frameRate;
        var bound1 = (current+add)*frameRate;
    }
    else{
        var bound1 = current*frameRate;
        var bound2 = (current+add)*frameRate;
    }
    
    if($(document).find(".rectangle-moving-icons").length != 0){
        var id = $(".rectangle-moving-icons").attr("id").replace("rectangle-moving-icons-", "");
    }
    else{
        var id = $(".circle-moving-icons").attr("id").replace("circle-moving-icons-", "");
    }
    if(id == ""){
        recreateInterface(event);
        if($(document).find(".rectangle-moving-icons").length != 0){
            var id = $(".rectangle-moving-icons").attr("id").replace("rectangle-moving-icons-", "");
        }
        else{
            var id = $(".circle-moving-icons").attr("id").replace("circle-moving-icons-", "");
        }
    }
    var i = 0;
    var currentAnno = null;
    while(i < userAnnotations.length && currentAnno == null){
        if(userAnnotations[i].pk == id && userAnnotations[i].model == "fileManager.annotationvideo" ){
            currentAnno = userAnnotations[i];
        }
        i++;
    }
    var i = 0;
    while(i<userAnnotations.length){
        if(userAnnotations[i].model == "fileManager.framelevelannotation" && userAnnotations[i].fields.annotationVideo == id &&
            userAnnotations[i].fields.frame < bound2 && userAnnotations[i].fields.frame > bound1){return false}
        i++;
    }
    return true
}

function alertAnnoIsThere(){
    Swal.fire({
        type: 'warning',
        title: 'Cannot do it',
        text: 'There is at least an annotation in the bounds that you want to change',
        confirmButtonText: 'Got it!'
    })
}

//cambio di frame per la gestione della creazione delle global annotation
//Global annotation increment and decrement frame
    //fist frame
    $("#left-button-global-anno-frame-id").click(function(){
        var firstFrame=$("#globa_anno_first_time_id")[0].value
        console.log(firstFrame)
        if(parseInt(firstFrame)>0){
            firstFrame=parseInt(firstFrame)-1;

            currentFrame = parseInt(firstFrame);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
        $("#globa_anno_first_time_id")[0].value= firstFrame;
    });
    $("#right-button-global-anno-frame-id").click(function(){
        var firstFrame=$("#globa_anno_first_time_id")[0].value

        secondFrame=$("#globa_anno_second_time_id")[0].value
        console.log(firstFrame)
        console.log(secondFrame)
        if(parseInt(firstFrame) < parseInt(secondFrame)){
            firstFrame = parseInt(firstFrame)+1;

            currentFrame = parseInt(firstFrame);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
        $("#globa_anno_first_time_id")[0].value= firstFrame;

    });
    //second Frame
    $("#second-left-button-global-anno-frame-id").click(function(){
        var secondFrame=$("#globa_anno_second_time_id")[0].value
        console.log(secondFrame)
        firstFrame=$("#globa_anno_first_time_id")[0].value;
        if(secondFrame>0 && parseInt(secondFrame)>parseInt(firstFrame)){
            secondFrame=parseInt(secondFrame)-1;

            currentFrame = parseInt(secondFrame);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
        $("#globa_anno_second_time_id")[0].value= secondFrame;

    });
    $("#second-right-button-global-anno-frame-id").click(function(){
        var secondFrame=$("#globa_anno_second_time_id")[0].value
        console.log($("#globa_anno_second_time_id"))
        console.log($("#globa_anno_second_time_id").first())
        console.log(secondFrame);
        if (true){//TODO sistemare l'errore di split, non capisce la durata del video
            secondFrame = parseInt(secondFrame)+1;

            currentFrame = parseInt(secondFrame);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
        $("#globa_anno_second_time_id")[0].value=secondFrame;
    });
    //Modifica Global Annotation buttons
    //left button first frame
    $(document).on("click", ".first-left-button-modify-global-anno" , function(e) {
        var value=$(this).attr("modify-identifier-first");
        firstFrameTag= $("[modify-identifier-first-input="+value+"]");
        firstFrameValue=firstFrameTag.attr("value")
        firstFrameValue=parseInt(firstFrameValue)
        if(firstFrameValue>0){
            firstFrameValue=firstFrameValue-1
            firstFrameTag[0].value= firstFrameValue
            firstFrameTag.attr("value",firstFrameValue)

            currentFrame = parseInt(firstFrameValue);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
    });
    //right button first frame
    $(document).on("click", ".first-right-button-modify-global-anno" , function(e) {
        var value=$(this).attr("modify-identifier-first");
        firstFrameTag= $("[modify-identifier-first-input="+ value +"]");
        firstFrameValue=firstFrameTag.attr("value")
        firstFrameValue=parseInt(firstFrameValue)
        secondFrameTag= $("[modify-identifier-second-input="+ value +"]");
        secondFrameValue=secondFrameTag.attr("value")
        secondFrameValue=parseInt(secondFrameValue)
        if(firstFrameValue<secondFrameValue){
            firstFrameValue=firstFrameValue+1
            firstFrameTag[0].value= firstFrameValue
            firstFrameTag.attr("value",firstFrameValue)

            currentFrame = parseInt(firstFrameValue);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
    });
    //left button second frame
    $(document).on("click", ".second-left-button-modify-global-anno" , function(e) {
        var value=$(this).attr("modify-identifier-second");
        firstFrameTag= $("[modify-identifier-first-input="+ value +"]");
        firstFrameValue=firstFrameTag.attr("value")
        firstFrameValue=parseInt(firstFrameValue)
        secondFrameTag= $("[modify-identifier-second-input="+ value +"]");
        secondFrameValue=secondFrameTag.attr("value")
        secondFrameValue=parseInt(secondFrameValue)
        if(secondFrameValue>0 && secondFrameValue>firstFrameValue){
            secondFrameValue=secondFrameValue-1
            secondFrameTag[0].value=secondFrameValue
            secondFrameTag.attr("value",secondFrameValue)

            currentFrame = parseInt(secondFrameValue);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
    });
    $(document).on("click", ".second-right-button-modify-global-anno" , function(e) {
        var value=$(this).attr("modify-identifier-second");
        firstFrameTag= $("[modify-identifier-first-input="+ value +"]");
        firstFrameValue=firstFrameTag.attr("value")
        firstFrameValue=parseInt(firstFrameValue)
        secondFrameTag= $("[modify-identifier-second-input="+ value +"]");
        secondFrameValue=secondFrameTag.attr("value")
        secondFrameValue=parseInt(secondFrameValue)
        if(secondFrameValue<parseInt(videoLength)*frameRate || true){//TODO sistemare l'errore di split  non capisce la durata del video
            secondFrameValue=secondFrameValue+1
            secondFrameTag[0].value=secondFrameValue
            secondFrameTag.attr("value",secondFrameValue)

            currentFrame = parseInt(secondFrameValue);
            video.currentTime = currentFrame * timePerFrame;
            updateCursor();
        }
    });
    //sincronize the seen value "value" of the input with the unseen value "value"
    $(document).on("input", ".input-global-anno-modify-second", function(e){
         var value2=$(this)[0].value;
         $(this).attr("value", value2);
    });
    $(document).on("input", ".input-global-anno-modify-first", function(e){
         var value2=$(this)[0].value;
         $(this).attr("value", value2);
    });
});