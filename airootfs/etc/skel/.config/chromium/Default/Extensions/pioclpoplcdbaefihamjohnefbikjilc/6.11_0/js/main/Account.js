/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */
!function(){function a(a){this._onUpdated=a&&"function"==typeof a.onUpdated?a.onUpdated:null,this.host=a.host||"",this.userStore=a.userStore,this._userInfo=null,this._isBusinessAuthenticationRequired=!1,this._accountIsOffline=!1}var b=function(){var a=Persistent.get("savedAuthInfo")||{};return a.currentUser&&a.userInfo?(Persistent.clear("savedAuthInfo"),a.userInfo[a.currentUser]||null):null},c=function(a){if("object"!=typeof a||!a.id)return null;var b={authenticationToken:"",userId:a.id.toString(),username:a.username,basic:a.serviceLevel===ServiceLevel.BASIC,plus:a.serviceLevel===ServiceLevel.PLUS,premium:a.serviceLevel===ServiceLevel.PREMIUM,shardId:a.shardId,fullName:a.name||a.username,email:a.email,quota:a.accountLimits.uploadLimit,noteSizeMax:a.accountLimits.noteSizeMax,userNoteCountMax:a.accountLimits.userNoteCountMax,monthEnd:a.accounting.uploadLimitEnd,photoUrl:a.photoUrl,urls:null,created:a.created};return a.businessUserInfo&&(b.businessId=a.businessUserInfo.businessId,b.businessName=a.businessUserInfo.businessName),b.businessId?b.userType="Business":b.premium?b.userType="Premium":b.plus?b.userType="Plus":b.userType="Basic",b},d=function(a){return"object"==typeof a&&a.authenticationToken?{bizAuthenticationToken:a.authenticationToken,bizExpiration:a.expiration,bizUrls:JSON.parse(JSON.stringify(a.urls)),bizShardId:a.user.shardId,bizUserId:a.user.id,bizUserName:a.user.username}:null},e=function(a,b,c){return new Promise(function(d,e){a[b](c,d,e)})};a.UserInfoKey="UserInfoKey",window.Account=a,Object.defineProperty(a.prototype,"isAuthenticated",{get:function(){return!!this.userInfo.userId}}),Object.defineProperty(a.prototype,"isBusinessAuthenticationRequired",{get:function(){return!!this._isBusinessAuthenticationRequired}}),Object.defineProperty(a.prototype,"userInfo",{get:function(){if(this._userInfo)return this._userInfo;if(this._userInfo=b(),!this._userInfo)try{var c=localStorage.getItem(a.UserInfoKey);c&&(this._userInfo=JSON.parse(c))}catch(a){console.error("Failed to parse persisted user info",a)}return this._userInfo||{}},set:function(b){"object"==typeof b?(this._userInfo=b,localStorage.setItem(a.UserInfoKey,JSON.stringify(b))):b?console.error("You are trying to save invalid user info object."):(this._userInfo=null,localStorage.removeItem(a.UserInfoKey))}}),a.prototype.bumpUploadLimitEnd=function(){var a=this.userInfo;return!!(a.monthEnd&&a.monthEnd<Date.now())&&(a.monthEnd+=2592e6,this.userInfo=a,!0)},a.prototype.login=function(){return this.userInfo=null,this.reload()},a.prototype.reload=function(){var b=this;return new Promise(function(f,g){var h=b.userStore,i=b.userInfo.authenticationToken||"",j=null,k=function(c){var d=0,e=c&&c instanceof ProgressEvent&&"error"===c.type,h=c instanceof EDAMUserException,i=[EDAMErrorCode.BAD_DATA_FORMAT,EDAMErrorCode.PERMISSION_DENIED,EDAMErrorCode.DATA_REQUIRED,EDAMErrorCode.INVALID_AUTH,EDAMErrorCode.AUTH_EXPIRED];e?(b._accountIsOffline||(log.warn("Account offline"),b._accountIsOffline=!0),d=a.OFFLINE):(b._accountIsOffline&&(log.warn("Account online"),b._accountIsOffline=!1),c?(log.error(c),d=h&&i.indexOf(c.errorCode)>-1?0:a.ERROR,b.userInfo=null):j&&(b.userInfo=j)),b.isAuthenticated&&(d|=a.AUTHENTICATED),b._onUpdated&&b._onUpdated.call(b,d),d&a.ERROR?g(c):f(b.userInfo)};new Promise(function(a){EDGE?chrome.cookies.getAll({url:"https://"+b.host+"/",name:"clipper-sso"},function(b){b&&b.length&&(i=(b[0].value||"").replace(/"/g,"")),a()}):a()}).then(function(){return e(h,"getUser",i)}).then(function(a){if(j=c(a),i&&j&&(j.authenticationToken=i),j&&a.businessUserInfo)return e(h,"authenticateToBusiness",i).then(function(a){a&&(b._isBusinessAuthenticationRequired=!1,Object.assign(j,d(a)))}).catch(function(a){if(!(a instanceof EDAMUserException&&a.errorCode===EDAMErrorCode.BUSINESS_SECURITY_LOGIN_REQUIRED))throw a;b._isBusinessAuthenticationRequired=!0})}).then(function(){return j?e(h,"getUserUrls",i):null}).then(function(a){a&&(j.urls=JSON.parse(JSON.stringify(a))),b.userInfo=j}).then(k).catch(k)})},a.prototype.logout=function(){var b=this;return new Promise(function(c){var d="https://"+b.host+"/Logout.action";EDGE&&Browser.openTab(d);var e=new XMLHttpRequest;e.open("GET",d,!0),e.onreadystatechange=function(){if(e.readyState===this.DONE){var d=0;200===e.status?b.userInfo=null:d=0===e.status?a.OFFLINE:a.ERROR,c(d),b._onUpdated&&b._onUpdated.call(b,d)}},e.send()})},a.AUTHENTICATED=1,a.OFFLINE=2,a.ERROR=4}();