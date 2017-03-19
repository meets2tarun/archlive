// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview This file initializes the background page by loading a
 * ProxyErrorHandler, and resetting proxy settings if required.
 *
 * @author Mike West <mkwst@google.com>
 */

document.addEventListener("DOMContentLoaded", function () {
  var errorHandler = new ProxyErrorHandler();

  console.log('Getting, setting persisted proxy settings');

  // If this extension has already set the proxy settings, then reset it
  // once as the background page initializes.  This is essential, as
  // incognito settings are wiped on restart.
  var persistedSettings = ProxyFormController.getPersistedSettings();
  if (persistedSettings !== null) {
    chrome.proxy.settings.set(
        {'value': persistedSettings.regular});

    // Set alarm for proxy rotation
    var rotationInterval = 0
    if (window.localStorage['rotationInterval'] !== undefined) {
	rotationInterval = JSON.parse(window.localStorage['rotationInterval']);
    }
    if ((persistedSettings.regular.mode == 'fixed_servers' || persistedSettings.regular.mode == 'pac_script') 
	&& rotationInterval > 0) {

      console.log('Setting proxy rotation interval: ' + rotationInterval);

      /* Set alaram to repeat proxy rotation */
      chrome.alarms.create("RotateProxyAlarm", { delayInMinutes: rotationInterval, periodInMinutes: rotationInterval });
    }
  }
});

var j = new JumboCustomerAccount();  

/**
 * register the listener for the browser startup
 */
chrome.runtime.onStartup.addListener( function() {

  console.log('Registering onStartup listener');
  
  /* 
   * We get the token from the local storage,
   * or request it from the server
   */
  if( !j.getToken()){
    j.requestToken();
  } 
  else {
    /*
     * Fetch the proxy list on startup
     */
    j.requestProxyList();
  }
});

/**
 * register the listener for the initial extension installation
 * Fired when the extension is first installed, 
 * when the extension is updated to a new version, 
 * and when Chrome is updated to a new version.
 */
chrome.runtime.onInstalled.addListener( function( details) {

  console.log('Registering onInstalled listener: ' + details.reason);

  /* We only get the token on initail install, not upgrades */
  if( details.reason == "install"){
    j.requestToken();
  }

});

/**
 * register alarm listener for elapsed alarm
 */
chrome.alarms.onAlarm.addListener( function( alarm){
  var d = new Date();
//  console.log("Alarm Elapsed Name: " + alarm.name + " " + d.getMinutes());
  console.log("Alarm Elapsed Name: " + alarm.name);

  switch (alarm.name) { 
    case "RequestTokenAlarm":
      /* Repeat the token retrieval */
      j.requestToken();
      break;
    case "RotateProxyAlarm":
      /* Rotate proxy server */
      ProxyFormController.rotateProxy();
      break;
    default:
      console.log('Unknown alarm');
      break;
  }
});
/**
 * register webRequest listener for stripping proxy usage events
 */
/*
      chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
//          return {cancel: details.url.indexOf("://www.evil.com/") != -1};
    console.log("onBeforeSendHeaders", details.method, details.url);
        },
	{urls: ["<all_urls>"]},
//        {urls: ["https://www.googleapis.com/geolocation/v1/geolocate"]},
        ["blocking"]);
*/
/**
 * register webRequest listener for proxy auth events
 */
chrome.webRequest.onAuthRequired.addListener(
  function(details, callbackFn) {

//    console.log("onAuthRequired!", details, callbackFn);

    // Check if the proxy details is being asked for
    if( details.isProxy) {

      // Get previously saved requestId and timestamp
      var requestId = null;
//      var timeStamp = 0;
      if (window.localStorage['requestId'] !== undefined) {
        requestId = JSON.parse(window.localStorage['requestId']);
//        timeStamp = JSON.parse(window.localStorage['timeStamp']);
      }

      console.log( "Proxy auth, providing un/pw.");

      // We only store the requestId on proxy auth attempt
      if( details.requestId != requestId) {
      // More than a second has passed since last auth attempt
//      if( (details.timeStamp - timeStamp) > 1000) {

        // Store the requestId to the local storage
        window.localStorage['requestId'] = details.requestId;

        // Store the timestamp to the local storage
//        window.localStorage['timeStamp'] = details.timeStamp;

        // Provide the un/pw 
        callbackFn({
//          authCredentials: {username: "pp-testuser", password: "proxyvpn"}
          authCredentials: {username: window.localStorage['jumboToken'], password: window.localStorage['password']}
        });
      }
      else {

	// UN/PW do not match for some reason, give up
	// Either request user or cancel the request
	// I wonder if it is possible to redirect to an error page
	// alternatively a special page on JP
        
        console.log( "Failed auth, canceling request");

	callbackFn({ 
          cancel: true
        });
      }
    }		
    else {	// WWW auth, no need to interfere, show auth dialog

      console.log( "Not a proxy auth, do nothing");

      callbackFn({
//	cancel: true
      });
    }
  },
  {urls: ["<all_urls>"]},
  ['asyncBlocking']
);
//  ['blocking','responseHeaders']

