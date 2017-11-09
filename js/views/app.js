var app = app || {};

//The Application
//===============

//Our overall **AppVie** is the top-level piece of UI.
app.AppView = Backbone.View.extend({

  //INstead of generating a new element, bind to the existing skeleton of
  //The App already present in the HTML.

  el: '#todoapp',

  // Our template fo rth eline of statistics at the bottom of the app.
  statsTemplate: _.template( $('#stats-template').html()),

  //Delegated eveents for creating new items and clearing completed ones
  events: {
    'keypress #new-todo': 'createOnEnter',
    'click #clear-compeleted': 'clearCompleted',
    'click #toggle-all': 'toggleAllComplete'
  },
  //At initialization we bind to the relevant events on the 'Todos'
  //Collection, when items are added or changed.

  initialize: function() {
    this.allCheckbox = this.$('#toggle-all')[0];
    this.$input = this.$('#new-todo');
    this.$footer = this.$('#footer');
    this.$main = this.$('#main');

    this.listenTo(app.Todos, 'add', this.addOne);
    this.listenTo(app.Todos, 'reset', this.addAll);

    this.listenTo(app.Todos, 'change:completed', this.filterOne);
    this.listenTo(app.Todos, 'filter', this.filterAll);
    this.listenTo(app.Todos, 'all', this.render);

    app.Todos.fetch();
  },

  //Rerendering the app means to referesh stats,r est of app doesn't changed
  render: function() {
    var completed = app.Todos.completed().length;
    var remaining = app.Todos.remaining().length;

    if ( app.Todos.length ) {
      this.$main.show();
      this.$footer.show();

      this.$footer.html(this.statsTemplate({
        completed: completed,
        remaining: remaining
      }));
      this.$('#filters li a')
        .removeClass('selected')
        .filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
        .addClass('selected');
    } else {
      this.$main.hide();
      this.$footer.hide();
    }

    this.allCheckbox.checked = !remaining;
  },

  //Add a single todo item to the list by creating a veiw for it and
  // appending its element to the '<ul>'.
  addOne: function( todo ) {
    var view = new app.TodoView({ model: todo });
    $('#todo-list').append( view.render().el );
  },

  // Add all items in the **Todos** collection at once.
  addAll: function() {
    this.$('#todo-list').html('');
    app.Todos.each(this.addOne, this);
  },

  filterOne : function(todo) {
    todo.trigger('visible');
  },

  filterAll : function() {
    app.Todos.each(this.filterOne, this);
  },

  //Generate attributes for new todo item
  newAttributes: function() {
    return {
      title: this.$input.val().trim,
      order: app.Todos.nextOrder(),
      completed: false
    };
  },

  //If you hit return on the main input field, create new todo model
  //persisting to local storage.
  createOnEnter: function(event) {
    if (event.which !== ENTER_KEY || !this.$input.val().trim()) {
      return;
    }

    app.Todos.create( this.newAttributes());
    this.$input.val('');
  },

  //Clear all completed todo items, destroying their models
  clearCompleted: function() {
    _.invoke(app.Todos.completed(), 'destroy');
    return false;
  },

  toggleAllComplete: function() {
    var completed = this.allCheckbox.checked;

    app.Todos.each(function( todo ) {
      todo.save({
        'completed': completed
      });
    });
  }
});
