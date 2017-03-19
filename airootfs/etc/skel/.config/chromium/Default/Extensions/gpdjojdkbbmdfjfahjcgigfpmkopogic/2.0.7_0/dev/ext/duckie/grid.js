// Update the grid's look and feel

(function (w, d, a) {
  var $ = w[a.k] = {
    'w': w,
    'd': d,
    'a': a,
    'b': chrome || firefox || browser,
    'v': {
      'css': '',
      'debug': false
    },
    's': {},
    'f': (function () {
      return {
        debug: function (obj) {
          if (obj && $.v.debug) {
            console.log(obj);
          }
        },
        // get a DOM property or text attribute
        get: function (el, att) {
          var v = null;
          if (typeof el[att] !== 'undefined') {
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
                if (obj[tag][att] && obj[tag][att].hasOwnProperty) {
                  if (typeof obj[tag][att] === 'string') {
                    $.f.set(el, att, obj[tag][att]);
                  } else {
                    if (att === 'style') {
                      for (key in obj[tag][att]) {
                        if (el.style.setProperty) {
                          // modern browsers
                          el.style.setProperty(key, obj[tag][att][key], 'important');
                        } else {
                          // be nice to IE8
                          el.style[key] = obj[tag][att][key];
                        }
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
        // add and remove event listeners in a cross-browser fashion
        listen : function (el, ev, fn, detach) {
          if (!detach) {
            // add listener
            if (typeof $.w.addEventListener !== 'undefined') {
              el.addEventListener(ev, fn, false);
            } else if (typeof $.w.attachEvent !== 'undefined') {
              el.attachEvent('on' + ev, fn);
            }
          } else {
            // remove listener
            if (typeof el.removeEventListener !== 'undefined') {
              el.removeEventListener(ev, fn, false);
            } else if (typeof el.detachEvent !== 'undefined') {
              el.detachEvent('on' + ev, fn);
            }
          }
        },

        // return moz, webkit, ms, etc
        getVendorPrefix: function () {
          var x = /^(moz|webkit|ms)(?=[A-Z])/i;
        	var r = '';
        	for (var p in $.d.b.style) {
        		if (x.test(p)) {
        			r = '-' + p.match(x)[0].toLowerCase() + '-';
        			break;
        		}
        	}
        	return r;
        },

        // build stylesheet
        buildStyleSheet : function () {
          var css, rules, k, re, repl;
          css = $.f.make({'STYLE': {'type': 'text/css'}});
          rules = $.v.css;
          // each rule has our randomly-created key at its root to minimize style collisions
          rules = rules.replace(/\._/g, '.' + a.k + '_')

          // strings to replace in CSS rules
          var repl = {
            '%prefix%': $.f.getVendorPrefix()
          }

          // replace everything in repl throughout rules
          for (k in repl) {
            if (repl[k].hasOwnProperty) {
              // re = new RegExp(k, 'g');
              rules = rules.replace(new RegExp(k, 'g'), repl[k]);
            }
          }

          // add rules to stylesheet
          if (css.styleSheet) {
            css.styleSheet.cssText = rules;
          } else {
            css.appendChild($.d.createTextNode(rules));
          }
          // add stylesheet to page
          if ($.d.h) {
            $.d.h.appendChild(css);
          } else {
            $.d.b.appendChild(css);
          }
        },

        // recursive function to make rules out of a Sass-like object
        presentation: function (obj, str) {
          // make CSS rules
          var name, i, k, pad, key, rules = '', selector = str || '';
          for (k in obj) {
            if (obj[k].hasOwnProperty) {
              // found a rule
              if (typeof obj[k] === 'string') {
                rules = rules + '\n  ' + k + ': ' + obj[k] + ';';
              }
            }
          }
          // add selector and rules to stylesheet
          if (selector && rules) {
            $.v.css = $.v.css + selector + ' { ' + rules + '\n}\n';
          }
          // any children we need to handle?
          for (k in obj) {
            if (obj[k].hasOwnProperty) {
              if (typeof obj[k] === 'object') {
                // replace & with parent selector
                // var key = k.replace(/&/g, selector);
                key = selector + ' ' + k;
                key = key.replace(/ &/g, '');
                key = key.replace(/,/g, ', ' + selector);
                $.f.presentation(obj[k], key);
              }
            }
          }
          // if this is our root, remove from current context and make stylesheet
          if (obj === $.a.styles) {
            $.w.setTimeout(function() {
              $.f.buildStyleSheet();
            }, 1);
          }
        },

        // build a complex element from a JSON template
        buildOne: function (obj, el) {
          for (var key in obj) {
            var child = $.f.make({
              'SPAN': {
                'className': $.a.k + '_' + key.replace(/ /g, ' ' + $.a.k)
              }
            });
            el.appendChild(child);
            if (!$.s[key]) {
              $.s[key] = child;
            }
            $.f.buildOne(obj[key], child);
          }
        },
        // if we don't have a token we need to pin in a pop-up window
        pop: function (obj) {
          var url, options, top, left, height, width, popTop, popLeft;
          url = 'https://www.pinterest.com/pin/create/extension/?';
          url = url + 'url=' + encodeURIComponent(obj.url);
          if (obj.media) {
            url = url + '&media=' + encodeURIComponent(obj.media);
          } else {
            url = url + '&color=' +  encodeURIComponent(obj.color) + '&siteName=' + encodeURIComponent(obj.siteName);
          }
          url = url + '&xuid=' + $.v.xuid + '&xv=' + $.v.xv + '&xm=g';
          url = url + '&description=' + encodeURIComponent(obj.description);
          options = 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,height=500,width=750';
          top = $.w.screenY || $.w.screenTop || 0;
          left = $.w.screenX || $.w.screenLeft || 0;
          height = $.d.body.clientHeight || $.w.innerHeight || 0;
          width = $.d.body.clientWidth || $.w.innerWidth || 0;
          popTop = top + 150;
          popLeft = left + (width / 2) - (375);
          options = options + ',left=' + popLeft + ',top=' + top;
          $.w.open(url, 'pin' + new Date().getTime(), options);
        },
        // open the right form (popup = unauthed; inline = authed)
        create: function (obj) {
          if (!$.v.hazLogin) {
            // we're going to pin in a pop-up window
            // HERE we need to pop the repin form for data-pin-id
            $.f.pop(obj);
          } else {
            // we're going to pin inline
            $.b.runtime.sendMessage({
              'to': 'background',
              'act': 'openCreateForm',
              'data': obj
            }, function(){});
          }
          $.f.close();
        },

        close: function () {
          $.b.runtime.sendMessage(
            {'to': 'background', 'act': 'closeGrid'}, function() {}
          );
        },

        act: {
          render: function (r) {
            $.f.debug('rendering the grid');
            $.v.lang = r.data.config.lang;
            $.w.clearTimeout($.v.apologizeAfter);
            $.w.clearTimeout($.v.closeAfter);

            var data, cc, i, n, thumb, mask, desc, img, ft, search;
            data = r.data;
            cc = 0;

            if (data.thumb.length) {
              $.s.hdMsg.innerHTML = $.a.msg[$.v.lang].choosePin;
              for (i = 0, n = data.thumb.length; i < n; i = i + 1) {
                thumb = $.f.make({'DIV':{'className': $.a.k + '_thumb'}});
                mask = $.f.make({'DIV':{'className': $.a.k + '_mask'}});
                desc = '';
                if (data.thumb[i].src) {
                  desc = data.thumb[i].description;
                  img = $.f.make({'IMG':{'src': data.thumb[i].media}});
                  $.f.set(mask, 'url', data.thumb[i].url);
                  if (data.thumb[i].dataPinId) {
                    $.f.set(mask, 'data-pin-id', data.thumb[i].dataPinId);
                  }
                  $.f.set(mask, 'url', data.thumb[i].url);
                  $.f.set(mask, 'media', data.thumb[i].media);
                  $.f.set(mask, 'description', desc);
                } else {
                  desc = data.imageless.description;
                  img = $.f.make({'SPAN':{'className': $.a.k + '_imageless'}});
                  img.style.backgroundColor = data.imageless.color;
                  $.f.set(mask, 'url', data.imageless.url);
                  $.f.set(mask, 'color', data.imageless.color);
                  $.f.set(mask, 'siteName', data.imageless.siteName);
                  $.f.set(mask, 'description', data.imageless.description);
                  img.appendChild($.f.make({'SPAN': {
                    'className': $.a.k + '_site',
                    'innerHTML': data.imageless.siteName
                  }}));
                  img.appendChild($.f.make({'SPAN': {
                    'className': $.a.k + '_text',
                    'innerHTML': desc
                  }}));
                }
                thumb.appendChild(img);
                thumb.appendChild($.f.make({'SPAN': {
                  'className': $.a.k + '_saveButton',
                  'innerHTML': a.msg[$.v.lang].save
                }}));
                if ($.v.canHazSearch && data.thumb[i].src) {
                  search = $.f.make({'SPAN': {
                    'className': $.a.k + '_searchButton'
                  }});
                  $.f.set(search, 'media', data.thumb[i].media);
                  $.f.set(search, 'url', data.thumb[i].url);
                  thumb.appendChild(search);
                }
                ft = $.f.make({'DIV': {
                  'className': $.a.k + '_ft'
                }});
                var ftDesc = $.f.make({'SPAN': {
                  'className': $.a.k + '_desc',
                  'innerHTML': desc
                }});
                ftDesc.appendChild($.f.make({'SPAN': {
                  'className': $.a.k + '_dimensions',
                  'innerHTML': data.thumb[i].height + ' x ' + data.thumb[i].width
                }}));
                ft.appendChild(ftDesc);
                thumb.appendChild(ft);
                thumb.appendChild(mask);
                // add this thumb to the right column
                $.d.getElementById('c_' + cc).appendChild(thumb);
                // next time, use the next column
                cc = (cc + 1) % $.v.columnCount;
              }
            } else {
              $.s.hdMsg.innerHTML = 'Sorry, no images found!';
            }
          }
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
          if (obj) {
            for (i in obj) {
              if (typeof obj[i] !== 'undefined') {
                str = str + '&' + i + '=' + obj[i];
              }
            }
            $.f.debug('logging');
            $.f.debug(JSON.stringify(obj));
            $.f.sendMessage({'to': 'background', 'act': 'logAction', 'data': str});
          }
        },

        openSearch: function (o) {
          $.b.runtime.sendMessage(
            {'to': 'background', 'act': 'popSearch', 'data': o}, function() {}
          );
        },

        // a click!
        click: function (v) {
          v = v || $.w.event;
          var el, url;
          el = $.f.getEl(v);
          // if we click anything that isn't a thumb, close the grid
          if (el.className === $.a.k + '_mask') {
            url = $.f.get(el, 'url');
            // add some sense of backwards compatibility to logging
            $.f.log({'event': 'click', 'xm': 'g','via': url});
            // pop the form
            $.f.create({
              'id': $.f.get(el, 'data-pin-id'),
              'url': url,
              'media': $.f.get(el, 'media'),
              'color': $.f.get(el, 'color'),
              'siteName': $.f.get(el, 'siteName'),
              'description': $.f.get(el, 'description'),
              'method': 'g'
            });
          }


          if (el.className === $.a.k + '_searchButton') {
            $.f.openSearch({
              'xm': 'g',
              'url': $.f.get(el, 'url'),
              'img': $.f.get(el, 'media')
            });
          }

          $.f.close();
        },
        // close on escape
        keydown: function (v) {
          var t = v || $.w.event, k = t.keyCode || null;
          if (k === 27) {
            $.f.close();
          }
        },
        // start
        init: function () {
          $.d.b = $.d.getElementsByTagName('BODY')[0];
          $.d.h = $.d.getElementsByTagName('HEAD')[0];

          $.f.presentation($.a.styles);

          $.f.buildOne($.a.structure, $.d.b);

          $.f.debug('structure rendered');

          // updated when data loads
          $.v.lang = 'en';

          // $.s.hd = $.d.getElementById('hdMsg');
          $.d.title = $.a.msg[$.v.lang].choosePin;
          $.s.hdMsg.innerHTML = $.a.msg[$.v.lang].choosePin;

          $.v.columnCount = ~~($.d.b.offsetWidth / 250);

          // if an incoming message from script is for us and triggers a valid function, run it
          $.b.runtime.onMessage.addListener(function(r) {
            $.f.debug('message received');
            if (r.to && r.to === $.a.me) {
              if (r.act && typeof $.f.act[r.act] === 'function') {
                $.f.act[r.act](r);
              }
            }
          });

          // tell the background process to go get the pinner's current boards and have them ready
          if ($.v.hazLogin) {
            $.b.runtime.sendMessage(
              {'to': 'background', 'act': 'fetchBoards'}, function() {}
            );
          }

          for (var i = 0; i < $.v.columnCount; i = i + 1) {
            var col = $.d.createElement('DIV');
            col.className =  $.a.k + '_col';
            col.id = 'c_' + i;
            $.s.grid.appendChild(col);
          }

          $.f.listen($.d.b, 'click', $.f.click);

          $.v.apologizeAfter = $.w.setTimeout(function () {
            $.v.closeAfter = $.w.setTimeout(function () {
              $.w.setTimeout(function () {
                $.f.close();
              }, 1000);
            }, $.a.closeAfter);
          }, $.a.apologizeAfter);

          $.f.listen($.d, 'keydown', $.f.keydown);

        }
      };
    }())
  };
  // get everything in local storage and then init
  $.b.storage.local.get(null, function(data) {
    for (var i in data) {
      $.v[i] = data[i];
    }
    $.v['xv'] = 'cr' + $.b.runtime.getManifest().version
    $.f.init();
  });
}(window, document, {
  'k': 'GRID' + new Date().getTime(),
  'closeAfter': 10000,
  'apologizeAfter': 5000,
  'me': 'grid',
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
  'msg': {
    "en": {
      "finding": "Finding things to save....",
      "soLong": "Wow, this is taking a long time. We\'ll give it ten more seconds....",
      "givingUp": "Nothing found. Please try another page, or come back to this one later.",
      "choosePin": "Choose a Pin to save",
      "save": "Save"
    },
    "cs": {
      "choosePin": "Zvolte pin, kter&#xFD; chcete ulo&#x17E;it",
      "save": "Ulo&#382;it"
    },
    "da": {
      "choosePin": "V&#xE6;lg den pin, du vil gemme",
      "save": "Gem"
    },
    "de": {
      "choosePin": "W&#xE4;hle den Pin, den du speichern m&#xF6;chtest",
      "save": "Merken"
    },
    "es": {
      "choosePin": "Elige un Pin que guardar",
      "save": "Guardar"
    },
    "es-mx": {
      "choosePin": "Elige un Pin para guardarlo",
      "save": "Guardar"
    },
    "el": {
      "choosePin": "&#x395;&#x3C0;&#x3B9;&#x3BB;&#x3AD;&#x3BE;&#x3C4;&#x3B5; &#x3AD;&#x3BD;&#x3B1; pin &#x3B3;&#x3B9;&#x3B1; &#x3B1;&#x3C0;&#x3BF;&#x3B8;&#x3AE;&#x3BA;&#x3B5;&#x3C5;&#x3C3;&#x3B7;",
      "save": "&Kappa;&rho;&#940;&tau;&alpha; &tau;&omicron;"
    },
    "fi": {
      "choosePin": "Valitse tallennettava Pin",
      "save": "Tallenna"
    },
    "fr": {
      "choosePin": "Choisissez une &#xE9;pingle &#xE0; enregistrer",
      "save": "Enregistrer"
    },
    "id": {
      "choosePin": "Pilih Pin untuk disimpan",
      "save": "Simpan"
    },
    "it": {
      "choosePin": "Scegli un Pin da salvare",
      "save": "Salva"
    },
    "hi": {
      "choosePin": "&#x938;&#x947;&#x935; &#x915;&#x930;&#x928;&#x947; &#x915;&#x947; &#x932;&#x93F;&#x90F; &#x90F;&#x915; &#x92A;&#x93F;&#x928; &#x915;&#x94B; &#x91A;&#x941;&#x928;&#x947;&#x902;",
      "save": "&#2360;&#2375;&#2357; &#2325;&#2352;&#2375;&#2306;"
    },
    "hu": {
      "choosePin": "V&#xE1;lassz egy menteni k&#xED;v&#xE1;nt pint",
      "save": "Ment&eacute;s"
    },
    "ja": {
      "choosePin": "&#x4FDD;&#x5B58;&#x3059;&#x308B;&#x30D4;&#x30F3;&#x3092;&#x9078;&#x629E;",
      "save": "&#20445;&#23384;"
    },
    "ko": {
      "choosePin": "&#xC800;&#xC7A5;&#xD560; &#xD540;&#xC744; &#xC120;&#xD0DD;&#xD558;&#xC138;&#xC694;.",
      "save": "&#51200;&#51109;"
    },
    "ms": {
      "choosePin": "Pilih Pin untuk disimpan",
      "save": "Simpan"
    },
    "nb": {
      "choosePin": "Velg en Pin &#xE5; lagre",
      "save": "Lagre"
    },
    "nl": {
      "choosePin": "Kies een pin om te bewaren",
      "save": "Bewaren"
    },
    "pl": {
      "choosePin": "Wybierz Pina do zapisania",
      "save": "Zapisz"
    },
    "pt": {
      "choosePin": "Escolhe um Pin para guardar",
      "save": "Guardar"
    },
    "pt-br": {
      "choosePin": "Escolha um Pin para salvar",
      "save": "Salvar"
    },
    "ro": {
      "choosePin": "Alege un Pin pe care s&#x103;-l salvezi",
      "save": "Salveaz&#259;"
    },
    "ru": {
      "choosePin": "&#x412;&#x44B;&#x431;&#x435;&#x440;&#x438;&#x442;&#x435; &#x41F;&#x438;&#x43D;, &#x43A;&#x43E;&#x442;&#x43E;&#x440;&#x44B;&#x439; &#x43D;&#x443;&#x436;&#x43D;&#x43E; &#x441;&#x43E;&#x445;&#x440;&#x430;&#x43D;&#x438;&#x442;&#x44C;.",
      "save": "&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;"
    },
    "sk": {
      "choosePin": "Vyberte si pin, ktor&#xFD; si ulo&#x17E;&#xED;te",
      "save": "Ulo&#382;i&#357;"
    },
    "sv": {
      "choosePin": "V&#xE4;lj en pin som du vill spara",
      "save": "Spara"
    },
    "th": {
      "choosePin": "&#xE40;&#xE25;&#xE37;&#xE2D;&#xE01;&#xE1E;&#xE34;&#xE19;&#xE17;&#xE35;&#xE48;&#xE15;&#xE49;&#xE2D;&#xE07;&#xE01;&#xE32;&#xE23;&#xE1A;&#xE31;&#xE19;&#xE17;&#xE36;&#xE01;",
      "save": "&#3610;&#3633;&#3609;&#3607;&#3638;&#3585;"
    },
    "tl": {
      "choosePin": "Pumili ng Pin na ise-save",
      "save": "I-save"
    },
    "tr": {
      "choosePin": "Saklamak istedi&#x11F;iniz Pini se&#xE7;in",
      "save": "Kaydet"
    },
    "uk": {
      "choosePin": "&#x41E;&#x431;&#x435;&#x440;&#x456;&#x442;&#x44C; &#x43F;&#x456;&#x43D;, &#x44F;&#x43A;&#x438;&#x439; &#x445;&#x43E;&#x442;&#x456;&#x43B;&#x438; &#x431; &#x437;&#x431;&#x435;&#x440;&#x435;&#x433;&#x442;&#x438;",
      "save": "&#1047;&#1073;&#1077;&#1088;&#1077;&#1075;&#1090;&#1080;"
    },
    "vi": {
      "choosePin": "Ch&#x1ECD;n m&#x1ED9;t Ghim &#x111;&#x1EC3; l&#x1B0;u",
      "save": "L&#432;u"
    }
  },
  // our structure
  'structure': {
    'hd': {
      'hdMsg': {},
      'x': {}
    },
    'grid': {
    }
  },
  // a SASS-like object to be turned into stylesheets
  'styles': {
    'body': {
      'background': '#fff',
      'margin': '0',
      'padding': '0',
      'text-align': 'center',
      'font-family': '"Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", arial, sans-serif',
      '%prefix%font-smoothing': 'antialiased'
    },
    '*': {
      '%prefix%box-sizing': 'border-box'
    },
    '._hd': {
      'background': 'rgba(255,255,255,1) url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjAgMCAzMCAzMCI+PGc+PHBhdGggZD0iTTI5LjQ0OSwxNC42NjIgQzI5LjQ0OSwyMi43MjIgMjIuODY4LDI5LjI1NiAxNC43NSwyOS4yNTYgQzYuNjMyLDI5LjI1NiAwLjA1MSwyMi43MjIgMC4wNTEsMTQuNjYyIEMwLjA1MSw2LjYwMSA2LjYzMiwwLjA2NyAxNC43NSwwLjA2NyBDMjIuODY4LDAuMDY3IDI5LjQ0OSw2LjYwMSAyOS40NDksMTQuNjYyIiBmaWxsPSIjZmZmIj48L3BhdGg+PHBhdGggZD0iTTE0LjczMywxLjY4NiBDNy41MTYsMS42ODYgMS42NjUsNy40OTUgMS42NjUsMTQuNjYyIEMxLjY2NSwyMC4xNTkgNS4xMDksMjQuODU0IDkuOTcsMjYuNzQ0IEM5Ljg1NiwyNS43MTggOS43NTMsMjQuMTQzIDEwLjAxNiwyMy4wMjIgQzEwLjI1MywyMi4wMSAxMS41NDgsMTYuNTcyIDExLjU0OCwxNi41NzIgQzExLjU0OCwxNi41NzIgMTEuMTU3LDE1Ljc5NSAxMS4xNTcsMTQuNjQ2IEMxMS4xNTcsMTIuODQyIDEyLjIxMSwxMS40OTUgMTMuNTIyLDExLjQ5NSBDMTQuNjM3LDExLjQ5NSAxNS4xNzUsMTIuMzI2IDE1LjE3NSwxMy4zMjMgQzE1LjE3NSwxNC40MzYgMTQuNDYyLDE2LjEgMTQuMDkzLDE3LjY0MyBDMTMuNzg1LDE4LjkzNSAxNC43NDUsMTkuOTg4IDE2LjAyOCwxOS45ODggQzE4LjM1MSwxOS45ODggMjAuMTM2LDE3LjU1NiAyMC4xMzYsMTQuMDQ2IEMyMC4xMzYsMTAuOTM5IDE3Ljg4OCw4Ljc2NyAxNC42NzgsOC43NjcgQzEwLjk1OSw4Ljc2NyA4Ljc3NywxMS41MzYgOC43NzcsMTQuMzk4IEM4Ljc3NywxNS41MTMgOS4yMSwxNi43MDkgOS43NDksMTcuMzU5IEM5Ljg1NiwxNy40ODggOS44NzIsMTcuNiA5Ljg0LDE3LjczMSBDOS43NDEsMTguMTQxIDkuNTIsMTkuMDIzIDkuNDc3LDE5LjIwMyBDOS40MiwxOS40NCA5LjI4OCwxOS40OTEgOS4wNCwxOS4zNzYgQzcuNDA4LDE4LjYyMiA2LjM4NywxNi4yNTIgNi4zODcsMTQuMzQ5IEM2LjM4NywxMC4yNTYgOS4zODMsNi40OTcgMTUuMDIyLDYuNDk3IEMxOS41NTUsNi40OTcgMjMuMDc4LDkuNzA1IDIzLjA3OCwxMy45OTEgQzIzLjA3OCwxOC40NjMgMjAuMjM5LDIyLjA2MiAxNi4yOTcsMjIuMDYyIEMxNC45NzMsMjIuMDYyIDEzLjcyOCwyMS4zNzkgMTMuMzAyLDIwLjU3MiBDMTMuMzAyLDIwLjU3MiAxMi42NDcsMjMuMDUgMTIuNDg4LDIzLjY1NyBDMTIuMTkzLDI0Ljc4NCAxMS4zOTYsMjYuMTk2IDEwLjg2MywyNy4wNTggQzEyLjA4NiwyNy40MzQgMTMuMzg2LDI3LjYzNyAxNC43MzMsMjcuNjM3IEMyMS45NSwyNy42MzcgMjcuODAxLDIxLjgyOCAyNy44MDEsMTQuNjYyIEMyNy44MDEsNy40OTUgMjEuOTUsMS42ODYgMTQuNzMzLDEuNjg2IiBmaWxsPSIjYmQwODFjIj48L3BhdGg+PC9nPjwvc3ZnPg==) 20px 50% no-repeat',
      'color': '#333',
      'height': '65px',
      'line-height': '65px',
      'font-size': '16px',
      'font-weight': 'bold',
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'right': '0',
      'z-index': '100',
      'border-bottom': '1px solid #eee',
      'text-align': 'left',
      'text-indent': '65px',
      '._x': {
        'z-index': '10',
        'opacity': '.5',
        'position': 'absolute',
        'right': '25px',
        'top': '0',
        'cursor': 'pointer',
        'height': '65px',
        'width': '15px',
        'background': 'transparent url(data:image/svg+xml;base64,CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjE1cHgiIHdpZHRoPSIxNXB4IiB2aWV3Qm94PSIwIDAgMTUgMTUiPjxnPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik0wLDAgTDEsMCBMMTUsMTQgTDE1LDE1IEwxNCwxNSBMMCwxIFoiIC8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAsMTQgTDAsMTUgTDEsMTUgTDE1LDEgTDE1LDAgTDE0LDAgWiIgLz48L2c+PC9zdmc+) 50% 50% no-repeat'
      },
    },
    '._grid': {
      'display': 'block',
      'margin': '85px auto 0',
      '._col': {
        'display': 'inline-block',
        'width': '236px',
        'vertical-align': 'top',
        'padding': '0 10px',
        'text-align': 'left',
        '._thumb': {
          'border-radius': '8px',
          'margin': '0',
          'display': 'block',
          'width': '220px',
          'background': '#eee',
          'vertical-align': 'top',
          'overflow': 'hidden',
          'cursor': 'pointer',
          'background': '#fff',
          'position': 'relative',
          'border': '10px solid #fff',
          '&:hover': {
            'background': '#eee',
            'border-color': '#eee'
          },
          '._mask': {
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'bottom': '0',
            'right': '0'
          },
          '._saveButton': {
            'position': 'absolute',
            'top': '10px',
            'left': '10px',
            'width': 'auto',
            'border-radius': '4px',
            'background': '#bd081c url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEwcHgiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDEwIDIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxnPgogICAgPHBhdGggZD0iTTAuNDgzMDc2OSwwIEMwLjQ4MzA3NjksMC43NzIxNDI5IDEuMzI1Mzg0NiwxLjQzMjg1NzEgMi4xMzc2OTIzLDEuNzg0Mjg1NyBMMi4xMzc2OTIzLDcuMzU3MTQyOSBDMC43NTg0NjE1LDguMTQyODU3MSAwLDkuNzUzNTcxNCAwLDExLjQyODU3MTQgTDQuMjAyMzA3NywxMS40Mjg1NzE0IEw0LjIwMTUzODUsMTcuMjEyMTQyOSBDNC4yMDE1Mzg1LDE3LjIxMjE0MjkgNC4zNDE1Mzg1LDE5LjY1OTI4NTcgNSwyMCBDNS42NTc2OTIzLDE5LjY1OTI4NTcgNS43OTc2OTIzLDE3LjIxMjE0MjkgNS43OTc2OTIzLDE3LjIxMjE0MjkgTDUuNzk2OTIzMSwxMS40Mjg1NzE0IEwxMCwxMS40Mjg1NzE0IEMxMCw5Ljc1MzU3MTQgOS4yNDE1Mzg1LDguMTQyODU3MSA3Ljg2MTUzODUsNy4zNTcxNDI5IEw3Ljg2MTUzODUsMS43ODQyODU3IEM4LjY3NDYxNTQsMS40MzI4NTcxIDkuNTE2MTUzOCwwLjc3MjE0MjkgOS41MTYxNTM4LDAgTDAuNDgzMDc2OSwwIEwwLjQ4MzA3NjksMCBaIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgPC9nPgo8L3N2Zz4=) 10px 9px no-repeat',
            'background-size': '10px 20px',
            'padding': '0 10px 0 0',
            'text-indent': '26px',
            'color': '#fff',
            'font-size': '14px',
            'line-height': '36px',
            'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
            'font-style': 'normal',
            'font-weight': 'bold',
            'text-align': 'left',
            '%prefix%font-smoothing': 'antialiased',
            '-moz-osx-font-smoothing': 'grayscale',
            'opacity': '0'
          },
          '._searchButton': {
            'position': 'absolute',
            'top': '10px',
            'right': '10px',
            'height': '36px',
            'width': '36px',
            'border-radius': '4px',
            'background': 'rgba(0,0,0,.4) url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHdpZHRoPSIzMHB4IiBoZWlnaHQ9IjMwcHgiIHZpZXdCb3g9IjAgMCAzMCAzMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KPGc+CjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBkPSJNMTcsMTcgTDIyLDIyIFogIi8+CjxjaXJjbGUgc3Ryb2tlPSIjZmZmIiBjeD0iMTMiIGN5PSIxMyIgcj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjUiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAsMCBMOCwwIEw4LDMgTDMsMyBMMyw4IEwwLDggWiIvPgo8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzAsMjIgTDMwLDMwIEwyMiwzMCBMMjIsMjcgTDI3LDI3IEwyNywyMiBaIi8+CjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMCwwIEwzMCw4IEwyNyw4IEwyNywzIEwyMiwzIEwyMiwwIFoiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAsMjIgTDMsMjIgTDMsMjcgTDgsMjcgTDgsMzAgTDAsMzBaIi8+CjwvZz4KPC9zdmc+Cg==) 50% 50% no-repeat',
            'background-size': '20px 20px',
            'opacity': '0',
            'z-index': '100'
          },
          '&:hover ._saveButton, &:hover ._searchButton, &:hover ._ft ._dimensions': {
            'opacity': '1'
          },
          'img': {
            'display': 'block',
            'width': '200px',
            'border-radius': '8px'
          },
          '._imageless': {
            'display': 'block',
            'border-radius': '8px',
            'height': '200px',
            'width': '200px',
            'position': 'relative',
            'overflow': 'hidden',
            '._site, ._text': {
              'position': 'absolute',
              'color': '#fff',
              'left': '15px'
            },
            '._site': {
              'top': '20px',
              'left': '20px',
              'font-size': '11px'
            },
            '._text': {
              'font-size': '19px',
              'top': '38px',
              'line-height': '28px',
              'padding-right': '22px',
              'font-weight': 'bold',
              'letter-spacing': '-1px'
            }
          },
          '._ft': {
            'display': 'block',
            'span': {
              'position': 'relative',
              'display': 'block',
              'padding': '10px',
              'color': '#333'
            },
            '._dimensions': {
              'border-bottom-left-radius': '8px',
              'border-bottom-right-radius': '8px',
              'padding': '0',
              'position': 'absolute',
              'top': '-24px',
              'height': '24px',
              'line-height': '24px',
              'left': '0',
              'text-align': 'center',
              'width': '100%',
              'background': 'rgba(0,0,0,.2)',
              'color': '#fff',
              'font-size': '10px',
              'font-style': 'normal',
              '%prefix%font-smoothing': 'antialiased',
              '-moz-osx-font-smoothing': 'grayscale',
              'opacity': '0'
            }
          }
        }
      }
    }
  }
}));
