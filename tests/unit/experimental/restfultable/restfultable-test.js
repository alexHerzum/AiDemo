/* jshint expr:true */
define(['underscore', 'experimental-restfultable/restfultable.all', 'aui-mocha'], function (_) {
    'use strict';
    describe('Initialization', function () {
        var server,
            rt,
            rtRows,
            $table;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            server = sinon.fakeServer.create();
            var users = [{'id':1, 'name': 'adam'},{'id':2, 'name': 'betty'},{'id':3, 'name': 'chris'}];

            server.respondWith('GET', '/all', [ 200, { 'Content-Type': 'application/json' }, JSON.stringify(users) ]);

            rt = new AJS.RestfulTable({
                el: $('<table id="test-table" class="aui"></table>'),
                resources: {
                    all: '/all',
                    self: '/single'
                },
                columns: [
                    {
                        id: 'name',
                        header: 'Name'
                    }
                ]
            });

            rtRows = [];
            rt.bind(AJS.RestfulTable.Events.ROW_INITIALIZED, _.bind(function (row) {
                rtRows.push(row);
            }, this));

            $table = rt.getTable();
            $table.appendTo('#test-fixture');

            server.respond();
        });

        afterEach(function () {
            server.restore();
            $('#test-fixture').remove();
        });

        it('renders properly', function () {
            expect($table.length).to.equal(1);
            expect(rtRows.length).to.equal(3);

            expect($table.find('thead th:first').text()).to.equal('Name');
            expect($table.find('tbody.aui-restfultable-create tr').length).to.equal(1);
            expect($table.find('tbody:not(.aui-restfultable-create) tr').length).to.equal(3);
        });

        it('test - proper row data is used', function () {
            expect(rtRows[0].model.get('id')).to.equal(1);
            expect(rtRows[0].model.get('name')).to.equal('adam');

            expect($table.find('tbody:not(.aui-restfultable-create) tr:eq(0)').data('id')).to.equal(1);
            expect($table.find('tbody:not(.aui-restfultable-create) tr:eq(0)').data('name')).to.equal('adam');
            expect($table.find('tbody:not(.aui-restfultable-create) tr:eq(1) td:first').text()).to.equal('betty');
        });

        it('test - edit works', function () {
            var row = rtRows[0];
            var edited = rt.edit(row, 'name');
            edited.$('input[name=name]').val('edited');
            edited.submit(false);

            server.respondWith('PUT', '/single/1', function (xhr) {
                JSON.parse(xhr.requestBody);
                xhr.respond(200, { 'Content-Type': 'application/json' }, xhr.requestBody);
            });
            server.respond();

            var editResponse = JSON.parse(server.requests[1].requestBody);
            expect(editResponse.name).to.equal('edited');
        });

        it('test - fieldFocusSelector is defined for create row', function () {
            var row = rtRows[0];
            var edited = rt.edit(row, 'name');
            edited.$('input[name=name]').focus();
            var createRow = rt.getCreateRow();
            createRow.focus('name');

            expect(createRow.$el.get(0).firstChild.firstChild).to.equal(document.activeElement);
        });
    });

    describe('Custom object serialization', function () {
        var server,
            rt,
            rtRows,
            $table;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            server = sinon.fakeServer.create();
            var users = [{'id':1, 'name': 'adam'}];

            server.respondWith('GET', '/all', [ 200, { 'Content-Type': 'application/json' }, JSON.stringify(users) ]);
            rt = new AJS.RestfulTable({
                el: $('<table id="test-table" class="aui"></table>'),
                resources: {
                    all: '/all',
                    self: '/single'
                },
                columns: [
                    {
                        id: 'name',
                        header: 'Name'
                    }
                ],
                views: {
                    editRow: AJS.RestfulTable.EditRow.extend({
                        initialize: function () {
                            AJS.RestfulTable.EditRow.prototype.initialize.apply(this, Array.prototype.slice.call(arguments));
                        },
                        serializeObject: function () {
                            return {
                                name: this.$el.find(':input[name=name]').val() + ' serialized'
                            };
                        }
                    })
                }
            });

            rtRows = [];
            rt.bind(AJS.RestfulTable.Events.ROW_INITIALIZED, _.bind(function (row) {
                rtRows.push(row);
            }, this));

            $table = rt.getTable();
            $table.appendTo('#test-fixture');
            server.respond();
        });

        afterEach(function () {
            server.restore();
            $('#test-fixture').remove();
        });

        it('should serialize updated table input on edit', function () {
            var row = rtRows[0];
            var edited = rt.edit(row, 'name');
            edited.$('input[name=name]').val('edited');
            edited.submit(false);
            server.respondWith('PUT', '/single/1', function (xhr) {
                JSON.parse(xhr.requestBody);
                xhr.respond(200, { 'Content-Type': 'application/json' }, xhr.requestBody);
            });
            server.respond();

            var editResponse = JSON.parse(server.requests[1].requestBody);
            expect(editResponse.name).to.equal('edited serialized');
        });
    });
});