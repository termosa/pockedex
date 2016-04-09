(function(cb) {
  if (document.readyState != 'loading') cb();
  else document.addEventListener('DOMContentLoaded', cb);
})(function() {
  'use strict';

  var template = (function() {
    var store = {};
    return function(name, data) {
      if (!store[name]) store[name] = loadTemplate(name);
      return store[name](data);
    };

    function loadTemplate(name) {
      var html = document.getElementById(name).innerText;
      var props = (html.match(/{[^}]+}/g) || []).map(function(prop) {
        return prop.slice(1, -1);
      });
      return function(data) {
        return props.reduce(function(html, prop) {
          if (!data[prop]) return html;
          return html.replace('{'+prop+'}', data[prop]);
        }, html);
      };
    }
  })();

  var cache = (function() {
    // TODO: Check if localStorage is supported
    return function(key, data) {
      if (!data) {
        return JSON.parse(localStorage.getItem(key));
      }
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    };
  })();

  loadItems()
    .then(function(resp) { return resp.objects; })
    .then(showItems);

  function showItems(items) {
    var html = items.map(function(item) {
      var types = item.egg_groups.map(function(group) { return group.name; });
      var type = function(type) {
        return template('pokemon-type', { type: type });
      };
      return template('pokemon-card', {
        name: item.name,
        picture: 'http://pokeapi.co/media/img/'+item.pkdx_id+'.png',
        types: types.map(type).join('')
      });
    }).join('');
    document.getElementById('pokemons-list').innerHTML = html;
  }

  function loadItems() {
    var uri = '/pokemon/';
    return request(uri, { limit: 12 });
  }

  function request(uri, props) {
    var url = 'http://pokeapi.co/api/v1';
    if (props) uri += '?' + toBodyString(props);
    var cached = cache(uri);
    if (cached) return Promise.resolve(cached);
    fetch(url + uri)
      .then(function(resp) { return resp.json(); })
      .then(function(data) { return cache(uri, data); });
  }

  function toBodyString(data) {
    return Object.keys(data)
      .map(function(key) {
        return key + '=' + data[key].toString();
      })
      .reduce(function(last, next){
        return last += '&' + next
      });
  }
});
