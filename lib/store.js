/**
 * Store
 * =====
 *
 *
 */

var Promise = require('bluebird');
var languages = require('languages');
var request = Promise.promisify(require('request'));

/**
 * [exports description]
 *
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var Store = module.exports = function (options) {

  if (!options) {
    options = Object.create(null);
  }

  this.options = {
    // apikey:      options.apikey,
    timeout:  options.timeout  || 1000 * 60 * 5,
    country:  options.country  || 'DE',
    language: options.language || 'de'
  };

  this.options.country = this.options.country.toLowerCase();
  this.options.language = languages.getLanguageInfo(this.options.language).name.toLowerCase();

  this.cache = { // set initial data
    'lists': this.options.cache
  };
};

/**
 * [get description]
 * Used for steam calls directlry
 *
 * @param  {[type]}   path     [description]
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Store.prototype.get = function (path, query, callback) {
  return new Promise(function (resolve, reject) {
    var url = (/^http(s):/).test(path) ? path : 'https://store.steampowered.com/api' + path;
    var timeout = this.options.timeout;
    var options = {
      'header': {
        'User-Agent': 'Steam-Store | Unofficial API Client'
      },
      'gzip': true,
      'json': true,
      'url': url
    };

    if (query) {
      options.qs = query;
    }

    request(options).spread(function (res, body) {
      // rating limit reached:
      // http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#429
      if (res.statusCode === 429) {
        if (!timeout) {
          return reject(new Error('Request rating limit exceeded!'));
        }
        // console.log('delay:', options, delay)
        return setTimeout(function(){
          return transport(url, query, timeout).then(resolve);
        }, timeout);
      }
      return resolve(body);
    }).catch(reject);
  }.bind(this)).nodeify(callback);
};

/**
 * [steam description]
 * @type {[type]}
 */
var APISteam = require('./API-steam');

Store.prototype.steam = APISteam;

/**
 * [getProducts description]
 * @type {[type]}
 */
var APICustom = require('./API-custom');

Store.prototype.getProducts        = APICustom.getProducts;
Store.prototype.getProductsLists   = APICustom.getProductsLists;
Store.prototype.getProductsDetails = APICustom.getProductsDetails;
Store.prototype.getProductDetails  = APICustom.getProductDetails;