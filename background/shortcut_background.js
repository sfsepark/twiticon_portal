
/*
    content script -> background -> content script
    emote_alias 
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, callback)
    {
        if(request.type == 'emote_alias'){
            emoteAlias.get(callback);
        }

        return true;
    }
);

tcfBackground.registerCookieListener(function(){
    emoteAlias.renew(function(aliasData){
        chrome.tabs.query({}, function(tabs) {
            for(var i = 0 ; i < tabs.length ; i ++)
            {
                chrome.tabs.sendMessage(
                    tabs[i].id, 
                    {type : 'emote_alias',
                    data : aliasData}, 
                    function(callback) {}
                ) ;
            }
        });
    })
});

var emote_server_url = 'http://178.128.103.40';

chrome.runtime.onMessage.addListener(
    function(request, sender, callback){
        if(request.type == 'single_alias'){
            
            var url = emote_server_url + '/getalias.php?' + 'data='+request.data;
            var xhttp = new XMLHttpRequest();

            xhttp.onload = function() {
                try{
                    console.log(request.data);
                    console.log(xhttp.responseText);
                    var aliaslist = JSON.parse(xhttp.responseText);
                    console.log(aliaslist);
                }
                catch(e){
                    callback([]);
                }
                
                
                callback(aliaslist);
            }
            xhttp.onerror = function() {
                callback([]);
            }

            xhttp.open('GET',url);
            
            xhttp.send(null);
            return true;
        }
    }
)

/*
    하드 리프레쉬 와 소프트 리프레쉬를 나눠야함.
*/

tcfBackground.registerRefresh(function(){
    emoteAlias.softRefresh();
});

tcfBackground.registerHardRefresh(function(){
    emoteAlias.refresh();
});