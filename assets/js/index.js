(function ($) {
    "use strict";

    function layout_page() {
        var height = $('.article-image').height();
        $('.post-content').css('padding-top', height + 'px');
    }

    $(document).ready(function(){
        // Layout page when resizing window
        layout_page();
        $(window).on('focus', layout_page);
        $(window).on('resize', layout_page);

        // Fade out header image on scroll
        $(window).on('scroll', function() {
            var top = $(window).scrollTop();

            if (top < 0 || top > 1500) { return; }

            $('.post-image-image, .teaserimage-image')
                .css('transform', 'translate3d(0px, '+top/3+'px, 0px)')
                .css('opacity', 1-Math.max(top/700, 0));
        });

        // Fit videos to width of the container
        $(".post-content").fitVids();

        // Creates Captions from Alt tags
        $(".post-content img").each(function() {
            // Let's put a caption if there is one
            if ($(this).attr("alt")) {
                $(this).wrap('<figure class="image"></figure>').after('<figcaption>'+$(this).attr("alt")+'</figcaption>');
            }
        });

        // Scroll to anchor links
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                    $('html,body').animate({ scrollTop: target.offset().top }, 500);
                    return false;
                }
            }
        });

    });

}(jQuery));