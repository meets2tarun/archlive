(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = cookie;
function cookie(name, value, options) {
  if (arguments.length < 2) return get(name);
  set(name, value, options);
}

function set(name, value) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var str = encode(name) + '=' + encode(value);

  if (value == null) options.maxage = -1;

  if (options.maxage) options.expires = new Date(+new Date() + options.maxage);

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

function get(name) {
  var cookies = parse(document.cookie);
  return !!name ? cookies[name] : cookies;
}

function parse(str) {
  var obj = {},
      pairs = str.split(/ *; */);

  if (!pairs[0]) return obj;

  for (var _iterator = pairs, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var pair = _ref;

    pair = pair.split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

function encode(value) {
  try {
    return encodeURIComponent(value);
  } catch (e) {
    return null;
  }
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return null;
  }
}
},{}],2:[function(require,module,exports){
"use strict";

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cookie_1 = require('@grammarly-npm/cookie');
var util_1 = require('./util');
var storageKeyName = 'gnar_containerId';
var storageTestKeyName = 'gnar_containerId_test';
var containerIdLength = 12;
// 10 years from now
var cookieExpiration = function cookieExpiration() {
    return new Date().setFullYear(new Date().getFullYear() + 10);
};
// 10 minutes from now
var testCookieExpiration = function testCookieExpiration() {
    return new Date().setMinutes(new Date().getMinutes() + 10);
};
var cookieDomainRegExp = /^\.\w+\.\w+/;
function success(value) {
    return {
        type: 'success',
        value: value
    };
}
function failure(error) {
    return {
        type: 'failure',
        error: error
    };
}
function lift(promise) {
    return promise.then(success, failure);
}
function retry(times, backoffMillis, f) {
    var res = f();
    if (times > 0) {
        return res.catch(function (_) {
            return new Promise(function (resolve, _) {
                return setTimeout(resolve, backoffMillis);
            }).then(function (_) {
                return retry(times - 1, backoffMillis, f);
            });
        });
    } else {
        return res;
    }
}
/**
 * To avoid concurrency issues (e.g. when get container id is fetched almost simultaneously)
 * and to reduce the rate with which we trigger expensive storage apis
 * the following logic is implemented:
 * - we cache and reuse the promise for asynchronous container id extraction while it get's executed
 * - we keep and reuse the completed promise for the timeout, configured separately
 * for success and failure
 */

var ContainerIdManager = function () {
    /**
     * @param primaryStorage storage that is used as a primary source of truth for getting
     * and storing containerId. Is required to be be able to get and set value successfully
     * for the whole manager to retrieve containerId successfully.
     * @param secondaryStorages backup storages from which we can recover containerId in case
     * primaryStorage was cleared.
     * @param _logger manager-specific logger
     * @param _metric manager-specific metrics
     * @param _cacheSuccessTimeoutMillis for how long to cache the successfully extracted containerId
     * (negative means 'cache forever')
     * @param _cacheFailureTimeoutMillis for how long to cache the failed containerId extraction
     * (negative means 'cache forever')
     * @param _getTime function that returns current time in millis
     * (default should be overloaded only in tests)
     */
    function ContainerIdManager(primaryStorage) {
        var secondaryStorages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var _logger = arguments[2];
        var _metric = arguments[3];

        var _cacheSuccessTimeoutMillis = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 300000;

        var _cacheFailureTimeoutMillis = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

        var _getTime = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : function () {
            return Date.now();
        };

        _classCallCheck(this, ContainerIdManager);

        this.primaryStorage = primaryStorage;
        this.secondaryStorages = secondaryStorages;
        this._logger = _logger;
        this._metric = _metric;
        this._cacheSuccessTimeoutMillis = _cacheSuccessTimeoutMillis;
        this._cacheFailureTimeoutMillis = _cacheFailureTimeoutMillis;
        this._getTime = _getTime;
        this._allStorages = [primaryStorage].concat(secondaryStorages);
    }

    ContainerIdManager.prototype._expireCache = function _expireCache(timeoutMillis) {
        if (timeoutMillis === 0) {
            this._cacheExpireTimestamp = 0;
        } else if (timeoutMillis > 0) {
            this._cacheExpireTimestamp = this._getTime() + timeoutMillis;
        }
        // don't expire cache at all if timeout is negative
    };
    /**
     * Returns a containerId promise. Clients should handle the case of failure gracefully
     * (without affecting user experience).
     */


    ContainerIdManager.prototype.getContainerId = function getContainerId() {
        var _this = this;

        if (this._cache !== undefined && (this._cacheExpireTimestamp === undefined || this._getTime() < this._cacheExpireTimestamp)) {
            return this._cache;
        }
        var timer = this._metric.getTimer('doGetContainerId.timer').start();
        var result = this._doGetContainerId();
        this._cache = result;
        this._cacheExpireTimestamp = undefined;
        result.then(function (_) {
            return _this._expireCache(_this._cacheSuccessTimeoutMillis);
        }, function (_) {
            return _this._expireCache(_this._cacheFailureTimeoutMillis);
        });
        result.then(function (_) {
            timer.stop();
            _this._metric.getCounter('doGetContainerId.success').increment();
        }, function (error) {
            timer.stop();
            _this._metric.getCounter('doGetContainerId.failure').increment();
            _this._logger.warn('doGetContainerId.failed', error);
        });
        return result;
    };

    ContainerIdManager._generateContainerId = function _generateContainerId() {
        return util_1.alphanumeric(containerIdLength);
    };
    /**
     * This method produces containerId based on the following logic:
     * - executes safeGetContainerId for all the storages, lifts and collects the promises
     * - if the primary storage (first in storages list) failed, failed promise is returned
     * - otherwise take the first successful non-empty container as a result candidate, if none
     * generate new
     * - spread the resulting value across all the storages that successfully returned
     * different or empty value
     * - if setting to primary storage was performed and failed return the failed promise
     * - otherwise return the successful promise with selected containerId
     */


    ContainerIdManager.prototype._doGetContainerId = function _doGetContainerId() {
        var _this2 = this;

        return Promise.all(this._allStorages.map(function (storage) {
            return lift(storage.safeGetContainerId());
        })).then(function (getResults) {
            var primaryGetResult = getResults[0];

            if (primaryGetResult.type === 'failure') {
                return Promise.reject('getting containerId from primary storage ' + ('\'' + _this2.primaryStorage.name + '\' has failed: ' + primaryGetResult.error));
            }
            // get the value from the first working non-empty storage
            var nonEmptyResult = getResults.find(function (result) {
                return result.type === 'success' && result.value !== undefined;
            });
            var recovered = primaryGetResult.type === 'success' && primaryGetResult.value === undefined && nonEmptyResult !== undefined;
            var containerId = void 0;
            var generated = false;
            if (nonEmptyResult === undefined) {
                containerId = ContainerIdManager._generateContainerId();
                generated = true;
            } else {
                containerId = nonEmptyResult.value;
            }
            // save it to every storage with different value (don't save to those that failed to get)
            var setPromises = getResults.map(function (result, index) {
                if (result.type === 'success' && result.value !== containerId) {
                    return lift(_this2._allStorages[index].safeSetContainerId(containerId));
                } else {
                    return Promise.resolve(success(undefined));
                }
            });
            // wait till all set's are done, return successfully if primary succeeded
            var result = Promise.all(setPromises).then(function (setResults) {
                // primary result will be first in set results only if we recovered value or generated new
                if (recovered || generated) {
                    var primarySetResult = setResults[0];

                    if (primarySetResult.type !== 'success') {
                        return Promise.reject('setting containerId to primary storage has failed: ' + primarySetResult.error);
                    }
                }
                return Promise.resolve(containerId);
            });
            result.then(function (_) {
                if (recovered) {
                    _this2._metric.getCounter('recovered').increment();
                } else if (generated) {
                    _this2._metric.getCounter('generated').increment();
                }
            });
            return result;
        });
    };

    return ContainerIdManager;
}();

exports.ContainerIdManager = ContainerIdManager;

var BaseStorage = function () {
    function BaseStorage(name) {
        _classCallCheck(this, BaseStorage);

        this.name = name;
    }

    BaseStorage.prototype.safeSetContainerId = function safeSetContainerId(containerId) {
        var _this3 = this;

        return this.ensureAvailable().then(function () {
            return _this3.setContainerId(containerId);
        });
    };

    BaseStorage.prototype.safeGetContainerId = function safeGetContainerId() {
        var _this4 = this;

        return this.ensureAvailable().then(function () {
            return _this4.getContainerId();
        }).then(function (cid) {
            return cid === '' ? undefined : cid;
        });
    };

    return BaseStorage;
}();

exports.BaseStorage = BaseStorage;
/**
 * Chrome cookie storage.
 * This storage doesn't respect user cookie settings.
 * It will work even if the user disabled cookies.
 */

var ChromeCookieStorage = function (_BaseStorage) {
    _inherits(ChromeCookieStorage, _BaseStorage);

    function ChromeCookieStorage(_url, _domain) {
        _classCallCheck(this, ChromeCookieStorage);

        var _this5 = _possibleConstructorReturn(this, _BaseStorage.call(this, 'chromeCookie'));

        _this5._url = _url;
        _this5._domain = _domain;
        if (!cookieDomainRegExp.test(_domain)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
        return _this5;
    }

    ChromeCookieStorage.prototype._hasRuntimeError = function _hasRuntimeError() {
        return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
    };

    ChromeCookieStorage.prototype.ensureAvailable = function ensureAvailable() {
        var _this6 = this;

        return retry(2, 1000, function () {
            return new Promise(function (resolve, reject) {
                var value = util_1.alphanumeric(10);
                try {
                    window.chrome.cookies.set({
                        name: storageTestKeyName,
                        value: value,
                        url: _this6._url,
                        domain: _this6._domain,
                        // chrome cookies API requires seconds in expiration date, not ms.
                        expirationDate: testCookieExpiration() / 1000
                    }, function (cookie) {
                        var error = _this6._hasRuntimeError();
                        if (!cookie && error) reject('chrome.cookie.set failed with an error: ' + error.message);
                        if (!cookie || cookie.value !== value) {
                            reject(new Error('ChromeCookieStorage is unavailable.\n              Availability test failed.\n              Tried to set ' + value + ', the result is ' + (cookie ? cookie.value : cookie) + '.'));
                        } else {
                            resolve();
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });
    };

    ChromeCookieStorage.prototype.getContainerId = function getContainerId() {
        var _this7 = this;

        return new Promise(function (resolve, reject) {
            try {
                window.chrome.cookies.get({
                    url: _this7._url,
                    name: storageKeyName
                }, function (cookie) {
                    var error = _this7._hasRuntimeError();
                    if (!cookie && error) reject('chrome.cookie.get failed with an error: ' + error.message);
                    resolve(cookie ? cookie.value : undefined);
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    ChromeCookieStorage.prototype.setContainerId = function setContainerId(containerId) {
        var _this8 = this;

        return new Promise(function (resolve, reject) {
            try {
                window.chrome.cookies.set({
                    name: storageKeyName,
                    value: containerId,
                    url: _this8._url,
                    domain: _this8._domain,
                    // chrome cookies API requires seconds in expiration date, not ms.
                    expirationDate: cookieExpiration() / 1000
                }, function (cookie) {
                    var error = _this8._hasRuntimeError();
                    if (!cookie && error) reject('chrome.cookie.set failed with an error: ' + error.message);
                    if (!cookie || cookie.value !== containerId) reject(new Error('setContainerId failed.\n            Tried to set ' + containerId + ', the result is ' + (cookie ? cookie.value : cookie) + '.'));
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    return ChromeCookieStorage;
}(BaseStorage);

exports.ChromeCookieStorage = ChromeCookieStorage;
/**
 * Web Extensions cookie storage.
 */

var WebExtensionsCookieStorage = function (_BaseStorage2) {
    _inherits(WebExtensionsCookieStorage, _BaseStorage2);

    function WebExtensionsCookieStorage(_url, _domain) {
        _classCallCheck(this, WebExtensionsCookieStorage);

        var _this9 = _possibleConstructorReturn(this, _BaseStorage2.call(this, 'webExtensionsCookie'));

        _this9._url = _url;
        _this9._domain = _domain;
        if (!cookieDomainRegExp.test(_domain)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
        return _this9;
    }

    WebExtensionsCookieStorage.prototype.ensureAvailable = function ensureAvailable() {
        var _this10 = this;

        return retry(2, 1000, function () {
            return new Promise(function (resolve, reject) {
                var value = util_1.alphanumeric(10);
                window.browser.cookies.set({
                    name: storageTestKeyName,
                    value: value,
                    url: _this10._url,
                    domain: _this10._domain,
                    // web extensions cookies API requires seconds in expiration date, not ms.
                    expirationDate: testCookieExpiration() / 1000
                }).then(function (cookie) {
                    if (!cookie || cookie.value !== value) {
                        reject(new Error('WebExtensionsCookieStorage is unavailable.\n            Availability test failed.\n            Tried to set ' + value + ', the result is ' + (cookie ? cookie.value : cookie) + '.'));
                    } else {
                        resolve();
                    }
                }).catch(function (error) {
                    reject('browser.cookies.set failed with an error: ' + error.message);
                });
            });
        });
    };

    WebExtensionsCookieStorage.prototype.getContainerId = function getContainerId() {
        var _this11 = this;

        return new Promise(function (resolve, reject) {
            window.browser.cookies.get({
                url: _this11._url,
                name: storageKeyName
            }).then(function (cookie) {
                resolve(cookie ? cookie.value : undefined);
            }).catch(function (error) {
                reject('browser.cookies.get failed with an error: ' + error.message);
            });
        });
    };

    WebExtensionsCookieStorage.prototype.setContainerId = function setContainerId(containerId) {
        var _this12 = this;

        return new Promise(function (resolve, reject) {
            window.browser.cookies.set({
                name: storageKeyName,
                value: containerId,
                url: _this12._url,
                domain: _this12._domain,
                // web extensions cookies API requires seconds in expiration date, not ms.
                expirationDate: cookieExpiration() / 1000
            }).then(function (cookie) {
                if (!cookie || cookie.value !== containerId) reject(new Error('setContainerId failed.\n          Tried to set ' + containerId + ', the result is ' + (cookie ? cookie.value : cookie) + '.'));
                resolve();
            }).catch(function (error) {
                reject('browser.cookies.set failed with an error: ' + error.message);
            });
        });
    };

    return WebExtensionsCookieStorage;
}(BaseStorage);

exports.WebExtensionsCookieStorage = WebExtensionsCookieStorage;

var LocalStorage = function (_BaseStorage3) {
    _inherits(LocalStorage, _BaseStorage3);

    function LocalStorage() {
        _classCallCheck(this, LocalStorage);

        return _possibleConstructorReturn(this, _BaseStorage3.call(this, 'localStorage'));
    }

    LocalStorage.prototype.ensureAvailable = function ensureAvailable() {
        var value = util_1.alphanumeric(10);
        return new Promise(function (resolve, reject) {
            localStorage.setItem(storageTestKeyName, value);
            if (localStorage.getItem(storageTestKeyName) !== value) {
                reject(new Error('LocalStorage is unavailable.\n          Availability test failed.\n          Tried to set ' + value + ', the result is ' + localStorage.getItem(storageTestKeyName) + '.'));
            } else {
                resolve();
            }
            localStorage.removeItem(storageTestKeyName);
        });
    };

    LocalStorage.prototype.getContainerId = function getContainerId() {
        // If there is no item in LocalStorage, `null` will be returned.
        // We need undefined in this case.
        var value = localStorage.getItem(storageKeyName);
        return new Promise(function (resolve, _) {
            return resolve(value === null ? undefined : value);
        });
    };

    LocalStorage.prototype.setContainerId = function setContainerId(containerId) {
        return new Promise(function (resolve, _) {
            localStorage.setItem(storageKeyName, containerId);
            resolve();
        });
    };

    return LocalStorage;
}(BaseStorage);

exports.LocalStorage = LocalStorage;

var CookieStorage = function (_BaseStorage4) {
    _inherits(CookieStorage, _BaseStorage4);

    function CookieStorage(_domain) {
        _classCallCheck(this, CookieStorage);

        var _this14 = _possibleConstructorReturn(this, _BaseStorage4.call(this, 'cookie'));

        _this14._domain = _domain;
        if (!cookieDomainRegExp.test(_domain)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
        return _this14;
    }

    CookieStorage.prototype._getCookieOptions = function _getCookieOptions() {
        return {
            path: '/',
            domain: this._domain,
            expires: new Date(cookieExpiration())
        };
    };

    CookieStorage.prototype.ensureAvailable = function ensureAvailable() {
        var value = util_1.alphanumeric(10);
        return new Promise(function (resolve, reject) {
            cookie_1.default(storageTestKeyName, value);
            if (cookie_1.default(storageTestKeyName) !== value) {
                reject(new Error('CookieStorage is unavailable.\n          Availability test failed.\n          Tried to set ' + value + ', the result is ' + cookie_1.default(storageTestKeyName) + '.'));
            } else {
                resolve();
            }
            // cleanup
            cookie_1.default(storageTestKeyName, null);
        });
    };

    CookieStorage.prototype.getContainerId = function getContainerId() {
        return new Promise(function (resolve, _) {
            return resolve(cookie_1.default(storageKeyName));
        });
    };

    CookieStorage.prototype.setContainerId = function setContainerId(containerId) {
        var _this15 = this;

        return new Promise(function (resolve, _) {
            cookie_1.default(storageKeyName, containerId, _this15._getCookieOptions());
            resolve();
        });
    };

    return CookieStorage;
}(BaseStorage);

exports.CookieStorage = CookieStorage;

var BackendStorage = function (_BaseStorage5) {
    _inherits(BackendStorage, _BaseStorage5);

    function BackendStorage(_fetch, _url) {
        _classCallCheck(this, BackendStorage);

        var _this16 = _possibleConstructorReturn(this, _BaseStorage5.call(this, 'backend'));

        _this16._fetch = _fetch;
        _this16._url = _url;
        _this16._keyName = storageKeyName;
        _this16._testKeyName = storageTestKeyName;
        _this16._baseUrl = _url + '/cookies';
        return _this16;
    }

    BackendStorage.prototype.ensureAvailable = function ensureAvailable() {
        var _this17 = this;

        var value = util_1.alphanumeric(10);
        var maxAge = (testCookieExpiration() - Date.now()) / 1000;
        var getUrl = this._baseUrl + '?name=' + this._testKeyName;
        var postUrl = getUrl + '&value=' + value + '&maxAge=' + maxAge;
        return this._doSend(postUrl, 'post').then(function (response) {
            if (!response.ok) {
                throw new Error('BackendStorage is unavailable.\n          Availability test failed.\n          Tried to set ' + value + '. Request failed.\n        ');
            }
        }).then(function () {
            return _this17._doSend(getUrl, 'get').then(function (response) {
                if (!response.ok) {
                    throw new Error('BackendStorage is unavailable.\n            Availability test failed.\n            Tried to get ' + _this17._testKeyName + ' from server. Request failed.');
                } else {
                    return response.json().then(function (obj) {
                        if (obj.value !== value) {
                            throw new Error('BackendStorage is unavailable.\n                Availability test failed.\n                Tried to get ' + _this17._testKeyName + ' from server.\n                Got ' + obj.value + ' instead of ' + value + '.');
                        }
                    });
                }
            });
        });
    };

    BackendStorage.prototype._doSend = function _doSend(url, method) {
        return this._fetch(url, {
            credentials: 'include',
            method: method
        });
    };

    BackendStorage.prototype.getContainerId = function getContainerId() {
        var url = this._baseUrl + '?name=' + this._keyName;
        return this._doSend(url, 'get').then(function (response) {
            return response.json();
        }).then(function (obj) {
            return obj.value;
        });
    };

    BackendStorage.prototype.setContainerId = function setContainerId(containerId) {
        var maxAge = (cookieExpiration() - Date.now()) / 1000;
        var url = this._baseUrl + '?name=' + this._keyName + '&value=' + containerId + '&maxAge=' + maxAge;
        return this._doSend(url, 'post').then(function () {});
    };

    return BackendStorage;
}(BaseStorage);

exports.BackendStorage = BackendStorage;

var MemoryStorage = function (_BaseStorage6) {
    _inherits(MemoryStorage, _BaseStorage6);

    function MemoryStorage() {
        var _value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        _classCallCheck(this, MemoryStorage);

        var _this18 = _possibleConstructorReturn(this, _BaseStorage6.call(this, 'memory'));

        _this18._value = _value;
        return _this18;
    }

    MemoryStorage.prototype.ensureAvailable = function ensureAvailable() {
        return Promise.resolve();
    };

    MemoryStorage.prototype.getContainerId = function getContainerId() {
        return Promise.resolve(this._value);
    };

    MemoryStorage.prototype.setContainerId = function setContainerId(containerId) {
        this._value = containerId;
        return Promise.resolve();
    };

    return MemoryStorage;
}(BaseStorage);

exports.MemoryStorage = MemoryStorage;


},{"./util":4,"@grammarly-npm/cookie":1}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util_1 = require('./util');
var container_id_manager_1 = require('./container_id_manager');
exports.ContainerIdManager = container_id_manager_1.ContainerIdManager;
exports.BaseStorage = container_id_manager_1.BaseStorage;
exports.MemoryStorage = container_id_manager_1.MemoryStorage;
exports.LocalStorage = container_id_manager_1.LocalStorage;
exports.CookieStorage = container_id_manager_1.CookieStorage;
exports.ChromeCookieStorage = container_id_manager_1.ChromeCookieStorage;
exports.WebExtensionsCookieStorage = container_id_manager_1.WebExtensionsCookieStorage;
exports.BackendStorage = container_id_manager_1.BackendStorage;
var reservedPropNames = ['eventName', 'client', 'clientVersion', 'userId', 'isTest', 'containerId', 'instanceId', 'batchId'];
var localStoragePingKeyName = 'gnar_nextPingTimestamp';
/**
 * GnarClient implementation.
 * Sends event to server, takes care of queueing, before setUser call,
 * and executing queue after setUser call.
 * Additionally has page and ping methods to track pings and pageviews
 */

var GnarClientImpl = function () {
    /**
     * @param _url gnar enpoint url, with protocol, host/port and no path
     * @param _client name of the client, will become a 'client' prop value in events
     * @param _clientVersion client version
     * @param _fetch
     * @param _containerIdManager
     * @param _logger gnar specific logger
     * @param _metric gnar specific metric
     * @param _storePingTimestamp whether ping throttling should be done based on timestamp
     * stored in local storage compared to just memory.
     */
    function GnarClientImpl(_url, _client, _clientVersion, _fetch, _containerIdManager, _logger, _metric) {
        var _storePingTimestamp = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

        _classCallCheck(this, GnarClientImpl);

        this._client = _client;
        this._clientVersion = _clientVersion;
        this._fetch = _fetch;
        this._containerIdManager = _containerIdManager;
        this._logger = _logger;
        this._metric = _metric;
        this._storePingTimestamp = _storePingTimestamp;
        this._batchId = 0;
        this._instanceId = util_1.alphanumeric(8);
        this._isReady = false;
        this._queue = [];
        this._eventsUrl = _url + '/events';
        this._pingMaybe();
    }

    GnarClientImpl.prototype.track = function track(eventName) {
        var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (eventName.indexOf(this._client + '/') === 0) {
            throw new Error('Event name ' + eventName + ' should not start with \'' + this._client + '/\'');
        }
        Object.keys(props).forEach(function (key) {
            if (reservedPropNames.indexOf(key) !== -1) {
                throw new Error('Event data should not contain \'' + key + '\' prop.');
            }
        });
        if (this._isReady) {
            /**
             * Each time event is sent try to ping.
             * Except when 'ping' event is sent itself.
             */
            if (eventName !== 'ping') this._pingMaybe();
            this._send(eventName, props);
        } else {
            this._enqueue(eventName, props);
        }
    };

    GnarClientImpl.prototype.setUser = function setUser(id, isTest) {
        if (id === null || id === '') {
            throw new Error('Invalid userId: ' + id);
        }
        /**
         * Send forced ping if userId was previously set, and it changed from
         * - authenticated to anonymous
         * - authenticated to authenticated
         * - anonymous to authenticated
         * but NOT
         * - anonymous to anonymous
         */
        var shouldSendPing = this._userId && this._userId !== id && !(/^-/.test(id) && /^-/.test(this._userId));
        this._isTest = isTest;
        this._userId = id;
        if (shouldSendPing) this._pingMaybe(true);
        if (!this._isReady) {
            this._execQueue();
            this._isReady = true;
        }
    };

    GnarClientImpl.prototype.getContainerId = function getContainerId() {
        return this._containerIdManager.getContainerId();
    };

    GnarClientImpl.prototype._setNextPingTimestamp = function _setNextPingTimestamp() {
        var ts = util_1.getNextPingDate();
        this._nextPingTimestamp = ts;
        if (this._storePingTimestamp) {
            try {
                localStorage.setItem(localStoragePingKeyName, ts.toString());
            } catch (error) {
                this._metric.getCounter('nextPingDate.write.failure').increment();
                this._logger.warn('nextPingDate.write.failed', error);
            }
        }
    };

    GnarClientImpl.prototype._getNextPingTimestamp = function _getNextPingTimestamp() {
        var ts = this._nextPingTimestamp;
        if (ts !== undefined || !this._storePingTimestamp) return ts;
        try {
            var stored = localStorage.getItem(localStoragePingKeyName);
            ts = stored === null ? undefined : parseInt(stored, 10);
        } catch (error) {
            ts = undefined;
            this._metric.getCounter('nextPingDate.read.failure').increment();
            this._logger.warn('nextPingDate.read.failed', error);
        }
        return ts;
    };

    GnarClientImpl.prototype._shouldPing = function _shouldPing(force) {
        if (force) {
            return true;
        } else {
            return this._getNextPingTimestamp() === undefined || this._getNextPingTimestamp() < Date.now();
        }
    };
    /**
     * Ping should be sent once a day.
     * Next pingDate is set to be random time at 3-4AM in the morning,
     * so that next day pings are sent when user wakes up.
     * Other ping attempts will be ignored.
     *
     * @param force - force-send a ping, and refresh nextPingDate
     */


    GnarClientImpl.prototype._pingMaybe = function _pingMaybe() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (!this._shouldPing(force)) return;
        this._setNextPingTimestamp();
        var props = {
            referrer: document.referrer,
            url: document.location.href,
            userAgent: navigator.userAgent,
            navigatorAppName: navigator.appName,
            navigatorAppCodeName: navigator.appCodeName,
            navigatorAppVersion: navigator.appVersion,
            navigatorVendor: navigator.vendor,
            screenWidth: screen.width,
            screenHeight: screen.height
        };
        this.track('ping', props);
    };

    GnarClientImpl.prototype.pingMaybe = function pingMaybe() {
        this._pingMaybe();
    };

    GnarClientImpl.prototype._enqueue = function _enqueue(eventName, props) {
        this._queue.push([eventName, props]);
    };

    GnarClientImpl.prototype._execQueue = function _execQueue() {
        var _this = this;

        this._queue.forEach(function (_ref) {
            var eventName = _ref[0],
                data = _ref[1];
            return _this._send(eventName, data);
        });
        this._queue = [];
    };

    GnarClientImpl.prototype._send = function _send(eventName, props) {
        var _this2 = this;

        var batchId = this._batchId++;
        this.getContainerId().then(function (containerId) {
            var event = {
                eventName: _this2._client + '/' + eventName,
                client: _this2._client,
                clientVersion: _this2._clientVersion,
                userId: _this2._userId,
                isTest: _this2._isTest,
                containerId: containerId,
                instanceId: _this2._instanceId,
                batchId: batchId
            };
            return _this2._doSend(event, props);
        }).catch(function (error) {
            _this2._metric.getCounter('send.failure').increment();
            _this2._logger.warn('send.failed', error);
        });
    };

    GnarClientImpl.prototype._doSend = function _doSend(data, props) {
        return this._fetch(this._eventsUrl, {
            mode: 'cors',
            credentials: 'include',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: [Object.assign(data, props)]
            })
        });
    };

    return GnarClientImpl;
}();

exports.GnarClientImpl = GnarClientImpl;


},{"./container_id_manager":2,"./util":4}],4:[function(require,module,exports){
"use strict";
/**
 * Generate random alphanumeric string of a given length
 */

var allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function alphanumeric(num) {
    var res = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    if (num <= 0) return res;
    var random = Math.floor(Math.random() * (allowed.length - 1));
    return alphanumeric(num - 1, res + allowed.charAt(random));
}
exports.alphanumeric = alphanumeric;
/**
 * Get random local time between 3-4AM next day
 * (or same day if it's less then two hrs since midnight)
 */
function getNextPingDate() {
    var now = new Date();
    if (now.getHours() > 2) {
        now.setDate(now.getDate() + 1);
    }
    now.setHours(3);
    now.setMinutes(Math.floor(Math.random() * 60));
    return now.getTime();
}
exports.getNextPingDate = getNextPingDate;


},{}],5:[function(require,module,exports){
"use strict";
var ring_buffer_1 = require("./ring_buffer");
/**
 *  Logs proxy that aggregates log entries in a cyclic buffer until trigger condition occurs.
 *  It reports the whole log afterwards to separate crash logger.
 *  Usage example:
 *
 *  let crashLoggerWrapper =
 *    new CrashLogWrapper(500, LogLevel.ERROR, plainSink, rootLogger.getLogger('crashLog'))
 *  let loggerImpl = new SimpleLogger(..., crashLoggerWrapper.sink)
 *
 */
var CrashLogWrapper = (function () {
    /**
     * @param cacheSize A maximum number of log entries to store
     * @param trigger A trigger function or minimal log level that will trigger crash log reporting
     * @param _eventsSink Log entries destination
     * @param _crashLogger Logger to report aggregated crash logs to.
     */
    function CrashLogWrapper(cacheSize, trigger, _eventsSink, _crashLogger) {
        var _this = this;
        this._eventsSink = _eventsSink;
        this._crashLogger = _crashLogger;
        this._crashLogged = false;
        /**
         * Sink to be used by clients to submit log entries
         */
        this.sink = function (event) {
            _this._buffer.push(event);
            _this._eventsSink(event);
            if (_this._trigger(event)) {
                _this._sendCrashLog(event);
            }
        };
        this._buffer = new ring_buffer_1.RingBuffer(cacheSize, true);
        this._trigger =
            typeof trigger === 'function'
                ? trigger
                : function (event) { return event.level >= trigger; };
    }
    CrashLogWrapper.prototype._sendCrashLog = function (triggeredBy) {
        if (!this._crashLogged || this._buffer.size > this._buffer.capacity / 2) {
            // we don't know exactly what events can be in the _buffer
            // that's why we need safe parsing for crash logs events
            // or we'll have possible get an error by converting circular structure to JSON
            var crashLog = void 0;
            try {
                crashLog = JSON.stringify(this._buffer, undefined, '');
            }
            catch (err) {
                // for fast fix we can just send this error like crashLog
                // better will be try to serialize events from buffer one by one
                crashLog = err;
            }
            this._crashLogger.log(triggeredBy.level, 'CrashLog', { events: crashLog, first: !this._crashLogged });
            this._crashLogged = true;
            // purge log, so we don't report it again
            this._buffer.clear();
        }
    };
    return CrashLogWrapper;
}());
exports.CrashLogWrapper = CrashLogWrapper;

},{"./ring_buffer":9}],6:[function(require,module,exports){
"use strict";
var Logging = require("./log4ts");
exports.Logging = Logging;
var LoggingImpl = require("./log4ts_impl");
exports.LoggingImpl = LoggingImpl;
var TimeSeries = require("./timeseries");
exports.TimeSeries = TimeSeries;
var TimeSeriesImpl = require("./timeseries_impl");
exports.TimeSeriesImpl = TimeSeriesImpl;
var utils_1 = require("./utils");
exports.EventProps = utils_1.EventProps;
var Monitoring;
(function (Monitoring) {
    var Logging = (function () {
        function Logging() {
        }
        Object.defineProperty(Logging, "root", {
            get: function () {
                return LoggingImpl.LoggingConfig.getRootLogger();
            },
            enumerable: true,
            configurable: true
        });
        Logging.getLogger = function (name, level) {
            return Logging.root.getLogger(name, level);
        };
        return Logging;
    }());
    Monitoring.Logging = Logging;
    var TimeSeries = (function () {
        function TimeSeries() {
        }
        Object.defineProperty(TimeSeries, "root", {
            get: function () {
                return TimeSeriesImpl.MetricsConfig.getRootMetric();
            },
            enumerable: true,
            configurable: true
        });
        return TimeSeries;
    }());
    Monitoring.TimeSeries = TimeSeries;
})(Monitoring = exports.Monitoring || (exports.Monitoring = {}));

},{"./log4ts":7,"./log4ts_impl":8,"./timeseries":10,"./timeseries_impl":11,"./utils":12}],7:[function(require,module,exports){
/*
 *  Simple Logging interface
 */
"use strict";
/**
 * Logging level is used to filter out certain logging event in a logging pipeline.
 * For this LogLevel of a message is compared against Logger's LogLevel level.
 */
var LogLevel;
(function (LogLevel) {
    /**
     * Finest grained logging, like entering/leaving a function, dumping objects values etc, can
     * produce a LOT of output
     */
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    /**
     * Debug information not needed in a production env. Mainly for troubleshooting
     */
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    /**
     * Useful information about app functioning such as application start, making some
     * transactional actions etc. Generally should be preserved in production
     */
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    /**
     * Warning on some potentially dangerous or problematic situation, like a successfully
     * handled error.
     */
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    /**
     * Non fatal error, which might lead to a problem but generally application should continue
     * to work.
     */
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    /** Fatal error meaning application cannot be used after it. */
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
    /** Logging is OFF */
    LogLevel[LogLevel["OFF"] = 6] = "OFF";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
(function (LogLevel) {
    /**
     * Create a LogLevel value from a log level string.
     */
    function fromString(levelString) {
        switch (levelString) {
            case 'TRACE': return LogLevel.TRACE;
            case 'DEBUG': return LogLevel.DEBUG;
            case 'INFO': return LogLevel.INFO;
            case 'WARN': return LogLevel.WARN;
            case 'ERROR': return LogLevel.ERROR;
            case 'FATAL': return LogLevel.FATAL;
            case 'OFF': return LogLevel.OFF;
            default:
                var _ = levelString;
                throw new TypeError("Unrecognized log level string '" + levelString + "'");
        }
    }
    LogLevel.fromString = fromString;
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

},{}],8:[function(require,module,exports){
"use strict";
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var log4ts_1 = require("./log4ts");
var utils_2 = require("./utils");
var crash_logger_1 = require("./crash_logger");
var ring_buffer_1 = require("./ring_buffer");
var TreeContext = (function () {
    function TreeContext(parent) {
        this.parent = parent;
        this.context = undefined;
    }
    TreeContext.prototype.get = function () {
        var parentContext = this.parent && this.parent.get();
        var context = this.context;
        return parentContext || context
            ? Object.assign({}, parentContext, context)
            : undefined;
    };
    TreeContext.prototype.add = function (ctx) {
        this.context = Object.assign({}, this.context, ctx);
    };
    TreeContext.prototype.remove = function (keys) {
        var _this = this;
        if (this.context) {
            keys.forEach(function (k) {
                if (k in _this.context)
                    delete _this.context[k];
            });
        }
    };
    TreeContext.prototype.clear = function () {
        this.context = undefined;
    };
    return TreeContext;
}());
exports.TreeContext = TreeContext;
/**
 * Helper that simplifies implementation of Logger interface
 */
var AbstractLogger = (function () {
    function AbstractLogger(name, level, context) {
        this.name = name;
        this.level = level;
        this.context = context;
        utils_1.validateName(name);
    }
    AbstractLogger.prototype.isEnabled = function (level) {
        return level >= this.level;
    };
    AbstractLogger.prototype.handler = function (message, extra) {
        var self = this;
        return {
            /* tslint:disable:semicolon */
            trace: function (error) { self.trace(message, error, extra); throw error; },
            debug: function (error) { self.debug(message, error, extra); throw error; },
            info: function (error) { self.info(message, error, extra); throw error; },
            warn: function (error) { self.warn(message, error, extra); throw error; },
            error: function (error) { self.error(message, error, extra); throw error; },
            fatal: function (error) { self.fatal(message, error, extra); throw error; }
        };
    };
    // Conventional methods for #log(event: LogLevel)
    AbstractLogger.prototype.trace = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.TRACE, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.debug = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.DEBUG, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.info = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.INFO, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.warn = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.WARN, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.error = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.ERROR, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.fatal = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.FATAL, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.log = function (level, message, exceptionOrExtra, extra) {
        if (this.isEnabled(level)) {
            if (exceptionOrExtra && extra || utils_2.isErrorLike(exceptionOrExtra)) {
                this.logImpl(level, message, exceptionOrExtra, extra);
            }
            else {
                this.logImpl(level, message, undefined, extra || exceptionOrExtra);
            }
        }
    };
    return AbstractLogger;
}());
exports.AbstractLogger = AbstractLogger;
/**
 * Incapsulated info about logging event, suitable for passing around or storing in LocalStorage
 */
var LogEvent = (function () {
    /**
     * @param timestamp time since Epoch in SECONDS
     */
    function LogEvent(level, message, logger, timestamp, exception, extra, context) {
        this.level = level;
        this.message = message;
        this.logger = logger;
        this.timestamp = timestamp;
        this.exception = exception;
        this.extra = extra;
        this.context = context;
    }
    return LogEvent;
}());
exports.LogEvent = LogEvent;
/**
 * Logger that simply creates a LogEvent and sends it to an appender.
 */
var SimpleLogger = (function (_super) {
    tslib_1.__extends(SimpleLogger, _super);
    /**
     * @param appender a function to handle logging events
     */
    function SimpleLogger(name, level, appender, context) {
        var _this = _super.call(this, name, level, context || new TreeContext()) || this;
        _this.appender = appender;
        return _this;
    }
    SimpleLogger.prototype.getLogger = function (name, level) {
        return new SimpleLogger(this.name + '.' + name, level || this.level, this.appender, new TreeContext(this.context));
    };
    SimpleLogger.prototype.logImpl = function (level, message, exception, extra) {
        var event = new LogEvent(level, message, this.name, Date.now(), exception, extra, this.context.get());
        try {
            this.appender(event);
        }
        catch (exception) {
            console.error('Failed processing log event', exception);
            try {
                ConsoleLogger.printToConsole(event);
            }
            catch (e) {
                console.error('No luck. Can\'t print the event', e);
            }
        }
    };
    return SimpleLogger;
}(AbstractLogger));
exports.SimpleLogger = SimpleLogger;
var ConsoleLogger = (function (_super) {
    tslib_1.__extends(ConsoleLogger, _super);
    function ConsoleLogger(name, level, context) {
        return _super.call(this, name, level, ConsoleLogger.printToConsole, context) || this;
    }
    ConsoleLogger.printToConsole = function (event) {
        var log = console.log;
        if (event.level <= log4ts_1.LogLevel.TRACE) {
            log = console.trace || console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.DEBUG) {
            log = console.debug || console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.INFO) {
            log = console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.WARN) {
            log = console.warn;
        }
        else {
            log = console.error;
        }
        log.apply(console, ["[" + event.logger + "]: " + log4ts_1.LogLevel[event.level] + " : " + event.message,
            event.exception,
            event.extra].filter(function (x) { return !!x; }));
    };
    return ConsoleLogger;
}(SimpleLogger));
exports.ConsoleLogger = ConsoleLogger;
var DefaultLogAppender = (function () {
    function DefaultLogAppender() {
    }
    DefaultLogAppender.createRootLogger = function (name, appendLevel, appender, crashAppender, copyToConsole) {
        if (copyToConsole === void 0) { copyToConsole = false; }
        var defaultSink = function (event) {
            if (event.level >= appendLevel) {
                if (copyToConsole) {
                    ConsoleLogger.printToConsole(event);
                }
                appender.append(event).catch(DefaultLogAppender._onError);
            }
        };
        var rootLoggerContext = new TreeContext();
        var sink = defaultSink;
        if (crashAppender) {
            var crashLogger = new SimpleLogger(name + '.crashLogs', log4ts_1.LogLevel.TRACE, function (event) { crashAppender.append(event).catch(DefaultLogAppender._onError); }, new TreeContext(rootLoggerContext));
            var crashLoggerWrapper = new crash_logger_1.CrashLogWrapper(500, log4ts_1.LogLevel.ERROR, defaultSink, crashLogger);
            sink = crashLoggerWrapper.sink;
        }
        return new SimpleLogger(name, appendLevel, sink, rootLoggerContext);
    };
    return DefaultLogAppender;
}());
DefaultLogAppender._onError = function (error) {
    return ConsoleLogger.printToConsole(new LogEvent(log4ts_1.LogLevel.WARN, 'Error while logging message to the server.', 'Fallback', 0, undefined, error));
};
exports.DefaultLogAppender = DefaultLogAppender;
var QItem = (function () {
    function QItem(event) {
        var _this = this;
        this.event = event;
        this.promise = new Promise(function (resolve, __reject) { _this.resolve = resolve; })
            .then(function () { });
    }
    return QItem;
}());
var DEFAULT_LOG_QUEUE_SIZE = 300;
var DEFAULT_RETRY_INTERVAL = 10 * 1000; // milliseconds
var LogQueue = (function () {
    function LogQueue(_sink, size, _retryInterval) {
        if (size === void 0) { size = DEFAULT_LOG_QUEUE_SIZE; }
        if (_retryInterval === void 0) { _retryInterval = DEFAULT_RETRY_INTERVAL; }
        this._sink = _sink;
        this._retryInterval = _retryInterval;
        this._currentItem = null;
        this._skippedCounter = null;
        this._buffer = new ring_buffer_1.RingBuffer(size, false);
    }
    LogQueue.prototype.append = function (event) {
        if (!this._buffer.isFull) {
            var item = new QItem(event);
            this._buffer.push(item);
            this._doAppend();
            return item.promise;
        }
        else {
            this._incSkippedCounter();
            return Promise.reject(new Error('Outgoing message buffer is full'));
        }
    };
    LogQueue.prototype._incSkippedCounter = function () {
        if (!this._skippedCounter) {
            // Creating event now to perserve timestamp
            this._skippedCounter = new LogEvent(log4ts_1.LogLevel.WARN, 'Messages was skipped due to buffer overflow', 'log4ts_impl.LogQueue', Date.now(), undefined, { count: 0 });
        }
        this._skippedCounter.extra.count++;
    };
    LogQueue.prototype._doAppend = function () {
        var _this = this;
        if (this._buffer.isEmpty || this._currentItem)
            return;
        var item = this._buffer.first;
        var sinkPromise = this._sink.append(item.event);
        this._currentItem = item;
        // we don't ever reject returned promises, TODO: check if its OK
        sinkPromise
            .then(function () {
            item.resolve();
            var i = _this._buffer.pop();
            if (i !== item && i === _this._currentItem) {
                throw new Error('Illegal state');
            }
            _this._currentItem = null;
            if (_this._skippedCounter) {
                _this.append(_this._skippedCounter);
                _this._skippedCounter = null;
            }
            _this._doAppend();
        })
            .catch(function (__error) { _this._retryAppend(item); });
    };
    LogQueue.prototype._retryAppend = function (item) {
        var _this = this;
        // We don't employ a complex wait strategy here because we want to deliver logs ASAP and don't
        // want to ddos monitoring on the other hand, so just wait some time and retry
        setTimeout(function () {
            // Incrementing retries count for every retry
            var extra = item.event.extra || {};
            if (!extra.appendRetries) {
                extra = item.event.extra = Object.assign({ appendRetries: 1 }, extra);
            }
            ++extra.appendRetries;
            _this._currentItem = null;
            _this._doAppend();
        }, this._retryInterval);
    };
    return LogQueue;
}());
exports.LogQueue = LogQueue;
var DummyFelogClient = (function () {
    function DummyFelogClient() {
    }
    DummyFelogClient.prototype.append = function (_1) {
        return Promise.resolve();
    };
    return DummyFelogClient;
}());
exports.DummyFelogClient = DummyFelogClient;
var FelogClientBase = (function () {
    function FelogClientBase(_appName, _appVersion, _env, _fetch) {
        this._appName = _appName;
        this._appVersion = _appVersion;
        this._env = _env;
        this._fetch = _fetch;
    }
    FelogClientBase.prototype.append = function (event) {
        return this._fetch(this._prepareData(event));
    };
    // To avoid iterating over the string or array
    FelogClientBase.prototype._toObject = function (obj) {
        if (obj === undefined || obj === null || (obj instanceof Object && !Array.isArray(obj))) {
            return obj;
        }
        return { extra: obj };
    };
    FelogClientBase.prototype._parseException = function (ex) {
        if (ex) {
            var _a = this._toObject(ex), _b = _a.name, name_1 = _b === void 0 ? 'UnknownError' : _b, _c = _a.message, message = _c === void 0 ? 'Unknown error message' : _c, stack = _a.stack, exceptionDetails = tslib_1.__rest(_a, ["name", "message", "stack"]);
            return {
                exceptionPart: { exception: { name: name_1, message: message, stack: stack } },
                exceptionDetailsPart: Object.keys(exceptionDetails).length > 0 && { exceptionDetails: exceptionDetails }
            };
        }
        else {
            return { exceptionPart: {}, exceptionDetailsPart: {} };
        }
    };
    FelogClientBase.prototype._prepareData = function (event) {
        var contextPart = event.context ? { context: event.context } : {};
        var _a = this._parseException(event.exception), exceptionPart = _a.exceptionPart, exceptionDetailsPart = _a.exceptionDetailsPart;
        var details = JSON.stringify(Object.assign({}, exceptionDetailsPart, this._toObject(event.extra)));
        var data = Object.assign({
            message: event.message,
            logger: event.logger,
            level: log4ts_1.LogLevel[event.level],
            application: this._appName,
            version: this._appVersion,
            env: this._env
        }, contextPart, exceptionPart, details !== '{}' && { details: details });
        // TODO: make use of timestamp
        return JSON.stringify(data, null, '');
    };
    return FelogClientBase;
}());
exports.FelogClientBase = FelogClientBase;
var PostFelogClient = (function (_super) {
    tslib_1.__extends(PostFelogClient, _super);
    function PostFelogClient(url, appName, appVersion, env, fetch) {
        return _super.call(this, appName, appVersion, env, function (body) {
            return fetch(url, {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            })
                .then(function () { });
        }) || this;
    }
    return PostFelogClient;
}(FelogClientBase));
exports.PostFelogClient = PostFelogClient;
var GetFelogClient = (function (_super) {
    tslib_1.__extends(GetFelogClient, _super);
    function GetFelogClient(url, appName, appVersion, env, fetch) {
        var _this = this;
        var baseUrl = url + "/log?json=";
        _this = _super.call(this, appName, appVersion, env, function (data) {
            return fetch(baseUrl + encodeURIComponent(data), { mode: 'no-cors', method: 'get', cache: 'no-cache' })
                .then(function () { });
        }) || this;
        return _this;
    }
    return GetFelogClient;
}(FelogClientBase));
exports.GetFelogClient = GetFelogClient;
/**
 * Use this class to configure global logger accessible through Monitoring.Logging.root
 */
var LoggingConfig = (function () {
    function LoggingConfig() {
    }
    LoggingConfig.getRootLogger = function () {
        if (!LoggingConfig._rootLogger) {
            LoggingConfig._rootLogger = LoggingConfig._createDefaultRootLogger();
            LoggingConfig._rootLogger.warn('Using DEFAULT root logger');
        }
        return LoggingConfig._rootLogger;
    };
    LoggingConfig.configure = function (rootLogger) {
        LoggingConfig._rootLogger = rootLogger;
        LoggingConfig._rootLogger.debug('ROOT logger changed', rootLogger);
    };
    LoggingConfig._createDefaultRootLogger = function () {
        return new ConsoleLogger('DEFAULT', log4ts_1.LogLevel.DEBUG);
    };
    return LoggingConfig;
}());
exports.LoggingConfig = LoggingConfig;

},{"./crash_logger":5,"./log4ts":7,"./ring_buffer":9,"./utils":12,"tslib":"tslib"}],9:[function(require,module,exports){
"use strict";
/**
 * Simple FIFO/ring buffer implementation using fixed size array.
 */
var RingBuffer = (function () {
    function RingBuffer(
        /** Buffer maximum capacity */
        capacity, 
        /** Should pushing to the full buffer overwrite older elements or throw an exception */
        allowOverflow) {
        if (allowOverflow === void 0) { allowOverflow = false; }
        this.capacity = capacity;
        this.allowOverflow = allowOverflow;
        /** Index of the first element */
        this._start = 0;
        /** Index _next_ to the last element */
        this._end = 0;
        /** Flag to distinguish between full end empty buffer, in both cases _start == _end */
        this._isFull = false;
        this.toJSON = this.toArray;
        if (capacity <= 0)
            throw new Error('Invalid capacity ' + capacity);
        this._buffer = new Array(capacity);
    }
    Object.defineProperty(RingBuffer.prototype, "size", {
        /** Count of elements currently in the buffer */
        get: function () {
            return this._isFull ?
                this._buffer.length
                : ((this._end - this._start) + this._buffer.length) % this._buffer.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "isEmpty", {
        get: function () {
            return this.size === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "isFull", {
        get: function () {
            return this._isFull;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds element to the buffer
     * @throws Error('Buffer is full') if buffer is full and overflow is not allowed
     */
    RingBuffer.prototype.push = function (element) {
        if (this.isFull) {
            if (this.allowOverflow) {
                // incrementing start, then end, effectively overwriting the oldest element in the buffer
                ++this._start;
                if (this._start === this.capacity) {
                    this._start = 0;
                }
            }
            else {
                throw new Error('Buffer is full');
            }
        }
        this._buffer[this._end++] = element;
        if (this._end === this.capacity) {
            this._end = 0;
        }
        if (this._start === this._end) {
            this._isFull = true;
        }
    };
    /**
     * Extracts element from the buffer,
     * @returns an element deleted or undefined if buffer is empty
     */
    RingBuffer.prototype.pop = function () {
        if (this.isEmpty)
            return undefined;
        var t = this._buffer[this._start];
        this._buffer[this._start] = undefined; // free memory
        this._start++;
        if (this._start === this.capacity) {
            this._start = 0;
        }
        this._isFull = false;
        return t;
    };
    Object.defineProperty(RingBuffer.prototype, "first", {
        get: function () {
            return this.isEmpty ? undefined : this._buffer[this._start];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "last", {
        get: function () {
            return this.isEmpty ?
                undefined
                : this._buffer[(this._end === 0 ? this.capacity - 1 : this._end - 1)];
        },
        enumerable: true,
        configurable: true
    });
    /** Clears buffer content */
    RingBuffer.prototype.clear = function () {
        this._buffer = new Array(this.capacity);
        this._start = this._end = 0;
        this._isFull = false;
    };
    /**
     * @return array with the buffer elements in expected order,
     * size of resulting array is in [0, capacity]
     */
    RingBuffer.prototype.toArray = function () {
        var res;
        if (this.isEmpty) {
            res = new Array(0);
        }
        else if (this._start < this._end) {
            res = this._buffer.slice(this._start, this._end);
        }
        else {
            res = new Array(this.size);
            var j = 0;
            for (var i = this._start; i < this.capacity; ++i, ++j) {
                res[j] = this._buffer[i];
            }
            for (var i = 0; i < this._end; ++i, ++j) {
                res[j] = this._buffer[i];
            }
        }
        return res;
    };
    return RingBuffer;
}());
exports.RingBuffer = RingBuffer;

},{}],10:[function(require,module,exports){
"use strict";

},{}],11:[function(require,module,exports){
"use strict";
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var AbstractMetricsStorage = (function () {
    function AbstractMetricsStorage(name, timersSink, countersSink) {
        this.name = name;
        this.timersSink = timersSink;
        this.countersSink = countersSink;
        utils_1.validateName(name);
    }
    AbstractMetricsStorage.prototype.getMetric = function (name) {
        return this._createChild(name);
    };
    AbstractMetricsStorage.prototype.getTimer = function (name) {
        return this._createChild(name);
    };
    AbstractMetricsStorage.prototype.getCounter = function (name) {
        return this._createChild(name);
    };
    Object.defineProperty(AbstractMetricsStorage.prototype, "parent", {
        get: function () {
            var dot = this.name.lastIndexOf('.');
            var name = this.name.substring(0, dot === -1 ? 0 : dot);
            return name === ''
                ? undefined
                : new AbstractMetricsStorage(name, this.timersSink, this.countersSink);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractMetricsStorage.prototype, "root", {
        get: function () {
            var dot = this.name.indexOf('.');
            var name = this.name.substring(0, dot === -1 ? 0 : dot);
            return name === ''
                ? this
                : new AbstractMetricsStorage(name, this.timersSink, this.countersSink);
        },
        enumerable: true,
        configurable: true
    });
    AbstractMetricsStorage.prototype._createName = function (name) {
        return this.name + '.' + name;
    };
    AbstractMetricsStorage.prototype.start = function () {
        var start = Date.now();
        var self = this;
        return {
            stop: function () {
                self.recordTime(Date.now() - start);
            }
        };
    };
    AbstractMetricsStorage.prototype.recordTime = function (time) {
        this.timersSink(this.name, time);
    };
    AbstractMetricsStorage.prototype.timing = function (fn) {
        var tn = this.start();
        try {
            return fn();
        }
        finally {
            try {
                tn.stop();
            }
            catch (e) {
            }
        }
    };
    AbstractMetricsStorage.prototype.increment = function (step) {
        if (step === void 0) { step = 1; }
        this.countersSink(this.name, step);
    };
    AbstractMetricsStorage.prototype.decrement = function (step) {
        if (step === void 0) { step = 1; }
        this.increment(-step);
    };
    AbstractMetricsStorage.prototype._createChild = function (name) {
        return new AbstractMetricsStorage(this._createName(name), this.timersSink, this.countersSink);
    };
    return AbstractMetricsStorage;
}());
exports.AbstractMetricsStorage = AbstractMetricsStorage;
/**
 * Utility class to simply display received metrics to console.
 * Usage:
 *  const mp = new MetricsPrinter(console.log)
 *
 *  mp.getCounter('counter').increment()
 */
var MetricsPrinter = (function (_super) {
    tslib_1.__extends(MetricsPrinter, _super);
    function MetricsPrinter(fn) {
        return _super.call(this, 'MP', function (name, value) { return fn('TIMER: ' + name + ' = ' + value); }, function (name, value) { return fn('COUNTER: ' + name + ' = ' + value); }) || this;
    }
    return MetricsPrinter;
}(AbstractMetricsStorage));
exports.MetricsPrinter = MetricsPrinter;
var DEFAULT_SEND_TIMEOUT_MS = 5000;
var MetricsStorage = (function (_super) {
    tslib_1.__extends(MetricsStorage, _super);
    function MetricsStorage(name, baseUrl, _fetch, _sendTimeout) {
        if (_sendTimeout === void 0) { _sendTimeout = DEFAULT_SEND_TIMEOUT_MS; }
        var _this = _super.call(this, name, function (n, v) { return _this._reportMetric('t.', n, v); }, function (n, v) { return _this._reportMetric('c.', n, v); }) || this;
        _this._fetch = _fetch;
        _this._sendTimeout = _sendTimeout;
        _this._dataBuffer = new Array();
        _this._sendTimer = undefined;
        _this._sendData = function () {
            var url = _this._baseUrl + _this._dataBuffer.join('&');
            _this._dataBuffer.length = 0;
            _this._sendTimer = undefined;
            _this._fetch(url, { mode: 'no-cors', cache: 'no-cache' }).catch(function (err) {
                console.warn('Cannot send monitoring data', err);
            });
        };
        _this._baseUrl = baseUrl + '/ts?';
        return _this;
    }
    MetricsStorage.createRoot = function (name, baseUrl, fetch) {
        return new MetricsStorage(name, baseUrl, fetch);
    };
    MetricsStorage.prototype._reportMetric = function (prefix, name, value) {
        this._dataBuffer.push(prefix + name + '=' + value);
        if (!this._sendTimer) {
            this._sendTimer = setTimeout(this._sendData, this._sendTimeout);
        }
    };
    return MetricsStorage;
}(AbstractMetricsStorage));
exports.MetricsStorage = MetricsStorage;
var MetricsConfig = (function () {
    function MetricsConfig() {
    }
    MetricsConfig.getRootMetric = function () {
        if (!MetricsConfig._metricsRoot) {
            console.warn('[WARNING] Using default timeseries implementation.');
            MetricsConfig._metricsRoot = new MetricsPrinter(console.log);
        }
        return MetricsConfig._metricsRoot;
    };
    MetricsConfig.configure = function (root) {
        MetricsConfig._metricsRoot = root;
    };
    return MetricsConfig;
}());
exports.MetricsConfig = MetricsConfig;

},{"./utils":12,"tslib":"tslib"}],12:[function(require,module,exports){
"use strict";
function isErrorLike(error) {
    var errorLike = error;
    return errorLike && (errorLike.message !== undefined && errorLike.name !== undefined
        || errorLike.stack !== undefined);
}
exports.isErrorLike = isErrorLike;
var EventProps;
(function (EventProps) {
    /**
     * Convert an object of type any to EventProps. Remove cyclic dependencies
     * Built-in objects (Boolean, Number, String, Date, RegExp) convert to string
     * Get all non-enumerable props of ErrorLike objects
     */
    function fromAny(obj) {
        return fromAnyInternal(obj, [obj], isErrorLike(obj));
    }
    EventProps.fromAny = fromAny;
    function fromAnyInternal(obj, refs, searchNonEnumerable) {
        if (!obj)
            return {};
        var res = {};
        var getKeys = searchNonEnumerable
            ? Object.getOwnPropertyNames
            : Object.keys;
        getKeys(obj).forEach(function (key) {
            var v = obj[key];
            if (v === null || v === undefined
                || typeof v === 'number'
                || typeof v === 'string'
                || typeof v === 'boolean') {
                res[key] = v;
            }
            else if (typeof v === 'object') {
                if (v instanceof Boolean || v instanceof Number || v instanceof String
                    || v instanceof Date || v instanceof RegExp) {
                    res[key] = v.toString();
                }
                else if (refs.indexOf(v) === -1) {
                    refs.push(v);
                    var newObj = fromAnyInternal(v, refs, isErrorLike(v));
                    if (Object.keys(newObj).length > 0)
                        res[key] = newObj;
                }
            }
        });
        return res;
    }
})(EventProps = exports.EventProps || (exports.EventProps = {}));
var nameRegexp = /^(?!\.[\w])[\w.]*\w$/;
function validateName(name) {
    if (name === '')
        throw new Error('Empty name');
    if (!nameRegexp.test(name))
        throw new Error("Invalid name: " + name + ". " +
            'Should be hierarchical dot separated string and may contain only word characters)');
}
exports.validateName = validateName;

},{}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":39}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":40}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":41}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":42}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":43}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":44}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":45}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-symbols"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-symbols":46}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":47}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":48}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":49}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":50}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":51}],26:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":52}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":19}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};
},{"../core-js/object/define-property":19}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _assign = require("../core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _assign2.default || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};
},{"../core-js/object/assign":17}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":18,"../core-js/object/set-prototype-of":23,"../helpers/typeof":35}],32:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":35}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = require("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
},{"../core-js/get-iterator":14,"../core-js/is-iterable":15}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _from = require("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":13}],35:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":25,"../core-js/symbol/iterator":26}],36:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

}).call(this,typeof window !== "undefined" ? window : {})
},{"./runtime":37}],37:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof window !== "undefined" ? window : {})
},{"_process":143}],38:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":36}],39:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":60,"../../modules/es6.array.from":128,"../../modules/es6.string.iterator":138}],40:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":126,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":142}],41:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":127,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":142}],42:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":60}],43:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":60,"../../modules/es6.object.assign":130}],44:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":60,"../../modules/es6.object.create":131}],45:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":60,"../../modules/es6.object.define-property":132}],46:[function(require,module,exports){
require('../../modules/es6.symbol');
module.exports = require('../../modules/_core').Object.getOwnPropertySymbols;
},{"../../modules/_core":60,"../../modules/es6.symbol":139}],47:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":60,"../../modules/es6.object.get-prototype-of":133}],48:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":60,"../../modules/es6.object.keys":134}],49:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":60,"../../modules/es6.object.set-prototype-of":135}],50:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":60,"../modules/es6.object.to-string":136,"../modules/es6.promise":137,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":142}],51:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":60,"../../modules/es6.object.to-string":136,"../../modules/es6.symbol":139,"../../modules/es7.symbol.async-iterator":140,"../../modules/es7.symbol.observable":141}],52:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":123,"../../modules/es6.string.iterator":138,"../../modules/web.dom.iterable":142}],53:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],54:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],55:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],56:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":80}],57:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":115,"./_to-iobject":117,"./_to-length":118}],58:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":59,"./_wks":124}],59:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],60:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],61:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":93,"./_property-desc":104}],62:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":53}],63:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],64:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":69}],65:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":71,"./_is-object":80}],66:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],67:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":98,"./_object-keys":101,"./_object-pie":102}],68:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":60,"./_ctx":62,"./_global":71,"./_hide":73}],69:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],70:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":56,"./_ctx":62,"./_is-array-iter":78,"./_iter-call":81,"./_to-length":118,"./core.get-iterator-method":125}],71:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],72:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],73:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":64,"./_object-dp":93,"./_property-desc":104}],74:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":71}],75:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":64,"./_dom-create":65,"./_fails":69}],76:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],77:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":59}],78:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":86,"./_wks":124}],79:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":59}],80:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],81:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":56}],82:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":73,"./_object-create":92,"./_property-desc":104,"./_set-to-string-tag":109,"./_wks":124}],83:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":68,"./_has":72,"./_hide":73,"./_iter-create":82,"./_iterators":86,"./_library":88,"./_object-gpo":99,"./_redefine":106,"./_set-to-string-tag":109,"./_wks":124}],84:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":124}],85:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],86:[function(require,module,exports){
module.exports = {};
},{}],87:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":101,"./_to-iobject":117}],88:[function(require,module,exports){
module.exports = true;
},{}],89:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":69,"./_has":72,"./_is-object":80,"./_object-dp":93,"./_uid":121}],90:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":59,"./_global":71,"./_task":114}],91:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":69,"./_iobject":77,"./_object-gops":98,"./_object-keys":101,"./_object-pie":102,"./_to-object":119}],92:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":56,"./_dom-create":65,"./_enum-bug-keys":66,"./_html":74,"./_object-dps":94,"./_shared-key":110}],93:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":56,"./_descriptors":64,"./_ie8-dom-define":75,"./_to-primitive":120}],94:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":56,"./_descriptors":64,"./_object-dp":93,"./_object-keys":101}],95:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":64,"./_has":72,"./_ie8-dom-define":75,"./_object-pie":102,"./_property-desc":104,"./_to-iobject":117,"./_to-primitive":120}],96:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":97,"./_to-iobject":117}],97:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":66,"./_object-keys-internal":100}],98:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],99:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":72,"./_shared-key":110,"./_to-object":119}],100:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":57,"./_has":72,"./_shared-key":110,"./_to-iobject":117}],101:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":66,"./_object-keys-internal":100}],102:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],103:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":60,"./_export":68,"./_fails":69}],104:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],105:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":73}],106:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":73}],107:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":56,"./_ctx":62,"./_is-object":80,"./_object-gopd":95}],108:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":60,"./_descriptors":64,"./_global":71,"./_object-dp":93,"./_wks":124}],109:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":72,"./_object-dp":93,"./_wks":124}],110:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":111,"./_uid":121}],111:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":71}],112:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":53,"./_an-object":56,"./_wks":124}],113:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":63,"./_to-integer":116}],114:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":59,"./_ctx":62,"./_dom-create":65,"./_global":71,"./_html":74,"./_invoke":76}],115:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":116}],116:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],117:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":63,"./_iobject":77}],118:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":116}],119:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":63}],120:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":80}],121:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],122:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":60,"./_global":71,"./_library":88,"./_object-dp":93,"./_wks-ext":123}],123:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":124}],124:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":71,"./_shared":111,"./_uid":121}],125:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":58,"./_core":60,"./_iterators":86,"./_wks":124}],126:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":56,"./_core":60,"./core.get-iterator-method":125}],127:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./_classof":58,"./_core":60,"./_iterators":86,"./_wks":124}],128:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":61,"./_ctx":62,"./_export":68,"./_is-array-iter":78,"./_iter-call":81,"./_iter-detect":84,"./_to-length":118,"./_to-object":119,"./core.get-iterator-method":125}],129:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":54,"./_iter-define":83,"./_iter-step":85,"./_iterators":86,"./_to-iobject":117}],130:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":68,"./_object-assign":91}],131:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":68,"./_object-create":92}],132:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":64,"./_export":68,"./_object-dp":93}],133:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":99,"./_object-sap":103,"./_to-object":119}],134:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":101,"./_object-sap":103,"./_to-object":119}],135:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":68,"./_set-proto":107}],136:[function(require,module,exports){

},{}],137:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":53,"./_an-instance":55,"./_classof":58,"./_core":60,"./_ctx":62,"./_export":68,"./_for-of":70,"./_global":71,"./_is-object":80,"./_iter-detect":84,"./_library":88,"./_microtask":90,"./_redefine-all":105,"./_set-species":108,"./_set-to-string-tag":109,"./_species-constructor":112,"./_task":114,"./_wks":124}],138:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":83,"./_string-at":113}],139:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":56,"./_descriptors":64,"./_enum-keys":67,"./_export":68,"./_fails":69,"./_global":71,"./_has":72,"./_hide":73,"./_is-array":79,"./_keyof":87,"./_library":88,"./_meta":89,"./_object-create":92,"./_object-dp":93,"./_object-gopd":95,"./_object-gopn":97,"./_object-gopn-ext":96,"./_object-gops":98,"./_object-keys":101,"./_object-pie":102,"./_property-desc":104,"./_redefine":106,"./_set-to-string-tag":109,"./_shared":111,"./_to-iobject":117,"./_to-primitive":120,"./_uid":121,"./_wks":124,"./_wks-define":122,"./_wks-ext":123}],140:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":122}],141:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":122}],142:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":71,"./_hide":73,"./_iterators":86,"./_wks":124,"./es6.array.iterator":129}],143:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],144:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof _getOwnPropertySymbols2.default === "function") for (var i = 0, p = (0, _getOwnPropertySymbols2.default)(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
var web_extensions_1 = require("./web-extensions");
var util_1 = require("lib/util");
function getApi() {
    return new ChromeApi();
}
exports.getApi = getApi;

var ChromeApi = function ChromeApi() {
    (0, _classCallCheck3.default)(this, ChromeApi);

    this.tabs = {};
    this.notification = {
        kind: 'web-extension',
        create: function create(options) {
            return new _promise2.default(function (resolve, reject) {
                var onClicked = options.onClicked,
                    onButtonClicked = options.onButtonClicked,
                    opts = __rest(options, ["onClicked", "onButtonClicked"]);

                var cn = chrome.notifications;
                var cr = chrome.runtime;
                var id = util_1.guid();
                cn.create(id, (0, _assign2.default)({ type: 'basic' }, opts), function () {
                    if (cr.lastError) reject(cr.lastError);
                    if (onClicked !== undefined) {
                        cn.onClicked.addListener(onClicked);
                    }
                    if (onButtonClicked !== undefined) {
                        cn.onButtonClicked.addListener(onButtonClicked);
                    }
                    resolve(id);
                });
            });
        },
        clear: function clear(id) {
            return new _promise2.default(function (resolve, reject) {
                var cr = chrome.runtime;
                chrome.notifications.clear(id, function (wasCleared) {
                    if (cr.lastError) reject(cr.lastError);
                    if (wasCleared) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        }
    };
    this.cookies = {};
    /**
     * Re-using preferencesApi implemented in web-extensions
     */
    this.preferences = web_extensions_1.preferencesApi;
    this.button = {
        kind: 'web-extension',
        setBadge: function setBadge(text) {
            chrome.browserAction.setBadgeText({ text: text });
        },
        setIconByName: function setIconByName(name) {
            var prefix = './src/icon/icon';
            var postfix = name ? '-' + name : '';
            chrome.browserAction.setIcon({
                path: {
                    '16': prefix + "16" + postfix + ".png",
                    '32': prefix + "32" + postfix + ".png"
                }
            });
        },
        setBadgeBackgroundColor: function setBadgeBackgroundColor(color) {
            chrome.browserAction.setBadgeBackgroundColor({ color: color });
        }
    };
    this.message = {};
};

},{"./web-extensions":147,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/get-own-property-symbols":20,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"lib/util":191}],145:[function(require,module,exports){
"use strict";

var util_1 = require("lib/util");
var Chrome = require("./chrome");
var WebExtensions = require("./web-extensions");
var Safari = require("./safari");
function getApi() {
    if (util_1.isChrome()) {
        return Chrome.getApi();
    } else if (util_1.isFF()) {
        return WebExtensions.getApi();
    } else if (util_1.isSafari()) {
        return Safari.getApi();
    } else {
        throw new Error("unsupported browser api");
    }
}
exports.getApi = getApi;

},{"./chrome":144,"./safari":146,"./web-extensions":147,"lib/util":191}],146:[function(require,module,exports){
"use strict";

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getApi() {
    return new SafariApi();
}
exports.getApi = getApi;

var SafariApi = function SafariApi() {
    (0, _classCallCheck3.default)(this, SafariApi);

    this.tabs = {};
    this.notification = {
        kind: 'fallback',
        create: function create(options) {
            return new _promise2.default(function (resolve, reject) {
                var title = options.title,
                    message = options.message,
                    onClicked = options.onClicked;

                var create = function create() {
                    var notification = new Notification(title, {
                        body: message
                    });
                    if (onClicked !== undefined) {
                        notification.onclick = function () {
                            return onClicked();
                        };
                    }
                    resolve();
                };
                if (window.Notification && Notification.permission !== 'granted') {
                    Notification.requestPermission(function (status) {
                        if (status !== 'granted') {
                            reject(new Error('Notification permission denied'));
                        } else {
                            create();
                        }
                    });
                } else {
                    create();
                }
            });
        }
    };
    this.cookies = {};
    this.preferences = {
        get: function get(key) {
            return decodeURIComponent(safari.extension.settings[key]);
        },
        set: function set(key, value) {
            safari.extension.settings[key] = encodeURIComponent(value);
        },
        getAll: function getAll() {
            return safari.extension.settings;
        },
        remove: function remove(key) {
            delete safari.extension.settings[key];
        },
        removeAll: function removeAll() {
            safari.extension.settings.clear();
        }
    };
    this.button = {
        kind: 'fallback',
        setBadge: function setBadge(text) {
            // TODO: Set only for active tab
            var toolbarItems = safari.extension.toolbarItems;
            toolbarItems.forEach(function (toolbarButton) {
                return toolbarButton.badge = text;
            });
        },

        /*
         * Set toolbar icon in format: `default-icon-name-${name}.png`
         * Default: default-icon-name.png
         */
        setIconByName: function setIconByName(name) {
            // TODO: Set only for active tab
            var badgePrevPrefix = void 0;
            var toolbarItems = safari.extension.toolbarItems;
            var img = toolbarItems[0].image.split('.');
            var ext = img.pop();
            var prefix = name ? '-' + name : '';
            if (badgePrevPrefix === prefix) return;
            var imgStr = img.join('.');
            if (badgePrevPrefix) imgStr = imgStr.split(badgePrevPrefix)[0];
            if (prefix) imgStr = imgStr.split(prefix)[0];
            badgePrevPrefix = prefix;
            toolbarItems.forEach(function (toolbarButton) {
                return toolbarButton.image = '' + img + prefix + '.' + ext;
            });
        }
    };
    this.message = {};
};

},{"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27}],147:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof _getOwnPropertySymbols2.default === "function") for (var i = 0, p = (0, _getOwnPropertySymbols2.default)(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
var util_1 = require("lib/util");
function getApi() {
    return new WebExtensionsApi();
}
exports.getApi = getApi;
/**
 * Low-level PreferencesApi implementation
 * Just a proxy to/from localStorage
 */
exports.preferencesApi = {
    get: function get(key) {
        return window.localStorage.getItem(key);
    },
    set: function set(key, value) {
        window.localStorage.setItem(key, value);
    },
    getAll: function getAll() {
        var all = {};
        for (var key in window.localStorage) {
            all[key] = window.localStorage.getItem(key);
        }
        return all;
    },
    remove: function remove(key) {
        window.localStorage.removeItem(key);
    },
    removeAll: function removeAll() {
        window.localStorage.clear();
    }
};
/**
 * Web Extensions API is based on Chrome extensions API.
 * But it has a number of incompatibilities.
 * Like, f.e. Promise-based methods instead of callback-based methods that chrome provides.
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
 */

var WebExtensionsApi = function WebExtensionsApi() {
    (0, _classCallCheck3.default)(this, WebExtensionsApi);

    this.tabs = {};
    this.notification = {
        kind: 'web-extension',
        create: function create(options) {
            var onClicked = options.onClicked,
                onButtonClicked = options.onButtonClicked,
                opts = __rest(options, ["onClicked", "onButtonClicked"]);

            var bn = browser.notifications;
            var id = util_1.guid();
            var notification = bn.create(id, (0, _assign2.default)({ type: 'basic' }, opts));
            if (onClicked !== undefined) {
                bn.onClicked.addListener(onClicked);
            }
            if (onButtonClicked !== undefined) {
                bn.onButtonClicked.addListener(onButtonClicked);
            }
            return notification;
        },
        clear: function clear(id) {
            return browser.notifications.clear(id);
        }
    };
    this.cookies = {};
    this.preferences = exports.preferencesApi;
    this.button = {
        kind: 'web-extension',
        setBadge: function setBadge(text) {
            browser.browserAction.setBadgeText({ text: text });
        },
        setIconByName: function setIconByName(name) {
            var prefix = './src/icon/icon';
            var postfix = name ? '-' + name : '';
            browser.browserAction.setIcon({
                path: {
                    '19': prefix + "19" + postfix + ".png",
                    '38': prefix + "38" + postfix + ".png"
                }
            });
        },
        setBadgeBackgroundColor: function setBadgeBackgroundColor(color) {
            browser.browserAction.setBadgeBackgroundColor({ color: color });
        }
    };
    this.message = {};
};

},{"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/get-own-property-symbols":20,"babel-runtime/helpers/classCallCheck":27,"lib/util":191}],148:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var forge_1 = require("lib/forge");
var util_1 = require("lib/util");
var config_1 = require("lib/config");
var PATH = '/';
exports.getCookie = function (name) {
    var domain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : config_1.GRAMMARLY_DOMAIN;
    return new _promise2.default(function (resolve, reject) {
        return forge_1.forge.cookies.get(domain, PATH, name, resolve, reject);
    });
};
exports.watch = function (cb, name) {
    var domain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : config_1.GRAMMARLY_DOMAIN;

    if (!cb) throw new Error('cookies.watch: callback required');
    forge_1.forge.cookies.watch(config_1.GRAMMARLY_DOMAIN, PATH, name, cb);
};
exports.getToken = function () {
    return exports.getCookie('grauth');
};
exports.watchToken = function (cb) {
    return exports.watch(cb, 'grauth');
};
exports.setCookie = function (data) {
    return new _promise2.default(function (resolve, reject) {
        return forge_1.forge.cookies.set(data, resolve, reject);
    });
};
function getAllGrammarlyCookies() {
    if (!util_1.isWE()) return [];
    return new _promise2.default(function (resolve, reject) {
        try {
            window.chrome.cookies.getAll({ domain: config_1.GRAMMARLY_DOMAIN, path: PATH }, function (cookies) {
                return resolve(Array.isArray(cookies) ? cookies : []);
            });
        } catch (e) {
            reject(e);
        }
    });
}
exports.getAllGrammarlyCookies = getAllGrammarlyCookies;

},{"babel-runtime/core-js/promise":24,"lib/config":154,"lib/forge":156,"lib/util":191}],149:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var userActions = require("./user/actions");
var settingsActions = require("./settings/actions");
var connectionActions = require("./connection/actions");
exports.pureActions = (0, _assign2.default)({}, userActions, connectionActions, settingsActions);

},{"./connection/actions":150,"./settings/actions":151,"./user/actions":152,"babel-runtime/core-js/object/assign":17}],150:[function(require,module,exports){
"use strict";

exports.t = {
    UPDATE_CONNECTION: 'connection/UPDATE_CONNECTION',
    ONLINE_STATE: 'connection/ONLINE_STATE'
};
function updateConnection(data) {
    return {
        type: exports.t.UPDATE_CONNECTION,
        data: data
    };
}
exports.updateConnection = updateConnection;
function onlineConnection(online) {
    return {
        type: exports.t.ONLINE_STATE,
        online: online
    };
}
exports.onlineConnection = onlineConnection;

},{}],151:[function(require,module,exports){
"use strict";

exports.t = {
    SETTINGS_INITIAL: 'settings/SETTINGS_INITIAL',
    TOGGLE_DEFS: 'settings/TOGGLE_DEFS',
    TOGGLE_SITE: 'settings/TOGGLE_SITE',
    TOGGLE_FIELD: 'settings/TOGGLE_FIELD',
    SHOW_NEWS: 'settings/SHOW_NEWS',
    SEEN_NEWS: 'settings/SEEN_NEWS',
    SEEN_REFERRALS: 'settings/SEEN_REFERRALS',
    CLICK_REFERRALS: 'settings/CLICK_REFERRALS',
    SET_WEAK_DIALECT: 'settings/SET_WEAK_DIALECT',
    CHANGE_WEAK_DIALECT: 'settings/CHANGE_WEAK_DIALECT'
};
exports.DAPI_ACTIONS = [exports.t.CHANGE_WEAK_DIALECT];
//that actions trigger sync extensionSettings to prefs
exports.CACHED_ACTIONS = [exports.t.TOGGLE_DEFS, exports.t.TOGGLE_SITE, exports.t.TOGGLE_FIELD, exports.t.SEEN_NEWS, exports.t.SEEN_REFERRALS, exports.t.CLICK_REFERRALS];
function setWeakDialect(data) {
    return {
        type: exports.t.SET_WEAK_DIALECT,
        data: data
    };
}
exports.setWeakDialect = setWeakDialect;
function changeWeakDialect(data) {
    return {
        type: exports.t.CHANGE_WEAK_DIALECT,
        data: data
    };
}
exports.changeWeakDialect = changeWeakDialect;
function initialSettings(data) {
    return {
        type: exports.t.SETTINGS_INITIAL,
        data: data
    };
}
exports.initialSettings = initialSettings;
function toggleDefs(enabledDefs) {
    return {
        type: exports.t.TOGGLE_DEFS,
        enabledDefs: enabledDefs
    };
}
exports.toggleDefs = toggleDefs;
function toggleSite(enabled, domain) {
    return {
        type: exports.t.TOGGLE_SITE,
        domain: domain,
        enabled: enabled
    };
}
exports.toggleSite = toggleSite;
function toggleField(data, domain) {
    return {
        type: exports.t.TOGGLE_FIELD,
        domain: domain,
        data: data
    };
}
exports.toggleField = toggleField;
function seenNews() {
    return {
        type: exports.t.SEEN_NEWS
    };
}
exports.seenNews = seenNews;
function showNews(showNews) {
    return {
        type: exports.t.SHOW_NEWS,
        showNews: showNews
    };
}
exports.showNews = showNews;
function seenReferrals() {
    return {
        type: exports.t.SEEN_REFERRALS
    };
}
exports.seenReferrals = seenReferrals;
function clickReferrals() {
    return {
        type: exports.t.CLICK_REFERRALS
    };
}
exports.clickReferrals = clickReferrals;

},{}],152:[function(require,module,exports){
"use strict";

exports.t = {
    // fully refresh user session in store
    SET_USER: 'user/SET_USER',
    // fully refresh user settings in store
    SET_SETTINGS: 'user/SET_SETTINGS',
    // update user settings and sync in to auth
    UPDATE_SETTINGS: 'user/UPDATE_SETTINGS',
    // invalidate user session and update it from auth
    SESSION_INVALIDATE: 'user/SESSION_INVALIDATE',
    // increase user fixed errors
    INC_FIXED: 'user/INC_FIXED'
};
// @TODO types are not precise
function setUser(data) {
    return {
        type: exports.t.SET_USER,
        data: data
    };
}
exports.setUser = setUser;
// @TODO types are not precise
function updateSettings(data) {
    return {
        type: exports.t.UPDATE_SETTINGS,
        data: data
    };
}
exports.updateSettings = updateSettings;
// @TODO types are not precise
function setSettings(data) {
    return {
        type: exports.t.SET_SETTINGS,
        data: data
    };
}
exports.setSettings = setSettings;
// @TODO types are not precise
function sessionInvalidate(reason) {
    return {
        type: exports.t.SESSION_INVALIDATE,
        reason: reason
    };
}
exports.sessionInvalidate = sessionInvalidate;
function incFixed() {
    return {
        type: exports.t.INC_FIXED
    };
}
exports.incFixed = incFixed;

},{}],153:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var extension_api_1 = require("extension-api");

