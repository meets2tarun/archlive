require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./config":[function(require,module,exports){
module.exports = {
  name: "Browsec VPN - Privacy and Security Online",
  shortName: "Browsec",
  browsec: {
    baseUrl: "https://browsec.com/",
    apiPrefix: "https://drah7iczdw1tu.cloudfront.net/v1/",
    originalDomainApiPrefix: "https://browsec.com/api/v1/",
    locationApiPrefix: "http://d3ovgmdqhvkef1.cloudfront.net/v1/"
  },
  ga: {
    enabled: true,
    extension_id: "omghfjlpggmjjaagoclmmobgdodcjboh",
    tracking_id: 'UA-43024042-1'
  },
  auth: {
    // When disabled, users can't login/register
    enabled: true
  },
  proxy: {
    defaultCountry: "nl",
    settings: {
      version: 21,
      countries: {
        au: {
          premium_servers: [
            {
              host: "au1.lunrac.com",
              port: 443
            },
            {
              host: "au2.lunrac.com",
              port: 443
            }
          ]
        },
        ca: {
          premium_servers: [
            {
              host: "ca2.lunrac.com",
              port: 443
            }
          ]
        },
        ch: {
          premium_servers: [
            {
              host: "ch1.lunrac.com",
              port: 443
            }
          ]
        },
        de: {
          premium_servers: [
            {
              host: "de2.lunrac.com",
              port: 443
            }
          ]
        },
        fr: {
          premium_servers: [
            {
              host: "fr1.lunrac.com",
              port: 443
            }
          ]
        },
        in: {
          premium_servers: [
            {
              host: "in1.lunrac.com",
              port: 443
            },
            {
              host: "in2.lunrac.com",
              port: 443
            }
          ]
        },
        jp: {
          premium_servers: [
            {
              host: "jp1.lunrac.com",
              port: 443
            },
            {
              host: "jp2.lunrac.com",
              port: 443
            }
          ]
        },
        nl: {
          servers: [
            {
              host: "nl1.postls.com",
              port: 443
            },
            {
              host: "nl2.postls.com",
              port: 443
            },
            {
              host: "nl3.postls.com",
              port: 443
            },
            {
              host: "nl4.postls.com",
              port: 443
            },
            {
              host: "nl5.postls.com",
              port: 443
            },
            {
              host: "nl6.postls.com",
              port: 443
            },
            {
              host: "nl7.postls.com",
              port: 443
            },
            {
              host: "nl8.postls.com",
              port: 443
            },
            {
              host: "nl9.postls.com",
              port: 443
            },
            {
              host: "nl10.postls.com",
              port: 443
            },
            {
              host: "nl11.postls.com",
              port: 443
            },
            {
              host: "nl12.postls.com",
              port: 443
            },
            {
              host: "nl13.postls.com",
              port: 443
            },
            {
              host: "nl14.postls.com",
              port: 443
            },
            {
              host: "nl15.postls.com",
              port: 443
            },
            {
              host: "nl16.postls.com",
              port: 443
            },
            {
              host: "nl17.postls.com",
              port: 443
            },
            {
              host: "nl18.postls.com",
              port: 443
            },
            {
              host: "nl19.postls.com",
              port: 443
            },
            {
              host: "nl20.postls.com",
              port: 443
            },
            {
              host: "nl26.postls.com",
              port: 443
            },
            {
              host: "nl27.postls.com",
              port: 443
            },
            {
              host: "nl28.postls.com",
              port: 443
            },
            {
              host: "nl29.postls.com",
              port: 443
            },
            {
              host: "nl30.postls.com",
              port: 443
            },
            {
              host: "nl31.postls.com",
              port: 443
            },
            {
              host: "nl32.postls.com",
              port: 443
            },
            {
              host: "nl33.postls.com",
              port: 443
            },
            {
              host: "nl34.postls.com",
              port: 443
            },
            {
              host: "nl35.postls.com",
              port: 443
            },
            {
              host: "nl36.postls.com",
              port: 443
            },
            {
              host: "nl37.postls.com",
              port: 443
            },
            {
              host: "nl38.postls.com",
              port: 443
            }
          ],
          premium_servers: [
            {
              host: "nl2.lunrac.com",
              port: 443
            },
            {
              host: "nl3.lunrac.com",
              port: 443
            }
          ]
        },
        sg: {
          servers: [
            {
              host: "sg1.postls.com",
              port: 443
            },
            {
              host: "sg2.postls.com",
              port: 443
            },
            {
              host: "sg3.postls.com",
              port: 443
            },
            {
              host: "sg4.postls.com",
              port: 443
            },
            {
              host: "sg5.postls.com",
              port: 443
            },
            {
              host: "sg6.postls.com",
              port: 443
            },
            {
              host: "sg7.postls.com",
              port: 443
            },
            {
              host: "sg8.postls.com",
              port: 443
            },
            {
              host: "sg9.postls.com",
              port: 443
            },
            {
              host: "sg10.postls.com",
              port: 443
            },
            {
              host: "sg11.postls.com",
              port: 443
            },
            {
              host: "sg12.postls.com",
              port: 443
            },
            {
              host: "sg13.postls.com",
              port: 443
            },
            {
              host: "sg14.postls.com",
              port: 443
            },
            {
              host: "sg15.postls.com",
              port: 443
            }
          ],
          premium_servers: [
            {
              host: "sg2.lunrac.com",
              port: 443
            },
            {
              host: "sg3.lunrac.com",
              port: 443
            }
          ]
        },
        uk: {
          servers: [
            {
              host: "uk1.postls.com",
              port: 443
            },
            {
              host: "uk2.postls.com",
              port: 443
            },
            {
              host: "uk3.postls.com",
              port: 443
            },
            {
              host: "uk4.postls.com",
              port: 443
            },
            {
              host: "uk5.postls.com",
              port: 443
            },
            {
              host: "uk6.postls.com",
              port: 443
            },
            {
              host: "uk7.postls.com",
              port: 443
            },
            {
              host: "uk8.postls.com",
              port: 443
            },
            {
              host: "uk9.postls.com",
              port: 443
            },
            {
              host: "uk10.postls.com",
              port: 443
            },
            {
              host: "uk11.postls.com",
              port: 443
            },
            {
              host: "uk12.postls.com",
              port: 443
            },
            {
              host: "uk13.postls.com",
              port: 443
            },
            {
              host: "uk14.postls.com",
              port: 443
            },
            {
              host: "uk15.postls.com",
              port: 443
            },
            {
              host: "uk16.postls.com",
              port: 443
            },
            {
              host: "uk17.postls.com",
              port: 443
            },
            {
              host: "uk18.postls.com",
              port: 443
            },
            {
              host: "uk19.postls.com",
              port: 443
            },
            {
              host: "uk20.postls.com",
              port: 443
            },
            {
              host: "uk21.postls.com",
              port: 443
            },
            {
              host: "uk22.postls.com",
              port: 443
            },
            {
              host: "uk23.postls.com",
              port: 443
            }
          ],
          premium_servers: [
            {
              host: "uk5.lunrac.com",
              port: 443
            },
            {
              host: "uk6.lunrac.com",
              port: 443
            }
          ]
        },
        us: {
          servers: [
            {
              host: "us1.postls.com",
              port: 443
            },
            {
              host: "us2.postls.com",
              port: 443
            },
            {
              host: "us3.postls.com",
              port: 443
            },
            {
              host: "us4.postls.com",
              port: 443
            },
            {
              host: "us5.postls.com",
              port: 443
            },
            {
              host: "us6.postls.com",
              port: 443
            },
            {
              host: "us7.postls.com",
              port: 443
            },
            {
              host: "us8.postls.com",
              port: 443
            },
            {
              host: "us9.postls.com",
              port: 443
            },
            {
              host: "us10.postls.com",
              port: 443
            },
            {
              host: "us11.postls.com",
              port: 443
            },
            {
              host: "us12.postls.com",
              port: 443
            },
            {
              host: "us13.postls.com",
              port: 443
            },
            {
              host: "us14.postls.com",
              port: 443
            },
            {
              host: "us15.postls.com",
              port: 443
            },
            {
              host: "us16.postls.com",
              port: 443
            },
            {
              host: "us17.postls.com",
              port: 443
            },
            {
              host: "us18.postls.com",
              port: 443
            },
            {
              host: "us19.postls.com",
              port: 443
            },
            {
              host: "us20.postls.com",
              port: 443
            },
            {
              host: "us21.postls.com",
              port: 443
            },
            {
              host: "us22.postls.com",
              port: 443
            },
            {
              host: "us23.postls.com",
              port: 443
            },
            {
              host: "us24.postls.com",
              port: 443
            },
            {
              host: "us25.postls.com",
              port: 443
            },
            {
              host: "us27.postls.com",
              port: 443
            },
            {
              host: "us28.postls.com",
              port: 443
            },
            {
              host: "us29.postls.com",
              port: 443
            },
            {
              host: "us30.postls.com",
              port: 443
            },
            {
              host: "us31.postls.com",
              port: 443
            },
            {
              host: "us34.postls.com",
              port: 443
            },
            {
              host: "us35.postls.com",
              port: 443
            },
            {
              host: "us36.postls.com",
              port: 443
            },
            {
              host: "us37.postls.com",
              port: 443
            }
          ],
          premium_servers: [
            {
              host: "us3.lunrac.com",
              port: 443
            },
            {
              host: "us4.lunrac.com",
              port: 443
            },
            {
              host: "us5.lunrac.com",
              port: 443
            },
            {
              host: "us6.lunrac.com",
              port: 443
            }
          ]
        },
        usw: {
          premium_servers: [
            {
              host: "usw1.lunrac.com",
              port: 443
            },
            {
              host: "usw2.lunrac.com",
              port: 443
            }
          ]
        }
      }
    }
  }
};

},{}],1:[function(require,module,exports){
var $ = require('jquery');

function internationalize(str) {
  return str.replace(/__MSG_(.+)__/g, function (m, key) {
    return chrome.i18n.getMessage(key);
  });
}

function internationalizePage() {
  document.title = internationalize(document.title);
  internationalizeDocument(document);
}

function internationalizeDocument(document) {
  var iterator = document.evaluate("//text()[contains(., '__MSG_')]", document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
  var textNodes = [];
  var t;
  // save all nodes first as we cannot modify the document while iterating it
  while ((t = iterator.iterateNext()) !== null) {
    textNodes.push(t);
  }

  // i18nize all matching nodes
  for (var i = 0, ii = textNodes.length; i < ii; i++) {
    internationalizeTextNode(textNodes[i]);
  }
}

function internationalizeNodes(nodes) {
  $.each(nodes, function( index, node ) {
    if (node.nodeType == Node.TEXT_NODE) {
      internationalizeTextNode(node);
    }

    if (node.childNodes) {
      internationalizeNodes(node.childNodes);
    }
  });
}

function internationalizeTextNode(textNode) {
  textNode.data = internationalize(textNode.data);
}

$(document).ready(function () {
  internationalizePage();
});

$(document).on('beforepageloaded', function(e) {
  var $content = e.originalEvent.detail.content;
  internationalizeNodes($content);
});

// $(document).on('pageloaded', function() {
//   console.log("pageloaded");
//   internationalizePage();
// });

},{"jquery":"jquery"}],2:[function(require,module,exports){
require('./i18n');

var $ = require('jquery');
var routes = require('./routes');

// TODO(grig): is there a need for browsec to be in the background page?
var bp = chrome.extension.getBackgroundPage();
var browsec = bp.browsec;
var app = bp.app;

$(document).ready(function() {
  $("#login-form").on('submit', function(e) {
    e.preventDefault();
    $("form .notice").fadeOut();
    $("form .error").fadeOut();
    var email = $("#email").val();
    var password = $("#password").val();

    app.account.authenticate(email, password, function(err, result) {
      if (err) {
        $('input').addClass('invalid');
        if (err.status === 401) {
          $("form #auth-error").fadeIn(200);
        } else {
          $("form #system-error").fadeIn(200);
        }
        return;
      }
      setTimeout(function() {
        document.location.href = "popup.html";
      }, 1000);
      $('input').removeClass('invalid');
      $("form #auth-success").fadeIn(200);
    });
  });
  $(".link-register").attr('href', routes.new_user_url);
  $(".b-account--remember").attr('href', routes.reset_password_url);
});

},{"./i18n":1,"./routes":3,"jquery":"jquery"}],3:[function(require,module,exports){
/**
 * Some well-known routes for the server
 *
 * @module ./routes
 */
var config = require('./config');

var baseUrl = config.browsec.baseUrl.replace(/\/$/, '');

var paths = {
  main_path: "/",
  new_user_path: "/users/new?source=extension&utm_source=Chromium+extension&utm_medium=link&utm_campaign=signup",
  premium_path: "/plans?source=extension&utm_source=Chromium+extension&utm_medium=banner&utm_campaign=premium",
  reset_password_path: "/login?source=extension&utm_source=Chromium+extension&utm_medium=link&utm_campaign=restore_pasword#forgot_password",
  contact_us_path: "/contact_us?source=extension&utm_source=Chromium+extension&utm_medium=link&utm_campaign=contact_us"
};

var routes = {
  main_url: baseUrl + paths.main_path,
  new_user_url: baseUrl + paths.new_user_path,
  premium_url: baseUrl + paths.premium_path,
  reset_password_url: baseUrl + paths.reset_password_path,
  contact_us_url: baseUrl + paths.contact_us_path,

  setHrefWithParams : function($a, link, targetBlank) {
    $a.each(function() {
      var hrefParams = this.getAttribute("href-params");
      if (hrefParams) {
      	link = link + "?" + hrefParams;
      }
      this.href = link;
      
      if (targetBlank) {
        this.target = "_blank";
      }
    });
  }
};

module.exports = routes;

},{"./config":"./config"}]},{},[2]);
