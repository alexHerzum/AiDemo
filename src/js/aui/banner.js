;(function(init) {
    'use strict';

    define(function() {
        return init(AJS, AJS.$, AJS.template);
    });
})(function (AJS, $, template) {
    'use strict';

    var ID_BANNER_CONTAINER = 'header';

    function banner (options) {
        var $banner = renderBannerElement(options);

        pruneBannerContainer();
        insertBanner($banner);
        return $banner;
    }

    function renderBannerElement(options) {
        var html =
            '<div class="aui-banner aui-banner-{type}" role="banner">' +
                '<p class="aui-banner-title" role="heading">' +
                    '{title}' +
                '</p>' +
                '{body}' +
            '</div>';

        var $banner = $(template(html).fill({
            'type': 'error',
            'title': options.title || '',
            'body:html': options.body || ''
        }).toString());

        $banner.find('.aui-banner-title:empty').remove();

        return $banner;
    }

    function pruneBannerContainer() {
        var $container = findContainer();
        var $allBanners = $container.find('.aui-banner');

        $allBanners.get().forEach(function(banner) {
            var isBannerAriaHidden = banner.getAttribute('aria-hidden') === 'true';
            if (isBannerAriaHidden) {
                $(banner).remove();
            }
        });
    }

    function findContainer() {
        return $('#' + ID_BANNER_CONTAINER);
    }

    function insertBanner($banner) {
        var $bannerContainer = findContainer();
        if (!$bannerContainer.length) {
            throw new Error('You must implement the application header');
        }

        $banner.prependTo($bannerContainer);
        AJS._internal.animation.recomputeStyle($banner);
        $banner.attr('aria-hidden', 'false');
    }

    return banner;
});
