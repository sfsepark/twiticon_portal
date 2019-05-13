
var emoteCounter = (function(){

    var emoteQueue = [{}];

    var pointer = 0;

    var channelEmotes = null ;
    var channelRegexes = [];

    var CHANNEL_WEIGHT = 20;

    /*
        emoteQueue -> victim / ... / calculating / pointer
    */


    function autoCompleteCalc(emoteRegex , count){
        var aliasList = EmoteRegexList[emoteRegex].alias;
        var curAutoComplete = {}
        aliasList.forEach(function(alias){
            var autoCompleteStr = alias.alias;

            while(autoCompleteStr != ''){
                curAutoComplete[autoCompleteStr] = 1;
                
                var last = Hangul.disassemble(autoCompleteStr[autoCompleteStr.length - 1]);
                if(last.length <= 1){
                    autoCompleteStr = autoCompleteStr.substring(0,autoCompleteStr.length - 1);
                }
                else{
                    last = Hangul.assemble(last.slice(0,last.length -1))
                    autoCompleteStr = autoCompleteStr.substring(0,autoCompleteStr.length - 1) + last ;
                }
            }
        });

        var calcAliasList = Object.keys(curAutoComplete);
        
        calcAliasList.forEach(function(alias){
            alias = alias.toLowerCase();
            var pointer = 0, nptr;
            var aliasList = EmoteAutoCompleteTable[alias] ;

            for(pointer = 0 ; pointer < aliasList.length ; pointer ++){
                if(aliasList[pointer].regex == emoteRegex){
                    break;
                }
            }

            if(pointer < aliasList.length){
                aliasList[pointer].count += count;
                nptr = pointer ;

                if(count > 0){
                    while(nptr > 0){
                        if(aliasList[pointer].count > aliasList[nptr -1].count){
                            nptr --;
                        }
                        else{
                            break;
                        }
                    }
                }
                else if(count < 0){
                    while(nptr < aliasList.length -1){
                        if( aliasList[pointer].count <  aliasList[nptr +1].count){
                            nptr ++;
                        }
                        else{
                            break;
                        }
                    }
                }

                var curAlias = aliasList.splice(pointer, 1);
                aliasList.splice(nptr,0,curAlias[0]);
            }
        });
    }

    var emoteInterval;
    var makeEmoteInterval = function(){
        return setInterval(function(){
            
            emoteQueue.push({});
            pointer ++;

            var calcInfo = emoteQueue[pointer - 1];
            var calcEmoteRegexes = Object.keys(calcInfo);

            calcEmoteRegexes.forEach(function(emoteRegex){
                autoCompleteCalc(emoteRegex, calcInfo[emoteRegex]);
            });

            if(emoteQueue.length > 30){
                calcInfo = emoteQueue.shift();
                pointer --;

                calcEmoteRegexes = Object.keys(calcInfo);
                calcEmoteRegexes.forEach(function(emoteRegex){
                    autoCompleteCalc(emoteRegex, -(calcInfo[emoteRegex]) );
                });
            }

        },1000);
    }

    var count = function(emoteRegex){
        if(EmoteRegexList[emoteRegex] != undefined && EmoteRegexList[emoteRegex] != null && EmoteRegexList[emoteRegex].id != undefined){  //사이드 이펙트주의
            if(emoteQueue[pointer][emoteRegex] === undefined)
                emoteQueue[pointer][emoteRegex] = 1;
            else
                emoteQueue[pointer][emoteRegex] ++;
        }
    }

    function reset(){
        clearInterval(emoteInterval);
        while(emoteQueue.length == 0){
            calcInfo = emoteQueue.shift();
            calcEmoteRegexes = Object.keys(calcInfo);
            calcEmoteRegexes.forEach(function(emoteRegex){
                autoCompleteCalc(emoteRegex, -(calcInfo[emoteRegex]));
            });
        }
        emoteQueue = [{}];
        pointer = 0;
    }

    return {
        count : count,
        reset : reset,
        start : function(){
            emoteInterval = makeEmoteInterval();
        },
        observer : function(type,messageSpan){
            if(type == 'emote'){
                var emoteImg = null;
                var emoteName;
    
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
                    count(emoteName);
                }
            }
        },
        setChannelWeight : function(channel_name){
            
            chrome.runtime.sendMessage({type :'channel_product', channel_name : channel_name}, function(response){
                if(response != null && response.error === undefined){                
                    channelEmotes = response.plans;

                    channelEmotes.forEach(function(channelEmote){
                        var curEmotes = channelEmote.emoticons;
                        curEmotes.forEach(function(curEmote){
                            if(EmoteInfoList[curEmote['id']] !== undefined && EmoteInfoList[curEmote['id']] !== null){
                                channelRegexes.push(EmoteInfoList[curEmote['id']].regex);
                                autoCompleteCalc(EmoteInfoList[curEmote['id']].regex, CHANNEL_WEIGHT);
                            }
                        });
                    });
                }
            })
        },
        rollbackChannelWeight : function(){

            channelRegexes.forEach(function(channelRegex){
                autoCompleteCalc(channelRegex, -(CHANNEL_WEIGHT));
            });
            
            channelEmotes = null;
            channelRegexes = [];
        }
    }
})();