/*->
 #name>Sortable Tables
 #javascript>Yes
 #css>Yes
 #description> Standards Patterns and Styling for HTML Sortable Tables
 <-*/
(function() {
    var DEFAULT_SORT_OPTIONS = {sortMultiSortKey: '', headers: {}, debug: false};

    function sortTable($table) {
        var options = DEFAULT_SORT_OPTIONS;
        $table.find("th").each(function(index, header) {

            var $header = AJS.$(header);
            options.headers[index] = {};
            if ($header.hasClass("aui-table-column-unsortable")) {
                options.headers[index].sorter = false;
            } else {
                $header.attr('tabindex', '0');
                $header.wrapInner("<span class='aui-table-header-content'/>");
                if ($header.hasClass("aui-table-column-issue-key")) {
                    options.headers[index].sorter = "issue-key";
                }
            }
        });
        $table.tablesorter(options);
    }

    AJS.tablessortable = {
        setup: function() {

            /*
             This parser is used for issue keys in the format <PROJECT_KEY>-<ISSUE_NUMBER>, where <PROJECT_KEY> is a maximum
             10 character string with characters(A-Z). Assumes that issue number is no larger than 999,999. e.g. not more
             than a million issues.
             This pads the issue key to allow for proper string sorting so that the project key is always 10 characters and the
             issue number is always 6 digits. e.g. it appends the project key '.' until it is 10 characters long and prepends 0
             so that the issue number is 6 digits long. e.g. CONF-102 == CONF......000102. This is to allow proper string sorting.
             */
            AJS.$.tablesorter.addParser({
                id: 'issue-key',
                is: function() {
                    return false;
                },

                format: function(s) {
                    var keyComponents = s.split("-");
                    var projectKey = keyComponents[0];
                    var issueNumber = keyComponents[1];

                    var PROJECT_KEY_TEMPLATE = "..........";
                    var ISSUE_NUMBER_TEMPLATE = "000000";
                    var stringRepresentation = (projectKey + PROJECT_KEY_TEMPLATE).slice(0, PROJECT_KEY_TEMPLATE.length);
                    stringRepresentation += (ISSUE_NUMBER_TEMPLATE + issueNumber).slice(-ISSUE_NUMBER_TEMPLATE.length);

                    return stringRepresentation;
                },

                type: 'text'
            });

            /*
             Text parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is not set
             or set to 'text'.
             */
            AJS.$.tablesorter.addParser({
                id: 'textSortAttributeParser',
                is: function (nodeValue, table, node) {
                    return node.hasAttribute('data-sort-value') && (!node.hasAttribute('data-sort-type') || node.getAttribute('data-sort-type') === 'text');
                },
                format: function (nodeValue, table, node, offset) {
                    return node.getAttribute('data-sort-value');
                },
                type: 'text'
            });

            /*
             Numeric parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is set
             to 'numeric'.
             */
            AJS.$.tablesorter.addParser({
                id: 'numericSortAttributeParser',
                is: function (nodeValue, table, node) {
                    return node.getAttribute('data-sort-type') === 'numeric' && node.hasAttribute('data-sort-value');
                },
                format: function (nodeValue, table, node, offset) {
                    return node.getAttribute('data-sort-value');
                },
                type: 'numeric'
            });

            AJS.$(".aui-table-sortable").each(function() {
                sortTable(AJS.$(this));
            });
        },

        setTableSortable: function($table) {
            sortTable($table);
        }
    };

    AJS.$(AJS.tablessortable.setup);
})();