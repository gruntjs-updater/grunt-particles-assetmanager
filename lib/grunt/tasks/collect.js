var _ = require('lodash'),
  objectPath = require('object-path'),
  glob = require('glob');


function isUrl(url) {
  return (/^http[s]?:\/\/./).test(url);
}

var self = module.exports = {
  __module: {
    properties: {
      log: 'grunt/log',
      config: 'config',
      use_scripts: 'svc!assetManager/use_scripts',
      use_stylesheets: 'svc!assetManager/use_stylesheets'
    },
    provides: {configure_task: {}}
  },

  configure_task: function(input) {
    return self.use_scripts.invoke().then(function(scripts) {
      scripts = _.compact(_.flatten(scripts, true));
      input.scripts = self.groupByNamespaceAndNormalize(scripts);
    }).then(function() {
      return self.use_stylesheets.invoke();
    }).then(function(styles) {
      styles = _.compact(_.flatten(styles, true));
      input.stylesheets = self.groupByNamespaceAndNormalize(styles);

      return input;
    });
  },

  /**
   * Group by namespace, type (file/url) and expand blogs
   */ 
  groupByNamespaceAndNormalize: function(resources) {
    var defaultNS = self.config.get('assets.defaultNamespace') || "default";
    var namespaces = {};
    var args = null;
    //build the namespaces
    _.each(resources, function(resource) {
      var ns, file, root;
      if(_.isString(resource)) {
        ns = defaultNS;
        file = resource;
      } else {
        ns = resource.ns || defaultNS;
        if(_.isString(resource.file)) {
          file = resource.file;
        } else {
          file = resource.file.file;
          root = resource.file.cwd;
        }
      }

      var type = 'files';
      if(isUrl(file)) {
        type = 'urls';
        args = [file];
      } else if(root) {
        args = glob.sync(file, {cwd: root});
      } else {
        args = [file];
      }

      args.unshift(namespaces, [ns, type]);
      objectPath.push.apply(null, args);
    });
    return namespaces;
  }
};