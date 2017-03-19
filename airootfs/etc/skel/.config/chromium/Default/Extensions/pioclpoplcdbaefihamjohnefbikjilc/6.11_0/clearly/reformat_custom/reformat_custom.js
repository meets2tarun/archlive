/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */
function initClearlyComponent__reformat_custom(a){if(!a)return!1;var b=a;switch(!0){case!b.settings:case!b.settings.path:case!b.window:case!b.window.document:case!b.window.document.body:case!b.jQuery:return b.debug&&(console.log(!b.settings),console.log(!b.settings.path),console.log(!b.window),console.log(!b.window.document),console.log(!b.window.document.body),console.log(!b.jQuery)),!1}b.document=b.window.document;var c=function(a,c){b.settings[a]||(b.settings[a]=c)};c("onCreateFrameUseThisId","clearly_frame_custom"),c("onCreateFrameUseThisBaseTimer",50),c("onCreateFrameUseThisURLAsTheLocation",""),c("onCreateFrameDoNotInsertCSS",!1),c("onCreateFrameInjectThisHTMLAfter",""),c("onCreateFrameInjectThisHTMLBefore",""),c("onCreateFrameWaitForTheseWindowVars",[]),c("createFrameInsideElementWithThisId",""),c("doDocumentWrite",function(a,b){a.open(),a.write(b),a.close()}),c("imgPath",b.settings.path+"img/"),c("cssPath",b.settings.path+"css/"),c("cssImagesFile",b.settings.cssPath+"images.css"),c("cssFontsFile",b.settings.cssPath+"fonts.css");var d=b.jQuery;if(b.$window=d(b.window),b.$document=d(b.document),b.detected=!1,b.checkedSections=!1,b.uncheckedSections=!1,b.debug=b.debug||!1,b.debugRemembered={},b.debug){switch(!0){case!(!b.window.console||!b.window.console.log):b.logOneline=function(a){b.window.console.log(a)};break;case!(!b.window.opera||!b.window.opera.postError):b.logOneline=function(a){b.window.opera.postError(a)};break;default:b.logOneline=function(a){}}b.log=function(){if(b.debug){for(var a=0,c=arguments.length;a<c;a++)b.logOneline(arguments[a]);b.logOneline("-----------------------------------------")}},b.debugRemember=function(a,c){b.debugRemembered[a]=c}}else b.writeLog=function(){return!1},b.log=function(){return!1},b.debugRemember=function(){return!1};return b.escape_html=function(a){var b={"&":"amp",'"':"quot","<":"lt",">":"gt"};return a&&a.replace?a.replace(/[&"<>]/g,function(a){return"&"+b[a]+";"}):""},b.encode=function(a){if(""==a)return"none";var b={"!":"%21","'":"%27","(":"%28",")":"%29","*":"%2A"};return a&&a.replace?a.replace(/[!'()*]/g,function(a){return b[a]}):""},b.decode=function(a){return"none"==a?"":a&&a.replace?decodeURIComponent(a):""},b.composer__loop=function(a,b){if(a&&a.length)for(var c=!1,d=0,e=a.length;d<e;d++)c=a[d],b(c,0===d?0:d==e?-1:d)},b.composer__div=function(a,c,d,e){return a?"<div"+(c?' class="'+b.composer__esc(c)+'"':"")+">"+(e?a:b.composer__esc(a))+"</div>"+(d?d:""):""},b.composer__raw=function(a,c,d){return b.composer__div(a,c,d,!0)},b.composer__n2b=function(a){return a&&"string"==typeof a?a.replace(/[\r][\n]/gi,"\n").replace(/[\r]/gi,"\n").replace(/[\n]/gi,b.composer__br()):""},b.composer__br=function(){return arguments.length?arguments[0]?"<br>":"":"<br>"},b.composer__hr=function(){return'<div class="hr"></div>'},b.composer__esc=function(a){return b.escape_html(a)},b.sites={amazon:{sections_order:["top","images","bullets","book_description","product_description","card_description","developer_info","product_features","dp_review","technical_details","store_technical_details","reviews"],sections_unchecked:!1,translations:{},composer:function(a,c,d,e,f,g,h,i){return{top:function(){var c=b.window.devicePixelRatio&&b.window.devicePixelRatio>1?"@2x":"",f=""+d(a.name,"header")+e('<a href="'+g(a.url)+'">'+g(a.url)+"</a>")+'<table class="middle"><tr><td><img class="stars" src="'+b.settings.imgPath+"amazon--stars--"+g(a.stars_icon)+c+'.png" /></td>'+(a.stars_text?"<td>&nbsp;|&nbsp;</td><td><spam>"+g(a.stars_text)+"</span></td>":"")+(a.stars_count?"<td>&nbsp;|&nbsp;</td><td><spam>"+g(a.stars_count)+"</span></td>":"")+"</tr></table>"+d(a.price,"bold");return f}(),images:function(){var b="";return c(a.images,function(a,c){b+='<img class="product_image" src="'+g(a)+'" />'}),b?d(a.headers.images,"header",h())+b:""}(),bullets:function(){var b="";return c(a.bullets,function(a,c){b+="<li>"+g(a)+"</li>"}),b?d(a.headers.bullets,"header",h())+"<ul>"+b+"<ul>":""}(),reviews:function(){var i=b.window.devicePixelRatio&&b.window.devicePixelRatio>1?"@2x":"",j="";return c(a.reviews,function(a,c){j+=""+h(c)+d(a.title,"bold")+'<table class="middle"><tr><td><img class="stars" src="'+b.settings.imgPath+"amazon--stars--"+g(a.stars_icon)+i+'.png" /></td><td>&nbsp;|&nbsp;</td><td><spam>'+g(a.reviewer_and_date)+"</span></td></tr></table>"+d(a.usefulness,"light")+e(function(){var b=f(g(a.quote));return a.quote_more_url&&a.quote_more_label&&(b+=' <a href="'+g(a.quote_more_url)+'" target="_blank">'+g(a.quote_more_label)+"</a>"),b}())}),j?d(a.headers.reviews,"header",h())+j:""}(),book_description:function(){var b=""+e(f(g(a.book_description)));return b?d(a.headers.book_description,"header",h())+b:""}(),product_description:function(){var b=""+e(f(g(a.product_description)));return b?d(a.headers.product_description,"header",h())+b:""}(),product_features:function(){var b="";if(a.product_features)for(var c=0;c<a.product_features.length;c++)b+="<li>"+g(a.product_features[c].innerHTML)+"</li>";return b?d(a.headers.product_features,"header",h())+"<ul>"+b+"<ul>":""}(),card_description:function(){var b="";if(a.card_description)for(var c=0;c<a.card_description.length;c++)b+="<li>"+g(a.card_description[c].textContent)+"</li>";return b?d(a.headers.card_description,"header",h())+"<ul>"+b+"<ul>":""}(),developer_info:function(){var b="";if(a.developer_info)for(var c=0;c<a.developer_info.length;c++){var e=a.developer_info[c].getAttribute("href");b+='<li><a href="'+e+'">'+g(a.developer_info[c].innerHTML)+"</a></li>"}return b?d(a.headers.developer_info,"header",h())+"<ul>"+b+"<ul>":""}(),store_technical_details:function(){return a.store_technical_details?d(a.headers.store_technical_details,"header",h())+a.store_technical_details:""}(),technical_details:function(){var b="";return c(a.technical_details,function(a,d){b+=""+function(){var b="";return c(a,function(a,c){b+='<tr><td class="label">'+g(a.label)+"</td><td>"+f(g(a.value))+"</td></tr>"}),b?'<table class="technical">'+b+"</table>"+h():""}()}),b=b?b.substr(0,b.length-h().length):"",b?d(a.headers.technical_details,"header",h())+b:""}(),dp_review:function(){if(!a.dp_review)return"";var b=""+d(a.dp_review.score_label+" "+a.dp_review.score+" | "+a.dp_review.date,"bold")+d(a.dp_review.summary)+function(){var b="";return c(a.dp_review.pros,function(a,c){b+="<li>"+g(a)+"</li>"}),b?h()+d(a.dp_review.pros_label,"bold")+"<ul>"+b+"</ul>":""}()+function(){var b="";return c(a.dp_review.cons,function(a,c){b+="<li>"+g(a)+"</li>"}),b?h()+d(a.dp_review.cons_label,"bold")+"<ul>"+b+"</ul>":""}()+h()+e('<a href="'+g(a.dp_review.more_url)+'" target="_blank">'+g(a.dp_review.more_label)+"</a>");return b?d(a.headers.dp_review,"header",h())+b:""}()}}},linked_in:{sections_order:["top","summary","experience","skills","education","endorsements"],sections_unchecked:!1,composer:function(a,b,c,d,e,f,g,h){return{top:function(){var b=""+c(a.name,"header")+(a.email?d('<a href="mailto:'+f(a.email)+'">'+a.email+"</a>"):"")+c(a.headline)+c(a.demographics)+g(a.image)+(a.image?d('<img class="profile_picture" src="'+f(a.image)+'" />'):"")+g()+d('<a href="'+f(a.url)+'">'+f(a.url)+"</a>");return b}(),summary:function(){var b=""+c(a.current_summary)+c(a.experience_summary)+c(a.education_summary)+g(a.description)+d(e(f(a.description)));return b?c(a.headers.summary,"header",g())+b:""}(),experience:function(){var h="";return b(a.experience,function(a,b){h+=""+g(b)+c(a.title_and_company,"bold")+c(a.period_and_location,"light")+d(e(f(a.description)),"")}),h?c(a.headers.experience,"header",g())+h:""}(),skills:function(){var d="",e=!1;return b(a.skills,function(a){a.count>0&&(e=!0)}),e?(b(a.skills,function(a){d+="<tr><td>"+f(a.count)+"</td><td>"+f(a.name)+"</td></tr>"}),d=d?'<table class="skills">'+d+"</table>":""):b(a.skills,function(a){d+=c(a.name)}),d?c(a.headers.skills,"header",g())+d:""}(),education:function(){var d="";return b(a.education,function(a,b){d+=""+g(b)+c(a.institution,"bold")+c(a.major)+c(a.period,"light")}),d?c(a.headers.education,"header",g())+d:""}(),endorsements:function(){var e="";return b(a.endorsements,function(a,h){e+=""+g(h)+c(a.position_and_company,"bold")+function(){var e="";return b(a.endorsements,function(a,b){e+=""+g(b)+c(a.quote)+d('<a href="'+f(a.person_url)+'">'+f(a.person_and_position)+"</a>","light")+c(a.date_and_connection,"light")}),e}()}),e?c(a.headers.endorsements,"header",g())+e:""}()}}},youtube:{sections_order:["top","summary","comments"],sections_unchecked:!1,composer:function(a,b,c,d,e,f,g,h){return{top:function(){var b=""+c(a.title,"header")+d('<a href="'+f(a.url)+'">'+f(a.url)+"</a>")+d('<a href="'+f(a.author_url)+'">'+f(a.author)+"</a>")+c(a.views+" "+a.views_label)+c(a.published)+g(a.image)+(a.image?'<table><tr><td><div class="video_image_container"><img class="video_image" src="'+f(a.image)+'" /><a class="video_image_play" target="_blank" href="'+f(a.url)+'"></a></div></td></tr></table>':"");return b}(),summary:function(){var b=""+d(a.summary_html);return b?c(a.headers.summary,"header",g())+b:""}(),comments:function(){var e="";return b(a.comments,function(a,b){e+=""+g(b)+d('<span class="bold">'+f(a.author)+"</span><span> | "+f(a.date)+"</span>")+d(a.quote_html)}),e?c(a.headers.comments,"header",g())+e:""}()}}}},b.createFrame=function(){var a=b.settings.onCreateFrameUseThisId,c=b.document.createElement("iframe"),e=""+b.settings.onCreateFrameInjectThisHTMLBefore+'<div id="bodyContent"><div id="box"><div class="content" id="contentToDisplay"></div><div class="content" id="contentToSave"></div></div><div id="background"><div id="backgroundInner"></div></div></div><link rel="stylesheet" href="'+b.settings.cssPath+'style.css" type="text/css" /><link rel="stylesheet" href="'+b.settings.cssImagesFile+'" type="text/css" /><link rel="stylesheet" href="'+b.settings.cssFontsFile+'" type="text/css" />'+b.settings.onCreateFrameInjectThisHTMLAfter,f='<!DOCTYPE html><html id="html"><body id="body">'+e+"</body></html>";if(c.setAttribute("id",a),c.setAttribute("frameBorder","0"),c.setAttribute("allowTransparency","true"),c.setAttribute("scrolling","auto"),b.settings.onCreateFrameUseThisURLAsTheLocation&&c.setAttribute("src",b.settings.onCreateFrameUseThisURLAsTheLocation),b.settings.onCreateFrameDoNotInsertCSS);else{var g=b.document.createElement("style"),h="#"+a+" { margin: 0; padding: 0; border: none; position: absolute; width: 10px; height: 10px; top: -100px; left: -100px; } ";g.setAttribute("id",a+"__css"),g.setAttribute("type","text/css"),g.styleSheet?g.styleSheet.cssText=h:g.appendChild(b.document.createTextNode(h))}c.onload=function(){var a=this.contentDocument||this.contentWindow.document;if(b.settings.onCreateFrameUseThisURLAsTheLocation){var c=a.getElementById("body")||a.body;c.innerHTML=e}else b.settings.doDocumentWrite(a,f);b.iframe=this,b.$iframe=d(b.iframe),b.iframeDocument=a,b.$iframeDocument=d(b.iframeDocument),b.iframeWindow=this.contentWindow,b.$iframeWindow=d(b.iframeWindow),b.$iframeBox=b.$iframeDocument.find("#box"),b.$iframeContentToDisplay=b.$iframeDocument.find("#contentToDisplay"),b.$iframeContentToSave=b.$iframeDocument.find("#contentToSave"),b.$iframeBackground=b.$iframeDocument.find("#background"),b.callbacks&&b.callbacks.frameCreated&&b.callbacks.frameCreated()};var i=!!b.settings.createFrameInsideElementWithThisId&&b.document.getElementById(b.settings.createFrameInsideElementWithThisId),j=i||b.document.body;g&&j.appendChild(g),j.appendChild(c)},b.displayDetected=function(a){switch(!0){case!a.site:case!a.data:case!b.sites[a.site.id]:return void(b.detected=!1)}b.detected=a,b.$iframeDocument.find("#siteCSS").remove(),b.$iframeDocument.find("head").append('<link id="siteCSS" href="'+b.escape_html(b.settings.cssPath)+"site__"+b.escape_html(b.detected.site.id)+'.css" rel="stylesheet" type="text/css" />');var c=b.sites[b.detected.site.id].composer;b.composed=c(b.detected.data,b.composer__loop,b.composer__div,b.composer__raw,b.composer__n2b,b.composer__esc,b.composer__br,b.composer__hr);for(var e in b.composed)b.composed[e]||delete b.composed[e];var f=function(){for(var a={},c=b.sites[b.detected.site.id].sections_unchecked,d=0,e=c.length;d<e;d++)a[c[d]]=!0;return a}(),g="";b.loopThroughSections(function(a,c){g+='<div id="display__section__'+a+'" class="section section__'+a+" "+(f[a]?"unchecked":"checked")+'">'+(c?'<div class="checkbox" id="display__section__'+a+'__checkbox"></div>':"")+'<div class="section_content" id="display__section__'+a+'__content">'+b.composer__br(c)+b.composed[a]+b.composer__br()+"</div></div>"+b.composer__hr()}),g=g.substr(0,g.length-b.composer__hr().length),b.$iframeContentToDisplay.html(g),b.onlyCheckedSections(),b.$iframeContentToDisplay.find("div.checkbox").click(function(){var a=d(this.parentNode);switch(!0){case a.hasClass("unchecked"):a.removeClass("unchecked").addClass("checked");break;case a.hasClass("checked"):a.removeClass("checked").addClass("unchecked")}b.onlyCheckedSections()})},b.loopThroughSections=function(a){if(b.detected&&b.composed)for(var c=!1,d=0,e=b.sites[b.detected.site.id].sections_order.length;d<e;d++)c=b.sites[b.detected.site.id].sections_order[d],b.composed[c]&&a(c,0===d?0:d==e?-1:d)},b.onlyCheckedSections=function(){b.checkedSections=[],b.uncheckedSections=[];var a="";b.loopThroughSections(function(c){var d=b.$iframeDocument.find("#display__section__"+c),e=(b.$iframeDocument.find("#display__section__"+c+"__checkbox"),b.$iframeDocument.find("#display__section__"+c+"__content"));d.hasClass("checked")?(b.checkedSections.push(c),a+=""+e.html()+b.composer__hr()):b.uncheckedSections.push(c)}),a=a.substr(0,a.length-b.composer__hr().length),b.$iframeContentToSave.html(a)},b.getUncheckedSections=function(){return b.uncheckedSections},b.getCheckedSections=function(){return b.checkedSections},b.setUncheckedSections=function(a,c){b.sites[a]&&(b.sites[a].sections_unchecked=c)},b.getContentToSaveNode=function(){return b.$iframeContentToSave.get(0)},b.getContentToSaveHTML=function(){var a=b.getContentToSaveNode();if(!a)return!1;if(!a.innerHTML)return!1;var c=a.innerHTML;return c},b}