var _extension_api_1$getA = extension_api_1.getApi(),
    preferences = _extension_api_1$getA.preferences;

var pget = function pget(prop) {
    return new _promise2.default(function (resolve, reject) {
        try {
            var value = preferences.get(prop);
            if (value === 'undefined') {
                resolve(undefined);
            } else {
                resolve(value && JSON.parse(value));
            }
        } catch (e) {
            if (e && e.toString().includes('SyntaxError')) {
                preferences.remove(prop);
                reject("Prop:" + prop + " has corrupted value, cleanup");
            } else {
                reject(e);
            }
        }
    });
};
var prefs;
(function (prefs_1) {
    function get(props) {
        return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
            var _this = this;

            var isArray, result;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            isArray = Array.isArray(props);
                            result = void 0;
                            _context2.prev = 2;

                            if (!isArray) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var values;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                props = props;
                                                _context.next = 3;
                                                return _promise2.default.all(props.map(pget));

                                            case 3:
                                                values = _context.sent;

                                                result = props.reduce(function (obj, prop, i) {
                                                    return (0, _assign2.default)(obj, (0, _defineProperty3.default)({}, prop, values[i]));
                                                }, {});

                                            case 5:
                                            case "end":
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this);
                            })(), "t0", 5);

                        case 5:
                            _context2.next = 11;
                            break;

                        case 7:
                            props = props;
                            _context2.next = 10;
                            return pget(props);

                        case 10:
                            result = _context2.sent;

                        case 11:
                            _context2.next = 17;
                            break;

                        case 13:
                            _context2.prev = 13;
                            _context2.t1 = _context2["catch"](2);

                            if (isArray) result = {};
                            console.warn('prefs get error:', _context2.t1); // tslint:disable-line no-console

                        case 17:
                            return _context2.abrupt("return", result);

                        case 18:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[2, 13]]);
        }));
    }
    prefs_1.get = get;
    function set(name, value) {
        return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (name !== null && (typeof name === "undefined" ? "undefined" : (0, _typeof3.default)(name)) === 'object') {
                                (0, _keys2.default)(name).forEach(function (key) {
                                    return prefs.set(key, name[key]);
                                });
                            } else {
                                try {
                                    if (value === undefined) {
                                        value = 'undefined';
                                    } else {
                                        value = (0, _stringify2.default)(value);
                                    }
                                    preferences.set(name, value);
                                } catch (e) {
                                    console.warn('prefs set error', e); // tslint:disable-line no-console
                                }
                            }

                        case 1:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    }
    prefs_1.set = set;
    function all() {
        return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt("return", new _promise2.default(function (resolve, reject) {
                                try {
                                    var _prefs = preferences.getAll();
                                    for (var key in _prefs) {
                                        if (_prefs[key] === 'undefined') {
                                            _prefs[key] = undefined;
                                        } else {
                                            try {
                                                var v = _prefs[key];
                                                _prefs[key] = v && JSON.parse(v);
                                            } catch (e) {}
                                        }
                                    }
                                    resolve(_prefs);
                                } catch (e) {
                                    reject(e);
                                }
                            }));

                        case 1:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
    }
    prefs_1.all = all;
    function clearAll() {
        try {
            preferences.removeAll();
        } catch (e) {
            console.warn('prefs clearAll error', e); // tslint:disable-line no-console
        }
    }
    prefs_1.clearAll = clearAll;
})(prefs = exports.prefs || (exports.prefs = {}));

},{"babel-runtime/core-js/json/stringify":16,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/typeof":35,"babel-runtime/regenerator":38,"extension-api":145}],154:[function(require,module,exports){
(function (global){
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var forge = typeof window !== "undefined" ? window['forge'] : typeof global !== "undefined" ? global['forge'] : null;
var SparkMD5 = require("spark-md5");
var newConfig_1 = require("./newConfig");
exports.getVersion = newConfig_1.getVersion;
exports.ENV = newConfig_1.ENV;
exports.MIXPANEL = newConfig_1.MIXPANEL;
exports.STATSC = newConfig_1.STATSC;
exports.GRAMMARLY_DOMAIN = newConfig_1.GRAMMARLY_DOMAIN;
exports.DAPI = newConfig_1.DAPI;
exports.URLS = newConfig_1.URLS;
exports.appName = newConfig_1.appName;
exports.gnarAppName = newConfig_1.gnarAppName;
exports.FELOG = {
    key: 'b37252e300204b00ad697fe1d3b979e1',
    project: '15',
    pingTimeout: 10 * 60 * 1000
};
exports.GNAR = {
    url: 'https://gnar.grammarly.com',
    domain: '.grammarly.com'
};
// TODO QA env?
/*  GNAR = {
    url: 'https://gnar.qagr.io',
    domain: '.qagr.io'
  }
*/
function updateUrls() {
    var overwritedUlrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    (0, _assign2.default)(newConfig_1.URLS, overwritedUlrs);
}
exports.updateUrls = updateUrls;
function getUpdateTime() {
    if (!forge) return;
    return forge.config.modules.parameters.updateTime;
}
exports.getUpdateTime = getUpdateTime;
function getUuid() {
    if (!forge) return;
    return forge.config.uuid;
}
exports.getUuid = getUuid;
exports.news = ['The G logo gets out of the way when you\'re typing', 'Switch between American and British English', 'Quickly disable checking in certain types of text fields', 'A fully redesigned and improved interface'];
exports.newsId = exports.news.length && SparkMD5.hash(exports.news.join('\n'));
exports.userFields = ['id', 'email', 'firstName', 'anonymous', 'type', 'subscriptionFree', 'experiments', 'premium', 'settings', 'registrationDate', 'mimic', 'groups', 'extensionInstallDate', 'fixed_errors', 'referral'];
// if (!process.env.PROD) { TEMPORARY
exports.userFields.push('token');
// }
exports.FEATURES = {
    'EXAMPLE_FEATURE': 'example_feature'
};
var DISABLED_FEATURES = {
    'example_feature': {
        'Free': [],
        'Premium': []
    }
};
function isFeatureDisabled(feature, mimic, type) {
    var disabledGroups = DISABLED_FEATURES[feature][type] || [];
    return disabledGroups && mimic && mimic.some(function (group) {
        return disabledGroups.includes(group);
    });
}
exports.isFeatureDisabled = isFeatureDisabled;
exports.isTest = !forge;
// debug: true,
exports.nextVerClass = 'gr_ver_2';
exports.grammarlyAttrs = ['data-gramm_editor', 'data-gramm', 'data-gramm_id', 'gramm_editor'];
exports.restrictedAttrs = [].concat((0, _toConsumableArray3.default)(exports.grammarlyAttrs), ['readonly', 'pm-container', 'data-synchrony', ['class', 'redactor-editor'], ['class', 'redactor_box'], ['aria-label', 'Search Facebook']]);
exports.restrictedParentAttrs = '[data-reactid]';
exports.externalEvents = ['changed-user', 'changed-plan', 'changed-dialect', 'cleanup', 'editor-fix'];
exports.development = document.location.host == '127.0.0.1:3117';

}).call(this,typeof window !== "undefined" ? window : {})
},{"./newConfig":159,"babel-runtime/core-js/object/assign":17,"babel-runtime/helpers/toConsumableArray":34,"spark-md5":"spark-md5"}],155:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var _ = require("lodash");
var ReactDOM = require("react-dom");
var util_1 = require("./util");
function createEl(html, doc) {
    var div = (doc || document).createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild;
}
exports.createEl = createEl;
function renderReactWithParent(reactElement, parent, id) {
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'div';

    var react = parent[id] || {};
    parent[id] = react;
    if (!react.el) {
        react.el = parent.ownerDocument.createElement(type);
        parent.appendChild(react.el);
    }
    var component = ReactDOM.render(reactElement, react.el);
    if (!react.remove) {
        react.remove = function () {
            delete parent[id];
            parent.removeChild(react.el);
            ReactDOM.unmountComponentAtNode(react.el);
        };
    }
    return {
        component: component,
        remove: react.remove,
        el: react.el
    };
}
exports.renderReactWithParent = renderReactWithParent;
function inEl(el, target) {
    var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;

    var i = 0;
    while (el.parentNode && i < deep) {
        if (!(typeof target == 'string') && target == el) return true;
        if (el.id == target || el == target) return true;
        el = el.parentNode;
    }
    return false;
}
exports.inEl = inEl;
function hasClass(_el, cls) {
    if (!_el || _el.className == undefined) return false;
    return _el.classList.contains(cls);
}
exports.hasClass = hasClass;
function removeClass(_el, cls) {
    if (!_el || !_el.classList) return;
    return _el.classList.remove(cls);
}
exports.removeClass = removeClass;
function addClass(_el, cls) {
    if (!_el) return;
    if (cls.indexOf(' ') != -1) {
        cls = cls.split(' ');
        for (var i = 0; i < cls.length; i++) {
            _el.classList.add(cls[i]);
        }
        return;
    }
    return _el.classList.add(cls);
}
exports.addClass = addClass;
function toggleClass(el, flag, cls) {
    if (flag) {
        addClass(el, cls);
    } else {
        removeClass(el, cls);
    }
}
exports.toggleClass = toggleClass;
function getParentBySel(el, sel) {
    while (el = el.parentNode) {
        if (matchesSelector(el, sel)) return el;
    }
    return false;
}
exports.getParentBySel = getParentBySel;
function parentIsContentEditable(el) {
    while (el = el.parentNode) {
        if (isContentEditable(el)) return el;
    }
    return false;
}
exports.parentIsContentEditable = parentIsContentEditable;
function isContentEditable(el) {
    return el.contentEditable == 'true' || el.contentEditable == 'plaintext-only';
}
exports.isContentEditable = isContentEditable;
function matchesSelector(el, sel) {
    if (!el) return false;
    if (el.matches) return el.matches(sel);
    if (el.matchesSelector) return el.matchesSelector(sel);
    if (el.webkitMatchesSelector) return el.webkitMatchesSelector(sel);
    if (el.mozMatchesSelector) return el.mozMatchesSelector(sel);
    if (window.$ && window.$.is) return window.$(el).is(sel);
}
exports.matchesSelector = matchesSelector;
function isFocused(el) {
    if (document.activeElement && document.activeElement.tagName == 'IFRAME') {
        return el === el.ownerDocument.activeElement;
    } else if (document.activeElement && document.activeElement.tagName == 'BODY') {
        return el === document.activeElement;
    }
    return el === document.activeElement;
}
exports.isFocused = isFocused;
var lKey = util_1.guid(); //Symbol('listeners') safari tests wtf
function listen(el, event, cb, unbind) {
    var bubble = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    if (!el) return;
    if (_.isObject(event)) {
        return _.each(event, function (value, key) {
            listen(el, key, value, unbind);
        }); //args shift
    }
    var func = unbind ? 'removeEventListener' : 'addEventListener';
    var listeners = el[lKey] || [];
    el[lKey] = listeners;
    if (unbind) {
        el[lKey] = listeners.filter(function (l) {
            return !(l.event == event && l.cb == cb);
        });
    } else {
        listeners.push({ event: event, cb: cb });
    }
    el[func](event, cb, bubble);
    if (!"yes") {
        //mechanism for firing custom events
        cb.__wrapFunc = cb.__wrapFunc || function (e) {
            e = e || {};
            var target = void 0;
            if (e.detail && typeof e.detail.target == 'string') {
                target = document.querySelector(e.detail.target);
            }
            cb(_.extend({ originalEvent: e, preventDefault: util_1._f, stopPropagation: util_1._f }, e.detail, { target: target }));
        };
        el[func](event + '-gr', cb.__wrapFunc, bubble);
    }
    return { el: el, event: event, cb: cb, bubble: bubble };
}
exports.listen = listen;
function unlisten(el, event, cb, bubble) {
    if (!event && el[lKey]) {
        return el[lKey].each(function (l) {
            return unlisten(el, l.event, l.cb, l.bubble);
        });
    }
    listen(el, event, cb, true, bubble);
}
exports.unlisten = unlisten;
function on() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    this.addEventListener.apply(this, args);
    return { off: function off() {
            return _off.apply(_this, args);
        } };
}
exports.on = on;
function _off() {
    this.removeEventListener.apply(this, arguments);
}
exports.off = _off;
function once(event, cb) {
    var _this2 = this;

    var done = function done(e) {
        cb(e);
        _off.call(_this2, event, done);
    };
    on.call(this, event, done);
}
exports.once = once;
function emit(event, data) {
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(event, true, true, data);
    this.dispatchEvent(e);
}
exports.emit = emit;
function isVisible(el) {
    var style = getComputedStyle(el, null),
        visible = style.getPropertyValue('display') != 'none' && style.getPropertyValue('visibility') != 'hidden' && el.clientHeight > 0;
    return visible;
}
exports.isVisible = isVisible;
function cs() {
    for (var _len2 = arguments.length, keys = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        keys[_key2] = arguments[_key2];
    }

    return keys.reduce(function (res, cur) {
        return res.concat(!_.isObject(cur) ? cur : (0, _keys2.default)(cur).filter(function (cls) {
            return cur[cls];
        }));
    }, []).filter(function (x) {
        return Boolean(x);
    }).join(' ');
}
exports.cs = cs;
function maybeAddPx(name, value) {
    return typeof value == 'number' && !cssNumber[dasherize(name)] ? value + 'px' : value;
}
exports.maybeAddPx = maybeAddPx;
function camelize(str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
    });
}
exports.camelize = camelize;
function camelizeAttrs(obj) {
    return _.transform(obj, function (result, value, key) {
        return result[camelize(key)] = value;
    });
}
exports.camelizeAttrs = camelizeAttrs;
function dasherize(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
}
exports.dasherize = dasherize;
var cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 };
function css(el, property, value) {
    if (arguments.length < 3) {
        var _ret = function () {
            var element = el;
            if (!element) return {
                v: void 0
            };
            var computedStyle = getComputedStyle(element, '');
            if (typeof property == 'string') {
                return {
                    v: element.style[camelize(property)] || computedStyle.getPropertyValue(property)
                };
            } else if (_.isArray(property)) {
                var _ret2 = function () {
                    var props = {};
                    _.each(property, function (val, prop) {
                        props[camelize(val)] = element.style[camelize(val)] || computedStyle.getPropertyValue(val);
                    });
                    return {
                        v: {
                            v: props
                        }
                    };
                }();

                if ((typeof _ret2 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
            }
        }();

        if ((typeof _ret === "undefined" ? "undefined" : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
    }
    var result = '';
    if (_.isString(property)) {
        if (!value && value !== 0) {
            el.style.removeProperty(dasherize(property));
        } else {
            result = dasherize(property) + ':' + maybeAddPx(property, value);
        }
    } else {
        for (var key in property) {
            if (!property[key] && property[key] !== 0) {
                el.style.removeProperty(dasherize(key));
            } else {
                result += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
            }
        }
    }
    return el.style.cssText += ';' + result;
}
exports.css = css;
function setCustomCss(field, style) {
    if (!style || !field) return;
    var originStyle = css(field, (0, _keys2.default)(style));
    css(field, style);
    return function () {
        return css(field, originStyle);
    };
}
exports.setCustomCss = setCustomCss;
function getParentByTag(el, tag) {
    while (el = el.parentNode) {
        if (el.tagName == tag) return el;
    }
    return false;
}
exports.getParentByTag = getParentByTag;
function getParentByData(el, key, val) {
    while (el = el.parentNode) {
        if (el.dataset && el.dataset[key] && el.dataset[key] == val) return el;
    }
}
exports.getParentByData = getParentByData;
function resolveEl(el, cls) {
    if (hasClass(el, cls)) return el;
    return getParent(el, cls);
}
exports.resolveEl = resolveEl;
function getParent(el, cls) {
    while (el = el.parentNode) {
        if (hasClass(el, cls)) return el;
    }
    return false;
}
exports.getParent = getParent;
function parentHasClass(el, cls) {
    if (!el) return false;
    while (el.parentNode) {
        if (hasClass(el, cls)) return el;
        el = el.parentNode;
    }
    return false;
}
exports.parentHasClass = parentHasClass;
function getParentByDepth() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    return !depth ? this : getParentByDepth.call(this.parentNode, --depth);
}
exports.getParentByDepth = getParentByDepth;
function isParent(el, parent) {
    if (!el) return false;
    while (el.parentNode) {
        if (parent == el.parentNode) return el;
        el = el.parentNode;
    }
    return false;
}
exports.isParent = isParent;
function insertAfter(newElement, targetElement) {
    //target is what you want it to go after. Look for this elements parent.
    var parent = targetElement.parentNode;
    //if the parents lastChild is the targetElement...
    if (parent.lastChild == targetElement) {
        //add the newElement after the target element.
        parent.appendChild(newElement);
    } else {
        // else the target has siblings, insert the new element between the target and it's next sibling.
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}
exports.insertAfter = insertAfter;
function insertBefore(newElement, targetElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement);
}
exports.insertBefore = insertBefore;
function elementInDocument(element, doc) {
    doc = doc || document;
    while (element) {
        if (element == doc) return true;
        element = element.parentNode;
    }
    return false;
}
exports.elementInDocument = elementInDocument;
function runKeyEvent(e) {
    var evt = void 0,
        defaultView = void 0,
        keycode = void 0;
    var defaultEvent = {
        ctrl: false,
        meta: false,
        shift: false,
        alt: false
    };
    e = _.extend(defaultEvent, e);
    //console.log('event', e)
    try {
        evt = e.el.ownerDocument.createEvent('KeyEvents');
        defaultView = e.el.ownerDocument.defaultView;
        keycode = util_1.keyCode(e);
        evt.initKeyEvent(e.type, // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        defaultView, // in nsIDOMAbstractView viewArg, window
        e.ctrl, // in boolean ctrlKeyArg,
        e.alt, // in boolean altKeyArg,
        e.shift, // in boolean shiftKeyArg,
        e.meta, // in boolean metaKeyArg,
        keycode, // key code
        keycode); // char code.
    } catch (err) {
        evt = e.el.ownerDocument.createEvent('UIEvents');
        evt.initUIEvent(e.name, true, true, window, 1);
        evt.keyCode = keycode;
        evt.which = keycode;
        evt.charCode = keycode;
        evt.ctrlKey = e.ctrl;
        evt.altKey = e.alt;
        evt.shiftKey = e.shift;
        evt.metaKey = e.metaKey;
    }
    e.el.dispatchEvent(evt);
}
exports.runKeyEvent = runKeyEvent;
function docHidden(doc) {
    if (typeof doc.hidden !== 'undefined') return doc.hidden;
    if (typeof doc.mozHidden !== 'undefined') return doc.mozHidden;
    if (typeof doc.webkitHidden !== 'undefined') return doc.webkitHidden;
    if (typeof doc.msHidden !== 'undefined') return doc.msHidden;
    return false;
}
exports.docHidden = docHidden;
function visibilityEvent(doc) {
    if (typeof doc.hidden !== 'undefined') return 'visibilitychange';
    if (typeof doc.mozHidden !== 'undefined') return 'mozvisibilitychange';
    if (typeof doc.webkitHidden !== 'undefined') return 'webkitvisibilitychange';
    if (typeof doc.msHidden !== 'undefined') return 'msvisibilitychange';
    return false;
}
exports.visibilityEvent = visibilityEvent;
function transformProp() {
    var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    if (typeof doc.body.style.transform !== 'undefined') return 'transform';
    if (typeof doc.body.style.WebkitTransform !== 'undefined') return 'WebkitTransform';
    if (typeof doc.body.style.MozTransform !== 'undefined') return 'MozTransform';
}
exports.transformProp = transformProp;
/*
  el, 'width', 'height'
*/
function compStyle(el) {
    if (!el) return;
    var doc = el.ownerDocument;
    if (!doc) return;
    var win = doc.defaultView || window;
    if (!win) return;
    var s = win.getComputedStyle(el, null);
    if (!s) return;

    for (var _len3 = arguments.length, props = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        props[_key3 - 1] = arguments[_key3];
    }

    if (props.length == 1) return s.getPropertyValue(props[0]);
    return props.reduce(function (result, prop) {
        return (0, _assign2.default)({}, result, (0, _defineProperty3.default)({}, prop, s.getPropertyValue(prop)));
    }, {});
}
exports.compStyle = compStyle;
function classSelector(cls) {
    return cls.split(' ').map(function (c) {
        return c[0] != '.' ? '.' + c : c;
    }).join('').trim();
}
exports.classSelector = classSelector;
function selectorAll(cls) {
    for (var _len4 = arguments.length, classes = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        classes[_key4 - 1] = arguments[_key4];
    }

    if (classes.length > 0) {
        var _ret3 = function () {
            var result = [];
            result.push(selectorAll(cls));
            classes.forEach(function (c) {
                return result.push(selectorAll(c));
            });
            return {
                v: result.join(', ')
            };
        }();

        if ((typeof _ret3 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret3)) === "object") return _ret3.v;
    }
    //check dots
    cls = cls.split(', ').map(function (c) {
        return c[0] != '.' ? '.' + c : c;
    }).join(', ').trim();
    return cls + ", " + cls + " *";
}
exports.selectorAll = selectorAll;
function nodeInTree(tree, node) {
    if (node == tree) return true;
    if (!tree.children) return false;
    for (var i = 0; i < tree.children.length; i++) {
        if (nodeInTree(tree.children[i], node)) return true;
    }
    return false;
}
exports.nodeInTree = nodeInTree;
function watchNodeRemove(node, cb) {
    var callback = function callback(mutations) {
        mutations.map(function (mr) {
            if (mr.removedNodes.length == 0) return;
            var nodes = mr.removedNodes,
                len = nodes.length;
            for (var i = 0; i < len; i++) {
                var tree = nodes[i];
                if (tree.contains && tree.contains(node) || nodeInTree(tree, node)) {
                    mo.disconnect();
                    cb();
                }
            }
        });
    },
        mo = new MutationObserver(callback);
    mo.observe(node.ownerDocument.body, { childList: true, subtree: true });
}
exports.watchNodeRemove = watchNodeRemove;
function whichAnimationEndEvent() {
    var t = void 0,
        el = document.createElement('fakeelement'),
        transitions = {
        'animation': 'animationend',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    };
    for (t in transitions) {
        if (el.style[t] != undefined) {
            return transitions[t];
        }
    }
}
exports.whichAnimationEndEvent = whichAnimationEndEvent;
function transitionEndEventName() {
    var i = void 0,
        el = document.createElement('fakeelement'),
        transitions = {
        'transition': 'transitionend',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };
    for (i in transitions) {
        if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
        }
    }
}
exports.transitionEndEventName = transitionEndEventName;
function addIframeCss(frameDoc) {
    if (typeof GR_INLINE_STYLES == 'undefined') return;
    var style = frameDoc.createElement('style');
    /*eslint-disable*/
    style.innerHTML = GR_INLINE_STYLES;
    /*eslint-enable*/
    try {
        frameDoc.querySelector('head').appendChild(style);
    } catch (e) {
        console.log('can\'t append style', e);
    }
}
exports.addIframeCss = addIframeCss;
function setGRAttributes(el, id) {
    el.setAttribute('data-gramm_id', id);
    el.setAttribute('data-gramm', true);
}
exports.setGRAttributes = setGRAttributes;
function emitDomEvent(key) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(key + '-gr', true, true, data);
    document.dispatchEvent(e);
}
exports.emitDomEvent = emitDomEvent;
function addRange(doc, range) {
    var s = doc.getSelection();
    s.removeAllRanges();
    s.addRange(range);
}
exports.addRange = addRange;
function setDomRange(doc, data) {
    var range = doc.createRange();
    range.setStart(data.anchorNode, data.anchorOffset);
    range.setEnd(data.focusNode, data.focusOffset);
    addRange(doc, range);
}
exports.setDomRange = setDomRange;

},{"./util":191,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/typeof":35,"lodash":"lodash","react-dom":"react-dom"}],156:[function(require,module,exports){
(function (global){
"use strict";

exports.forge = typeof window !== "undefined" ? window['forge'] : typeof global !== "undefined" ? global['forge'] : null;

}).call(this,typeof window !== "undefined" ? window : {})
},{}],157:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var message = require("./message");
var forge_1 = require("./forge");
var util_1 = require("./util");
var defaults_1 = require("./page-config/defaults");
function currentUrl() {
    return new _promise2.default(function (resolve) {
        var retry = setTimeout(function () {
            return forge_1.forge.tabs.getCurrentTabUrl(resolve);
        }, 2000);
        forge_1.forge.tabs.getCurrentTabUrl(function (url) {
            clearTimeout(retry);
            resolve(url);
        });
    });
}
exports.currentUrl = currentUrl;
function getDomain(el, cb) {
    if (util_1.isFunction(el)) {
        cb = el;
        el = '';
    }
    if (cb) {
        if (!util_1.isBgOrPopup() && forge_1.forge) {
            message.emitBackground('get-domain', {}, cb);
            return;
        }
        if (forge_1.forge && forge_1.forge.tabs) {
            currentUrl().then(function (url) {
                return cb(domainFromUrl(url));
            });
        } else {
            cb(domainFromEl(el));
        }
        return;
    }
    return domainFromEl(el);
}
exports.getDomain = getDomain;
function promiseGetDomain(el) {
    if (!util_1.isBgOrPopup() && forge_1.forge) {
        return message.promiseBackground('get-domain');
    }
    if (forge_1.forge && forge_1.forge.tabs) {
        return _promise2.default.race([currentUrl().then(domainFromUrl), util_1.delay(10000).then(function () {
            throw new Error('Request to forge.tabs.getCurrentTabUrl rejected by timeout');
        })]);
    }
    return domainFromEl(el);
}
exports.promiseGetDomain = promiseGetDomain;
function domainFromEl(el) {
    var doc = el && el.ownerDocument || document;
    var location = doc.location || doc.defaultView.location;
    if (!location) return '';
    return stripDomain(location.hostname);
}
function domainFromUrl(url) {
    if (util_1.isFF() && /^about:/.test(url)) return url;
    var location = document.createElement('a');
    location.href = url;
    return stripDomain(location.hostname);
}
exports.domainFromUrl = domainFromUrl;
exports.isFacebookSite = function () {
    return defaults_1.FACEBOOK_SITES.includes(getDomain());
};
exports.isJiraSite = function () {
    return (/\.atlassian\.net/.test(getDomain())
    );
};
exports.isBlackboardSite = function () {
    return (/\.blackboard\.com/.test(getDomain())
    );
};
var stripDomain = function stripDomain(domain) {
    return domain.replace('www.', '');
};
function getUrl(el) {
    var doc = el && el.ownerDocument || document;
    var location = doc.location || doc.defaultView.location;
    if (!location) return '';
    return location.pathname + location.search;
}
exports.getUrl = getUrl;
function getFavicon() {
    var isAbsolute = new RegExp('^(?:[a-z]+:)?//', 'i');
    var favicon = '';
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var rel = '"' + link.getAttribute('rel') + '"';
        var regexp = /(\"icon )|( icon\")|(\"icon\")|( icon )/i;
        if (rel.search(regexp) != -1) {
            favicon = link.getAttribute('href');
        }
    }
    if (!favicon) {
        favicon = 'favicon.ico';
    }
    if (isAbsolute.test(favicon)) {
        return favicon;
    }
    if (favicon[0] != '/') {
        return '//' + document.location.host + document.location.pathname + favicon;
    }
    return '//' + document.location.host + favicon;
}
exports.getFavicon = getFavicon;

},{"./forge":156,"./message":158,"./page-config/defaults":160,"./util":191,"babel-runtime/core-js/promise":24}],158:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var emitter = require("emitter");
var forge_1 = require("./forge");
var util_1 = require("./util");
var dom_1 = require("./dom");
var errorEmitter = emitter({});
var Listeners = {};
exports.emitError = _.throttle(function (e) {
    return errorEmitter.emit('__bgerror', e);
}, 1000);
function one(type, cb) {
    function _cb() {
        off(type, _cb);

        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        cb.apply(this, data);
    }
    on(type, _cb);
}
exports.one = one;
function on(type, callback) {
    // type '__bgerror' handled by errorEmitter
    if (type === '__bgerror') {
        errorEmitter.on('__bgerror', callback);
        return;
    }
    var listeners = Listeners[type] = Listeners[type] || [];
    if (!listeners.length) {
        listeners.push(callback); // when we have buffered messages, we process them immediately
        try {
            forge_1.forge.message.listen(type, function () {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(listeners), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var l = _step.value;

                        l.apply(undefined, arguments);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            });
        } catch (e) {
            exports.emitError(e);
        }
    } else {
        listeners.push(callback);
    }
}
exports.on = on;
function off(type, callback) {
    if (type === '__bgerror') {
        errorEmitter.off('__bgerror', callback);
        return;
    }
    var listeners = Listeners[type];
    if (!listeners) return;
    var i = listeners.indexOf(callback);
    if (i !== -1) listeners.splice(i, 1);
    if (listeners.length === 0) delete Listeners[type];
}
exports.off = off;
function emitTabs(type) {
    var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var callback = arguments[2];

    try {
        forge_1.forge.message.broadcast(type, content, callback);
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitTabs = emitTabs;
function emitTo(tabId, type) {
    var content = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var callback = arguments[3];

    try {
        if (!tabId) throw TypeError('emitTo can\'t be used without destination point');
        forge_1.forge.message.sendTo(tabId, type, content, callback);
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitTo = emitTo;
function emitFocusedTab(type, content, callback) {
    // focussed wtf? http://www.future-perfect.co.uk/grammar-tip/is-it-focussed-or-focused/
    try {
        // @TODO this call doesn't look right – doesn't match implementation in api-priv-chrome.js
        forge_1.forge.message.toFocussed(type, content, callback);
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitFocusedTab = emitFocusedTab;
// @TODO maybe error is not used here either – I don't know
function emitBackground(type, content, callback, error) {
    try {
        forge_1.forge.message.broadcastBackground(type, content, callback, error);
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitBackground = emitBackground;
function promiseBackground(message) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10000;

    var request = new _promise2.default(function (resolve, reject) {
        try {
            forge_1.forge.message.broadcastBackground(message, data, resolve, reject);
        } catch (e) {
            reject(e);
            exports.emitError(e);
        }
    });
    return _promise2.default.race([request, util_1.delay(timeout).then(function () {
        throw new Error("Request to bg page (" + message + ") rejected by timeout");
    })]);
}
exports.promiseBackground = promiseBackground;
if (util_1.isBg()) dom_1.listen(document, 'grammarly:offline', function () {
    return exports.emitError('proxy dead');
}, undefined);

},{"./dom":155,"./forge":156,"./util":191,"babel-runtime/core-js/get-iterator":14,"babel-runtime/core-js/promise":24,"emitter":"emitter","lodash":"lodash"}],159:[function(require,module,exports){
/**
 * This file is a 'lightweight' subset of config.js which doesn't import heavy
 * modules like SparkMD5.
 *
 * Currently we re-export everything from this module in config.js.
 * When we have converted everything that uses config to TS, we can stop doing
 * than and use this newConfig directly.
 *
 * @module
 */
"use strict";

var forge = window.forge;
function isWE() {
    return !!(window.browser || window.chrome || {}).runtime;
}
exports.isWE = isWE;
function isFF() {
    return window.navigator.userAgent.indexOf('Firefox') !== -1;
}
exports.isFF = isFF;
function isChrome() {
    return !!window.chrome && /google/i.test(navigator.vendor);
}
exports.isChrome = isChrome;
function isSafari() {
    return (/^((?!chrome).)*safari/i.test(navigator.userAgent)
    );
}
exports.isSafari = isSafari;
function isSafari8() {
    return isSafari() && navigator.userAgent.indexOf('Version/8.0') !== -1;
}
exports.isSafari8 = isSafari8;
function isWindows() {
    return navigator.appVersion.indexOf('Win') !== -1;
}
exports.isWindows = isWindows;
function isBg() {
    return !!window.IS_BG;
}
exports.isBg = isBg;
function isPopup() {
    return !!window.IS_POPUP;
}
exports.isPopup = isPopup;
function isBgOrPopup() {
    return isBg() || isPopup();
}
exports.isBgOrPopup = isBgOrPopup;
function getBrowser() {
    return isChrome() ? 'chrome' : isFF() ? 'firefox' : isSafari() ? 'safari' : 'other';
}
exports.getBrowser = getBrowser;
function getVersion() {
    // @NOTE this is required for unit tests. forge is not defined
    // in unit test env and to fix that would require to mock forge
    // everywhere (since this getVersion function is eventually used
    // almost everywhere).
    if (!forge) return 'unknown';
    return forge.config.modules.parameters.version;
}
exports.getVersion = getVersion;
exports.ENV = "yes" === 'yes' ? 'prod' : 'dev';
var mpkey = 'c10dd64c87f70ef5563a63c368797e8c';
exports.MIXPANEL = {
    qaKey: '7a5c95b5cba1b225d00cc3ba1c410c78',
    key: mpkey,
    cookie: 'mp_' + mpkey + '_mixpanel'
};
exports.STATSC = {
    URL: 'https://stats-public.grammarly.io/',
    PREFIX: 'grammarly.ui'
};
exports.GRAMMARLY_DOMAIN = 'grammarly.com';
var GRAMMARLY = 'https://www.' + exports.GRAMMARLY_DOMAIN;
exports.DAPI = 'https://data.' + exports.GRAMMARLY_DOMAIN;
var app = 'https://app.' + exports.GRAMMARLY_DOMAIN;
var auth = 'https://auth.' + exports.GRAMMARLY_DOMAIN + '/v3';
var authUser = auth + '/user';
var welcomeFandS = GRAMMARLY + '/after_install_page';
exports.URLS = {
    app: app,
    appPersonalDictionary: app + '/profile/dictionary',
    capi: 'wss://capi.' + exports.GRAMMARLY_DOMAIN + '/freews',
    dapiMimic: exports.DAPI + '/api/mimic',
    dapiProps: exports.DAPI + '/api/props',
    editorDictionary: app + '/profile/dictionary',
    dictionary: 'https://capi.' + exports.GRAMMARLY_DOMAIN + '/api/defs',
    docs: app + '/docs',
    docsApi: 'https://dox.' + exports.GRAMMARLY_DOMAIN + '/documents',
    authSettings: authUser + '/settings',
    authCreatePage: auth + '/redirect-anonymous?location=' + welcomeFandS,
    userOrAnonymous: authUser + '/oranonymous',
    authSignin: auth + '/login',
    authSignup: auth + '/signup',
    signin: GRAMMARLY + '/signin',
    signup: GRAMMARLY + '/signup',
    resetPassword: GRAMMARLY + '/resetpassword',
    raven: 'felog.grammarly.io',
    newFelog: 'https://f-log-extension.grammarly.io',
    referral: GRAMMARLY + '/referral?page=extension',
    welcomeC: GRAMMARLY + '/extension-success',
    upgrade: GRAMMARLY + '/upgrade',
    uninstall: GRAMMARLY + '/extension-uninstall',
    terms: GRAMMARLY + '/terms',
    policy: GRAMMARLY + '/privacy-policy',
    pageConfigUrl: 'https://d3cv4a9a9wh0bt.cloudfront.net/browserplugin/config.json'
};
if (!"yes") {
    var _mpkey = exports.MIXPANEL.qaKey;
    exports.MIXPANEL.key = _mpkey;
    exports.MIXPANEL.cookie = 'mp_' + _mpkey + '_mixpanel';
    exports.STATSC.URL = 'https://stats-public-qane.grammarly.io/';
    exports.URLS.raven = '127.0.0.1:8000';
    exports.URLS.newFelog = 'https://127.0.0.1:8000';
}
var camelBrowser = getBrowser().slice(0, 1).toUpperCase() + getBrowser().slice(1);
exports.appName = 'extension' + camelBrowser;
exports.gnarAppName = getBrowser() + 'Ext';

},{}],160:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _exports$PAGE_CONFIG_;

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var lodash_1 = require("lodash");
var config_1 = require("lib/config");
exports.PROTOCOL_VERSION = '1.0';
exports.SITES_TO_RELOAD = ['inbox.google.com', 'mail.google.com', 'yahoo.com', 'mail.live.com', 'facebook.com', 'tumblr.com', 'stackoverflow.com', 'wordpress.com', 'wordpress.org', 'blogspot.com'];
exports.FACEBOOK_SITES = ['facebook.com', 'messenger.com', 'work.fb.com', 'business.facebook.com'];
exports.HTML_GHOST_SITES = ['twitter.com'].concat((0, _toConsumableArray3.default)(exports.FACEBOOK_SITES));
/**
 * Specify custom messages for unsupported domain
 */
exports.CUSTOM_UNSUPPORTED_MESSAGES = {
    'drive.google.com': {
        title: 'Google Drive',
        message: "We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class=\"openGrammarly\" href=\"" + config_1.URLS.app + "\">Grammarly Editor</a>."
    },
    'docs.google.com': {
        title: 'Google Drive',
        message: "We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class=\"openGrammarly\" href=\"" + config_1.URLS.app + "\">Grammarly Editor</a>."
    },
    'chrome.google.com': {
        title: 'Web Store'
    }
};
var UPDATE_30M = 30 * 60 * 1000; // 30m
var UPDATE_5M = 5 * 60 * 1000; // 5m
exports.PAGE_CONFIG_DEFAULT_INTERVAL = "yes" ? UPDATE_30M : UPDATE_5M;
exports.PAGE_CONFIG_UPDATE_INTERVALS = [10 * 60 * 1000, exports.PAGE_CONFIG_DEFAULT_INTERVAL, 60 * 60 * 1000, 3 * 60 * 60 * 1000, 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 365 * 24 * 60 * 60 * 1000 // turn off
];
/*
 * Rules that overrides page config from CDN
 * !!! Use with caution for development
 */
exports.OVERRIDE_PAGE_CONFIG = {};
/**
 * List of app-specific pages, not on CDN
 *
 * Keys:
 *   - enabled: boolean (default: true) - whether enabled on specific domain
 *   - matchInclusions: boolean (default: true) - apply rule to all domains
 *  that includes specified domain name
 *   - pages: {'/page/url': {rules} } - rules for specific page on domain
 *   - fields: {name, className, attr: [attrName, value]} - exclude specific fields on domain
 *   - disabledBrowsers: ['chrome', 'safari', 'firefox'] - disable domain on specific browser
 *   - minFieldHeight: number - minimum height of field on which Grammarly should be enabled
 *   - minFieldWidth: number - minimum width of field on which Grammarly should be enabled
 *   - servicePage: boolean (default: false) - browser service page
 *   - grammarlyEditor: boolean (default: false) - Grammarly Editor domain
 *   - dontShowDisableBadge: boolean (default: false) - don't show disabled badge for disabled domain
 *   - afterReplaceEvents: ['eventName'] - specific event that should be emitted
 *   after text replace from popup editor
 *   - subframes - DEPRECATED
 *   - track - DEPRECATED?
 */
exports.PAGE_CONFIG_INTERNAL = (_exports$PAGE_CONFIG_ = {
    'version': { enabled: false, servicePage: true },
    'extensions': { enabled: false, servicePage: true },
    'settings': { enabled: false, servicePage: true },
    'com.safari.grammarlyspellcheckergrammarchecker': { enabled: false, matchInclusions: true, servicePage: true }
}, (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, "app." + config_1.GRAMMARLY_DOMAIN, { enabled: false, grammarlyEditor: true }), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'linkedin.com', {
    pages: {
        '/messaging': {
            afterReplaceEvents: ['input']
        }
    }
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'plus.google.com', {
    afterReplaceEvents: ['keyup'],
    minFieldHeight: 0,
    minFieldWidth: 0
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'facebook.com', {
    minFieldHeight: 0
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'mail.google.com', {
    fields: [{ name: 'to' }, { name: 'cc' }, { name: 'bcc' }, { className: 'vO' }],
    subframes: false
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'drive.google.com', {
    track: true
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'docs.google.com', {
    track: true
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'app.asana.com', {
    fields: [{ className: 'task-row-text-input' }]
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'tumblr.com', {
    fields: [{ attr: ['aria-label', 'Post title'] }, { attr: ['aria-label', 'Type or paste a URL'] }]
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'chrome.google.com', {
    dontShowDisabledBadge: true
}), _exports$PAGE_CONFIG_);
/*
 * Backup copy of CDN config
 */
var PAGE_CONFIG_DEFAULT = {
    'hootsuite.com': { enabled: false },
    'chrome.google.com': { enabled: false },
    'facebook.com': {
        enabled: true,
        pages: {
            '.*\/notes': {
                enabled: false
            }
        }
    },
    'onedrive.live.com': { enabled: false },
    'docs.com': { enabled: false },
    'sp.docs.com': { enabled: false },
    'docs.google.com': { enabled: false },
    'drive.google.com': { enabled: false },
    'texteditor.nsspot.net': { enabled: false },
    'jsbin.com': { enabled: false },
    'jsfiddle.net': { enabled: false },
    'quora.com': { enabled: false },
    'paper.dropbox.com': { enabled: false },
    'mail.live.com': { enabled: false, matchInclusions: true },
    'imperavi.com': { enabled: false },
    'usecanvas.com': { enabled: false }
};
/*
 * Default page config. CDN config overrides any domain in the list
 */
exports.PAGE_CONFIG = {
    pageConfig: lodash_1.merge({}, PAGE_CONFIG_DEFAULT, exports.PAGE_CONFIG_INTERNAL)
};

},{"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/toConsumableArray":34,"lib/config":154,"lodash":"lodash"}],161:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var request_1 = require("lib/request");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var Footer = function (_React$Component) {
    (0, _inherits3.default)(Footer, _React$Component);

    function Footer() {
        (0, _classCallCheck3.default)(this, Footer);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Footer.__proto__ || (0, _getPrototypeOf2.default)(Footer)).apply(this, arguments));

        _this.addDocument = function () {
            function requestError(error) {
                console.error('request failed', error);
            }
            var go = function go(docId) {
                var url = config_1.URLS.docs + '/' + docId;
                // @TODO consider adding this metric back to new felog
                // call('statsc.ui.increment', 'activity:extension_popup_goto.footer')
                _this.props.openUrl(url);
            };
            return request_1.fetch(config_1.URLS.docsApi, {
                data: { content: '' },
                method: 'post',
                headers: { 'Content-Type': 'application/json' }
            }).then(function (_ref) {
                var id = _ref.id;
                return go(id);
            }).catch(requestError);
        };
        return _this;
    }

    (0, _createClass3.default)(Footer, [{
        key: "render",
        value: function render() {
            return React.createElement("div", { className: style.footer }, React.createElement("span", { onClick: this.addDocument, className: dom_1.cs(style.new_document, style.footer_btn) }, "New Document"), React.createElement("a", { href: config_1.URLS.app, target: "_blank", className: dom_1.cs(style.my_grammarly, style.footer_btn) }, "My Grammarly"));
        }
    }]);
    return Footer;
}(React.Component);

exports.Footer = Footer;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/config":154,"lib/dom":155,"lib/request":177,"react":"react"}],162:[function(require,module,exports){
"use strict";

var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var util_1 = require("lib/util");
var style = {
    "header": "_0cc899-header",
    "logo": "_0cc899-logo",
    "chrome": "_0cc899-chrome",
    "safari": "_0cc899-safari",
    "firefox": "_0cc899-firefox"
};
exports.Header = function () {
    return React.createElement("div", { className: style.header }, React.createElement("a", { target: "_blank", href: config_1.URLS.app, className: dom_1.cs(style.logo, style[util_1.getBrowser()]) }));
};

},{"lib/config":154,"lib/dom":155,"lib/util":191,"react":"react"}],163:[function(require,module,exports){
'use strict';

window.IS_POPUP = document.querySelector('.popup');
if (window.IS_POPUP) {
    require('./popup');
}

},{"./popup":165}],164:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var react_dom_1 = require("react-dom");
var react_redux_1 = require("react-redux");
var dom_1 = require("lib/dom");
var message = require("lib/message");
var tracking_1 = require("lib/tracking");
var signin_1 = require("./signin");
var settings_1 = require("./settings");
var unsupported_1 = require("./unsupported");

var MainView = function (_React$Component) {
    (0, _inherits3.default)(MainView, _React$Component);

    function MainView() {
        (0, _classCallCheck3.default)(this, MainView);
        return (0, _possibleConstructorReturn3.default)(this, (MainView.__proto__ || (0, _getPrototypeOf2.default)(MainView)).apply(this, arguments));
    }

    (0, _createClass3.default)(MainView, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.props.resize();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.props.resize({ force: true });
            // Proxy for popup links
            dom_1.on.call(react_dom_1.findDOMNode(this), 'click', function (e) {
                var target = e.target;
                var el = target.nodeName == 'A' ? target : target.parentNode.nodeName == 'A' ? target.parentNode : null;
                if (el) {
                    e.preventDefault();
                    _this2.processHrefClick(el);
                }
            });
        }
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {
            dom_1.on.call(document, 'popup-open', this.props.resize);
        }
    }, {
        key: "processHrefClick",
        value: function processHrefClick(_ref) {
            var href = _ref.href,
                dataset = _ref.dataset;

            if (dataset.fire) {
                tracking_1.fire.apply(tracking_1, (0, _toConsumableArray3.default)(dataset.fire.split(', ')));
            } else {}
            href && openUrl(href);
        }
    }, {
        key: "render",
        value: function render() {
            var _true$anonymous2;

            var props = this.props;
            var anonymous = props.user.anonymous,
                config = props.config;
            var enabled = config.enabled,
                servicePage = config.servicePage;

            var _true$anonymous = (_true$anonymous2 = {
                true: React.createElement(unsupported_1.UnsupportedComponent, props)
            }, (0, _defineProperty3.default)(_true$anonymous2, enabled || servicePage, React.createElement(settings_1.SettingsComponent, props)), (0, _defineProperty3.default)(_true$anonymous2, anonymous, React.createElement(signin_1.SigninComponent, props)), _true$anonymous2),
                component = _true$anonymous.true;

            return React.createElement("div", null, component);
        }
    }]);
    return MainView;
}(React.Component);

exports.MainView = MainView;
function closePopup() {
    dom_1.emitDomEvent('close-popup');
}
function updatePopupSize() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        force = _ref2.force;

    dom_1.emitDomEvent('update-window-size', { force: force });
}
function openUrl(url) {
    message.emitBackground('open-url', url);
    closePopup();
}
function renderMainView(store, actions) {
    var mapStateToProps = function mapStateToProps(state) {
        return state;
    };
    var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
        return { actions: actions };
    };
    var View = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(MainView);
    react_dom_1.render(React.createElement(react_redux_1.Provider, { store: store }, React.createElement(View, { close: closePopup, resize: updatePopupSize, openUrl: openUrl })), document.querySelector('.popup'));
}
exports.renderMainView = renderMainView;

},{"./settings":168,"./signin":174,"./unsupported":176,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"babel-runtime/helpers/toConsumableArray":34,"lib/dom":155,"lib/message":158,"lib/tracking":186,"react":"react","react-dom":"react-dom","react-redux":"react-redux"}],165:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var dom_1 = require("lib/dom");
var message = require("lib/message");
var tracking_1 = require("lib/tracking");
var store_mirror_1 = require("lib/store-mirror");
var util_1 = require("lib/util");
var main_view_1 = require("./main-view");
if (!"yes") {
    require('../test-api').api();
}
init().catch(function (e) {
    return console.log('EROROR: POPUP INIT', e.message);
});
function init() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var isInitialized, _store_mirror_1$creat, store, actions;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        isInitialized = false;

                        dom_1.addClass(document.documentElement, util_1.getBrowser());
                        util_1.isWindows() && dom_1.addClass(document.documentElement, 'windows');
                        _store_mirror_1$creat = store_mirror_1.createMirrorStore(function (data) {
                            if (isInitialized) return; // TODO: find better way to render popup once
                            isInitialized = true;
                            // @TODO consider adding this metric back to new felog
                            // call('statsc.ui.timing', 'stability:setting_popup.open', new Date() - initTime)
                            show(store, actions);
                        }), store = _store_mirror_1$creat.store, actions = _store_mirror_1$creat.actions;
                        // @TODO Asked Lesha why we need it. Works w/o it.
                        // const data = chrome.extension.getBackgroundPage().__popupState
                        // console.log('>> get bg data', data)
                        // store.dispatch({type: 'store/SYNC', data})

                        message.emitBackground('tab-connected', { tab: 'popup' });
                        util_1.asyncCall(function () {
                            return !isInitialized && tracking_1.logger.settingsPopupTimeout();
                        }, 2000);

                    case 6:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.init = init;
