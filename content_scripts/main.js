var timerPromise = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve({result : false , data : "PORTAL PROJECT LOAD TIME OUT"});
    }
    ,10000);
});

var bgPromises = new Promise(function(resolve, reject){
    Promise.all([emote_picker.promise, aliasPromise]).then(function(values){
        resolve({result : true , data : values});
    }).catch(function(err){
        reject(err);
    });
});

Promise.race([timerPromise, bgPromises]).then(function(value){

    if(value.result == true){
        shortCutStart(value.data[0], value.data[1]);
    }
    else{
        console.log(value.data);
    }

}).catch(function(err){
    console.log(err);
});


function shortCutStart(emoteListStatus, emoteAliasStatus){

    var emotePickers = [];
    var onLoads = [];
    var chatObservers = [replaceChatEmote];
    var onReset = [tcf.refresh];
    var afterSendMethods = [];


    if(emoteListStatus == true){
        emotePickers.push(emote_picker);
    }

    if(emoteAliasStatus == true){
        onLoads.push(tcfOnLoad);
        onLoads.push(emoteCounter.start);

        chatObservers.splice(0,0,emoteCounter.observer);

        onReset.push(emoteCounter.reset);
        onReset.push(emote_picker.reset);
        onReset.push(emoteCounter.rollbackChannelWeight);
        //afterSendMethods.push(autoComplete.clearChat);
    }
    
    var config = new tcf.config(
        chatObservers,
        emotePickers,
        onLoads,
        onReset,
        afterSendMethods
    );

    function startChecker(streamer){
        return new Promise(function(resolve,reject){
            resolve( config);
            emote_picker.init(streamer);
            emoteCounter.setChannelWeight(streamer);
        });
    }
    
    tcf.addStartChecker(startChecker);
    tcf.start();
}


chrome.runtime.onMessage.addListener(function(request, sender, callback){
    if(request.type == 'content_reload'){
        window.location.reload();
    }
})