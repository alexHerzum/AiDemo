/* jshint expr:true */
define(['layer', 'layer-manager', 'dialog2', 'aui-mocha', 'aui/internal/skate', 'aui/internal/tether'], function (layerWidget, LayerManager, dialog2Widget) {
    'use strict';
    describe('Layer', function () {
        var dimSpy,
            undimSpy,
            focusManagerGlobalEnterSpy,
            focusManagerGlobalExitSpy;

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            dimSpy = sinon.spy(AJS, 'dim');
            undimSpy = sinon.spy(AJS, 'undim');
            LayerManager.global = new LayerManager();
            focusManagerGlobalEnterSpy = sinon.spy(AJS.FocusManager.global, 'enter');
            focusManagerGlobalExitSpy = sinon.spy(AJS.FocusManager.global, 'exit');
        });

        afterEach(function () {
            dimSpy.restore();
            undimSpy.restore();
            focusManagerGlobalEnterSpy.restore();
            focusManagerGlobalExitSpy.restore();
            AJS.mocha.removeLayers();
            $('#test-fixture').remove();
        });

        function createLayer (options) {
            options = options || {};
            var $el = AJS.$('<div></div>').attr('aria-hidden', 'true').appendTo('#test-fixture');
            if (options.blanketed) {
                $el.attr('data-aui-blanketed', true);
            }

            if (options.modal) {
                $el.attr('data-aui-modal', true);
            }

            if (options.persistent) {
                $el.attr('data-aui-persistent', true);
            }

            //layer needs some height so that layer :visible selector works properly
            $el.height(100);
            return $el;
        }

        function onEvent (layer, event, fn) {
            layer.addEventListener('aui-layer-' + event, fn);
        }

        function offEvent (layer, event, fn) {
            layer.removeEventListener('aui-layer-' + event, fn);
        }

        describe('Initialisation', function () {
            it('Layer creates a div by default', function () {
                var layer = layerWidget();

                expect(layer.$el.is('div')).to.be.true;
                expect(layer.$el.is('.aui-layer')).to.be.true;
                expect(layer.$el.attr('aria-hidden')).to.equal('true');
            });

            it('works with passed jQuery element', function () {
                var $el = AJS.$('<div></div>').appendTo('#test-fixture');
                var layer = layerWidget($el);

                expect(layer.$el[0]).to.equal($el[0]);
                expect(layer.$el.is('.aui-layer')).to.be.true;
            });

            it('works with passed HTML element', function () {
                var element = document.createElement('div');
                AJS.$('#test-fixture').append(element);
                var layer = layerWidget(element);

                expect(layer.$el[0]).to.equal(element);
                expect(layer.$el.is('.aui-layer')).to.be.true;
            });

            it('respects hidden state of passed element', function () {
                var $el = AJS.$('<div></div>').attr('aria-hidden','false').appendTo('#test-fixture');
                var layer = layerWidget($el);

                expect(layer.$el[0]).to.equal($el[0]);
                expect(layer.$el.attr('aria-hidden')).to.equal('false');
            });

            it('works with passed selector', function () {
                var $el = createLayer().attr('id', 'my-layer');
                var layer = layerWidget('#my-layer');

                expect(layer.$el[0]).to.equal($el[0]);
            });

            it('works with DOM node', function () {
                var $el = createLayer();
                var layer = layerWidget($el[0]);

                expect(layer.$el[0]).to.equal($el[0]);
            });

            it('Manager barfs if the same element is layered twice', function () {
                var $el = createLayer();
                layerWidget($el).show();

                expect(function () {
                    LayerManager.global.push($el);
                }).to.throw(Error);
            });
        });

        describe('showing, hiding and removing -', function () {
            it('calling #show on layer will show the given element', function () {
                var $el = createLayer();

                layerWidget($el).show();

                expect($el.attr('aria-hidden')).to.equal('false');
            });

            it('#show appends to body', function () {
                var $el = createLayer();

                layerWidget($el).show();

                expect($el.parent().is('body')).to.be.true;
            });

            it('#show sets z index', function () {
                var $el = createLayer();

                layerWidget($el).show();

                expect($el.css('z-index')).to.equal('3000');
            });

            it('#show requests focus when blanketed', function () {
                var $el = createLayer({blanketed: true});

                layerWidget($el).show();

                AJS.FocusManager.global.enter.should.have.been.calledOnce;
                var $focusEl = AJS.FocusManager.global.enter.args[0][0];
                expect($focusEl[0]).to.equal($el[0]);
            });

            it('#hide hides element', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                layer.show();

                layer.hide();

                expect($el.attr('aria-hidden')).to.equal('true');
            });

            it('#hide forces blur when blanketed', function () {
                var $el = createLayer({blanketed: true});
                var layer = layerWidget($el);
                layer.show();

                layer.hide();

                AJS.FocusManager.global.exit.should.have.been.calledOnce;
                var $focusEl = AJS.FocusManager.global.exit.args[0][0];
                expect($focusEl[0]).to.equal($el[0]);
            });

            it('#hide blurs focus on multiple elements when blanketed', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({blanketed: true});
                layerWidget($el1).show();
                layerWidget($el2).show();

                layerWidget($el1).hide();

                AJS.FocusManager.global.exit.should.have.been.calledTwice;
                var $focusEl2 = AJS.FocusManager.global.exit.args[0][0];
                expect($focusEl2[0]).to.equal($el2[0]);
                var $focusEl1 = AJS.FocusManager.global.exit.args[1][0];
                expect($focusEl1[0]).to.equal($el1[0]);
            });

            it('#hide hides multiple elements', function () {
                var $el1 = createLayer({modal: true});
                var $el2 = createLayer();
                layerWidget($el1).show();
                layerWidget($el2).show();

                layerWidget($el1).hide();

                expect($el1.attr('aria-hidden')).to.equal('true');
                expect($el2.attr('aria-hidden')).to.equal('true');
            });

            it('#hide restores original z-index', function () {
                var $el = createLayer();
                $el.css('z-index', 1234);
                var layer = layerWidget($el);
                layer.show();

                layer.hide();

                expect($el.css('z-index')).to.equal('1234');
            });

            it('#remove removes element', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                layer.show();

                layer.remove();

                expect($el.attr('aria-hidden')).to.equal('true');
                expect($el.parent().length).to.not.be.defined;
            });

            it('Layer increases z-index for multiple layers', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer();

                layerWidget($el1).show();
                layerWidget($el2).show();

                expect($el1.css('z-index')).to.be.below($el2.css('z-index'));
            });

            it('#hide respects persistent layers above it', function () {
                var $el1 = createLayer({persistent: true});
                var $el2 = createLayer({persistent: true});
                var $el3 = createLayer();

                layerWidget($el1).show();
                layerWidget($el2).show();
                layerWidget($el3).show();
                layerWidget($el1).hide();

                expect($el1.attr('aria-hidden')).to.equal('true');
                expect($el2.attr('aria-hidden')).to.equal('false');
                expect($el3.attr('aria-hidden')).to.equal('true');
            });
        });

        describe('changing size -', function () {
            it('#changeSize to content height', function () {
                var $el = createLayer($el);

                AJS.$('<div></div>').css('height', 99999).appendTo($el);

                var layer = layerWidget($el);

                layer.show();

                layer.changeSize(666, 'content');

                expect($el.width()).to.equal(666);

                // test based on the height of the inner contents
                expect($el.attr('style').indexOf('height')).to.be.below(0);
            });

            it('#changeSize to fixed height', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                layer.show();

                layer.changeSize(666, 999);

                expect($el.width()).to.equal(666);
                expect($el.height()).to.equal(999);
            });
        });

        describe('blanketing -', function () {
            it('Layer does not create blanket by default', function () {
                var $el = createLayer();

                layerWidget($el).show();

                dimSpy.should.not.have.been.called;
            });

            it('Layer creates blanket with specific z-index when specified', function () {
                var $el = createLayer({blanketed: true});
                layerWidget($el).show();

                dimSpy.should.have.been.calledOnce;
                dimSpy.should.have.been.calledWith(false, 2980);
            });

            it('Layer does not create blanket when data-aui-blanketed="false"', function () {
                var $el = createLayer().attr('data-aui-blanketed', 'false');
                layerWidget($el).show();

                dimSpy.should.not.have.been.called;
            });

            it('Layer creates blanket with specific z-index for multiple layers', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({blanketed: true});

                layerWidget($el1).show();
                dimSpy.should.have.been.calledOnce;
                dimSpy.should.have.been.calledWith(false, 2980);

                layerWidget($el2).show();
                dimSpy.should.have.been.calledTwice;
                dimSpy.should.have.been.calledWith(false, 3080);
            });
        });

        describe('popping -', function () {
            it('Layer pop dims and re-adds for stacked layers when specified', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({blanketed: true});

                layerWidget($el1).show();
                layerWidget($el2).show();

                dimSpy.should.have.been.calledTwice;
            });

            it('Layer pop dims and re-adds for stacked layers when specified when some have no blanket', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer();
                var $el3 = createLayer();
                var $el4 = createLayer({blanketed: true});

                layerWidget($el1).show();
                layerWidget($el2).show();
                layerWidget($el3).show();
                layerWidget($el4).show();

                dimSpy.should.have.been.calledTwice;
            });

            it('Layer pops down to a given element when many are layered', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer();

                layerWidget($el1).show();
                layerWidget($el2).show();
                layerWidget($el1).hide();

                expect($el1.attr('aria-hidden')).to.equal('true');
                expect($el2.attr('aria-hidden')).to.equal('true');
            });

            it('Layer #pop on multilayer', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({modal: true});
                var $el3 = createLayer({blanketed: true});

                layerWidget($el1).show();
                layerWidget($el2).show();
                dimSpy.should.have.been.calledOnce;
                dimSpy.should.have.been.calledWith(false, 2980);

                layerWidget($el3).show();
                dimSpy.should.have.been.calledTwice;
                dimSpy.should.have.been.calledWith(false, 3180);

                layerWidget($el3).hide();
                dimSpy.should.have.been.calledThrice;
                dimSpy.should.have.been.calledWith(false, 2980);
            });

            it('#popTop with empty should return null', function () {
                expect(LayerManager.global.popTopIfNonPersistent()).to.not.be.defined;
            });

            it('#popTop one element should return the element', function () {
                var $el = createLayer();
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popTopIfNonPersistent();

                expect($topLayer.attr('aria-hidden')).to.equal('true');
            });

            it('#popTop two elements', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer();
                layerWidget($el1).show();
                layerWidget($el2).show();

                var $topLayer = LayerManager.global.popTopIfNonPersistent();

                expect($topLayer[0]).to.equal($el2[0]);
                expect($el1.attr('aria-hidden')).to.equal('false');
                expect($el2.attr('aria-hidden')).to.equal('true');
            });

            it('#popTop modal', function () {
                var $el = createLayer().attr('data-aui-modal', true);
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popTopIfNonPersistent();

                expect($topLayer).to.not.be.defined;
                expect($el.attr('aria-hidden')).to.equal('false');
            });

            it('#popTop persistent', function () {
                var $el = createLayer({persistent: true});
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popTopIfNonPersistent();

                expect($topLayer).to.not.be.defined;
                expect($el.attr('aria-hidden')).to.equal('false');
            });

            it('#popUntilTopBlanketed with empty will return null', function () {
                expect(LayerManager.global.popUntilTopBlanketed()).to.not.be.defined;
            });

            it('#popUntilTopBlanketed one element will return the element', function () {
                var $el = createLayer({blanketed: true});
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popUntilTopBlanketed();

                expect($topLayer[0]).to.equal($el[0]);
                expect($el.attr('aria-hidden')).to.equal('true');
            });

            it('#popUntilTopBlanketed with no blanketed element', function () {
                var $el = createLayer();
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popUntilTopBlanketed();

                expect($topLayer).to.not.be.defined;
                expect($el.attr('aria-hidden')).to.equal('false');
            });

            it('#popUntilTopBlanketed two elements', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({blanketed: true});
                layerWidget($el1).show();
                layerWidget($el2).show();

                var $topLayer = LayerManager.global.popUntilTopBlanketed();

                expect($topLayer[0]).to.equal($el2[0]);
                expect($el1.attr('aria-hidden')).to.equal('false');
                expect($el2.attr('aria-hidden')).to.equal('true');
            });

            it('#popUntilTopBlanketed with layered non-blanketed elements', function () {
                var $el1 = createLayer({blanketed: true});
                var $el2 = createLayer({blanketed: true});
                var $el3 = createLayer();
                layerWidget($el1).show();
                layerWidget($el2).show();
                layerWidget($el3).show();

                var $topLayer = LayerManager.global.popUntilTopBlanketed();

                expect($topLayer[0]).to.equal($el2[0]);
                expect($el1.attr('aria-hidden')).to.equal('false');
                expect($el2.attr('aria-hidden')).to.equal('true');
                expect($el3.attr('aria-hidden')).to.equal('true');
            });

            it('#popUntilTopBlanketed modal', function () {
                var $el = createLayer({
                    blanketed: true,
                    modal: true
                });
                layerWidget($el).show();

                var $topLayer = LayerManager.global.popUntilTopBlanketed();

                expect($topLayer).to.not.be.defined;
                expect($el.attr('aria-hidden')).to.equal('false');
            });
        });

        describe('events -', function () {
            it('Layer #show triggers show event', function () {
                var layer = layerWidget(createLayer());
                var spy = sinon.spy();
                layer.on('show', spy);

                layer.show();

                spy.should.have.been.calledOnce;
            });

            it('Layer #hide triggers hide event', function () {
                var layer = layerWidget(createLayer());
                var spy = sinon.spy();
                layer.on('hide', spy);
                layer.show();

                layer.hide();

                spy.should.have.been.calledOnce;
            });

            it('Layer instance events can be turned off', function () {
                var layer = layerWidget(createLayer());
                var spy = sinon.spy();
                layer.on('hide', spy);
                layer.off('hide', spy);

                layer.show();
                layer.hide();

                spy.should.have.not.been.called;
            });

            it('Layer #hide can trigger multiple hide events', function () {
                var layer1 = layerWidget(createLayer({blanketed: true}));
                var spy1 = sinon.spy();
                layer1.on('hide', spy1).show();
                var layer2 = layerWidget(createLayer());
                var spy2 = sinon.spy();
                layer2.on('hide', spy2).show();

                layer1.hide();

                spy1.should.have.been.calledOnce;
                spy2.should.have.been.calledOnce;
            });

            it('Layer #show triggers global event', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var spy = sinon.spy();
                layerWidget.on('show', spy);

                layer.show();

                spy.should.have.been.calledOnce;
                spy.should.have.been.calledWith(sinon.match.defined, $($el));
            });

            it('Layer #show triggers global event for correct component', function () {
                var $el1 = createLayer();
                $el1.addClass('component1');

                var layer = layerWidget($el1);

                var componentOneStub = sinon.stub().returns(true);
                var componentTwoStub = sinon.stub().returns(true);
                var allStub = sinon.stub().returns(true);

                layerWidget.on('show', '.component1', componentOneStub);
                layerWidget.on('show', '.component2', componentTwoStub);
                layerWidget.on('show', allStub);

                layer.show();

                componentOneStub.should.have.been.calledOnce;
                componentTwoStub.should.have.not.been.called;
                allStub.should.have.been.calledOnce;
                componentOneStub.should.have.been.calledWith(sinon.match.defined, $($el1));
            });

            it('Layer #hide triggers global event', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var spy = sinon.spy();
                layerWidget.on('hide', spy);
                layer.show();

                layer.hide();

                spy.should.have.been.calledOnce;
                spy.should.have.been.calledWith(sinon.match.defined, $($el));
            });

            it('Layer #hide triggers global event for correct component', function () {
                var $el1 = createLayer();
                $el1.addClass('component1');

                var layer = layerWidget($el1);

                var componentOneStub = sinon.stub().returns(true);
                var componentTwoStub = sinon.stub().returns(true);
                var allStub = sinon.stub().returns(true);

                layerWidget.on('hide', '.component1', componentOneStub);
                layerWidget.on('hide', '.component2', componentTwoStub);
                layerWidget.on('hide', allStub);

                layer.show();
                layer.hide();

                componentOneStub.should.have.been.calledOnce;
                componentTwoStub.should.have.not.been.called;
                allStub.should.have.been.calledOnce;
                componentOneStub.should.have.been.calledWith(sinon.match.defined, $($el1));
            });

            it('Layer global events can be turned off', function () {
                var layer = layerWidget(createLayer());
                var spy = sinon.spy();

                layerWidget.on('hide', spy);
                layerWidget.off('hide', spy);
                layer.show();
                layer.hide();

                spy.should.not.have.been.called;
            });

            it('Layer two global events turned off correctly, same event name', function () {
                var layer = layerWidget(createLayer());
                var spy = sinon.spy();
                var spy2 = sinon.spy();

                layerWidget.on('hide', spy);
                layerWidget.on('hide', spy2);
                layerWidget.off('hide', spy);
                layer.show();
                layer.hide();
                layerWidget.off('hide', spy2);

                spy.should.not.have.been.called;
                spy2.should.have.been.calledOnce;
            });

            it('Layer #beforeShow event displays', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(true);

                layer.on('beforeShow', stub);
                layer.show();

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.true;
            });

            it('Layer #beforeShow event cancels display', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);

                layer.on('beforeShow', stub);
                layer.show();

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.false;
            });

            it('Layer #beforeShow event cancels display with multiple handlers', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                var stub2 = sinon.stub().returns(true);
                layer.on('beforeShow', stub);
                layer.on('beforeShow', stub2);

                layer.show();

                stub.should.have.been.calledOnce;
                stub2.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.false;
            });

            it('Layer #beforeHide event hides', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(true);
                layer.on('beforeHide', stub);

                layer.show();
                layer.hide();

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.false;
            });

            it('Layer #beforeHide event cancels hide', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                layer.on('beforeHide', stub);

                layer.show();
                layer.hide();

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.true;
            });


            it('Layer #beforeHide event cancels hide with multiple handlers', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(true);
                var stub2 = sinon.stub().returns(false);
                layer.on('beforeHide', stub);
                layer.on('beforeHide', stub2);

                layer.show();
                layer.hide();

                stub.should.have.been.calledOnce;
                stub2.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.true;
            });

            it('Layer global #beforeHide event fires for correct component', function () {
                var $el1 = createLayer();
                $el1.addClass('component1');

                var layer = layerWidget($el1);

                var componentOneStub = sinon.stub().returns(true);
                var componentTwoStub = sinon.stub().returns(true);
                var allStub = sinon.stub().returns(true);

                layerWidget.on('beforeHide', '.component1', componentOneStub);
                layerWidget.on('beforeHide', '.component2', componentTwoStub);
                layerWidget.on('beforeHide', allStub);

                layer.show();
                layer.hide();

                componentOneStub.should.have.been.calledOnce;
                componentTwoStub.should.have.not.been.called;
                allStub.should.have.been.calledOnce;
            });

            it('Layer global #beforeHide event cancels hide', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                layerWidget.on('beforeHide', stub);

                layer.show();
                layer.hide();

                layerWidget.off('beforeHide', stub);

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.true;
            });

            it('Layer global #beforeHide event cancels hide with multiple handlers', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                var stub2 = sinon.stub().returns(true);
                layerWidget.on('beforeHide', stub);
                layerWidget.on('beforeHide', stub2);

                layer.show();
                layer.hide();

                layerWidget.off('beforeHide', stub);
                layerWidget.off('beforeHide', stub2);

                stub.should.have.been.calledOnce;
                stub2.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.true;
            });

            it('Layer global #beforeShow event fires for correct component', function () {
                var $el1 = createLayer();
                $el1.addClass('component1');

                var layer = layerWidget($el1);

                var componentOneStub = sinon.stub().returns(true);
                var componentTwoStub = sinon.stub().returns(true);
                var allStub = sinon.stub().returns(true);

                layerWidget.on('beforeShow', '.component1', componentOneStub);
                layerWidget.on('beforeShow', '.component2', componentTwoStub);
                layerWidget.on('beforeShow', allStub);

                layer.hide();
                layer.show();

                componentOneStub.should.have.been.calledOnce;
                componentTwoStub.should.not.have.been.called;
                allStub.should.have.been.calledOnce;
            });

            it('Layer global #beforeShow event cancels show', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                layerWidget.on('beforeShow', stub);

                layer.hide();
                layer.show();

                layerWidget.off('beforeShow', stub);

                stub.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.false;
            });

            it('Layer global #beforeShow event cancels show with multiple handlers', function () {
                var $el = createLayer();
                var layer = layerWidget($el);
                var stub = sinon.stub().returns(false);
                var stub2 = sinon.stub().returns(true);
                layerWidget.on('beforeShow', stub);
                layerWidget.on('beforeShow', stub2);

                layer.hide();
                layer.show();

                layerWidget.off('beforeShow', stub);
                layerWidget.off('beforeShow', stub2);

                stub.should.have.been.calledOnce;
                stub2.should.have.been.calledOnce;
                expect(layer.isVisible()).to.be.false;
            });
        });

        describe('visibility -', function () {
            it('Layer #isVisible returns false', function () {
                var $el = createLayer();
                var layer = layerWidget($el);

                layer.hide();

                expect(layer.isVisible()).to.be.false;
            });

            it('Layer #isVisible returns true', function () {
                var $el = createLayer();
                var layer = layerWidget($el);

                layer.show();

                expect(layer.isVisible()).to.be.true;
            });
        });

        describe('traversing -', function () {
            it('down() returns the layer below the current one', function () {
                var $layer1 = createLayer({blanketed: true});
                var $layer2 = createLayer();

                layerWidget($layer1).show();
                layerWidget($layer2).show();

                expect(layerWidget($layer2).below().is($layer1)).to.be.true;
            });

            it('up() returns the layer above the current one', function () {
                var $layer1 = createLayer();
                var $layer2 = createLayer();

                layerWidget($layer1).show();
                layerWidget($layer2).show();

                expect(layerWidget($layer1).above().is($layer2)).to.be.true;
            });
        });

        describe('native events -', function () {
            it('Layer instance show events on native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);

                var spy = sinon.spy();

                onEvent($el1[0], 'show', spy);
                layer.show();
                layer.hide();
                offEvent($el1[0], 'show', spy);

                spy.should.have.been.calledOnce;
            });

            it('Layer instance hide events on native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);

                var spy = sinon.spy();

                onEvent($el1[0], 'hide', spy);
                layer.show();
                layer.hide();
                offEvent($el1[0], 'hide', spy);

                spy.should.have.been.calledOnce;
            });

            it('Layer global show event native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);
                var spy = sinon.spy();

                onEvent(document, 'show', spy);
                layer.show();
                offEvent(document, 'show', spy);

                spy.should.have.been.calledOnce;
            });

            it('Layer global hide event native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);
                var spy = sinon.spy();

                onEvent(document, 'hide', spy);
                layer.show();
                layer.hide();
                offEvent(document, 'hide', spy);

                spy.should.have.been.calledOnce;
            });

            it('Layer Global hide event cancels hide native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);

                // Set up spy with predetermined behaviour.
                var prevent = function(e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelHideEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(document, 'hide', cancelHideEventSpy);
                layer.show();
                layer.hide();
                offEvent(document, 'hide', cancelHideEventSpy);

                cancelHideEventSpy.should.have.been.calledOnce;
                expect(layerWidget($el1).isVisible()).to.be.true;
            });

            it('Layer global show event cancels show native', function () {
                var $el1 = createLayer();
                var layer = dialog2Widget($el1);

                // Set up spy with predetermined behaviour.
                var prevent = function (e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelShowEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(document, 'show', cancelShowEventSpy);
                layer.hide();
                layer.show();
                offEvent(document, 'show', cancelShowEventSpy);

                cancelShowEventSpy.should.have.been.calledOnce;
                expect(layerWidget($el1).isVisible()).to.be.false;
            });
        });
    });
});