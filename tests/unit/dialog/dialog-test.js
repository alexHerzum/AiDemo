/*jshint expr:true */
define(['dialog'], function () {
    'use strict';
    describe('Popup', function () {
        var testPopup;
        beforeEach(function () {
            testPopup = AJS.popup({height:500, width: 500, id:'test-popup'});
        });

        afterEach(function () {
            AJS.$('.aui-popup').remove();
        });

        it('API', function () {
            expect(testPopup).to.be.a('object');
            expect(testPopup.changeSize).to.be.a('function');
            expect(testPopup.disable).to.be.a('function');
            expect(testPopup.enable).to.be.a('function');
            expect(testPopup.hide).to.be.a('function');
            expect(testPopup.remove).to.be.a('function');
            expect(testPopup.show).to.be.a('function');
        });

        it('constructor', function () {
            expect(AJS.$('#test-popup').size()).to.not.equal(0);
        });

        it('constructor with dimension', function () {
            AJS.popup({height:123, width: 234, id:'test-popup2'});
            expect(AJS.$('#test-popup').height()).to.equal(500);
            expect(AJS.$('#test-popup').width()).to.equal(500);
            expect(AJS.$('#test-popup2').height()).to.equal(123);
            expect(AJS.$('#test-popup2').width()).to.equal(234);
        });
    });

    describe('Dialog -', function () {
        var testDialog;
        beforeEach(function () {
            testDialog = new AJS.Dialog({height:500, width: 500, id:'test-dialog'});
        });

        afterEach(function () {
            $('#test-dialog').remove();
        });

        it('API', function () {
            expect(testDialog).to.be.a('object');
            expect(testDialog.addHeader).to.be.a('function');
            expect(testDialog.addButton).to.be.a('function');
            expect(testDialog.addSubmit).to.be.a('function');
            expect(testDialog.addLink).to.be.a('function');
            expect(testDialog.addButtonPanel).to.be.a('function');
            expect(testDialog.addPanel).to.be.a('function');
            expect(testDialog.addPage).to.be.a('function');
            expect(testDialog.nextPage).to.be.a('function');
            expect(testDialog.prevPage).to.be.a('function');
            expect(testDialog.gotoPage).to.be.a('function');
            expect(testDialog.getPanel).to.be.a('function');
            expect(testDialog.getPage).to.be.a('function');
            expect(testDialog.getCurrentPanel).to.be.a('function');
            expect(testDialog.gotoPanel).to.be.a('function');
            expect(testDialog.show).to.be.a('function');
            expect(testDialog.hide).to.be.a('function');
            expect(testDialog.remove).to.be.a('function');
            expect(testDialog.disable).to.be.a('function');
            expect(testDialog.enable).to.be.a('function');
            expect(testDialog.get).to.be.a('function');
            expect(testDialog.updateHeight).to.be.a('function');
        });

        it('Add a header', function () {
            expect(testDialog.addHeader('HEADER', 'header')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-title').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components .dialog-title').hasClass('header')).to.be.true;
            expect(AJS.$('#test-dialog .dialog-components .dialog-title').text()).to.equal('HEADER');
        });

        it('Add a html escaped header', function () {
            testDialog.addHeader('<u>foo & bar</u>');
            expect(AJS.$('#test-dialog .dialog-components .dialog-title').html()).to.equal('&lt;u&gt;foo &amp; bar&lt;/u&gt;');
        });

        it('Add a button', function () {
            expect(testDialog.addButton('BUTTON', function (){}, 'button')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel button.button-panel-button').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel button.button-panel-button').text()).to.equal('BUTTON');
        });

        it('Add a link', function () {
            expect(testDialog.addLink('LINK', function (){}, 'link')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel a.button-panel-link').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel a.button-panel-link').text()).to.equal('LINK');
        });

        it('Add a submit button', function () {
            expect(testDialog.addSubmit('SUBMIT', function (){})).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel button.button-panel-submit-button').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel button.button-panel-submit-button').text()).to.equal('SUBMIT');
        });

        it('Add a cancel button', function () {
            expect(testDialog.addCancel('CANCEL', function (){})).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel a.button-panel-cancel-link').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel a.button-panel-cancel-link').text()).to.equal('CANCEL');
        });

        it('Add a button panel', function () {
            expect(testDialog.addButtonPanel()).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components .dialog-button-panel').size()).to.not.equal(0);
        });

        it('Add a panel', function () {
            expect(testDialog.addPanel('panel', 'some text', 'panel-body')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components div.dialog-page-body div.dialog-panel-body').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components ul.dialog-page-menu li.page-menu-item button.item-button').text()).to.equal('panel');
        });

        it('Add multiple panels', function () {
            expect(testDialog.addPanel('panel', 'some text', 'panel-body')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components div.dialog-page-body div.dialog-panel-body:nth-child(1)').size()).to.not.equal(0);
            expect(testDialog.addPanel('panel', 'some text', 'panel-body')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components div.dialog-page-body div.dialog-panel-body:nth-child(2)').size()).to.not.equal(0);
        });

        it('Add a panel with an id', function () {
            expect(testDialog.addPanel('panel', 'some text', 'panel-body', 'panel-1')).to.be.a('object');
            expect(AJS.$('#test-dialog .dialog-components div.dialog-page-body div.dialog-panel-body:nth-child(1)').size()).to.not.equal(0);
            expect(AJS.$('#test-dialog .dialog-components ul.dialog-page-menu li.page-menu-item button.item-button').attr('id')).to.equal('panel-1');
        });

        it('Add a page', function () {
            var newPage = testDialog.addPage('page');
            expect(newPage).to.be.a('object');
            expect(!AJS.$(newPage.page[1].body).is(':visible')).to.be.true;
            expect(testDialog.curpage).to.equal(1);
        });

        it('Go to next page', function () {
            testDialog.addPage();
            testDialog.addPage();
            testDialog.addPage();
            expect(testDialog.nextPage()).to.be.a('object');
            expect(testDialog.curpage).to.equal(0);
            testDialog.nextPage();
            expect(testDialog.curpage).to.equal(1);
            testDialog.nextPage();
            expect(testDialog.curpage).to.equal(2);
        });

        it('Go to previous page', function () {
            testDialog.addPage();
            testDialog.addPage();
            testDialog.addPage();
            testDialog.nextPage();
            testDialog.nextPage();
            testDialog.nextPage();
            expect(testDialog.curpage).to.equal(2);
            expect(testDialog.prevPage()).to.be.a('object');
            expect(testDialog.curpage).to.equal(1);
            testDialog.prevPage();
            expect(testDialog.curpage).to.equal(0);
            testDialog.prevPage();
            expect(testDialog.curpage).to.equal(3);
        });

        it('Go to specified page', function () {
            expect(testDialog.gotoPage(0)).to.be.a('object');
            expect(testDialog.curpage).to.equal(0);
        });

        it('Get the specified panel', function () {
            testDialog.addPanel('panel', 'some text', 'panel-body');
            expect(testDialog.getPanel(0, 0)).to.be.a('object');
        });

        it('Get the specified page', function () {
            expect(testDialog.getPage(0)).to.be.a('object');
        });

        it('Get the current panel', function () {
            testDialog.addPanel('panel', 'some text', 'panel-body');
            expect(testDialog.getCurrentPanel()).to.be.a('object');
            expect(testDialog.getCurrentPanel()).to.equal(testDialog.getPanel(0, 0));
        });

        it('Update height', function () {
            testDialog.addHeader('Test Dialog');
            testDialog.addPanel('', '<div>Foobar</div>');
            testDialog.addButtonPanel();
            testDialog.addButton('Test Button');
            testDialog.addCancel('Cancel', function () {});
            testDialog.show();
            var h0 = document.getElementById('test-dialog').offsetHeight;
            testDialog.getCurrentPanel().body.html('<div style="height:123px"></div>');
            testDialog.updateHeight();
            var h1 = document.getElementById('test-dialog').offsetHeight;
            expect(h1).to.be.below(h0);
            expect(h1).to.be.above(123);
        });

        it('Check shortcut keybinds are only done a single time', function () {
            var spy = sinon.spy();
            var dialogWithSpy = new AJS.Dialog({height:500, width: 500, id:'spy-dialog', keypressListener: spy});
            dialogWithSpy.addPanel('panel', 'some text', 'panel-body');
            dialogWithSpy.show();
            $(document).trigger('keydown');
            spy.should.have.been.calledOnce;
            dialogWithSpy.updateHeight();
            $(document).trigger('keydown');
            spy.should.have.been.calledTwice;
            $('#spy-dialog').remove();
        });
    });
});