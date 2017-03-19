// ship visual search for Chrome

(function (w, a) {
  var $ = w['P'] = {
    'w': w,
    'a': a,
    'b': chrome || firefox || browser,
    'v': {
      'sessionStart': new Date().getTime(),
      'cookies': {},
      'endpoint': {},
      'lastCap': new Date().getTime(),
      'time': {
        'pinmarklet': 0,
        'logic': 0,
        'hash': 0
      }
    },
    'f': (function () {
      return {
        debug: function (obj) {
          if (obj && $.a.dev) {
            console.log(obj);
          }
        },
        // send a request to a server
        xhr: function (o) {
          var xhr;
          if (!o.method) {
            o.method = 'GET';
          }
          xhr = new XMLHttpRequest();
          xhr.open(o.method, o.url, true);
          xhr.setRequestHeader('X-CSRFToken', $.v.csrfToken);
          if (typeof o.callback === 'function') {
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                o.callback(xhr.responseText);
              }
            };
          }
          // formData must be a FormData object
          if (o.formData) {
            xhr.send(o.formData);
          } else {
            xhr.send();
          }
        },
        // convert base64/URLEncoded data component to raw binary data held in a string
        makeBlob: function (dataURI) {
          var bytes, mimeType, blobArray;
          if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            bytes = atob(dataURI.split(',')[1]);
          } else {
            bytes = unescape(dataURI.split(',')[1]);
          }
          // separate out the mime component
          mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];
          // write the bytes of the string to a typed array
          blobArray = new Uint8Array(bytes.length);
          for (var i = 0; i < bytes.length; i++) {
            blobArray[i] = bytes.charCodeAt(i);
          }
          return new Blob([blobArray], {'type': mimeType});
        },
        // logging request
        log: function (input) {
          var i, o, str;
          str = 'type=extension&xuid=' + $.v.xuid + '&xv=' + $.a.myKey + $.v.ver;
          if (typeof input === 'string') {
            str = str + input;
          } else {
            if (typeof input === 'object') {
              for (i in input) {
                if (typeof input[i] !== 'undefined') {
                  str = str + '&' + i + '=' + input[i];
                }
              }
            }
          }
          var o = {
            url: $.a.endpoint.log + '?' + str
          };
          $.f.debug('Logging: ' + o.url);
          $.f.xhr(o);
        },
        // set an object in local storage
        setLocal: function (obj) {
          for (var k in obj) {
            $.f.debug('setting local item: ' + k);
          }
          $.b.storage.local.set(obj);
        },
        // send something to content script
        send: function (obj) {
          $.b.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length) {
              $.f.debug('sending object to content script');
              $.b.tabs.sendMessage(tabs[0].id, obj, function() {});
            } else {
              $.f.debug('could not send; focused tab has no ID (developer console?)');
            }
          });
        },
        // make a base-60 number of length n
        random60: function (n) {
          var i, r;
          r  = '';
          n = n - 0;
          if (!n) {
            n = 12;
          }
          for (i = 0; i < n; i = i + 1) {
            r = r + $.a.digits.substr(Math.floor(Math.random() * 60), 1);
          }
          return r;
        },
        // create a note
        makeNote: function (obj) {
          var options = {
            type: 'basic',
            title:  obj.title,
            message: obj.message,
            contextMessage: obj.contextMessage || '',
            iconUrl: obj.img || 'img/icon_140.png',
            buttons: obj.buttons || []
          };
          var go = function () {
            var myNote = $.b.notifications.create(
            obj.id, options, function (id) {
              $.f.debug('Notification ' + id + ' created.');
              $.w.setTimeout(function() {
                $.f.debug('Killing note after ' + $.v.killNoteAfter + ' microseconds.');
                $.b.notifications.clear(id);
              }, $.v.killNoteAfter);
            });
          };
          go();
        },
        // various callbacks for xhr requests
        ping: {
          pinmarklet: function (txt) {
            if (txt) {
              $.f.setLocal({'pinmarklet': txt});
              $.v.time.pinmarklet = new Date().getTime();
              $.f.debug('New pinmarklet saved.');
            }
          },
          logic: function (txt) {
            if (txt) {
              $.f.setLocal({'logic': txt});
              $.v.time.logic = new Date().getTime();
              $.f.debug('New business logic saved.');
            }
          },
          // parse and save hashList.json
          hash: function (r) {
            try {
              var parsed = JSON.parse(r);
              $.f.debug('hashList reply looks like JSON, checking lists');
              $.v.theList = parsed.theList;
              if ($.v.theList && $.v.theList.length) {
                $.f.debug('theList is present');
              } else {
                // don't wipe it if we already loaded a list
                if (!$.v.theList) {
                  $.v.theList = [];
                }
                $.f.debug('theList is NOT present');
              }
              $.v.theOtherList = parsed.theOtherList;
              if ($.v.theOtherList && $.v.theOtherList.length) {
                $.f.debug('theOtherList is present');
              } else {
                // don't wipe it if we already loaded a list
                if (!$.v.theOtherList) {
                  $.v.theOtherList = [];
                }
                $.f.debug('theOtherList is NOT present');
              }
              $.f.setLocal({
                'hashList': {
                  'theList': $.v.theList,
                  'theOtherList': $.v.theOtherList
                }
              });
              $.v.time.hash = $.v.sessionStart;
            } catch (err) {
              $.f.debug('hashList reply does NOT look like JSON, aborting list check');
            }
          }
        },
        // set new CSRF token for API domain
        setCsrfToken: function () {
          $.v.csrfToken = $.f.random60(32);
          $.b.cookies.set({
            // don't set domain; you'll get an extra dot in front
            url: 'https://' + $.v.csrfDomain,
            name: 'csrftoken',
            secure: true,
            value: $.v.csrfToken
          }, function () {
            $.f.debug('CSRFToken cookie set on ' + $.v.csrfDomain + ' to ' + $.v.csrfToken);
          })
        },

        showSearchMenu: function () {
          if ($.v.canHazSearch) {
            try {
              $.b.contextMenus.create({
                id: 'search',
                title: $.b.i18n.getMessage('searchAction'),
                contexts: ['page', 'frame', 'selection', 'editable', 'video', 'audio']
              });
              $.b.contextMenus.onClicked.addListener(function (obj, tabs) {
                var now = new Date().getTime();
                if (now - $.v.lastCap > 1000) {
                  if (obj.menuItemId === 'search') {
                    $.b.tabs.captureVisibleTab(function(uri) {
                      if ($.a.dev) {
                        $.f.send({'to': 'content', 'act': 'openDevSearch', 'data': {'screencap': uri}});
                      } else {
                        $.f.send({'to': 'content', 'act': 'openSearch', 'data': {'screencap': uri}});
                      }
                    });
                  }
                }
                $.v.lastCap = now;
              });
              $.f.debug('Search menu create success.');
            } catch (err) {
              $.f.debug('Search menu create FAIL.');
              $.f.debug(err);
            }
          }
        },

        // actions we are prepared to take when asked by content.js
        act: {
          // build context menus
          showContextMenus: function (data) {
            // hide all context menus
            $.b.contextMenus.removeAll();
            // save
            try {
              $.b.contextMenus.create({
                id: 'rightClickToPin',
                title: $.b.i18n.getMessage('saveAction'),
                // only fire for images
                contexts: ['image'],
                onclick: function(data) {
                  $.f.send({'to': 'content', 'act': 'rightClick'});
                }
              });
              $.f.debug('Save menu create success.');
            } catch (err) {
              $.f.debug('Save menu create FAIL.');
              $.f.debug(err);
            }
            // if we're logged in, see if we should show the search menu or not
            if ($.v.hazLogin) {
              $.f.getLocal({'k': 'canHazSearch', 'cb': 'showSearchMenu'});
            }
          },
          // log something that happened in content
          logAction: function (r) {
            $.f.log(r.data);
          },
          openCreateForm: function (r) {
            $.f.log('&event=open_create');
            if ($.a.dev) {
              $.f.send({'to': 'content', 'act': 'openDevCreateForm', 'data': r.data});
            } else {
              $.f.send({'to': 'content', 'act': 'openCreateForm', 'data': r.data});
            }
          },
          closeCreateForm: function (r) {
            $.f.send({'to': 'content', 'act': 'closeCreateForm', 'data': r.data});
          },
          populateCreateForm: function (r) {
            r.data.boards = $.v.boards;
            $.f.send({'to': 'create', 'act': 'populateCreateForm', 'data': r.data});
          },
          populateGrid: function (r) {
            $.f.send({'to': 'grid', 'act': 'render', 'data': r.data});
          },
          closeGrid: function (r) {
            $.f.send({'to': 'content', 'act': 'closeGrid'});
          },
          popSearch: function(r) {
            if ($.a.dev) {
              $.f.send({'to': 'content', 'act': 'openDevSearch', 'data': r.data});
            } else {
              $.f.send({'to': 'content', 'act': 'openSearch', 'data': r.data});
            }
          },
          openSearch: function (r) {
            if (r && r.data && r.data.src) {
              // send r.data.src to search so we can render the search box
              $.f.send({'to': 'search', 'act': 'preview', 'data': r.data});
            } else {
              // should we log an error here?
              $.f.debug('No image for Search to try.');
              $.f.act.closeSearch();
            }
          },
          runSearch: function (r) {
 
            var callback, data, equest, method, formData;
 
            $.f.debug('running search');

            if (r.data.img || r.data.u) {
   
              callback = function (raw) {
                try {
                  data = JSON.parse(raw);
                  $.f.debug(data);
                  $.f.send({'to': 'search', 'act': 'render', 'data': data});
                } catch (err) {
                  $.f.debug('Search API returned an error.');
                }
              }
   
              if (r.data.u) {
                $.f.debug('searching by URL ' + r.data.u);
                method = 'GET';
                request = $.v.endpoint.api + 'visual_search/flashlight/url/';
                request = request + '?url=' + encodeURIComponent(r.data.u);
                request = request + '&x=' + r.data.x || 0;
                request = request + '&y=' + r.data.y || 0;
                request = request + '&h=' + r.data.h || 0;
                request = request + '&w=' + r.data.w || 0;
                request = request + '&lang=' + $.w.navigator.language;
                if (r.data.f) {
                  request = request + '&text_filters=' + encodeURIComponent(r.data.f);
                }
                request = request + '&base_scheme=https&add_fields=pin.pinner(),pin.rich_summary,pin.dominant_color,pin.board()';
              } else {
                $.f.debug('searching by raw data');
                method = 'PUT';
                request = $.v.endpoint.api + 'visual_search/extension/image/';
                formData = new FormData();
                formData.append('x', r.data.x || 0);
                formData.append('y', r.data.y || 0);
                formData.append('h', r.data.h || 1);
                formData.append('w', r.data.w || 1);
                formData.append('lang', $.w.navigator.language);
                formData.append('base_scheme', 'https');
                formData.append('add_fields', 'pin.pinner(),pin.rich_summary,pin.dominant_color,pin.board()');
                formData.append('image', $.f.makeBlob(r.data.img));
                if (r.data.f) {
                  formData.append('text_filters', r.data.f);
                }
              }

              $.f.xhr({
                url: request,
                callback: callback,
                method: method,
                formData: formData
              });
            }
          },
          closeSearch: function (r) {
            $.f.send({'to': 'content', 'act': 'closeSearch'});
          },
          // get boards
          fetchBoards: function () {
            var request = $.v.endpoint.api + 'users/me/boards/?base_scheme=https&filter=all&sort=last_pinned_to&add_fields=user.is_partnerboard.image_cover_url,board.privacy';
            var callback = function(r) {
              try {
                var boardObj = JSON.parse(r);
                if (boardObj.data) {
                  // convert board_order_modified_at to timestamp
                  for (var i = 0; i < boardObj.data.length; i = i + 1) {
                    var b = boardObj.data[i];
                    boardObj.data[i].ts = new Date(boardObj.data[i].board_order_modified_at).getTime();
                  }
                  $.f.debug('Boards loaded successfully.');
                  // got boards
                  $.v.boards = boardObj.data;
                } else {
                  if (boardObj.status && boardObj.status === 'failure') {
                    $.f.debug('Boards NOT loaded successfully.');
                  }
                }
              } catch (err) {
                $.f.debug('Could not parse /me/boards API reponse to JSON.');
              }
            };
            $.f.xhr({
              url: request,
              callback: callback
            });
          },
          // see if we're signed in
          checkLogin: function (o) {
 
            var logicAge = new Date().getTime() - $.v.time.logic;
            if (logicAge > $.a.logicExpiresAfter) {
              $.f.debug('Getting a fresh copy of business logic.');
              $.f.getLogic();
            } else {
              $.f.debug('Business logic is fresh.');
            }
 
            $.f.act.showContextMenus();
            if (!o) {
              o = {};
            }
            var hazLogin = false;
            $.f.setLocal({'hazLogin': false});
            $.b.cookies.getAll({}, function (r) {
              for (var k in r) {
                if (r[k].hasOwnProperty) {
                  if (r[k].domain === $.v.rootDomain) {
                    if (r[k].name === '_pinterest_sess') {
                      // shortest logged-in _pinterest_sess cookie I can find is 704 bytes
                      // 704: logged in with e-mail
                      // 1128: logged in with Facebook
                      // 248: not logged in
                      if (r[k].value.length > 500) {
                        $.f.setLocal({'hazLogin': true});
                        hazLogin = true;
                      }
                    }
                  }
                }
              }
              if (!hazLogin) {
                $.f.debug('Pinterest session NOT FOUND.');
              } else {
                if (!$.v.boards || o.fetchBoards) {
                  $.f.act.fetchBoards();
                }
              }
            });
          },

          makeNewBoard: function (q) {

            // required: board name
            // optional: secret (true/false)
            var url, callback, buttons, i, r;

            if (q.data.name) {

              url = $.v.endpoint.api + 'boards/?';

              // new boards are PUTs, so we need all parameters in the URL
              url = url + 'name=' + encodeURIComponent(q.data.name);
              if (q.data.secret) {
                url = url + '&privacy=secret';
              }
   
              callback = function (txt) {
                $.f.debug('NEW BOARD CREATE RESULTS');
                try {
                  r = JSON.parse(txt);
                  $.f.debug(r);
                } catch (err) {
                  $.f.debug('error parsing new board create results');
                  $.f.debug(err);
                  $.f.debug(txt);
                  return;
                }
                if (r.status === 'success') {
                  $.f.send({'to': 'create', 'act': 'showNewBoard', 'data': r.data});

                  $.f.log('&event=board_create&board_id=' + r.data.id);

                  buttons = [ {
                    'title': q.data.strings.msgSeeItNow || 'See it now'
                  } ];

                  $.f.makeNote({
                    'id': 'https://www.pinterest.com' + r.data.url,
                    'title': q.data.strings.msgSuccess || 'Success!',
                    'message': q.data.strings.msgBoardCreated.replace(/%/, r.data.name) || 'New board ' + r.data.name + ' was created.',
                    'buttons': buttons
                  });
                } else {
                  $.f.makeNote({
                    'id': 'https://help.pinterest.com/',
                    'title': r.message,
                    'message': r.message_detail || q.data.strings.msgBoardFail || 'Could not create new board.'
                  });
                }
                // we made a new one, so go get the list of boards
                $.f.act.fetchBoards();
                // always get a new CSRF token after a successful write
                $.f.setCsrfToken();

              };

              $.f.xhr({
                url: url,
                callback: callback,
                method: 'PUT'
              });
            }
          },

          pinIt: function (q) {
            // pin requires a board ID, an URL, and either a media URL or color
            // optional: description
            var url, r, note, boardName, buttons, i, callback, formData;

            if (q.data && q.data.board && q.data.url) {
              if (!q.data.description) {
                q.data.description = '';
              }
              url = $.v.endpoint.api + 'pins/';
   
              // new pins are PUTs, so we need all parameters in the URL
              formData = new FormData();
              formData.append('method', 'extension');
              formData.append('add_fields', 'user.is_partner');
              formData.append('board_id', q.data.board);
              formData.append('source_url', q.data.url);
              formData.append('description', q.data.description);

              if (q.data.media) {
                // pin has an image
                if (q.data.media.match(/^data/)) {
                  // for pins from a data:URI
                  formData.append('image_base64', q.data.media);
                } else {
                  // for pins from an URL
                  if (q.data.media) {
                    formData.append('image_url', q.data.media);
                  }
                }
              } else {
                // for imageless pins
                if (q.data.color) {
                  formData.append('color', q.data.color);
                }
              }
              $.f.debug('PIN CREATE URL');
              $.f.debug(url);

              boardName = '';

              for (i = 0; i < $.v.boards.length; i = i + 1) {
                if ($.v.boards[i].id === q.data.board) {
                  boardName = $.v.boards[i].name;
                  break;
                }
              }

              callback = function (txt) {
                try {
                  r = JSON.parse(txt);
                  $.f.debug(r);
                } catch (err) {
                  $.f.debug('error parsing pin create results');
                  $.f.debug(err);
                  $.f.debug(txt);
                  return;
                }
                if (r.status === 'success') {
                  $.f.debug('SUCCESS!');

                  $.f.log('&event=pin_create&pin_id=' + r.data.id + '&xm=' + q.data.method);

                  buttons = [ {
                    'title': q.data.strings.msgSeeItNow || 'See it now'
                  } ];

                  if (r.data.promote_button  && r.data.promote_button.show_promote_button) {
                    $.v.promoteUrl = r.data.promote_button.promote_button_destination;
                    buttons.push({'title': q.data.strings.msgPromotePin || r.data.promote_button.promote_button_text});
                  }
       
                  $.f.makeNote({
                    'id': 'https://www.pinterest.com/pin/' + r.data.id + '/',
                    'title': q.data.strings.msgSuccess || 'Success!',
                    'message': q.data.strings.msgPinSavedTo.replace(/%/, boardName) || 'Saved to ' + boardName,
                    'img': q.data.dataURI,
                    'buttons': buttons
                  });
                } else {
                  $.f.debug('FAILED TO CREATE PIN');
                  $.f.debug(q);
                  $.f.debug(r);
                  $.f.makeNote({
                    'id': 'https://help.pinterest.com/',
                    'title': r.message,
                    'message': r.message_detail || q.data.strings.msgPinFail || 'Could not save this page.'
                  });
                }
                // always refresh boards in case we made a new one
                $.f.act.fetchBoards();
                // always get a new CSRF token after a successful write
                $.f.setCsrfToken();
              };
              $.f.xhr({
                url: url,
                callback: callback,
                method: 'PUT',
                formData: formData
              });
            } else {
              $.f.debug('CANNOT CREATE PIN WITHOUT BOARD AND URL');
              $.f.debug(q);
            }
          },

          rePinIt: function (q) {
            // repin requires a pin id and board id.
            // optional: description
            var url, formData, callback, boardName, i, r;

            if (q.data && q.data.board && q.data.id) {


              for (i = 0; i < $.v.boards.length; i = i + 1) {
                if ($.v.boards[i].id === q.data.board) {
                  boardName = $.v.boards[i].name;
                  break;
                }
              }

              url = $.v.endpoint.api + 'pins/' + q.data.id + '/repin/';

              // repins are POSTs, so they need form data.
              formData = new FormData();
              formData.append('board_id', q.data.board);
              if (q.data.description) {
                formData.append('description', q.data.description);
              }

              callback = function (txt) {
                $.f.debug('REPIN RESULTS');
                try {
                  r = JSON.parse(txt);
                  $.f.debug(r);
                } catch (err) {
                  $.f.debug('error parsing repin results');
                  $.f.debug(err);
                  $.f.debug(txt);
                  return;
                }
                if (r.status === 'success') {
                  $.f.debug('SUCCESS!');

                  $.f.log('&event=repin_create&pin_id=' + r.data.id + '&xm=' + q.data.method);

                  var buttons = [ {
                    'title': q.data.strings.msgSeeItNow || 'See it now'
                  } ];

                  if (r.data.promote_button  && r.data.promote_button.show_promote_button) {
                    $.v.promoteUrl = r.data.promote_button.promote_button_destination;
                    buttons.push({'title': q.data.strings.msgPromotePin || r.data.promote_button.promote_button_text});
                  }

                  $.f.makeNote({
                    'id': 'https://www.pinterest.com/pin/' + r.data.id + '/',
                    'title': q.data.strings.msgSuccess || 'Success!',
                    'message': q.data.strings.msgPinSavedTo.replace(/%/, boardName) || 'Saved to ' + boardName,
                    'img': q.data.dataURI,
                    'buttons': buttons
                  });
                } else {
                  $.f.debug('FAILED TO REPIN');
                  $.f.debug(q);
                  $.f.debug(r);
                  $.f.makeNote({
                    'id': 'https://help.pinterest.com/',
                    'title': r.message,
                    'message': r.message_detail || q.data.strings.msgPinFail || 'Could not save this page.'
                  });
                }
                // always refresh boards in case we made a new one
                $.f.act.fetchBoards();
                // always get a new CSRF token after a successful write
                $.f.setCsrfToken();

              };

              $.f.xhr({
                url: url,
                callback: callback,
                method: 'POST',
                formData: formData
              });
            } else {
              $.f.debug('CANNOT REPIN WITHOUT PIN ID AND BOARD ID.');
              $.f.debug(q);
            }
          }
        },
        // welcome, new user!
        welcome: function () {
          // create a note
          $.f.debug('Creating welcome note');
          $.b.notifications.create(
            'welcomeNote', {
            'type': 'basic',
              'iconUrl': 'img/icon_48.png',
              'title': $.b.i18n.getMessage("welcomeTitle"),
              'message': $.b.i18n.getMessage("welcomeBody")
            }, function () { }
          );
          // since we only have the one note, clicking any will open the welcome page
          $.b.notifications.onClicked.addListener(function () {
            $.f.debug('Welcome message clicked');
            window.open($.b.i18n.getMessage("welcomeLink"));
          });
          // open education page
          $.b.tabs.create({url: $.a.endpoint.about + $.a.path.welcome + '?xuid=' + $.v.xuid + '&xv=' + $.a.myKey + $.v.ver});
          // save timestamp in beenWelcomed
          $.f.setLocal({'beenWelcomed': $.v.sessionStart});

          var uninstallUrl = $.a.endpoint.home + $.a.path.uninstall + '?xuid=' + $.v.xuid + '&xv=' + $.a.myKey + $.v.ver;
          $.b.runtime.setUninstallURL(uninstallUrl);
          $.f.setLocal({'uninstallUrl': uninstallUrl});
          $.f.debug('setting uninstall URL to ' + uninstallUrl);

        },

        // get the pinmarklet
        getPinmarklet: function () {
          $.f.xhr({
            url: $.a.endpoint.assets + $.a.path.js + $.a.file.pinmarklet + '?' + new Date().getTime(),
            callback: $.f.ping.pinmarklet
          });
        },

        // get business logic
        getLogic: function () {
          $.f.xhr({
            url: $.a.endpoint.assets + $.a.path.ext + $.a.path.duckie + $.a.file.logic + '?' + new Date().getTime(),
            callback: $.f.ping.logic
          });
        },

        // get business logic
        getHashList: function () {
          $.f.xhr({
            url: $.a.endpoint.assets + $.a.path.ext + $.a.file.hash + '?' + new Date().getTime(),
            callback: $.f.ping.hash
          });
        },

        // get local storage, set local vars, run callback if specified
        getLocal: function (o) {
          if (!o.k) {
            o.k = null;
          }
          // here we should check if o.k contains a list and get them all if so
          $.b.storage.local.get(o.k, function(data) {
            // load up defaults
            for (var k in $.a.default) {
              $.v[k] = $.a.default[k];
            }
            // overwrite with localStorage
            for (var i in data) {
              $.v[i] = data[i];
            }
            // o.cb should be the string name of a child function of $.f, so 'init' and not $.f.init
            if (typeof $.f[o.cb] === 'function') {
              $.f[o.cb]();
            }
          });
        },

        // start a session
        init: function () {

          if ($.a.dev) {
            $.a.endpoint.assets = '../dev/';
          }

          // know your version
          $.v.ver = $.b.runtime.getManifest().version;

          // set xuid if needed
          if (!$.v.xuid) {
            $.v.xuid = $.f.random60();
            $.f.setLocal({'xuid': $.v.xuid});
            $.f.log('&event=install');
            $.f.welcome();
          } else {
            $.f.log('&event=session');
          }
          $.f.debug('xuid: ' + $.v.xuid);

          // default domains
          $.v.rootDomain = '.pinterest.com';
          $.v.csrfDomain = 'api' + $.v.rootDomain;

          $.f.act.checkLogin();

          // set a csrf cookie and store it as $.v.csrfToken
          $.f.setCsrfToken();

          // create API endpoint
          $.v.endpoint.api = 'https://' + $.v.csrfDomain + '/v3/';

          // get and store our support files
          $.f.getLogic();
          $.f.getPinmarklet();
          $.f.getHashList();

          // if an incoming message from script is for us and triggers a valid function, run it
          $.b.runtime.onMessage.addListener(function(r) {
            $.f.debug(r);
            if (r.to && r.to === $.a.me) {
              if (r.act && typeof $.f.act[r.act] === 'function') {
                $.f.act[r.act](r);
              }
            }
          });

          // click the body of the welcome note
          $.b.notifications.onClicked.addListener(function (me) {
            if (me === 'welcomeNote') {
              $.w.open($.b.i18n.getMessage("welcomeLink"));
            }
          });

          // clicked a button on successful pin create note
          $.b.notifications.onButtonClicked.addListener(function (me, num) {
            var url = me;
            if (num > 0) {
              if ($.v.promoteUrl && me.match(/\/pin\//)) {
                // click on "promote pin" notification button prompt
                url = $.v.promoteUrl;
              }
            }
            $.w.open(url);
          });

          // fire pinmarklet on toolbar button click
          $.b.browserAction.onClicked.addListener(function(tab) {
            $.f.log('&event=click&action=open_grid');
            if ($.a.dev) {
              $.f.send({'to': 'content', 'act': 'openDevGrid'});
            } else {
              $.f.send({'to': 'content', 'act': 'openGrid'});
            }
          });

          // every time a new tab is created, fetch boards
          $.b.tabs.onCreated.addListener(function() {
            $.f.debug('New tab; getting boards.');
            $.f.act.checkLogin({'fetchBoards': true});
          });

          // context menus are global so we need to take care that Search always shows where it's supposed to show
          $.b.tabs.onActivated.addListener(function() {
            $.f.debug('Active tab has changed; refresh Search eligibility.');
            $.f.send({'to': 'content', 'act': 'updateSearch'});
          });

        }
      };
    }())
  };
  // get everything in local storage and then init
  $.f.getLocal({'cb': 'init'});
}(window, {
  // uncomment to use local copies of support files (pinmarklet, grid, create, business logic)
  'dev': false,
  // one hour; increase to 24 after we're stable
  'logicExpiresAfter': 1 * 3600000,
  'default': {
    'killNoteAfter': 2000
  },
  'me': 'background',
  'myKey': 'cr',
  'digits': '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz',
  'endpoint': {
    'home': 'https://www.pinterest.com/',
    'about': 'https://about.pinterest.com/',
    'assets': 'https://assets.pinterest.com/',
    'log': 'https://log.pinterest.com/'
  },
  'path': {
    'ext': 'ext/',
    'duckie': 'duckie/',
    'js': 'js/',
    'uninstall': 'settings/extension/uninstall/',
    'welcome': 'browser-button-confirmation-page/'
  },
  'file': {
    'hash': 'hashList.json',
    'logic': 'cr_210.js',
    'pinmarklet': 'pinmarklet.js'
  }
}));
