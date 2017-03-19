// write data-pinterest-extension-installed, inject logic

(function (w, d, a) {
  var $ = w[a.k] = {
    'w': w,
    'd': d,
    'a': a,
    'b': chrome || firefox || browser,
    's': {},
    'v': {
      'debug': true
    },
    'f': (function () {
      return {
        debug: function (obj) {
          if (obj) {
            console.log(obj);
          }
        },
        init: function () {
          var t;
          $.d.b = $.d.getElementsByTagName('BODY')[0];
          if ($.d.b && $.d.URL) {
            // set data-pinterest-extension-installed on body ONLY IF we are on Pinterest
            t = $.d.URL.split('/');
            if (t[2]) {
              if (t[2].match(/pinterest\.com$/)) {
                $.d.b.setAttribute('data-pinterest-extension-installed', $.v.xv);
              }
            }
            // run the business logic
            if ($.v.logic) {
              try {
                eval($.v.logic);
              } catch (err) {
                $.f.debug('Logic could not eval.');
              }
            }
          }
        }
      };
    }())
  };
  // get everything in local storage and then init
  $.b.storage.local.get(null, function(data) {
    for (var i in data) {
      $.v[i] = data[i];
    }
    $.v['xv'] = 'cr' + $.b.runtime.getManifest().version;
    $.f.init();
  });
}(window, document, {
  'k': 'DUCKIE'
}));