function track(state, actions) {
    var config = state.config,
        user = state.user,
        settings = state.settings;
    var enabled = config.enabled;

    tracking_1.fire('popup-open');
    if (user.anonymous) return;
    if (!enabled) {
        tracking_1.fire('popup-open-on-unsupported');
    } else {
        settings.showNews && actions.seenNews();
        if (user.referral) {
            tracking_1.fire('referral-shown', 'menu');
            !settings.referralNewsBadge && actions.seenReferrals();
        }
    }
}
exports.track = track;
function show(store, actions) {
    console.warn('RENDER FROM', store, actions);
    main_view_1.renderMainView(store, actions);
    util_1.isWE() ? track(store.getState(), actions) : document.addEventListener('popup-open', function () {
        track(store.getState(), actions);
        message.emitBackground('tab-connected', { tab: 'popup' });
    });
}

},{"../test-api":180,"./main-view":164,"babel-runtime/core-js/promise":24,"babel-runtime/regenerator":38,"lib/dom":155,"lib/message":158,"lib/store-mirror":179,"lib/tracking":186,"lib/util":191}],166:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var checkboxStyle = {
    "select_checkbox": "_a7c193-select_checkbox",
    "checkbox": "_a7c193-checkbox",
    "checkbox_check": "_a7c193-checkbox_check",
    "checkbox_check_round": "_a7c193-checkbox_check_round"
};
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var DefsSwitcher = function (_React$Component) {
    (0, _inherits3.default)(DefsSwitcher, _React$Component);

    function DefsSwitcher() {
        (0, _classCallCheck3.default)(this, DefsSwitcher);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DefsSwitcher.__proto__ || (0, _getPrototypeOf2.default)(DefsSwitcher)).apply(this, arguments));

        _this.onEnableDefsClick = function (e) {
            var actions = _this.props.actions;

            var enabled = e.target.checked;
            actions.toggleDefs(enabled);
            tracking_1.fire('change-defs', { enabled: enabled });
        };
        return _this;
    }

    (0, _createClass3.default)(DefsSwitcher, [{
        key: "render",
        value: function render() {
            var enabledDefs = this.props.settings.enabledDefs;

            var defsSwitcherCls = dom_1.cs(style.def_switcher, style.line, style.setting_item, enabledDefs ? style.on : style.off);
            return React.createElement("div", { className: defsSwitcherCls }, React.createElement("label", { className: checkboxStyle.select_checkbox }, "Show Definitions and Synonyms ", React.createElement("br", null), "via Double Clicks (All Sites)", React.createElement("input", { className: checkboxStyle.checkbox, onChange: this.onEnableDefsClick, checked: enabledDefs, type: "checkbox" }), React.createElement("div", { className: checkboxStyle.checkbox_check }, React.createElement("div", { className: checkboxStyle.checkbox_check_round }))), React.createElement("div", { className: style.short_border }));
        }
    }]);
    return DefsSwitcher;
}(React.Component);

