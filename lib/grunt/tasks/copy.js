var _ = require('lodash');

var self = module.exports = {
  __module: {
    properties: {
      log: 'grunt/log',
      config: 'config',
      register_assets_dir: 'svc!assetManager/register_assets_dir',
      register_views_dir: 'svc!assetManager/register_views_dir'
    },
    provides: {configure_task: {before: 'grunt/tasks/*'}}
  },
  
  TASK_NAME: 'particles',

  configure_task: function(input) {
    var filesDesc = [];
    var grunt = input.grunt;

    //copy assets
    return self.register_assets_dir.sequence().then(function(results) {
      var dirs = _.flatten(results);
      var dest = self.config.get('assets.assetsDir');
      _.each(dirs, function(dir) {
        filesDesc.push({
          expand: true,
          cwd: dir,
          src: ['**'],
          dest: dest
        });
      });
    })
    //copy views
    .then(function() {
      return self.register_views_dir.sequence();
    }).then(function(results) {
      var dirs = _.flatten(results);
      var dest = self.config.get('assets.viewsDir');
      _.each(dirs, function(dir) {
        filesDesc.push({
          expand: true,
          cwd: dir,
          src: ['**'],
          dest: dest
        });
      });
    }).then(function() {
      self.log.verbose("Assemble", filesDesc);
      //now set the grunt config
      grunt.config.set('copy.'+self.TASK_NAME+'.files', filesDesc);
      return input;
    });
  }
};