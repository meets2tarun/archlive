backgrounds.LandlinesTeaser = new Model({
  /**
   * initialize the landlines teaser
   */
  init: function() {
    this.$landlines = document.querySelector('.landlines-teaser');
    this.$dismiss = this.$landlines.querySelector('.landlines-teaser__dismiss');
    this.$goTo = this.$landlines.querySelectorAll('.landlines-teaser__go-to');

    var dismissedLandlines = localStorage.getItem('dismissedLandlines');

    if (JSON.parse(dismissedLandlines) === true) {
      this.remove();
    } else {
      this.initEvents();
    }
  },

  /**
   * init events
   */
  initEvents: function() {
    this.$dismiss.addEventListener('click', this.remove.bind(this));

    this.$goTo.forEach(function($goTo) {
      $goTo.addEventListener('click', this.remove.bind(this));
    }.bind(this));
  },

  /**
   * Remove the landlines teaser from the page
   */
  remove: function() {
    localStorage.setItem('dismissedLandlines', true);
    this.$landlines.parentNode.removeChild(this.$landlines);
  }
});