exports.DefsSwitcher = DefsSwitcher;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/dom":155,"lib/tracking":186,"react":"react"}],167:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var style = {
    "line": "_177733-line",
    "dialect_switcher": "_177733-dialect_switcher",
    "select": "_177733-select",
    "selectWrap": "_177733-selectWrap"
};
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var AMERICAN_ENGLISH = 'american';
var BRITISH_ENGLISH = 'british';

var DialectLine = function (_React$Component) {
    (0, _inherits3.default)(DialectLine, _React$Component);

    function DialectLine() {
        (0, _classCallCheck3.default)(this, DialectLine);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DialectLine.__proto__ || (0, _getPrototypeOf2.default)(DialectLine)).apply(this, arguments));

        _this.onDialectChange = function (e) {
            var _this$props = _this.props,
                actions = _this$props.actions,
                dialectWeak = _this$props.dialectWeak;

            var dialectStrong = e.target.value;
            actions.updateSettings({ dialectStrong: dialectStrong });
            tracking_1.fire('change-dialect', { language: dialectStrong, dialectWeak: dialectWeak });
        };
        return _this;
    }

    (0, _createClass3.default)(DialectLine, [{
        key: "render",
        value: function render() {
            var dialect = this.props.dialectStrong || this.props.dialectWeak || AMERICAN_ENGLISH;
            var dialectSwitcherCls = dom_1.cs(style.line, style.dialect_switcher);
            return React.createElement("div", { className: dialectSwitcherCls }, React.createElement("span", null, "I write in"), React.createElement("div", { className: style.selectWrap }, React.createElement("select", { className: style.select, onChange: this.onDialectChange, value: dialect }, React.createElement("option", { value: AMERICAN_ENGLISH }, "American English"), React.createElement("option", { value: BRITISH_ENGLISH }, "British English"))));
        }
    }]);
    return DialectLine;
}(React.Component);

