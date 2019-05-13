var pasteCheck = (function(){
    
    function pasteCheck() {
        var chatText = newChat.chat_input.innerText;//.replace('\n', '');
        //var chatArray = chatText.split(/(\s+)/);

        var isChanged = false;

        if(newChat.chat_input.children.length == 0)
        {
            if(chatText != "" 
                && isSpace.test(chatText) == false
                && isNotSpace.test(chatText) == false)
            {
                isChanged = true;
            }
        }
        else
        {
            for(var i = 0 ; i < newChat.chat_input.children.length ; i ++)
            {
                if(newChat.chat_input.children[i].innerText != "" 
                && isSpace.test(newChat.chat_input.children[i].innerText) == false
                && isNotSpace.test(newChat.chat_input.children[i].innerText) == false)
                {
                    isChanged = true;
                    break;
                }
            }
        }

        if(isChanged)// && chatArray.length > 1)// chatArray.length != cur_word_number)
        {
            // 1. inject magicText to caret cursor.
            var magicSpan = document.createElement('span');
            var magicText = '榕鱉謖蟻';
            magicSpan.innerText = magicText;
            window.getSelection().getRangeAt(0).insertNode(magicSpan);

            // 2. inject caret cursor span to magicText (checkArray)
            var cc = document.createElement('span');
            
            cc.id = cc_id;

            chatText = newChat.chat_input.innerText;//.replace('\n', '');
            chatArray = chatText.split(/(\s+)/);

            //-------------legacy--------------
            cur_word_number = chatArray.length;        

            var checked = false;

            newChat.chat_input.innerHTML = "";
            for(var i = 0 ; i < chatArray.length ; i ++)
            {
                var chat_span = document.createElement('span');
                chat_span.class = 'chat_span';

                checkArray = chatArray[i].split(magicText);

                if(checkArray.length > 1){
                    var a = checkArray[0];
                    var b = checkArray[1];

                    checked = true;
                    
                    chat_span.innerText = a;
                    newChat.chat_input.appendChild(chat_span);
                    chat_span.appendChild(cc);
                    chat_span.innerHTML += b;
                }
                else{
                    chat_span.innerText = chatArray[i];
                    newChat.chat_input.appendChild(chat_span);
                }

            }

            if(checked == false){
                newChat.chat_input.appendChild(cc);
            }

            //3. recover
            recoverChatFocus();
        }
    }

    return pasteCheck;
})();