/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */
window===window.parent&&!function(){function a(a,b,c){!a.auth||a.pdfTooltipShown&&!a.enablePdfPageButton||new TooltipCoordinator(Browser.extension.getURL("content/tooltips/tooltip.html#which=pdfTooltip&locale="+a.bootstrapInfo.name)+"&permanent="+!!a.pdfTooltipShown,"pdfTooltip","evernotePdfTooltip",{classList:a.pdfTooltipShown?a.pdfTooltipShownSafari?["evernotePermanent","safarievernotePermanent"]:["evernotePermanent"]:null})}function b(){if(!d&&c){d=!0;var a=document.querySelector("embed");if(FIREFOX&&document.domain&&"pdf.js"===document.domain||a&&/application\/pdf/i.test(a.type))Browser.sendToExtension({name:"main_isAuthenticated",type:"pdfTooltip",bootstrapInfo:{name:null}});else if(/^https?:\/\/docs\.google\.com\/viewer\?url=.+/.test(document.location.href))for(var b=0;b<document.scripts.length;b++)if(/gviewApp\.setFileData/.test(document.scripts[b].innerText)){/mimeType.+application\/pdf/.test(document.scripts[b].innerText)&&Browser.sendToExtension({name:"main_isAuthenticated",type:"pdfTooltip",bootstrapInfo:{name:null}});break}}}var c="undefined"==typeof document.hidden||!document.hidden,d=!1;document.addEventListener("visibilitychange",function(){c=!document.hidden||c,b()}),Browser.addMessageHandlers({pdfTooltip_isAuthenticated:a}),b()}();