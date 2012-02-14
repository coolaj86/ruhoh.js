define([
  'jquery',
  'underscore',
  'backbone',
  'js-yaml',  
], function($, _, Backbone){
  
  // Tags Model
  // Perhaps this should be a collection but we don't
  // really need individual tag objects, just the sample data to iterate over.
  return Backbone.Model.extend({

    initialize : function(attrs){

    },
    
    generate : function(){
      return this.fetch({dataType : "html", cache : false });
    },
    
    url : function(){
      return this.config.getDataPath('/data/tags.yaml');
    },
    
    parse : function(response){
      this.set("data", jsyaml.load(response));
      return this.attributes;
    }
    
  });

});