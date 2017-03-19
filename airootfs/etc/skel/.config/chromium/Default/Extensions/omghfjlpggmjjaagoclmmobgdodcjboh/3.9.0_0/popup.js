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

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":2}],2:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],3:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */
;(function (root, factory) {

  /* CommonJS */
  if (typeof module == 'object' && module.exports) module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}(this, function () {
  "use strict"

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */
    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl (tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for (n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins (parent /* child1, child2, ...*/) {
    for (var i = 1, n = arguments.length; i < n; i++) {
      parent.appendChild(arguments[i])
    }

    return parent
  }

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation (alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor (el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    if (s[prop] !== undefined) return prop
    for (i = 0; i < prefixes.length; i++) {
      pp = prefixes[i]+prop
      if (s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css (el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n) || n] = prop[n]
    }

    return el
  }

  /**
   * Fills in default values.
   */
  function merge (obj) {
    for (var i = 1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n]
      }
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor (color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12             // The number of lines to draw
  , length: 7             // The length of each line
  , width: 5              // The line thickness
  , radius: 10            // The radius of the inner circle
  , scale: 1.0            // Scales overall size of the spinner
  , corners: 1            // Roundness (0..1)
  , color: '#000'         // #rgb or #rrggbb
  , opacity: 1/4          // Opacity of the lines
  , rotate: 0             // Rotation offset
  , direction: 1          // 1: clockwise, -1: counterclockwise
  , speed: 1              // Rounds per second
  , trail: 100            // Afterglow percentage
  , fps: 20               // Frames per second when using setTimeout()
  , zIndex: 2e9           // Use a high z-index by default
  , className: 'spinner'  // CSS class to assign to the element
  , top: '50%'            // center vertically
  , left: '50%'           // center horizontally
  , shadow: false         // Whether to render a shadow
  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
  , position: 'absolute'  // Element positioning
  }

  /** The constructor */
  function Spinner (o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function (target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = createEl(null, {className: o.className})

      css(el, {
        position: o.position
      , width: 0
      , zIndex: o.zIndex
      , left: o.left
      , top: o.top
      })

      if (target) {
        target.insertBefore(el, target.firstChild || null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps / o.speed
          , ostep = (1 - o.opacity) / (f * o.trail / 100)
          , astep = f / o.lines

        ;(function anim () {
          i++
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
        })()
      }
      return self
    }

    /**
     * Stops and removes the Spinner.
     */
  , stop: function () {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    }

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
  , lines: function (el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill (color, shadow) {
        return css(createEl(), {
          position: 'absolute'
        , width: o.scale * (o.length + o.width) + 'px'
        , height: o.scale * o.width + 'px'
        , background: color
        , boxShadow: shadow
        , transformOrigin: 'left'
        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute'
        , top: 1 + ~(o.scale * o.width / 2) + 'px'
        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
        , opacity: o.opacity
        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    }

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
  , opacity: function (el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML () {

    /* Utility function to create a VML tag */
    function vml (tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function (el, o) {
      var r = o.scale * (o.length + o.width)
        , s = o.scale * 2 * r

      function grp () {
        return css(
          vml('group', {
            coordsize: s + ' ' + s
          , coordorigin: -r + ' ' + -r
          })
        , { width: s, height: s }
        )
      }

      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg (i, dx, filter) {
        ins(
          g
        , ins(
            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
          , ins(
              css(
                vml('roundrect', {arcsize: o.corners})
              , { width: r
                , height: o.scale * o.width
                , left: o.scale * o.radius
                , top: -o.scale * o.width >> 1
                , filter: filter
                }
              )
            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++) {
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
        }

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function (el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i + o < c.childNodes.length) {
        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  if (typeof document !== 'undefined') {
    sheet = (function () {
      var el = createEl('style', {type : 'text/css'})
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')
  }

  return Spinner

}));

},{}],4:[function(require,module,exports){
/*
  Returns random int value between 0 (inclusive) and the specified value (exclusive)
  TODO(grig): more accurate randomInt
*/
function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/*
  Returns random array element using weights. Element weight should be stored in 'weight' property of array element.
  If 'weight' property is absent then weight for this element is 1.
*/
function weightedRandom(array) {
  var map = [];
  var totalWeight = 0;

  for (var i = 0; i < array.length; i++) {
    var weight = array[i].weight || 1;

    map.push({
      start : totalWeight,
      end : totalWeight + weight
    });

    totalWeight += weight;
  }

  var random = randomInt(totalWeight);

  for (i = 0; i < map.length; i++) {
    if ((random >= map[i].start) && (random < map[i].end)) {
      return array[i];
    }
  }
}

/*
  Clone array
*/
function clone(array) {
  return array.slice(0);
}

/*
  Return shuffled array without modifying original one
  TODO(grig): replace cloning with a new empty array
*/
function shuffle(array) {
  var arrayClone = clone(array);
  var currentIndex = arrayClone.length;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    var randomIndex = randomInt(currentIndex);
    currentIndex--;

    // And swap it with the current element.
    var temporaryValue  = arrayClone[currentIndex];
    arrayClone[currentIndex] = arrayClone[randomIndex];
    arrayClone[randomIndex]  = temporaryValue;
  }

  return arrayClone;
}

/*
  Return shuffled array with attention to element weights.
  Element weight should be stored in 'weight' property of array element.
  If 'weight' property is absent then weight for this element is 1.
  Original array is not modified.
*/
function weightedShuffle(array) {
  var arrayClone = clone(array);
  var result = [];

  for (var i = 0; i < array.length; i++) {
    var item = weightedRandom(arrayClone);
    result.push(item);
    arrayClone.splice(arrayClone.indexOf(item), 1);
  }

  return result;
}

exports.weightedShuffle = weightedShuffle;
exports.shuffle = shuffle;
exports.weightedRandom = weightedRandom;
},{}],5:[function(require,module,exports){
var $ = require('jquery');

$(document).ready (function () {
  require('./ui/location-chooser').init();
});

$(document).on('pageloaded', function() {
  require('./ui/location-chooser').init();
});

$(window).on('unload', function() {
  require('./ui/location-chooser').unload();
});

},{"./ui/location-chooser":12,"jquery":"jquery"}],6:[function(require,module,exports){
require('./utils/format');
require('./utils/ends_with');
require('./utils/starts_with');
require('./utils/error_handler');

},{"./utils/ends_with":16,"./utils/error_handler":17,"./utils/format":18,"./utils/starts_with":19}],7:[function(require,module,exports){
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
},{"./config":"./config"}],8:[function(require,module,exports){
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

},{"jquery":"jquery"}],9:[function(require,module,exports){
require('./common');
require('./i18n');

var config = require('./config').browsec;

var arrs = require('./array');

var $ = window.jQuery = require('jquery');

var bp = chrome.extension.getBackgroundPage();
var proxy = bp.proxy;
var app = bp.app;
var toggle = require('./ui/proxy-toggle');
var ga = require('./ga');
var routes = require('./routes');

function updateToggle(doc) {
  var connected = proxy.connected();
  console.log("Update page with connected = " + connected, doc);
  toggle.render(connected, doc);
}

function loadAccount(doc) {
  bp.account.load(function(err, account) {
    if (err) {
      console.error("failed to load account", err);
      return;
    }

    if(!localStorage.isAuth && account.email) localStorage.isAuth = true;

    $(document).on('click', '.b-aside--expire.expiring .js-close-popup', function(){
      var untilDate = new Date(account.subscription.paidUntil);
      localStorage['userClosedWarnToPremiumEndDate'] = untilDate;

      renderPage(account, null, doc);
    })

    renderPage(account, null, doc);
  });
}

var makeDay = function(y, m, d) {
  var result = new Date();
  y = y || 2016;
  m = m || 12;
  result.setYear(y);
  result.setMonth(m - 1);
  result.setDate(d);
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  return result;
}
function check_holiday(y1, m1, d1, y2, m2, d2) {
  var dateStart = makeDay(y1, m1, d1);
  var dateEnd = makeDay(y2, m2, d2);
  var currentDate = new Date();
  return currentDate <= dateEnd && currentDate >= dateStart;
}

function is_christmas() {
  return check_holiday(2016, 12, 24, 2016, 12, 27);
}

exports.is_christmas = is_christmas;

function is_ny() {
  return check_holiday(2016, 12, 27, 2017, 1, 2);
}

function renderPage(account, oldAccount, doc) {
  doc = doc || document;
  var $banner = $('.b-banner', doc);
  $banner.removeClass('b-banner__free-user');
  $banner.removeClass('b-banner__premium-user');
  $banner.removeClass('b-banner__premium-user--expiring');
  $banner.removeClass('b-banner__premium-user--expired');

  $(".link-contactus", doc)
    .attr('href', routes.contact_us_url)
    .attr("target", "_blank");

  var dayDif = function(date,days){
    return new Date(date.getTime() + days*(1000 * 60 * 60 * 24));
  }

  var minDif = function(date,minutes){
    return new Date(date.getTime() + minutes*(1000 * 60));
  }

  $('body').removeAttr('class');

  if(proxy && proxy.connected()) {
    renderProxyStatus(true, doc);
  } else {
    renderProxyStatus(false, doc);
  }


  if (account.premium) {

    $('body').addClass('mode__premium-user');

    var untilDate = new Date(account.subscription.paidUntil);

    if(localStorage['userClosedWarnToPremiumEndDate'] == untilDate || dayDif(untilDate, -2) > new Date()) {
    //if(localStorage['userClosedWarnToPremiumEndDate'] == untilDate || minDif(untilDate, -2) > new Date()) {
    }
    else {
        $('body').addClass('banner banner__expiring');
    }

  }
  else {

    $('body').addClass('banner').addClass('banner__get-premium');

    if(account.guest){

      $('body').addClass('mode__guest-user');

      if(localStorage.trial_premium_token && localStorage.trial_premium_token != "undefined" && !localStorage.isAuth && !is_christmas() && !is_ny()) {
        $('body').addClass('mode__guest-user-freetrial');
      }

    }
    else{
      $('body').addClass('mode__free-user');
    }

    if(!$('body').hasClass('mode__guest-user-freetrial') && (is_christmas() || is_ny())){
      $('body').addClass('b-show-holiday-banner');

    }
    else if(!$('body').hasClass('mode__guest-user-freetrial')) {
      var arr = [];

      $('.b-aside.b-aside__info.b-aside--premium-cta[data-weight]', doc).each(function(){
        this.weight = parseInt($(this).attr('data-weight'));
        arr.push(this);
      })

      var thisBanner = arrs.weightedRandom(arr);
      if (thisBanner) {
        $('body').addClass(thisBanner.id);
        ga.trackEvent("banner", "show", thisBanner.id);
      }
    }



  }
}


function renderProxyStatus(isConnected, doc) {
  doc = doc || document;
  if (isConnected) {
    $('body').removeClass('__disconnected').addClass('__connected');
    var countryCode = proxy.connected();
    $('.b-location-list-popup img', doc).attr('src', 'assets/images/flags/' + countryCode + '.png');
    var countryName = chrome.i18n.getMessage("country_name_" + countryCode.toUpperCase());
    $('.b-item-name-popup', doc).text(countryName);
  } else {
    $('body').removeClass('__connected').addClass('__disconnected');
  }
}

$(document).on('click','.b-switch-but--on', function(e){
  e.preventDefault();
  app.setProxyEnabled( true );
});

$(document).on('click', '.js-popup-free-premium', function(e) {
  chrome.tabs.create({ url: "offer_v2.html" });
  e.preventDefault();
  return false;
});


$(document).on('click','ul.b-location-list-popup li', function(){
  $('.b-ext-menu--item.b-ico-location a').trigger('click');
});

$(document).on('click', '.b-aside--premium-cta.js-call-premium', function(e){
  var id = $(this).closest('.b-aside--premium-cta[data-weight]').attr('id');
  ga.trackEvent("banner", "click", id);
});


$(document).ready (function () {
  localStorage.popupLastOpen = Date.now();
  if (!localStorage.trial_premium_shown && localStorage.trial_premium_token) {
    // show premium token invitation (just once)
    var congrats_tab_id = parseInt(localStorage.congrats_tab_id),
        tab_shown = false;

    chrome.tabs.query({}, function (tabs) {
      for (var tab of tabs) {
        if (tab.id == congrats_tab_id) {
          chrome.tabs.update(congrats_tab_id, {url: 'offer_v2.html'});
          localStorage.trial_premium_shown = true;
          tab_shown = true;
          break;
        }
      }

      if (!tab_shown) {
        chrome.tabs.create({active: false, url: 'offer_v2.html'});
        localStorage.trial_premium_shown = true;
      }
    });
  }

  toggle.init();

  require('./ui/premium-popup').init();
  require('./ui/login-widget').init();

  updateToggle();
  bp.account.off('change', renderPage);

  // load account syncronously from cache to render the page with this data
  bp.account.loadCached(function(err, acc) {
    renderPage(acc, null);
  });

  loadAccount();
  bp.account.on('change', renderPage);
  proxy.off('change', renderProxyStatus);
  proxy.on('change', renderProxyStatus);
});

$(document).on('beforepageloaded', function(e) {
  var $content = e.originalEvent.detail.content;

  toggle.init($content);
  updateToggle($content);
  loadAccount($content);
});

$(document).on('pageloaded', function() {
  require('./ui/premium-popup').init();
  require('./ui/login-widget').init();
});

$(window).on('unload', function() {
  toggle.unload();
  require('./ui/login-widget').unload();
  bp.account.off('change', renderPage);
  proxy.off('change', renderProxyStatus);
});



// import change_location screen
require('./change_location');

},{"./array":4,"./change_location":5,"./common":6,"./config":"./config","./ga":7,"./i18n":8,"./routes":10,"./ui/login-widget":13,"./ui/premium-popup":14,"./ui/proxy-toggle":15,"jquery":"jquery"}],10:[function(require,module,exports){
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

},{"./config":"./config"}],11:[function(require,module,exports){
/**
 * Manages list of servers
 *
 * TODO(grig): transaction / last known good support
 *
 * @module ./server_list
 */

var ga = require('./ga');

var defaultConfig = require('./config').proxy.settings || {};

/*
 * TODO(grig): test callback status
 */
exports.set = function set(value, callback) {
  var error = validate(value);
  if (error) {
    throw new ValidationError(error);
  }
  try {
    localStorage.currentConfig = JSON.stringify(value);
    if (typeof callback === 'function') {
      setTimeout(function() {
        callback(null);
      }, 0);
    }
  } catch(e) {
    if (typeof callback === 'function') {
      setTimeout(function() {
        callback(e);
      }, 0);
    }
  }
};

function validate(settings) {
  if (typeof settings !== 'object' || settings === null) {
    return 'settings should be an object';
  }

  if (!settings.hasOwnProperty('countries')) {
    return 'settings should have a "countries" property';
  }

  var config = settings.countries;
  if (Object.keys(config).length === 0) {
    return "config should have at least one key (country)";
  }
  for (var countryCode in config) {
    if (!config.hasOwnProperty(countryCode)) {
      continue;
    }
    var country = config[countryCode];
    if (!Array.isArray(country.servers) && !Array.isArray(country.premium_servers)) {
      return "country must have either 'servers' or 'premium_servers' fields set to an array of servers";
    }

    var error;
    if (Array.isArray(country.servers)) {
      error = validateServers(country.servers);
      if (error) {
        return error;
      }
    }

    if (Array.isArray(country.premium_servers)) {
      error = validateServers(country.premium_servers);
      if (error) {
        return error;
      }
    }
  }
  return null;
}

function validateServers(servers) {
  for (var i = 0; i < servers.length; i++) {
    var server = servers[i];
    if (typeof server.host !== 'string') {
      return "server must have a 'host' property";
    }
    if (!(typeof server.port === 'string' || typeof server.port === 'number')) {
      return "server must have a 'port' property";
    }
  }
  return null;
}

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || '';
  this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

/*
 * TODO(grig): test no countries in default config
 * TODO(grig): test no proxy config
 * TODO(grig): test errors
 */
exports.get = function get(callback) {
  var value = localStorage.currentConfig;
  if (typeof value === 'string') {
    try {
      var currentConfig = JSON.parse(value);
      var error = validate(currentConfig);
      if (error) {
        throw new ValidationError(error);
      }
      setTimeout(function() {
        callback(null, currentConfig || defaultConfig);
      }, 0);
    } catch (e) {
      var version = 'n/a';
      if (chrome.runtime && chrome.runtime.getManifest()) {
        version = chrome.runtime.getManifest().version;
      }
      var message = e.toString();
      try {
        // find application-level file name and line number from the stack
        var stack = e.stack.split("\n");
        for (var i = 0; i < stack.length; i++) {
          if (/ at .*\.js:.*/.test(stack[i])) {
            message = message + stack[i];
            break;
          }
        }
      } catch (_) {
        // nothing
      }
      ga.trackEvent("error", version, message, 0, false);

      console.warn("invalid current configuration, fall back to default: ", e);
      delete localStorage.currentConfig;
      setTimeout(function() {
        callback(null, defaultConfig);
      }, 0);
    }
  } else {
    setTimeout(function() {
      callback(null, defaultConfig);
    }, 0);
  }
};

exports.clear = function(callback) {
  delete localStorage.currentConfig;
  if (typeof callback === 'function') { setTimeout(callback, 0); }
};

},{"./config":"./config","./ga":7}],12:[function(require,module,exports){
var $ = require('jquery');
var ga = require('../ga');
var Spinner = require('spin.js');
var servers = require('../server_list');
var debounce = require('debounce');

var bp = chrome.extension.getBackgroundPage();
var proxy = bp.proxy;
var app = bp.app;
var countrySpinner;

exports.init = function init() {
  // location choosers: one for each location type (free/premium)
  var choosers = $('.b-location-list');
  if (choosers.length === 0) {
    return;
  }
  countrySpinner = new Spinner({scale: 0.5}).spin(document.querySelector(".b-location-wrapper"));
  bp.account.load(function(err, account) {
    if (err) {
      console.error(err);
      return;
    }

    renderAccount(account);
  });
  $(choosers).on('click', '.js-change-location', function(e) {
    var countryCode = $(e.currentTarget).data('country-code');
    app.setProxySettings(countryCode, function() {
      ga.trackEvent("extension", "change_country", countryCode);
      bp.account.load(function(err, account) {
        if (err) {
          console.error(err);
          return;
        }

        var connected = proxy.connected();
        $('.b-location', choosers).each(function() {
          var loc = this;
          var countryCode = $(loc).data('country-code');
          var premium = $(loc).data('premium') || false;
          updateLocation(loc, account, countryCode, connected, premium);
        });
        lazyRedirect();
      });
    });
  });

  proxy.off('change', render);
  proxy.on('change', render);

  bp.account.off('change', renderAccount);
  bp.account.on('change', renderAccount);
};

function redirect() {
  $("#main").data('smoothState').load('popup.html');
}
var lazyRedirect = debounce(redirect, 500);

exports.unload = function unload() {
  proxy.off('change', render);
  bp.account.off('change', renderAccount);
};

function renderAccount(account, oldAccount) {
  var choosers = $('.b-location-list');
  servers.get(function(err, settings) {
    if (countrySpinner) {
      countrySpinner.stop();
    }
    if (err) {
      // TODO: display the error somewhere
      console.error(err);
      return;
    }

    var countries = settings.countries;
    console.time("update select");
    var includeHidden = proxy.isIncludeHidden();
    var countryNames = Object.keys(countries).filter(function(countryCode) {
      return includeHidden || !countries[countryCode].hidden;
    }).map(function(countryCode) {
      var countryName = countryNameByCode(countryCode);
      var country = countries[countryCode];
      var result = [];
      if (Array.isArray(country.servers) && country.servers.length > 0) {
        result.push({id: countryCode, code: countryCode, name: countryName, premium: false});
      }
      if (Array.isArray(country.premium_servers) && country.premium_servers.length > 0) {
        result.push({id: countryCode + "_premium", code: countryCode, name: countryName + " (Premium)", premium: true});
      }
      return result;
    });
    countryNames = [].concat.apply([], countryNames);
    countryNames.sort(function (a, b) {
      return (a.premium < b.premium ? -1 : a.premium > b.premium ? 1 : (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
    });

    var connected = proxy.connected();
    var template = document.querySelector("#location-item");

    $(".b-location-wrapper").removeClass('b-location-wrapper__free')
      .removeClass('b-location-wrapper__premium')
      .addClass(account.premium ? 'b-location-wrapper__premium' : 'b-location-wrapper__free');

    choosers.empty();
    if (template) {
      $.each(countryNames, function (index, country) {
        var loc = $(".b-location", document.importNode(template.content, true));
        $('.b-country', loc).attr('src', 'assets/images/flags/' + country.code + '.png');
        $('.b-item-name', loc).text(country.name);
        loc.attr('data-country-code', country.code)
          .attr('data-premium', country.premium);

        updateLocation(loc, account, country.code, connected, country.premium);

        var chooser = country.premium ? $('.b-location-list[data-premium=true]') : $('.b-location-list[data-premium=false]');
        chooser.append(loc);
      });
    }
  });
}
function render(isConnected) {
  // location choosers: one for each location type (free/premium)
  var choosers = $('.b-location-list');
  bp.account.load(function(err, account) {
    if (err) {
      console.error(err);
      return;
    }

    var connected = proxy.connected();
    $('.b-location', choosers).each(function() {
      var loc = this;
      var countryCode = $(loc).data('country-code');
      var premium = $(loc).data('premium') || false;
      updateLocation(loc, account, countryCode, connected, premium);
    });
  });
}

function updateLocation(loc, account, countryCode, connected, premium) {
  $('.b-location--status', loc).removeClass('b-location--status__current b-location--status__premium b-location--status__change');

  if (connected === false) {
    if (premium <= !!account.premium) {
      $('.b-location--status', loc)
        .addClass('b-location--status__change')
        .text('Start');
      $(loc).addClass('js-change-location');
    } else {
      $('.b-location--status', loc)
        .addClass('b-location--status__premium')
        .text("Premium");
      $(loc).addClass('js-call-premium');
    }
  } else {
    if (countryCode == connected && premium == !!account.premium) {
      $('.b-location--status', loc)
        .addClass('b-location--status__current')
        .text("Current");
    } else if (premium <= !!account.premium) {
      $('.b-location--status', loc)
        .addClass('b-location--status__change')
        .text("Change");
      $(loc).addClass('js-change-location');
    } else {
      $('.b-location--status', loc)
        .addClass('b-location--status__premium')
        .text("Premium");
      $(loc).addClass('js-call-premium');
    }
  }
}

function countryNameByCode(countryCode) {
  var countryName = chrome.i18n.getMessage("country_name_" + countryCode.toUpperCase());
  if (countryName === "" || typeof countryName === 'undefined') {
    var locale = 'n/a';
    if (typeof chrome.i18n.getUILanguage === 'function') {
      locale = chrome.i18n.getUILanguage();
    }
    var version = 'n/a';
    if (chrome.runtime.getManifest()) {
      version = chrome.runtime.getManifest().version;
    }
    var message = "failed to look up country name for: " + countryCode + " with locale: " + locale + " at popup.js";
    console.warn(message);
    ga.trackEvent("error", version, message, 0, false);
    countryName = countryCode.toUpperCase() || 'N/A';
  }
  return countryName;
}

},{"../ga":7,"../server_list":11,"debounce":1,"jquery":"jquery","spin.js":3}],13:[function(require,module,exports){
var $ = require('jquery');
var config = require('./config');

var bp = chrome.extension.getBackgroundPage();
var browsec = bp.browsec;
var app = bp.app;

exports.init = function init() {
  if (config.auth.enabled) {
    $(".b-account").removeClass("b-account__guest b-account__user")
                   .addClass("b-account__progress");
    app.account.load(function(err, account) {
      if (err) {
        console.error("failed to load account", err);
        $(".b-account").removeClass("b-account__user b-account__progress").addClass("b-account__guest");
        return;
      }

      $(".b-account").removeClass("b-account__progress");

      render(account);

      $(".b-account--logout .js-logout").click(function() {
        $(".b-account").removeClass("b-account__user b-account__guest").addClass("b-account__progress");
        $(".b-account").removeClass("b-account__user b-account__progress").addClass("b-account__guest");
        browsec.deauthenticate(app.account.getCredentials(), function(err, result) {
          if (err) {
            console.error("deauthentication failed", err);
            // ensure that tokens/sessions have been deleted on the server,
            // otherwise ignore.
          }
        });
        bp.account.clear();
      });
    });

    bp.account.off('change', render);
    bp.account.on('change', render);
  } else {
  }
};

function render(account, oldAccount) {
  console.debug('render account:', account);
  if (account.guest) {
    $(".b-account").addClass("b-account__guest");
  } else {  
    var $email = $("[data-var='email']").first(),
        email = account.email || '';

    if (email.length > 20) { // truncate string to 18 chars + '...' if longer than 20 chars
      email = email.substr(0, 18) + '...';
    }
    
    $email.text(email);
    $email.attr("title", account.email);
    $(".b-account").addClass("b-account__user");
  }
}

function unload() {
  bp.account.off('change', render);
}
exports.unload = unload;

},{"./config":"./config","jquery":"jquery"}],14:[function(require,module,exports){
var $ = require('jquery');
var routes = require('../routes');
var ga = require('../ga');
var popup = require('../popup');

function findElements() {
  return {
    actionEl: {
      $premiumCall: $('.js-call-premium'),
      $cross: $('.js-close-popup'),
      $premiumLink: $('.js-premium-link'),
    },

    $popup: $('.b-premium-popup')
  };
}

var elements;

exports.init = function init() {
  elements = findElements();
  $("#main").off('click', '.js-call-premium');
  $("#main").on('click', '.js-call-premium', slidePopupDown);
  $('.b-holiday__link').attr('href', routes.premium_url);
  if (popup.is_christmas()) {
    $('.b-holiday .b-content__title').text('Christmas Sale');
  }

  elements.actionEl.$cross.on('click', slidePopupUp);
  elements.actionEl.$premiumLink.attr('href', routes.premium_url).attr('target', '_blank');
  elements.actionEl.$premiumLink.on('click', function() {
    ga.trackEvent("premium", "click");
  });

};

function slidePopupDown() {
  elements.$popup.addClass('b-premium-popup__view');
  ga.trackEvent("premium", "show");
}

function slidePopupUp() {
  elements.$popup.removeClass('b-premium-popup__view');
}

function clickPremiumBanner() {

}
},{"../ga":7,"../popup":9,"../routes":10,"jquery":"jquery"}],15:[function(require,module,exports){
var $ = require('jquery');

var ga = require('../ga');

var bp = chrome.extension.getBackgroundPage();
var proxy = bp.proxy;
var app = bp.app;

function init(doc) {
  doc = doc || document;
  $(".b-switch-input", doc).change(function () {
    app.setProxyEnabled( $(this).is(':checked') );
  });

  proxy.off("change", render);
  proxy.on("change", render);
}
exports.init = init;

exports.unload = function unload() {
  proxy.off('change', render);
}

function render(connected, doc) {
  doc = doc || document;
  if (!connected) {
    $(".b-switch-input", doc).each(function() { this.checked = false });

  } else {
    $(".b-switch-input", doc).each(function() { this.checked = true });

  }
}

exports.render = render;

},{"../ga":7,"jquery":"jquery"}],16:[function(require,module,exports){
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}


},{}],17:[function(require,module,exports){
var ga = require('../ga');

// Error handler
window.onerror = function (message, filename, lineno) {
  try {
    console.error("message: {0}\nfilename: {1}\nlineno: {2}".format(message, filename, lineno));

    var version = 'n/a';
    if (chrome.runtime.getManifest()) {
      version = chrome.runtime.getManifest().version;
    }
    ga.trackEvent("error", version, "{0} at {1}:{2}".format(message, filename, lineno), 0, false);

  } catch (e) {
    console.error(e);
  }

  return false;
};


},{"../ga":7}],18:[function(require,module,exports){
// Helper functions
function format(str, args) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    return format(this, arguments);
  };
}

module.exports = format;

},{}],19:[function(require,module,exports){
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
  };
}


},{}]},{},[9]);
