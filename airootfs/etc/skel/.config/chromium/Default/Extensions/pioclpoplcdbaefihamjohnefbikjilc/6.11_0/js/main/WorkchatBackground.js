/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */
function WorkchatBackground(){"use strict";function a(a,b,c){F&&F.removeTab(b.tab)}function b(a){var b=new Thrift.BinaryHttpTransport(a),c=new Thrift.BinaryProtocol(b);return new MessageStoreClient(c)}function c(a,b){var c=/^<msg>(.+?)<\/msg>$/i.exec(a);return c?b?c[1].replace(B,function(a,b,c){if(D.test(b))return a.replace(/<a /,'<a target="_blank" ');var d=C.exec(c);if(d){d=d[0];var e=c.split(d);return c=e.shift(),b+"<a href='"+c+"' target='_blank'>"+c+"</a>"+d+e.join(d)}return b+"<a href='"+c+"' target='_blank'>"+c+"</a>"}):c[1].replace(E,"$1"):""}function d(a){var b=account.userInfo.userId,c=[],d=Persistent.get("userIdToIdentityId"),e=Persistent.get("userIdToEmail"),f=Persistent.get("emailToIdentityId"),g=Persistent.get("identities");if(a.userId&&d&&d[b]&&e&&e[b]&&f&&f[b]&&g&&g[b])if(a.contact.type===ContactType.EMAIL){var h=d[b][a.userId];h&&g[b][h]&&c.push(g[b][h])}else if(a.contact.type===ContactType.EVERNOTE){var i=e[b][a.userId];if(i){var h=f[b][i];h&&g[b][h]&&c.push(g[b][h])}}return c}function e(a,b,c){var d=account.userInfo.userId;if(d){var e=Persistent.get("emailToUserId"),f=Persistent.get("userIdToIdentityId"),g=Persistent.get("identities");if(e&&e[d]&&f&&f[d]&&g&&g[d]){var h=e[d][a.email];if(h){var i=f[d][h];if(i){var j=g[d][i];Browser.sendToTab(b.tab,{name:"updateEmailContactWithUserId",email:a.email,user:{id:h,name:j.contact.name},toOwnWindow:!0})}}}}}function f(a){var b=account.userInfo.userId,c=Persistent.get("identities");if(c&&c[b]){var d=g(a);if(c[b][d])return c[b][d]}return null}function g(a){var b=account.userInfo.userId,c=Persistent.get("userIdToIdentityId"),d=Persistent.get("emailToUserId"),e=Persistent.get("emailToIdentityId"),f=null;if(c&&c[b]&&d&&d[b]&&e&&e[b])if(a.type===ContactType.EVERNOTE){var g=a.id;f=c[b][g]}else if(a.type===ContactType.EMAIL){var h=a.id,g=d[b][h];f=g?c[b][g]:e[b][h]}return f}function h(a,b,c){function d(a,b){for(var c=0;c<a.length;c++){var d=g(a[c]);if(!d||b.messageThread.participantIds.indexOf(d)<0)return!1}return!0}var e=account.userInfo.userId;if(e){var f=[];if(a.nameQuery){for(var h=Persistent.get("threadTries"),i=new Trie(h?h[e]:null),j=a.nameQuery.split(/\s+/),k=[],l=0;l<j.length;l++){var m=i.getMatching(j[l],10);k.push([]);for(var o=0;o<m.length;o++)k[k.length-1]=k[k.length-1].concat(m[o][1])}if(k.length)a:for(var l=0;l<k[0].length;l++){for(var o=1;o<k.length;o++)if(k[o].indexOf(k[0][l])<0)continue a;f.push(k[0][l])}}if(a.contacts){var p=Persistent.get("userIdToIdentityId"),q=Persistent.get("emailToUserId"),r=Persistent.get("emailToIdentityId"),s=Persistent.get("identities"),t=Persistent.get("threads");if(p&&p[e]&&q&&q[e]&&r&&r[e]&&s&&s[e]&&t&&t[e])for(var l=0;l<a.contacts.length;l++){var u=g(a.contacts[l]);if(u)for(var v=s[e][u].threadIds,o=0;o<v.length;o++)t[e][v[o]].messageThread.participantIds.length>2&&f.indexOf(v[o])<0&&d(a.requiredContacts,t[e][v[o]])&&f.push(v[o])}}n({threadIds:f,contactSearchNum:a.contactSearchNum},b,c)}}function i(a,b,c){var e=account.userInfo.userId;if(e){var f=null,g=Persistent.get("userIdToIdentityId"),h=Persistent.get("emailToUserId"),i=Persistent.get("emailToIdentityId"),j=Persistent.get("identities"),k=Persistent.get("threads"),l=[],m=null;if(j&&j[e]&&k&&k[e]){g&&g[e]||(g={},g[e]={}),h&&h[e]||(h={},h[e]={}),i&&i[e]||(i={},i[e]={});for(var n=0;n<a.contacts.length;n++){var o=null;if(a.contacts[n].type===ContactType.EVERNOTE)o=g[e][a.contacts[n].id];else if(a.contacts[n].type===ContactType.EMAIL){var p=h[e][a.contacts[n].id];o=p?g[e][p]:i[e][a.contacts[n].id]}if(!o){m=[];break}for(var q=j[e][o],r=q.threadIds||[],s=d(q),t=0;t<s.length;t++)s[t].threadIds&&s[t].threadIds.length&&(r=r.concat(s[t].threadIds));if(l.length)l.push(r);else{l.push([]);for(var t=0;t<r.length;t++)l[0].indexOf(r[t])<0&&k[e][r[t]].messageThread.participantIds.length===a.contacts.length+1&&l[0].push(r[t])}}if(l.length||(m=[]),m||(m=l[0].filter(function(a){for(var b=1;b<this.length;b++)if(this[b].indexOf(a)<0)return!1;return!0},l)),m.length){f={id:m[0],participants:[]};for(var u=k[e][f.id].messageThread.participantIds,t=0;t<u.length;t++){var q=j[e][u[t]];q.userId!=e&&f.participants.push({id:q.contact.id,name:q.contact.name,type:q.contact.type})}}}Browser.sendToTab(b.tab,{name:"receiveThreadByGivenContacts",thread:f,updateViewNum:a.updateViewNum,toOwnWindow:!0})}}function j(a){var b=account.userInfo.userId,c=Persistent.get("userProfiles"),d=Persistent.get("emailToUserId");if(c&&c[b]&&d&&d[b])if(a.type===ContactType.EMAIL){var e=d[b][a.id];if(e)return c[b][e]}else if(a.type===ContactType.EVERNOTE){var e=a.id-0;if(c[b][e])return c[b][e]}return null}function k(a,b,c){function d(){for(var c=[],d=0;d<i.length;d++)if(i[d].type===ContactType.EMAIL){var e=j(i[d]);if(e){e.id!=account.userInfo.userId&&c.push({id:e.id,name:e.name,email:e.email,photoUrl:e.photoUrl,role:e.attributes?e.attributes.title:null,sameBusiness:!0,type:ContactType.EVERNOTE});continue}var g=f(i[d]);if(g){g.contact.type===ContactType.EVERNOTE?g.contact.id!=account.userInfo.userId&&c.push({id:g.contact.id,name:g.contact.name,email:i[d].id,photoUrl:g.contact.photoUrl,sameBusiness:g.sameBusiness,type:ContactType.EVERNOTE}):g.contact.type===ContactType.EMAIL?c.push({id:i[d].id,name:i[d].name,email:i[d].id,type:ContactType.EMAIL}):c.push({id:i[d].id,name:i[d].name,email:i[d].id,type:ContactType.EMAIL});continue}for(var h=null,l=0;l<k.length;l++)if(i[d].id===k[l].email){h=k[l];break}if(h){c.push({id:i[d].id,name:i[d].name,email:i[d].id,photoUrl:h.photoUrl,google:!0,type:ContactType.EMAIL});continue}c.push({id:i[d].id,name:i[d].name,email:i[d].id,type:ContactType.EMAIL})}else if(i[d].type===ContactType.EVERNOTE){var e=j(i[d]);e?e.id!=account.userInfo.userId&&c.push({id:e.id,name:e.name,email:e.email,photoUrl:e.photoUrl,role:e.attributes?e.attributes.title:null,sameBusiness:!0,type:ContactType.EVERNOTE}):i[d].id!=account.userInfo.userId&&c.push({id:i[d].id,name:i[d].name,photoUrl:i[d].photoUrl,type:ContactType.EVERNOTE})}Browser.sendToTab(b.tab,{name:"receiveContacts",contacts:c,contactSearchNum:a.contactSearchNum,query:a.query,toOwnWindow:!0})}var e=account.userInfo;if(e.userId){var g=extension.createNoteStoreClient(),h=new ContactsQuery({maxEntries:y,prefix:a.query}),i=null,k=null;g.findContacts(e.authenticationToken,h,function(a){i=a,k&&d()},function(a){console.log(a),i=[],k&&d()});var l=Persistent.get("googleConnection");if(l&&l[e.userId]&&l[e.userId].connected){var m=extension.getOption("secureProto")+extension.getBootstrapInfo("serviceHost"),n=new JsonRpc(["NoteStoreExtra.getGoogleContacts"],m);n.initWithShardId(e.shardId,function(){n.client.NoteStoreExtra.getGoogleContacts(function(a,b){a?k=a.contacts&&a.contacts.list?a.contacts.list:[]:(console.log(b),k=[]),i&&d()},e.authenticationToken,null,h.prefix,5)})}else k=[],i&&d()}}function l(a,b,d){var e=account.userInfo.userId;if(e){for(var f=Persistent.get("threads"),g=Persistent.get("messages"),h=Persistent.get("threadChanges"),i=Persistent.get("identities"),j=Persistent.get("userIdToIdentityId"),k=Persistent.get("userIdToEmail"),l=Persistent.get("emailToIdentityId"),m=f[e][a.threadId],n=(m.messageThread.messageIds||[]).concat(m.messageThread.threadChangeIds||[]),o=[],p=0;p<n.length;p++){var q=n[p];if(!(q<=(a.afterMessageId||0))){var r=g[e][q]||h[e][q],s=r.senderId||r.changedByUserId,t=null,u=j[e][s];if(u)t=i[e][u];else{var v=k[e][s];if(v){var w=l[e][v];w&&(t=i[e][w])}}o.push({attachments:r.attachments,body:r.body?c(r.body,!0):null,changeType:r.changeType,changeValue:function(){if(r.identityValue){var a=r.identityValue;if(i[e][a.id]){var b=i[e][a.id].userId;if(b){var c=j[e][b];if(c){var d=i[e][c];d&&(a=d)}}}return{name:a.contact.name,email:a.contact.type===ContactType.EMAIL?a.contact.id:null,id:a.userId,self:a.userId==e}}if(r.stringValue)return r.stringValue}(),id:r.id,reshareMessage:r.reshareMessage,sender:t?{name:t.contact.name,email:t.contact.type===ContactType.EMAIL?t.contact.id:null,photoUrl:t.contact.photoUrl,self:e==s,id:s}:null,time:r.sentAt||r.changedAt,threadName:r.stringValue})}}o.sort(function(a,b){return a.time>b.time?1:a.time<b.time?-1:0}),Browser.sendToTab(b.tab,{name:"receiveMessagesOfThread",authToken:account.userInfo.authenticationToken,baseUrl:extension.getOption("secureProto")+extension.getBootstrapInfo("serviceHost"),lastReadMessageId:m.lastReadMessageId,threadId:a.threadId,messages:o,update:!!a.afterMessageId,updateViewNum:a.updateViewNum,toOwnWindow:!0})}}function m(a,b,c){var d=account.userInfo.userId;if(d){var e=Persistent.get("threads"),f=Persistent.get("identities");if(e&&e[d]){var g=e[d][a.threadId];if(g){for(var h=[],i=0;i<g.messageThread.participantIds.length;i++){var k=g.messageThread.participantIds[i];if(f[d][k].userId!=d){var l=f[d][k].contact,m=j(l);h.push({id:l.id,name:l.name,type:l.type,sameBusiness:!!m})}}Browser.sendToTab(b.tab,{name:"receiveMetadataOfThread",participants:h,title:g.messageThread.name,toOwnWindow:!0})}}}}function n(a,b,c){var d=account.userInfo.userId;if(d){var e=Persistent.get("threads");if(e&&e[d]){var f=[];if(a.threadIds)for(var g=0;g<a.threadIds.length;g++){var h=e[d][a.threadIds[g]];h&&f.push(h.messageThread)}else{for(var i in e[d])f.push(e[d][i].messageThread);f.sort(function(a,b){var c=a.messageIds||[],d=a.threadChangeIds||[],e=b.messageIds||[],f=b.threadChangeIds||[],g=a.threadMaxMessageId||Math.max(c[c.length-1],d[d.length-1]),h=b.threadMaxMessageId||Math.max(e[e.length-1],f[f.length-1]);return g>h?-1:g<h?1:0})}for(var k=[],l=Persistent.get("identities"),g=0;g<f.length;g++)if(f[g].messageIds&&f[g].messageIds.length||f[g].threadChangeIds&&f[g].threadChangeIds.length){for(var m=f[g].participantIds,n=[],o=[],p=0;p<m.length;p++){var q=m[p];if(l[d][q].userId!=d){var r=l[d][q].contact,s=j(r);n.push({id:r.id,name:r.name,type:r.type,sameBusiness:!!s}),o.push(r.photoUrl)}}if(k.push({id:f[g].id,name:f[g].name,snippet:f[g].snippet,participants:n,photos:o}),k.length===x)break}Browser.sendToTab(b.tab,{name:"receiveThreads",threads:k,contactSearchNum:a.contactSearchNum,toOwnWindow:!0})}}}function o(a,b,c){googleContactsManager.invalidate()}function p(a,b,c){return extension.getBootstrapInfo("enableGoogle")?void googleContactsManager.refresh().then(function(a){a&&a.connected?Browser.sendToTab(b.tab,{name:"isGoogleConnected",connected:!0,toOwnWindow:!0}):Browser.sendToTab(b.tab,{name:"isGoogleConnected",connected:!1,connectUrl:extension.getOption("secureProto")+extension.getBootstrapInfo("serviceHost")+"/GoogleData.action?connect&oauthSourcePage=connectedServices",toOwnWindow:!0})}):void Browser.sendToTab(b.tab,{name:"isGoogleConnected",connected:!0,toOwnWindow:!0})}function q(a){var b=account.userInfo,c=b.userId;G&&G.getAuthToken()===b.authenticationToken||(G=t(c,b)),G.setSyncCompleteHandler(function(){for(var a=F.getTabs(),b=0;b<a.length;b++)Browser.sendToTab(a[b],{name:"updateView",toOwnWindow:!0})});var d=Persistent.get("messageEventUSN");!d||!d[c]||!a||a.previousEventId>d[c]?G.sync():G.applySyncChunk(a.syncChunk)}function r(a,b,c){if(window.WebSocket){var d=account.userInfo.shardId,e=account.userInfo.authenticationToken;F&&F.getShardId()===d&&F.getAuthToken()===e&&!F.isClosed()||(F=new WebSocketManager(d,e,function(a){a.messageNotification&&q(a.messageNotification)})),F.addTabs(b.tab)}}function s(a,c,d){function e(a){q()}function f(a){log.error(a)}function g(){a.threadRecipient?(l.messageThreadId=a.threadRecipient,k.sendMessageToThread(i.authenticationToken,l,e,function(a){"EDAMSystemException"===a.__proto__.name&&a.errorCode===EDAMErrorCode.UNSUPPORTED_OPERATION?h():f(a)})):k.createMessageThread(i.authenticationToken,new CreateMessageThreadSpec({message:l,participants:o,groupThread:o.length+1>2}),e,function(a){"EDAMSystemException"===a.__proto__.name&&a.errorCode===EDAMErrorCode.UNSUPPORTED_OPERATION?h():f(a)})}function h(){var b=new Destination;a.threadRecipient?b.messageThreadId=a.threadRecipient:b.recipients=o,k.sendMessage(i.authenticationToken,l,b,e,f)}var i=account.userInfo,j=i.userId;if(j){var k=b(i.urls.messageStoreUrl);a.body=GlobalUtils.escapeXML(a.body).replace(/\n/g,"<br/>");var l=new Message({body:"<msg>"+a.body+"</msg>"});if(a.attachments&&a.attachments.length){l.attachments=[];for(var m=0;m<a.attachments.length;m++){var n=new MessageAttachment({guid:a.attachments[m].guid,shardId:a.attachments[m].shardId,title:a.attachments[m].title,type:MessageAttachmentType.NOTE,userId:a.attachments[m].userId-0});l.attachments.push(n)}}for(var o=[],m=0;m<a.contactRecipients.length;m++)o.push(new Contact({id:a.contactRecipients[m].id,type:a.contactRecipients[m].type}));if(l.attachments&&l.attachments[0]){var p=extension.createNoteStoreClientFromUrl(a.noteStoreUrl);p.createOrUpdateSharedNotes(a.noteToken,new SharedNoteTemplate({noteGuid:l.attachments[0].guid,recipients:o,privilege:a.noteSharePrivilege}),g,function(b){b instanceof EDAMUserException&&"EDAMInvalidContactsException"===b.__proto__.name?(o=o.filter(function(a){for(var c=0;c<b.contacts.length;c++)if(b.contacts[c].id===a.id&&b.contacts[c].type===a.type)return!1;return!0}),p.createOrUpdateSharedNotes(a.noteToken,new SharedNoteTemplate({noteGuid:l.attachments[0].guid,recipients:o,privilege:a.noteSharePrivilege}),g,function(a){console.log(a)})):console.log(b)})}else g()}}function t(a,d){return new Syncer(a,d.authenticationToken,"messageEvent",[{name:"identities",idPropertyChain:["id"],updateItem:function(a,b){return a&&(b.threadIds=a.threadIds),b},extraHandling:function(b){if(b.userId){if(b.contact.type===ContactType.EVERNOTE){var c=Persistent.get("userIdToIdentityId");c||(c={}),c[a]||(c[a]={}),c[a][b.userId]||(c[a][b.userId]=b.id,Persistent.set("userIdToIdentityId",c))}else if(b.contact.type===ContactType.EMAIL){var d=Persistent.get("emailToUserId");d||(d={}),d[a]||(d[a]={}),d[a][b.contact.id]=b.userId,Persistent.set("emailToUserId",d);var e=Persistent.get("userIdToEmail");e||(e={}),e[a]||(e[a]={}),e[a][b.userId]=b.contact.id,Persistent.set("userIdToEmail",e);var f=Persistent.get("emailToIdentityId");f||(f={}),f[a]||(f[a]={}),f[a][b.contact.id]=b.id,Persistent.set("emailToIdentityId",f)}}else if(b.contact.type===ContactType.EVERNOTE);else if(b.contact.type===ContactType.EMAIL){var f=Persistent.get("emailToIdentityId");f||(f={}),f[a]||(f[a]={}),f[a][b.contact.id]=b.id,Persistent.set("emailToIdentityId",f)}return{}}},{name:"threads",idPropertyChain:["messageThread","id"],updateItem:function(a,b){return a&&(b.messageThread.messageIds=a.messageThread.messageIds,b.messageThread.threadChangeIds=a.messageThread.threadChangeIds,b.messageThread.snippet=a.messageThread.snippet),b},extraHandling:function(b,c){var d={};if(b.maxDeletedMessageId){var e=Persistent.get("messages");if(e&&e[a]&&b.messageThread.messageIds){for(;b.messageThread.messageIds.length;){var f=b.messageThread.messageIds[0];if(!(f<=b.maxDeletedMessageId))break;delete e[a][f],b.messageThread.messageIds.shift()}d.item=b,d.messages=e[a]}}for(var g=b.messageThread.id,h=0;h<b.messageThread.participantIds.length;h++){var i=b.messageThread.participantIds[h];c.identities[i].threadIds||(c.identities[i].threadIds=[]),c.identities[i].threadIds.indexOf(g)<0&&(c.identities[i].threadIds.push(g),d.identities=c.identities)}var j=Persistent.get("threadTries");j||(j={});var k=new Trie(j[a]),l=b.messageThread.name;if(l)for(var m=l.split(/\s+/),h=0;h<m.length;h++)k.insert(m[h],b.messageThread.id);return j[a]=k.getPersistableForm(),Persistent.set("threadTries",j),d}},{name:"messages",idPropertyChain:["id"],updateItem:function(a,b){return b},extraHandling:function(a,b){var d=b.threads[a.messageThreadId];d.messageThread.messageIds||(d.messageThread.messageIds=[]);var e=d.messageThread.messageIds.length;if(!e||a.id>d.messageThread.messageIds[e-1]){a.reshareMessage||(d.messageThread.snippet=c(a.body,!1)),a.id>d.maxDeletedMessageId&&d.messageThread.messageIds.push(a.id);var f={threads:b.threads};return a.id<=d.maxDeletedMessageId&&(f.item=null),f}return{}}},{name:"threadChanges",idPropertyChain:["id"],updateItem:function(a,b){return b},extraHandling:function(a,b){var c=b.threads[a.messageThreadId];if(a.changeType===MessageThreadChangeType.PARTICIPANT_REMOVED&&a.identityValue.userId==account.userInfo.userId)return c.messageThread.messageIds=[],c.messageThread.threadChangeIds=[],{threads:b.threads};c.messageThread.threadChangeIds||(c.messageThread.threadChangeIds=[]);var d=c.messageThread.threadChangeIds.length;if(!d||a.id>c.messageThread.threadChangeIds[d-1]){a.id>c.maxDeletedMessageId&&c.messageThread.threadChangeIds.push(a.id);var e={threads:b.threads};return a.id<=c.maxDeletedMessageId&&(e.item=null),e}return{}}}],"chunkMaxEventId","userMaxEventId",function(a,c,e){var f=b(d.urls.messageStoreUrl);f.getMessageSyncChunk(d.authenticationToken,new MessageSyncFilter({afterEventId:a}),c,e)},A,function(){for(var b=["emailToIdentityId","userIdToIdentityId","threadTries"],c=0;c<b.length;c++){var d=Persistent.get(b[c]);d&&delete d[a],Persistent.set(b[c],d)}})}function u(a,b,c){var d=account.userInfo,e=d.userId;e&&(G&&G.getAuthToken()===d.authenticationToken||(G=t(e,d)),G.setSyncCompleteHandler(function(){a&&a.responseName&&b&&b.tab&&Browser.sendToTab(b.tab,{name:a.responseName,toOwnWindow:!0})}),G.sync(),d.bizAuthenticationToken&&v())}function v(){var a=account.userInfo.userId,b=account.userInfo.bizAuthenticationToken,c=Persistent.get("businessUsersSynced");if(!c||!c[a]||c[a].version<z||c[a].lastDay+864e5+c[a].offset<=new Date){var d=extension.createBusinessUserStoreClient();d.listBusinessUsers(b,function(a){var b=account.userInfo.userId,c=Persistent.get("emailToUserId");c||(c={}),c[b]||(c[b]={});var d=Persistent.get("userIdToEmail");d||(d={}),d[b]||(d[b]={});var e=Persistent.get("userProfiles");e||(e={}),e[b]||(e[b]={});for(var f=0;f<a.length;f++)e[b][a[f].id]=a[f],c[b][a[f].email]=a[f].id,d[b][a[f].id]=a[f].email;Persistent.set("emailToUserId",c),Persistent.set("userIdToEmail",d),Persistent.set("userProfiles",e);var g=Persistent.get("businessUsersSynced");g||(g={}),g[b]||(g[b]={}),g[b].version=z;var h=new Date;g[b].lastDay=new Date(h.getFullYear(),h.getMonth(),h.getDate())-0,g[b].offset&&(g[b].offset=Math.floor(24*Math.random()*60*60*1e3)),Persistent.set("businessUsersSynced",g)},function(a){console.log(a)})}}function w(a,c,d){var e=b(account.userInfo.urls.messageStoreUrl);e.updateReadStatus(account.userInfo.authenticationToken,a.threadId,a.messageId,function(a){console.log(a)},function(a){console.log(a)})}var x=3,y=10,z=1,A=1,B=/(.*?)(https?:\/\/\S+)/gi,C=/'|&#x27;|"|&quot;|\(|\)|<|&lt;|&#x3c;|&#60;|>|&gt;|&#x3e;|&#62;/i,D=/<a\s+href\s*=\s*['"]\s*$/i,E=/<a\s+href\s*=\s*['"][^'"]+['"][^>]*>([^<]*)<\/a>/gi,F=null,G=null;Browser.addMessageHandlers({closeWebSocket:a,findContactByEmail:e,findThreads:h,findThreadByGivenContacts:i,findWorkchatContacts:k,getMessagesOfThread:l,getMetadataOfThread:m,getThreads:n,wbg_isGoogleConnected:p,wbg_invalidateGoogleContacts:o,openWebSocket:r,sendChat:s,syncMessages:u,updateThreadReadStatus:w}),this.sync=u,Object.preventExtensions(this)}Object.preventExtensions(WorkchatBackground);