exports.DialectLine = DialectLine;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/dom":155,"lib/tracking":186,"react":"react"}],168:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var header_1 = require("../header");
var footer_1 = require("../footer");
var news_1 = require("./news");
var settings_content_1 = require("./settings-content");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var SettingsComponent = function (_React$Component) {
    (0, _inherits3.default)(SettingsComponent, _React$Component);

    function SettingsComponent() {
        (0, _classCallCheck3.default)(this, SettingsComponent);
        return (0, _possibleConstructorReturn3.default)(this, (SettingsComponent.__proto__ || (0, _getPrototypeOf2.default)(SettingsComponent)).apply(this, arguments));
    }

    (0, _createClass3.default)(SettingsComponent, [{
        key: "render",
        value: function render() {
            var _dom_1$cs;

            var _props = this.props,
                user = _props.user,
                settings = _props.settings,
                config = _props.config,
                activeTab = _props.activeTab;

            var cls = dom_1.cs(style.gr_popup_settings, user.premium ? style.upgraded : style.free, (_dom_1$cs = {}, (0, _defineProperty3.default)(_dom_1$cs, style.not_supported, !config.enabled), (0, _defineProperty3.default)(_dom_1$cs, style.no_fixes, !user.fixed_errors || isNaN(user.fixed_errors)), (0, _defineProperty3.default)(_dom_1$cs, style.show_news, settings.showNews && config.enabled), (0, _defineProperty3.default)(_dom_1$cs, style.has_favicon, !!activeTab.favIconUrl), _dom_1$cs));
            return React.createElement("div", { className: cls }, React.createElement("div", { className: style.content }, React.createElement(header_1.Header, null), React.createElement(news_1.News, this.props), React.createElement(settings_content_1.SettingsContent, this.props), React.createElement(footer_1.Footer, this.props)));
        }
    }]);
    return SettingsComponent;
}(React.Component);

exports.SettingsComponent = SettingsComponent;

},{"../footer":161,"../header":162,"./news":169,"./settings-content":171,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/dom":155,"react":"react"}],169:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var spark_md5_1 = require("spark-md5");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var tracking_1 = require("lib/tracking");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var News = function (_React$Component) {
    (0, _inherits3.default)(News, _React$Component);

    function News() {
        (0, _classCallCheck3.default)(this, News);

        var _this = (0, _possibleConstructorReturn3.default)(this, (News.__proto__ || (0, _getPrototypeOf2.default)(News)).apply(this, arguments));

        _this.closeNews = function () {
            var actions = _this.props.actions;

            actions.showNews(false);
            tracking_1.call('mixpanel.track', 'Ext:Close_News:Popup');
        };
        return _this;
    }

    (0, _createClass3.default)(News, [{
        key: "render",
        value: function render() {
            return React.createElement("div", { className: dom_1.cs(style.line, style.news) }, React.createElement("div", { onClick: this.closeNews, className: style.close_news }), React.createElement("div", { className: style.news_content }, React.createElement("h2", null, 'What\'s new in this update:'), React.createElement("ul", null, config_1.news.map(function (value) {
                return React.createElement("li", { key: spark_md5_1.hash(value) }, value);
            }))));
        }
    }]);
    return News;
}(React.Component);

exports.News = News;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/config":154,"lib/dom":155,"lib/tracking":186,"react":"react","spark-md5":"spark-md5"}],170:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var util_1 = require("lib/util");
var style = {
  "wrap": "_adb6eb-wrap",
  "line": "_adb6eb-line",
  "description": "_adb6eb-description",
  "inviteLink": "_adb6eb-inviteLink",
  "popupLine": "_adb6eb-popupLine",
  "newLabel": "_adb6eb-newLabel",
  "popupLink": "_adb6eb-popupLink"
};

var ReferralLine = function (_React$Component) {
  (0, _inherits3.default)(ReferralLine, _React$Component);

  function ReferralLine() {
    (0, _classCallCheck3.default)(this, ReferralLine);
    return (0, _possibleConstructorReturn3.default)(this, (ReferralLine.__proto__ || (0, _getPrototypeOf2.default)(ReferralLine)).apply(this, arguments));
  }

  (0, _createClass3.default)(ReferralLine, [{
    key: "isRibbonShow",
    value: function isRibbonShow() {
      var _props = this.props,
          extensionInstallDate = _props.extensionInstallDate,
          registrationDate = _props.registrationDate;

      return util_1.pastDays(registrationDate) < 14 || util_1.pastDays(extensionInstallDate) < 7;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", null, React.createElement("div", { className: dom_1.cs('setting_item', style.popupLine) }, React.createElement("div", { className: "short_border top" }), this.isRibbonShow() && React.createElement("span", { className: style.newLabel }, "New"), React.createElement("span", null, "Get Premium for Free"), React.createElement("a", { href: config_1.URLS.referral, "data-fire": "referral-clicked, menu", target: "_blank", className: style.popupLink }, "Invite Friends")));
    }
  }]);
  return ReferralLine;
}(React.Component);

exports.ReferralLine = ReferralLine;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/config":154,"lib/dom":155,"lib/util":191,"react":"react"}],171:[function(require,module,exports){
"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var summary_1 = require("./summary");
var dialect_line_1 = require("./dialect-line");
var referral_line_1 = require("./referral-line");
var defs_switcher_1 = require("./defs-switcher");
var site_switcher_1 = require("./site-switcher");
exports.SettingsContent = function (props) {
    return React.createElement("div", null, React.createElement(site_switcher_1.SiteSwitcher, props), React.createElement(defs_switcher_1.DefsSwitcher, props), React.createElement(dialect_line_1.DialectLine, (0, _extends3.default)({}, props, { dialectStrong: props.user.settings.dialectStrong, dialectWeak: props.settings.dialectWeak })), React.createElement(summary_1.Summary, props), props.user.referral && React.createElement(referral_line_1.ReferralLine, { extensionInstallDate: props.user.extensionInstallDate, registrationDate: props.user.registrationDate }));
};

},{"./defs-switcher":166,"./dialect-line":167,"./referral-line":170,"./site-switcher":172,"./summary":173,"babel-runtime/helpers/extends":30,"react":"react"}],172:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};
var checkboxStyle = {
    "select_checkbox": "_a7c193-select_checkbox",
    "checkbox": "_a7c193-checkbox",
    "checkbox_check": "_a7c193-checkbox_check",
    "checkbox_check_round": "_a7c193-checkbox_check_round"
};

