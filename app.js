(function(cb) {
  if (document.readyState != 'loading') cb();
  else document.addEventListener('DOMContentLoaded', cb);
})(function() {
  'use strict';

  var types = {
    "1": { label: "Normal", slug: "normal" },
    "2": { label: "Fighting", slug: "fighting" },
    "3": { label: "Flying", slug: "flying" },
    "4": { label: "Poison", slug: "poison" },
    "5": { label: "Ground", slug: "ground" },
    "6": { label: "Rock", slug: "rock" },
    "7": { label: "Bug", slug: "bug" },
    "8": { label: "Ghost", slug: "ghost" },
    "9": { label: "Steel", slug: "steel" },
    "10": { label: "Fire", slug: "fire" },
    "11": { label: "Water", slug: "water" },
    "12": { label: "Grass", slug: "grass" },
    "13": { label: "Electric", slug: "electric" },
    "14": { label: "Psychic", slug: "psychic" },
    "15": { label: "Ice", slug: "ice" },
    "16": { label: "Dragon", slug: "dragon" },
    "17": { label: "Dark", slug: "dark" },
    "18": { label: "Fairy", slug: "fairy" },
    "10001": { label: "Unknown", slug: "unknown" },
    "10002": { label: "Shadow", slug: "shadow" }
  };

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
    .then(showItems);

  function showItems(items) {
    var html = items.map(function(item) {
      var type = function(id) {
        return template('pokemon-type', types[id]);
      };
      return template('pokemon-card', {
        id: item.id,
        name: item.name,
        types: item.types.map(type).join('')
      });
    }).join('');
    document.getElementById('pokemons-list').innerHTML = html;
  }

  function loadItems() {
    var uri = '/pokemon/';
    return request(uri, { limit: 12 })
      .then(function(resp) {
        return resp.objects.map(function(item) {
          return {
            id: item.pkdx_id,
            name: item.name,
            types: item.types.map(function(type) {
              return type.resource_uri.match(/\/(\d+)\/$/)[1];
            })
          };
        });
      });
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

  window.request = request;
  window.cache = cache;
});
