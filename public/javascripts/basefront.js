var Router = Backbone.Router.extend({

  routes: {
    'dbs': 'dbs',
    'dbs/collections': 'collection',
    'dbs/collections/documents': 'documents',
    '*actions': 'defaultRoute'
  }

});

var app = new Router();
app.collections = {};
app.models = {};
app.views = {};



app.on('route:dbs', function(actions) {
  var databaseListView = new app.views.databaseListView({
    el: '.base'
  });

  databaseListView.render().renderList();
});

app.on('route:defaultRoute', function(actions) {
  var serverListView = new app.views.serverListView({
    el: '.base'
  });

  serverListView.render();
});

app.on('route:collection', function(actions) {
  var collectionListView = new app.views.collectionListView({
    el: '.base'
  });

  collectionListView.render().renderList();
});

app.on('route:documents', function(actions) {
  var documentListView = new app.views.documentListView({
    el: '.base'
  });

  documentListView.render().renderList();
});

// Base View
app.views.baseView = Backbone.View.extend({

});

// Base Collection
app.collections.baseCollection = Backbone.Collection.extend({

});

// Base Model
app.models.baseModel = Backbone.Model.extend({

});

// serverlist view
app.views.serverListView = app.views.baseView.extend({

  tpl: $('#base').text(),

  events: {
    "click .js-add-server": "addServer",
    "click .js-server-item": "selectServer"
  },

  initialize: function() {
    this.servers = this.getServers();
  },

  render: function() {
    var fragment = [];

    for (var i = 0, len = this.servers.length; i < len; ++i) {
      fragment.push('<a href="#" class="list-group-item js-server-item" data-alias="' + this.servers[i].alias + '" data-hostname="' + this.servers[i].hostname + '" data-port="' + this.servers[i].port + '">' + this.servers[i].alias + '</a>');
    }

    this.$el.html(this.tpl);
    this.$el.find('.js-servers').append(fragment.join(''));
    return this;
  },

  getServers: function() {
    var defaultServer = [];
    var servers = localStorage.getItem('servers');

    if (!servers) {
      localStorage.setItem('servers', JSON.stringify(defaultServer));
      servers = localStorage.getItem('servers');
    }

    if (servers) {
      servers = JSON.parse(servers);
    }

    return servers;
  },

  storeServer: function(server) {
    this.servers.push(server);
    localStorage.setItem('servers', JSON.stringify(this.servers));
  },

  addServer: function(e) {
    var $target = $(e.target);
    var hostname = this.$('#hostname').val();
    var port = this.$('#port').val();
    var alias = this.$('#alias').val();

    // Add validations
    if (!hostname || !port || !alias) return;

    this.storeServer({
      hostname: hostname,
      port: port,
      alias: alias
    });

    this.render();
  },

  selectServer: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var hostname = $target.attr('data-hostname');
    var port = $target.attr('data-port');
    var alias = $target.attr('data-alias');

    console.log('hostname:', hostname);
    console.log('port:', port);
    console.log('alias:', alias);

    app.utils.setCookieItem('hostname', hostname, new Date(Date.now + app.COOKIE_MAX_AGE));
    app.utils.setCookieItem('port', port, new Date(Date.now + app.COOKIE_MAX_AGE));
    app.utils.setCookieItem('alias', alias, new Date(Date.now + app.COOKIE_MAX_AGE));

    app.navigate('/dbs', { trigger: true });

  }

});

// database list view
app.views.databaseListView = app.views.baseView.extend({
  tpl: $('#databases').text(),

  events: {
    "click .js-database-item": "selectDb",
    "click .js-add-database": "addDatabase"
  },

  render: function() {

    this.$el.html(this.tpl);
    return this;
  },

  renderList: function() {
    var jqxhr = $.get('/servername');
    var self = this;

    jqxhr.done(function(data) {
      var fragment = [];
      var databases = data.data.databases;

      for (var i = 0, len = databases.length; i < len; ++i) {
        fragment.push('<a href="#" class="list-group-item js-database-item" data-alias="' + databases[i].name + '">' + databases[i].name + '</a>');
      }

      self.$el.find('.js-databases').append(fragment.join(''));

    });
  },

  selectDb: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var alias = $.trim($target.attr('data-alias'));

    app.utils.setCookieItem('alias', alias, new Date(Date.now + app.COOKIE_MAX_AGE));
    app.utils.setCookieItem('dbname', alias, new Date(Date.now + app.COOKIE_MAX_AGE));
    app.navigate('dbs/collections', { trigger: true });
  },

  addDatabase: function(e) {
    var $database = this.$('#dbname');
    var database = $.trim($database.val());

    this.$('.js-databases').append('<a href="#" class="list-group-item js-database-item" data-alias="' + database + '">' + database + '</a>');
    $database.val('');
  }
});

