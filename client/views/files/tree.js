define([
    "underscore",
    "jQuery",
    "hr/hr",
    "models/file",
    "core/box",
    "utils/contextmenu",
    "views/files/base"
], function(_, $, hr, File, box, ContextMenu, FilesBaseView) {
    // File item in the tree
    var FilesTreeViewItem = FilesBaseView.extend({
        tagName: "li",
        className: "file-item",
        template: "files/tree/item.html",
        events: {
            "click .name": "select",
            "dblclick .name": "open"
        },

        // Constructor
        initialize: function(options) {
            FilesTreeViewItem.__super__.initialize.apply(this, arguments);
            var that = this;

            // View for subfiles
            this.subFiles = null;
            this.paddingLeft = this.options.paddingLeft || 0;

            // Context menu
            ContextMenu.add(this.$el, this.model.contextMenu());

            return this;
        },

        // Finish rendering
        finish: function() {
            this.$(">.name").css("padding-left", this.paddingLeft);
            this.$el.toggleClass("type-directory", this.model.isDirectory());

            if (this.subFiles) {
                this.subFiles.$el.appendTo(this.$(".files"));
            }
            return FilesTreeViewItem.__super__.finish.apply(this, arguments);
        },

        // (event) select the file : extend tree
        select: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (this.model.isDirectory()) {
                if (this.subFiles == null) {
                    this.subFiles = new FilesTreeView({
                        "codebox": this.codebox,
                        "model": this.model,
                        "paddingLeft": this.paddingLeft+15
                    });
                    this.subFiles.$el.appendTo(this.$(".files"));
                    this.subFiles.update();
                }
                this.$el.toggleClass("open");
            } else {
                this.open();
            }
        },

        // (event) open the file or directory
        open: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (!this.model.isDirectory()) {
                this.model.open();
            } else {
                this.select();
            }
        }
    });

    // Complete files tree
    var FilesTreeView = FilesBaseView.extend({
        tagName: "ul",
        className: "cb-files-tree",

        // Constructor
        initialize: function(options) {
            FilesTreeView.__super__.initialize.apply(this, arguments);
            this.countFiles = 0;
            this.paddingLeft = this.options.paddingLeft || 10;

            // Context menu
            ContextMenu.add(this.$el, this.model.contextMenu());

            return this;
        },

        // Render the files tree
        render: function() {
            var that = this;
            this.$el.empty();
            this.$el.toggleClass("root", this.model.isRoot());

            this.model.listdir().then(function(files) {
                that.empty();
                that.countFiles = 0;

                _.each(files, function(file) {
                    if (file.isGit()) return;
                    
                    var v = new FilesTreeViewItem({
                        "codebox": that.codebox,
                        "model": file,
                        "paddingLeft": that.paddingLeft
                    });
                    v.update();
                    v.$el.appendTo(that.$el);
                    that.countFiles = that.countFiles + 1;
                });
                that.trigger("count", that.countFiles);
            });

            return that.ready();
        },
    });

    // Register as template component
    hr.View.Template.registerComponent("component.lateralbar.files", FilesTreeView);

    return FilesTreeView;
});