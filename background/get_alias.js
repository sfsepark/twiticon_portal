var emoteAlias = (function(){

    /* response of [emote_server_url]/getemote.php
        {
            'info' : 
            {
                68 : {
                    'id' : 68,
                    'url' : url, 'width' : w, 'height' : h, 'regex' : 'Bible',
                    'alias' : [
                        {'alias' : '비블썸프' , 'count' : 23},
                        {'alias' : '비블썸푸' , 'count' : 15}
                    ]
                }
            }
            'regex' : 
            {
                'BibleThump' : {
                    'id' : 68,
                    'url' : url, 'width' : w, 'height' : h, 'regex' : 'Bible',
                    'alias' : [
                        {'alias' : '비블썸프' , 'count' : 23},
                        {'alias' : '비블썸푸' , 'count' : 15}
                    ]
                }
            }
            'alias' : 
            {
                '편안' : [
                    {'id': 00, 'regex' : 'XXgreat', 'count' : 22},
                    {'id': 03, 'regex' : 'YYgreat', 'count' : 10}
                ]
            }
        }
    */


//-------------------------------------------------------------------------------    

    /*
        emoteData =  {info : EmoteInfoList, 
            alias : EmoteAliasList, 
            regex : EmoteRegexList , 
            autocomplete : EmoteAutoCompleteTable
        }
    */

//-------------------------------------------------------------------------------

    /*
        refresh

    */

    var initStatus = true;
    var refreshPending = true;
    var refreshResolve , refreshReject ;
    var refreshPromise = new Promise(function(resolve, reject){
        refreshResolve = function(res){
            console.log('alias  refresh ');
            refreshPending = false;
            resolve(res);
        };
        refreshReject = function(res){
            console.log('alias  refresh fail');
            refreshPending = false;
            reject(res);
        };
    });

//-------------------------------------------------------------------------------
    var lastEmoteAvailableList = null;
//-------------------------------------------------------------------------------

    var emote_server_url = 'http://178.128.103.40'

    var EmoteInfoList = null;
    var EmoteAliasList = null;
    var EmoteRegexList = null;
    var EmoteAutoCompleteTable = null ;

    function init(){
        EmoteInfoList = null;
        EmoteAliasList = null;
        EmoteRegexList = null;
        EmoteAutoCompleteTable = null ;
    }

/*
    refresh의 엔드포인트 두개 finish 와 callbackError
*/

    function finish(callback){

        var emoteData =  {info : EmoteInfoList, 
            alias : EmoteAliasList, 
            regex : EmoteRegexList , 
            autocomplete : EmoteAutoCompleteTable
        }

        console.log(emoteData);

        refreshResolve(emoteData);
        if(typeof(callback) === 'function'){
            callback(emoteData);
        }

        refreshPending = false;
    }

    function callbackError(callback, error){

        if(error === undefined){
            refreshReject({error : 'err'});
            if(typeof(callback) == 'function'){
                callback({error : 'err'});
            }
            
        }
        else{
            
            refreshReject({error : error});
            if(typeof(callback) == 'function'){
                callback({error : error});
            }
        }

        console.log(error);

        refreshPending = false;

        
    }

 //=================================================================================================   

    var getEmoteInfo = function(){
        return new Promise(function(resolve, reject){
            emoteInfo.get(function(data){
                if(data['error'] === undefined){
                    resolve(data); //EmoteAvailableList
                }
                else{
                    reject();
                }
            })
        });
    }

    function getUserInfo(){
        return new Promise(function(resolve, reject){
            userInfo.get(function(response){
                if(response != null)
                {
                    resolve(response); // cookiedata
                }
                else{
                    reject();
                }
            })
        });
    }
//=================================================================================================   


    function makeAutoCompleteTable(){
        EmoteAutoCompleteTable = new Object();
        emoteAliasOrganize();
    }

    //emoteRegex 메꾸는 작업(emote_server의 single alias 호출을 막기 위해 별명이 없는 것이 확실한 것들은 null로 메꾼다.)

    function emoteRegexProcess(emoteList){

        var keys = Object.getOwnPropertyNames(emoteList.emoticon_sets);

        for(var i = 0 ; i < keys.length ; i ++)
        {
            var emoteSet = emoteList.emoticon_sets[keys[i]];

            for(var j = 0 ; j < emoteSet.length ; j ++)
            {
                if(EmoteRegexList[emoteSet[j]['code']] === undefined)
                    EmoteRegexList[emoteSet[j]['code']] = null;
            }
        }
    }
    



    var getAliasPromise = function(emoteList){
        return new Promise(function(resolve, reject){

            var url = emote_server_url + '/getemote.php';
            var xhttp = new XMLHttpRequest();

            xhttp.onload = function() {
                var responseJSON = JSON.parse(xhttp.responseText);
                resolve(responseJSON);
            }
            xhttp.onerror = function() {
                reject();
            }

            var param = 'data=[';

            var keys = Object.getOwnPropertyNames(emoteList.emoticon_sets);

            for(var i = 0 ; i < keys.length ; i ++)
            {
                var emoteSet = emoteList.emoticon_sets[keys[i]];

                for(var j = 0 ; j < emoteSet.length ; j ++)
                {
                    param += emoteSet[j]['id'] + ',';
                }
            }

            param = param.substring(0,param.length - 1);
            param += ']';

            xhttp.open('POST',url);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            //xhttp.setRequestHeader( "Content-Type", "application/json" );

            xhttp.send(param);
            return true;
        });
    }


    function emoteAliasOrganize()
    {
        var emoteAliasKeys = Object.keys(EmoteAliasList);

        for(var i = 0 ; i < emoteAliasKeys.length ; i ++)
        {
            var alias = emoteAliasKeys[i];
            var autoCompleteStr = alias.toLowerCase();
            var curAutoComplete = EmoteAliasList[alias];
            curAutoComplete = JSON.parse(JSON.stringify(curAutoComplete));

            while(autoCompleteStr.length > 0)
            {
                if(EmoteAutoCompleteTable[autoCompleteStr] == null){
                    EmoteAutoCompleteTable[autoCompleteStr] = new Array();
                }

                //중복된 것을 제외함
                curLevelAliasList(EmoteAutoCompleteTable[autoCompleteStr], curAutoComplete);

                //기존 오토 컴플릿 테이블과 병합
                EmoteAutoCompleteTable[autoCompleteStr] = mergeAlias(EmoteAutoCompleteTable[autoCompleteStr], curAutoComplete);
                
                //autoCompleteStr = autoCompleteStr.substring(0,autoCompleteStr.length - 1);
                var last = Hangul.disassemble(autoCompleteStr[autoCompleteStr.length - 1]);
                if(last.length <= 1){
                    autoCompleteStr = autoCompleteStr.substring(0,autoCompleteStr.length - 1);
                }
                else{
                    last = Hangul.assemble(last.slice(0,last.length -1))
                    autoCompleteStr = autoCompleteStr.substring(0,autoCompleteStr.length - 1) + last ;
                }
            }
        }
    }

    //b에 있는 id중 a의 id들 중 하나와 중복될 경우 그 요소를 제외함.
    function curLevelAliasList(a, b){
        if(a.length != 0){
            for(i = 0 ; i < b.length ; i ++){
                for(j = 0 ; j < a.length ; j ++){
                    if( b[i]['id'] == a[j]['id'])
                    {
                        b.splice(i, 1);
                        i --;
                        break;
                    }
                }
            }
        }
    }

    function mergeAlias(a , b)
    {
        var targetAliasList = [];
        var left = 0 , right = 0;

        while( left < a.length  && right < b.length)
        {
            if(a[left]['count'] > b[right]['count'])
            {
                targetAliasList.push(a[left]);
                left ++;
            }
            else{
                targetAliasList.push(b[right]);
                right ++;
            }
        }

        if(right < b.length) {
            for( var i = right ; i < b.length ; i ++) {
                targetAliasList.push(b[i]);
            }
        }
        if(left < a.length){
            for( var i = left ; i < a.length ; i ++)  {
                targetAliasList.push(a[i]);
            }
        }

        return targetAliasList;
    }

    return {
        get : function(callback){
            refreshPromise.then(function(emoteData){
                callback(emoteData);
            }).catch(function(err){
                callback(err);
            })
        },
        refresh : function(callback){
            
            if(refreshPending == false){
                refreshPromise = new Promise(function(resolve, reject){
                    refreshResolve = function(res){
                        console.log('alias  refresh ');
                        refreshPending = false;
                        resolve(res);
                    };
                    refreshReject = function(res){
                        console.log('alias  refresh fail');
                        refreshPending = false;
                        reject(res);
                    };
                });
            }
            else if(initStatus == false){
                if(typeof(callback) === 'function'){
                    refreshPromise.then(function(result){
                        callback(result);
                    }).catch(function(err){
                        callback(err);
                    });
                }
    
                return;
            }
            
            init();

            initStatus = false;

            getEmoteInfo().then(function(EmoteAvailableList){
                getAliasPromise(EmoteAvailableList).then(function(responseJSON){
                    EmoteInfoList = responseJSON['info'];
                    EmoteAliasList = responseJSON['alias'];
                    EmoteRegexList = responseJSON['regex'];
                    makeAutoCompleteTable();
                    emoteRegexProcess(EmoteAvailableList);

                    lastEmoteAvailableList = EmoteAvailableList ;

                    finish(callback);

                }).catch(function(err){
                    callbackError(callback,err);
                });
            }).catch(function(err){
                callbackError(callback,err);
            });
        },
        softRefresh : function(callback){

            if(EmoteInfoList == null){
                this.refresh(callback);
                return;
            }

            if(refreshPending == false){
                refreshPromise = new Promise(function(resolve, reject){
                refreshResolve = function(res){
                    console.log('alias  refresh ');
                    refreshPending = false;
                    resolve(res);
                };
                refreshReject = function(res){
                    console.log('alias  refresh fail');
                    refreshPending = false;
                    reject(res);
                };
            });
            }
            else if(initStatus == false){
                if(typeof(callback) === 'function'){
                    refreshPromise.then(function(result){
                        callback(result);
                    }).catch(function(err){
                        callback(err);
                    });
                }
    
                return;
            }
            
            
            initStatus = false;

            getUserInfo().then(function(cookiedata){
                if(cookiedata == null){
                    callback(null);
                    
                    callbackError(callback);
                }
                else{
                    getEmoteInfo().then(function(curEmoteAvailableList){

                        var pre = lastEmoteAvailableList;
                        var cur = JSON.parse(JSON.stringify(curEmoteAvailableList));

                        var remove = {emoticon_sets : {}};
                        var appendedList = {emoticon_sets : {}};
                        
                        var checked,p,c;

                        //remove unused emoticon_set 
                        var preset = Object.keys(pre.emoticon_sets);
                        var curset = Object.keys(cur.emoticon_sets);
                        
                        preset.forEach(function(emote_set){
                            var checked = false;
                            for(var i = 0 ; i < curset.length ; i ++){
                                if(emote_set == curset[i]){
                                    checked = true;
                                    break;
                                }
                            }

                            if(checked == false){
                                remove.emoticon_sets[emote_set] = pre.emoticon_sets[emote_set];
                                delete pre.emoticon_sets[emote_set] ;
                            }
                        })

                        // write appended emoticonset to appendedList

                        preset = Object.keys(pre.emoticon_sets);

                        curset.forEach(function(emote_set){
                            var checked = false;

                            for(var i = 0 ; i < preset.length ; i ++){
                                if(emote_set == preset[i]){
                                    checked = true;
                                    break;
                                }
                            }

                            if(checked == false){
                                appendedList.emoticon_sets[emote_set] = cur.emoticon_sets[emote_set];
                            }
                        })
                        

                        // simple emote

                        Object.keys(pre.emoticon_sets).forEach(function(emote_set){
                            var pre_set = pre.emoticon_sets[emote_set];
                            var cur_set = cur.emoticon_sets[emote_set];

                            p = 0; c= 0;

                            while(p < pre_set.length){
                                checked = false;

                                for(c = 0 ; c < cur_set.length ; c ++){
                                    if(pre_set[p].id == cur_set[c].id){
                                        cur_set.splice(c,1);
                                        checked = true;
                                        break;
                                    }
                                }

                                if(checked == false){
                                    if(remove.emoticon_sets[emote_set] === undefined){
                                        remove.emoticon_sets[emote_set] = [];
                                    }
                                    remove.emoticon_sets[emote_set].push( (pre_set.splice(p,1))[0] );
                                }
                                else{
                                    p ++;
                                }
                            }

                            if(cur_set.length > 0){
                                appendedList.emoticon_sets[emote_set] = cur_set;
                            }

                            if(pre_set.length == 0){
                                delete pre.emoticon_sets[emote_set];
                            }                  
                            else if(pre_set.length < 0){
                                console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCRITICAL ERORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
                            }      
                        });

                        //append to lastEmoteAvailableList

                        Object.keys(appendedList.emoticon_sets).forEach(function(emote_set){
                            var append = JSON.parse(JSON.stringify(appendedList.emoticon_sets[emote_set]));
                            var target = lastEmoteAvailableList.emoticon_sets[emote_set];

                            if(target === undefined){
                                lastEmoteAvailableList.emoticon_sets[emote_set] = append;
                            }
                            else{
                                var i =0;
                                var pointer = 0;
                                var checked;

                                while(i < append.length){
                                    checked = false;
                                    while(pointer < target.length){
                                        if(append[i].id < target[pointer]){
                                            target.splice(pointer,0,append.splice(i,1));
                                            checked = true;
                                            break;
                                        }
                                        pointer ++;
                                    }

                                    if(checked  == false){
                                        i ++;
                                    }
                                    else{
                                        target.splice(target.length-1, 0, append);
                                        break;
                                    }
                                }
                            }
                        });

                        //remove from infoList, regexList, aliasList               

                        Object.keys(remove.emoticon_sets).forEach(function(emote_set){
                            var r_set = remove.emoticon_sets[emote_set];

                            r_set.forEach(function(emote){
                                var id = emote['id'];
                                var regex = emote['code'];

                                if(EmoteInfoList[id] != null && EmoteInfoList[id] != undefined && EmoteInfoList[id].alias != undefined){
                                    EmoteInfoList[id].alias.forEach(function(targetAlias){
                                        for(var i = 0 ; i < EmoteAliasList[targetAlias.alias].length ; i ++){
                                            if(EmoteAliasList[targetAlias.alias].id == id){
                                                EmoteAliasList.splice(i,1);
                                                break;
                                            }
                                        }

                                        if(EmoteAliasList[targetAlias.alias].length == 0){
                                            delete EmoteAliasList[targetAlias.alias];
                                        }              
                                    })
                                }

                                delete EmoteInfoList[id];
                                delete EmoteRegexList[regex];
                            })

                            
                        });
                    

                        console.log("remove : " + JSON.stringify(remove));
                        console.log("append : " + JSON.stringify(appendedList));
                        console.log(lastEmoteAvailableList);

                        if(Object.keys(appendedList.emoticon_sets).length > 0){

                            getAliasPromise(appendedList).then(function(responseJSON){

                                var appendedInfoList = responseJSON['info'];
                                var appendedRegexList = responseJSON['regex'];
                                var appendedAliasList = responseJSON['alias'];

                                //info list 병합
                                Object.keys(appendedInfoList).forEach(function(id){
                                    EmoteInfoList[id] = appendedInfoList[id];
                                });

                                //regex list 병합
                                Object.keys(appendedRegexList).forEach(function(regex){
                                    EmoteRegexList[regex] = appendedRegexList[regex];
                                });

                                //alias list 병합
                                Object.keys(appendedAliasList).forEach(function(alias){
                                    if(EmoteAliasList[alias] == undefined){
                                        EmoteAliasList[alias] = appendedAliasList[alias];
                                    }
                                    else{
                                        var newAliasList = [];
                                        var p_ptr = 0 ; c_ptr = 0;
                                        while(p_ptr < EmoteAliasList[alias].length && c_ptr  < appendedAliasList[alias].length ){
                                            if(EmoteAliasList[alias][p_ptr].count > appendedAliasList[alias][c_ptr].count){
                                                newAliasList.push(EmoteAliasList[alias][p_ptr]);
                                                p_ptr ++;
                                            }
                                            else{
                                                newAliasList.push(appendedAliasList[alias][c_ptr]);
                                                c_ptr ++;
                                            }
                                        }

                                        while(p_ptr < EmoteAliasList[alias].length){
                                            newAliasList.push(EmoteAliasList[alias][p_ptr]);
                                            p_ptr ++;
                                        }
                                        while(c_ptr < appendedAliasList[alias].length){
                                            newAliasList.push(appendedAliasList[alias][c_ptr]);
                                            c_ptr;
                                        }
                                    }
                                });

                                makeAutoCompleteTable();
                                emoteRegexProcess(lastEmoteAvailableList);

                                finish(callback);

                            }).catch(function(err){
                                callbackError(callback,err);
                            });
                        }
                        else{
                            
                            makeAutoCompleteTable();
                            emoteRegexProcess(lastEmoteAvailableList);

                            finish(callback);
                        }
                        
                    }).catch(function(err){
                        callbackError(callback,err);
                    });
                }
            });

            
        }
    }

})();