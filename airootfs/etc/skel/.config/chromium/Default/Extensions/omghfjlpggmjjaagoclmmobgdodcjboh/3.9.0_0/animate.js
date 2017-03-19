(function($) {
  var $body = $('html, body');
  var $main = $("#main");
  var smoothState = $main.smoothState({
    debug: true,
    onStart: {
      duration: 250,
      render: function($container) {
        $body.animate({scrollTop: 0});
        $main.addClass('is-exiting');
        smoothState.restartCSSAnimations();
      }
    },
    onReady: {
      duration: 0,
      render: function($container, $content) {
        var event = new CustomEvent('beforepageloaded', {detail: { content: $content }});
        document.dispatchEvent(event);
        $main.removeClass('is-exiting');
        $main.html($content);
        $body.css('cursor', 'auto');
        $body.find('a').css('cursor', 'auto');
      }
    },
    onAfter: function($container, $newContent) {
      var event = new Event('pageloaded');
      document.dispatchEvent(event);
    }
  }).data('smoothState');
})(jQuery);