var SiteSwitcher = function (_React$Component) {
    (0, _inherits3.default)(SiteSwitcher, _React$Component);

    function SiteSwitcher() {
        (0, _classCallCheck3.default)(this, SiteSwitcher);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SiteSwitcher.__proto__ || (0, _getPrototypeOf2.default)(SiteSwitcher)).apply(this, arguments));

        _this.onEnableGrammarClick = function (e) {
            var _this$props = _this.props,
                actions = _this$props.actions,
                pageDomain = _this$props.config.domain;

            var enabled = e.target.checked;
            actions.toggleSite(enabled, pageDomain);
            tracking_1.fire('change-grammar', { enabled: enabled, pageDomain: pageDomain });
        };
        return _this;
    }

    (0, _createClass3.default)(SiteSwitcher, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                config = _props.config,
                settings = _props.settings,
                activeTab = _props.activeTab,
                isCheckingEnabledOnDomain = config.enabled,
                enabled = settings.enabled && isCheckingEnabledOnDomain,
                disableLabel = !isCheckingEnabledOnDomain ? 'Checking is not supported' : 'Check for Grammar and Spelling';

            var siteSwitcherCls = dom_1.cs(style.site_switcher, style.line, style.setting_item, enabled ? style.on : style.off);
            return React.createElement("div", { className: siteSwitcherCls }, React.createElement("label", { className: checkboxStyle.select_checkbox }, disableLabel, React.createElement("br", null), " ", React.createElement("span", { className: style.domain }, React.createElement("span", { className: style.thin_text }, "on"), " ", React.createElement("span", { className: style.favicon }, React.createElement("img", { width: "16px", height: "16px", src: activeTab.favIconUrl })), config.domain), React.createElement("input", { className: checkboxStyle.checkbox, onChange: this.onEnableGrammarClick, checked: enabled, type: "checkbox" }), React.createElement("div", { className: dom_1.cs(checkboxStyle.checkbox_check, style.checkbox_check) }, React.createElement("div", { className: checkboxStyle.checkbox_check_round }))), React.createElement("div", { className: style.short_border }));
        }
    }]);
    return SiteSwitcher;
}(React.Component);

exports.SiteSwitcher = SiteSwitcher;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/dom":155,"lib/tracking":186,"react":"react"}],173:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var util_1 = require("lib/util");
var style = {
  "safari": "safari",
  "gr-popup-wrapper": "gr-popup-wrapper",
  "windows": "windows",
  "setting_item": "setting_item",
  "errors": "errors",
  "descr": "descr",
  "thin_text": "thin_text",
  "footer": "footer",
  "gr_popup_settings": "gr_popup_settings",
  "footer_btn": "footer_btn",
  "line": "line",
  "short_border": "short_border",
  "top": "top",
  "show_news": "show_news",
  "news": "news",
  "news_content": "news_content",
  "close_news": "close_news",
  "not_supported": "not_supported",
  "checkbox_check": "checkbox_check",
  "site_switcher": "site_switcher",
  "upgrade": "upgrade",
  "def_switcher": "def_switcher",
  "on": "on",
  "off": "off",
  "upgraded": "upgraded",
  "content": "content",
  "summary": "summary",
  "since": "since",
  "has_favicon": "has_favicon",
  "favicon": "favicon",
  "domain": "domain",
  "no_fixes": "no_fixes",
  "lblCount": "lblCount",
  "upgrade_title": "upgrade_title",
  "my_grammarly": "my_grammarly",
  "new_document": "new_document",
  "unsupported_site": "unsupported_site",
  "unsupported_item": "unsupported_item",
  "unsupported_title": "unsupported_title",
  "domain_in_details": "domain_in_details",
  "unsupported_temporary": "unsupported_temporary",
  "unsupported_permanently": "unsupported_permanently",
  "unsupported_grammarly": "unsupported_grammarly",
  "diamond": "diamond"
};

var Summary = function (_React$Component) {
  (0, _inherits3.default)(Summary, _React$Component);

  function Summary() {
    (0, _classCallCheck3.default)(this, Summary);
    return (0, _possibleConstructorReturn3.default)(this, (Summary.__proto__ || (0, _getPrototypeOf2.default)(Summary)).apply(this, arguments));
  }

  (0, _createClass3.default)(Summary, [{
    key: "render",
    value: function render() {
      var _props$user = this.props.user,
          premium = _props$user.premium,
          registrationDate = _props$user.registrationDate,
          fixedErrors = _props$user['fixed_errors'];

      var errorTypeLbl = premium ? 'critical and advanced' : 'critical',
          fixed = !fixedErrors || isNaN(fixedErrors) ? 0 : fixedErrors,
          fixedFormated = util_1.formatNumber(fixed) == '0' ? 'No' : util_1.formatNumber(fixed),
          lbl = util_1.declension(fixed, ['fix', 'fixes']),
          date = util_1.formatDate(registrationDate),
          dateStr = date ? 'since ' + date : '';
      return React.createElement("div", { className: dom_1.cs(style.line, style.summary) }, React.createElement("div", { className: style.errors }, React.createElement("span", { className: dom_1.cs(style.count, style.lblCount) }, fixedFormated), React.createElement("span", { className: style.descr }, errorTypeLbl, " ", React.createElement("span", { className: style.errorsLbl }, lbl), " ", React.createElement("span", { className: style.since }, dateStr))), React.createElement("div", { className: style.upgrade }, React.createElement("a", { href: config_1.URLS.upgrade, "data-fire": "hook-clicked, settings_toolbar", target: "_blank", className: style.upgrade_title }, "Go Premium to enable advanced fixes")));
    }
  }]);
  return Summary;
}(React.Component);

exports.Summary = Summary;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/config":154,"lib/dom":155,"lib/util":191,"react":"react"}],174:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var header_1 = require("./header");
var style = {
  "signin": "_eb0767-signin",
  "banner": "_eb0767-banner",
  "descr": "_eb0767-descr",
  "descr_title": "_eb0767-descr_title",
  "buttons": "_eb0767-buttons",
  "button": "_eb0767-button",
  "auth_button": "_eb0767-auth_button",
  "sign_up": "_eb0767-sign_up",
  "free": "_eb0767-free",
  "footer": "_eb0767-footer",
  "signin_link": "_eb0767-signin_link"
};

var SigninComponent = function (_React$Component) {
  (0, _inherits3.default)(SigninComponent, _React$Component);

  function SigninComponent() {
    (0, _classCallCheck3.default)(this, SigninComponent);
    return (0, _possibleConstructorReturn3.default)(this, (SigninComponent.__proto__ || (0, _getPrototypeOf2.default)(SigninComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SigninComponent, [{
    key: "render",
    value: function render() {
      return React.createElement("div", { className: style.signin }, React.createElement(header_1.Header, null), React.createElement("div", { className: style.content }, React.createElement("div", { className: style.banner }, "Grammarly is active, but", React.createElement("br", null), "key features are missing"), React.createElement("div", { className: style.descr }, React.createElement("div", { className: style.descr_title }, "Sign up now to unlock the following:"), React.createElement("ul", null, React.createElement("li", null, "Store your personal dictionary"), React.createElement("li", null, "Save and access your work from any computer"), React.createElement("li", null, "Get weekly writing statistics and tips"))), React.createElement("div", { className: style.buttons }, React.createElement("a", { href: config_1.URLS.signup, "data-fire": "login-attempt, settings_toolbar_sign_up", target: "__blank", className: dom_1.cs(style.button, style.auth_button), role: "button" }, React.createElement("span", { className: style.sign_up }, "Sign Up"), React.createElement("span", { className: style.free }, "It's free")))), React.createElement("div", { className: style.footer }, React.createElement("div", { className: style.login_text }, "Already have an account? ", React.createElement("a", { href: config_1.URLS.signin, "data-fire": "login-attempt, settings_toolbar_sign_in", target: "__blank", className: style.signin_link }, "Log in"))));
    }
  }]);
  return SigninComponent;
}(React.Component);

exports.SigninComponent = SigninComponent;

},{"./header":162,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/config":154,"lib/dom":155,"react":"react"}],175:[function(require,module,exports){
"use strict";

var React = require("react");
var dom_1 = require("lib/dom");
var style = {
  "safari": "safari",
  "gr-popup-wrapper": "gr-popup-wrapper",
  "windows": "windows",
  "setting_item": "setting_item",
  "errors": "errors",
  "descr": "descr",
  "thin_text": "thin_text",
  "footer": "footer",
  "gr_popup_settings": "gr_popup_settings",
  "footer_btn": "footer_btn",
  "line": "line",
  "short_border": "short_border",
  "top": "top",
  "show_news": "show_news",
  "news": "news",
  "news_content": "news_content",
  "close_news": "close_news",
  "not_supported": "not_supported",
  "checkbox_check": "checkbox_check",
  "site_switcher": "site_switcher",
  "upgrade": "upgrade",
  "def_switcher": "def_switcher",
  "on": "on",
  "off": "off",
  "upgraded": "upgraded",
  "content": "content",
  "summary": "summary",
  "since": "since",
  "has_favicon": "has_favicon",
  "favicon": "favicon",
  "domain": "domain",
  "no_fixes": "no_fixes",
  "lblCount": "lblCount",
  "upgrade_title": "upgrade_title",
  "my_grammarly": "my_grammarly",
  "new_document": "new_document",
  "unsupported_site": "unsupported_site",
  "unsupported_item": "unsupported_item",
  "unsupported_title": "unsupported_title",
  "domain_in_details": "domain_in_details",
  "unsupported_temporary": "unsupported_temporary",
  "unsupported_permanently": "unsupported_permanently",
  "unsupported_grammarly": "unsupported_grammarly",
  "diamond": "diamond"
};
var baseStyle = function baseStyle() {
  var pref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return dom_1.cs(style.line, style.unsupported_item, pref);
};
exports.DefaultUnsupportedComponent = function (_ref) {
  var favicon = _ref.favicon,
      domain = _ref.domain,
      customTitle = _ref.customTitle;

  var title = customTitle ? React.createElement("span", null, " ", customTitle, " Not Supported") : React.createElement("span", null, " ", React.createElement("span", { className: style.domain }, domain), " is Not Supported");
  return React.createElement("div", { className: baseStyle() }, React.createElement("span", { className: style.unsupported_title }, React.createElement("span", { className: style.favicon }, React.createElement("img", { width: "16px", height: "16px", src: favicon })), title), React.createElement("br", null), React.createElement("span", null, "For technical reasons, we currently do not check your text on this version of ", React.createElement("span", { className: dom_1.cs(style.domain, style.domain_in_details) }, domain)));
};
exports.CustomUnsupportedComponent = function (_ref2) {
  var favicon = _ref2.favicon,
      domain = _ref2.domain,
      customMessage = _ref2.customMessage;
  var message = customMessage.message,
      _customMessage$title = customMessage.title,
      title = _customMessage$title === undefined ? domain : _customMessage$title;

  return React.createElement("div", { className: baseStyle(style.unsupported_permanently) }, React.createElement("span", { className: style.unsupported_title }, React.createElement("span", { className: style.favicon }, React.createElement("img", { width: "16px", height: "16px", src: favicon })), " ", title, " Not Supported"), React.createElement("br", null), React.createElement("span", { dangerouslySetInnerHTML: { __html: message } }));
};
exports.TemporaryUnsupportedComponent = function (_ref3) {
  var favicon = _ref3.favicon,
      domain = _ref3.domain;
  return React.createElement("div", { className: baseStyle(style.unsupported_temporary) }, React.createElement("span", { className: style.unsupported_title }, "Checking Down on ", React.createElement("span", { className: style.favicon }, React.createElement("img", { width: "16px", height: "16px", src: favicon })), " ", React.createElement("span", { className: style.domain }, domain)), React.createElement("br", null), React.createElement("span", null, "There appears to be a temporary glitch affecting Grammarly's performance on ", React.createElement("span", { className: dom_1.cs(style.domain, style.domain_in_details) }, domain), ". Functionality should return soon."));
};
exports.GrammarlyUnsupportedComponent = function () {
  return React.createElement("div", { className: baseStyle(style.unsupported_grammarly) }, React.createElement("span", { className: "diamond" }), React.createElement("span", { className: "unsupported_title" }, "You Can't Improve on Perfection"), React.createElement("br", null), React.createElement("span", null, "Naturally, Grammarly's browser extension is disabled while you use the Grammarly Editor."));
};

},{"lib/dom":155,"react":"react"}],176:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = require("react");
var tracking_1 = require("lib/tracking");
var dom_1 = require("lib/dom");
var defaults_1 = require("lib/page-config/defaults");
var header_1 = require("../header");
var footer_1 = require("../footer");
var components_1 = require("./components");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};
function getUnsupportedComponent(_ref) {
    var domain = _ref.domain,
        favicon = _ref.favIconUrl,
        temporary = _ref.temporary,
        grammarlyEditor = _ref.grammarlyEditor;

    var domainCustomMessage = defaults_1.CUSTOM_UNSUPPORTED_MESSAGES[domain];
    var type = void 0,
        component = void 0;
    if (grammarlyEditor) {
        type = 'grammarly_editor';
        component = React.createElement(components_1.GrammarlyUnsupportedComponent, { favicon: favicon, domain: domain });
    } else if (domainCustomMessage && domainCustomMessage.message) {
        type = 'custom_message';
        component = React.createElement(components_1.CustomUnsupportedComponent, { customMessage: domainCustomMessage, favicon: favicon, domain: domain });
    } else if (temporary) {
        type = 'temporary';
        component = React.createElement(components_1.TemporaryUnsupportedComponent, { favicon: favicon, domain: domain });
    } else {
        type = 'default';
        component = React.createElement(components_1.DefaultUnsupportedComponent, { favicon: favicon, domain: domain, customTitle: domainCustomMessage && domainCustomMessage.title });
    }
    tracking_1.logger.settingsUsupportedShow(type);
    return component;
}
exports.getUnsupportedComponent = getUnsupportedComponent;

var UnsupportedComponent = function (_React$Component) {
    (0, _inherits3.default)(UnsupportedComponent, _React$Component);

    function UnsupportedComponent() {
        (0, _classCallCheck3.default)(this, UnsupportedComponent);
        return (0, _possibleConstructorReturn3.default)(this, (UnsupportedComponent.__proto__ || (0, _getPrototypeOf2.default)(UnsupportedComponent)).apply(this, arguments));
    }

    (0, _createClass3.default)(UnsupportedComponent, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                _props$config = _props.config,
                domain = _props$config.domain,
                temporary = _props$config.temporary,
                grammarlyEditor = _props$config.grammarlyEditor,
                favIconUrl = _props.activeTab.favIconUrl;

            var cls = dom_1.cs(style.gr_popup_settings, (0, _defineProperty3.default)({}, style.has_favicon, Boolean(favIconUrl)));
            var component = getUnsupportedComponent({ domain: domain, favIconUrl: favIconUrl, temporary: temporary, grammarlyEditor: grammarlyEditor });
            return React.createElement("div", { className: cls }, React.createElement("div", { className: dom_1.cs(style.content, style.unsupported_site) }, React.createElement(header_1.Header, this.props), component, React.createElement(footer_1.Footer, this.props)));
        }
    }]);
    return UnsupportedComponent;
}(React.Component);

exports.UnsupportedComponent = UnsupportedComponent;

},{"../footer":161,"../header":162,"./components":175,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/inherits":31,"babel-runtime/helpers/possibleConstructorReturn":32,"lib/dom":155,"lib/page-config/defaults":160,"lib/tracking":186,"react":"react"}],177:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var lodash_1 = require("lodash");
var config_1 = require("./config");
var util_1 = require("./util");
var message = require("./message");
var AJAX_TIMEOUT = 10000;
if (util_1.isBg()) {
    require('whatwg-fetch');
    message.on('fetch', function (data, cb) {
        return bgFetch(data).then(cb, function (error) {
            return cb({ error: error.message });
        });
    });
}
function transformOptions(opts) {
    if (opts.data && (opts.query || opts.method != 'post')) {
        opts.url += '?' + paramStr(opts.data);
    }
    if (opts.data && opts.method == 'post' && !opts.query && !opts.body) {
        try {
            opts.body = (0, _stringify2.default)(opts.data);
        } catch (e) {
            opts.body = {};
            console.warn(e);
        }
        opts.headers = opts.headers || {};
        opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
        delete opts.data;
    }
    opts.credentials = 'include';
    return opts;
}
exports.transformOptions = transformOptions;
function fetch(url) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // if (config.development && !forge) url = '/api?url=' + url
    opts.url = url;
    transformOptions(opts);
    if (util_1.isBg() || config_1.isTest) return bgFetch(opts);
    return message.promiseBackground('fetch', opts).then(function (data) {
        if (lodash_1.isObject(data) && data.error) {
            throw new Error(data.error);
        }
        return data;
    });
}
exports.fetch = fetch;
function bgFetch(opts) {
    var url = opts.url;

    delete opts.url;
    function processResponse(resp) {
        if (resp.ok) {
            return resp[opts.isText ? 'text' : 'json']();
        }
        return resp.text().then(function (body) {
            throw {
                name: 'RequestError',
                body: body,
                statusCode: resp.status,
                message: resp.statusText
            };
        });
    }
    return _promise2.default.race([window.fetch(url, opts).then(processResponse).then(function (res) {
        if (res.error) throw new Error(res.error);
        return res;
    }), util_1.delay(opts.timeout || AJAX_TIMEOUT).then(function () {
        throw new Error("Fetch request to " + url + " rejected by timeout");
    })]);
}
function paramStr(data) {
    var req = '';

    var _loop = function _loop(item) {
        if (Array.isArray(data[item])) {
            if (data[item].length) {
                req += "" + (req.length ? '&' : '') + data[item].map(function (val) {
                    return item + "=" + val;
                }).join('&'); // eslint-disable-line no-loop-func
            }
        } else {
            req += "" + (req.length ? '&' : '') + item + "=" + encodeURIComponent(data[item]);
        }
    };

    for (var item in data) {
        _loop(item);
    }
    return req;
}
exports.paramStr = paramStr;

},{"./config":154,"./message":158,"./util":191,"babel-runtime/core-js/json/stringify":16,"babel-runtime/core-js/promise":24,"lodash":"lodash","whatwg-fetch":"whatwg-fetch"}],178:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var lodash_1 = require("lodash");
var util_1 = require("lib/util");
function observeStore(store, onChange) {
    var currentState = void 0;
    function handleChange() {
        var nextState = store.getState();
        if (!lodash_1.isEmpty(nextState) && !lodash_1.isEqual(currentState, nextState)) {
            currentState = nextState;
            onChange(nextState);
        }
    }
    util_1.asyncCall(handleChange);
    return store.subscribe(handleChange);
}
exports.observeStore = observeStore;
exports.bindActions = function (pureActions, dispatch) {
    return (0, _keys2.default)(pureActions).filter(function (action) {
        return pureActions[action];
    }).reduce(function (obj, action) {
        return (0, _assign2.default)(obj, (0, _defineProperty3.default)({}, action, function () {
            var res = pureActions[action].apply(pureActions, arguments);
            var sync = typeof res.sync == 'undefined' ? true : res.sync;
            return dispatch((0, _assign2.default)({}, res, { sync: sync }));
        }));
    }, {});
};

},{"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/defineProperty":29,"lib/util":191,"lodash":"lodash"}],179:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var createLogger = require("redux-logger");
var redux_1 = require("redux");
var message = require("lib/message");
var bgActions = require("lib/bg/features/actions");
var helpers_1 = require("./helpers");
var util_1 = require("../util");
var logger = createLogger({
    level: 'debug',
    collapsed: function collapsed() {
        return true;
    },
    predicate: function predicate() {
        return !"yes";
    }
});
var SYNC = 'store/SYNC';
var initialState = {
    page: {},
    connection: {}
};
function createMirrorStore(onUpdate) {
    var pureActions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var reducer = arguments[2];

    var baseReducer = function baseReducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];

        var domain = (state.page || state.config || {}).domain;
        action.sync && message.emitBackground('dispatch', (0, _assign2.default)({}, action, { domain: domain }));
        if (action.type == SYNC) return (0, _assign2.default)({}, state, action.data);
        return reducer ? reducer(state, action) : state;
    };
    var store = redux_1.createStore(baseReducer, {}, redux_1.applyMiddleware(logger));
    var actions = helpers_1.bindActions((0, _assign2.default)({}, bgActions.pureActions, pureActions), store.dispatch);
    message.on('state', function (data) {
        util_1.asyncCall(function () {
            return store.dispatch({ type: SYNC, data: data });
        }, 0); // FIXME: Prevent dispatch in dispatch
    });
    helpers_1.observeStore(store, onUpdate);
    return { store: store, actions: actions };
}
exports.createMirrorStore = createMirrorStore;

},{"../util":191,"./helpers":178,"babel-runtime/core-js/object/assign":17,"lib/bg/features/actions":149,"lib/message":158,"redux":"redux","redux-logger":"redux-logger"}],180:[function(require,module,exports){
"use strict";

var dom_1 = require("./dom");
var message = require("./message");
function api() {
    dom_1.listen(document, 'bg-reload', emitBgReload);
    dom_1.listen(document, 'reset', emitReset);
    dom_1.listen(document, 'get-extid', getExtId);
    dom_1.listen(document, 'get-capi-log', getCapiLog);
    dom_1.listen(document, 'get-tracker-log', getTrackerLog);
    dom_1.listen(document, 'get-localforage', getLocalforage);
    dom_1.listen(document, 'set-localforage', setLocalforage);
    dom_1.listen(document, 'get-pref', getPrefs);
    dom_1.listen(document, 'set-prefs', setPrefs);
    function emitBgReload() {
        message.emitBackground('bg-reload', {});
    }
    function emitReset() {
        message.emitBackground('reset', {});
    }
    function getTrackerLog() {
        message.emitBackground('get-tracker-log', {}, function (result) {
            return dom_1.emitDomEvent('tracker-log', result);
        });
    }
    function getCapiLog() {
        message.emitBackground('get-capi-log', {}, function (result) {
            return dom_1.emitDomEvent('capi-log', result);
        });
    }
    function getExtId() {
        message.emitBackground('get-extid', {}, function (result) {
            return dom_1.emitDomEvent('extid', result);
        });
    }
    function getLocalforage() {
        message.emitBackground('get-localforage', {}, function (result) {
            return dom_1.emitDomEvent('localforage', result);
        });
    }
    function setLocalforage(e) {
        message.emitBackground('set-localforage', { key: e.key, value: e.value }, function (result) {
            return dom_1.emitDomEvent('localforage', result);
        });
    }
    function getPrefs(_ref) {
        var key = _ref.key;

        message.emitBackground('get-pref', { key: key }, function (value) {
            return dom_1.emitDomEvent('pref', { key: key, value: value });
        });
    }
    function setPrefs(_ref2) {
        var key = _ref2.key,
            value = _ref2.value;

        message.emitBackground('set-pref', { key: key, value: value });
    }
}
exports.api = api;

},{"./dom":155,"./message":158}],181:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var cookie_1 = require("cookie");
var preMixpanel = require("vendor/mixpanel");
var loadMixpanel = require("vendor/mixpanel-2.2");
var cookie_2 = require("../bg/cookie");
var location_1 = require("../location");
var config = require("../config");
var util_1 = require("../util");
var config_1 = require("../config");
var call_1 = require("./call");
var tracker_1 = require("./tracker");
var logger_1 = require("./logger");
var gnarclientweb_1 = require("@grammarly-npm/gnarclientweb");
var telemetry_ts_1 = require("@grammarly-npm/telemetry.ts");
var getMixpanelCookie = function getMixpanelCookie() {
    return cookie_2.getCookie(config_1.MIXPANEL.cookie).catch(function () {
        return '';
    });
};
function createGnarClient() {
    // just use window.fetch - no need to rewrite anything as Gnar expects a raw fetch object
    var fetchFn = window.fetch.bind(window);
    var logger = telemetry_ts_1.LoggingImpl.DefaultLogAppender.createRootLogger('gnar', telemetry_ts_1.Logging.LogLevel.INFO, new telemetry_ts_1.LoggingImpl.GetFelogClient(config.URLS.newFelog, config.appName, config.getVersion(), config.ENV, fetchFn));
    var metrics = telemetry_ts_1.TimeSeriesImpl.MetricsStorage.createRoot('gnar', config.URLS.newFelog, fetchFn);
    var backendStorage = new gnarclientweb_1.BackendStorage(fetchFn, config_1.GNAR.url);
    var chromeCookieStorage = new gnarclientweb_1.ChromeCookieStorage(config_1.GNAR.url, config_1.GNAR.domain);
    var webExtensionsCookieStorage = new gnarclientweb_1.WebExtensionsCookieStorage(config_1.GNAR.url, config_1.GNAR.domain);
    var cidManager = new gnarclientweb_1.ContainerIdManager(util_1.isChrome() ? chromeCookieStorage : util_1.isFF() ? webExtensionsCookieStorage : backendStorage, [new gnarclientweb_1.CookieStorage(config_1.GNAR.domain), new gnarclientweb_1.LocalStorage(), new gnarclientweb_1.MemoryStorage()], logger.getLogger('containerId'), metrics.getCounter('containerId'), util_1.isChrome() ? 1000 : 5000);
    return new gnarclientweb_1.GnarClientImpl(config_1.GNAR.url, config.gnarAppName, config_1.getVersion(), fetchFn, cidManager, logger, metrics, true);
}
function init() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var cookieMP;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        preMixpanel();
                        loadMixpanel();
                        require('tracker');
                        tracker_1.tracker().init({
                            mixpanel: {
                                key: config_1.MIXPANEL.key,
                                qaKey: config_1.MIXPANEL.qaKey,
                                dapi: config_1.DAPI
                            }
                        });
                        // @TODO log unhandled exceptions here!
                        try {
                            tracker_1.tracker().gnar = createGnarClient();
                        } catch (error) {
                            logger_1.logger.gnarClientInitFail(error && error.message);
                        }
                        // init MP for users, which have MP cookie already
                        _context.next = 7;
                        return getMixpanelCookie();

                    case 7:
                        cookieMP = _context.sent;

                        if (cookieMP) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt("return");

                    case 10:
                        // @TODO mixpanel typings
                        window.mixpanel.persistence.load();
                        call_1.call('mixpanel.setProps', {
                            gProduct: "Extension-" + util_1.getBrowser(),
                            fullProductVersion: config_1.getVersion()
                        }, 'Ext');

                    case 12:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.init = init;
