// don't show inline pinning or search affordances to users who are not logged in to Pinterest

(function (w, d, n, a) {
  var $ = w[a.k] = {
    'w': w,
    'd': d,
    'a': a,
    'n': n,
    'b': chrome || firefox || browser,
    's': {},
    'v': {
      'debug': true,
      'noPin': false,
      'og': {},
      'contextEl': null,
      'options': {}
    },
    'f': (function () {
      return {

        // debug
        debug: function (str) {
          if (str && $.v.debug === true) {
            console.log($.v.xv + ': ' + str);
          }
        },

        // compute the SHA-1 hash for a string
        getHash: function (str) {
          function rstr2binb (input) {
            var output = Array(input.length >> 2);
            for (var i = 0; i < output.length; i++) {
              output[i] = 0;
            }
            for (i = 0; i < input.length * 8; i += 8) {
              output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            }
            return output;
          }
          function binb2rstr (input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8) {
              output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
            }
            return output;
          }
          function safe_add (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
          }
          function bit_rol (num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
          }
          function binb_sha1 (x, len) {
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;
            var w = Array(80);
            var a =  1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d =  271733878;
            var e = -1009589776;
            for (var i = 0; i < x.length; i += 16) {
              var olda = a;
              var oldb = b;
              var oldc = c;
              var oldd = d;
              var olde = e;
              for (var j = 0; j < 80; j++) {
                if (j < 16) {
                  w[j] = x[i + j];
                } else {
                  w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                }
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
              }
              a = safe_add(a, olda);
              b = safe_add(b, oldb);
              c = safe_add(c, oldc);
              d = safe_add(d, oldd);
              e = safe_add(e, olde);
            }
            return Array(a, b, c, d, e);
          }
          function sha1_ft (t, b, c, d) {
            if(t < 20) return (b & c) | ((~b) & d);
            if(t < 40) return b ^ c ^ d;
            if(t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
          }
          function sha1_kt (t) {
            return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 : (t < 60) ? -1894007588 : -899497514;
          }
          function rstr_sha1 (s) {
            return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
          }
          function rstr2hex (input) {
            var hex_tab = "0123456789abcdef";
            var output = "";
            var x;
            for (var i = 0; i < input.length; i++) {
              x = input.charCodeAt(i);
              output = output + hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
            }
            return output;
          }
          return rstr2hex(rstr_sha1(str));
        },

        // get a DOM property or text attribute
        get: function (el, att) {
          var v = null;
          if (typeof el[att] === 'string') {
            v = el[att];
          } else {
            v = el.getAttribute(att);
          }
          return v;
        },

        // set a DOM property or text attribute
        set: function (el, att, string) {
          if (typeof el[att] === 'string') {
            el[att] = string;
          } else {
            el.setAttribute(att, string);
          }
        },

        // create a DOM element
        make: function (obj) {
          var el = false, tag, att, key;
          for (tag in obj) {
            if (obj[tag].hasOwnProperty) {
              el = $.d.createElement(tag);
              for (att in obj[tag]) {
                if (obj[tag][att].hasOwnProperty) {
                  if (typeof obj[tag][att] === 'string') {
                    $.f.set(el, att, obj[tag][att]);
                  } else {
                    if (att === 'style') {
                      for (key in obj[tag][att]) {
                        el.style[key] = obj[tag][att][key];
                      }
                    }
                  }
                }
              }
              break;
            }
          }
          return el;
        },

        // remove a DOM element
        kill: function (obj) {
          if (typeof obj === 'string') {
            obj = $.d.getElementById(obj);
          }
          if (obj && obj.parentNode) {
            obj.parentNode.removeChild(obj);
          }
        },

        // find an event's target element
        getEl: function (e) {
          var el = null;
          if (e.target) {
            el = (e.target.nodeType === 3) ? e.target.parentNode : e.target;
          } else {
            el = e.srcElement;
          }
          return el;
        },

        // listen for events
        listen: function (el, ev, fn) {
          if (el) {
            if (typeof $.w.addEventListener !== 'undefined') {
              el.addEventListener(ev, fn, false);
            } else if (typeof $.w.attachEvent !== 'undefined') {
              el.attachEvent('on' + ev, fn);
            }
          }
        },

        // return the domain part of an URL
        getDomain: function (url) {
          var p = url.split('/');
          if (p[2]) {
            return p[2];
          } else {
            return url;
          }
        },

        // get the position of a DOM element
        getPos: function (el) {
          var x = 0, y = 0;
          if (el.offsetParent) {
            do {
              x = x + el.offsetLeft;
              y = y + el.offsetTop;
            } while (el = el.offsetParent);
            return {"left": x, "top": y};
          }
        },

        // get negative top or left margins
        getMargin: function (el, prop) {
          var margin;
          margin = getComputedStyle(el).getPropertyValue("margin-" + prop);
          if (margin) {
            margin = margin.split('px')[0];
          }
          if (margin > 0) {
            margin = 0;
          }
          margin = parseInt(margin);
          return margin;
        },

        // send a message
        sendMessage: function (obj) {
          $.f.debug('Sending message');
          $.f.debug(JSON.stringify(obj));
          $.b.runtime.sendMessage(obj, function() {});
        },

        // log from the background process
        log: function (obj) {
          var i, str = '';
          // optional parameters
          if (obj) {
            for (i in obj) {
              if (typeof obj[i] !== 'undefined') {
                str = str + '&' + i + '=' + obj[i];
              }
            }
          }
          str = str + '&lv=' + $.a.logicVersion + '&via=' + encodeURIComponent($.d.URL);
          $.f.debug('logging');
          $.f.debug(JSON.stringify(obj));
          $.f.sendMessage({'to': 'background', 'act': 'logAction', 'data': str});
        },

        // if we have more parts in our domain left to try, concatenate and try again
        hashDomain: function () {
          $.f.debug('getting hash for ' + $.v.hashDomain);
          $.f.gotDomainHash($.f.getHash($.v.hashDomain));
        },

        // check meta tags
        metaCheck: function () {
          var canHaz = true, i, n, name, content, property;
          $.v.meta = $.d.getElementsByTagName('META');
          for (i = 0, n = $.v.meta.length; i < n; i = i + 1) {
            name = $.v.meta[i].getAttribute('name');
            content = $.v.meta[i].getAttribute('content');
            property = $.v.meta[i].getAttribute('property');

            if (property && property.match(/^og:/) && content) {
              var tag = property.split(':')[1];
              $.v.og[tag] = content;
            }

            if (name && content && name.toLowerCase() === 'pinterest') {
              content = content.toLowerCase();
              if (content === 'nopin') {
                $.v.noPin = true;
                canHaz = false;
              }
              if (content === 'nohover') {
                $.v.hideHoverButtons = true;
                canHaz = false;
              }
            }
          }
          return canHaz;
        },

        // mouse over; only active if we have floaters
        over: function (e) {
          var p, el, url, media, h, w, marginTop, marginLeft;

          if (!$.v.hideHoverButtons && $.s.buttonSave) {
            el = $.f.getEl(e);
            if (el && !$.v.noPin) {
              if (el === $.s.buttonSave || el === $.s.buttonSearch) {
                $.w.clearTimeout($.v.hazFade);
                return;
              }
              if (el.tagName === 'IMG') {
                if (el.src) {
                  if (!$.f.get(el, 'nopin') && !$.f.get(el, 'data-pin-nopin')) {
                    if (!$.f.get(el, 'data-pin-no-hover')) {
                      h = el.naturalHeight || el.height;
                      w = el.naturalWidth || el.width;
                      if ((h > 99 && w > 99) && (h > 199 || w > 199)) {
                        if (w < h * 3) {
                          if ($.v.hazButton === false) {
                            p = $.f.getPos(el);
                            marginTop = $.f.getMargin(el, 'top');
                            marginLeft = $.f.getMargin(el, 'left');
                            $.w.clearTimeout($.v.hazFade);
                            $.v.hazButton = true;
                            url = $.f.get(el, 'data-pin-url') || $.d.URL;
                            media = $.f.get(el, 'data-pin-media') || el.src;
                            $.s.buttonSave.style.top = (p.top + $.a.position.offsetTop - marginTop) + 'px';
                            $.s.buttonSave.style.left = (p.left + $.a.position.offsetLeft - marginLeft) + 'px';
                            $.s.buttonSave.style.display = 'block';
                            $.v.hoverImage = el;
                            if ($.v.canHazSearch) {
                              $.s.buttonSearch.style.top = (p.top + $.a.position.offsetTop - marginTop) + 'px';
                              $.s.buttonSearch.style.left = (p.left + $.a.position.offsetLeft - marginLeft + $.s.buttonSave.offsetWidth + 5) + 'px';
                              $.s.buttonSearch.style.display = 'block';
                            }
                          }
                        }
                      } else {
                        $.f.set(el, 'data-pin-nopin', true);
                      }
                    }
                  }
                }
              }
            }
          }
        },

        // hide hoverbutton
        hide: function () {
          if (!$.v.noPin && $.s.buttonSave) {
            $.v.hazButton = false;
            $.v.hazFade = $.w.setTimeout(function () {
              $.s.buttonSave.style.display = 'none';
              if ($.v.canHazSearch) {
                $.s.buttonSearch.style.display = 'none';
              }
            }, 10);
          }
        },

        // mouse out
        out: function () {
          if ($.v.hazButton === true) {
            $.v.hazButton = false;
            $.f.hide();
          }
        },

        // position and size the pin create form
        getPop: function () {
          var top, left, height, width, popTop, popLeft;
          top = $.w.screenY || $.w.screenTop || 0;
          left = $.w.screenX || $.w.screenLeft || 0;
          height = $.d.b.clientHeight || $.w.innerHeight || 0;
          width = $.d.b.clientWidth || $.w.innerWidth || 0;
          popTop = top + 200;
          popLeft = left + (width / 2) - ($.a.pop.width / 2);
          return $.a.pop.base + 'height=' + $.a.pop.height + ',width=' + $.a.pop.width + ',left=' + popLeft + ',top=' + popTop;
        },

        // open the pin create form
        pop: function (img, method) {


          if (!method) {
            // default to hoverbutton method
            method = 'h';
          }

          var description, query, url, media, patched, id, logMe;

          patched = $.f.patchImage(img);

          logMe = {'event': 'click', 'xm': method};

          // new pin
          description = $.f.get(img, 'data-pin-description') || patched.description || img.title || img.alt || $.d.title;
          url = $.f.get(img, 'data-pin-url') || patched.url || $.d.URL;
          media = $.f.get(img, 'data-pin-media') || patched.media || img.src;
          id = $.f.get(img, 'data-pin-id');

          $.f.log(logMe);

          if ($.v.hazLogin) {

            // we're going to pin inline
            $.f.sendMessage({
              'to': 'background',
              'act': 'openCreateForm',
              'data': {
                'media': media,
                'url': url,
                'description': description,
                'id': id || undefined,
                'method': method
              }
            });
          } else {
            if (id) {
              // repin
              query = $.v.rePinCreate.replace(/%s/, id);
              // log the pin ID
              logMe.repin = id;
            } else {
              query = $.v.pinCreate + '?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(media) + '&xm=' + method + '&xv=' + $.v.xv + '&xuid=' + $.v.xuid + '&description=' + encodeURIComponent(description);
            }
            $.w.open(query, 'pin' + new Date().getTime(), $.f.getPop());
          }
        },

        // check an image for pinnability
        check: function (img, method) {
          if (!img.src || $.v.noPin || $.f.get(img, 'data-pin-nopin') || $.f.get(img, 'nopin')) {
            $.f.act.warn();
          } else {
            $.f.pop(img, method);
          }
        },

        // also called by extension framework for right-click-to-pin
        noPinList: function () {
          var i, n, domain, r;
          r = false;
          domain = $.f.getDomain($.d.URL);
          for (i = 0, n = $.a.privateList.length; i < n; i = i + 1) {
            if (domain.match($.a.privateList[i])) {
              $.v.noPin = true;
              r = true;
              break;
            }
          }
          return r;
        },

        // should we hide hoverbuttons?
        noHoverList: function () {
          var i, n, domain, r, j, k, parts, check, base, hash, h;
          r = false;
          // check list of known private/login domains
          for (i = 0, n = $.a.noHoverPageList.length; i < n; i = i + 1) {
            if ($.d.URL.match($.a.noHoverPageList[i])) {
              r = true;
              break;
            }
          }
          return r;
        },

        // called by background process for right-click-to-pin
        rightClick: function () {
          $.f.debug('context element');
          $.f.debug($.v.contextEl);
          if ($.v.contextEl) {
            $.f.check($.v.contextEl, 'r');
          } else {
            $.f.debug('No context element');
          }
        },

        // save button click
        buttonSaveClick: function () {
          $.f.check($.v.hoverImage, 'h');
        },

        // search button click
        buttonSearchClick: function () {
          if ($.v.canHazSearch) {
            if ($.v.debug) {
              $.f.act.openDevSearch();
            } else {
              $.f.act.openSearch();
            }
          }
        },

        // should the button appear on this page?
        canHazButton: function () {
          // no need to build structure if we're not showing hoverbuttons
          if ($.v.hideHoverButtons) {
            return false;
          }
          var i, n, script, src, meta, name, content;
          // no images? no button
          if (!$.d.getElementsByTagName('IMG').length) {
            $.v.hideHoverButtons = true;
            return false;
          }
          // if we find data-pin-hover, meaning pinit.js is already running with hoverbuttons
          if ($.f.get($.d.b, 'data-pin-hover')) {
            $.v.hideHoverButtons = true;
            return false;
          }
          // if we find pinit.js with data-pin-hover, meaning pinit.js has data-pin-hover but has not loaded yet
          script = $.d.getElementsByTagName('SCRIPT');
          for (i = 0, n = script.length; i < n; i = i + 1) {
            src = script[i].src;
            if (src && src.match($.a.urlPattern.pinitJs)) {
              if (script[i].getAttribute('data-pin-hover')) {
                $.v.hideHoverButtons = true;
                return false;
                break;
              }
            }
          }
          // meta name=pinterest content=hover or content=nopin
          if (!$.f.metaCheck()) {
            return false;
          }
          // if we find a Pinterest app domain, which has three or less numbers or letters, an optional dot, and then pinterest.com
          if ($.d.URL.match($.a.urlPattern.pinterestApp)) {
            $.v.hideHoverButtons = true;
            return false;
          }

          // check document.URL against gray list
          if ($.f.noPinList() || $.f.noHoverList()) {
            return false;
          }

          return true;
        },

        // find and apply deep links on search engine results
        patchImage: function (img) {
          var k, r;
          r = {
            'description':'',
            'url':'',
            'media': ''
          };
          for (k in $.a.patchImage) {
            if ($.d.URL.match($.a.patchImage[k].seek)) {
              r = $.a.patchImage[k].patch(img, $);
              break;
            }
          }
          return r;
        },

        // do stuff with domain hash
        gotDomainHash: function (hash) {
          // fail out if we don't have a hash list to look at
          if ($.v.hashList && $.v.hashList.theList && $.v.hashList.theList.length && $.v.hashList.theOtherList && $.v.hashList.theOtherList.length) {
            $.f.debug('domain hash: ' + hash);
            var hashFrag = hash.substr(0, 12);
            // check gray list
            if (!$.v.hideHoverButtons) {
              for (i = 0, n = $.v.hashList.theList.length; i < n; i = i + 1) {
                if (hashFrag === $.v.hashList.theList[i]) {
                  $.f.debug($.d.URL + ' is on theList');
                  $.v.hideHoverButtons = true;
                  break;
                }
              }
            }
            // check banned doman list
            if (!$.v.hideHoverButtons) {
              for (i = 0, n = $.v.hashList.theOtherList.length; i < n; i = i + 1) {
                if (hashFrag === $.v.hashList.theOtherList[i]) {
                  $.f.debug($.d.URL + ' is on theOtherList');
                  $.v.hideHoverButtons = true;
                  $.v.noPin = true;
                  break;
                }
              }
            }
            // did not found on $.a.theList? got more parts? go again
            if (!$.v.hideHoverButtons) {
              if ($.v.hashDomainParts.length) {
                $.v.hashDomain = $.v.hashDomainParts.pop() + '.' + $.v.hashDomain;
                $.f.hashDomain();
              }
            }
          } else {
            $.f.debug(' cannot check ' + hash + ' because $.v.hashList is damaged or missing');
          }
        },

        // set an object in local storage
        setLocal: function (obj) {
          $.b.storage.local.set(obj);
        },

        // given window.navigator.language, return appropriate strings and domain
        langLocLookup: function (str) {

          var t, i, lang, locale, hazAltDomain, q;

          // default to window.navigator.language if no value
          if (!str) {
            str = $.n.language;
          }
          $.f.debug('Looking up language and domain for ' + str);

          // defaults: English, WWW
          $.v.lang = 'en';
          $.v.domain = 'www';

          // clean and split
          t = str.toLowerCase();
          t = t.replace(/[^a-z0-9]/g, ' ');
          t = t.replace(/^\s+|\s+$/g, '')
          t = t.replace(/\s+/g, ' ');
          t = t.split(' ');

          // fix three-parters like bs-latn-ba
          if (t.length > 2) {
            for (i = t.length-1; i > -1; i = i - 1) {
              if (t[i].length !== 2) {
                t.splice(i, 1);
              }
            }
          }

          // do we have strings that match t[0];
          if (t[0]) {
            lang = t[0];
            // is there an immediate match for language in strings?
            if ($.a.save.string[lang]) {
              $.v.lang = lang;
            }
            // is there an immediate match for language in domains?
            if ($.a.save.domain[lang]) {
              $.v.domain = lang;
            }
            // do we have a locale?
            if (t[1]) {
              locale = t[1];
              if (locale !== lang) {
                hazAltDomain = false;
                q = $.a.save.lookup[lang];
                // find it in list?
                if (q) {
                  // bare domain like fi needs to allow fi-us
                  if (q === true) {
                    if (!$.a.save.domain[locale]) {
                      $.v.domain = 'www';
                    }
                  } else {
                    // some domains don't match string abbreviation
                    if (q.d === locale) {
                      // domain matches main default, as for hi-in
                      $.v.domain = q.d;
                    } else {
                      // got alt?
                      if (q.alt) {
                        if (q.alt[locale]) {
                          if (typeof q.alt[locale] === 'string') {
                            // alt dom is a string, as for gb = uk, no lookup needed
                            $.v.domain = q.alt[locale];
                          } else {
                            if (q.alt[locale].d) {
                              // domain is different, as for pt-br
                              $.v.domain = q.alt[locale].d;
                              hazAltDom = true;
                            }
                            if (q.alt[locale].s) {
                              // strings are different as for fr-be or tr-cy
                              $.v.lang = q.alt[locale].s;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                // if we don't have an alternate domain, use the default for this domain
                if (!hazAltDomain) {
                  if ($.a.save.domain[locale]) {
                    $.v.domain = locale;
                  }
                }
              }
            }
          }
          $.f.debug('Lang: ' + $.v.lang);
          $.f.debug('Domain: ' + $.v.domain);
          $.f.setLocal({'lang': $.v.lang});
          return { 's': $.v.lang, 'd': $.v.domain};
        },

        act: {
          updateSearch: function () {
            $.f.canHazSearch();
          },
          warn: function () {
            $.w.alert($.v.noPinError);
          },
          rightClick: function () {
            $.f.rightClick();
          },
          runPinmarklet: function () {
            if ($.v.pinmarklet) {
              try {
                eval($.v.pinmarklet);
              } catch (err) {
                // here we need to give up and run pinmarklet as before with SCRIPT tag
                // logging an error
                $.f.debug($.v.pinmarklet);
                $.f.debug(err);
              }
            } else {
              alert('pinmarklet not loaded');
            }
          },

          closeSearch: function () {
            $.f.debug('closing Search');
            $.f.kill($.s.search);
          },

          openSearch: function (r, dev) {
            var path = '/html/search.html';
            if (dev) {
              path = '/dev' + path;
            }
            $.s.search = $.f.make({'IFRAME':{
              'src': $.b.extension.getURL(path),
              'style': $.a.iframe.style
            }});
            var url, img, xm;
            url = $.d.URL;
            if ($.v.hoverImage && $.v.hoverImage.src) {
              img = $.v.hoverImage.src;
              xm = 'h';
            }
            if (r && r.data) {
              if (r.data.screencap) {
                img = r.data.screencap;
                xm = 'r';
              }
              if (r.data.xm && r.data.xm === 'g') {
                url = r.data.url;
                img = r.data.img;
                xm = 'g';
              }
            }

            $.s.search.onload = function () {
              $.s.search.focus();
              $.b.runtime.sendMessage({'to': 'background', 'act': 'openSearch', 'data': {'via': url, 'src': img, 'xm': xm}}, function() {});
            };
            $.d.b.appendChild($.s.search);
          },

          openDevSearch: function (r) {
            $.f.act.openSearch(r, true);
          },

          closeGrid: function () {
            $.f.debug('closing the grid');
            $.f.kill($.s.grid);
          },
          openGrid: function (r, dev) {
            var path = '/html/grid.html';
            if (dev) {
              path = '/dev' + path;
            }
            $.s.grid = $.f.make({'IFRAME':{
              'src': $.b.extension.getURL(path),
              'style': $.a.iframe.style
            }});
            $.s.grid.onload = function () {
              $.s.grid.focus();
              $.f.act.runPinmarklet();
            };
            $.d.b.appendChild($.s.grid);
          },
          openDevGrid: function (r) {
            $.f.act.openGrid(r, true);
          },

          closeCreateForm: function () {
            if ($.s.createForm) {
              $.s.createForm.parentNode.removeChild($.s.createForm);
            }
          },
          openCreateForm: function (r, dev) {
            var path = '/html/create.html';
            if (dev) {
              path = '/dev' + path;
            }
            $.s.createForm = $.f.make({'IFRAME':{
              'src': $.b.extension.getURL(path),
              'style': $.a.iframe.style
            }});
            $.s.createForm.onload = function () {
              $.s.createForm.focus();
              $.b.runtime.sendMessage({'to': 'background', 'act': 'populateCreateForm', 'data': r.data}, function() {});
            };
            $.d.b.appendChild($.s.createForm);
          },
          openDevCreateForm: function (r) {
            $.f.act.openCreateForm(r, true);
          }
        },

        // right-click menu
        context: function(e){
          if (e.button === 2) {
            var t = e.target;
            if (t && t.tagName && t.tagName === 'IMG') {
              $.v.contextEl = t;
            }
          }
        },

        // set access to image search here
        canHazSearch: function () {
          var i, j, k, seg;

          // defafult: nobody gets it
          $.v.canHazSearch = false;
          
          if ($.v.hazLogin) {
            // if we find a Pinterest app domain, which has three or less numbers or letters, an optional dot, and then pinterest.com
            if ($.d.URL.match($.a.urlPattern.pinterestApp)) {
              $.f.debug('On a Pinterest page.');
              // no running visual search from Pinterest, please
            } else {
              if ($.v.alwaysCanHazSearch === true) {
                $.v.canHazSearch = true;
              } else {
                // get our search population segment
                seg = 0;
                // hash the xuid + the logic version
                k = $.f.getHash($.v.xuid + $.a.logicVersion);
                // turn hash into a base-100 number
                for (i = 0; i < k.length; i = i + 1) {
                  seg = seg + parseInt(k[i], 16);
                  seg = seg % 100;
                }
                if (seg >= $.a.seg.min && seg <= $.a.seg.max) {
                  $.f.debug('Search is ON because you are in population segment ' + seg);
                  $.v.canHazSearch = true;
                } else {
                  $.v.canHazSearch = false;
                }
              }
            }
          }

          // context menus will check local storage before showing the Search menu
          $.f.setLocal({'canHazSearch': $.v.canHazSearch});
          $.w.setTimeout(function () {
            $.f.debug('canHazSearch: ' + $.v.canHazSearch);
            $.f.sendMessage({'to': 'background', 'act': 'showContextMenus'});
          }, 10);
        },

        // configuration has been loaded into $.v from local storage; we are ready to go
        init: function (browser) {

          $.d.b = $.d.getElementsByTagName('BODY')[0];
          $.f.langLocLookup();

          // if an incoming message from script is for us and triggers a valid function, run it
          $.b.runtime.onMessage.addListener(function(r) {
            $.f.debug(r);
            // $ was overwritten during testing; let's make sure it's the one we think it is
            if ($.a.k !== a.k) {
              $ = w[a.k];
            }
            if (r.to && r.to === $.a.me) {
              if (r.act && typeof $.f.act[r.act] === 'function') {
                $.f.act[r.act](r);
              }
            }
          });

          if (!$.v.hideHoverButtons) {
            var i, n;
            // check list of known private/login domains
            for (i = 0, n = $.a.noHoverPageList.length; i < n; i = i + 1) {
              if ($.d.URL.match($.a.noHoverPageList[i])) {
                $.f.debug($.d.URL + ' is on noHoverPageList');
                $.v.hideHoverButtons = true;
                break;
              }
            }
          }

          // start getting the hashes for this domain
          $.v.hashDomainParts = $.f.getDomain($.d.URL).split('.');
          $.v.hashDomain = $.v.hashDomainParts.pop();
          $.v.hashDomain = $.v.hashDomainParts.pop() + '.' + $.v.hashDomain;

          $.f.hashDomain();

          $.v.pinCreate = $.a.endpoint.pinCreate.replace(/www/, $.v.domain);
          $.v.rePinCreate = $.a.endpoint.rePinCreate.replace(/www/, $.v.domain);
          $.v.noPinError = $.b.i18n.getMessage("errorPin");

          // don't make a button on pages that can't show a button
          if ($.f.canHazButton()) {
            $.v.hazButton = false;

            $.s.buttonSave = $.f.make({'SPAN':{
              'style': $.a.save.style,
              'innerHTML': $.a.save.string[$.v.lang]|| $.a.save.string['en']
            }});
            $.d.b.appendChild($.s.buttonSave);
            $.f.listen($.s.buttonSave, 'click', $.f.buttonSaveClick);

            if ($.v.canHazSearch) {
              $.s.buttonSearch = $.f.make({'SPAN':{'style': $.a.search.style}});
              $.d.b.appendChild($.s.buttonSearch);
              $.f.listen($.s.buttonSearch, 'click', $.f.buttonSearchClick);
            }

            $.f.listen($.d.b, 'mouseover', $.f.over);
            $.f.listen($.d.b, 'mouseout', $.f.out);
            $.f.listen($.w, 'blur', $.f.hide);
          }

          // context menu helper
          $.f.listen($.d, 'mousedown', $.f.context);

          $.f.debug('hazLogin: ' + $.v.hazLogin);

        }
      };
    }())
  };
  if ($.b.storage && $.b.storage.local) {
    // move everything we have in local storage into local variables
    $.b.storage.local.get(null, function(itemsFound) {

     // set this in advance so debug doesn't show undefined before this load is done
      $.v.xv = 'cr' + $.b.runtime.getManifest().version;

      // loop through everything
      for (var item in itemsFound) {
        $.f.debug('Found ' + item + ' in local storage.');
        $.v[item] = itemsFound[item];
      }

      // fix it if localStorage overwrites it
      $.v.xv = 'cr' + $.b.runtime.getManifest().version;

      $.f.canHazSearch();

      $.f.init();
    });
  } else {
    $.f.debug('local storage missing; failing out');
  }
}(window, document, navigator, {
  'seg': {
    // ship to 100%
    'min': 0,
    'max': 99
  },
  'k': 'EXT',
  'logicVersion': '0013',
  'me': 'content',
  'iframe': {
    'style': {
      'border': 'none',
      'display': 'block',
      'position': 'fixed',
      'height': '100%',
      'width': '100%',
      'top': '0',
      'right': '0',
      'bottom': '0',
      'left': '0',
      'margin': '0',
      'clip': 'auto',
      'zIndex': '9223372036854775807'
    }
  },
  'save': {
    'domain': {
      'www': true,
      'uk': true,
      'br': true,
      'jp': true,
      'fr': true,
      'es': true,
      'pl': true,
      'de': true,
      'ru': true,
      'it': true,
      'au': true,
      'nl': true,
      'tr': true,
      'id': true,
      'hu': true,
      'pt': true,
      'se': true,
      'cz': true,
      'gr': true,
      'kr': true,
      'ro': true,
      'dk': true,
      'sk': true,
      'fi': true,
      'in': true,
      'no': true,
      'za': true,
      'nz': true
    },
    'lookup': {
      // alt location: cs
      'cs': {
        'd': 'cz'
      },
      // alt location: dk
      'da': {
        'd': 'dk'
      },
      // default de / de-de; alt de-at
      'de': {
        'alt': {
          // Austria
          'at': 'de'
        }
      },
      // alt locale: gr; Greece also gets requests for el-cy
      'el': {
        'd': 'gr',
        'alt': {
          // Cyprus
          'cy': 'gr'
        }
      },
      // English has many alt domains
      'en': {
        'alt': {
          // Australia
          'au': 'au',
          // Great Britain
          'gb': 'uk',
          // Ireland
          'ie': 'uk',
          // India
          'in': 'in',
          // New Zealand
          'nz': 'nz',
          // United Kingdom
          'uk': 'uk',
          // South Africa
          'za': 'za'
        }
      },
      // Spanish also has many alt domains
      'es': {
        'alt': {
          // Latin America
          '419': 'www',
          // Argentina
          'ar': 'www',
          // Chile
          'cl': 'www',
          // Columbia
          'co': 'www',
          // Latin America
          'la': 'www',
          // Mexico
          'mx': 'www',
          // Peru
          'pe': 'www',
          // USA
          'us': 'www',
          // Uruguay
          'uy': 'www',
          // Venezuela
          've': 'www',
          // Latin America
          'xl': 'www'
        }
      },
      // Finnish: fi and fi-fi work; all others go to lang-domain
      'fi': true,
      // French: auto-default to France, but do the right things for Belgium and Canada
      'fr': {
        'alt': {
          'be': 'fr',
          'ca': 'www'
        }
      },
      // Hindu: redirect to India (so does en-in)
      'hi': {
        'd': 'in'
      },
      'hu': true,
      'id': true,
      'it': true,
      'ja': {
        'd': 'jp'
      },
      'ko': {
        'd': 'kr'
      },
      // Malaysian: send to WWW
      'ms': {
        'd': 'www'
      },
      'nl': {
        'alt': {
          'be': 'nl'
        }
      },
      'nb': {
        'd': 'no'
      },
      'pl': true,
      'pt': {
        'alt': {
          // Brazil
          'br': {
            'd': 'br',
            's': 'pt-br'
          }
        }
      },
      'ro': true,
      'ru': true,
      'sk': true,
      'sv': {
        'd': 'se'
      },
      'tl': {
        'd': 'www'
      },
      'th': {
        'd': 'www'
      },
      'tr': {
        'alt': {
          // Cyprus
          'cy': 'tr'
        }
      },
      'uk': true,
      'vi': true
    },
    'string': {
      // Czech
      'cs': 'Ulo&#382;it',
      // Danish
      'da': 'Gem',
      // German
      'de': 'Merken',
      // Greek
      'el': '&Kappa;&rho;&#940;&tau;&alpha; &tau;&omicron;',
      // English
      'en': 'Save',
      // Spanish
      'es': 'Guardar',
      // Finnish
      'fi': 'Tallenna',
      // French
      'fr': 'Enregistrer',
      // Hindi
      'hi': '&#2360;&#2375;&#2357; &#2325;&#2352;&#2375;&#2306;',
      // Hungarian
      'hu': 'Ment&eacute;s',
      // Indonesian
      'id': 'Simpan',
      // Italian
      'it': 'Salva',
      // Japanese
      'ja': '&#20445;&#23384;',
      // Korean
      'ko': '&#51200;&#51109;',
      // Malaysian
      'ms': 'Simpan',
      // Norwegian
      'nb': 'Lagre',
      // Dutch
      'nl': 'Bewaren',
      // Polish
      'pl': 'Zapisz',
      // Portuguese
      'pt': 'Guardar',
      // Portuguese (Brazil)
      'pt-br': 'Salvar',
      // Romanian
      'ro': 'Salveaz&#259;',
      // Russian
      'ru': '&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;',
      // Slovak
      'sk': 'Ulo&#382;i&#357;',
      // Swedish
      'sv': 'Spara',
      // Tagalog (Philippines)
      'tl': 'I-save',
      // Thai
      'th': '&#3610;&#3633;&#3609;&#3607;&#3638;&#3585;',
      // Turkish
      'tr': 'Kaydet',
      // Ukrainian
      'uk': '&#1047;&#1073;&#1077;&#1088;&#1077;&#1075;&#1090;&#1080;',
      // Vietnamese
      'vi': 'L&#432;u'
    },
    'style': {
      // these rules are straight from pinit.js
      'border-radius': '3px',
      'text-indent': '20px',
      'width': 'auto',
      'padding': '0 4px 0 0',
      'text-align': 'center',
      'font': '11px/20px "Helvetica Neue", Helvetica, sans-serif',
      'font-weight': 'bold',
      'color': '#fff',
      'background': '#bd081c url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzBweCIgd2lkdGg9IjMwcHgiIHZpZXdCb3g9Ii0xIC0xIDMxIDMxIj48Zz48cGF0aCBkPSJNMjkuNDQ5LDE0LjY2MiBDMjkuNDQ5LDIyLjcyMiAyMi44NjgsMjkuMjU2IDE0Ljc1LDI5LjI1NiBDNi42MzIsMjkuMjU2IDAuMDUxLDIyLjcyMiAwLjA1MSwxNC42NjIgQzAuMDUxLDYuNjAxIDYuNjMyLDAuMDY3IDE0Ljc1LDAuMDY3IEMyMi44NjgsMC4wNjcgMjkuNDQ5LDYuNjAxIDI5LjQ0OSwxNC42NjIiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PHBhdGggZD0iTTE0LjczMywxLjY4NiBDNy41MTYsMS42ODYgMS42NjUsNy40OTUgMS42NjUsMTQuNjYyIEMxLjY2NSwyMC4xNTkgNS4xMDksMjQuODU0IDkuOTcsMjYuNzQ0IEM5Ljg1NiwyNS43MTggOS43NTMsMjQuMTQzIDEwLjAxNiwyMy4wMjIgQzEwLjI1MywyMi4wMSAxMS41NDgsMTYuNTcyIDExLjU0OCwxNi41NzIgQzExLjU0OCwxNi41NzIgMTEuMTU3LDE1Ljc5NSAxMS4xNTcsMTQuNjQ2IEMxMS4xNTcsMTIuODQyIDEyLjIxMSwxMS40OTUgMTMuNTIyLDExLjQ5NSBDMTQuNjM3LDExLjQ5NSAxNS4xNzUsMTIuMzI2IDE1LjE3NSwxMy4zMjMgQzE1LjE3NSwxNC40MzYgMTQuNDYyLDE2LjEgMTQuMDkzLDE3LjY0MyBDMTMuNzg1LDE4LjkzNSAxNC43NDUsMTkuOTg4IDE2LjAyOCwxOS45ODggQzE4LjM1MSwxOS45ODggMjAuMTM2LDE3LjU1NiAyMC4xMzYsMTQuMDQ2IEMyMC4xMzYsMTAuOTM5IDE3Ljg4OCw4Ljc2NyAxNC42NzgsOC43NjcgQzEwLjk1OSw4Ljc2NyA4Ljc3NywxMS41MzYgOC43NzcsMTQuMzk4IEM4Ljc3NywxNS41MTMgOS4yMSwxNi43MDkgOS43NDksMTcuMzU5IEM5Ljg1NiwxNy40ODggOS44NzIsMTcuNiA5Ljg0LDE3LjczMSBDOS43NDEsMTguMTQxIDkuNTIsMTkuMDIzIDkuNDc3LDE5LjIwMyBDOS40MiwxOS40NCA5LjI4OCwxOS40OTEgOS4wNCwxOS4zNzYgQzcuNDA4LDE4LjYyMiA2LjM4NywxNi4yNTIgNi4zODcsMTQuMzQ5IEM2LjM4NywxMC4yNTYgOS4zODMsNi40OTcgMTUuMDIyLDYuNDk3IEMxOS41NTUsNi40OTcgMjMuMDc4LDkuNzA1IDIzLjA3OCwxMy45OTEgQzIzLjA3OCwxOC40NjMgMjAuMjM5LDIyLjA2MiAxNi4yOTcsMjIuMDYyIEMxNC45NzMsMjIuMDYyIDEzLjcyOCwyMS4zNzkgMTMuMzAyLDIwLjU3MiBDMTMuMzAyLDIwLjU3MiAxMi42NDcsMjMuMDUgMTIuNDg4LDIzLjY1NyBDMTIuMTkzLDI0Ljc4NCAxMS4zOTYsMjYuMTk2IDEwLjg2MywyNy4wNTggQzEyLjA4NiwyNy40MzQgMTMuMzg2LDI3LjYzNyAxNC43MzMsMjcuNjM3IEMyMS45NSwyNy42MzcgMjcuODAxLDIxLjgyOCAyNy44MDEsMTQuNjYyIEMyNy44MDEsNy40OTUgMjEuOTUsMS42ODYgMTQuNzMzLDEuNjg2IiBmaWxsPSIjYmQwODFjIj48L3BhdGg+PC9nPjwvc3ZnPg==) 3px 50% no-repeat',
      'background-size': '14px 14px',
      // extra stuff for extensions only
      'position': 'absolute',
      'opacity': '1',
      'zIndex': '8675309',
      'display': 'none',
      'cursor': 'pointer',
      'border': 'none',
      'font-weight': 'bold',
      '-webkit-font-smoothing': 'antialiased'
    }
  },
  'search': {
    'style': {
      // these rules are straight from pinit.js
      'border-radius': '3px',
      'text-indent': '20px',
      'width': '20px',
      'height': '20px',
      'background': 'rgba(0,0,0,.4) url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHdpZHRoPSIzMHB4IiBoZWlnaHQ9IjMwcHgiIHZpZXdCb3g9IjAgMCAzMCAzMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KPGc+CjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBkPSJNMTcsMTcgTDIyLDIyIFogIi8+CjxjaXJjbGUgc3Ryb2tlPSIjZmZmIiBjeD0iMTMiIGN5PSIxMyIgcj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjUiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAsMCBMOCwwIEw4LDMgTDMsMyBMMyw4IEwwLDggWiIvPgo8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzAsMjIgTDMwLDMwIEwyMiwzMCBMMjIsMjcgTDI3LDI3IEwyNywyMiBaIi8+CjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMCwwIEwzMCw4IEwyNyw4IEwyNywzIEwyMiwzIEwyMiwwIFoiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAsMjIgTDMsMjIgTDMsMjcgTDgsMjcgTDgsMzAgTDAsMzBaIi8+CjwvZz4KPC9zdmc+Cg==) 50% 50% no-repeat',
      'background-size': '14px 14px',
      'position': 'absolute',
      'opacity': '1',
      'zIndex': '8675309',
      'display': 'none',
      'cursor': 'pointer',
      'border': 'none'
    }
  },
  'uninstallUrl': 'https://www.pinterest.com/settings/extension/uninstall/',
  'digits': '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz',
  'maxAspectRatio': 3,
  'position': {
    'offsetTop': 10,
    'offsetLeft': 10
  },
  'endpoint': {
    'pinCreate': 'https://www.pinterest.com/pin/create/extension/',
    'rePinCreate': 'https://www.pinterest.com/pin/%s/repin/x/',
    'log': 'https://log.pinterest.com/'
  },
  'urlPattern': {
    'pinterestApp': /^https?:\/\/(([a-z]{1,3})\.)?pinterest\.com\//,
    'pinitJs': /^https?:\/\/assets\.pinterest\.com\/js\/pinit.js/
  },
  'pop': {
    'base': 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,',
    'width': 750,
    'height': 520
  },
  'patchImage': {
    'twitterCard': {
      'seek': /^https?:\/\/twitter\.com\//,
      'patch': function (img, $) {
        var a, media, url, description;
        a = img.parentNode.parentNode;
        if (a && a.tagName === 'A') {
          media = $.f.get(a, 'data-resolved-url-large');
          url = a.href;
          var p = a.parentNode.parentNode.parentNode.getElementsByClassName('tweet-text')[0];
          if (p && p.tagName === 'P') {
            description = p.innerText;
          }
        }
        return {
          'url': url,
          'media': media,
          'description': description
        }
      }
    },
    'bingImageSearch': {
      'seek': /^https?:\/\/www\.bing\.com\/images\/search\?q=/,
      'patch': function (img, $) {
        var a, meta, t, media, url, description;
        a = img.parentNode;
        if (a && a.tagName === 'A') {
          meta = $.f.get(a, 'm');
          if (meta) {
            t = meta.split('surl:"');
            if (t[1]) {
              url = t[1].split('"')[0];
            }
            t = meta.split('imgurl:"');
            if (t[1]) {
              media = t[1].split('"')[0];
            }
            description = $.f.get(a, 't1');
          }
        }
        return {
          'url': url,
          'media': media,
          'description': description
        }
      }
    },
    'googleImageSearch': {
      'seek': /^https?:\/\/www\.google\.com\/search(.*&tbm=isch.*)/,
      'patch': function (img, $) {
        var a, meta, json, media, url, description;
        a = img.parentNode;
        if (a && a.tagName === 'A' && a.href) {
          meta = a.href.split('imgrefurl=');
          if (meta[1]) {
            // got url
            url = meta[1].split('&')[0];
            try {
              url = decodeURIComponent(url);
            } catch(e) {}
          }
          meta = a.href.split('imgurl=');
          if (meta[1]) {
            // got media
            media = meta[1].split('&')[0];
            try {
              media = decodeURIComponent(media);
            } catch(e) {}
          }
          meta = a.parentNode.getElementsByClassName('rg_meta');
          // see if we can find the description; otherwise, leave it blank to force pinner to do something
          // "Google Image Search Results" is not a useful description
          if (meta[0]) {
            try {
              json = JSON.parse(meta[0].innerHTML);
              if (json.pt) {
                description = json.pt;
              }
            } catch (e) { }
          }
        }
        return {
          'url': url,
          'media': media,
          'description': description
        }
      }
    }
  },
  // known private sites
  'privateList': [
    /^(.*?\.|)craigslist\.org/,
    /^(.*?\.|)chase\.com/,
    /^(.*?\.|)facebook\.com/,
    /^(.*?\.|)mail\.aol\.com/,
    /^(.*?\.|)atmail\.com/,
    /^(.*?\.|)contactoffice\.com/,
    /^(.*?\.|)fastmail\.fm/,
    /^(.*?\.|)webmail\.gandi\.net/,
    /^(.*?\.|)accounts\.google\.com/,
    /^(.*?\.|)mail\.google\.com/,
    /^(.*?\.|)docs\.google\.com/,
    /^(.*?\.|)gmx\.com/,
    /^(.*?\.|)hushmail\.com/,
    /^(.*?\.|)laposte\.fr/,
    /^(.*?\.|)mail\.lycos\.com/,
    /^(.*?\.|)mail\.com/,
    /^(.*?\.|)mail\.ru/,
    /^(.*?\.|)opolis\.eu/,
    /^(.*?\.|)outlook\.com/,
    /^(.*?\.|)nokiamail\.com/,
    /^(.*?\.|)apps\.rackspace\.com/,
    /^(.*?\.|)rediffmail\.com/,
    /^(.*?\.|)runbox\.com/,
    /^(.*?\.|)mail\.sify\.com/,
    /^(.*?\.|)webmail\.thexyz\.com/,
    /^(.*?\.|)mail\.yahoo\.com/,
    /^(.*?\.|)mail\.yandex\.com/
  ],
  // never hover here
  'noHoverPageList': [
    /^https?:\/\/ramandel\.com\//,
    /^https?:\/\/www\.google\.com\/$/,
    /^https?:\/\/www\.google\.com\/_/
  ]
}));
