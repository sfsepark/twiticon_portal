var switch_toggle = document.getElementsByClassName('switch__toggle')[0];

chrome.storage.local.get(['tcf_status'],function(result){
    switch_toggle.checked = result.tcf_status;
});

switch_toggle.addEventListener('change', function(event){
    chrome.runtime.sendMessage({type:'tcf_status_change',data: switch_toggle.checked}, function(result){
        console.log("TCF STATUS CHANGED : " + JSON.stringify(result));
    })
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "content_reload"}, function(response) {
            
        });
        return true;
    });
})


var refresh_button =document.getElementById('refresh');

refresh_button.addEventListener('click', function(){
    chrome.runtime.sendMessage({type:'refresh',data : 'hard'},function(result){});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "content_reload"}, function(response) {
            
        });
        return true;
    });
});