function processCookiesFromGrammarly(_ref) {
    var mpCookie = _ref.mpCookie,
        dapi = _ref.dapi;

    var domain = location_1.getDomain(undefined, undefined),
        cookieOptions = {
        path: '/',
        domain: domain,
        // year from now
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };
    updateId(config_1.MIXPANEL.cookie, mpCookie);
    updateId('__fngrprnt__', dapi);
    function updateId(name, value) {
        if (!value || !name) return;
        cookie_1.default(name, null);
        cookie_1.default(name, value, cookieOptions);
    }
}
exports.processCookiesFromGrammarly = processCookiesFromGrammarly;
exports.getContainerIdOrUndefined = function () {
    return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return tracker_1.tracker().gnar.getContainerId();

                    case 3:
                        return _context2.abrupt("return", _context2.sent);

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2["catch"](0);
                        return _context2.abrupt("return", undefined);

                    case 9:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 6]]);
    }));
};

},{"../bg/cookie":148,"../config":154,"../location":157,"../util":191,"./call":182,"./logger":187,"./tracker":190,"@grammarly-npm/gnarclientweb":3,"@grammarly-npm/telemetry.ts":6,"babel-runtime/core-js/promise":24,"babel-runtime/regenerator":38,"cookie":"cookie","tracker":"tracker","vendor/mixpanel":"vendor/mixpanel","vendor/mixpanel-2.2":"vendor/mixpanel-2.2"}],182:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var message = require("../message");
var util_1 = require("../util");
var tracker_1 = require("./tracker");
var felogPixel_1 = require("./felogPixel");
var config = require("../config");
var felogClient_1 = require("./felogClient");
var bgPageCallImpls;
(function (bgPageCallImpls) {
    var felogClient = new felogClient_1.DefaultFelogClient(config.URLS.newFelog, config.appName, config.getVersion(), config.ENV, fetch.bind(window));
    /**
     * This should contain the implementations of methods which will be ran
     * on the background page and NOTHING ELSE.
     *
     * IMPORTANT requirement of these remotely-callable functions is that they
     * return `void`. You can't return anything from these functions, because
     * our content<->bg 'RPC' doesn't support that.
     *
     * ////// D.A.N.G.E.R. //////
     *
     * DON'T PUT ANYTHING in here except functions that will be executed on the
     * background page. If you need something in these functions, you can put it
     * at the top of the upper level namespace.
     *
     * ////// D.A.N.G.E.R. //////
     */
    var methods;
    (function (methods) {
        function sendFelog(logger, message, level, extra) {
            felogClient.sendEvent(logger, message, level, extra).catch(function (_) {
                return felogPixel_1.sendEventPixel(logger, message, level, extra);
            });
        }
        methods.sendFelog = sendFelog;
    })(methods = bgPageCallImpls.methods || (bgPageCallImpls.methods = {}));
    // @TODO versioning??
    bgPageCallImpls.CALL_HANDLER_ID = 'tracking/RPC';
})(bgPageCallImpls || (bgPageCallImpls = {}));
/**
 * This is a collection of remote calls that you can make to the
 * background page. The code will be dispatched to be executed on the
 * background page, if not already running there.
 */
exports.callBgPage = (0, _keys2.default)(bgPageCallImpls.methods).reduce(function (o, k) {
    o[k] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return call.apply(undefined, [bgPageCallImpls.CALL_HANDLER_ID, k].concat(args));
    };
    return o;
}, {});
var log = [];
function call(msg) {
    for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
    }

    var fallback = function fallback(e) {
        console.warn("tracking call " + msg + " failed, reason: ", e); // tslint:disable-line no-console
    };
    if (util_1.isBg()) {
        util_1.asyncCall(function () {
            var _bgPageCallImpls$meth;

            try {
                logCall(msg, data);
                switch (msg) {
                    case bgPageCallImpls.CALL_HANDLER_ID:
                        var method = data[0];
                        var args = data.slice(1);
                        (_bgPageCallImpls$meth = bgPageCallImpls.methods)[method].apply(_bgPageCallImpls$meth, (0, _toConsumableArray3.default)(args));
                        break;
                    default:
                        runMessage(msg, data);
                        break;
                }
            } catch (e) {
                fallback(e);
            }
        }, 20);
    } else {
        (function () {
            var WAIT_TIMEOUT = 10000;
            var timeout = void 0;
            var preventTimeout = function preventTimeout() {
                return clearInterval(timeout);
            };
            var errorHandle = function errorHandle(e) {
                preventTimeout();
                fallback(e);
            };
            timeout = window.setTimeout(function () {
                return errorHandle('timeout call through bg page');
            }, WAIT_TIMEOUT);
            message.emitBackground('tracking-call', { msg: msg, data: data }, preventTimeout, errorHandle);
        })();
    }
}
exports.call = call;
function runMessage(msg, data) {
    var args = msg.split('.'),
        method = args.pop(),
        ctx = args.reduce(function (closure, part) {
        return part in closure ? closure[part] : {};
    }, tracker_1.tracker());
    if (!ctx || !method || !ctx[method]) return console.error("No method " + msg + " in tracker object");
    ctx[method].apply(ctx, (0, _toConsumableArray3.default)(data));
}
function logCall(msg, data) {
    // @TODO do we need this?
    console.info(msg, data);
    if (!"yes") {
        log.push((0, _assign2.default)({ msg: msg }, data));
    }
}
function getLog() {
    var result = log.slice(0);
    log.length = 0;
    return result;
}
exports.getLog = getLog;

},{"../config":154,"../message":158,"../util":191,"./felogClient":184,"./felogPixel":185,"./tracker":190,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/toConsumableArray":34}],183:[function(require,module,exports){
"use strict";
// we agreed to have just three log levels with Zava.
// though now the official readme for platform-felog lists four...
// so I guess it can be any number for the time being.

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 0] = "INFO";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
(function (LogLevel) {
    function toFelogString(l) {
        switch (l) {
            case LogLevel.INFO:
                return 'INFO';
            case LogLevel.WARN:
                return 'WARN';
            case LogLevel.ERROR:
                return 'ERROR';
            default:
                var _ = l;
                throw new TypeError("Unrecognized log level " + l);
        }
    }
    LogLevel.toFelogString = toFelogString;
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/**
 * Creates a URL for a get request to f-log, according to
 * platform-felog spec.
 */
function felogRequestUrl(appName, appVersion, env, baseUrl, loggerName, message, level, extra) {
    var payload = {
        message: message,
        logger: loggerName,
        level: LogLevel.toFelogString(level),
        application: appName,
        version: appVersion,
        env: env
    };
    if (extra) payload.extra = extra;
    return baseUrl + "/log?json=" + encodeURIComponent((0, _stringify2.default)(payload));
}
exports.felogRequestUrl = felogRequestUrl;

},{"babel-runtime/core-js/json/stringify":16}],184:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var timeseries_impl_1 = require("@grammarly-npm/telemetry.ts/lib/timeseries_impl");
var felog_1 = require("./felog");
/**
 * Default felog client implementation. Uses a simple fetch for events.
 * No queues, no buffering, no retries.
 *
 * For metrics, uses telemetry.ts implementation.
 *
 * @TODO maybe we should use telemetry.ts for events as well?
 */

var DefaultFelogClient = function () {
    function DefaultFelogClient(_baseUrl, _appName, _appVersion, _env, _fetch) {
        (0, _classCallCheck3.default)(this, DefaultFelogClient);

        this._baseUrl = _baseUrl;
        this._appName = _appName;
        this._appVersion = _appVersion;
        this._env = _env;
        this._fetch = _fetch;
        this._metrics = timeseries_impl_1.MetricsStorage.createRoot(this._env + "." + this._appName, this._baseUrl, this._fetch);
    }

    (0, _createClass3.default)(DefaultFelogClient, [{
        key: "sendEvent",
        value: function sendEvent(loggerName, message, level, extra) {
            return this._fetch(felog_1.felogRequestUrl(this._appName, this._appVersion, this._env, this._baseUrl, loggerName, message, level, extra), { mode: 'no-cors', method: 'get', cache: 'no-cache' }).then(function (_) {}).catch(function (_) {
                // ignore errors
                // @TODO should we log it to console? Since this is only running on
                // the bg page. Perhaps in dev mode only?
            });
        }
    }, {
        key: "sendCounter",
        value: function sendCounter(name, delta) {
            this._metrics.getCounter(name).increment(delta);
        }
    }, {
        key: "sendTimer",
        value: function sendTimer(name, time) {
            this._metrics.getTimer(name).recordTime(time);
        }
    }]);
    return DefaultFelogClient;
}();

