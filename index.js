
var Vue =require('vue')
var calcUriParams =require('lm-ut-calc-uri-params')
var clientInfo =require('lm-se-client-info')

module.exports=function() {
    return new Promise((resolve, reject) => {
        let params=calcUriParams.getUriQuery(),
            localSavedLoginCheck=localStorage.getItem('logincheck')
    	if(clientInfo.render.isWechatWebView){
            if(localSavedLoginCheck && JSON.parse(localSavedLoginCheck).wechatOpenId && JSON.parse(localSavedLoginCheck).code==params.code && JSON.parse(localSavedLoginCheck).wechatOpen==params.state){
                resolve(JSON.parse(localStorage.getItem('user')))
            }else{

              Vue.http.get('/api/code/'+params.code+'/'+params.state+'/wxcode.jhtml').then((response)=>{
                    let userInfo=response.data
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

                    resolve(userInfo)
                },(response)=>{
                    reject('get userinfo in wechat occured error!!!')
                })                
            }
    	}else{
	        let localSavedUserInfo = localStorage.getItem('user')
	        resolve(localSavedUserInfo ? JSON.parse(localSavedUserInfo) : {})
    	}
    })
}
