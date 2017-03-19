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
var config = require('./config').browsec;
var ga = require('./ga');
var codec = require('./utils/codec');

var browsec = function() {
  var apiPrefix = config.apiPrefix || "https://d1blmth2c5vbem.cloudfront.net/v1/";
  var originalDomainApiPrefix = config.originalDomainApiPrefix || config.baseUrl + "api/v1/";
  var locationApiPrefix = config.locationApiPrefix || "http://d1blmth2c5vbem.cloudfront.net/v1/";

  return {
    init: function() {
      $.ajaxSetup({
        tryCount : 0,
        retryLimit : 1,
        timeout: 10000,
        retry: function() {
          this.tryCount++;
          if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return true;
          } else {
            return false;
          }
        }
      });
    },

    /**
     * authenticate user and obtain access credentials.
     *
     * @param username String username or email
     * @param password String password
     * @param callback Function callback receiving credentials
     */
    authenticate : function (username, password, callback) {
      $.ajax({
        type: "POST",
        url: apiPrefix + "authentication",
        data: {
          email: username,
          password: password
        },
        async: true,
        success: function(data, textStatus, jqXHR) {
          callback(null, data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          var error;
          if (jqXHR.status == 401) {
            error = {status: 401, error: "unauthorized"};
            callback(error);
          } else {
            error = {status: textStatus, error: errorThrown};
          }
          callback(error);
          console.log("browsec.authenticate", "ERROR", JSON.stringify(error));
          ga.trackEvent("error", "browsec.authenticate", JSON.stringify(error));
        }
      });
    },

    /**
     * Un-registers current set of credentials with the server.
     */
    deauthenticate: function(credentials, callback) {
      callback = callback || function() {};

      var headers = {};
      if (credentials) {
        /* jshint -W069 */
        headers['Authorization'] = codec.encodeTokenCredentials(credentials);
        /* jshint +W069 */
      }
      $.ajax({
        type: "DELETE",
        url: apiPrefix + "authentication",
        headers: headers,
        async: true,
        success: function(data, textStatus, jqXHR) {
          callback(null, data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          var error;
          if (jqXHR.status == 401) {
            error = {status: 401, error: "unauthorized"};
            callback(error);
          } else {
            error = {status: textStatus, error: errorThrown};
          }
          callback(error);
          console.log("browsec.deauthenticate", "ERROR", JSON.stringify(error));
          ga.trackEvent("error", "browsec.deauthenticate", JSON.stringify(error));
        }
      });
    },

    ipInfo : function (callback) {
      var start;

      $.ajax({
        type: "GET",
        url: locationApiPrefix + "location?locale=" + chrome.runtime.getManifest().current_locale,
        async: true,
        success: function(data, textStatus, jqXHR) {
          callback(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          this.retry();
        },
        beforeSend: function() {
          start = Date.now();
        },
        complete: function() {
          var duration = Date.now() - start;
          console.debug("Location request duration %d ms", duration);
        }
      });
    },

    signup : function() {
      try {
        console.group("Signing up new user");

        var result = null;

        $.ajax({
          type: "POST",
          url: apiPrefix + "signup",
          async: false,
          success: function(data, textStatus, jqXHR) {
            console.log("Response status: %d", data.status);
            if (data.status === 0) {
              result = data.result;
            } else {
              ga.trackEvent("error_signup", data);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            if (!this.retry()) {
              ga.trackEvent("error_signup", textStatus, errorThrown);
            }
          }
        });

        return result;
      } finally {
        console.groupEnd();
      }
    },

    checktrial: function(callback){

        $.ajax({
          type: "POST",
          url: apiPrefix + "get_trial_premium",
          async: true,
          dataType: "json",
          jsonp: false,
          success: function(data, textStatus, jqXHR) {
            if (typeof callback === 'function'){
              callback(null,data);  
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            if (typeof callback === 'function'){
              callback({status: textStatus, error: errorThrown});  
            }
          }
        });

    },

    servers: function(callback) {
      var canceled = false;

      var xhr = $.ajax({
        type: "GET",
        url: apiPrefix + "servers",
        async: true,
        success: function(data, textStatus, jqXHR) {
          if (canceled) {
            if (typeof callback === 'function') {
              callback('canceled');
            }
            return;
          }

          if (typeof callback === 'function') {
            callback(null, data);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (canceled) {
            // Aborted request return textStatus == 'abort', errorThrown == 'abort'.
            // We might have checked for these statuses; however, once a task
            // has been canceled, any status should be ignored.
            console.log('servers', 'request canceled: status:', textStatus, 'error:', errorThrown);
            // may check for XHR
            if (typeof callback === 'function') {
              callback('canceled');
            }
            return;
          }
          var error = {status: textStatus, error: errorThrown};
          console.error("browsec.servers", JSON.stringify(error));
          ga.trackEvent("error", "browsec.servers", JSON.stringify(error));
          callback(error);
        }
      });
      var task = {
        cancel: function() {
          canceled = true;
          xhr.abort();
        }
      };
      return task;
    },
    account: function(credentials, callback) {
      var headers = {};
      var url = originalDomainApiPrefix + "account";
      if (credentials) {
        /* jshint -W069 */
        headers['Authorization'] = codec.encodeTokenCredentials(credentials);
        /* jshint +W069 */
        url = apiPrefix + "account";
      }
      $.ajax({
        type: "GET",
        url: url,
        headers: headers,
        async: true,
        success: function(data, textStatus, jqXHR) {
          console.log("browsec.account", "data", data);
          callback(null, data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (!this.retry()) {
            callback({status: textStatus, error: errorThrown});
            ga.trackEvent("error", "browsec.account", JSON.stringify({status: textStatus, error: errorThrown}));
          }
        }
      });
    },
    
    premiumSignup: function(email, token, success, error) {
      $.ajax({
        method: "POST",
        contentType: "application/json",
            url: config.baseUrl + "en/users.json",
        data: JSON.stringify({
          user: {
            email: email,
            create_password_after_activation: true,
            trial_premium_token: token
          }
        }),
        // async: false,
        success: function(data, textStatus, jqXHR) {
          console.log("Response status: %d", data.status);
          console.log(data);
          return success(data, textStatus, jqXHR);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
          return error(jqXHR, textStatus, errorThrown);
        }
      });
    }
  };
}();

module.exports = browsec;

},{"./config":"./config","./ga":2,"./utils/codec":5,"jquery":"jquery"}],2:[function(require,module,exports){
(function (global){
var config = require('./config').ga;

if (config.enabled) {
  // Google Analytics
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
  global._gaq = global._gaq || [];
  _gaq.push(['_setSampleRate', '1']);
  _gaq.push(['_setAccount', config.tracking_id]);
  _gaq.push(['_trackPageview']);

  var ga = {
    trackEvent : function (category, action, label, value, noninteraction) {
      // Track events only in production
      console.log("Track event: " + JSON.stringify([category, action, label, value, noninteraction]));
      if (!config.extension_id || config.extension_id === chrome.i18n.getMessage("@@extension_id")) {
        _gaq.push(['_trackEvent', category, action, label, value, noninteraction]);
      }
    }
  };
} else {
  var ga = {
    trackEvent: function() {
      console.log("ga.trackEvent", "[DISABLED]", arguments);
    }
  };
}

module.exports = ga;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config":"./config"}],3:[function(require,module,exports){
(function (global){
/**
 * Created by culebron on 20.08.16.
 */

var config = require('./config').browsec;
var browsec = global.browsec = require('./browsec');
var $ = window.jQuery = require('jquery');
var validateEmail = require('./utils/email.js').validate_email;
var functools = require('./utils/functools.js');
var routes = require('./routes');


var bp = chrome.extension.getBackgroundPage();
var app = bp.app;


$(document).ready(function () {
  var blink_counter = 6,
      title_text = document.title,
      blink_fn = function() {
        blink_counter -= 1;
        // space is a combo of invisible separator (u+2063) and medium math space (u+205f)
        document.title = (document.title == title_text ? '⁣⁣⁣⁣⁣⁣⁣ ' : title_text);
        if (blink_counter > 0)
          setTimeout(blink_fn, 300);
      };

  if (document.hidden) {
    blink_fn();
  }

  var jContainer = $('.offerHead'),
    containerClasses = ['_showSignUp', '_showSignIn', '_showSignSuccess', '_showSignInSuccess'],
    jSignup = $('#signup-form'),
    jSignin = $('#signin-form'),
    toggleButton = function(jForm, status) {
      var jBtn = $('button[type=submit]', jForm);
      if (status)
        return jBtn.removeAttr('disabled');
      return jBtn.attr('disabled', 'disabled');
    },
    signUpSubmit = function(e) {
      var jEmail = $('[name=email]', jSignup),
        email = jEmail.val();
      e.preventDefault();

      if (!validateEmail(email.trim())) {
        toggleError(jSignup, true, 'Invalid Email');
        return false;
      }

      toggleButton(jSignup, false);
      toggleError(jSignup);

      browsec.premiumSignup(email, localStorage.trial_premium_token, function(data) {
          toggleButton(jSignup, true);
          if (data.status === 0) {
            togglePanels('_showSignSuccess');
            $('.jShowGmail').toggle(email.indexOf('@gmail.com') > 0); // gmail link
          } else if (data.error.indexOf('already exists') !== -1) {
            jEmail.val('');
            togglePanels('_showSignIn');
            localStorage.signInEmail = email;
          } else {
            toggleError(jSignup, true, data.error);
          }
        },
        function() {
          toggleButton(jSignup, true);
          toggleError(jSignup, true, 'Network error.');
        }

      );

      return false;
    },
    togglePanels = function(classname) {
      if (containerClasses.indexOf(classname) == -1)
        throw new Error('classname must be one of the following: ' + containerClasses.join(', '));
      containerClasses.forEach(function(v) {
        jContainer.toggleClass(v, v == classname);
      });
    },
    toggleError = function(panelObj, status, message) {
      panelObj.toggleClass('error', status).find('.error-text').text(message || '');
      // if error is shown, then remove it after user inputs something in the form
      if (status) {
        panelObj.find('.note-text').hide();
        panelObj.find(':text,:password').one('keyup change', function() {
          toggleError(panelObj);
        })
      }
    },
    signInSubmit = function(e) {
      toggleError(jSignin);
      toggleButton(jSignin, false);

      app.account.authenticate(localStorage.signInEmail, jSignin.find('[name=pw]').val(), function(err, user) {

        toggleButton(jSignin, true);
        if (err && err.error == 'unauthorized') {
          toggleError(jSignin, true, 'Incorrect password');
        }
        else if (err && err.error == '') {
          toggleError(jSignin, true, 'Network or server error');
        }
        else {
          togglePanels('_showSignInSuccess');
        }
      });
      e.preventDefault();
      return false;
    };


  jSignup.on('submit', signUpSubmit);
  jSignin.on('submit', signInSubmit);
  $('.jShowSignUp').on('click', functools.curry(togglePanels, '_showSignUp'));
  $('.forgot__a').attr('href', routes.reset_password_url);
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./browsec":1,"./config":"./config","./routes":4,"./utils/email.js":6,"./utils/functools.js":7,"jquery":"jquery"}],4:[function(require,module,exports){
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

},{"./config":"./config"}],5:[function(require,module,exports){
/**
 * @module ./utils/codec
 */

function encodeCredentials(credentials) {
  if (credentials.username !== undefined) {
    return encodeBasicCredentials(credentials);
  } else if (credentials.access_token !== undefined) {
    return encodeTokenCredentials(credentials);
  } else {
    throw new Error('unknown credentials type: ' + JSON.stringify(credentials));
  }
}

function encodeBasicCredentials(credentials) {
  return "Basic " + btoa(credentials.username + ":" + credentials.password);
}

function encodeTokenCredentials(credentials) {
  return "Token token=\"" + credentials.access_token + "\"";
}
exports.encodeTokenCredentials = encodeTokenCredentials;
},{}],6:[function(require,module,exports){
/** @module ./utils/email ...*/


function validate_email(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

exports.validate_email = validate_email;

},{}],7:[function(require,module,exports){

curry = function(func) {
  parameters = Array.prototype.slice.call(arguments, 1);
  return function () {
    func.apply(this, parameters.concat(Array.prototype.slice.call(arguments, 0)));
  }
}

module.exports.curry = curry
},{}]},{},[3]);
