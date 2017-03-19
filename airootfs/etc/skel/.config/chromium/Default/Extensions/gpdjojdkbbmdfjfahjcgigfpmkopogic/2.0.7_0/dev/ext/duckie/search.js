// ship visual search for Chrome

(function (w, d, a) {
  var $ = w[a.k] = {
    'w': w,
    'd': d,
    'a': a,
    'b': chrome || firefox || browser,
    'v': {
      'debug': false,
      'css': '',
      'select': {},
      'lang': 'en'
    },
    's': {},
    'f': (function () {
      return {
        debug: function (obj) {
          if (obj && $.v.debug) {
            console.log(obj);
          }
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

        // open the inline create form for a pin ID
        create: function (o) {
          // we're always going to pin inline
          $.b.runtime.sendMessage({
            'to': 'background',
            'act': 'openCreateForm',
            'data': {
              'id': o.id,
              'media': o.media,
              'description': o.description
            }
          }, function(){});
          $.f.close();
        },

        close: function () {
          $.d.b = $.v.orgTop;
          $.b.runtime.sendMessage(
            {'to': 'background', 'act': 'closeSearch'}, function() {}
          );
        },

        // scale one rectangle to always fit inside another
        scale: function (o) {

          // expects: { 'expand': BOOL|UNDEFINED, 'a': { 'h': NUMBER, 'w': NUMBER }, 'b': { 'h': NUMBER, 'w': NUMBER } }
          // returns: { 'n': : { 'h': NUMBER, 'w': NUMBER }, expand': BOOL|UNDEFINED, 'a': { 'h': NUMBER, 'w': NUMBER }, 'b': { 'h': NUMBER, 'w': NUMBER } }

          // default: return originals
          o.n = {
            'h': o.a.h,
            'w': o.a.w
          };

          // get aspect ratios for image and container
          var ratio = {
            'a': o.n.h / o.n.w,
            'b': o.b.h / o.b.w
          }

          // fit width; scale height
          var fitWidth = function () {
            o.n.w = o.b.w;
            o.n.h = o.n.w * ratio.a;
          };

          // fit height; scale width
          var fitHeight = function () {
            o.n.h = o.b.h;
            o.n.w = o.n.h / ratio.a;
          };

          // decide if we need to fit to width or height
          var getFit = function () {
            if (ratio.a < ratio.b) {
              // image is proportionally wider than container
              fitWidth();
            } else {
              // image is proportionally taller than container
              fitHeight();
            }
          }

          // trivial condition: we are not expanding, and our image fits inside the container
          if (!o.expand) {
            if (o.n.h <= o.b.h && o.n.w <= o.b.w) {
              return o;
            }
          }

          // image size is changing
          if (ratio.a === 1) {
            // scale the square image to fit the smaller side of the rectangular container
            o.n.w = o.n.h = Math.min(o.b.h, o.b.w);
          } else {
            // look at the shape of our container
            if (ratio.b === 1) {
              // square container
              if (ratio.a > 1) {
                // portrait image in square container; fit to height
                fitHeight();
              } else {
                // landscape image in square container; fit to width
                fitWidth();
              }
            } else {
              // rectangular container
              if (ratio.a > 1) {
                // portrait image
                if (ratio.b < 1) {
                  // portrait image in lansdcape container; fit to height
                  fitHeight();
                } else {
                  // portrait image in portrait container; decide if we need to fit to height or width
                  getFit();
                }
              } else {
                // landscape image
                if (ratio.b > 1) {
                  // landscape image in portrait container; fit to width
                  fitWidth();
                } else {
                  // landscape image in landscape container; decide if we need to fit to height or width
                  getFit();
                }
              }
            }
          }
          return o;
        },
        edit: function () {

          // where are we over the canvas?
          var getPos = function (e) {
            var rect = $.s.canvas.getBoundingClientRect();
            return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            }
          };

          // draw our select box and optionally our white corner indicator
          var select = function (hazCorners) {
            var lw, ll, ls, minX, minY, maxX, maxY
            // corner width, length, and style
            lw = 6;
            ll = 25;
            ls = '#ffe';

            // clear any existing selector
            ctx.clearRect(0, 0, $.v.scaledImg.n.w, $.v.scaledImg.n.h);

            // note: throughout this function we use lineTo to extend the path
            // but we never actually stroke it so the line itself remains invisible

            // outer shape: draw a line around the entire canvas
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo($.v.scaledImg.n.w, 0);
            ctx.lineTo($.v.scaledImg.n.w, $.v.scaledImg.n.h);
            ctx.lineTo(0, $.v.scaledImg.n.h);
            ctx.closePath();

            // get select box corners
            minX = ~~Math.min(box.x1, box.x2);
            minY = ~~Math.min(box.y1, box.y2);
            maxX = ~~Math.max(box.x1, box.x2);
            maxY = ~~Math.max(box.y1, box.y2);

            // store corners to run search later
            $.v.select.x = minX;
            $.v.select.y = minY;
            $.v.select.w = maxX - minX;
            $.v.select.h = maxY - minY;

            // make the inner shape: only the selected area
            ctx.moveTo(minX, minY);
            ctx.lineTo(maxX, minY);
            ctx.lineTo(maxX, maxY);
            ctx.lineTo(minX, maxY);
            ctx.closePath();

            // fill the area outside the selected box with 50% black
            ctx.fillStyle = "rgba(0,0,0,.50)";
            ctx.mozFillRule = 'evenodd'; // elderly Firefox
            ctx.fill('evenodd'); // modern browsers

            // draw the selector corners if needed
            // here we actually do stroke the line, because it's visible
            if (hazCorners) {
              ctx.strokeStyle = ls;
              ctx.lineWidth = lw;

              ctx.beginPath();
              ctx.moveTo(minX + lw / 2, minY + ll);
              ctx.lineTo(minX + lw / 2, minY + lw / 2);
              ctx.lineTo(minX + ll, minY + lw / 2);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(maxX - lw / 2, minY + ll);
              ctx.lineTo(maxX - lw / 2, minY + lw / 2);
              ctx.lineTo(maxX - ll, minY + lw / 2);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(maxX - lw / 2, maxY - ll);
              ctx.lineTo(maxX - lw / 2, maxY - lw / 2);
              ctx.lineTo(maxX - ll, maxY - lw / 2);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(minX + lw / 2, maxY - ll);
              ctx.lineTo(minX  + lw / 2, maxY - lw / 2);
              ctx.lineTo(minX + ll, maxY - lw / 2);
              ctx.stroke();
            }
          };

          // start selecting
          var mouseDown = function (e) {
            var p = getPos(e);
            box.x1 = box.x2 = p.x;
            box.y1 = box.y2 = p.y;
            selecting = true;
          };

          // if we're selecting, redraw the selector box
          var mouseMove = function (e) {
            if (selecting) {
              var p = getPos(e);
              box.x2 = p.x;
              box.y2 = p.y;
              select();
            }
          };

          // if we're selecting, run search on mouse up
          var mouseUp = function () {
            if (selecting) {
              select(true);
              $.f.act.query();
              selecting = false;
            }
          };

          // if we're selecting, keep the selector inside and run search on mouse out
          var mouseOut = function (e) {
            if (selecting) {
              var p = getPos(e);
              if (p.x < 0) {
                box.x2 = 0;
              }
              if (p.x > $.v.scaledImg.n.w) {
                box.x2 = $.v.scaledImg.n.w;
              }
              if (p.y < 0) {
                box.y2 = 0;
              }
              if (p.y > $.v.scaledImg.n.h) {
                box.y2 = $.v.scaledImg.n.h;
              }
              select(true);
              $.f.act.query();
              selecting = false;
            }
          };

          // "attract mode" animates a selection box on load and runs search, so we know what's going on
          var accio = function () {

            // on start this selects the entire canvas
            box = {
              'x1': currentAccio,
              'y1': currentAccio,
              'x2': $.v.scaledImg.n.w - currentAccio,
              'y2': $.v.scaledImg.n.h - currentAccio
            }
            select(true);

            // gradually shrink the selected area and decrease the delay
            currentAccio = currentAccio + 1;
            if (currentAccio < maxAccio) {
              accioDelay = accioDelay - 2;
              if (!accioDelay) {
                accioDelay = 1;
              }
              // run again if needed
              $.w.setTimeout(accio, accioDelay);
            } else {
              // done animating; let's run that query
              $.f.act.query();
            }
          };

          var ctx = $.s.canvas.getContext('2d');
          var selecting = false;

          // selector box; start at 100%
          var box = {};

          // when the search preview first comes up, let's animate the selector box just a little bit
          var currentAccio = 1;
          var maxAccio = Math.min($.v.scaledImg.n.h, $.v.scaledImg.n.w) / 20;
          var accioDelay = maxAccio + 10;
          // start the animated selector box
          $.w.setTimeout(function () {
            accio();
          }, 10);

          // start listening for events
          $.f.listen($.s.canvas, 'mousedown', mouseDown);
          $.f.listen($.s.canvas, 'mousemove', mouseMove);
          $.f.listen($.s.canvas, 'mouseup', mouseUp);
          $.f.listen($.s.canvas, 'mouseout', mouseOut);
        },


        // image has loaded; let's show it
        load: function (img) {
          $.s.grid.innerHTML = '';
          $.s.search.innerHTML = ''
          $.s.bd.style.height = $.w.innerHeight - 90 + 'px';

          $.s.search.style.height = $.s.bd.offsetHeight + 'px';

          $.v.scaledImg = $.f.scale({
            'expand': $.a.expand,
            'a': {
              'h': img.naturalHeight,
              'w': img.naturalWidth
            },
            'b': {
              'h': $.s.bd.offsetHeight,
              'w': $.s.bd.offsetWidth / 2 - 20
            }
          })

          var orgCanvas = $.d.createElement('CANVAS');
          orgCanvas.height = img.naturalHeight;
          orgCanvas.width = img.naturalWidth;
          var orgContext = orgCanvas.getContext('2d');
          orgContext.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
          $.v.orgData = orgCanvas.toDataURL();

          $.s.search.style.width = $.v.scaledImg.n.w + 'px';

          // get this into CSS
          var backdrop = $.f.make({'DIV':{
            'class': $.a.k + '_backdrop'
          }});

          backdrop.style.backgroundImage = 'url(' + img.src + ')';
          backdrop.style.height = $.v.scaledImg.n.h +'px';
          backdrop.style.width = $.v.scaledImg.n.w + 'px';
          backdrop.style.left = $.s.search.innerWidth / 2 - $.v.scaledImg.n.w / 2 + 'px';

          $.s.search.appendChild(backdrop);

          $.s.canvas = $.f.make({'CANVAS': {
            'height': $.v.scaledImg.n.h + '',
            'width': $.v.scaledImg.n.w + ''
          }});
          backdrop.appendChild($.s.canvas);
          // start the edit
          $.f.edit();
        },


        act: {
          checkLogin: function (r) {
            $.f.debug(r);
          },

          query: function () {

            // require the selection to be at least as big as the selector box line thickness
            if ($.v.select.w > $.a.minSearchSize && $.v.select.h > $.a.minSearchSize) {
              var scaledX = $.v.select.x / $.v.scaledImg.n.w;
              var scaledY = $.v.select.y / $.v.scaledImg.n.h;
              var scaledW = $.v.select.w / $.v.scaledImg.n.w;
              var scaledH = $.v.select.h / $.v.scaledImg.n.h;
              $.v.search_identifier = null;
              $.v.query = {
                'to': 'background',
                'act': 'runSearch',
                'data': {
                  'x': scaledX,
                  'y': scaledY,
                  'w': scaledW,
                  'h': scaledH
                }
              };
              if ($.v.search_url) {
                $.v.query.data.u = $.v.search_url;
              } else {
                $.v.query.data.img = $.v.orgData;
              }
              $.f.sendMessage($.v.query);
            }
          },

          preview: function (r) {
            $.w.clearTimeout($.v.closeAfter);
            // load the image
            var preview = new Image();
            preview.onload = function () {

              $.f.load(this);

              var left = $.v.scaledImg.n.w + 40;
              $.s.grid.style.left = left + 'px';
              $.v.columnCount = ~~(($.w.innerWidth - left)  / $.a.thumbWidth) ;
              if (!$.v.columnCount) {
                $.v.columnCount = 1;
              }
              $.s.grid.style.width = $.v.columnCount * $.a.thumbWidth + 'px';
              $.s.bd.style.width = $.v.scaledImg.n.w + 40 + ($.v.columnCount * $.a.thumbWidth) + 'px';
              for (var i = 0; i < $.v.columnCount; i = i + 1) {
                var col = $.d.createElement('DIV');
                col.className =  $.a.k + '_col';
                col.id = 'c_' + i;
                $.s.grid.appendChild(col);
              }
              $.f.debug('grid rendered');
            };
            preview.src = r.data.src;
            if (preview.src.match(/^data/)) {
              $.v.imgSrc = 'data';
            } else {
              $.v.imgSrc = r.data.src;
            }
            $.v.via = r.data.via;
            $.f.log({'event': 'open', 'xm': r.data.xm, 'img': $.v.imgSrc});
          },
          render: function (r) {
            var i, p, thumb, mask, ft, desc, cc, annotationsFound, note;
            var noteColor = $.a.noteColor;
            cc = 0;
            $.d.b.scrollTop = 0;
            $.f.debug('rendering Search results');
            $.f.debug(r);
            for (var i = 0; i < $.v.columnCount; i = i + 1) {
              $.d.getElementById('c_' + i).innerHTML = '';
            }

            if (r.data.data && r.data.data.length) {

              $.v.search_identifier = r.data.search_identifier;
              if (r.data.url) {
                $.f.debug('Search URL: ' + r.data.url);
                $.v.search_url = r.data.url;
              }
              var logMe = {'event': 'render', 'img': $.v.imgSrc};

              $.f.log(logMe);

              for (i = 0; i < r.data.data.length; i = i + 1) {
                if (i === $.v.columnCount - 1 && !annotationsFound && r.data.annotations && r.data.annotations.length) {
                  thumb = $.f.make({'DIV':{'className': $.a.k + '_thumb ' + $.a.k + '_hazNote' }});
                  for (var i = 0; i < r.data.annotations.length; i = i + 1) {
                    var note = $.f.make({'SPAN':{
                      'className': $.a.k + '_annotation',
                      'innerHTML': r.data.annotations[i],
                      'annotation': r.data.annotations[i]
                    }});
                    note.style.backgroundColor = '#' + noteColor[i];
                    thumb.appendChild(note);
                  }
                  annotationsFound = true;
                } else {
                  p = r.data.data[i];
                  thumb = $.f.make({'DIV':{'className': $.a.k + '_thumb'}});
                  img = $.f.make({'IMG':{'src': p.image_medium_url}});
                  thumb.appendChild(img);

                  ft = $.f.make({'DIV': {
                    'className': $.a.k + '_ft'
                  }});
                  if (p.domain) {
                    var ftDomain = $.f.make({'SPAN': {
                      'className': $.a.k + '_domain',
                      'innerHTML': p.domain
                    }});
                    ft.appendChild(ftDomain);
                  }

                  var description = '';
                  if (p.description && p.description.trim()) {
                    description = p.description.trim();
                  }
                  if (p.title && p.title.trim()) {
                    description = p.title.trim();
                  }

                  if (description) {
                    var ftDesc = $.f.make({'SPAN': {
                      'className': $.a.k + '_description',
                      'innerHTML': description
                    }});
                    ft.appendChild(ftDesc);
                  }

                  var ftDeets = $.f.make({'SPAN': {
                    'className': $.a.k + '_deets'
                  }});
                  var avatar = $.f.make({'SPAN': {
                    'className': $.a.k + '_avatar'
                  }});
                  avatar.style.backgroundImage = 'url(' + p.pinner.image_medium_url + ')';
                  ftDeets.appendChild(avatar);
                  var pinner = $.f.make({'SPAN': {
                    'className': $.a.k + '_pinner',
                    'innerHTML': p.pinner.full_name
                  }});
                  ftDeets.appendChild(pinner);
                  var board = $.f.make({'SPAN': {
                    'className': $.a.k + '_board',
                    'innerHTML': p.board.name
                  }});
                  ftDeets.appendChild(board);
                  ft.appendChild(ftDeets);
                  thumb.appendChild(ft);
                  mask = $.f.make({'DIV':{'className': $.a.k + '_mask'}});
                  $.f.set(mask, 'id', p.id);
                  $.f.set(mask, 'img', p.image_large_url);
                  thumb.appendChild(mask);
                  var saveButton = thumb.appendChild($.f.make({'SPAN': {
                    'className': $.a.k + '_saveButton',
                    'innerHTML': a.msg[$.v.lang].save
                  }}));
                  $.f.set(saveButton, 'id', p.id);
                  $.f.set(saveButton, 'media', p.image_medium_url);
                  $.f.set(saveButton, 'description', p.description || '');
                  thumb.appendChild(saveButton);

                  var searchButton = thumb.appendChild($.f.make({'SPAN': {
                    'className': $.a.k + '_searchButton'
                  }}));
                  $.f.set(searchButton, 'media', p.image_large_url);
                  thumb.appendChild(searchButton);

                }

                // add this thumb to the right column
                $.d.getElementById('c_' + cc).appendChild(thumb);

                // next time, use the next column
                cc = (cc + 1) % $.v.columnCount;
              }
            } else {
              // show a got-nothing/try again message
              thumb = $.f.make({'DIV':{'className': $.a.k + '_thumb ' + $.a.k + '_hazNote' }});

              var gotNothing = $.f.make({'SPAN':{
                'className': $.a.k + '_annotation',
                'innerHTML': $.a.msg[$.v.lang].gotNothing,
                'annotation': ''
              }});
              gotNothing.style.backgroundColor = '#000';

              thumb.appendChild(gotNothing);
              var tryAgain = $.f.make({'SPAN':{
                'className': $.a.k + '_annotation',
                'innerHTML': $.a.msg[$.v.lang].tryAgain,
                'annotation': ''
              }});
              tryAgain.style.backgroundColor = '#' + noteColor[0];

              thumb.appendChild(tryAgain);
              $.d.getElementById('c_' + cc).appendChild(thumb);

              // log the error
              $.f.log({'event': 'error', 'request_id': r.data.data.request_id});
            }
          }
        },
        // send a message
        sendMessage: function (obj) {
          $.f.debug('Sending message to ' + obj.to + ' for action ' + obj.act);
          $.b.runtime.sendMessage(obj, function() {});
        },
        // send logging string to background
        log: function (o) {
          var i, str = '';
          if (!o) {
            o = {};
          }
          if ($.v.search_identifier) {
            o.sid = $.v.search_identifier;
          }
          if ($.v.via) {
            o.via = $.v.via;
          }
          o.overlay = 'search';
          // this is wrong; we should send the object and have the background build the string
          for (i in o) {
            if (typeof o[i] !== 'undefined') {
              str = str + '&' + i + '=' + encodeURIComponent(o[i]);
            }
          }
          $.f.debug('logging');
          $.f.debug(JSON.stringify(o));
          $.f.sendMessage({'to': 'background', 'act': 'logAction', 'data': str});
        },
        // a click!
        click: function (v) {
          v = v || $.w.event;

          var el, url;
          el = $.f.getEl(v);

          // if we click the Save button, open the pin form
          if (el.className === $.a.k + '_saveButton') {
            // a repin from one of the pins we showed on the grid
            $.f.log({'event': 'click', 'save': $.f.get(el, 'id')});
            // pop the form
            $.f.create({
              'id': $.f.get(el, 'id'),
              'media': $.f.get(el, 'media'),
              'description': $.f.get(el, 'description')
            });
          }

          // if we click the Search button, restart search with new image URL
          if (el.className === $.a.k + '_searchButton') {
            $.v.search_url = null;
            var media = $.f.get(el, 'media');
            $.f.log({'event': 'click', 'search': media});
            $.f.act.preview({'data': {'src': media}});
            $.f.debug('Searching new media ' + media);
          }

          // if we click a thumbnail, open the repin form
          if (el.className === $.a.k + '_mask') {
            $.f.log({'event': 'click', 'open': $.f.get(el, 'id')});
            $.w.open('https://www.pinterest.com/pin/' + $.f.get(el, 'id'), '_blank');
          }

          // if we click an annotation, add filter
          if (el.className === $.a.k + '_annotation') {
            var o = $.v.query;
            o.data.f = $.f.get(el, 'annotation');
            $.f.log({'event': 'click', 'filter': o.data.f});
            $.f.sendMessage(o);
          }

          // if we click the X, close the grid
          if (el === $.s.x ) {
            $.f.close();
          }
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

          $.v.orgTop = $.d.b.scrollTop;
          $.d.b.scrollTop = 0;

          $.f.presentation($.a.styles);

          $.f.buildOne($.a.structure, $.d.b);

          $.f.debug('search open');

          $.d.title = $.a.msg[$.v.lang].headerMessage;
          $.s.hdMsg.innerHTML = $.a.msg[$.v.lang].headerMessage;

          // if an incoming message from script is for us and triggers a valid function, run it
          $.b.runtime.onMessage.addListener(function(r) {
            $.f.debug('message received');
            if (r.to && r.to === $.a.me) {
              if (r.act && typeof $.f.act[r.act] === 'function') {
                $.f.act[r.act](r);
              }
            }
          });

          $.v.closeAfter = $.w.setTimeout(function () {
            $.w.setTimeout(function () {
              $.f.close();
            }, 1000);
          }, $.a.closeAfter);

          $.d.addEventListener('contextmenu', event => event.preventDefault());
          $.f.listen($.d.b, 'click', $.f.click);
          $.f.listen($.d, 'keydown', $.f.keydown);
          $.f.listen($.d, 'mousedown', $.f.down);

        }
      };
    }())
  };
  $.b.storage.local.get('lang', function(r) {
    if (r.lang) {
      $.v.lang = r.lang;
    }
    $.f.init();
  });
}(window, document, {
  'cooldown': '1000',
  'expand': false,
  'k': 'SEARCH_' + new Date().getTime(),
  'noteColor': [
    'BD081C',
    'F13535',
    'E2780D',
    '0FA573',
    '0A6955',
    '364A4C',
    '083B6A',
    '09569D',
    '0084FF',
    'B469EB',
    '8546A5',
    '5B2677',
    '6E0F3C'
  ],
  'minSearchSize': 20,
  'thumbWidth': 220,
  'closeAfter': 10000,
  'me': 'search',
  'msg': {
    "en": {
      "gotNothing": "Sorry, nothing found",
      "tryAgain": "Try again",
      "headerMessage": "More like this",
      "save": "Save"
    },
    "cs": {
      "gotNothing": "Bohu&#x17E;el jsme nic nenalezli",
      "tryAgain": "Zkuste to znovu",
      "headerMessage": "V&#xED;ce podobn&#xFD;ch",
      "save": "Ulo&#382;it"
    },
    "da": {
      "gotNothing": "Vi fandt ikke noget",
      "tryAgain": "Pr&#xF8;v igen",
      "headerMessage": "Mere i samme stil",
      "save": "Gem"
    },
    "de": {
      "gotNothing": "Wir haben leider nichts gefunden",
      "tryAgain": "Noch einmal versuchen",
      "headerMessage": "Mehr davon",
      "save": "Merken"
    },
    "es": {
      "gotNothing": "Lo sentimos, no hemos encontrado nada",
      "tryAgain": "Int&#xE9;ntalo de nuevo.",
      "headerMessage": "M&#xE1;s como este",
      "save": "Guardar"
    },
    "es-mx": {
      "gotNothing": "Lo sentimos, no hemos encontrado nada",
      "tryAgain": "Int&#xE9;ntalo de nuevo.",
      "headerMessage": "M&#xE1;s como este",
      "save": "Guardar"
    },
    "el": {
      "gotNothing": "Sorry, nothing found",
      "tryAgain": "&#x394;&#x3BF;&#x3BA;&#x3B9;&#x3BC;&#x3AC;&#x3C3;&#x3C4;&#x3B5; &#x3BE;&#x3B1;&#x3BD;&#x3AC;",
      "headerMessage": "&#x3A0;&#x3B1;&#x3C1;&#x3CC;&#x3BC;&#x3BF;&#x3B9;&#x3B1;",
      "save": "&Kappa;&rho;&#940;&tau;&alpha; &tau;&omicron;"
    },
    "fi": {
      "gotNothing": "Lis&#xE4;tt&#xE4;v&#xE4;&#xE4; ei l&#xF6;ydy",
      "tryAgain": "Yrit&#xE4; uudelleen",
      "headerMessage": "Enemm&#xE4;n t&#xE4;llaista",
      "save": "Tallenna"
    },
    "fr": {
      "gotNothing": "D&#xE9;sol&#xE9;, votre recherche n&#x27;a pas abouti",
      "tryAgain": "Veuillez r&#xE9;essayer",
      "headerMessage": "Plus de ce genre",
      "save": "Enregistrer"
    },
    "id": {
      "gotNothing": "Maaf, tidak ada yang ditemukan",
      "tryAgain": "Coba Lagi",
      "headerMessage": "Lainnya Seperti Ini",
      "save": "Simpan"
    },
    "it": {
      "gotNothing": "Spiacenti non abbiamo trovato nulla",
      "tryAgain": "Riprova",
      "headerMessage": "Altri come questo",
      "save": "Salva"
    },
    "hi": {
      "gotNothing": "&#x915;&#x94D;&#x937;&#x92E;&#x93E; &#x915;&#x930;&#x947;&#x902;, &#x915;&#x941;&#x91B; &#x92D;&#x940; &#x928;&#x939;&#x940;&#x902; &#x92E;&#x93F;&#x932;&#x93E;",
      "tryAgain": "&#x92B;&#x93F;&#x930; &#x938;&#x947; &#x915;&#x94B;&#x936;&#x93F;&#x936; &#x915;&#x930;&#x947;&#x902;",
      "headerMessage": "&#x907;&#x938; &#x924;&#x930;&#x939; &#x915;&#x947; &#x914;&#x930;",
      "save": "&#2360;&#2375;&#2357; &#2325;&#2352;&#2375;&#2306;"
    },
    "hu": {
      "gotNothing": "Sajn&#xE1;ljuk, semmit sem tal&#xE1;ltunk",
      "tryAgain": "Pr&#xF3;b&#xE1;ld &#xFA;jra",
      "headerMessage": "T&#xF6;bb hasonl&#xF3;",
      "save": "Ment&eacute;s"
    },
    "ja": {
      "gotNothing": "&#x30D4;&#x30F3;&#x3067;&#x304D;&#x308B;&#x30A2;&#x30A4;&#x30C6;&#x30E0;&#x304C;&#x898B;&#x3064;&#x304B;&#x308A;&#x307E;&#x305B;&#x3093;",
      "tryAgain": "&#x518D;&#x5EA6;&#x304A;&#x8A66;&#x3057;&#x304F;&#x3060;&#x3055;&#x3044;",
      "headerMessage": "&#x4F3C;&#x3066;&#x3044;&#x308B;&#x30D4;&#x30F3;",
      "save": "&#20445;&#23384;"
    },
    "ko": {
      "gotNothing": "&#xC8C4;&#xC1A1;&#xD569;&#xB2C8;&#xB2E4;. &#xAC80;&#xC0C9; &#xACB0;&#xACFC;&#xAC00; &#xC5C6;&#xC2B5;&#xB2C8;&#xB2E4;.",
      "tryAgain": "&#xB2E4;&#xC2DC; &#xC2DC;&#xB3C4;&#xD558;&#xC138;&#xC694;.",
      "headerMessage": "&#xB2E4;&#xC74C;&#xACFC; &#xBE44;&#xC2B7;&#xD55C; &#xD540; &#xB354; &#xBCF4;&#xAE30;",
      "save": "&#51200;&#51109;"
    },
    "ms": {
      "gotNothing": "Maaf, tiada apa-apa ditemui",
      "tryAgain": "Cuba lagi",
      "headerMessage": "Lagi seperti ini",
      "save": "Simpan"
    },
    "nb": {
      "gotNothing": "Beklager, fant ingenting",
      "tryAgain": "Pr&#xF8;v igjen",
      "headerMessage": "Mer av dette",
      "save": "Lagre"
    },
    "nl": {
      "gotNothing": "Sorry, we hebben niets gevonden",
      "tryAgain": "Opnieuw proberen",
      "headerMessage": "Meer zoals dit",
      "save": "Bewaren"
    },
    "pl": {
      "gotNothing": "Przepraszamy, niczego nie znaleziono",
      "tryAgain": "Spr&#xF3;buj ponownie",
      "headerMessage": "Wi&#x119;cej w tym stylu",
      "save": "Zapisz"
    },
    "pt": {
      "gotNothing": "Lamentamos, n&#xE3;o encontramos nada",
      "tryAgain": "Tenta novamente",
      "headerMessage": "Mais deste g&#xE9;nero",
      "save": "Guardar"
    },
    "pt-br": {
      "gotNothing": "Nada foi encontrado",
      "tryAgain": "Tentar novamente",
      "headerMessage": "Mais como este",
      "save": "Salvar"
    },
    "ro": {
      "gotNothing": "Ne pare r&#x103;u, nu am g&#x103;sit nimic",
      "tryAgain": "&#xCE;ncearc&#x103; din nou",
      "headerMessage": "Mai multe ca acesta",
      "save": "Salveaz&#259;"
    },
    "ru": {
      "gotNothing": "&#x41A; &#x441;&#x43E;&#x436;&#x430;&#x43B;&#x435;&#x43D;&#x438;&#x44E;, &#x43D;&#x438;&#x447;&#x435;&#x433;&#x43E; &#x43D;&#x435; &#x43D;&#x430;&#x439;&#x434;&#x435;&#x43D;&#x43E;.",
      "tryAgain": "&#x41F;&#x43E;&#x432;&#x442;&#x43E;&#x440;&#x438;&#x442;&#x435; &#x43F;&#x43E;&#x43F;&#x44B;&#x442;&#x43A;&#x443;",
      "headerMessage": "&#x41F;&#x43E;&#x43A;&#x430;&#x437;&#x430;&#x442;&#x44C; &#x43F;&#x43E;&#x445;&#x43E;&#x436;&#x438;&#x435;",
      "save": "&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;"
    },
    "sk": {
      "gotNothing": "Prep&#xE1;&#x10D;te, ni&#x10D; sa nena&#x161;lo",
      "tryAgain": "Sk&#xFA;ste to znova",
      "headerMessage": "Viac podobneho",
      "save": "Ulo&#382;i&#357;"
    },
    "sv": {
      "gotNothing": "Vi hittade tyv&#xE4;rr ingenting",
      "tryAgain": "F&#xF6;rs&#xF6;k igen",
      "headerMessage": "Fler som denna",
      "save": "Spara"
    },
    "th": {
      "gotNothing": "&#xE02;&#xE2D;&#xE2D;&#xE20;&#xE31;&#xE22; &#xE44;&#xE21;&#xE48;&#xE1E;&#xE1A;&#xE2D;&#xE30;&#xE44;&#xE23;&#xE40;&#xE25;&#xE22;",
      "tryAgain": "&#xE25;&#xE2D;&#xE07;&#xE2D;&#xE35;&#xE01;&#xE04;&#xE23;&#xE31;&#xE49;&#xE07;",
      "headerMessage": "&#xE14;&#xE39;&#xE2D;&#xE22;&#xE48;&#xE32;&#xE07;&#xE2D;&#xE37;&#xE48;&#xE19;&#xE17;&#xE35;&#xE48;&#xE04;&#xE25;&#xE49;&#xE32;&#xE22;&#xE01;&#xE31;&#xE19;",
      "save": "&#3610;&#3633;&#3609;&#3607;&#3638;&#3585;"
    },
    "tl": {
      "gotNothing": "Pasensya na, walang nakita",
      "tryAgain": "Subukan muli",
      "headerMessage": "Marami Pang Katulad Nito",
      "save": "I-save"
    },
    "tr": {
      "gotNothing": "&#xDC;zg&#xFC;n&#xFC;z, bir &#x15F;ey bulunamad&#x131;",
      "tryAgain": "Tekrar Deneyin",
      "headerMessage": "Buna Benzer Daha Fazlas&#x131;",
      "save": "Kaydet"
    },
    "uk": {
      "gotNothing": "&#x41D;&#x430; &#x436;&#x430;&#x43B;&#x44C;, &#x43D;&#x430;&#x43C; &#x43D;&#x435; &#x432;&#x434;&#x430;&#x43B;&#x43E;&#x441;&#x44F; &#x43D;&#x456;&#x447;&#x43E;&#x433;&#x43E; &#x437;&#x43D;&#x430;&#x439;&#x442;&#x438;",
      "tryAgain": "&#x421;&#x43F;&#x440;&#x43E;&#x431;&#x443;&#x439;&#x442;&#x435; &#x449;&#x435;",
      "headerMessage": "&#x41F;&#x43E;&#x434;&#x456;&#x431;&#x43D;&#x435;",
      "save": "&#1047;&#1073;&#1077;&#1088;&#1077;&#1075;&#1090;&#1080;"
    },
    "vi": {
      "gotNothing": "Sorry, nothing found",
      "tryAgain": "H&#xE3;y th&#x1EED; l&#x1EA1;i",
      "headerMessage": "M&#x1EE5;c kh&#xE1;c gi&#x1ED1;ng th&#x1EBF; n&#xE0;y",
      "save": "L&#432;u"
    }
  },
  // our structure
  'structure': {
    'hd': {
      'hdMsg': {},
      'x': {}
    },
    'bd': {
      'search': {},
      'grid': {}
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
    '._bd': {
      'display': 'block',
      'position': 'relative',
      'margin': '0 auto',
      'text-align': 'left',
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
        'opacity': '0',
        'cursor': 'pointer'
      },
      '._search': {
        'position': 'fixed',
        'top': '85px',
        '._backdrop': {
          'background': 'transparent url() 0 0 no-repeat',
          'border-radius': '10px',
          'background-size': '100% 100%',
          'position': 'absolute',
          'top': '0',
          'canvas': {
            'position': 'absolute',
            'cursor': 'crosshair',
            'border-radius': '10px'
          },
          '&:hover ._saveButton': {
            'opacity': '1'
          }
        }
      },
      '._grid': {
        'text-align': 'left',
        'position': 'absolute',
        'margin-top': '75px',
        'top': '0',
        '._col': {
          'display': 'inline-block',
          'width': '220px',
          'vertical-align': 'top',
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
            '&._hazNote': {
              'margin-bottom': '8px',
              '&:hover': {
                'background': '#fff',
                'border-color': '#fff'
              }
            },
            '._annotation': {
              'display': 'block',
              'line-height': '26px',
              'padding': '3px 10px 5px',
              'color': '#eee',
              'background': '#00a',
              'margin': '0 0 6px 0',
              'border-radius': '5px',
              'font-weight': 'bold',
              'font-size': '18px',
              '&:hover': {
                'color': '#fff'
              }
            },
            '._mask': {
              'position': 'absolute',
              'top': '0',
              'left': '0',
              'bottom': '0',
              'right': '0'
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
              'opacity': '0'
            },
            '&:hover ._saveButton, &:hover ._searchButton': {
              'opacity': '1'
            },
            'img': {
              'display': 'block',
              'width': '200px',
              'border-radius': '8px'
            },
            '._ft': {
              'display': 'block',
              'span': {
                'position': 'relative',
                'display': 'block',
                'padding': '10px',
                'color': '#333',
                '&._domain': {
                  'color': '#b9b9b9',
                  'font-weight': 'bold',
                  'white-space': 'pre',
                  'overflow': 'hidden',
                  'text-overflow': 'ellipsis',
                  'width': '180px'
                },
                '&._deets': {
                  'display': 'block',
                  'position': 'relative',
                  'height': '50px',
                  '._avatar': {
                    'position': 'absolute',
                    'top': '10px',
                    'left': '10px',
                    'height': '30px',
                    'width': '30px',
                    'padding': '0',
                    'border-radius': '15px',
                    'background': 'transparent url() 0 0 no-repeat',
                    'background-size': '30px 30px'
                  },
                  '._pinner': {
                    'border': 'none',
                    'position': 'absolute',
                    'top': '5px',
                    'left': '50px',
                    'height': '25px',
                    'padding': '0',
                    'line-height': '25px',
                    'font-weight': 'bold',
                    'white-space': 'pre',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis',
                    'width': '150px'
                  },
                  '._board': {
                    'border': 'none',
                    'position': 'absolute',
                    'top': '20px',
                    'left': '50px',
                    'padding': '0',
                    'height': '25px',
                    'line-height': '25px',
                    'white-space': 'pre',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis',
                    'width': '150px'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}));
