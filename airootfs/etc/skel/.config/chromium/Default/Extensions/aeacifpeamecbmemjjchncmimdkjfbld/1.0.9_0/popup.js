// Run our script as soon as the document's DOM is ready.

//http://fossbytes.com/api/get_recent_posts/

document.addEventListener('DOMContentLoaded', function ()
{
    var year = new Date();
    var newDiv = document.createElement("span");
    var newContent = document.createTextNode(year.getFullYear());
    newDiv.appendChild(newContent); //add the text node to the newly created div.

    document.getElementById("year").appendChild(newDiv);

  getRecentPosts();
  getHotPosts();
  getPopularPosts();
});

function getRecentPosts()
{
  var apiUrl = "http://fossbytes.com/?json=get_recent_posts&count=12";
  $.getJSON(apiUrl, function(postData)
  {
    var content = "<br />";
    for(var post in postData.posts)
    {
      console.log(postData.posts[post].title +  " " + postData.posts[post].custom_fields.views[0]);
      var title = postData.posts[post].title;
      var postUrl = postData.posts[post].url + "?utm_source=chrome-plugin&utm_medium=extention-body&utm_campaign=plugin";
      var author =  postData.posts[post].author.name;
      var authorSlug = postData.posts[post].author.slug;
      var publishedTime = postData.posts[post].date;
      var thumbnail = postData.posts[post].attachments[0].url;
        content = content + "<a href=" +postUrl+" target=\"_blank\"><div style=\"height:280px;\" class=\"col-xs-4 col-md-4\">" +
        "<div class=\"thumbnail\"><img data-src=\"holder.js/100%x200\" alt=\"\" src="+thumbnail+" data-holder-rendered=\"true\" style=\"height: 100px; width: 100%; display: block;\">" +
        "<div class=\"caption\"><h5><strong>" + title + "</strong></h5></a><p><i class=\"fa fa-clock-o\"></i> "+ publishedTime +"<br /><i class=\"fa fa-pencil\"></i> "+
        "<a href=\"http://fossbytes.com/author/"+authorSlug+"\" target=\"_blank\">"+author+"</a></p></div></div></div>";
    }
    var parser = new DOMParser();
    var h2d = parser.parseFromString(content, "text/html");
    var element = document.getElementById("recent");

    element.removeChild(element.firstChild);
    document.getElementById("recent").appendChild(h2d.documentElement);
  });
}

function getHotPosts()
{
  var dateObj = new Date();
  var month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
  var day = dateObj.getDate();
  var year = dateObj.getFullYear();

  var apiUrl = "http://fossbytes.com/?json=get_date_posts&date="+year+month+"&count=40";
  console.log(apiUrl);
  $.getJSON(apiUrl, function(postData)
  {
    var posts = postData.posts;
    posts.sort(function(a, b) {
        return parseFloat(b.custom_fields.views[0]) - parseFloat(a.custom_fields.views[0]);
    });
    var content = "<br />";
    for(var post in posts.slice(0,12))
    {
      console.log("hot" + postData.posts[post].title + " " + postData.posts[post].custom_fields.views[0]);
      var title = postData.posts[post].title;
      var postUrl = postData.posts[post].url + "?utm_source=chrome-plugin&utm_medium=extention-body&utm_campaign=plugin";
      var author =  postData.posts[post].author.name;
      var authorSlug = postData.posts[post].author.slug;
      var publishedTime = postData.posts[post].date;
      var thumbnail = (postData.posts[post].attachments[0].url == "undefined")?"http://fossbytes.com/wp-content/uploads/2014/08/Untitled3.jpg":postData.posts[post].attachments[0].url;
        content = content + "<a href=" +postUrl+" target=\"_blank\"><div style=\"height:280px;\" class=\"col-xs-4 col-md-4\">" +
        "<div class=\"thumbnail\"><img data-src=\"holder.js/100%x200\" alt=\"\" src="+thumbnail+" data-holder-rendered=\"true\" style=\"height: 100px; width: 100%; display: block;\">" +
        "<div class=\"caption\"><h5><strong>" + title + "</strong></h5></a><p><i class=\"fa fa-clock-o\"></i> "+ publishedTime +"<br /><i class=\"fa fa-pencil\"></i> "+
        "<a href=\"http://fossbytes.com/author/"+authorSlug+"\" target=\"_blank\">"+author+"</a></p></div></div></div>";
    }
    var parser = new DOMParser();
    var element = document.getElementById("hot");
    element.removeChild(element.firstChild);
    var h2d = parser.parseFromString(content, "text/html");
    document.getElementById("hot").appendChild(h2d.documentElement);
  });
}

function getPopularPosts()
{
  var dateObj = new Date();
  var month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
  var day = dateObj.getDate();
  var year = dateObj.getFullYear();

  var apiUrl = "http://fossbytes.com/?json=get_date_posts&date="+year+month+"&count=100";
  console.log(apiUrl);
  $.getJSON(apiUrl, function(postData)
  {
    var posts = postData.posts;
    posts.sort(function(a, b) {
        return parseFloat(b.custom_fields.views[0]) - parseFloat(a.custom_fields.views[0]);
    });
    var content = "<br />";
    for(var post in posts.slice(0,12))
    {
      console.log("popular" + postData.posts[post].title + " " + postData.posts[post].custom_fields.views[0]);
      var title = postData.posts[post].title;
      var postUrl = postData.posts[post].url + "?utm_source=chrome-plugin&utm_medium=extention-body&utm_campaign=plugin";
      var author =  postData.posts[post].author.name;
      var authorSlug = postData.posts[post].author.slug;
      var publishedTime = postData.posts[post].date;
      var thumbnail = (postData.posts[post].attachments[0].url == "undefined")?"http://fossbytes.com/wp-content/uploads/2014/08/Untitled3.jpg":postData.posts[post].attachments[0].url;
        content = content + "<a href=" +postUrl+" target=\"_blank\"><div style=\"height:280px;\" class=\"col-xs-4 col-md-4\">" +
        "<div class=\"thumbnail\"><img data-src=\"holder.js/100%x200\" alt=\"\" src="+thumbnail+" data-holder-rendered=\"true\" style=\"height: 100px; width: 100%; display: block;\">" +
        "<div class=\"caption\"><h5><strong>" + title + "</strong></h5></a><p><i class=\"fa fa-clock-o\"></i> "+ publishedTime +"<br /><i class=\"fa fa-pencil\"></i> "+
        "<a href=\"http://fossbytes.com/author/"+authorSlug+"\" target=\"_blank\">"+author+"</a></p></div></div></div>";
    }
    var parser = new DOMParser();
    var h2d = parser.parseFromString(content, "text/html");
    var element = document.getElementById("popular");

    element.removeChild(element.firstChild);
    document.getElementById("popular").appendChild(h2d.documentElement);

    chrome.browserAction.setBadgeText({text: ''});
  });
}
