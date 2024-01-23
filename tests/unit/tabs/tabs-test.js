/* jshint expr:true */
define(['tabs', 'soy/tabs', 'aui-mocha'], function () {
    'use strict';
    describe('Tabs', function () {
        var DATA_TABS_PERSIST = 'data-aui-persist',
            STORAGE_PREFIX = '_internal-aui-tabs-',
            persistAttribute = function (c) {
                return ((c.persist || c.persist === '')  ? ' ' + DATA_TABS_PERSIST + '=' + (c.persist ? c.persist : '""') : '');
            };

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            window.localStorage.clear();
            $('#test-fixture').remove();
        });

        function renderTemplate (c) {
            // TODO: render as soy ... (bitbucket.org/atlassian/soy-to-html-plugin ?)
            $('#test-fixture').append([
                '<' + (c.tagName || 'div') + (c.id ? ' id=' + c.id : '') + persistAttribute(c)  + ' class="aui-tabs horizontal-tabs">',
                '  <ul class="tabs-menu">',
                '    <li class="menu-item active-tab">',
                '      <a href="#tab-lister' + (c.tabPostfix || '') + '" id="menu-item-lister' + (c.tabPostfix || '') + '"><strong>Lister</strong></a>',
                '    </li>',
                '    <li class="menu-item">',
                '      <a href="#tab-rimmer' + (c.tabPostfix || '') + '" id="menu-item-rimmer' + (c.tabPostfix || '') + '"><strong>Rimmer</strong></a>',
                '    </li>',
                '  </ul>',
                '  <' + (c.paneTagName || 'div') + ' id="tab-lister' + (c.tabPostfix || '') + '" class="tabs-pane active-pane">',
                '    +1',
                '  </' + (c.paneTagName || 'div') + '>',
                '  <' + (c.paneTagName || 'div') + ' id="tab-rimmer' + (c.tabPostfix || '') + '" class="tabs-pane">',
                '    -1',
                '  </' + (c.paneTagName || 'div') + '>',
                '</' + (c.tagName || 'div') + '>'
            ].join(''));
        }

        function addTabMenu () {
            // TODO: use soy
            $('.tabs-menu').append([
                '    <li class="menu-item">',
                '      <a href="#tab-kryten" id="menu-item-kryten"><strong>Kryten</strong></a>',
                '    </li>'
            ].join(''));
        }

        function addTabPane (c) {
            // TODO: use soy
            $('.aui-tabs').append([
                '  <' + (c.paneTagName || 'div') + ' id="tab-kryten" class="tabs-pane">',
                '    +∞',
                '  </' + (c.paneTagName || 'div') + '>'
            ].join(''));
        }

        function createPersistentKey ($tabGroup) {
            var tabGroupId = $tabGroup.attr('id');
            var value = $tabGroup.attr(DATA_TABS_PERSIST);

            return STORAGE_PREFIX + (tabGroupId ? tabGroupId :'') + (value && value !== 'true' ? '-' + value : '');
        }

        function getPersistent (groupId) {
            // groupId must exist in the dom
            var key = createPersistentKey($('#' + groupId));
            return window.localStorage.getItem(key);
        }

        function storePersistent (groupId, value) {
            // groupId must exist in the dom
            var key = createPersistentKey($('#' + groupId));
            window.localStorage.setItem(key, value);
        }

        it('API', function () {
            expect(AJS.tabs).to.be.an('object');
            expect(AJS.tabs.setup).to.be.a('function');
            expect(AJS.tabs.change).to.be.a('function');
        });

        it('hide active tab and shows new tab on click', function () {
            renderTemplate({});
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.true;
        });

        it('work when constructed with non-div tags', function () {
            renderTemplate({
                tagName: 'section',
                paneTagName: 'section'
            });
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.true;
        });

        it('setup() will not double-bind event handlers on multiple calls.', function () {
            renderTemplate({});
            AJS.tabs.setup();
            AJS.tabs.setup();
            var clickSpy = sinon.spy();
            $('.tabs-menu a').bind('tabSelect', clickSpy);
            $('#menu-item-rimmer').trigger('click');

            clickSpy.should.have.been.calledOnce;
        });

        it('should work if you add a tab after calling AJS.tabs.setup', function () {
            renderTemplate({});
            AJS.tabs.setup();
            addTabMenu();
            addTabPane({});

            $('#menu-item-kryten').trigger('click');

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.false;
            expect($('#tab-kryten').is(':visible')).to.be.true;
        });

        it('soy template exists', function () {
            expect(aui.tabs).to.be.defined;
        });

        it('soy template basic rendering', function () {
            var html = aui.tabs({
                menuItems : [{
                    isActive : true,
                    url : '#tab1',
                    text : 'Tab 1'
                }, {
                    url : '#tab2',
                    text : 'Tab 2'
                }],
                paneContent : aui.tabPane({
                    isActive : true,
                    content : 'Tab 1 Content'
                }) + aui.tabPane({
                    content : 'Tab 2 Content'
                })
            });

            var $el = $(html).appendTo(AJS.$('#test-fixture'));
            expect($el.is('.aui-tabs')).to.be.true;
        });

        it('no id persist=true does not save to local storage', function () {
            renderTemplate({persist:'true'});
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-rimmer').is(':visible')).to.be.true;
            expect(getPersistent('tabgroup1')).to.be.not.defined;
        });

        it('persist with no value saves to local storage', function () {
            renderTemplate({id:'tabgroup1', persist:''});
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-rimmer').is(':visible')).to.be.true;
            expect(getPersistent('tabgroup1')).to.equal('menu-item-rimmer');
        });

        it('persist=true saves to local storage', function () {
            renderTemplate({id:'tabgroup1', persist:'true'});
            AJS.tabs.setup();

            $('#menu-item-lister').trigger('click');
            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.true;

            expect(getPersistent('tabgroup1')).to.equal('menu-item-rimmer');
        });

        it('persist with unique value saves to local storage', function () {
            renderTemplate({id:'tabgroup1', persist:'user1'});
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-rimmer').is(':visible')).to.be.true;
            expect(getPersistent('tabgroup1')).to.equal('menu-item-rimmer');
        });

        it('persist=false does not save to local storage', function () {
            renderTemplate({id:'tabgroup1', persist:'false'});
            AJS.tabs.setup();

            $('#menu-item-lister').trigger('click');
            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.true;

            expect(getPersistent('tabgroup1')).to.not.be.defined;
        });

        it('no persist does not save to local storage', function () {
            renderTemplate({id:'tabgroup1'});
            AJS.tabs.setup();

            $('#menu-item-rimmer').trigger('click');

            expect($('#tab-rimmer').is(':visible')).to.be.true;
            expect(getPersistent('tabgroup1')).to.not.be.defined;
        });

        it('persist=true saves to local storage multiple tab groups', function () {
            renderTemplate({id:'tabgroup1', persist:'true'});
            renderTemplate({id:'tabgroup2', persist:'true', tabPostfix:'2'});
            AJS.tabs.setup();

            $('#tabgroup1').find('#menu-item-lister').trigger('click');
            $('#tabgroup1').find('#menu-item-rimmer').trigger('click');
            $('#tabgroup2').find('#menu-item-rimmer2').trigger('click');
            $('#tabgroup2').find('#menu-item-lister2').trigger('click');

            expect(getPersistent('tabgroup1')).to.equal('menu-item-rimmer');
            expect(getPersistent('tabgroup2')).to.equal('menu-item-lister2');
        });

        it('persist=false doesnt load from local storage', function () {
            renderTemplate({id:'tabgroup1', persist:'false'});
            storePersistent('tabgroup1', 'menu-item-rimmer');
            AJS.tabs.setup();

            expect($('#tab-lister').is(':visible')).to.be.true;
            expect($('#tab-rimmer').is(':visible')).to.be.false;
        });

        it('persist=true loads from local storage', function () {
            renderTemplate({id:'tabgroup1', persist:'true'});
            storePersistent('tabgroup1', 'menu-item-rimmer');

            AJS.tabs.setup();

            expect($('#tab-lister').is(':visible')).to.be.false;
            expect($('#tab-rimmer').is(':visible')).to.be.true;
        });

        it('loading from local storage invokes tabSelect handler', function () {
            renderTemplate({id:'tabgroup1', persist:'true'});
            storePersistent('tabgroup1', 'menu-item-rimmer');

            var tabSelectSpy = sinon.spy();
            $('.tabs-menu a').bind('tabSelect', tabSelectSpy);
            AJS.tabs.setup();

            tabSelectSpy.should.have.been.calledOnce;
        });

        it('persist=true loads from local storage with multiple tab groups', function () {
            renderTemplate({id:'tabgroup1', persist:'true'});
            renderTemplate({id:'tabgroup2', persist:'true', tabPostfix:'2'});
            storePersistent('tabgroup1', 'menu-item-rimmer');
            storePersistent('tabgroup2', 'menu-item-rimmer2');

            AJS.tabs.setup();

            expect($('#tabgroup1').find('#tab-lister').is(':visible')).to.be.false;
            expect($('#tabgroup1').find('#tab-rimmer').is(':visible')).to.be.true;
            expect($('#tabgroup2').find('#tab-lister2').is(':visible')).to.be.false;
            expect($('#tabgroup2').find('#tab-rimmer2').is(':visible')).to.be.true;
        });
    });
});