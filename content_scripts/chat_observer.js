var replaceChatEmote = (function(){
    /*
    messageHTML = "<div class='chat-dccon' data='~" + Text + "' style =\"margin-top:4px; margin-bottom:4px; height:" + height + "px;\"><div class=\"tw-tooltip-wrapper inline\" data-a-target=\"emote-name\"><img src=\"" + 
        cur_dccon + "\" alt=\"~" + Text + "\" class=\"emoticon\" style=\"width:" + width + "px; height:" + height +"px\"><div class=\"tw-tooltip tw-tooltip--up tw-tooltip--align-center\" data-a-target=\"tw-tooltip-label\" style=\"margin-bottom: 0.9rem;\">~"+ Text +"</div></div></div>";    
    */

    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", chrome.extension.getURL ("html/emote_frame.html"), false );
    xmlHttp.send(null);

    var emoteFrameHTML = xmlHttp.responseText;

    function createEmoteSpan(emoteName, emoteSrc){
        var emoteHTML = emoteFrameHTML.replace('%emote_name%',emoteName);
        emoteHTML = emoteHTML.replace("%emote_src%",emoteSrc);
        emoteHTML = emoteHTML.replace("%emote_tooltip%",emoteName);

        var div = document.createElement('div');
        div.innerHTML = emoteHTML;

        return div.firstChild;
    }

    function changeEmoteSpan(messageSpan){
        if(EmoteRegexList != null){
            var parent = messageSpan.parentNode ;

            var emoteImg = null;
            var emoteName, emoteSrc, emoteTooltip;

            for(var i = 0 ; i < messageSpan.children.length ; i ++){

                emoteImg = messageSpan.children[i];

                if(emoteImg.nodeName == 'IMG'){
                    if(emoteImg.classList.contains('chat-image'))  {
                        break;
                    }      
                }
                
                emoteImg = null;
            }

            if(emoteImg != null){
                emoteName = emoteImg.getAttribute('alt');
                emoteSrc = emoteImg.getAttribute('src');

                newEmoteSpan = createEmoteSpan(emoteName, emoteSrc);

                setEmoteToolTip(newEmoteSpan, emoteName);

                
                parent.insertBefore(newEmoteSpan,messageSpan);
                messageSpan.setAttribute('style', 'display:none;');
                
            }        
        }              
    }

    function chatObserver(type, messageSpan){
        if(type == "text"){

        }
        else if(type == 'emote'){
            changeEmoteSpan(messageSpan);
        }
    }   

    return chatObserver;
        
})();