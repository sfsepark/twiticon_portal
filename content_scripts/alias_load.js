
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


var aliasReset = function (){
    return new Promise(function(resolve, reject){
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
}


var aliasPromise = aliasReset();

aliasPromise.then((result) => {
    if(result){
        startResetInterval();
    }
})

var startResetInterval = function(){
    setInterval(() => {
        chrome.runtime.sendMessage({type:'refresh',data : 'soft'},function(result){});
        aliasReset();
    }, 5000)
}




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