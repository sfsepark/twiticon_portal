
var EmoteInfoList = null;
var EmoteAliasList = null;
var EmoteRegexList = null;
var EmoteAutoCompleteTable = null ;

/*
    emoteData =  {info : EmoteInfoList, 
        alias : EmoteAliasList, 
        regex : EmoteRegexList , 
        autocomplete : EmoteAutoCompleteTable
    }
*/

/*
chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
        if(request.type == 'emote_alias'){
            if(response != null && response.data != null && response.data.error === undefined){
                 aliasLoad(response.data);
            }
            else{
                aliasClear();
            }
        }
    }
);
*/
var aliasPromise = new Promise(function(resolve, reject){
    chrome.runtime.sendMessage({type:'emote_alias'}, function(response)
    {
        if(response != null && response.error === undefined)
        {
            resolve(true);
            aliasLoad(response);
        }
        else{
            resolve(false);
            aliasClear();
        }
    });    
})



function aliasLoad(emoteData){
    EmoteInfoList = emoteData['info'];
    EmoteAliasList = emoteData['alias'];
    EmoteRegexList = emoteData['regex'];
    EmoteAutoCompleteTable = emoteData['autocomplete'];
}

function aliasClear(){
    EmoteInfoList = null;
    EmoteAliasList = null;
    EmoteRegexList = null;
    EmoteAutoCompleteTable = null ;
}