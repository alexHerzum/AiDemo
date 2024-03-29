/* global Raphael:true */

if (window.Raphael) {
    Raphael.shadow = function(x, y, w, h, options) {

        options = options || {};

        var $target = jQuery(options.target),
            $container = jQuery("<div/>", { "class": "aui-shadow" }),
            colour = options.shadow || options.color || "#000",
            size = options.size * 10 || 0, //makes it sane with no size included. just here for backwards compatability
            offsetSize = options.offsetSize || 3, //by default we want to offset by 3 pixels for pretty ness
            zindex = options.zindex || 0,
            radius = options.radius || 0,
            opacity = "0.4",
            blur = options.blur || 3,
            paper,
            rect,
            offset;

        w += size + 2 * blur;
        h += size + 2 * blur;

        if (Raphael.shadow.BOX_SHADOW_SUPPORT) {
            // If box-shadow is supported, apply a className to use standard box-shadow CSS styles.
            // Note: (x, y, w, h) is ignored.
            $target.addClass("aui-box-shadow");

            // Return the unused shadow element to preserve compatibility with legacy API.
            return $container.addClass("hidden");
        }

        //from the old api, this meant you wanted a shadow drawn into the element
        //so mimic this
        if (x === 0 && y === 0 && $target.length > 0) {
            offset = $target.offset();
            x = offsetSize - blur + offset.left;
            y = offsetSize - blur + offset.top;
        }

        //ie9 should support svg so should support the opacity, until then tone the colour down
        //also as the blur seems a little stronger in ie, we need to counter the offset
        if (jQuery.browser.msie && jQuery.browser.version < "9") {
            colour = "#f0f0f0";
            opacity = "0.2";
        }

        $container.css({
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            zIndex: zindex
        });

        if ($target.length > 0) {
            $container.appendTo(document.body);
            paper = Raphael($container[0], w, h, radius);
        } else {
            paper = Raphael(x, y, w, h, radius);
        }

        paper.canvas.style.position = "absolute";

        rect = paper.rect(blur, blur, w - 2 * blur, h - 2 * blur).attr({
            fill: colour,
            stroke: colour, //stroke needed to get around an issue with VML and no stroke defaulting to #000
            blur: "" + blur,
            opacity: opacity
        });

        return $container;
    };

    Raphael.shadow.BOX_SHADOW_SUPPORT = (function() {
        var style = document.documentElement.style;
        var propertyNames = ["boxShadow", "MozBoxShadow", "WebkitBoxShadow", "msBoxShadow"];
        for (var i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i] in style) {
                return true;
            }
        }
        return false;
    })();
}
