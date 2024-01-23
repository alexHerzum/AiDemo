/* jshint expr:true */
define(['aui-date-picker', 'aui-mocha'], function() {
    'use strict';
    describe('Date Picker', function() {
        beforeEach(function() {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            AJS.$('#test-fixture').html('<input class="aui-date-picker" id="test-input" type="date">');
        });

        afterEach(function() {
            $('#test-fixture').remove();
        });

        function selectDate(date) {
            $('.ui-datepicker-calendar td:contains(' + date + ')').click();
        }

        it('API', function () {
            expect(AJS.DatePicker).to.be.a('function');
            expect(AJS.DatePicker.prototype.browserSupportsDateField).to.be.a('boolean');
            expect(AJS.DatePicker.prototype.defaultOptions).to.be.an('object');
            expect(AJS.DatePicker.prototype.defaultOptions.overrideBrowserDefault).to.be.a('boolean');
            expect(AJS.DatePicker.prototype.defaultOptions.firstDay).to.be.a('number');
            expect(AJS.DatePicker.prototype.defaultOptions.languageCode).to.be.a('string');
            expect(AJS.DatePicker.prototype.localisations).to.be.an('object');
        });

        it('instance API (without polyfill)', function () {
            var datePicker, input;

            AJS.DatePicker.prototype.browserSupportsDateField = true;

            input = AJS.$('#test-input');
            datePicker = input.datePicker();

            expect(datePicker).to.be.an('object');
            expect(datePicker.getField).to.be.a('function');
            expect(datePicker.getOptions).to.be.a('function');
            expect(datePicker.reset).to.be.a('function');
            expect(datePicker.hide).to.not.be.defined;
            expect(datePicker.show).to.not.be.defined;
            expect(datePicker.getDate).to.not.be.defined;
            expect(datePicker.setDate).to.not.be.defined;
            expect(datePicker.destroyPolyfill).to.not.be.defined;
        });

        it('instance API (with polyfill)', function () {
            var datePicker, input;

            AJS.DatePicker.prototype.browserSupportsDateField = false;

            input = AJS.$('#test-input');
            datePicker = input.datePicker();

            expect(datePicker).to.be.an('object');
            expect(datePicker.getField).to.be.a('function');
            expect(datePicker.getDate).to.be.a('function');
            expect(datePicker.setDate).to.be.a('function');
            expect(datePicker.getOptions).to.be.a('function');
            expect(datePicker.reset).to.be.a('function');
            expect(datePicker.hide).to.be.a('function');
            expect(datePicker.show).to.be.a('function');
            expect(datePicker.destroyPolyfill).to.be.a('function');
        });

        it('change event fires (with polyfill)', function () {
            var input, datePicker, inputEventSpy;

            AJS.DatePicker.prototype.browserSupportsDateField = false;

            input = AJS.$('#test-input');
            inputEventSpy = sinon.spy();
            input.on('change', inputEventSpy);

            datePicker = input.datePicker();
            datePicker.show();
            selectDate('16');

            inputEventSpy.should.have.been.calledOnce;
        });
    });
});