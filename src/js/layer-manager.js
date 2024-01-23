/**
 * Manages layers.
 *
 * There is a single global layer manager, AJS.LayerManager.global.
 * Additional instances can be created however this should generally only be used in tests.
 *
 * Layers are added by the push($el) method. Layers are removed by the
 * popUntil($el) method.
 *
 * popUntil's contract is that it pops all layers above & including the given
 * layer. This is used to support popping multiple layers.
 * Say we were showing a dropdown inside an inline dialog inside a dialog - we
 * have a stack of dialog layer, inline dialog layer, then dropdown layer. Calling
 * popUntil(dialog.$el) would hide all layers above & including the dialog.
 */
(function ($) {
    'use strict';

    function topIndexWhere (layerArr, fn) {
        var i = layerArr.length;

        while (i--) {
            if (fn(layerArr[i])) {
                return i;
            }
        }

        return -1;
    }

    function layerIndex (layerArr, $el) {
        return topIndexWhere(layerArr, function ($layer) {
            return $layer[0] === $el[0];
        });
    }

    function topBlanketedIndex (layerArr) {
        return topIndexWhere(layerArr, function ($layer) {
            return AJS.layer($layer).isBlanketed();
        });
    }

    function nextZIndex (layerArr) {
        var _nextZIndex;

        if (layerArr.length) {
            var $topEl = layerArr[layerArr.length - 1];
            var zIndex = parseInt($topEl.css('z-index'), 10);
            _nextZIndex = (isNaN(zIndex) ? 0 : zIndex) + 100;
        }
        else {
            _nextZIndex = 0;
        }

        return Math.max(3000, _nextZIndex);
    }

    function updateBlanket (stack, oldBlanketIndex) {
        var newTopBlanketedIndex = topBlanketedIndex(stack);
        if (oldBlanketIndex !== newTopBlanketedIndex) {
            if (newTopBlanketedIndex > -1) {
                AJS.dim(false, stack[newTopBlanketedIndex].css('z-index') - 20);
            } else {
                AJS.undim();
            }
        }
    }

    function popLayers (stack, stopIndex, forceClosePersistent) {
        if (stopIndex < 0) {
            return;
        }

        for (var a = stack.length - 1; a >= stopIndex; a--) {
            var $layer = stack[a];
            var layer = AJS.layer($layer);

            if (forceClosePersistent || !layer.isPersistent()) {
                layer._hideLayer(true);
                stack.splice(a, 1);
            }
        }
    }

    function getParentLayer ($childLayer) {
        var $layerTrigger = getTrigger($childLayer);

        if ($layerTrigger.length > 0) {
            return $layerTrigger.closest('.aui-layer');
        }
    }

    function hasTrigger ($layer) {
        return getTrigger($layer).length > 0;
    }

    function getTrigger ($layer) {
        return $('[aria-controls="' + $layer.attr('id') + '"]');
    }

    function LayerManager () {
        this._stack = [];
    }

    LayerManager.prototype = {
        /**
         * Pushes a layer onto the stack. The same element cannot be opened as a layer multiple times - if the given
         * element is already an open layer, this method throws an exception.
         *
         * @param {HTMLElement | String | jQuery} element  The element to push onto the stack.
         *
         * @returns {LayerManager}
         */
        push: function (element) {
            var $el = (element instanceof $) ? element : $(element);
            if (layerIndex(this._stack, $el) >= 0) {
                throw new Error('The given element is already an active layer.');
            }

            this.popLayersBeside($el);

            var layer = AJS.layer($el);
            var zIndex = nextZIndex(this._stack);

            layer._showLayer(zIndex);

            if (layer.isBlanketed()) {
                AJS.dim(false, zIndex - 20);
            }

            this._stack.push($el);

            return this;
        },

        popLayersBeside: function (element) {
            var $layer = (element instanceof $) ? element : $(element);
            if (!hasTrigger($layer)) {
                // We can't find this layer's trigger, we will pop all non-persistent until a blanket or the document
                var blanketedIndex = topBlanketedIndex(this._stack);
                popLayers(this._stack, ++blanketedIndex, false);
                return;
            }

            var $parentLayer = getParentLayer($layer);
            if ($parentLayer) {
                var parentIndex = this.indexOf($parentLayer);
                popLayers(this._stack, ++parentIndex, false);
            } else {
                popLayers(this._stack, 0, false);
            }

        },

        /**
         * Returns the index of the specified layer in the layer stack.
         *
         * @param {HTMLElement | String | jQuery} element  The element to find in the stack.
         *
         * @returns {Number} the (zero-based) index of the element, or -1 if not in the stack.
         */
        indexOf: function (element) {
            return layerIndex(this._stack, $(element));
        },

        /**
         * Returns the item at the particular index or false.
         *
         * @param {Number} index The index of the element to get.
         *
         * @returns {jQuery | Boolean}
         */
        item: function (index) {
            return this._stack[index];
        },

        /**
         * Hides all layers in the stack.
         *
         * @returns {LayerManager}
         */
        hideAll: function() {
            this._stack.reverse().forEach(function(element) {
                var layer = AJS.layer(element);
                if (layer.isBlanketed() || layer.isPersistent()) {
                    return;
                }
                layer.hide();
            });

            return this;
        },

        /**
         * Gets the previous layer below the given layer, which is non modal and non persistent. If it finds a blanketed layer on the way
         * it returns it regardless if it is modal or not
         *
         * @param {HTMLElement | String | jQuery} element layer to start the search from.
         *
         * @returns {jQuery | null} the next matching layer or null if none found.
         */
        getNextLowerNonPersistentOrBlanketedLayer: function(element) {
            var $el = (element instanceof $) ? element : $(element);
            var index = layerIndex(this._stack, $el);

            if (index < 0) {
                return null;
            }

            var $nextEl;
            index--;
            while (index >= 0) {
                $nextEl = this._stack[index];
                var layer = AJS.layer($nextEl);

                if (!layer.isPersistent() || layer.isBlanketed()) {
                    return $nextEl;
                }
                index--;
            }

            return null;
        },

        /**
         * Gets the next layer which is neither modal or blanketed, from the given layer.
         *
         * @param {HTMLElement | String | jQuery} element layer to start the search from.
         *
         * @returns {jQuery | null} the next non modal non blanketed layer or null if none found.
         */
        getNextHigherNonPeristentAndNonBlanketedLayer: function(element) {
            var $el = (element instanceof $) ? element : $(element);
            var index = layerIndex(this._stack, $el);

            if (index < 0) {
                return null;
            }

            var $nextEl;
            index++;
            while (index < this._stack.length) {
                $nextEl = this._stack[index];
                var layer = AJS.layer($nextEl);

                if (!(layer.isPersistent() || layer.isBlanketed())) {
                    return $nextEl;
                }
                index++;
            }

            return null;
        },

        /**
         * Removes all non-modal layers above & including the given element. If the given element is not an active layer, this method
         * is a no-op. The given element will be removed regardless of whether or not it is modal.
         *
         * @param {HTMLElement | String | jQuery} element layer to pop.
         *
         * @returns {jQuery} The last layer that was popped, or null if no layer matching the given $el was found.
         */
        popUntil: function (element) {
            var $el = (element instanceof $) ? element : $(element);
            var index = layerIndex(this._stack, $el);

            if (index === -1) {
                return null;
            }

            var oldTopBlanketedIndex = topBlanketedIndex(this._stack);

            // Removes all layers above the current one.
            popLayers(this._stack, index + 1, AJS.layer($el).isBlanketed());

            // Removes the current layer.
            AJS.layer($el)._hideLayer();
            this._stack.splice(index, 1);

            updateBlanket(this._stack, oldTopBlanketedIndex);

            return $el;
        },

        /**
         * Gets the top layer, if it exists.
         *
         * @returns The layer on top of the stack, if it exists, otherwise null.
         */
        getTopLayer: function () {
            if (!this._stack.length) {
                return null;
            }

            var $topLayer = this._stack[this._stack.length - 1];

            return $topLayer;
        },

        /**
         * Pops the top layer, if it exists and it is non modal and non persistent.
         *
         * @returns The layer that was popped, if it was popped.
         */
        popTopIfNonPersistent: function () {
            var $topLayer = this.getTopLayer();
            var layer = AJS.layer($topLayer);

            if (!$topLayer || layer.isPersistent()) {
                return null;
            }

            return this.popUntil($topLayer);
        },

        /**
         * Pops all layers above and including the top blanketed layer. If layers exist but none are blanketed, this method
         * does nothing.
         *
         * @returns The blanketed layer that was popped, if it exists, otherwise null.
         */
        popUntilTopBlanketed: function () {
            var i = topBlanketedIndex(this._stack);

            if (i < 0) {
                return null;
            }

            var $topBlanketedLayer = this._stack[i];
            var layer = AJS.layer($topBlanketedLayer);

            if (layer.isPersistent()) {
                // We can't pop the blanketed layer, only the things ontop
                var $next = this.getNextHigherNonPeristentAndNonBlanketedLayer($topBlanketedLayer);
                if ($next) {
                    var stopIndex = layerIndex(this._stack, $next);
                    popLayers(this._stack, stopIndex, true);
                    return $next;
                }
                return null;
            }

            popLayers(this._stack, i, true);
            updateBlanket(this._stack, i);
            return $topBlanketedLayer;
        },

        /**
         * Pops all layers above and including the top persistent layer. If layers exist but none are persistent, this method
         * does nothing.
         */
        popUntilTopPersistent: function () {
            var $toPop = AJS.LayerManager.global.getTopLayer();
            if (!$toPop) {
                return;
            }

            var stopIndex;
            var oldTopBlanketedIndex = topBlanketedIndex(this._stack);

            var toPop = AJS.layer($toPop);
            if (toPop.isPersistent()) {
                if (toPop.isBlanketed()) {
                    return;
                } else {
                    // Get the closest non modal layer below, stop at the first blanketed layer though, we don't want to pop below that
                    $toPop = AJS.LayerManager.global.getNextLowerNonPersistentOrBlanketedLayer($toPop);
                    toPop = AJS.layer($toPop);

                    if ($toPop && !toPop.isPersistent()) {
                        stopIndex = layerIndex(this._stack, $toPop);
                        popLayers(this._stack, stopIndex, true);
                        updateBlanket(this._stack, oldTopBlanketedIndex);
                    } else {
                        // Here we have a blanketed persistent layer
                        return;
                    }
                }
            } else {
                stopIndex = layerIndex(this._stack, $toPop);
                popLayers(this._stack, stopIndex, true);
                updateBlanket(this._stack, oldTopBlanketedIndex);
            }
        }
    };

    AJS.LayerManager = LayerManager;

}(AJS.$));
