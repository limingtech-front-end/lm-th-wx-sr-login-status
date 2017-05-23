
var Vue =require('vue')
var calcUriParams =require('lm-ut-calc-uri-params')
var clientInfo =require('lm-se-client-info')

var requestingQueen=[]

module.exports=function() {
    return new Promise(function(resolve, reject){
        var params=calcUriParams.getUriQuery(),
            localSavedLoginCheck=localStorage.getItem('logincheck')
    	if(clientInfo.render.isWechatWebView){
            if(localSavedLoginCheck && JSON.parse(localSavedLoginCheck).wechatOpenId && JSON.parse(localSavedLoginCheck).code==params.code && JSON.parse(localSavedLoginCheck).wechatOpen==params.state){
                resolve(JSON.parse(localStorage.getItem('user')))
            }else{
              if(!requestingQueen.length){
                  requestingQueen.push({resolve:resolve,reject:reject})
                  Vue.http.get('/api/code/'+params.code+'/'+params.state+'/wxcode.jhtml').then((response)=>{
                        var userInfo=response.data
                        userInfo.userId=userInfo.userId || ''
                        userInfo.wechatOpen=params.state
                        userInfo.code=params.code
                        localStorage.setItem('user',JSON.stringify(userInfo))
                        localStorage.setItem('logincheck',JSON.stringify({
                            code: params.code,
                            wechatOpen: params.state,
                            wechatOpenId: userInfo.wechatOpenId,
                            shop: {
                                id: userInfo.shop.id
                            }
                        }))
                        console.log('get userinfo from http request',userInfo)
                        requestingQueen.forEach(function(queen){
                            queen.resolve(userInfo)
                        })
                        requestingQueen=[]
                        // resolve(userInfo)
                    },function(response){
                        requestingQueen.forEach(function(queen){
                            queen.reject('get userinfo in wechat occured error!!!')
                        })
                        requestingQueen=[]
                        // reject('get userinfo in wechat occured error!!!')
                    })  
              }else{
                requestingQueen.push({resolve:resolve,reject:reject})
              }
              
            }
    	}else{
	        var localSavedUserInfo = localStorage.getItem('user')
	        resolve(localSavedUserInfo ? JSON.parse(localSavedUserInfo) : {})
    	}
    })
}
