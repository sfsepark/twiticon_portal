var setEmoteToolTip = (function(){

    var emotePromiseDict = {};

    return function(emoteSpan, emoteName){
        try{
            var emoteTooltip = emoteSpan.getElementsByClassName('tw-tooltip');

            if(emoteTooltip.length > 0){
                emoteTooltip = emoteTooltip[0];
            }
            else{
                return;
            }
    
            if(EmoteRegexList[emoteName] !== undefined)
            {
                        
                emoteTooltip.innerText = emoteName ;

                if(EmoteRegexList[emoteName] != null){
                    var emoteAliasList = EmoteRegexList[emoteName]['alias'];

                    if(emoteAliasList.length > 0) 
                    {
                        emoteTooltip.innerHTML += "</br>" ;
                        emoteTooltip.innerHTML += emoteAliasList[0]['alias'] ;
            
                        for(var i = 1 ; i < emoteAliasList.length ; i ++){
                            emoteTooltip.innerHTML += '/' + emoteAliasList[i]['alias'] ;
                        }
                    }
                }   

            }
            else{                
                if(emotePromiseDict[emoteName] == undefined){
                    var emotePromise = new Promise(function(resolve,reject){
                        chrome.runtime.sendMessage({type : 'single_alias', data : emoteName}, function(response){
                            try{
                                if(response != null){
                                    var tooltipText = emoteName ;
            
                                    if(response.length > 0){
                                        tooltipText += "</br>" ;
                                        tooltipText += response[0]['alias'] ;
                    
                                        for(var i = 1 ; i < response.length ; i ++){
                                            tooltipText += '/' + response[i]['alias'] ;
                                        }
                                    }
                                    
        
                                    emoteTooltip.innerHTML = tooltipText ;
                                    
                                    resolve(tooltipText);
    
                                    if(response.length > 0)
                                    {
                                        EmoteRegexList[emoteName] = {alias : response};
                                    }
                                    else{
                                        EmoteRegexList[emoteName] = null;
                                    }
                                }
                                else{
                                    reject("response is undefined");
                                }
                            }
                            catch(e){
                                reject(e);
                            }
                            
                        });
                    })   ;

                    emotePromiseDict[emoteName] = emotePromise;
                }
                else{
                    emotePromiseDict[emoteName].then(function(result){
                        emoteTooltip.innerHTML = result;
                    }).catch(function(err){
                        console.log(err);
                    });
                }
        
                
            }
        }catch(e){

            console.log(e);
        };
    }
})();