// collection list view
app.views.collectionListView = app.views.baseView.extend({
  tpl: $('#collections').text(),

  events: {
    'click .js-collection-item': 'selectCollection',
    "click .js-add-collection": "addCollection"
  },

  render: function() {
    this.$el.html(this.tpl);
    return this;
  },

  renderList: function() {
    var jqxhr = $.get('/servername/dbname');
    var self = this;

    jqxhr.done(function(data) {
      var fragment = [];
      var collections = data.data;

      for (var i = 0, len = collections.length; i < len; ++i) {
        fragment.push('<a href="#" class="list-group-item js-collection-item" data-collection="' + collections[i].name + '">' + collections[i].name + '</a>');
      }

      self.$el.find('.js-collections').append(fragment.join(''));

    });
  },

  selectCollection: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var collection = $target.attr('data-collection');

    app.utils.setCookieItem('collectionName', collection, new Date(Date.now + app.COOKIE_MAX_AGE));

    app.navigate('/dbs/collections/documents', { trigger: true });
  },

  addCollection: function(e) {
    var $collection = this.$('#collection-name');
    var collection = $collection.val();

    this.$('.js-collections').append('<a href="#" class="list-group-item js-collection-item" data-collection="' + collection + '">' + collection + '</a>');
    $collection.val('');
  }
});

// document list view
app.views.documentListView = app.views.baseView.extend({
  tpl: $('#documents').text(),
  addTpl: $('#document').text(),

  events: {
    "click .js-document-item": "selectDocument",
    "click .js-add-document": "addDocument",
    "click .saveDoc": "saveDocument",
    "click .updateDoc": "updateDocument",
    "click .js-cancel-doc": "cancelDocument"
  },

  initialize: function() {
    _.bindAll(this, 'saveDocument');
  },

  render: function() {
    this.$el.html(this.tpl);
    return this;
  },

  renderList: function() {
    var jqxhr = $.get('/servername/dbname/collname');
    var self = this;

    jqxhr.done(function(data) {
      console.log(data);
      var fragment = [];
      var documents = data.data;

      for (var i = 0, len = documents.length; i < len; ++i) {
        var stringified = JSON.stringify(documents[i]);
        fragment.push('<a href="#" class="list-group-item js-document-item" data-document="' + escape(stringified) + '">' + stringified.substr(0, 64) + '</a>');
      }

      self.$el.find('.js-documents').html('').append(fragment.join(''));

    });
  },

  selectDocument: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var docContent = $target.attr('data-document');
    this.oldDoc = unescape(docContent);

    $('#myModal-edit').modal('show');
    this.$('#documentBodyUpdate').val(unescape(docContent));
  },

  addDocument: function(e) {
    e.preventDefault();
    $("#myModal").modal('show');
    // this.$zenform = this.$zenform || this.$('.zen-mode');
    // var $zenform;

    // this.$el.append(this.addTpl);
    // // $zenform = this.$('.zen-mode')
    // // var doc = this.$('#js-document-name').val();
    // // var jqxhr = $.post('/documents', { document: doc });
    // var self = this;

    // this.$zenform.on('zf-initialized', function(e, el) {
    //   // console.log($(el).find('.js-save-doc'));
    //   $(el).find('.js-save-doc').on('click', function() {
    //     self.saveDocument();
    //     // $zenform.trigger('destroy');
    //     // $('.zen-forms-body-wrap').removeClass('zen-forms-body-wrap');
    //   });
    // });

    // this.$('.zen-mode').zenForm({ theme: 'light' }).trigger('init');


    // jqxhr.done(function(data) {
    //   console.log(data);
    // });

    // app.navigate('/dbs/collections/documents', { trigger: true });
  },

  saveDocument: function(e) {
    var self = this;
    var $content = this.$('#documentBody').val();
    var jqxhr = $.post('/documents',JSON.parse($content));
    jqxhr.done(function(data){
      $("#myModal").modal('hide');
         self.renderList();
    });
  },

  updateDocument: function(e) {
    var self = this;
    var $content = this.$('#documentBodyUpdate').val();
    var jqxhr = $.post('/servername/dbname/collname/doc', { oldDoc: this.oldDoc, newDoc: JSON.parse($content) });
    jqxhr.done(function(data){
      $("#myModal-edit").modal('hide');
         self.renderList();
    });
  },

  cancelDocument: function(e) {

  }
});

// Utilities
app.utils = {
  getCookieItem: function (sKey) {
    if (!sKey || !this.hasCookieItem(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },

  setCookieItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },

  removeCookieItem: function (sKey, sPath) {
    if (!sKey || !this.hasCookieItem(sKey)) { return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },

  hasCookieItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  }

};



// Start at the end
Backbone.history.start({ pushState: true });
