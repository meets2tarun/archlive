// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
  Displays a notification with the current time. Requires "notifications"
  permission in the manifest file (or calling
  "Notification.requestPermission" beforehand).
*/
function show(msg, url) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'A.M.' : 'P.M.'; // The period of the day.
  var notification = new Notification(hour + time[2] + ' ' + period, {
    icon: 'icon48.png',
    body: msg
  });
  notification.onclick = function () {
      window.open(url);
    };
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // The display activation.
  localStorage.frequency = 5;        // The display frequency, in minutes.
  localStorage.isInitialized = true; // The option initialization.
  if (window.Notification) {
    if (JSON.parse(localStorage.isActivated)) { show("Welcome to fossBytes notification", "http://fossbytes.com?utm_source=chrome-plugin&utm_medium=extention-body&utm_campaign=plugin"); }
  }
}

// Test for notification support.
if (window.Notification) {
  // While activated, show notifications at the display frequency.
  //if (JSON.parse(localStorage.isActivated)) { show("Welcome to fossBytes notification", "http://fossbytes.com"); }

  var interval = 0; // The display interval, in minutes.

  setInterval(function() {
    interval++;

    if (
      JSON.parse(localStorage.isActivated) &&
        localStorage.frequency <= interval
    ) {
      pollRSS();
      interval = 0;
    }
  }, 60000);
}

//poll rss feed and send new post notification
function pollRSS() {
  var apiUrl = "http://fossbytes.com/?json=get_recent_posts&count=1";
  var i = 0;
  $.getJSON(apiUrl, function(postData) {
      for(var post in postData.posts) {
          var title = postData.posts[post].title.replace(/&#8211;/g, "-").replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&#8208;/g, "-");
          var postUrl = postData.posts[post].url + "?utm_source=chrome-plugin&utm_medium=extention-notification&utm_campaign=plugin";
          var author =  postData.posts[post].author.name;
          var authorSlug = postData.posts[post].author.slug;
          var publishedTime = postData.posts[post].date;
          var thumbnail = postData.posts[post].attachments[0].url;
          var guid = postData.posts[post].id;
          var excert = postData.posts[post].excerpt;
          var div = document.createElement("div");
          div.innerHTML = excert;
          console.log(guid);
          if(isNewPosts(String(guid)))
          {
            i++;
            console.log("sending notification for " + title);
            show(title, postUrl);
            chrome.browserAction.setBadgeText({text: String(i)});
          }
      }
  });
}

function isNewPosts(guid)
{
  var myvar = localStorage[guid+"key"];
  console.log(myvar);
  if(myvar === guid){
    console.log("found" + guid);
    return false;
  }else {
    console.log("Not found storing" + guid);
    localStorage[guid+"key"] = guid;
    return true;
  }
}
