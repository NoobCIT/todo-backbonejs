var app = app || {};

// Todo item view
//==============

//The DOM element for a todo item.
app.TodoView = Backbone.View.extend({

  //...is a list tag.
  tagName: 'li',

  //Cache the template function for a single item.
  template: _.template( $('#item-template').html()),

  //The DOM events specific to an item.
  events: {
    'click .toggle': 'toggleCompleted',
    'dblclick label': 'edit',
    'click .destroy': 'clear',
    'keypress .edit': 'updateOnEnter',
    'blur .edit': 'close'
  },

  //The todoview listens for changes to its model rerendering .
  //Since there's a one to one correspondence between a Todo and a Todo view in this app
  //we set a direct reference on the model for convenience.
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'visible', this.toggleVisible);
  },

  // Re-renders the titles fo the todo item.
  render: function() {
    this.$el.html( this.template( this.model.attributes ));

    this.$el.toggleClass( 'completed', this.model.get('completed'));
    this.toggleVisible();

    this.$input = this.$('.edit');
    return this;
  },

  //toggles visiblity for item
  toggleVisible : function() {
    this.$el.toggleClass( 'hidden', this.isHidden());
  },

  //Determiense if new item should be hidden
  isHidden : function() {
    var isCompleted = this.model.get('completed');
    return ( //hidden cases only
      (!isCompleted && app.TodoFilter === 'completed')
      || (isCompleted && app.TodoFilter === 'active')
    );
  },

  //Toggle the completed state of the models
  togglecompleted: function() {
    this.model.toggle();
  },


  //switch this view into editing mode and display input field.
  edit: function() {
    this.$el.addClass('editing');
    this.$input.focus();
  },

  //Close the editing mode and save changes to todo
  close: function() {
    var value = this.$input.val().trim();

    if (value) {
      this.model.save({ title: value });
    } else {
      this.clear();
    }

    this.$el.removeClass('editing');
  },

  // If you hit enter we're through editing the item.
  updateOnEnter: function(e) {
    if (e.which === ENTER_KEY) {
      this.close();
    }
  },

  //remove item destroy th emodel from local storage and delte form view
  clear: function() {
    this.model.destroy();
  }
});