exports.DefaultFelogClient = DefaultFelogClient;

},{"./felog":183,"@grammarly-npm/telemetry.ts/lib/timeseries_impl":11,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],185:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require("../newConfig");
var felog_1 = require("./felog");
function sendEventPixel(loggerName, message, level, extra) {
    var img = document.createElement('img');
    img.src = felog_1.felogRequestUrl(config.appName, config.getVersion(), config.ENV, config.URLS.newFelog, loggerName, message, level, extra);
    return _promise2.default.resolve();
}
exports.sendEventPixel = sendEventPixel;
// @TODO implement metrics pixel for proxy.ts

},{"../newConfig":159,"./felog":183,"babel-runtime/core-js/promise":24}],186:[function(require,module,exports){
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util_1 = require("../util");
var message = require("../message");
var config_1 = require("../config");
var call_1 = require("./call");
var logger_1 = require("./logger");
exports.logger = logger_1.logger;
var call_2 = require("./call");
exports.call = call_2.call;
exports.getLog = call_2.getLog;
var on = {};
function initBg() {
    var _require = require('./bgonly'),
        init = _require.init,
        processCookiesFromGrammarly = _require.processCookiesFromGrammarly;

    init().catch(function (_) {
        return logger_1.logger.bgTrackingInitFail();
    });
    on = require('./on').on;
    message.on('tracking-fire', function (_ref) {
        var msg = _ref.msg,
            data = _ref.data;
        return fire.apply(undefined, [msg].concat((0, _toConsumableArray3.default)(data)));
    });
    message.on('tracker-init', processCookiesFromGrammarly);
    message.on('tracking-call', function (_ref2) {
        var msg = _ref2.msg,
            data = _ref2.data;
        var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : util_1._f;

        call_1.call.apply(call_1, [msg].concat((0, _toConsumableArray3.default)(data)));
        cb();
    });
    fire('activity-ping');
}
exports.initBg = initBg;
function fire(msg) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
    }

    if (util_1.isBg()) {
        if (!on[msg]) return console.error("No handler specified for message: " + msg);
        util_1.asyncCall(function () {
            var _on;

            return (_on = on)[msg].apply(_on, data);
        }, 20);
    } else {
        message.emitBackground('tracking-fire', { msg: msg, data: data });
    }
}
exports.fire = fire;
function initContentScript() {
    var times = 0;
    var pageCookie = require('cookie');
    if (pageCookie.default) pageCookie = pageCookie.default;
    var interval = setInterval(getCookies, 500),
        MAX = 10;
    function getCookies() {
        times++;
        if (times > MAX) clearInterval(interval);
        var data = {
            'mpCookie': pageCookie(config_1.MIXPANEL.cookie),
            'gnar': pageCookie('gnar_containerId'),
            'dapi': pageCookie('__fngrprnt__')
        };
        if (!data.mpCookie) return;
        clearInterval(interval);
        message.emitBackground('tracker-init', data);
    }
}
exports.initContentScript = initContentScript;

},{"../config":154,"../message":158,"../util":191,"./bgonly":181,"./call":182,"./logger":187,"./on":188,"babel-runtime/helpers/toConsumableArray":34,"cookie":"cookie"}],187:[function(require,module,exports){
"use strict";

var call_1 = require("./call");
var telemetry_1 = require("./telemetry");
var newConfig_1 = require("../newConfig");
// @TODO rename this when all usages are from TypeScript
exports.logger = new telemetry_1.Telemetry(call_1.callBgPage.sendFelog.bind(call_1.callBgPage));
function logUnhandledErrors() {
    window.addEventListener('error', function (e) {
        return exports.logger.unhandledBgPageException(e);
    });
    // unhandledrejection from native promise. Polyfilled version (es6.promise) would be skipped
    window.addEventListener('unhandledrejection', function (e) {
        return exports.logger.unhandledBgPageRejection(e);
    });
}
// log unhandled errors on background page only
// @TODO move this call to bg page initialization code for
// explicit execution order
if (newConfig_1.isBg()) {
    console.info('Installing unhandled error loggers...'); // tslint:disable-line no-console
    logUnhandledErrors();
}

},{"../newConfig":159,"./call":182,"./telemetry":189}],188:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _exports$on;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var prefs_1 = require("../bg/prefs");
var util_1 = require("../util");
var call_1 = require("./call");
var logger_1 = require("./logger");
// tslint:disable function-name
exports.on = (_exports$on = {}, (0, _defineProperty3.default)(_exports$on, 'activity-ping', function activityPing() {
    // @TODO consider adding this metric back to new felog
    /*
    const toPercent = (val: number) =>
      parseFloat(String(Math.round(val * 100 * 100) / 100)).toFixed(2)
         setInterval(() => {
      if (!isWE()) {
        return call('statsc.ui.increment', 'activity:activity_ping')
      }
           if (window.chrome.system && window.chrome.system.cpu) {
        window.chrome.system.cpu.getInfo(info => {
          const __load = toPercent(
            info.processors
              .map(processor =>
                (processor.usage.total - processor.usage.idle) / processor.usage.total)
              .reduce((avg, cpu, _, total) => avg + cpu / total.length, 0)
          )
               const { usedJSHeapSize, totalJSHeapSize } = (window.performance as any).memory
               call('statsc.ui.increment', 'activity:activity_ping')
          call('statsc.ui.gauge', {
            'performance:memory_used': usedJSHeapSize,
            'performance:memory_used_of_total':
              toPercent((totalJSHeapSize - usedJSHeapSize) / totalJSHeapSize),
            'performance:cpu_load': load
          })
        })
      }
         }, FELOG.pingTimeout)
    */
}), (0, _defineProperty3.default)(_exports$on, 'daily-ping', function dailyPing(id, cookiesDisabled) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var pingDate, _pingDate$split, _pingDate$split2, storageNextDate, oldId, newId;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (id) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return");

                    case 2:
                        // GnarClient has it's own logic on dailyPings timeouts.
                        call_1.call('gnar.pingMaybe');
                        _context.next = 5;
                        return prefs_1.prefs.get('pingDate');

                    case 5:
                        pingDate = _context.sent;

                        if (typeof pingDate !== 'string') pingDate = '';
                        _pingDate$split = pingDate.split('|'), _pingDate$split2 = (0, _slicedToArray3.default)(_pingDate$split, 2), storageNextDate = _pingDate$split2[0], oldId = _pingDate$split2[1];
                        newId = cookiesDisabled ? 'cookiesDisabled' : id;

                        if (!(storageNextDate && storageNextDate > Date.now() && oldId === newId)) {
                            _context.next = 11;
                            break;
                        }

                        return _context.abrupt("return");

                    case 11:
                        call_1.call('mixpanel.dapiEvent', 'Daily_Ping', {
                            gProduct: "Extension-" + util_1.getBrowser()
                        });
                        call_1.call('mixpanel.track', 'Ext:Daily_Ping');
                        logger_1.logger.dailyPing();
                        prefs_1.prefs.set('pingDate', [util_1.getNextPingDate(), newId].join('|'));

                    case 15:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}), (0, _defineProperty3.default)(_exports$on, 'app_signin_success', function app_signin_success() {
    call_1.call('mixpanel.track', 'G:User_Login_Succeeded');
    call_1.call('gnar.track', 'userLoginForm/accepted');
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:app_signin_success')
}), (0, _defineProperty3.default)(_exports$on, 'app_signup_success', function app_signup_success() {
    call_1.call('mixpanel.track', 'G:User_Account_Created');
    call_1.call('gnar.track', 'userAccountSignupForm/accepted');
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:app_signup_success')
}), (0, _defineProperty3.default)(_exports$on, 'signin-error', function signinError(error) {
    error.errorType = 'Server-Side';
    call_1.call('mixpanel.track', 'G:User_Login_Rejected');
    call_1.call('gnar.track', 'userLoginForm/rejected');
}), (0, _defineProperty3.default)(_exports$on, 'signup-error', function signupError(error) {
    error.errorType = 'Server-Side';
    call_1.call('mixpanel.track', 'G:User_Signup_Rejected');
    call_1.call('gnar.track', 'userAccountSignupForm/rejected');
}), (0, _defineProperty3.default)(_exports$on, 'upgrade-after-register', function upgradeAfterRegister() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        call_1.call('mixpanel.track', 'NE:Account_Type_Selected', {
                            accountTypeSelected: 'premium'
                        });
                        call_1.call('gnar.track', 'Account_Type_Selected');

                    case 2:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}), (0, _defineProperty3.default)(_exports$on, 'hook-clicked', function hookClicked(placement) {
    var data = { placement: placement };
    call_1.call('gnar.track', 'upgradeHookClicked', data);
    call_1.call('mixpanel.track', 'Ext:Upgrade_To_Plus_Clicked', data);
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', `activity:upgrade.${placement}.click`)
    logger_1.logger.userUpgradeClick(placement);
}), (0, _defineProperty3.default)(_exports$on, 'correct-btn-clicked', function correctBtnClicked() {
    call_1.call('mixpanel.track', 'Ext:Gbutton_Clicked');
    call_1.call('gnar.track', 'gbuttonClicked');
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:editor.gbutton_clicked')
    logger_1.logger.gButtonClick();
}), (0, _defineProperty3.default)(_exports$on, 'btn-disable-in-field', function btnDisableInField(enabled) {
    call_1.call('mixpanel.track', 'Ext:Checking_in_field_toggled', { enabled: enabled });
    call_1.call('gnar.track', 'checkingInFieldToggled', { enabled: enabled });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', `stability:disable_in_field.${enabled ? 'on' : 'off'}`)
    logger_1.logger.checkingToggledInField(enabled);
}), (0, _defineProperty3.default)(_exports$on, 'button-change-state', function buttonChangeState() {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:g_button_minimize_toggled')
}), (0, _defineProperty3.default)(_exports$on, 'login-attempt', function loginAttempt(placement) {
    call_1.call('gnar.track', 'signInClicked', { placement: placement });
    call_1.call('mixpanel.track', 'Ext:Sign_In_Clicked', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'show-dictionary', function showDictionary() {
    call_1.call('gnar.track', "showDictionary");
    call_1.call('mixpanel.track', 'Ext:Show_Dictionary');
}), (0, _defineProperty3.default)(_exports$on, 'referral-shown', function referralShown(placement) {
    call_1.call('mixpanel.track', 'WE:Referral_Notification_Shown', { placement: placement });
    call_1.call('gnar.track', 'referral/referralNotificationShown', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'referral-clicked', function referralClicked(placement) {
    call_1.call('mixpanel.track', 'WE:Referral_Button_Clicked', { placement: placement });
    call_1.call('gnar.track', 'referral/referralButtonClicked', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'tab-connected', function tabConnected( // 'this is fine.'
id, _ref, _ref2) {
    var enabled = _ref.enabled;
    var cookiesDisabled = _ref2.cookiesDisabled;

    this['daily-ping'](id, cookiesDisabled);
    if (!enabled) {
        logger_1.logger.disabledOnDomain();
    }
}), (0, _defineProperty3.default)(_exports$on, 'session-invalidate', function sessionInvalidate( // 'this is fine.'
user, oldUser, reason, cookiesDisabled, __containerId) {
    var id = user.id,
        name = user.name,
        anonymous = user.anonymous,
        premium = user.premium,
        email = user.email,
        type = user.type;

    if (id !== oldUser.id) {
        call_1.call('gnar.setUser', id);
        call_1.call('mixpanel.initProps');
        // @TODO consider adding this metric back to new felog
        // call('felog.setUser', { id, name, anonymous, premium, email, type, containerId })
        this['daily-ping'](id, cookiesDisabled);
    }
    if (reason) logger_1.logger.sessionInvalidated(reason, id !== oldUser.id);
    if (oldUser.email && !oldUser.anonymous && anonymous) {
        logger_1.logger.unexpectedAnonymous({
            email: oldUser.email,
            token: oldUser.token,
            grauth: oldUser.grauth,
            tokenEqualsGrauth: oldUser.token === oldUser.grauth,
            cookiesDisabled: cookiesDisabled,
            reason: reason
        });
    }
}), (0, _defineProperty3.default)(_exports$on, 'set-weak-dialect', function setWeakDialect(dialect) {
    call_1.call('mixpanel.track', 'G:Language_Weak_Preference', { dialect: dialect });
    call_1.call('gnar.track', 'languageWeakPreference', { dialect: dialect });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:weak_dialect_changed')
    logger_1.logger.weakDialectInitialized(dialect);
}), (0, _defineProperty3.default)(_exports$on, 'change-dialect', function changeDialect(_ref3) {
    var language = _ref3.language,
        dialectWeak = _ref3.dialectWeak;

    var trackingData = { language: language };
    if (dialectWeak) {
        trackingData.sameAsWeak = language === dialectWeak;
    }
    call_1.call('mixpanel.track', 'G:Language_Strong_Preference', trackingData);
    call_1.call('gnar.track', 'languageStrongPreference', trackingData);
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:language_dialect_changed')
}), (0, _defineProperty3.default)(_exports$on, 'get-dapi-prop-error', function getDapiPropError(property, error) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:get_dapi_prop_error')
    logger_1.logger.getDapiPropError(property, error && error.body);
}), (0, _defineProperty3.default)(_exports$on, 'set-dapi-prop-error', function setDapiPropError(property, error) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:set_dapi_prop_error')
    logger_1.logger.setDapiPropError(property, error && error.body);
}), (0, _defineProperty3.default)(_exports$on, 'change-defs', function changeDefs(data) {
    call_1.call('mixpanel.track', 'Ext:Definitions_Toggled:Popup', data);
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:definitions_toggled')
    call_1.call('gnar.track', 'definitionsToggled', data);
    logger_1.logger.toggleExtensionDefs(data.enabled);
}), (0, _defineProperty3.default)(_exports$on, 'change-grammar', function changeGrammar(data) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:toggle_extension_on_site')
    call_1.call('mixpanel.track', 'Ext:Checking_Toggled:Popup', data);
    call_1.call('gnar.track', 'checkingToggled', data);
    logger_1.logger.toggleExtension(data.enabled);
}), (0, _defineProperty3.default)(_exports$on, 'popup-open', function popupOpen() {
    call_1.call('gnar.track', 'browserToolbarButtonClicked');
    call_1.call('mixpanel.track', 'Ext:Browser_Toolbar_Button_Clicked');
}), (0, _defineProperty3.default)(_exports$on, 'popup-open-on-unsupported', function popupOpenOnUnsupported() {
    call_1.call('gnar.track', 'browserToolbarButtonClicked/unsupported');
    call_1.call('mixpanel.track', 'Ext:Settings_Open_Unsupported_Domain');
}), (0, _defineProperty3.default)(_exports$on, 'cookie-overflow', function cookieOverflow(total, biggestCookie) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.timing', 'stability:too_big_cookie_header.total', total)
    logger_1.logger.cookieOverflow(total, biggestCookie);
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-show', function premiumPopupShow() {
    call_1.call('mixpanel.track', 'Ext:Upgrade_Referral_Popup_Shown');
    call_1.call('gnar.track', 'upgradeReferralPopupShown');
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-upgrade-click', function premiumPopupUpgradeClick() {
    call_1.call('mixpanel.track', 'Ext:Upgrade_Referral_Premium_Btn_Clicked');
    call_1.call('gnar.track', 'upgradeReferralPremiumBtnClicked');
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-referral-click', function premiumPopupReferralClick() {
    call_1.call('mixpanel.track', 'Ext:Upgrade_Referral_Invite_Btn_Clicked');
    call_1.call('gnar.track', 'upgradeReferralInviteBtnClicked');
}), _exports$on);

},{"../bg/prefs":153,"../util":191,"./call":182,"./logger":187,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/slicedToArray":33,"babel-runtime/regenerator":38}],189:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var felog_1 = require("./felog");
// @NOTE this class uses arrow functions for all public methods, because
// they can be used in JS files and passed as callbacks, and there's no quick
// way to verify that .bind() was used in each case.
//
// When we convert everything to TS, don't use arrow functions here, and instead
// check that .bind() is used every time one of the methods is passed as a callback.

var Telemetry = function () {
    function Telemetry(_sendFelog) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Telemetry);

        this._sendFelog = _sendFelog;
        /**
         * Content script failed to init on the tab
         * Fires after 120 sec timeout, if pageLoad event wasn't fired
         * Can fail when page loads too long or there is no bg page connection
         */
        this.pageLoadTimeout = function () {
            _this._send('cs.connection.failover.pageLoad.timeout', 'content script init failed', felog_1.LogLevel.ERROR);
        };
        /**
         * Failed extension init
         * Fires after 120 sec timeout, if CS has inited state
         * Can fail when there is no bg page connection
         */
        this.appLoadTimeout = function () {
            _this._send('cs.connection.failover.appLoad.timeout', 'extension init timed out', felog_1.LogLevel.ERROR);
        };
        /**
         * State domain different from the current, skip update state method
         * @param stateDomain value of incorrect domain in the state
         */
        this.differentStateDomain = function (stateDomain) {
            _this._send('cs.state.differentDomain', 'received state for different domain', felog_1.LogLevel.INFO, { stateDomain: stateDomain });
        };
        /**
         * Restored connection with bg page after init without connection
         * or getting error from bg page
         * Fires twice:
         *  - update state method
         *  - on track error from bg page
         * TODO: send this event more than once?
         */
        this.restoredBgConnection = function (timeWithoutConnection) {
            _this._send('cs.connection.bg.restored', 'bg page connection restored', felog_1.LogLevel.INFO, { timeWithoutConnection: timeWithoutConnection });
        };
        /**
         * Initialize content script without connection to the bg page
         * Starts timer and try to reconnect
         */
        this.initWithoutBgConnection = function () {
            _this._send('cs.connection.bg.disconnected', 'no connection to bg page', felog_1.LogLevel.INFO);
        };
        /**
         * Dictionary fetch request failed
         * Spike of this metric cause an error on defenitions service or incorrect request
         */
        this.fetchDefinitionsFail = function () {
            _this._send('cs.connection.api.definition.failed', 'definitions fetch failed', felog_1.LogLevel.WARN);
        };
        /**
         * Failed to reset gButton infinity checking state
         * Will show offline state after 3 retry
         * @param delay - what time user saw "checking" state in gButton
         */
        this.infinityCheckResetFail = function (delay) {
            _this._send('cs.connection.infiniteCheck.failed', 'infinite check reset failed', felog_1.LogLevel.ERROR, { delay: delay });
        };
        /**
         * Page config initialization took more than 60s
         */
        this.tooLongPageConfigInit = function (initTime) {
            _this._send('cs.pageConfig.init.exceeded', 'page config init timeout', felog_1.LogLevel.WARN, { initTime: initTime });
        };
        /**
         * User update tooks longer than 60s
         * Profiler can be stoped by success init or error
         */
        this.tooLongUserUpdateTime = function (updateTime) {
            _this._send('bg.state.user.update.exceeded', 'user state update took too long', felog_1.LogLevel.WARN, { updateTime: updateTime });
        };
        /**
         * gButton component lost connection to the bg page (state has flag bgNotConnected)
         * Fire on
         *  - create of the component
         *  - updateState event
         */
        this.lostBgPageConnection = function () {
            _this._send('cs.gbutton.bgСonnection.lost', 'gbutton connection to bg page lost', felog_1.LogLevel.INFO);
        };
        /**
         * gButton compomnent restored connection to the bg page, after it was lost
         * Fire on
         *  - create of the component
         *  - updateState event
         */
        this.restoreBgPageConnection = function (time) {
            _this._send('cs.gbutton.bgСonnection.restored', 'gbutton connection to bg page restored', felog_1.LogLevel.INFO, { time: time });
        };
        /**
         * Incorrect cursor position in grammarly-editor
         * Will try to fix it, to bring cursor to the current position for the user
         */
        this.badCursorPosition = function () {
            _this._send('cs.editor.badCursorPosition', 'incorrect cursor position in grammarly-editor', felog_1.LogLevel.INFO);
        };
        /**
         * User saw jumped cursor in the field
         * Retry attemps of fixing cursor position failed
         */
        this.cursorJump = function () {
            _this._send('cs.editor.cursorJump', 'cursor jump detected', felog_1.LogLevel.WARN);
        };
        /**
         * Show signin dialog
         * Similar to close signin dialog event
         */
        this.signinOpen = function () {
            _this._send('cs.signin.open', 'sign in dialog opened', felog_1.LogLevel.INFO);
        };
        /**
         * Close signin dialog
         * Similar to open signin dialog even
         * @param openTime - time which dialog was opend
         */
        this.signinClose = function (openTime) {
            _this._send('cs.signin.close', 'sign in dialog closed', felog_1.LogLevel.INFO, { openTime: openTime });
        };
        /**
         * Error popup tab reload click
         * Click on the reload link in gButton hover popup in offline state
         * Spikes means a lot of gButton in the offline state
         */
        this.tabReloadClick = function () {
            _this._send('cs.gbutton.reload.click', 'gbutton reload clicked', felog_1.LogLevel.WARN);
        };
        /**
         * Popup activation failed
         * Get an error in catch of the iFrame load event
         * @param message - error message
         * @param name - error name
         */
        this.popupLoadError = function (message, name) {
            _this._send('cs.popup.load.error', 'could not open pop-up editor', felog_1.LogLevel.ERROR, { message: message, name: name });
        };
        /**
         * Cannot connect to the bg page during login event
         * Erorr in the fetch to the Auth
         * Error message contains rejected by timeout
         * @param message - error message
         */
        this.loginNoBgPageConnection = function (message) {
            _this._send('debug.cs.connection.signin.bg.timeout', 'can not connect to bg page on login', felog_1.LogLevel.INFO, { message: message });
        };
        /**
         * Cannot get valid config from CDN
         * Incorrect config (parsing error) or problems on CDN
         */
        this.pageConfigCDNError = function (message) {
            _this._send('cs.pageConfig.cdn.error', 'could not read page config', felog_1.LogLevel.ERROR, { message: message });
        };
        /**
         * Cant get valid config from LocalStorage
         * Incorrect config (parsing error) or no access to LocalStorage
         */
        this.pageConfigLocalStorageError = function (message, name) {
            _this._send('cs.pageConfig.localStorage.error', 'could not read page config from localStorage', felog_1.LogLevel.INFO, { message: message, name: name });
        };
        /**
         * New version of the page config loaded
         * This event shows how update config happens
         */
        this.pageConfigUpdated = function (oldVersion, newVersion) {
            _this._send('cs.pageConfig.updated', 'page config updated', felog_1.LogLevel.INFO, { oldVersion: oldVersion, newVersion: newVersion });
        };
        /**
         * Settings popup not showed in 2sec after initialization
         * Probably user don't see settings popup after click, but init can be also in the progress
         */
        this.settingsPopupTimeout = function () {
            _this._send('settings.popup.init.timeout', 'settings popup open timeout', felog_1.LogLevel.WARN);
        };
        /**
         * Displays unsupported message in the settings popup
         * @param popupType
         */
        this.settingsUsupportedShow = function (popupType) {
            _this._send('settings.popup.state.unsupported.show', 'page unsupported message shown', felog_1.LogLevel.INFO, { popupType: popupType });
        };
        /**
         * onError handler in the bg page socket
         * TODO: do not send the same errors more than once?
         */
        this.socketBgError = function () {
            _this._send('bg.socket.error', 'bg page socket error', felog_1.LogLevel.WARN);
        };
        /**
         * Get not_authorized error from CAPI and connection state
         * has failed recovery with auth
         * Show offline state for user
         * @param authDegradation - is auth available in the state of connection
         * @param cookiesDisabled
         */
        this.capiNotAuthorizedLoop = function (authDegradation, cookiesDisabled) {
            _this._send('debug.socket.notAuthorizedLoop', 'could not authenticate on capi and auth', felog_1.LogLevel.INFO, { authDegradation: authDegradation, cookiesDisabled: cookiesDisabled });
        };
        /**
         * Disabled cookies in not_authorized error handler(fixer)
         */
        this.socketDisabledCookie = function () {
            _this._send('debug.socket.disabledCookies', 'disabled cookies after failed authentication', felog_1.LogLevel.INFO);
        };
        /**
         * Capi session restored after auth degradation
         * @param tryCount - number of the restore attemps
         * TODO: check connectionFixer method
         */
        this.socketBgRestored = function (tryCount) {
            _this._send('debug.bg.socket.restored', 'capi session restored', felog_1.LogLevel.INFO, { tryCount: tryCount });
        };
        /**
         * Error to restore session in ws.emit
         * Logs every 10th failed reconnect
         */
        this.socketBgReconnectFail = function (token, tryCount) {
            _this._send('bg.socket.reconnect.fail', 'could not restore ws connection', felog_1.LogLevel.WARN, { token: token, tryCount: tryCount });
        };
        /**
         * onError handler in the cs socket
         * TODO: do not send the same errors more than once?
         */
        this.socketCsError = function () {
            _this._send('cs.socket.error', 'content script socket error', felog_1.LogLevel.WARN);
        };
        /**
         * Get an error message from CAPI
         * @param message - type of the error in msg
         */
        this.soketCsErrorMsg = function (message) {
            _this._send('cs.socket.errorMsg', 'capi error', felog_1.LogLevel.WARN, { message: message });
        };
        /**
         * Gnar client initialization failed
         * catch an error in the createGnarClient
         * @param message - error message
         */
        this.gnarClientInitFail = function (message) {
            _this._send('gnar.bg.tracking.gnar.init.fail', 'gnar init failed', felog_1.LogLevel.WARN, { message: message });
        };
        /**
         * Catch an error on bg tracking init (require and initialize tracking library)
         */
        this.bgTrackingInitFail = function () {
            _this._send('debug.tracking.init.fail', 'bg page tracking library init failed', felog_1.LogLevel.INFO);
        };
        /**
         * TODO: do we need it?
         */
        this.dailyPing = function () {
            _this._send('debug.dailyPing', 'daily ping', felog_1.LogLevel.INFO);
        };
        /**
         * Upgrade hook action for the free users
         * Opens upgrade page on fannel
         * @param placement - place, from where upgrade link was clicked
         */
        this.userUpgradeClick = function (placement) {
            _this._send('cs.ui.action.upgradeClick', 'upgrade hook clicked', felog_1.LogLevel.INFO, { placement: placement });
        };
        /**
         * Open popup editor
         * If this metric have spike - can be something wrong with popup editor or extension
         */
        this.gButtonClick = function () {
            _this._send('cs.ui.gbutton.click', 'gbutton clicked', felog_1.LogLevel.INFO);
        };
        /**
         * Enable/Disable extension in the field
         * Can be used for monitoring of top10 disabled domains
         */
        this.checkingToggledInField = function (enabled) {
            _this._send('cs.ui.gbutton.toggleInField', 'checking toggled in field', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Initialize extension on the disabled domain
         * Getting list of disabled domains from the black list
         */
        this.disabledOnDomain = function () {
            _this._send('cs.state.disabledOnDomain', 'checking disabled for domain', felog_1.LogLevel.INFO);
        };
        /**
         * User session changed
         * Session can be invalidated by
         *   onSessionStart, recover_after_capi_error,
         *   cookieChange, changed-user, logout
         * @param reason - why session was invalidated
         * @param userChanged - is grauth token changed
         */
        this.sessionInvalidated = function (reason, userChanged) {
            _this._send('bg.session.invalidated', 'user session invalidated', felog_1.LogLevel.INFO, { reason: reason, userChanged: userChanged });
        };
        /**
         * Get anonymous user in session change event
         * Previous user wasn't anonymous and has valid email
         */
        this.unexpectedAnonymous = function (data) {
            _this._send('debug.bg.session.unexpectedAnonymous', 'user changed to anonymous', felog_1.LogLevel.INFO, data);
        };
        /**
         * Set weak dialect from CAPI
         * We are getting it ONCE and then used like weak dialect prop in settings
         */
        this.weakDialectInitialized = function (dialect) {
            _this._send('bg.settings.weakDialect.init', 'set weak dialect from capi', felog_1.LogLevel.INFO, { dialect: dialect });
        };
        /**
         * Error by get property from the DAPI
         * @param property - name of the prop
         * @param body - error body
         */
        this.getDapiPropError = function (property, body) {
            _this._send('bg.connection.dapi.getProp.error', 'could not get dapi property', felog_1.LogLevel.WARN, { property: property, body: body });
        };
        /**
         * Error by set property to the DAPI
         * @param property - name of the prop
         * @param body - error body
         */
        this.setDapiPropError = function (property, body) {
            _this._send('bg.connection.dapi.setProp.error', 'could not set dapi property', felog_1.LogLevel.WARN, { property: property, body: body });
        };
        /**
         * Change definitions state on the domain
         * definitions - show defenition or synonymous of selected world on dbl click
         * @param enabled - state of the defenitions
         */
        this.toggleExtensionDefs = function (enabled) {
            _this._send('bg.settings.definitions.toggle', 'definitions toggled for domain', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Extension was enabled/disabled on domain
         * Can be used for monitoring of top10 disabled domains
         * @param enabled - state of the extension
         */
        this.toggleExtension = function (enabled) {
            _this._send('bg.settings.extension.toggle', 'extension toggled for domain', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Fires if total cookie size more than 7KB
         * @param size - total cookie size
         * @param biggestCookie - biggest cookie
         */
        this.cookieOverflow = function (size, biggestCookie) {
            _this._send('debug.bg.state.cookie.overflow', 'cookie is too big', felog_1.LogLevel.INFO, { size: size, biggestCookie: biggestCookie });
        };
        /**
         * Change plan message from the editor
         * Should reset state of the inited extensions
         */
        this.externalChangePlan = function () {
            _this._send('bg.api.external.changePlan', 'plan changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Change dialect message from the editor
         * Should reset state and resend text to the CAPI
         */
        this.externalChangeDialect = function () {
            _this._send('bg.api.external.changeDialect', 'dialect changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Change user (login?) message from the editor
         * Should reset state of the inited extensions
         */
        this.externalChangeUser = function () {
            _this._send('bg.api.external.changeUsed', 'user changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Logout message from the editor
         * Should reset state of the inited extensions
         */
        this.externalLogout = function () {
            _this._send('bg.api.external.logout', 'user logged out form editor', felog_1.LogLevel.INFO);
        };
        /**
         * Catch an error in start method promise on bg page
         * @param message - error message
         * @param stack - error stack
         */
        this.bgPageStartFail = function (message, stack) {
            _this._send('bg.start.fail', 'bg page start failed', felog_1.LogLevel.ERROR, { message: message, stack: stack });
        };
        /**
         * Bg page was initialized in more than 30sec
         */
        this.bgPageInitTimeout = function (initTime) {
            _this._send('bg.state.start.timeout', 'bg page init timeout', felog_1.LogLevel.WARN, { initTime: initTime });
        };
        /**
         * Failed to start bg page
         * Call this metric in the checkBgInit function in the end of start method
         */
        this.bgPageInitFail = function (initAttempts) {
            _this._send('bg.state.init.fail', 'bg page init failed', felog_1.LogLevel.ERROR, { initAttempts: initAttempts });
        };
        /**
         * Show update process of the extension to new version
         */
        this.extensionUpdated = function (currentVersion, previousVersion) {
            _this._send('bg.state.updated', 'extension updated', felog_1.LogLevel.INFO, { currentVersion: currentVersion, previousVersion: previousVersion });
        };
        /**
         * Fail update from the previous version
         * Bad or incorrect previous version
         */
        this.extensionUpdateFail = function (previousVersion) {
            _this._send('bg.state.update.fail', 'extension update failed', felog_1.LogLevel.INFO, { previousVersion: previousVersion });
        };
        /**
         * Catch error while trying get an extension install source (funnel or webstore)
         */
        this.cannotGetInstallSource = function () {
            _this._send('bg.getSource.fail', 'failed to get extension install source', felog_1.LogLevel.WARN);
        };
        /**
         * Extension install event
         * This event should be fire only ONCE after first? install
         * @param source - funnel|webstore
         */
        this.extensionInstall = function (source) {
            _this._send('bg.state.install', 'extension installed', felog_1.LogLevel.INFO, { source: source });
        };
        /**
         * Event from chrome.runtime.onUpdateAvailable listener
         * Found new version of the chrome extension and will run update in random(1-20) min
         */
        this.chromeForcedToUpdate = function (newVersion) {
            _this._send('bg.chrome.forcedToUpdate', 'chrome forced update', felog_1.LogLevel.INFO, { newVersion: newVersion });
        };
        /**
         * Error handler for tabs.executeScript and tabs.insertCSS methods
         * @param message - error message
         * @param type - content script type
         */
        this.chromeContentScriptLoadError = function (message, type) {
            _this._send('bg.chrome.cs.load.error', 'content script execution error', felog_1.LogLevel.WARN, { message: message, type: type });
        };
        /**
         * Show browser notification with tabs reload action
         * We show it only on MAJOR version update
         */
        this.reloadNotificationShow = function () {
            _this._send('bg.ui.notification.tabsReload.show', 'extension reload notification shown', felog_1.LogLevel.WARN);
        };
        /**
         * Click on the tabs reload notification
         * Should be fired only after display of the browser notification with reload action
         */
        this.reloadNotificationClick = function () {
            _this._send('bg.ui.notification.tabsReload.click', 'reload notification clicked', felog_1.LogLevel.INFO);
        };
        /**
         * Catch an error in the updateUser method
         * Possible Auth service problem
         * @param reason - onSessionStart | onSessionStart | cookieChange
         * @param body - error body
         * @param statusCode - error statusCode
         */
        this.fetchUserFail = function (reason, body, statusCode) {
            _this._send('bg.user.fetch.fail', 'failed to update user', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode, reason: reason });
        };
        /**
         * Mimic request to Dapi failed
         * Possible Dapi service problem
         * @param body - error body
         * @param statusCode - error status code
         */
        this.fetchMimicFail = function (body, statusCode) {
            _this._send('bg.user.mimic.fail', 'mimic request failed', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode });
        };
        /**
         * Get an error in the getToken method
         * which try to get grauth cookie from cookies
         */
        this.fetchCookieFail = function () {
            _this._send('bg.cookie.fail', 'could not get grauth from cookie', felog_1.LogLevel.WARN);
        };
        /**
         * Fetch settings from AUTH failed
         * Possible AUTH service problem
         * Will be depricated soon
         * @param body - error body
         * @param statusCode - error status code
         */
        this.fetchSettingsFail = function (body, statusCode) {
            _this._send('bg.user.settings.fail', 'could not get settings from auth', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode });
        };
        /**
         * Catch an error in the cookieChange method
         * @param canceled - actions state?
         */
        this.frequentCookieChanges = function (canceled) {
            _this._send('debug.cookie.onChange.error', 'cookie change too frequent', felog_1.LogLevel.INFO, { canceled: canceled });
        };
        /**
         * Initialize weak dialect setting from the DAPI
         * Show number of request to DAPI for dialect prop
         */
        this.initializeWeakDialectFromDapi = function () {
            _this._send('bg.state.dialect.weak.initialize', 'set weak dialect from dapi', felog_1.LogLevel.INFO);
        };
        /**
         * Initialize extension on incognito tab
         * Show information about init amounts on the incognito TAB
         */
        this.incognitoInit = function () {
            _this._send('bg.incognito.init', 'extension initialized in incognito mode', felog_1.LogLevel.INFO);
        };
        /**
         * Initialize extension with disabled cookies
         * Show information about init amounts with disabled cookies
         */
        this.disabledCookiesInit = function () {
            _this._send('bg.cookie.disabled', 'extension initialized with disabled cookies', felog_1.LogLevel.INFO);
        };
        /**
         * Proxy script was injected and initialized on a page.
         */
        this.proxyInit = function () {
            _this._send('proxy.init', 'proxy script initialized', felog_1.LogLevel.INFO);
        };
        /**
         * Proxy port was disconnected. Happens normally when background page is
         * reloaded.
         */
        this.proxyPortDisconnected = function (portName, errorMessage) {
            _this._send('proxy.disconnect', 'proxy port disconnected', felog_1.LogLevel.INFO, { port: portName, error: errorMessage });
        };
        /**
         * An unhandled exception on background page bubbled to the top.
         * This is a critical error.
         */
        this.unhandledBgPageException = function (e) {
            // @TODO take a look at how it's done in Editor.ts, there's some room for
            // improvement here.
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts
            _this._send('bg.unhandledException', 'unhandled exception on background page', felog_1.LogLevel.ERROR,
            // @TODO this is not very good. it will get JSONed into the
            // extra.json field.
            {
                // @TODO These file names and line numbers are of
                // the bundled code – might not be that useful.
                // Let's see how we can improve later.
                // file: e.filename,
                // line: e.lineno,
                // col: e.colno,
                message: e.error ? e.error.message : e.message
            });
        };
        /**
         * An unhandled promise rejection on background page bubbled to the top.
         * This is a critical error.
         */
        this.unhandledBgPageRejection = function (e) {
            // @TODO change type of e to PromiseRejectionEvent after we move to TS 2.2
            // (it's already merged: https://github.com/Microsoft/TSJS-lib-generator/pull/187/files)
            // @TODO take a look at how it's done in Editor.ts, there's some room for
            // improvement here.
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts
            _this._send('bg.unhandledRejection', 'unhandled promise rejection on background page', felog_1.LogLevel.ERROR, {
                message: e.reason != null ? typeof e.reason === 'string' ? e.reason : e.reason.message : e.message
            });
        };
    }

    (0, _createClass3.default)(Telemetry, [{
        key: "_send",
        value: function _send(logger, message, level, extra) {
            var dataString = void 0;
            // @TODO instead of this, should use approach from here:
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts#L425
            try {
                dataString = (0, _stringify2.default)(extra);
            } catch (err) {
                dataString = "Failed to stringify event properties: '" + err + "', '" + (err && err.message) + "'";
                // log this to console for now. @TODO could make sense to remove when we have proper
                // logging.
                // tslint:disable-next-line no-console
                console.warn(dataString, "for " + message + "@" + logger);
            }
            try {
                this._sendFelog(logger, message, level, extra != null ? { json: dataString } : undefined);
            } catch (err) {
                // log this to console for now. @TODO could make sense to remove when we have proper
                // logging.
                // tslint:disable-next-line no-console
                console.warn("Failed to send felog for " + message + "@" + logger + ": '" + err + "', '" + (err && err.message) + "'");
            }
        }
    }]);
    return Telemetry;
}();

exports.Telemetry = Telemetry;

},{"./felog":183,"babel-runtime/core-js/json/stringify":16,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],190:[function(require,module,exports){
"use strict";

function tracker() {
  return window.tracker;
}
exports.tracker = tracker;

},{}],191:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _ = require("lodash");
var nch = require("non-crypto-hash");
var newConfig_1 = require("./newConfig");
exports.getBrowser = newConfig_1.getBrowser;
exports.isBg = newConfig_1.isBg;
exports.isBgOrPopup = newConfig_1.isBgOrPopup;
exports.isChrome = newConfig_1.isChrome;
exports.isFF = newConfig_1.isFF;
exports.isPopup = newConfig_1.isPopup;
exports.isSafari = newConfig_1.isSafari;
exports.isSafari8 = newConfig_1.isSafari8;
exports.isWE = newConfig_1.isWE;
exports.isWindows = newConfig_1.isWindows;
function isGrammarlyEmail(email) {
    var isEmailForTests = ['freeeeeeee@grammarly.com', 'premiumuser@grammarly.com'].indexOf(email) !== -1;
    return !isEmailForTests && /^.*@grammarly.com$/.test(email);
}
exports.isGrammarlyEmail = isGrammarlyEmail;
function chromeBgError() {
    return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
}
exports.chromeBgError = chromeBgError;
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}
exports.isFunction = isFunction;
// @TODO this is using function for object keys. We should not do that,
// it's not officially supported: https://goo.gl/KMghfP
// Functions actually get converted to a string – means you can get collisions.
//
// Refactor this after all usages have been converted to TS.
function interval(cb, time) {
    var items = interval.items = interval.items || {},
        // tslint:disable-line no-use-before-declare
    item = items[cb]; // should not use cb as key here – illegal
    if (!item && !time) return;
    if (item && !time) {
        clearTimeout(item);
        delete items[cb]; // should not use cb as key here – illegal
        return;
    } else run();
    function run() {
        function _cb() {
            timeout();
            cb();
        }
        function timeout() {
            var tid = setTimeout(_cb, time);
            items[cb] = tid; // should not use cb as key here – illegal
        }
        timeout();
    }
}
exports.interval = interval;
(function (interval) {
    // actually a map of function to number, see comment for interval function
    // for more info
    interval.items = {};
})(interval = exports.interval || (exports.interval = {}));
function cancelInterval(cb) {
    interval(cb);
}
exports.cancelInterval = cancelInterval;
// @TODO possibly redundant export
function S4() {
    return ((1 + Math.random()) * 0x10000 | 0). // tslint:disable-line no-bitwise
    toString(16).substring(1);
}
exports.S4 = S4;
function guid() {
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}
exports.guid = guid;
// @TODO redundant exports?
function _f() {} // tslint:disable-line function-name
exports._f = _f;
function _F() {
    return true;
} // tslint:disable-line function-name
exports._F = _F;
function bgPageReload() {
    if (newConfig_1.isWE()) {
        if (window.chrome.runtime.reload) {
            window.chrome.runtime.reload();
        } else {
            window.location.reload();
        }
    }
}
exports.bgPageReload = bgPageReload;
function isGmail(doc) {
    if (!doc.location) return;
    // @TODO fix this later. keeping as is to be safe.
    // tslint:disable-next-line triple-equals
    var host = doc.location.host == 'mail.google.com',
        frames = doc.querySelector('iframe#js_frame') && doc.querySelector('iframe#sound_frame');
    return host || frames;
}
exports.isGmail = isGmail;
function isValidEmail(value) {
    // tslint:disable-next-line max-line-length
    return (/^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$/.test(value)
    );
}
exports.isValidEmail = isValidEmail;
function formatNumber(i) {
    return i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.formatNumber = formatNumber;
// @TODO it probably doesn't have to take a string. keeping as is until
// we rewrite everything to TS.
function declension(value, arr) {
    // @TODO fix this later. keeping as is to be safe.
    // tslint:disable-next-line triple-equals
    return arr[value == 1 ? 0 : 1];
}
exports.declension = declension;
// @TODO seems to be unused AND also broken.
// please remove when possible.
function stub(methods) {
    return _.transform(methods, function (result, m) {
        return result[m] = _f;
    });
}
exports.stub = stub;
function memoize(func,
// @NOTE couldn't type it better. Ideally should have the same
resolver, ttl) {
    var cache = {};
    var memoized = function memoized() {
        var key = '_memoize_' + (resolver ? resolver.apply(this, arguments) : arguments[0]);
        if (window.hasOwnProperty.call(cache, key)) {
            return cache[key];
        } else {
            if (ttl) {
                setTimeout(function () {
                    delete cache[key];
                }, ttl);
            }
            return cache[key] = func.apply(this, arguments);
        }
    };
    // @TODO typing didn't work out this time...
    return memoized;
}
exports.memoize = memoize;
// @TODO what does it do and what is it for?
function syncWait(promise, methods) {
    return (0, _keys2.default)(methods).reduce(function (obj, method) {
        return (
            // @TODO do we really need to do Object.assign every time?
            (0, _assign2.default)({}, obj, (0, _defineProperty3.default)({}, method, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return promise.then(function () {
                    return methods[method].apply(methods, args);
                });
            }))
        );
    }, {});
}
exports.syncWait = syncWait;
function promisify(method) {
    return new _promise2.default(function (resolve) {
        return method(resolve);
    });
}
exports.promisify = promisify;
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomIntInclusive = getRandomIntInclusive;
function delay(ms) {
    return new _promise2.default(function (resolve) {
        return setTimeout(resolve, ms);
    });
}
exports.delay = delay;
// decided to use simple function instead heavy moment.js
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function formatDate(dateStr) {
    if (!dateStr) return;
    var date = new Date(dateStr);
    if (date.toString() === 'Invalid Date') return;
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}
exports.formatDate = formatDate;
// @TODO do we have to do it this way? why not use class syntax, extend?
// why do we even need this?
function createClass(getPrototype) {
    var _class = function _class() {};
    _class.prototype = getPrototype();
    return _class;
}
exports.createClass = createClass;
/**
 * Compare two versions of extension. Version format x.x.x
 * @param {string} v1 first version to compare
 * @param {string} v2 second version to compare
 * @example
 * // returns 1
 * versionComparator('2.0.0', '0.0.9')
 * @example
 * // returns 0
 * versionComparator('2.0.0', '2.0.0')
 * @example
 * // returns -1
 * versionComparator('1.0.0', '2.0.0')
 * @returns {Number} Returns 1, 0 or -1
 */
function versionComparator() {
    var v1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var v2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    function splitToArray(str) {
        return str.split('.').map(function (el) {
            return Number(el) || 0;
        });
    }
    var v1arr = splitToArray(v1),
        v2arr = splitToArray(v2),
        postfix = Array(Math.abs(v1arr.length - v2arr.length)).fill(0);
    v1arr.length > v2arr.length ? v2arr.push.apply(v2arr, (0, _toConsumableArray3.default)(postfix)) : v1arr.push.apply(v1arr, (0, _toConsumableArray3.default)(postfix));
    if (v1arr.every(function (v, i) {
        return v === v2arr[i];
    })) return 0;
    // tslint:disable-next-line prefer-const
    for (var i = 0, len = v1arr.length; i < len; i++) {
        if (v1arr[i] > v2arr[i]) {
            return 1;
        } else if (v1arr[i] < v2arr[i]) {
            return -1;
        }
    }
    return -1;
}
exports.versionComparator = versionComparator;
function isBgAlive() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (newConfig_1.isWE()) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return", null);

                    case 2:
                        _context.prev = 2;
                        _context.next = 5;
                        return _promise2.default.race([
                        // @TODO can we come up with a more precise type for this response?
                        new _promise2.default(function (resolve) {
                            return window.chrome.runtime.sendMessage('ping', resolve);
                        }), delay(10000).then(function (_) {
                            return 'timeouted';
                        })]);

                    case 5:
                        return _context.abrupt("return", _context.sent);

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context["catch"](2);
                        return _context.abrupt("return", 'orphaned');

                    case 11:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 8]]);
    }));
}
exports.isBgAlive = isBgAlive;
function asyncCall(cb) {
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    setTimeout(cb, time);
}
exports.asyncCall = asyncCall;
function createChannel() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$buffered = _ref.buffered,
        buffered = _ref$buffered === undefined ? true : _ref$buffered;

    var messageQueue = [];
    var resolveQueue = [];
    function put(msg) {
        // anyone waiting for a message ?
        if (resolveQueue.length > 0) {
            // deliver the message to the oldest one waiting (First In First Out)
            // assert nextResolve is not undefined because resolveQueue.length > 0
            var nextResolve = resolveQueue.shift();
            nextResolve(msg);
        } else {
            // no one is waiting ? queue the event
            if (buffered) {
                messageQueue.push(msg);
            } else {
                messageQueue[0] = msg;
            }
        }
    }
    // returns a Promise resolved with the next message
    function take() {
        // do we have queued messages ?
        if (messageQueue.length) {
            // deliver the oldest queued message
            return _promise2.default.resolve(messageQueue.shift());
        } else {
            // no queued messages ? queue the taker until a message arrives
            return new _promise2.default(function (resolve) {
                return resolveQueue.push(resolve);
            });
        }
    }
    return {
        take: take,
        put: put
    };
}
exports.createChannel = createChannel;
function normalizedHashCode(str) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

    if (!str) return NaN;
    var algo = nch.createHash('superfasthash');
    return parseInt(algo.hash(str), 16) % base;
}
exports.normalizedHashCode = normalizedHashCode;
function keyCode(event) {
    return event.which || event.charCode || event.keyCode || 0;
}
exports.keyCode = keyCode;
exports.SECOND = 1000;
exports.MINUTE = 60 * exports.SECOND;
exports.HOUR = 60 * exports.MINUTE;
exports.DAY = 24 * exports.HOUR;
exports.pastDays = function (date) {
    return Math.round(Math.abs(+new Date() - +new Date(date)) / exports.DAY);
};
// get random local time between 3-4 AM
function getNextPingDate() {
    var now = new Date();
    if (now.getHours() > 2) {
        now.setDate(now.getDate() + 1);
    }
    now.setHours(3);
    now.setMinutes(Math.floor(Math.random() * 60));
    return now.getTime();
}
exports.getNextPingDate = getNextPingDate;
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;

},{"./newConfig":159,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/toConsumableArray":34,"babel-runtime/regenerator":38,"lodash":"lodash","non-crypto-hash":"non-crypto-hash"}]},{},[163]);
