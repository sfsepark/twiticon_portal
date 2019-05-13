//원하는 target 다음 타겟 스판을 찾는다. 
function findNextSpan(target)
{
    var children = newChat.chat_input.children;

    for(var i = 0 ;i < children.length ; i ++)
    {
        if(target == children[i])
        {
            if(i +1 < children.length){
                return children[i+1];
            }
            else{
                return null;
            }
        }
    }
}

var cc_id = 'caret_span';

//recover caret cursor
function recoverChatFocus(){
    document.getElementsByClassName('new-chat-input')[0].focus();

    var range = document.createRange();
    cc = document.getElementById(cc_id);
    range.selectNode(cc);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    range.deleteContents();
}

function setCaretPosition(elem, caretPos) {

    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
}

/*

function createEmoteToolTip(emoteName){
    var emoteTooltip = emoteName ;

    if(EmoteRegexList[emoteName] != undefined)
    {
        var emoteAliasList = EmoteRegexList[emoteName]['alias'];
        
        if(emoteAliasList.length > 0) emoteTooltip += "</br>" ;
        emoteTooltip += emoteAliasList[0]['alias'] ;

        for(var i = 1 ; i < emoteAliasList.length ; i ++){
            emoteTooltip += '/' + emoteAliasList[i]['alias'] ;
        }
    }
    else{
        var emoteAliasList = EmoteRegexList[emoteName]['alias'];
    }

    return emoteTooltip;
}

*/


function createDOMObject(HTML){
    var d = document.createElement('div');
    d.innerHTML = HTML;
    return d.firstChild;
}