/* jshint expr:true */
define(['template', 'aui-mocha'], function () {
    'use strict';
    describe('AJS.template', function () {
        it('handles html escaping correctly', function () {
            var template = AJS.template('Hello, {name}. Welcome to {application}.<br>');

            expect(template.fill({name:'"O\'Foo"', application:'<JIRA & Confluence>'}).toString()).to.equal(
                'Hello, &quot;O&#39;Foo&quot;. Welcome to &lt;JIRA &amp; Confluence&gt;.<br>');
        });
    });
});