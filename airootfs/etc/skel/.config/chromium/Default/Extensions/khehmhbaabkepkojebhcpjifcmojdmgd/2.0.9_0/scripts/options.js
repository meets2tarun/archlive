"use strict";angular.module("us-chrome",["ngMaterial","ngMessages"]).config(["$mdThemingProvider",function(a){a.definePalette("usersnap-palette",{50:"e5eef4",100:"b2cee0",200:"99bed6",300:"669ec1",400:"327ead",500:"005e99",600:"004b7a",700:"00385b",800:"00253d",900:"001c2d",A100:"ff8a80",A200:"fa0040",A400:"ff1744",A700:"d50000",contrastDefaultColor:"light",contrastDarkColors:["50","100","200","300","400","A100"],contrastLightColors:void 0}),a.theme("default").primaryPalette("usersnap-palette").accentPalette("usersnap-palette")}]).service("Usersnap",["$http","$q","$timeout","$window","$mdDialog","UsersnapCapture",function(a,b,c,d,e,f){var g="https://",h="usersnap.com",i=g+h,j="https://chrome.usersnap.com",k=i+"/a",l=j,m="https://"+chrome.runtime.id+".chromiumapp.org",n=j+"/extension/github_extension_login",o="f16f73a035c627410bdc",p=m+"/github-cb",q=j+"/extension/google_extension_login",r="1026795407999-ihv8677h5h1niq88m4i130f2s6vkqapn.apps.googleusercontent.com",s=m+"/google-cb",t=j+"/extension/bitbucket_extension_login",u="bmAkNyLRaNHmuf5ADX",v=j+"/extension/live_extension_login",w="000000004C162AEA",x=m+"/live-cb",y=b.defer(),z={email:null,password:null,project:null,alwaysUseProject:!1,apikey:"",$promise:y.promise};chrome.storage.onChanged.addListener(function(b){c(function(){for(var c in b){var e=b[c];z[c]=e.newValue,("email"===c||"token"===c)&&(b[c]||delete a.defaults.headers.common.Authorization,a.defaults.headers.common.Authorization="Basic "+d.btoa(z.email+":"+z.token))}})}),chrome.storage.sync.get(["email","token","project","alwaysUseProject","apikey"],function(b){void 0!==b.email&&void 0!==b.token&&(z.email=b.email,z.token=b.token,z.project=b.project,z.alwaysUseProject=b.alwaysUseProject,a.defaults.headers.common.Authorization="Basic "+d.btoa(z.email+":"+z.token)),b.apikey&&(z.apikey=b.apikey),y.resolve()});var A=function(){var c={},d=b.defer();return c.$promise=d.promise,a.get(j+"/angular/user").then(function(a){angular.extend(c,a.data),c.$resolved=!0,d.resolve(a)},function(a){c.$resolved=!0,d.reject(a)}),c},B=function(c,e){var f=b.defer();try{chrome.identity.launchWebAuthFlow({url:c,interactive:!0},function(b){if(!b)return void f.reject(chrome.runtime.lastError);for(var c,g=b.split("?")[1].split("&"),h=0;h<g.length;h++){var i=g[h].split("=");if("code"===i[0]){c=i[1];break}}a.post(e,{code:c}).then(function(b){if(b.data.status){var c=b.data.data;chrome.storage.sync.set({email:c.email,token:c.login_token,project:null,alwaysUseProject:!1}),a.defaults.headers.common.Authorization="Basic "+d.btoa(b.data.data.email+":"+b.data.data.login_token),f.resolve(b)}else f.reject(b)},function(a){f.reject(a)})})}catch(g){f.reject()}return f.promise},C=function(a){chrome.tabs.query({url:a},function(b){b.length?chrome.tabs.update(b[0].id,{active:!0}):chrome.tabs.query({active:!0},function(b){chrome.tabs.create({url:a,index:b[0]?b[0].index+1:void 0})})})},D=function(a,c,d,g){var h=b.defer();if(d){var i=e.confirm().content("The next time you are using Usersnap, screenshots will be automatically added to your selected project.<br/><br/>This setting can be changed in the extension options.").theme("smalltextdialog").ok("Proceed").cancel("Cancel");a&&i.targetEvent(a),e.show(i).then(function(){D(a,c,!1,g),h.resolve()},function(){h.reject()})}else g||f.capture(c,z.email||""),h.resolve();return h.promise},E={serviceUrl:j,websiteUrl:i,extensionwrapUrl:l,dashboardUrl:k,getSettings:function(){return z},resetApikey:function(){chrome.storage.sync.remove("apikey")},updateProject:function(a,b){chrome.storage.sync.set({project:a,alwaysUseProject:b})},updateApikey:function(a){chrome.storage.sync.set({apikey:a})},getUserInfo:A,authenticateUser:function(c,e){var f=b.defer();return a.post(j+"/extension/login",{email:c,password:e}).then(function(b){b.data.status?(a.defaults.headers.common.Authorization="Basic "+d.btoa(c+":"+b.data.data.login_token),chrome.storage.sync.set({email:c,token:b.data.data.login_token,project:null,alwaysUseProject:!1}),f.resolve(b)):f.reject(b)},function(a){f.reject(a)}),f.promise},authenticateExternal:function(a,c){var d,f,g=b.defer();switch(c){case"git":f="GitHub",d=E.authenticateGithub;break;case"google":f="Google",d=E.authenticateGoogle;break;case"bitbucket":f="Bitbucket",d=E.authenticateBitbucket;break;case"live":f="Windows Live",d=E.authenticateLive;break;default:return null}return d().then(function(b){if("signup"===b.data.data.type){var d=e.alert().clickOutsideToClose(!0).title("Sign Up").content("Thanks for signing up on Usersnap, you have to get onboarded before you can take your first screen. You will be forwarded to the Usersnap Dashboard now.").ok("Ok");a&&d.targetEvent(a),e.show(d).then(function(){chrome.tabs.create({url:E.serviceUrl+"/signup/thankyou?origin="+c})})}g.resolve()},function(){e.show(e.alert().clickOutsideToClose(!0).title("Authentication failed").content("Please retry to authenticate with "+f+"!").ok("Ok")),g.reject()}),g.promise},authenticateGithub:function(){var a="https://github.com/login/oauth/authorize?client_id="+o+"&redirect_uri="+p+"&scope=user:email";return B(a,n)},authenticateGoogle:function(){var a="https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/userinfo.email&response_type=code&redirect_uri="+s+"&client_id="+r;return B(a,q)},authenticateBitbucket:function(){var a="https://bitbucket.org/site/oauth2/authorize?client_id="+u+"&response_type=code";return B(a,t)},authenticateLive:function(){var a="https://login.live.com/oauth20_authorize.srf?client_id="+w+"&scope=wl.signin,wl.emails&response_type=code&redirect_uri="+x;return B(a,v)},signOut:function(){a.defaults.headers.common.Authorization=null,chrome.storage.sync.remove(["email","token","project","alwaysUseProject"])},getProjects:function(){var c=[],d=b.defer();return c.$promise=d.promise,a.get(j+"/angular/apikeys").then(function(a){c.push.apply(c,a.data.data),c.$resolved=!0,d.resolve(a)},function(a){c.$resolved=!0,d.reject(a)}),c},openTab:C,openDashboard:function(){C(k)},openSignup:function(){C(i+"/?utm_source=chromeext&utm_medium=chromeext&utm_campaign=chromeext_signupbutton&gat=chromeext#signup")},openSettings:function(){C(chrome.extension.getURL("options.html"))},open3rdPartyAuth:function(a){C(chrome.extension.getURL("options.html#?extauth="+a))},openShortcutSettings:function(){C("chrome://extensions/configureCommands")},startUsersnap:D};return E}]).directive("usCardLoading",function(){return{restrict:"E",template:'<div class="us-card-loading" layout="row" layout-align="center center"><md-progress-circular md-mode="indeterminate"></md-progress-circular></div>'}}).service("Gravatar",["Md5",function(a){this.getImageUrl=function(b,c){return"https://www.gravatar.com/avatar/"+a.md5(b.trim().toLowerCase())+"?s="+c+"&d=identicon"}}]).filter("gravatar",["Gravatar",function(a){return function(b,c){return b?a.getImageUrl(b,c):b}}]).service("Md5",function(){function a(a,b){function c(a,b,c,d,e,f){return b=g(g(b,a),g(d,f)),g(b<<e|b>>>32-e,c)}function d(a,b,d,e,f,g,h){return c(b&d|~b&e,a,b,f,g,h)}function e(a,b,d,e,f,g,h){return c(b&e|d&~e,a,b,f,g,h)}function f(a,b,d,e,f,g,h){return c(b^d^e,a,b,f,g,h)}function h(a,b,d,e,f,g,h){return c(d^(b|~e),a,b,f,g,h)}var i=a[0],j=a[1],k=a[2],l=a[3];i=d(i,j,k,l,b[0],7,-680876936),l=d(l,i,j,k,b[1],12,-389564586),k=d(k,l,i,j,b[2],17,606105819),j=d(j,k,l,i,b[3],22,-1044525330),i=d(i,j,k,l,b[4],7,-176418897),l=d(l,i,j,k,b[5],12,1200080426),k=d(k,l,i,j,b[6],17,-1473231341),j=d(j,k,l,i,b[7],22,-45705983),i=d(i,j,k,l,b[8],7,1770035416),l=d(l,i,j,k,b[9],12,-1958414417),k=d(k,l,i,j,b[10],17,-42063),j=d(j,k,l,i,b[11],22,-1990404162),i=d(i,j,k,l,b[12],7,1804603682),l=d(l,i,j,k,b[13],12,-40341101),k=d(k,l,i,j,b[14],17,-1502002290),j=d(j,k,l,i,b[15],22,1236535329),i=e(i,j,k,l,b[1],5,-165796510),l=e(l,i,j,k,b[6],9,-1069501632),k=e(k,l,i,j,b[11],14,643717713),j=e(j,k,l,i,b[0],20,-373897302),i=e(i,j,k,l,b[5],5,-701558691),l=e(l,i,j,k,b[10],9,38016083),k=e(k,l,i,j,b[15],14,-660478335),j=e(j,k,l,i,b[4],20,-405537848),i=e(i,j,k,l,b[9],5,568446438),l=e(l,i,j,k,b[14],9,-1019803690),k=e(k,l,i,j,b[3],14,-187363961),j=e(j,k,l,i,b[8],20,1163531501),i=e(i,j,k,l,b[13],5,-1444681467),l=e(l,i,j,k,b[2],9,-51403784),k=e(k,l,i,j,b[7],14,1735328473),j=e(j,k,l,i,b[12],20,-1926607734),i=f(i,j,k,l,b[5],4,-378558),l=f(l,i,j,k,b[8],11,-2022574463),k=f(k,l,i,j,b[11],16,1839030562),j=f(j,k,l,i,b[14],23,-35309556),i=f(i,j,k,l,b[1],4,-1530992060),l=f(l,i,j,k,b[4],11,1272893353),k=f(k,l,i,j,b[7],16,-155497632),j=f(j,k,l,i,b[10],23,-1094730640),i=f(i,j,k,l,b[13],4,681279174),l=f(l,i,j,k,b[0],11,-358537222),k=f(k,l,i,j,b[3],16,-722521979),j=f(j,k,l,i,b[6],23,76029189),i=f(i,j,k,l,b[9],4,-640364487),l=f(l,i,j,k,b[12],11,-421815835),k=f(k,l,i,j,b[15],16,530742520),j=f(j,k,l,i,b[2],23,-995338651),i=h(i,j,k,l,b[0],6,-198630844),l=h(l,i,j,k,b[7],10,1126891415),k=h(k,l,i,j,b[14],15,-1416354905),j=h(j,k,l,i,b[5],21,-57434055),i=h(i,j,k,l,b[12],6,1700485571),l=h(l,i,j,k,b[3],10,-1894986606),k=h(k,l,i,j,b[10],15,-1051523),j=h(j,k,l,i,b[1],21,-2054922799),i=h(i,j,k,l,b[8],6,1873313359),l=h(l,i,j,k,b[15],10,-30611744),k=h(k,l,i,j,b[6],15,-1560198380),j=h(j,k,l,i,b[13],21,1309151649),i=h(i,j,k,l,b[4],6,-145523070),l=h(l,i,j,k,b[11],10,-1120210379),k=h(k,l,i,j,b[2],15,718787259),j=h(j,k,l,i,b[9],21,-343485551),a[0]=g(i,a[0]),a[1]=g(j,a[1]),a[2]=g(k,a[2]),a[3]=g(l,a[3])}function b(a){var b,c=[];for(b=0;64>b;b+=4)c[b>>2]=a.charCodeAt(b)+(a.charCodeAt(b+1)<<8)+(a.charCodeAt(b+2)<<16)+(a.charCodeAt(b+3)<<24);return c}function c(c){var d,e=c.length,f=[1732584193,-271733879,-1732584194,271733878];for(d=64;d<=c.length;d+=64)a(f,b(c.substring(d-64,d)));c=c.substring(d-64);var g=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(d=0;d<c.length;d++)g[d>>2]|=c.charCodeAt(d)<<(d%4<<3);if(g[d>>2]|=128<<(d%4<<3),d>55)for(a(f,g),d=0;16>d;d++)g[d]=0;return g[14]=8*e,a(f,g),f}function d(a){for(var b="",c=0;4>c;c++)b+=h[a>>8*c+4&15]+h[a>>8*c&15];return b}function e(a){for(var b=0;b<a.length;b++)a[b]=d(a[b]);return a.join("")}function f(a){return e(c(a))}var g=function(a,b){return a+b&4294967295},h="0123456789abcdef".split("");this.md5=f}).service("UsersnapCapture",["$window","$injector",function(a,b){function c(a,b,c,d,e,f,g,h){document.write('<style type="text/css">.point{color:#fff;-webkit-animation:point 2.5s;animation:point 2.5s;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.point2{-webkit-animation-delay:.5s;animation-delay:.5s}.point3{-webkit-animation-delay:1s;animation-delay:1s}@-webkit-keyframes point{0%{color:#fff}50%{color:#000}100%{color:#fff}}@keyframes point{0%{color:#fff}50%{color:#000}100%{color:#fff}}</style><br><br><br><br><center><img src="data:image/png;base64,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"/><br/><br/><h1 style="font-family:Arial;">Preparing Screenshot<span class="point point1">.</span><span class="point point2">.</span><span class="point point3">.</span></h1></center>');var i=document.createElement("form");i.setAttribute("method","post"),i.setAttribute("action",g+"/extensionwrap");var j={image:a,apikey:b,url:c,width:d,height:e,dpr:f,senderemail:h};for(var k in j)if(j.hasOwnProperty(k)){var l=document.createElement("input");l.setAttribute("type","hidden"),l.setAttribute("name",k),l.setAttribute("value",j[k]),i.appendChild(l)}document.body.appendChild(i),i.submit()}var d=c.toString().replace(/(\n|\t)/gm,"").replace(/^function [^(]+\(/i,"function fakePost("),e=function(c,e){var f;chrome.tabs.query({active:!0,currentWindow:!0},function(g){f=encodeURI(g[0].url),chrome.tabs.captureVisibleTab(null,{format:"png"},function(h){if(chrome.runtime.lastError)a.alert("Could not create screenshot: \n"+chrome.runtime.lastError.message);else{var i=new Image;if(h){var j=b.get("Usersnap");if(h.length<2097152){var k="java";k+="script",k+=":",i.onload=function(){chrome.tabs.create({url:k+d+";fakePost('"+h+"', '"+c+"', '"+f+"', "+i.naturalWidth+", "+i.naturalHeight+", "+window.devicePixelRatio+", '"+j.extensionwrapUrl+"', '"+e+"');",index:g[0].index})},i.src=h}else chrome.tabs.captureVisibleTab(null,{format:"jpeg"},function(b){if(chrome.runtime.lastError)a.alert("Could not create screenshot "+chrome.runtime.lastError.message);else if(b)if(b.length<2097152){var h="java";h+="script",h+=":",i.onload=function(){chrome.tabs.create({url:h+d+";fakePost('"+b+"', '"+c+"', '"+f+"', "+i.naturalWidth+", "+i.naturalHeight+", "+window.devicePixelRatio+", '"+j.extensionwrapUrl+"', '"+e+"');",index:g[0].index})},i.src=b}else a.alert("Could not create screenshot - file size exceeded. Please resize your browser and try again")})}}})})};return{capture:e}}]),angular.module("us-chrome").directive("usLogin",["Usersnap","$mdDialog",function(a,b){return{restrict:"E",templateUrl:"login.tpl.html",scope:{popup:"=",showHeader:"=",onAuthenticated:"&",onAuthError:"&"},controller:["$scope",function(c){c.data={email:"",password:"",authActive:!1,mode:"auth",apikey:null},c.checkLogin=function(){c.data.authActive=!0,a.authenticateUser(c.data.email,c.data.password).then(function(){c.data.authActive=!1,c.onAuthenticated()},function(){b.show(b.alert().clickOutsideToClose(!0).title("Check Credentials").content("Email or password incorrect!").ok("Ok")),c.data.authActive=!1,c.onAuthError()})},c.openSignup=function(){a.openSignup()},c.openAuthMode=function(){c.data.mode="auth"},c.openApikeyMode=function(){c.data.mode="apikey"},c.authenticateExternal=function(b,d){return c.popup?void a.open3rdPartyAuth(d):(c.data.authActive=!0,void a.authenticateExternal(b,d).then(function(){c.data.authActive=!1,c.onAuthenticated()},function(){c.data.authActive=!1,c.onAuthError()}))},c.checkApikey=function(b){var d=!c.popup;a.startUsersnap(b,c.data.apikey,!0,d).then(function(){a.updateApikey(c.data.apikey)})}}]}}]),angular.module("us-chrome").controller("us-options-controller",["$scope","Usersnap","$mdDialog","$location","$timeout",function(a,b,c,d,e){a.data={projects:null,mode:"initializing",email:null,token:null,apikey:null,dashboardUrl:b.dashboardUrl},a.updateMode=function(){if(!f()&&(a.data.email!==a.settings.email||a.data.token!==a.settings.token||a.data.apikey!==a.settings.apikey))if(a.data.email=a.settings.email,a.data.token=a.settings.token,a.data.apikey=a.settings.apikey,a.settings.email&&a.settings.token)a.data.user=b.getUserInfo(),a.data.user.$promise.then(function(){a.loadProjects(),a.data.mode="authenticated"},function(){c.show(c.alert().clickOutsideToClose(!0).title("Unauthenticated").content("Your connection to Usersnap got lost - please reauthenticate!").ok("Ok")).then(function(){a.data.mode="unauthenticated"})});else{if(a.settings.apikey)return void(a.data.mode="apikey");a.data.mode="unauthenticated"}};var f=function(){var c=d.search().extauth;return d.search("extauth",null),c?(a.data.mode="extauth",b.authenticateExternal(null,c).then(null,function(){a.data.mode="unauthenticated"}),!0):!1};a.loadProjects=function(){a.data.projects=b.getProjects(),a.data.projects.$promise.then(function(){var b=!1;a.settings.project&&(angular.forEach(a.data.projects,function(c){c.id===a.settings.project&&(b=!0)}),b||(e(function(){c.show(c.alert().clickOutsideToClose(!0).title("Project Unavailable").content("Your previously selected project is not available any longer. Please choose a different one.").ok("Ok"))}),a.settings.project=null)),!a.settings.project&&a.data.projects.length>0&&(a.settings.project=a.data.projects[0].id,a.projectChanged())},function(){a.showLogin(),e(function(){c.show(c.alert().clickOutsideToClose(!0).title("Authentication Failed").content("Please login to Usersnap again.").ok("Ok"))},200)})},a.projectChanged=function(){b.updateProject(a.settings.project,a.settings.alwaysUseProject)},a.showLogin=function(){a.data.mode="unauthenticated",a.data.email="",a.data.password=""},a.signOut=function(){b.signOut()},a.resetApikey=function(){b.resetApikey()},a.openShortcutSettings=function(){b.openShortcutSettings()},a.openDashboard=function(){b.openDashboard()},a.settings=b.getSettings(),a.settings.$promise.then(function(){a.$watch("settings",function(){a.updateMode()},!0)})}]);