define([
  'jquery',
  'underscore',
  'backbone',
  'js-yaml',
], function($, _, Backbone){

  // Post Model
	return Backbone.Model.extend({
		url : '/~jade/data/post.html',
		// Matcher for YAML Front Matter
		FMregex : /^---\n(.|\n)*---\n/,
		
		initialize : function(){
      this.deferred = this.fetch({dataType : "html", cache : false});
		},
		
		// Parse the raw post file.
		parse : function(response){ 
      this.parseFrontMatter(response);
      this.parseContent(response);
      return this.attributes;
		},
		
		// Parse and store the YAML Front Matter from the file.
		parseFrontMatter : function(response){
		  var front_matter = this.FMregex.exec(response);
      if(!front_matter) console.log("INVALID FRONT MATTER");
      front_matter = front_matter[0].replace(/---\n/g, "");
      this.set(jsyaml.load(front_matter));
		},
		
		// parse and set the content data.
		// TODO: markdown/textile etc.
		parseContent : function(response){
		  this.set("content", response.replace(this.FMregex, ""));
		}
		
	});

});