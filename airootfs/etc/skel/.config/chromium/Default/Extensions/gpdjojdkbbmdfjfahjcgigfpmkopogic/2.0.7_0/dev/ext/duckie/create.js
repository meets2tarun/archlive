// fix Save button transition after click

(function (w, d, a) {
  var $ = w[a.k] = {
    'a': a,
    'd': d,
    'b': chrome || firefox || browser,
    'w': w,
    's': {},
    'v': {
      'debug': false,
      'css': '',
      'lastDescription': '',
      'lastSearch': '',
      'lang': 'en',
      'dataAttributePrefix': 'data-' + a.me + '-'
    },
    'f': (function () {
      return {
        // add and remove event listeners in a cross-browser fashion
        listen: function (el, ev, fn, detach) {
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
        // get a DOM property or text attribute
        get: function (el, att) {
          var v = null;
          if (typeof el[att] !== 'undefined') {
            v = el[att];
          } else {
            v = el.getAttribute($.v.dataAttributePrefix + att);
          }
          return v;
        },
        // set a DOM property or text attribute
        set: function (el, att, string) {
          if (typeof el[att] === 'string') {
            el[att] = string;
          } else {
            el.setAttribute($.v.dataAttributePrefix + att, string);
          }
        },
        // create a DOM element
        make: function (obj) {
          var el = false, tag, att, key;
          for (tag in obj) {
            if (obj[tag].hasOwnProperty) {
              el = $.d.createElement(tag);
              // thumb data may be corrupt; errors will cause grayscreen hangs
              for (att in obj[tag]) {
                try {
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
                } catch(err) {
                  break;
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
        // console.log only if debug is on
        debug: function (obj) {
          if ($.w.console && $.w.console.log && $.v.debug) {
            $.w.console.log(obj);
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
        // return moz, webkit, ms, etc
        getVendorPrefix: function () {
          var x, r, p;
          x = /^(moz|webkit|ms)(?=[A-Z])/i;
          r = '';
        	for (p in $.d.b.style) {
        		if (x.test(p)) {
        			r = '-' + p.match(x)[0].toLowerCase() + '-';
        			break;
        		}
        	}
        	return r;
        },
        // build stylesheet
        buildStyleSheet: function () {
          var css, rules, k, re, repl;
          css = $.f.make({'STYLE': {'type': 'text/css'}});
          rules = $.v.css;
          // each rule has our randomly-created key at its root to minimize style collisions
          rules = rules.replace(/\._/g, '.' + a.k + '_')
          // strings to replace in CSS rules
          repl = {
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
        // clean troublesome characters from strings that may be shown onscreen
        clean: function (str) {
          // thank you: Jan Lenhart
          // https://github.com/janl/mustache.js/blob/master/mustache.js
          var fixThese = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
          };
          var span = $.d.createElement('SPAN');
          // render cleaned string into a span, so we don't get a bunch of %-encoded stuff
          span.innerHTML = str.replace(/[&<>"'`=\/]/g, function (s) {
            return fixThese[s];
          });
          return span.textContent;
        },
       // given window.navigator.language, return appropriate strings
        getStrings: function () {
          var key, k, lang = 'en';
          var key = $.w.navigator.language.toLowerCase();
          if ($.a.str[key]) {
            lang = key;
          } else {
            var k = key.split('-')[0];
            if ($.a.str[k]) {
              lang = k;
            }
          }
          $.v.str = $.a.str[lang];
          // if we're missing any strings, fill with English
          for (var k in $.a.str['en']) {
            if (!$.v.str[k]) {
              $.v.str[k] = $.a.str['en'][k];
            }
          }
        },
        // build complex structure from a JSON template
        buildOne: function (obj, el) {
          var key, value, v, i, o, child, text;
          // if we have no parent, assume we're adding this to document.body
          if (!el) {
            el = $.d.b;
          }
          for (key in obj) {
            if (typeof obj[key] === 'string') {
              // set an attribute
              value = obj[key];
              // addClass may contain more than one selector
              if (key === 'addClass') {
                v = value.split(' ');
                for (i = 0; i < v.length; i = i + 1) {
                  el.className = el.className + ' ' + $.a.k + '_' +  v[i];
                }
              } else {
                if (key !== 'tag') {
                  $.f.set(el, key, value);
                }
              }
            } else {
              // create a new container
              o = {
                [obj[key].tag || 'SPAN']: {
                  'className': $.a.k + '_' + key
                }
              };
              child = $.f.make(o);
              el.appendChild(child);
              if (!$.s[key]) {
                $.s[key] = child;
                // fill with translated text if needed
                if ($.v.str[key]) {
                  text = $.v.str[key];
                  if (child.tagName === 'INPUT') {
                    // placeholder
                    child.placeholder = text;
                  } else {
                    // string in non-input element
                    child.textContent = $.f.clean(text);
                  }
                }
              }
              // recurse
              $.f.buildOne(obj[key], child);
            }
          }
        },
        // fulfill internal requests from DOM objects
        cmd: {
          // close the create form
          close: function (str) {
            if (typeof str === 'string') {
              $.w.alert(str);
            }
            // pause before removing so logging pings make it through
            $.w.setTimeout(function () {
              $.b.runtime.sendMessage({'to': 'background', 'act': 'closeCreateForm'}, function() {});
            }, 100);
            return;
          },
          // select text within an element
          select: function (el) {
            // only select full text in default description once
            if (!el.getAttribute('hazSelected')) {
              el.setAttribute('hazSelected', true);
              el.select();
            }
            return;
          },
          // save a pin
          save: function (el) {
            var button, obj, o = el.parentNode;
            if (o) {
              button = o.getElementsByClassName($.a.k + '_button')[0];
              button.className = button.className + ' ' + $.a.k + '_active';

              obj = {
                'board': $.f.get(el, 'board-id'),
                'id': $.v.data.id || undefined,
                'url': $.v.data.url,
                'media': $.v.data.media,
                'description': $.s.description.value,
                'color': $.v.data.color,
                'dataURI': $.v.canvasData,
                'method': $.v.data.method
              }
              $.w.setTimeout(function () {
                if (obj.id) {
                  $.f.debug('REPIN');
                  obj.strings = $.v.str;
                  $.b.runtime.sendMessage({'to': 'background', 'act': 'rePinIt', 'data': obj}, function() {
                    button.className = $.a.k + '_button ' + $.a.k + '_save ' + $.a.k + '_active';
                    $.w.setTimeout(function () {
                      button.className = $.a.k + '_button ' + $.a.k + '_save ' + $.a.k + '_checked';
                      $.w.setTimeout(function () {
                        $.f.cmd.close();
                      }, 1000);
                    }, 2000);
                  });
                } else {
                  $.f.debug('PIN CREATE');
                  obj.strings = $.v.str;
                  $.b.runtime.sendMessage({'to': 'background', 'act': 'pinIt', 'data': obj}, function() {
                    button.className = $.a.k + '_button ' + $.a.k + '_save ' + $.a.k + '_active';
                    $.w.setTimeout(function () {
                      button.className = $.a.k + '_button ' + $.a.k + '_save ' + $.a.k + '_checked';
                      $.w.setTimeout(function () {
                        $.f.cmd.close();
                      }, 1000);
                    }, 2000);
                  });
                }
              }, 100);
            }
            return;
          },
          // open the board create pane
          openCreate: function () {
            // open the board create form
            $.s.txtCreate.value = $.f.clean($.s.boardSearch.value);
            $.s.createContainer.className = $.a.k + '_createContainer ' + $.a.k + '_onstage';
            // keep an eye on the board name and light up the create button if there's a value
            $.w.setInterval(function () {
              if ($.s.txtCreate.value) {
                $.s.btnCreateGo.className = $.a.k + '_create ' + $.a.k + '_button';
              } else {
                $.s.btnCreateGo.className = $.a.k + '_create ' + $.a.k + '_button ' + $.a.k + '_disabled';
              }
            }, 100);
            return;
          },
          // close the board create pane
          closeCreate: function () {
            $.s.createContainer.className = $.a.k + '_createContainer';
            return;
          },
          // make a board
          createBoard: function () {
            // call back end with new board name and secret status
            // back end should deliver new board via act.showNewBoard
            var data, name = $.s.txtCreate.value;
            if (name) {
              data = {'name': name, 'secret': $.s.createSecret.checked, 'strings': $.v.str};
              $.b.runtime.sendMessage({'to': 'background', 'act': 'makeNewBoard', 'data': data}, function() {
                $.f.cmd.closeCreate();
              });
            }
            return;
          }
        },
        // close on escape
        keydown: function (v) {
          var t = v || $.w.event, k = t.keyCode || null;
          if (k === 27) {
            $.f.cmd.close();
          }
        },
        // watch for click events
        click: function (v) {
          var t, el, cmd;
          t = v || $.w.event;
          el = $.f.getEl(t);
          cmd = $.f.get(el, 'cmd');
          if (cmd && typeof $.f.cmd[cmd] === 'function') {
            // always pass the element that was clicked to its handler
            $.f.cmd[cmd](el);
            return;
          }
        },
        // add a picker item to list of boards
        makeBoardPickerItem: function (o) {
          var li, boardThumb, boardName, thumbImageUrl, helpers, helpersFound;
          li = $.f.make({'LI':{}});
          if (typeof o.i === 'number') {
            li.id = 'board_' + o.i;
          } else {
            li.className = $.a.k + '_recent';
          }
          boardThumb = $.f.make({'SPAN': {
            'className': $.a.k + '_boardThumb'
          }});
          // we may or may not have a high-resolution image cover URL
          if (o.item.image_cover_url) {
            // we have the image cover URL
            thumbImageUrl = o.item.image_cover_url;
          } else {
            // we need to convert image_thumbnail_url and stretch it with CSS
            thumbImageUrl = o.item.image_thumbnail_url.replace(/^http:\/\//, 'https://s-');
            boardThumb.className = boardThumb.className + ' ' + $.a.k + '_mungeThumb';
          }
          boardThumb.style.backgroundImage = 'url(' + thumbImageUrl + ')';
          li.appendChild(boardThumb);
          boardName = $.f.make({'SPAN': {
            'className': $.a.k + '_boardName',
            'textContent': $.f.clean(o.item.name)
          }});
          li.appendChild(boardName);
          helpersFound = 0;
          helpers = $.f.make({'SPAN': {
            'className': $.a.k + '_helpers'
          }});
          if (o.item.is_collaborative === true) {
            helpersFound++;
            helpers.appendChild($.f.make({'SPAN': {
              'className': $.a.k + '_icon ' + $.a.k + '_collaborative'
            }}));
          }
          if (o.item.privacy === 'secret') {
            helpersFound++;
            helpers.appendChild($.f.make({'SPAN': {
              'className': $.a.k + '_icon ' + $.a.k + '_secret'
            }}));
          }
          if (helpersFound) {
            li.appendChild(helpers);
            boardName.className = boardName.className + ' ' + $.a.k + '_helpers_' + helpersFound;
          }
          li.appendChild($.f.make({'SPAN': {
            'className': $.a.k + '_button ' + $.a.k + '_save',
            'textContent': $.v.str['btnSave']
          }}));
          li.appendChild($.f.make({'SPAN': {
            'className': $.a.k + '_mask',
            'board-id': o.item.id,
            'cmd': 'save'
          }}));
          // if we've just made a new board, insert it at the top of the list
          if (o.i === -1) {
            o.list.insertBefore(li, o.list.getElementsByTagName('LI')[1]);
          } else {
            o.list.appendChild(li);
          }
        },
        // render imageless thumbnail
        renderImagelessThumb: function () {
          $.s.thumb.className = $.a.k + '_thumb' + ' ' + $.a.k + '_imageless';
          $.s.thumb.style.backgroundColor = $.v.data.color;
          // kill DOM nodes inside thumb and start over
          $.s.thumb.innerHTML = '';
          // site name
          $.s.thumb.appendChild($.f.make({'SPAN':{'textContent': $.f.clean($.v.data.siteName), 'className': $.a.k + '_site'}}));
          // text pin
          $.s.thumb.appendChild($.f.make({'SPAN':{'textContent': $.f.clean($.s.description.value).substr(0, 100), 'className': $.a.k + '_text'}}));
        },
        // fulfill requests made by the background process
        act: {
          // show the new board we just made
          showNewBoard: function (obj) {
            // passing -1 to makeBoardPickerItem gets our new board to the top of the stack
            $.s.createContainer.className = $.a.k + '_createContainer';
            $.f.makeBoardPickerItem({'item': obj.data, 'i': -1, 'list': $.s.topChoicesList});
          },
          // populate the pin create form
          populateCreateForm: function (obj) {
            $.v.data = obj.data;
            $.s.description.value = $.f.clean($.v.data.description) || '';
            if ($.v.data.media) {
              $.s.thumb.style.backgroundImage = 'url(' + $.v.data.media + ')';
            } else {
              $.w.setInterval(function () {
                if ($.v.lastDescription !== $.s.description.value) {
                  $.f.renderImagelessThumb();
                  $.v.lastDescription = $.s.description.value;
                }
              }, 200);
            }
            // turn the preview image into a data:URI for pin create success notification
            if ($.v.data.media) {
              var preview = new Image();
              preview.onload = function () {
                var canvas = $.d.createElement('CANVAS');
                canvas.height = canvas.width = 140;
                var context = canvas.getContext('2d');
                // scale and center the thumbnail
                var h = this.height;
                var w = this.width;
                var dx = dy = 0;
                var dh = dw = 140;
                if (h !== w) {
                  if (w > h) {
                    dh = ~~(h / w * 140);
                    dy = ~~(70 - dh / 2);
                  } else {
                    dw = ~~(w / h * 140);
                    dx = ~~(70 - dw / 2);
                  }
                };
                var scaledHeight = ~~(237 * h / w);
                if (scaledHeight > 400) {
                  scaledHeight = 400;
                }
                $.s.thumb.style.height = scaledHeight + 'px';
                context.drawImage(preview, dx, dy, dw, dh);
                $.v.canvasData = canvas.toDataURL('image/png');
              };
              preview.src = $.v.data.media;
            } else {
              $.s.thumb.style.height = '237px';
            }
            // sort boards by timestamp
            $.v.data.boards.sort(function(a, b) {
              if(a.ts > b.ts) return -1;
              if(a.ts < b.ts) return 1;
              return 0;
            });
            // show most recently boards
            for (var i = 0; i < 3; i = i + 1) {
              var item = $.v.data.boards[i];
              $.f.makeBoardPickerItem({'item': item, 'list': $.s.topChoicesList});
            }
            // sort by name
            $.v.data.boards.sort(function(a, b) {
              if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
              if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
              return 0;
            });
            // show all boards
            for (var i = 0; i < $.v.data.boards.length; i = i + 1) {
              var item = $.v.data.boards[i];
              $.f.makeBoardPickerItem({'item': item, 'i': i, 'list': $.s.allBoardsList});
            }
          }
        },
        // watch search box
        checkSearch: function () {
          var li, i, name, v = $.s.boardSearch.value.toLowerCase();
          if (v) {
            if (v !== $.v.lastSearch) {
              // save last search
              $.v.lastSearch = v;
              // hide top choices
              $.s.topChoices.style.display = 'none';
              // hide all boards in header
              $.s.allBoardsHd.style.display = 'none';
              // get all the boards listen in allBoards
              li = $.s.allBoardsList.getElementsByTagName('LI');
              // hide any that don't match the search input
              for (i = 0; i < li.length; i = i + 1) {
                name = $.v.data.boards[i].name.toLowerCase();
                if (name.indexOf($.v.lastSearch) !== -1) {
                  li[i].style.display = 'block';
                } else {
                  li[i].style.display = 'none';
                }
              }
              // update inline link with search input
              $.s.inCreateFormOpenerText.textContent = $.f.clean($.s.boardSearch.value);
              // show the inline link
              $.s.inCreateFormOpener.style.display = 'block';
              // hide the footer link
              $.s.ftCreateFormOpener.style.display = 'none';
            }
          } else {
            // should we restore the main view?
            if ($.v.lastSearch) {
              $.v.lastSearch = '';
              // show top choices
              $.s.topChoices.style.display = 'block';
              // show all boards header
              $.s.allBoardsHd.style.display = 'block';
              li = $.s.allBoardsList.getElementsByTagName('LI');
              for (i = 0; i < li.length; i = i + 1) {
                li[i].style.display = 'block';
              }
              // remove search input from inline link
              $.s.inCreateFormOpenerText.textContent = '';
              // hide the inline link
              $.s.inCreateFormOpener.style.display = 'none';
              // show the footer link
              $.s.ftCreateFormOpener.style.display = 'block';
            }
          }
          $.w.setTimeout(function () {
            $.f.checkSearch();
          }, 250);
        },
        // start here
        init: function () {
          $.d.b = $.d.getElementsByTagName('BODY')[0];
          // don't do anything if you can't find document.body
          if ($.d.b) {
            // we'll add CSS to document.head
            $.d.h = $.d.getElementsByTagName('HEAD')[0];

            // call a proper lang/loc lookup to get this
            $.f.getStrings();

            // some of our strings are used more than once
            $.v.str['linkCreateBoard'] = $.v.str['hdCreate'];
            $.v.str['ftCreateFormOpener'] = $.v.str['hdCreate'];
            $.v.str['inCreateFormOpener'] = $.v.str['btnCreateGo'] + ': ';

            // build stylesheets
            $.f.presentation($.a.styles);

            // listen for clicks & keystrokes
            $.f.listen($.d.b, 'click', $.f.click);
            $.f.listen($.d, 'keydown', $.f.keydown);

            $.w.setTimeout(function () {
              // build structure
              $.f.buildOne($.a.structure);
              $.w.setTimeout(function () {
                // focus on the search box
                $.s.boardSearch.focus();
                // start watching the search box
                $.f.checkSearch();
              }, 10);
            }, 10);

            // if an incoming message from script is for us and triggers a valid function, run it
            $.b.runtime.onMessage.addListener(function(r) {
              if (r.to && r.to === $.a.me) {
                if (r.act && typeof $.f.act[r.act] === 'function') {
                  // we may be getting this message before structure has rendered, so hang on just a moment
                  $.w.setTimeout(function () {
                    $.f.act[r.act](r);
                  }, 10);
                }
              }
            });

          }
        }
      };
    }())
  };
  // wait for the page to load
  $.f.listen($.w, 'load', $.f.init);
}(window, document, {
  'k': 'CREATE',
  'me': 'create',
  'str': {
    // English
    'en': {
      // main header in Save form
      'hdSave': 'Choose board',
      // Creates the pin
      'btnSave': 'Save',
      // placeholder text in Search input
      'boardSearch': 'Search',
      // interstitial header in board list
      'topChoicesHd': 'Top choices',
      // interstitial header in board list
      'allBoardsHd': 'All boards',
      // header in Create form
      'hdCreate': 'Create board',
      // label over the Create Board input box
      'lblName': 'Name',
      // placeholder text in Create Board input
      'txtCreate': 'Like "Places to Go"',
      // label over secret/not-secret switch
      'toggleSecretText': 'Secret',
      // switch options
      'optYes': 'Yes',
      'optNo': 'No',
      // cancel create
      'btnCreateCancel': 'Cancel',
      // create new board
      'btnCreateGo': 'Create',
      // successful creation
      'msgSuccess': 'Success!',
      // board identifier
      'msgPinSavedTo': 'Saved to %',
      // board create success
      'msgBoardCreated': 'New board % was created',
      // board create fail
      'msgBoardFail': 'Could not create new board',
      // pin create fail
      'msgPinFail': 'Could not save this page',
      // pin create buttons
      'msgPinCreate': 'New Pin was created',
      'msgPromotePin': 'Promote your Pin',
      // pin / board create success button
      'msgSeeItNow': 'See it now'
    },
    'cs': {
      'hdSave': 'Zvolit nástěnku',
      'btnSave': 'Uložit',
      'boardSearch': 'Hledat',
      'topChoicesHd': 'Doporučené nástěnky',
      'allBoardsHd': 'Všechny nástěnky',
      'hdCreate': 'Vytvořit nástěnku',
      'lblName': 'Jméno',
      'txtCreate': 'Například „Místa, na která se chci podívat“',
      'toggleSecretText': 'Tajná',
      'optYes': 'Ano',
      'optNo': 'Ne',
      'btnCreateCancel': 'Zrušit',
      'btnCreateGo': 'Vytvořit',
      'msgSuccess': 'Úspěch',
      'msgPinCreate': 'Byl vytvořen nový pin',
      'msgPromotePin': 'Propagujte svůj pin',
      'msgBoardCreated': 'Byla vytvořena nová nástěnka %',
      'msgBoardFail': 'Nelze vytvořit novou nástěnku',
      'msgPinFail': 'Tuto stránku se nepodařilo uložit',
      'msgPinSavedTo': 'Uloženo na nástěnku %',
      'msgSeeItNow': 'Prohlédnout'
    },
    'da': {
      'hdSave': 'Vælg opslagstavle',
      'btnSave': 'Gem',
      'boardSearch': 'Søg',
      'topChoicesHd': 'Topvalg',
      'allBoardsHd': 'Alle opslagstavler',
      'hdCreate': 'Opret opslagstavle',
      'lblName': 'Navn',
      'txtCreate': 'F.eks. “Potentielle rejsemål”',
      'toggleSecretText': 'Hemmelig',
      'optYes': 'Ja',
      'optNo': 'Nej',
      'btnCreateCancel': 'Annuller',
      'btnCreateGo': 'Opret',
      'msgSuccess': 'Klaret!',
      'msgPinCreate': 'Der blev oprettet en ny pin',
      'msgPromotePin': 'Sponsorér din pin',
      'msgBoardCreated': 'Opslagstavlen % blev oprettet',
      'msgBoardFail': 'Opslagstavlen kunne ikke oprettes',
      'msgPinFail': 'Siden kunne ikke gemmes',
      'msgPinSavedTo': 'Gemt på %',
      'msgSeeItNow': 'Se den nu'
    },
    'de': {
      'hdSave': 'Pinnwand auswählen',
      'btnSave': 'Merken',
      'boardSearch': 'Suchen',
      'topChoicesHd': 'Beliebte Auswahl',
      'allBoardsHd': 'Alle Pinnwände',
      'hdCreate': 'Pinnwand erstellen',
      'lblName': 'Name',
      'txtCreate': 'Wie wär’s mit „Reiseziele“?',
      'toggleSecretText': 'Geheim',
      'optYes': 'Ja',
      'optNo': 'Nein',
      'btnCreateCancel': 'Abbrechen',
      'btnCreateGo': 'Erstellen',
      'msgSuccess': 'Fertig!',
      'msgPinCreate': 'Neuer Pin wurde erstellt',
      'msgPromotePin': 'Pin bewerben',
      'msgBoardCreated': 'Neue Pinnwand „%“ wurde erstellt',
      'msgBoardFail': 'Neue Pinnwand konnte nicht erstellt werden',
      'msgPinFail': 'Seite konnte nicht gespeichert werden',
      'msgPinSavedTo': 'Gepinnt auf „%“',
      'msgSeeItNow': 'Jetzt ansehen'
    },
    'el': {
      'hdSave': 'Επιλογή πίνακα',
      'btnSave': 'Αποθήκευση',
      'boardSearch': 'Αναζήτηση',
      'topChoicesHd': 'Κορυφαίες επιλογές',
      'allBoardsHd': 'Όλοι οι πίνακες',
      'hdCreate': 'Δημιουργία πίνακα',
      'lblName': 'Όνομα',
      'txtCreate': 'Δηλώστε ότι σας αρέσει το «Μέρη που θέλω να πάω»',
      'toggleSecretText': 'Μυστικός',
      'optYes': 'Ναι',
      'optNo': 'Όχι',
      'btnCreateCancel': 'Άκυρο',
      'btnCreateGo': 'Δημιουργία',
      'msgSuccess': 'Τέλεια! ',
      'msgPinCreate': 'Δημιουργήθηκε νέο pin',
      'msgPromotePin': 'Διαφημίστε το pin σας',
      'msgBoardCreated': 'Δημιουργήθηκε νέος πίνακας %',
      'msgBoardFail': 'Δεν ήταν δυνατή η δημιουργία νέου πίνακα',
      'msgPinFail': 'Δεν ήταν δυνατή η αποθήκευση αυτής της σελίδας',
      'msgPinSavedTo': 'Αποθηκεύτηκε στο %',
      'msgSeeItNow': 'Δείτε τον τώρα'
    },
    'es': {
      'hdSave': 'Seleccionar tablero',
      'btnSave': 'Guardar',
      'boardSearch': 'Buscar',
      'topChoicesHd': 'Lo más elegido',
      'allBoardsHd': 'Todos los tableros',
      'hdCreate': 'Crear tablero',
      'lblName': 'Nombre',
      'txtCreate': 'Por ejemplo, “Lugares que visitar”',
      'toggleSecretText': 'Secreto',
      'optYes': 'Sí',
      'optNo': 'No',
      'btnCreateCancel': 'Cancelar',
      'btnCreateGo': 'Crear',
      'msgSuccess': '¡Conseguido!',
      'msgPinCreate': 'Se ha creado un nuevo Pin',
      'msgPromotePin': 'Promocionar tu Pin',
      'msgBoardCreated': 'Se ha creado el nuevo tablero %',
      'msgBoardFail': 'No se ha podido crear un nuevo tablero',
      'msgPinFail': 'No se ha podido guardar esta página',
      'msgPinSavedTo': 'Guardado en %',
      'msgSeeItNow': 'Ver ahora'
    },
    'fi': {
      'hdSave': 'Valitse taulu',
      'btnSave': 'Tallenna',
      'boardSearch': 'Haku',
      'topChoicesHd': 'Suositut taulut',
      'allBoardsHd': 'Kaikki taulut',
      'hdCreate': 'Luo taulu',
      'lblName': 'Nimi',
      'txtCreate': 'Esim. Nähtävää',
      'toggleSecretText': 'Salainen',
      'optYes': 'Kyllä',
      'optNo': 'Ei',
      'btnCreateCancel': 'Peruuta',
      'btnCreateGo': 'Luo',
      'msgSuccess': 'Onnistui!',
      'msgPinCreate': 'Luotiin uusi Pin.',
      'msgPromotePin': 'Promoa Pin-lisäystäsi',
      'msgBoardCreated': 'Luotiin uusi taulu: %.',
      'msgBoardFail': 'Taulun luominen epäonnistui.',
      'msgPinFail': 'Sivun tallentaminen epäonnistui.',
      'msgPinSavedTo': 'Tallennettu: %',
      'msgSeeItNow': 'Katso'
    },
    'fr': {
      'hdSave': 'Choisir un tableau',
      'btnSave': 'Enregistrer',
      'boardSearch': 'Rechercher',
      'topChoicesHd': 'Meilleurs choix',
      'allBoardsHd': 'Tous les tableaux ',
      'hdCreate': 'Créer un tableau',
      'lblName': 'Nom',
      'txtCreate': 'Tel que “Lieux à visiter”',
      'toggleSecretText': 'Secret',
      'optYes': 'Oui',
      'optNo': 'Non',
      'btnCreateCancel': 'Annuler',
      'btnCreateGo': 'Créer',
      'msgSuccess': 'Opération réussie !',
      'msgPinCreate': 'Une nouvelle épingle a été créée',
      'msgPromotePin': 'Sponsoriser votre épingle',
      'msgBoardCreated': 'Un nouveau tableau % a été créé',
      'msgBoardFail': 'Impossible de créer un nouveau tableau.',
      'msgPinFail': 'Impossible d’enregistrer cette page.',
      'msgPinSavedTo': 'Enregistré dans %',
      'msgSeeItNow': 'Voir cette épingle'
    },
    'hi': {
      'hdSave': 'बोर्ड चुनें',
      'btnSave': 'सेव करें',
      'boardSearch': 'खोजें',
      'topChoicesHd': 'मुख्य पसंद',
      'allBoardsHd': 'सभी बोर्ड',
      'hdCreate': 'बोर्ड बनाएँ',
      'lblName': 'नाम',
      'txtCreate': '”देखने योग्य स्थान” को लाइक करें',
      'toggleSecretText': 'सीक्रेट',
      'optYes': 'हाँ',
      'optNo': 'नहीं',
      'btnCreateCancel': 'रद्द कर दें',
      'btnCreateGo': 'बनाएँ',
      'msgSuccess': 'सफल हुआ! ',
      'msgPinCreate': 'नई पिन बनाई गई',
      'msgPromotePin': 'अपनी पिन का प्रचार करें',
      'msgBoardCreated': 'नया बोर्ड % बनाया गया',
      'msgBoardFail': 'नया बोर्ड नहीं बनाया जा सका',
      'msgPinFail': 'यह पेज सेव नहीं किया जा सका',
      'msgPinSavedTo': '% पर सेव कर लिया',
      'msgSeeItNow': 'इसे अब देखें'
    },
    'hu': {
      'hdSave': 'Tábla kiválasztása',
      'btnSave': 'Mentés',
      'boardSearch': 'Keresés',
      'topChoicesHd': 'Legtöbbször választott',
      'allBoardsHd': 'Minden tábla',
      'hdCreate': 'Tábla létrehozása',
      'lblName': 'Név',
      'txtCreate': 'Például „Ahová el szeretnék jutni”',
      'toggleSecretText': 'Titkos',
      'optYes': 'Igen',
      'optNo': 'Nem',
      'btnCreateCancel': 'Mégse',
      'btnCreateGo': 'Létrehozás',
      'msgSuccess': 'Sikerült!',
      'msgPinCreate': 'Elkészült az új pin',
      'msgPromotePin': 'Reklámozd a pinedet',
      'msgBoardCreated': 'Elkészült az új, % nevű tábla',
      'msgBoardFail': 'Nem hozható létre új tábla',
      'msgPinFail': 'Nem lehet menteni az oldalt',
      'msgPinSavedTo': 'Mentve ide: %',
      'msgSeeItNow': 'Megnézem'
    },
    'id': {
      'hdSave': 'Pilih papan',
      'btnSave': 'Simpan',
      'boardSearch': 'Cari',
      'topChoicesHd': 'Pilihan teratas',
      'allBoardsHd': 'Semua papan',
      'hdCreate': 'Buat papan',
      'lblName': 'Nama',
      'txtCreate': 'Seperti “Tempat untuk Dikunjungi”',
      'toggleSecretText': 'Rahasia',
      'optYes': 'Ya',
      'optNo': 'Tidak',
      'btnCreateCancel': 'Batal',
      'btnCreateGo': 'Buat',
      'msgSuccess': 'Berhasil!',
      'msgPinCreate': 'Pin baru telah dibuat',
      'msgPromotePin': 'Promosikan Pin Anda',
      'msgBoardCreated': 'Papan baru % telah dibuat',
      'msgBoardFail': 'Tidak bisa membuat papan baru',
      'msgPinFail': 'Tidak bisa menyimpan halaman ini',
      'msgPinSavedTo': 'Disimpan ke %',
      'msgSeeItNow': 'Lihat sekarang'
    },
    'it': {
      'hdSave': 'Scegli una bacheca',
      'btnSave': 'Salva',
      'boardSearch': 'Cerca',
      'topChoicesHd': 'Le migliore scelte',
      'allBoardsHd': 'Tutte le bacheche',
      'hdCreate': 'Crea bacheca',
      'lblName': 'Nome',
      'txtCreate': 'Come “Luoghi da visitare”',
      'toggleSecretText': 'Segreta',
      'optYes': 'Sì',
      'optNo': 'No',
      'btnCreateCancel': 'Annulla',
      'btnCreateGo': 'Crea',
      'msgSuccess': 'Completato!',
      'msgPinCreate': 'È stato creato un nuovo Pin',
      'msgPromotePin': 'Promuovi il tuo Pin',
      'msgBoardCreated': 'È stata creata la nuova bacheca %',
      'msgBoardFail': 'Impossibile creare una nuova bacheca',
      'msgPinFail': 'Impossibile salvare questa pagina',
      'msgPinSavedTo': 'Salvato in %',
      'msgSeeItNow': 'Visualizzalo ora'
    },
    'ja': {
      'hdSave': 'ボードを選択',
      'btnSave': '保存',
      'boardSearch': '検索',
      'topChoicesHd': '人気のボード',
      'allBoardsHd': 'すべてのボード',
      'hdCreate': '新規ボードを作成',
      'lblName': '名前',
      'txtCreate': '「行きたい場所」など',
      'toggleSecretText': 'シークレット（非公開）',
      'optYes': 'Yes',
      'optNo': 'No',
      'btnCreateCancel': 'キャンセル',
      'btnCreateGo': '作成',
      'msgSuccess': 'できました！',
      'msgPinCreate': '新しいピンが作成されました。',
      'msgPromotePin': 'ピンのプロモート',
      'msgBoardCreated': '新しいボード「%」が作成されました。',
      'msgBoardFail': '新しいボードを作成できませんでした。',
      'msgPinFail': 'このページを保存できませんでした。',
      'msgPinSavedTo': '「%」に保存しました',
      'msgSeeItNow': '今すぐ見る'
    },
    'ko': {
      'hdSave': '보드 선택',
      'btnSave': '저장',
      'boardSearch': '검색',
      'topChoicesHd': '최고 인기 선정',
      'allBoardsHd': '모든 보드',
      'hdCreate': '보드 만들기',
      'lblName': '이름',
      'txtCreate': '예: "가고 싶은 곳"',
      'toggleSecretText': '비밀 설정',
      'optYes': '허용',
      'optNo': '안 함',
      'btnCreateCancel': '취소',
      'btnCreateGo': '만들기',
      'msgSuccess': '성공! ',
      'msgPinCreate': '새 핀을 만들었습니다.',
      'msgPromotePin': '핀 홍보하기',
      'msgBoardCreated': '새 보드 %을(를) 만들었습니다.',
      'msgBoardFail': '새 보드를 만들지 못했습니다! ',
      'msgPinFail': '이 페이지를 저장하지 못했습니다.',
      'msgPinSavedTo': '에 저장됨%',
      'msgSeeItNow': '지금 확인'
    },
    'ms': {
      'hdSave': 'Pilih papan',
      'btnSave': 'Simpan',
      'boardSearch': 'Cari',
      'topChoicesHd': 'Pilihan teratas',
      'allBoardsHd': 'Semua papan',
      'hdCreate': 'Cipta papan',
      'lblName': 'Nama',
      'txtCreate': 'Seperti “Tempat untuk Dikunjungi”',
      'toggleSecretText': 'Rahsia',
      'optYes': 'Ya',
      'optNo': 'Tidak',
      'btnCreateCancel': 'Batal',
      'btnCreateGo': 'Cipta',
      'msgSuccess': 'Berjaya! ',
      'msgPinCreate': 'Pin baharu telah dicipta',
      'msgPromotePin': 'Promosikan Pin anda',
      'msgBoardCreated': 'Papan baharu % telah dicipta',
      'msgBoardFail': 'Tidak dapat mencipta papan baharu',
      'msgPinFail': 'Tidak dapat menyimpan halaman ini',
      'msgPinSavedTo': 'Disimpan ke %',
      'msgSeeItNow': 'Lihatnya sekarang'
    },
    'nb': {
      'hdSave': 'Velg tavle',
      'btnSave': 'Lagre',
      'boardSearch': 'Søk',
      'topChoicesHd': 'Populære valg',
      'allBoardsHd': 'Alle tavler',
      'hdCreate': 'Opprett tavle',
      'lblName': 'Navn',
      'txtCreate': 'For eksempel “Steder å reise til”',
      'toggleSecretText': 'Hemmelig',
      'optYes': 'Ja',
      'optNo': 'Nei',
      'btnCreateCancel': 'Avbryt',
      'btnCreateGo': 'Opprett',
      'msgSuccess': 'Suksess! ',
      'msgPinCreate': 'En ny Pin er opprettet',
      'msgPromotePin': 'Promotér Pinen din',
      'msgBoardCreated': 'Den nye tavlen % er opprettet',
      'msgBoardFail': 'Kunne ikke opprette ny tavle',
      'msgPinFail': 'Kunne ikke lagre denne siden',
      'msgPinSavedTo': 'Lagret på %',
      'msgSeeItNow': 'Se den nå'
    },
    'nl': {
      'hdSave': 'Bord kiezen',
      'btnSave': 'Opslaan',
      'boardSearch': 'Zoeken',
      'topChoicesHd': 'Populairste keuzes',
      'allBoardsHd': 'Alle borden',
      'hdCreate': 'Bord maken',
      'lblName': 'Naam',
      'txtCreate': 'Zoals “Plaatsen om te bezoeken”',
      'toggleSecretText': 'Verborgen',
      'optYes': 'Ja',
      'optNo': 'Nee',
      'btnCreateCancel': 'Annuleren',
      'btnCreateGo': 'Maken',
      'msgSuccess': 'Gelukt!',
      'msgPinCreate': 'Nieuwe pin is gemaakt',
      'msgPromotePin': 'Je pin uitlichten',
      'msgBoardCreated': 'Nieuwe bord % is gemaakt',
      'msgBoardFail': 'Kan nieuw bord niet maken',
      'msgPinFail': 'Kan deze pagina niet bewaren',
      'msgPinSavedTo': 'Bewaard op %',
      'msgSeeItNow': 'Nu bekijken'
    },
    'pl': {
      'hdSave': 'Wybierz tablicę',
      'btnSave': 'Zapisz',
      'boardSearch': 'Szukaj',
      'topChoicesHd': 'Najczęściej wybierane',
      'allBoardsHd': 'Wszystkie tablice',
      'hdCreate': 'Utwórz tablicę',
      'lblName': 'Nazwa',
      'txtCreate': 'Np. „Miejsca do odwiedzenia”',
      'toggleSecretText': 'Ukryta',
      'optYes': 'Tak',
      'optNo': 'Nie',
      'btnCreateCancel': 'Anuluj',
      'btnCreateGo': 'Utwórz',
      'msgSuccess': 'Udało się! ',
      'msgPinCreate': 'Utworzono nowego Pina',
      'msgPromotePin': 'Wypromuj swojego Pina',
      'msgBoardCreated': 'Utworzono nową tablicę %',
      'msgBoardFail': 'Nie udało się utworzyć nowej tablicy',
      'msgPinFail': 'Nie udało się zapisać tej strony',
      'msgPinSavedTo': 'Zapisano na tablicy %',
      'msgSeeItNow': 'Zobacz teraz'
    },
    'pt-br': {
      'hdSave': 'Escolha uma pasta',
      'btnSave': 'Salvar',
      'boardSearch': 'Pesquisar',
      'topChoicesHd': 'Principais escolhas',
      'allBoardsHd': 'Todas as pastas',
      'hdCreate': 'Criar pasta',
      'lblName': 'Nome',
      'txtCreate': 'Curtir “Lugares para visitar”',
      'toggleSecretText': 'Privada',
      'optYes': 'Sim',
      'optNo': 'Não',
      'btnCreateCancel': 'Cancelar',
      'btnCreateGo': 'Criar',
      'msgSuccess': 'Concluído!',
      'msgPinCreate': 'Um novo Pin foi criado',
      'msgPromotePin': 'Promova seu Pin',
      'msgBoardCreated': 'A nova pasta % foi criada',
      'msgBoardFail': 'Não foi possível criar a nova pasta',
      'msgPinFail': 'Não foi possível salvar essa página',
      'msgPinSavedTo': 'Salvo em %',
      'msgSeeItNow': 'Ver agora'
    },
    'pt': {
      'hdSave': 'Escolher álbum',
      'btnSave': 'Guardar',
      'boardSearch': 'Pesquisar',
      'topChoicesHd': 'Principais escolhas',
      'allBoardsHd': 'Todos os álbuns',
      'hdCreate': 'Criar álbum',
      'lblName': 'Nome',
      'txtCreate': 'Como “Lugares aonde ir”',
      'toggleSecretText': 'Secreto',
      'optYes': 'Sim',
      'optNo': 'Não',
      'btnCreateCancel': 'Cancelar',
      'btnCreateGo': 'Criar',
      'msgSuccess': 'Concluído!',
      'msgPinCreate': 'O novo Pin foi criado',
      'msgPromotePin': 'Promover o teu Pin',
      'msgBoardCreated': 'O novo álbum % foi criado',
      'msgBoardFail': 'Não foi possível criar um novo álbum',
      'msgPinFail': 'Não foi possível guardar esta página',
      'msgPinSavedTo': 'Guardado em %',
      'msgSeeItNow': 'Ver agora'
    },
    'ro': {
      'hdSave': 'Alege panou',
      'btnSave': 'Salvează',
      'boardSearch': 'Caută',
      'topChoicesHd': 'Alegeri de top',
      'allBoardsHd': 'Toate panourile',
      'hdCreate': 'Creează panou',
      'lblName': 'Nume',
      'txtCreate': 'ca „Destinații de călătorie”',
      'toggleSecretText': 'Secret',
      'optYes': 'Da',
      'optNo': 'Nu',
      'btnCreateCancel': 'Anulează',
      'btnCreateGo': 'Creează',
      'msgSuccess': 'Reușit!',
      'msgPinCreate': 'A fost creat un nou Pin',
      'msgPromotePin': 'Promovează-ți Pinul',
      'msgBoardCreated': 'A fost creat un nou panou, %',
      'msgBoardFail': 'Noul panou nu a putut fi creat',
      'msgPinFail': 'Pagina nu a putut fi salvată',
      'msgPinSavedTo': 'Salvat pe %',
      'msgSeeItNow': 'Vezi acum'
    },
    'ru': {
      'hdSave': 'Выбор доски',
      'btnSave': 'Сохранить',
      'boardSearch': 'Поиск',
      'topChoicesHd': 'Лучшие варианты',
      'allBoardsHd': 'Все доски',
      'hdCreate': 'Создать доску',
      'lblName': 'Имя',
      'txtCreate': 'Например, «Места, которые я хочу посетить».',
      'toggleSecretText': 'Секретная',
      'optYes': 'Да',
      'optNo': 'Нет',
      'btnCreateCancel': 'Отмена',
      'btnCreateGo': 'Готово',
      'msgSuccess': 'Получилось! ',
      'msgPinCreate': 'Создан новый Пин.',
      'msgPromotePin': 'Рекламируйте свои Пины',
      'msgBoardCreated': 'Создана новая доска «%».',
      'msgBoardFail': 'Не удалось создать новую доску. ',
      'msgPinFail': 'Не удалось сохранить эту страницу.',
      'msgPinSavedTo': 'Сохранено на «%»',
      'msgSeeItNow': 'Посмотреть'
    },
    'sk': {
      'hdSave': 'Vyberte si nástenku',
      'btnSave': 'Uložiť',
      'boardSearch': 'Hľadať',
      'topChoicesHd': 'Najlepší výber',
      'allBoardsHd': 'Všetky nástenky',
      'hdCreate': 'Vytvorte nástenku',
      'lblName': 'Meno',
      'txtCreate': 'Dajte lajk na „Miesta, kam treba ísť”',
      'toggleSecretText': 'Tajná',
      'optYes': 'Áno',
      'optNo': 'Nie',
      'btnCreateCancel': 'Zrušiť',
      'btnCreateGo': ' Vytvoriť',
      'msgSuccess': 'Podarilo sa!',
      'msgPinCreate': 'Bol vytvorený nový pin',
      'msgPromotePin': 'Propagujte svoj pin',
      'msgBoardCreated': 'Bola vytvorená nová nástenka %',
      'msgBoardFail': 'Nepodarilo sa vytvoriť novú nástenku',
      'msgPinFail': 'Nepodarilo sa uložiť túto stránku',
      'msgPinSavedTo': 'Uložené na %',
      'msgSeeItNow': 'Zobraziť teraz'
    },
    'sv': {
      'hdSave': 'Välj anslagstavla',
      'btnSave': 'Spara',
      'boardSearch': 'Sök',
      'topChoicesHd': 'Bästa valen',
      'allBoardsHd': 'Alla anslagstavlor',
      'hdCreate': 'Skapa anslagstavla',
      'lblName': 'Namn',
      'txtCreate': 'Som “Platser att besöka”',
      'toggleSecretText': 'Privat',
      'optYes': 'Ja',
      'optNo': 'Nej',
      'btnCreateCancel': 'Avbryt',
      'btnCreateGo': ' Skapa',
      'msgSuccess': 'Klart!',
      'msgPinCreate': 'Ny pin skapades',
      'msgPromotePin': 'Marknadsför din pin',
      'msgBoardCreated': 'Ny anslagstavla % skapades',
      'msgBoardFail': 'Det gick inte att skapa en ny anslagstavla',
      'msgPinFail': 'Det gick inte att spara den här sidan',
      'msgPinSavedTo': 'Sparat på %',
      'msgSeeItNow': 'Visa den nu'
    },
    'th': {
      'hdSave': 'เลือกบอร์ด',
      'btnSave': 'บันทึก',
      'boardSearch': 'ค้นหา',
      'topChoicesHd': 'ตัวเลือกยอดนิยม',
      'allBoardsHd': 'บอร์ดทั้งหมด',
      'hdCreate': 'สร้างบอร์ด',
      'lblName': 'ชื่อ',
      'txtCreate': 'เช่น “สถานที่ที่อยากไป”',
      'toggleSecretText': 'เป็นความลับ',
      'optYes': 'ใช่',
      'optNo': 'ไม่',
      'btnCreateCancel': 'ยกเลิก',
      'btnCreateGo': 'สร้าง',
      'msgSuccess': 'สำเร็จ!',
      'msgPinCreate': 'สร้างพินใหม่แล้ว',
      'msgPromotePin': 'โปรโมทพินของคุณ',
      'msgBoardCreated': 'สร้างบอร์ดใหม่ % แล้ว',
      'msgBoardFail': 'ไม่สามารถสร้างบอร์ดใหม่ได้',
      'msgPinFail': 'ไม่สามารถบันทึกหน้านี้ได้',
      'msgPinSavedTo': 'บันทึกไปที่บอร์ด % แล้ว',
      'msgSeeItNow': 'ดูเลย'
    },
    'tl': {
      'hdSave': 'Pumili ng board',
      'btnSave': 'I-save',
      'boardSearch': 'Maghanap',
      'topChoicesHd': 'Mga palaging pinipili',
      'allBoardsHd': 'Lahat ng boards',
      'hdCreate': 'Gumawa ng board',
      'lblName': 'Pangalan',
      'txtCreate': 'I-like ang “Places to Go”',
      'toggleSecretText': 'Sikreto',
      'optYes': 'Oo',
      'optNo': 'Hindi',
      'btnCreateCancel': 'I-cancel',
      'btnCreateGo': 'Gumawa',
      'msgSuccess': 'Success!',
      'msgPinCreate': 'Nilikha ang baong Pin',
      'msgPromotePin': 'I-promote ang iyong Pin',
      'msgBoardCreated': 'Nilikha ang bagong board na %',
      'msgBoardFail': 'Hindi makalikha ng bagong board',
      'msgPinFail': 'Hindi mai-save ang pahinang ito',
      'msgPinSavedTo': 'Naka-save sa %',
      'msgSeeItNow': 'Tingnan na `to'
    },
    'tr': {
      'hdSave': 'Pano seçin',
      'btnSave': 'Kaydet',
      'boardSearch': 'Ara',
      'topChoicesHd': 'En iyi seçimler',
      'allBoardsHd': 'Tüm panolar',
      'hdCreate': 'Pano oluştur',
      'lblName': 'Adı',
      'txtCreate': 'Ör: “Gidilecek Yerler”',
      'toggleSecretText': 'Gizli',
      'optYes': 'Evet',
      'optNo': 'Hayır',
      'btnCreateCancel': 'İptal Et',
      'btnCreateGo': 'Oluştur',
      'msgSuccess': 'Başarılı!',
      'msgPinCreate': 'Yeni Pin oluşturuldu',
      'msgPromotePin': 'Pininize sponsor olun',
      'msgBoardCreated': '% adlı yeni pano oluşturuldu',
      'msgBoardFail': 'Yeni pano oluşturulamadı',
      'msgPinFail': 'Bu sayfa kaydedilemedi',
      'msgPinSavedTo': '% panosuna kaydedildi',
      'msgSeeItNow': 'Şimdi gör'
    },
    'uk': {
      'hdSave': 'Вибрати дошку',
      'btnSave': 'Зберегти',
      'boardSearch': 'Пошук',
      'topChoicesHd': 'Найпопулярніше',
      'allBoardsHd': 'Всі дошки',
      'hdCreate': 'Створити дошку',
      'lblName': 'Ім`я',
      'txtCreate': 'Наприклад, «Маршрути подорожей»',
      'toggleSecretText': 'Прихована',
      'optYes': 'Так',
      'optNo': 'Ні',
      'btnCreateCancel': 'Скасувати',
      'btnCreateGo': 'Створити',
      'msgSuccess': 'Вийшло!',
      'msgPinCreate': 'Створено новий пін',
      'msgPromotePin': 'Рекламуйте свій пін',
      'msgBoardCreated': 'Створено нову дошку «%»',
      'msgBoardFail': 'Не вдалося створити нову дошку',
      'msgPinFail': 'Не вдалося зберегти цю сторінку',
      'msgPinSavedTo': 'Збережено на дошці «%»',
      'msgSeeItNow': 'Показати'
    },
    'vi': {
      'hdSave': 'Chọn bảng',
      'btnSave': 'Lưu',
      'boardSearch': 'Tìm kiếm',
      'topChoicesHd': 'Các lựa chọn hay nhất',
      'allBoardsHd': 'Tất cả các bảng',
      'hdCreate': 'Tạo bảng',
      'lblName': 'Tên',
      'txtCreate': 'Như là "Địa điểm nên đến"',
      'toggleSecretText': 'Bí mật',
      'optYes': 'Có',
      'optNo': 'Không',
      'btnCreateCancel': 'Hủy',
      'btnCreateGo': 'Create',
      'msgSuccess': 'Thành công!',
      'msgPinCreate': 'Đã tạo Ghim mới',
      'msgPromotePin': 'Quảng cáo Ghim của bạn',
      'msgBoardCreated': 'Đã tạo bảng mới %',
      'msgBoardFail': 'Không thể tạo bảng mới',
      'msgPinFail': 'Không thể lưu trang này',
      'msgPinSavedTo': 'Đã lưu vào %',
      'msgSeeItNow': 'Xem ngay bây giờ'
    }
  },
  // our structure
  'structure': {
    'main': {
      'preview': {
        'thumb': {
          'imagelessSite': {},
          'imagelessText': {}
        },
        'description': {
          'tag': 'textarea',
          'cmd': 'select'
        }
      },
      'picker': {
        'hdSave': {},
        'xSave': {
          'cmd': 'close'
        },
        'boardSearch': {
          'tag': 'input',
          'type': 'text'
        },
        'boardListContainer': {
          'topChoices': {
            'topChoicesHd': {
              'addClass': 'divider'
            },
            'topChoicesList': {
              'tag': 'ul'
            }
          },
          'allBoards': {
            'allBoardsHd': {
              'addClass': 'divider'
            },
            'allBoardsList': {
              'tag': 'ul'
            }
          },
          'inCreateFormOpener': {
            'cmd': 'openCreate',
            'addClass': 'createFormOpener',
            'inCreateFormOpenerText': {
              'cmd': 'openCreate'
            }
          }
        },
        'ftCreateFormOpener': {
          'cmd': 'openCreate',
          'addClass': 'createFormOpener'
        },
        'createContainer': {
          'hdCreate': {},
          'xCreate': {
            'cmd': 'closeCreate'
          },
          'lblName': {
            'tag': 'label',
            'for': 'txtCreate'
          },
          'txtCreate': {
            'id': 'txtCreate',
            'tag': 'input',
            'type': 'text'
          },
          'lblSecret': {
            'tag': 'label',
            'for': 'createBoardFromSecret',
            'toggleSecretText': {},
            'createSecret': {
              'id': 'createBoardFromSecret',
              'tag': 'input',
              'type': 'checkbox'
            },
            'toggle': {
              'knob': {},
              'optNo': {},
              'optYes': {}
            }
          },
          'ftCreate': {
            'btnCreateGo': {
              'addClass': 'button create disabled',
              'cmd': 'createBoard'
            },
            'btnCreateCancel': {
              'addClass': 'button cancel',
              'cmd': 'closeCreate'
            }
          }
        }
      }
    }
  },
  // a SASS-like object to be turned into stylesheets
  'styles': {
    'body': {
      'height': '100%',
      'width': '100%',
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'right': '0',
      'bottom': '0',
      'background': 'rgba(0, 0, 0, .7)',
      'color': '#555',
      'font-family': '"Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", arial, sans-serif',
      '%prefix%font-smoothing': 'antialiased'
    },
    '*': {
      '%prefix%box-sizing': 'border-box'
    },
    '._main': {
      'position': 'absolute',
      'top': '50%',
      'left': '50%',
      'margin-left': '-330px',
      'margin-top': '-270px',
      'width': '660px',
      'height': '540px',
      'border-radius': '6px',
      'background': '#fff',
      'overflow': 'hidden',
      '._preview': {
        'height': '540px',
        'width': '330px',
        'background': '#f6f6f6',
        'line-height': '0',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-items': 'center',
        '._thumb': {
          'border-radius': '5px 5px 0 0',
          'display': 'block',
          'width': '237px',
          'background': '#555 url() 50% 50% no-repeat',
          'background-size': 'cover',
          'margin': '0 auto',
          'position': 'relative',
          'overflow': 'hidden',
          '&._imageless': {
            '._site, ._text': {
              'position': 'absolute',
              'color': '#fff',
              'font-size': '22px',
              'left': '20px',
            },
            '._site': {
              'top': '20px',
              'left': '20px',
              'font-size': '12px',
            },
            '._text': {
              'top': '38px',
              'line-height': '28px',
              'padding-right': '22px',
              'font-weight': 'bold',
              'letter-spacing': '-1px'
            }
          }
        },
        '._description': {
          'font-family': '"Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", arial, sans-serif',
          'border-radius': '0 0 5px 5px',
          'padding': '10px',
          'height': '100px',
          'width': '237px',
          'overflow': 'auto',
          'border': 'none',
          'outline': 'none',
          'resize': 'none',
          'font-size': '13px',
          'color': '#333',
          'cursor': 'pointer',
          'background': '#fff url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjE0cHgiIGhlaWdodD0iMTRweCIgdmlld0JveD0iMCAwIDI4IDI4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGZpbGw9IiNBQUEiPjxwYXRoIGQ9Ik0xOCw2TDIzLDExTDksMjVMMSwyOEw0LDIwWiIvPjxwYXRoIGQ9Ik0yMCw0TDI1LDlMMjcsN0ExLDEgMCAwIDAgMjIsMloiLz48L2c+PC9zdmc+) 217px 90% no-repeat',
          '&:focus': {
            'background-image': 'none',
            'cursor': 'text'
          }
        }
      },
     '._picker': {
        'position': 'absolute',
        'right': '0',
        'top': '0',
        'width': '330px',
        'height': '540px',
        'color': '#444',
        'text-align': 'left',
        // text input
        'input[type="text"]': {
          'font-family': '"Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", arial, sans-serif',
          'width': '284px',
          'border-radius': '4px',
          'padding': '13px',
          'background-color': '#f6f6f6',
          '-webkit-appearance': 'none',
          'border': '1px solid #eaeaea',
          'margin': '0 0 15px 20px',
          'font-size': '14px',
          'font-weight': 'bold',
          'outline': 'none',
          // search input has a cute little magnifying glass
          '&._boardSearch': {
            'padding-left': '42px',
            'background': '#f6f6f6 url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjMwcHgiIGhlaWdodD0iMzBweCIgdmlld0JveD0iMCAwIDMwIDMwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGZpbGw9IiM4ODgiIGQ9Ik0xOSwyMUwyMSwxOUwzMCwyN0ExLDEgMCAwIDEgMzAsMjhMMjgsMzBBMSwxIDAgMCAxIDI3LDMwWiIvPjxjaXJjbGUgY3g9IjEzIiBjeT0iMTMiIHI9IjEwIiBzdHJva2U9IiM4ODgiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMyIvPjwvZz48L3N2Zz4=) 10px 50% no-repeat',
            'background-size': '16px 16px'
          }
        },
        // headlines
        '._hdSave, ._hdCreate': {
          'display': 'block',
          'font-weight': 'bold',
          'font-size': '20px',
          'height': '65px',
          'padding': '20px 20px 20px 20px',
          'margin': '0'
        },
        // X icons to close various things
        '._xSave, ._xCreate': {
          'font-size': '20px',
          'position': 'absolute',
          'top': '25px',
          'right': '25px',
          'cursor': 'pointer',
          'height': '16px',
          'width': '16px',
          'background': 'transparent url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDMyIDMyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGZpbGw9IiM4ODgiIGQ9Ik0xLDZBMSwxLDAgMCAxIDYsMUwxNiwxMUwyNiwxQTEsMSwwIDAgMSAzMSw2TDIxLDE2TDMxLDI2QTEsMSwwIDAgMSAyNiwzMUwxNiwyMUw2LDMxQTEsMSwwIDAgMSAxLDI2TDExLDE2WiIvPjwvZz48L3N2Zz4=) 0 0 no-repeat',
          'opacity': '.5',
          '&:hover': {
            'opacity': '1'
          }
        },
        // the board list container may contain several lists
        '._boardListContainer': {
          'border-top': '1px solid #eee',
          'height': '415px',
          'width': '330px',
          'position': 'absolute',
          'top': '125px',
          'left': '0',
          'overflow': 'auto',
          'margin': '0',
          'padding': '0 0 75px 0',
          // for things like "All boards" and "Top choices"
          '._divider': {
            'display': 'block',
            'color': '#555',
            'height': '30px',
            'padding': '8px 0 8px 20px',
            'font-size': '14px',
            '&:hover': {
              'background': '#fff'
            }
          },
          // a sub-list
          'ul': {
            'margin': '0',
            'padding': '0',
            'li': {
              'text-align': 'left',
              'list-style': 'none',
              'margin': '0',
              'height': '52px',
              'padding': '8px 0 8px 20px',
              'color': '#aaa',
              'background-color': 'transparent',
              'position': 'relative',
              '._boardThumb': {
                'display': 'inline-block',
                'height': '36px',
                'width': '36px',
                'background-size': 'cover',
                'border-radius': '3px',
                'box-shadow': '0 0 1px #eee inset',
                'vertical-align': 'top',
                '&._mungeThumb': {
                  'background-size': '80px'
                }
              },
              '._boardName': {
                'display': 'inline-block',
                'height': '36px',
                'line-height': '36px',
                'padding-left': '10px',
                'font-size': '16px',
                'font-weight': 'bold',
                'width': '250px',
                'color': '#444',
                'overflow': 'hidden',
                'white-space': 'pre',
                'text-overflow': 'ellipsis',
                '&._helpers_1': {
                  'width': '230px'
                },
                '&._helpers_2': {
                  'width': '210px'
                }
              },
              // lock and collaborator icons
              '._helpers': {
                'position': 'absolute',
                'top': '50%',
                'margin-top': '-8px',
                'height': '16px',
                'right': '20px',
                '._icon': {
                  'background': 'transparent url() 0 0 no-repeat',
                  'height': '12px',
                  'float': 'right',
                  'margin-left': '5px',
                  'background-size': 'contain',
                  '&._secret': {
                    'width': '13px',
                    'background-image': 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjE5cHgiIGhlaWdodD0iMjNweCIgdmlld0JveD0iMCAwIDE5IDIzIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGZpbGw9IiNBQUEiIGQ9Ik0zLDEwTDMsN0ExLDEgMCAwIDEgMTYsN0wxNiwxMEwxNywxMEEyLDIsMCAwIDEgMTksMTJMMTksMjNMMCwyM0wwLDEyQTIsMiAwIDAgMSAyLDEwWiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik02LDdBMSwxIDAgMCAxIDEzLDdMMTMsMTBMNiwxMFoiLz48L2c+PC9zdmc+)'
                  },
                  '&._collaborative': {
                    'width': '22px',
                    'background-image': 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjMycHgiIGhlaWdodD0iMjJweCIgdmlld0JveD0iMCAwIDMyIDIyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGZpbGw9IiNBQUEiPjxjaXJjbGUgY3g9IjkiIGN5PSI1IiByPSI1Ii8+PGNpcmNsZSBjeD0iMjMiIGN5PSI1IiByPSI1Ii8+PHBhdGggZD0iTTAsMjJMMCwxNkE1LDUsMCAwIDEgNSwxMUwxMywxMUE1LDUsMCAwIDEgMTgsMTZMMTgsMjJaIj48L3BhdGg+PHBhdGggZD0iTTE2LDExTDI3LDExQTUsNSwwIDAgMSAzMiwxNkwzMiwyMkwxOSwyMkwxOSwxNUE1LDUsMCAwIDAgMTYsMTFaIi8+PC9nPjwvc3ZnPg==)'
                  }
                }
              },
              // click collector over entire line item
              '._mask': {
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'bottom': '0',
                'right': '0',
                'height': '100%',
                'width': '100%',
                'cursor': 'pointer'
              },
              // show button on hover
              '&:hover': {
                'background': '#f0f0f0',
                '._boardName': {
                  'width': '170px'
                },
                '._button': {
                  'display': 'inline-block'
                }
              }
            }
          }
        },
        // board create create form opener
        '._createFormOpener': {
          'font-size': '16px',
          'padding-left': '0',
          'font-weight': 'normal',
          'text-indent': '65px',
          'display': 'block',
          'cursor': 'pointer',
          'color': '#555',
          'background': '#fff url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjM2cHgiIGhlaWdodD0iMzZweCIgdmlld0JveD0iMCAwIDcyIDcyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxjaXJjbGUgY3g9IjM2IiBjeT0iMzYiIHI9IjM2IiBmaWxsPSIjYmQwODFjIi8+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTMyLDMyTDMyLDIwQTEsMSwwIDAgMSA0MCwyMEw0MCwzMkw1MywzMkExLDEsMCAwIDEgNTIsNDBMNDAsNDBMNDAsNTJBMSwxLDAgMCAxIDMyLDUyTDMyLDQwTDIwLDQwQTEsMSwwIDAgMSAyMCwzMloiLz48L2c+PC9zdmc+Cg==) 20px 50% no-repeat',
          // opener is in the pin create form footer
          '&._ftCreateFormOpener': {
            'position': 'absolute',
            'bottom': '0',
            'left': '0',
            'width': '330px',
            'height': '75px',
            'padding': '0',
            'border-top': '1px solid #eee',
            'line-height': '75px',
            'font-weight': 'bold'
          },
          // opener is inline after search results
          '&._inCreateFormOpener': {
            'display': 'none',
            'height': '60px',
            'line-height': '60px',
            // the board name shows in the inline version
            '._inCreateFormOpenerText': {
              'font-weight': 'bold'
            }
          }
        },
        // the board create container
        '._createContainer': {
          'position': 'absolute',
          'top': '0',
          'left': '330px',
          'width': '330px',
          'height': '540px',
          'z-index': '10',
          'background': '#fff',
          'transition': '.25s all',
          // when brought onstage, the board create form will slide across from right to left
          '&._onstage': {
            'left': '0'
          },
          'label': {
            'display': 'block',
            'color': '#c2c2c2',
            'font-size': '11px',
            'padding': '10px 0 10px 20px',
            'font-weight': 'normal',
            'text-transform': 'uppercase',
            'border-top': '1px solid #eee',
          },
          // is it a secret board?
          '._lblSecret': {
            'width': '100%',
            'cursor': 'pointer',
            'input[type=checkbox]': {
              'display': 'block',
              'height': '1px',
              'margin': '7px 0 0 0',
              'padding': '0',
              'opacity': '.01',
              '&:checked': {
                '~ ._toggle': {
                  'background': '#bd081c',
                  '._knob': {
                    'float':'right'
                  },
                  '._optYes': {
                    'display': 'block'
                  },
                  '._optNo': {
                    'display': 'none'
                  }
                }
              }
            },
            // yes/no toggle with sliding knob
            '._toggle': {
              'display': 'inline-block',
              'position': 'relative',
              'background': '#f8f8f8',
              'border-radius': '16px',
              'border': '1px solid #eee',
              'height': '32px',
              '._knob': {
                'display': 'inline-block',
                'margin': '0',
                'padding': '0',
                'background': '#fff',
                'border-radius': '16px',
                'box-shadow': '0 0 1px #eee',
                'width': '30px',
                'height': '30px'
              },
              '._optNo, ._optYes': {
                'display': 'inline-block',
                'line-height': '30px',
                'padding': '0 10px',
                'font-weight': 'bold'
              },
              '._optNo': {
                'color': '#000',
                'float': 'right'
              },
              '._optYes': {
                'color': '#fff',
                'float': 'left',
                'display': 'none'
              }
            }
          },
          // board create footer with cancel/create buttons
          '._ftCreate': {
            'position': 'absolute',
            'bottom': '0',
            'left': '0',
            'width': '330px',
            'height': '75px',
            'line-height': '75px',
            'border-top': '1px solid #eee',
            '_btnCreateGo': {
              'float': 'right',
              'margin': '20px'
            },
            '_btnCreateCancel': {
              'margin': '20px'
            }
          }
        },
        // various button stylings
        '._button': {
          'height': '36px',
          'line-height': '36px',
          'border-radius': '3px',
          'display': 'inline-block',
          'font-size': '16px',
          'font-weight': 'bold',
          'text-align': 'center',
          'padding': '0 10px',
          'cursor': 'pointer',
          '&._save': {
            'vertical-align': 'top',
            'color': '#fff',
            'background': '#bd081c url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjAgMCAxMCAyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNMSwwTDksMEEzLDMsMCAwIDEgNy41LDJMNy41LDdBNCw1LDAgMCAxIDEwLDExTDYsMTFMNiwxNUE2LDksMCAwIDEgNSwyMEE2LDksMCAwIDEgNCwxNUw0LDExTDAsMTFBNCw1LDAgMCAxIDIuNSw3TDIuNSwyQTMsMywwIDAgMSAxLDBaIj48L3BhdGg+PC9nPjwvc3ZnPg==) 10px 9px no-repeat',
            'padding': '0 10px 0 28px',
            'margin-left': '20px',
            'position': 'absolute',
            'right': '10px',
            'top': '7px',
            'display': 'none',
            '&._active': {
              'color': 'transparent',
              'background': '#bd081c url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIA0KCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgDQoJeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIA0KCWhlaWdodD0iMzIiDQoJd2lkdGg9IjMyIg0KCXZpZXdCb3g9IjAgMCAxNiAxNiIgDQoJeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQoJPHBhdGggZmlsbD0iI2ZmZiIgZD0iDQogIAlNIDgsIDANCiAgICBBIC41LCAuNSwgMCwgMCwgMCwgOCwgMQ0KICAgIEEgNiwgNywgMCwgMCwgMSwgMTQsIDgNCiAgICBBIDYsIDYsIDAsIDAsIDEsIDgsIDE0DQogICAgQSA1LCA2LCAwLCAwLCAxLCAzLCA4DQogICAgQSAxLCAxLCAwLCAwLCAwLCAwLCA4DQogICAgQSA4LCA4LCAwLCAwLCAwLCA4LCAxNg0KICAgIEEgOCwgOCwgMCwgMCwgMCwgMTYsIDgNCiAgICBBIDgsIDgsIDAsIDAsIDAsIDgsIDANCiAgICBaIiA+DQogICAgPGFuaW1hdGVUcmFuc2Zvcm0NCgkJCWF0dHJpYnV0ZVR5cGU9InhtbCINCgkJCWF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSINCgkJCXR5cGU9InJvdGF0ZSINCgkJCWZyb209IjAgOCA4Ig0KCQkJdG89IjM2MCA4IDgiDQoJCQlkdXI9Ii42cyINCgkJCXJlcGVhdENvdW50PSJpbmRlZmluaXRlIg0KCQkvPg0KCTwvcGF0aD4NCjwvc3ZnPg0K) 50% 50% no-repeat',
              'background-size': '20px 20px'
            },
            '&._checked': {
              'color': 'transparent',
              'background': '#bd081c url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxN3B4IiBoZWlnaHQ9IjEzcHgiIHZpZXdCb3g9IjAgMCAxNyAxMyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMyw0TDcsOEwxNCwxQTEsMSAwIDAgMSAxNiwzTDcsMTJMMSw2QTEsMSAwIDAgMSAzLDRaIi8+PC9nPjwvc3ZnPg==) 50% 50% no-repeat'
            }
          },
          '&._create': {
            'position': 'absolute',
            'top': '20px',
            'right': '20px',
            'color': '#fff',
            'background-color': '#bd081c',
            '&._disabled': {
              'color': '#eee',
              'background-color': '#aaa',
              'cursor': 'default'
            }
          },
          '&._cancel': {
            'position': 'absolute',
            'top': '20px',
            'left': '20px',
            'color': '#555',
            'background-color': '#f6f6f6',
            'border': '1px solid #eaeaea'
          }
        }
      }
    }
  }
}));
