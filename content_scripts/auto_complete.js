var autoComplete = (function(){    

    var cc_id = 'caret_span';

    var shortcuts = ['TAB','F2','F3','F4','F5'];
    var shortcutKeyCodeSet = {
        9 : 0,
        112 : 0,
        113 : 1,
        114 : 2,
        115 : 3,
        116 : 4
    }
    
    function getAutoCompleteArray(curWord,size)
    {
        var curAlias = EmoteAutoCompleteTable[curWord];
        var curEmotes = new Array();
    
        if(curAlias != null)
        {
            for(var i = 0 ; i < curAlias.length && i < size ; i ++)
            {
                curEmotes.push( EmoteInfoList[curAlias[i]['id']] );
            }
            return curEmotes
        }
        else{
            return null;
        }
    }
    
    function getPositionOfRecommendList(textPoint)
    {
        return [0,0];
    }

    function createShortcutSpan(index){

        var shortcutSpan = document.createElement('span');

        if( index < shortcuts.length){
            if(shortcuts[index] != -1){
                shortcutSpan.appendChild(createKeySpan(shortcuts[index]));
            }
        }

        return shortcutSpan;
    }

    function createKeySpan(keyStr){

        var keyDiv = document.createElement('div');
        keyDiv.classList.add('shortcut-key');
        keyDiv.innerHTML = "<span class='shortcut-key-span'>" + keyStr + "</span>";

        return keyDiv;
    }
    
    //emote 추천을 위한 변수들
    
    var emoteRecommendDiv = null; 
    var emoteRecommendTargetSpan = null; //이모티콘 영문 이름을 바뀔 스판
    var recommendEmoteList = null;
    var recommendDomList = [];
    
    function appendEmoteRecommendList(curEmotes, x)
    {
        if(newChat.chat_input == null){
            return null;
        }
    
        deleteEmoteRecomendList();
    
        var width, height;
    
        [width,height] = [x,0];
    
        emoteRecommendDiv = document.createElement('div');
        emoteRecommendDiv.setAttribute('class','emoteRecommendDiv');
        emoteRecommendDiv.id = 'emote-recommend-list';
    
        var emoteListDiv = document.createElement('div');
    
        recommendEmoteList = [];
        recommendDomList = [];

        for(var i = 0 ; i < curEmotes.length && i < 5 ; i ++){
            var curEmoteImg = document.createElement('img');
            curEmoteImg.setAttribute('class', 'recommend-emote');
            curEmoteImg.setAttribute('src',curEmotes[i]['url']);
    

            var curEmote = curEmotes[i];
            recommendEmoteList.push(curEmote);
            curEmoteImg.setAttribute('emote-name', curEmote['regex']);

            (function(curEmote){
                curEmoteImg.addEventListener('click', function(event){
                    replaceEmote(curEmote);
                });
            })(curEmote);     
    
            var shortcutSpan = createShortcutSpan(i);
            shortcutSpan.classList.add('recommend-emote-span');

            var imgSpan = document.createElement('span');
            imgSpan.setAttribute('class','recommend-emote__image');
            imgSpan.appendChild(curEmoteImg);
            shortcutSpan.appendChild(imgSpan);

            emoteListDiv.appendChild(shortcutSpan);

            recommendDomList.push(shortcutSpan);
        }
    
        emoteRecommendDiv.appendChild(emoteListDiv);
        emoteListDiv.setAttribute('class','emote-list-div');
        emoteListDiv.classList.add('nc-balloon2');
        emoteRecommendDiv.setAttribute('style','position : absolute; left : ' + width + 'px; top :' + (height -80) + 'px;');

        
        newChat.chat_input_container.appendChild(emoteRecommendDiv);
        
        return emoteRecommendDiv;
    }
    
    function replaceEmote(curEmote){

        var startindex, endindex ,text;
        text = newChat.chat_input.innerText;
        [startindex,endindex] = parseChatInput();

        newChat.chat_input.innerHTML = '';
        newChat.chat_input.innerText = text.substring(0,startindex);
        var caret_span =document.createElement('span');

        newChat.chat_input.innerHTML += curEmote.regex + '&nbsp;';

        caret_span.id = cc_id;

        caret_span.innerText = text.substring(endindex, text.length);
        newChat.chat_input.innerHTML += caret_span.innerHTML;
        caret_span.innerHTML = '';

        var el = newChat.chat_input;
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0], startindex + curEmote.regex.length + 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    
    function deleteEmoteRecomendList()
    {
        if(recommendDomList != null){
            recommendDomList = null;
        }

        if(emoteRecommendDiv != null)
        {
            emoteRecommendDiv.remove();
            emoteRecommendDiv = null;
        }
    
        if(emoteRecommendTargetSpan != null)
        {
            emoteRecommendTargetSpan = null; 
        }
    
        if(recommendEmoteList != null)
        {
            recommendEmoteList = null;
        }
    }

    function parseChatInput(){
        var cursor = window.getSelection().getRangeAt(0).endOffset;
        var text = newChat.chat_input.innerText;
        var front = text.substring(0,cursor);
        var rear = text.substring(cursor,text.length);

        var frontArray,rearArray;
        if(front == '')                        
            frontArray = [''];
        else
            var frontArray =front.match(/(\S+|\s+)/g);

        if(rear == '')
            rearArray = [''];
        else
            rearArray = rear.match(/(\S+|\s+)/g);

        var cursorText = frontArray[frontArray.length -1] + rearArray[0];
        var startindex = cursor,endindex = cursor;

        
        if(cursorText.search(/^(\S+)$/) == 0){
            startindex = front.length - frontArray[frontArray.length -1].length;
            endindex = front.length + rearArray[0].length ;
        }
        else if(frontArray[frontArray.length -1].search(/^(\S+)$/) == 0 && rearArray[0].search(/^(\s+)$/) == 0){
            startindex = front.length - frontArray[frontArray.length -1].length;
            endindex = front.length ;
        }
        else if(frontArray[frontArray.length -1].search(/^(\s+)$/) == 0 && rearArray[0].search(/^(\S+)$/) == 0){
            startindex = front.length;
            endindex = front.length + rearArray[0].length;
        }

        return [startindex,endindex];
    }



    function autoCompleteEventListener(){

        var sel = window.getSelection() ;

        if(sel.focusNode.nodeName == '#text'
                     && sel.focusNode.parentNode == newChat.chat_input){
            deleteEmoteRecomendList();

            var startindex, endindex ;
            [startindex,endindex] = parseChatInput();

            var curAlias = newChat.chat_input.innerText.substring(startindex, endindex);
    
            var curEmotes = getAutoCompleteArray(curAlias.toLowerCase() ,5);

            var x, y ;
            [x,y] = getPositionOfRecommendList(startindex);
    
            if(curEmotes != null)
            {
                appendEmoteRecommendList(curEmotes,x);
            }
        }

    }

    var keyInterval  = null;

    var stopStatus = false;

    function keyIntervalStart(){
        if(keyInterval == null)
        {
            stopStatus = true;

            keyInterval = setInterval(function(){
                autoCompleteEventListener();
                if(stopStatus == true){
                    clearInterval(keyInterval);
                    stopStatus = false;
                    keyInterval = null;
                }
            },50);
        }

    }

    function keyIntervalStop(){
        stopStatus = true;
    }
    
    return {
        onClick : function(event){
            setTimeout(function(){autoCompleteEventListener();},100);
            
        },
        onFocusout : function(event){
            deleteEmoteRecomendList();
        },
        emotePickerChoiceEventListener : function(event)
        {
            var ele = document.activeElement;
        
            if(shortcutKeyCodeSet[event.keyCode] != undefined && ele.className == 'new-chat-input'){
                var index = shortcutKeyCodeSet[event.keyCode];
        
                if(emoteRecommendDiv != null){
                    
                    if(recommendEmoteList != null && recommendEmoteList.length > 0 && index < recommendEmoteList.length )
                    {
                        event.preventDefault();

                        var curEmote = recommendEmoteList[index];
                        replaceEmote(curEmote);
                        var curEmotes = recommendEmoteList;
                        deleteEmoteRecomendList();
                        
                        var startindex, endindex ;
                        [startindex, endindex ] = parseChatInput();
                        var x,y;
                        [x,y] =getPositionOfRecommendList(startindex);
                        //console.log(x + ' ' + y);
                        appendEmoteRecommendList(curEmotes,x);
                    }
                }
            }
        },
        showAutoComplete_MoseOverListener : function(event){
            deleteEmoteRecomendList();
        
            var curEmotes = getAutoCompleteArray(event.path[0].innerText, 5);
        
            if(curEmotes != null)
            {
                deleteEmoteRecomendList();
                appendEmoteRecommendList(curEmotes, event.path[0]);
            }
        },        
        autoCompleteEventListener :autoCompleteEventListener,
        setNewChat : function(nc){
            newChat = nc;
        },
        clearChat : function(){
            deleteEmoteRecomendList();
        },
        keyDownListener : function(event){
            var ele = document.activeElement;
        
            if(33 <= event.keyCode && event.keyCode <= 40 && ele.className == 'new-chat-input'){
                keyIntervalStart();
            }
        },
        keyUpListener : function(event){
            var ele = document.activeElement;

            if(33 <= event.keyCode && event.keyCode <= 40 && ele.className == 'new-chat-input'){
                keyIntervalStop();
            }
        },
        emptyCheck : function(event){
            if(newChat.chat_input.innerText.match(/^\s*$/)){
                deleteEmoteRecomendList();
            }
        }
    }
    
    
})();
