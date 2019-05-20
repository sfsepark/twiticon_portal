var newChat;

var tcfOnLoad = (function() {

    var chatInputEmptyCheckListener = function(event){
        if(newChat.chat_input != null)
        {
            if(/^\n*$/.test(document.getElementsByClassName('new-chat-input')[0].innerText)){
                newChat.chat_input.innerHTML = '';
                autoComplete.addFirstSpan();
            }
        }
    }
    
    var correctSpanCheck = function()
    {
        for(var i =  0; i < newChat.chat_input.children.length ; i ++)
        {
            newChat.chat_input.children[i].innerHTML = newChat.chat_input.children[i].innerText;
        }
    };

    //onLoad

    function onLoad(){
        tcf.chatTarget.chat_input.addEventListener('click',autoComplete.onClick);
        //newChat.chat_input.addEventListener('focusout',autoComplete.onFocusout);
        tcf.chatTarget.chat_input.addEventListener('keydown', autoComplete.emotePickerChoiceEventListener);
        tcf.chatTarget.chat_input.addEventListener('input', autoComplete.autoCompleteEventListener ); 
        tcf.chatTarget.chat_input.addEventListener('keydown',autoComplete.keyDownListener);
        tcf.chatTarget.chat_input.addEventListener('keyup',autoComplete.keyUpListener);
        tcf.chatTarget.chat_input.addEventListener('input',autoComplete.emptyCheck);
    }

    return function(nc){
        newChat = nc;
        onLoad();
    }

})();
