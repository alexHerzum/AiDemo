@page (status-code = 200) {
    /*@ dropdown2 legacy trigger has been deprecated */
    .aui-dropdown2-trigger.aui-style-dropdown2triggerlegacy1 {
        count: 0;
    }

    /*@ Zebra table rows have been deprecated */
    .aui-zebra {
        count: 0;
    }

    /*@ aui-nav-current has been deprecated, you should instead use aui-nav-selected */
    .aui-nav-pagination > li.aui-nav-current {
        count: 0;
    }

    /*@ vertical tabs have been deprecated */
    .aui-tabs.vertical-tabs {
        count: 0;
    }

    /*@  The span.content in aui forms has been deprecated*/
    form.aui span.content {
        count: 0;
    }

    /*@ .button and .buttons-container have been deprecated. Use aui-button and aui-buttons instead */
    form.aui .button,
    form.aui .buttons-container {
        count: 0;
    }

    /*@  form icons have been deprecated*/
    form.aui .icon-date,
    form.aui .icon-range,
    form.aui .icon-help,
    form.aui .icon-required,
    form.aui .icon-inline-help,
    form.aui .icon-users,
    .aui-icon-date,
    .aui-icon-range,
    .aui-icon-help,
    .aui-icon-required,
    .aui-icon-users,
    .aui-icon-inline-help {
        count: 0;
    }

    /*@ Core icons have been deprecated */
    .aui-icon.icon-move-d,
    .aui-icon.icon-move,
    .aui-icon.icon-dropdown-d,
    .aui-icon.icon-dropdown,
    .aui-icon.icon-dropdown-active-d,
    .aui-icon.icon-dropdown-active,
    .aui-icon.icon-minimize-d,
    .aui-icon.icon-minimize,
    .aui-icon.icon-maximize-d,
    .aui-icon.icon-maximize {
            count: 0;
    }

    /*@ Unprefixed message types have been deprecated AUI-2150 */
    .aui-message.error:not(.aui-message-error),
    .aui-message.warning:not(.aui-message-warning),
    .aui-message.hint:not(.aui-message-hint),
    .aui-message.info:not(.aui-message-info),
    .aui-message.success:not(.aui-message-success) {
        count: 0;
    }

    /*@ should only put banners in the header, not messages AUI-2712 */
    #header .aui-message {
        count: 0;
    }

    /*@ message icon span has been deprecated */
    .aui-message span.aui-icon {
        count: 0;
    }

    /*@ Unprefixed dropdown2 css have been deprecated AUI-2150 */
    .aui-dropdown2 .active:not(.aui-dropdown2-active),
    .aui-dropdown2 .checked:not(.aui-dropdown2-checked),
    .aui-dropdown2 .disabled:not(.aui-dropdown2-disabled),
    .aui-dropdown2 .interactive:not(.aui-dropdown2-interactive) {
        count: 0;
    }
}
