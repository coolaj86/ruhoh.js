define([
  'jquery',
  'underscore',
  'backbone',
  'models/config',
  'models/page',
  'models/layout',
  'models/site',
  'models/payload',
  'dictionaries/pages',
  'dictionaries/posts',
  'utils/log',
  'handlebars',
  'partials',
  'helpers',
], function($, _, Backbone, Config, Page, Layout, Site, Payload, PagesDictionary, PostsDictionary, Log, Handlebars, Partials){

  TemplateEngine = "Handlebars";
  
  // Preview object builds a preview of a given page/post
  //
  // There is only ever one preview at any given time.
  // page/posts exist as data-structures only.
  // Aggrregate data-structures can be built from those objects.
  //
  // However for the purpose of the _framework, the preview
  // object is what renders what you see in the browser.
  return Backbone.Model.extend({ 
    master : Layout,
    sub : Layout,
    page : Page,
    payload : Payload,

    initialize : function(attrs, appConfig){
      this.config = new Config(appConfig);

      this.page = new Page;
      this.page.sub = new Layout;
      this.page.master = new Layout;
      
      this.site = new Site;
      this.payload = new Payload;
      this.pagesDictionary = new PagesDictionary;
      this.postsDictionary = new PostsDictionary;

      // Set pointers to a single Config.
      this.page.config = this.config,
      this.page.sub.config = this.config,
      this.page.master.config = this.config,
      this.site.config = this.config,
      this.payload.config = this.config,
      Partials.config = this.config;
      this.pagesDictionary.config = this.config;
      this.postsDictionary.config = this.config;


      this.page.bind("change:id", function(){
        this.generate();
      }, this)
    },
    
    generate : function(){
      var that = this;
      $.when(
        this.page.generate(), this.site.generate(),
        Partials.generate(), this.pagesDictionary.generate(),
        this.postsDictionary.generate()
      ).done(function(){
        that.buildPayload();
        that.process();
      }).fail(function(jqxhr){
        Log.loadError(this, jqxhr)
      });
    },
    
    // Build the payload.
    buildPayload : function(){
      this.site.set("tags", this.postsDictionary.tags);
      
      this.payload.set({
        "pages" : this.pagesDictionary.attributes,
        "_posts" : this.postsDictionary.attributes,
        "_posts_chronological" : this.postsDictionary.chronological,
        "_tags" : this.postsDictionary.tagsDictionary,
        "site" : this.site.attributes,
        "ASSET_PATH" : this.config.getThemePath(),
        "HOME_PATH" : "/",
        "BASE_PATH" : "",
        "page" : this.page.attributes
      })
    },

    process : function(){
      this[TemplateEngine]();
    },
    
    // Public: Process content, sub+master templates then render the result.
    //  
    // TODO: Include YAML Front Matter from the templates.
    // Returns: Nothing. The finished preview is rendered in the Browser.
    Handlebars : function(){
      // Process the page/post content first.
      var template = Handlebars.compile(this.page.get("content"));
      var output = template(this.payload.attributes);
      this.payload.set("content", output);
      
      // Process the page/post output into sub-template.
      template = Handlebars.compile(this.page.sub.get("content"));
      output = template(this.payload.attributes);
      
      // An undefined master means the page/post layouts is only one deep.
      // This means it expects to load directly into a master template.
      if(this.page.master.id){
        this.payload.set("content", output);
        template = Handlebars.compile(this.page.master.get("content"));
        output = template(this.payload.attributes);
      }
      
      $("body").html(output);
    },
    
    // Public: Process content, sub+master templates then render the result.
    //  
    // TODO: Include YAML Front Matter from the templates.
    // Returns: Nothing. The finished preview is rendered in the Browser.
    Mustache : function(){
      // Process the page/post content first.
      // Then set the result as {{content}} for sub-template.
      var output = $.mustache(this.page.get("content"), this.payload.attributes);
      this.payload.set("content", output);

      // Process the page/post output into sub-template.
      output = $.mustache(this.page.sub.get("content"), this.payload.attributes);

      // An undefined master means the page/post layouts is only one deep.
      // This means it expects to load directly into a master template.
      if(this.page.master.id){

        // Set processed *page/post+sub-template* as content for master-template.
        this.payload.set("content", output);

        // Process the master template with post+sub-template
        // Render the result into the browser.
        output = $.mustache(this.page.master.get("content"), this.payload.attributes);
      }

      $("body").html(output);
    }
    
  
  });
  
});