(function ($) {

    'use strict';

    var datePickerCounter = 0;

    AJS.DatePicker = function (field, options) {

        var datePicker, initPolyfill, $field, datePickerUUID;
        var parentPopup;

        datePicker = {};

        datePickerUUID = datePickerCounter++;

        // ---------------------------------------------------------------------
        // fix up arguments ----------------------------------------------------
        // ---------------------------------------------------------------------

        $field = $(field);
        $field.attr("data-aui-dp-uuid", datePickerUUID);
        options = $.extend(undefined, AJS.DatePicker.prototype.defaultOptions, options);

        // ---------------------------------------------------------------------
        // expose arguments with getters ---------------------------------------
        // ---------------------------------------------------------------------

        datePicker.getField = function () {
            return $field;
        };

        datePicker.getOptions = function () {
            return options;
        };

        // ---------------------------------------------------------------------
        // exposed methods -----------------------------------------------------
        // ---------------------------------------------------------------------

        initPolyfill = function () {

            var calendar, handleDatePickerFocus, handleFieldBlur, handleFieldFocus,
                    handleFieldUpdate, initCalendar, isSuppressingShow,
                    isTrackingDatePickerFocus, popup, popupContents;

            // -----------------------------------------------------------------
            // expose methods for controlling the popup ------------------------
            // -----------------------------------------------------------------

            datePicker.hide = function () {
                popup.hide();
            };

            datePicker.show = function () {
                popup.show();
            };

            datePicker.setDate = function (value) {
                if (typeof calendar !== 'undefined') {
                    calendar.datepicker("setDate", value);
                }
            };

            datePicker.getDate = function (value) {
                if (typeof calendar !== 'undefined') {
                    return calendar.datepicker("getDate");
                }
            };

            // -----------------------------------------------------------------
            // initialise the calendar -----------------------------------------
            // -----------------------------------------------------------------

            initCalendar = function (i18nConfig) {

                popupContents.off();
                if (options.hint) {
                    var $hint = $('<div/>').addClass("aui-datepicker-hint");
                    $hint.append("<span/>").text(options.hint);
                    popupContents.append($hint);
                }
                calendar = $('<div/>');
                calendar.attr("data-aui-dp-popup-uuid", datePickerUUID);
                popupContents.append(calendar);

                var config = {
                    'dateFormat': options.dateFormat,
                    'defaultDate': $field.val(),
                    'maxDate': $field.attr('max'),
                    'minDate': $field.attr('min'),
                    'nextText': '>',
                    'onSelect': function (dateText, inst) {
                        $field.val(dateText);
                        $field.change();
                        datePicker.hide();
                        isSuppressingShow = true;
                        $field.focus();
                        options.onSelect && options.onSelect.call(this, dateText);
                    },
                    onChangeMonthYear: function () {
                        // defer rehresh call until current stack has cleared (after month has rendered)
                        setTimeout(popup.refresh, 0);
                    },
                    'prevText': '<'
                };

                $.extend(config, i18nConfig);

                if (options.firstDay > -1) {
                    config.firstDay = options.firstDay;
                }

                if (typeof $field.attr('step') !== 'undefined') {
                    AJS.log('WARNING: The AJS date picker polyfill currently does not support the step attribute!');
                }

                calendar.datepicker(config);

                // bind additional field processing events
                $field.on('focusout', handleFieldBlur);
                $field.on('propertychange keyup input paste', handleFieldUpdate);

            };

            // -----------------------------------------------------------------
            // event handler wrappers ------------------------------------------
            // -----------------------------------------------------------------

            handleDatePickerFocus = function (event) {
                var $eventTarget = $(event.target);
                if (!($eventTarget.closest(popupContents).length || $eventTarget.is($field))) {
                    if (!$eventTarget.closest('.ui-datepicker-header').length) {
                        datePicker.hide();
                        return;
                    }
                }
                if ($eventTarget[0] !== $field[0]) {
                    event.preventDefault();
                }
            };

            handleFieldBlur = function (event) {
                if (!(isTrackingDatePickerFocus)) {
                    $('body').on('focus blur click mousedown', '*', handleDatePickerFocus);
                    isTrackingDatePickerFocus = true;
                }
            };

            handleFieldFocus = function (event) {
                if (!(isSuppressingShow)) {
                    datePicker.show();
                } else {
                    isSuppressingShow = false;
                }
            };

            handleFieldUpdate = function (event) {
                var val = $(this).val();
                // IE10/11 fire the 'input' event when internally showing and hiding
                // the placeholder of an input. This was cancelling the inital click
                // event and preventing the selection of the first date. The val check here
                // is a workaround to assure we have legitimate user input that should update
                // the calendar
                if (val) {
                    calendar.datepicker('setDate', $field.val());
                    calendar.datepicker('option', {
                        'maxDate': $field.attr('max'),
                        'minDate': $field.attr('min')
                    });
                }
            };

            // -----------------------------------------------------------------
            // undo (almost) everything ----------------------------------------
            // -----------------------------------------------------------------

            datePicker.destroyPolyfill = function () {

                // goodbye, cruel world!
                datePicker.hide();

                $field.attr('placeholder', null);

                $field.off('propertychange keyup input paste', handleFieldUpdate);
                $field.off('focus click', handleFieldFocus);
                $field.off('focusout', handleFieldBlur);

                if (AJS.DatePicker.prototype.browserSupportsDateField) {
                    $field[0].type = 'date';
                }

                if (typeof calendar !== 'undefined') {
                    calendar.datepicker('destroy');
                }

                // TODO: figure out a way to tear down the popup (if necessary)

                delete datePicker.destroyPolyfill;

                delete datePicker.show;
                delete datePicker.hide;

            };

            // -----------------------------------------------------------------
            // polyfill bootstrap ----------------------------------------------
            // -----------------------------------------------------------------

            isSuppressingShow = false; // used to stop the popover from showing when focus is restored to the field after a date has been selected
            isTrackingDatePickerFocus = false; // used to prevent multiple bindings of handleDatePickerFocus within handleFieldBlur

            if (!(options.languageCode in AJS.DatePicker.prototype.localisations)) {
                options.languageCode = '';
            }
            var i18nConfig = AJS.DatePicker.prototype.localisations[options.languageCode];

            var containerClass = "";
            var width = 240;

            if (i18nConfig.size === "large") {
                width = 325;
                containerClass = "aui-datepicker-dialog-large";
            }
            var dialogOptions = {
                'hideCallback': function () {
                    $('body').off('focus blur click mousedown', '*', handleDatePickerFocus);
                    isTrackingDatePickerFocus = false;
                    if (parentPopup && parentPopup._datePickerPopup) {
                        delete parentPopup._datePickerPopup;
                    }
                },
                'hideDelay': null,
                'noBind': true,
                'persistent': true,
                'closeOthers': false,
                'width': width
            };

            if (options.position) {
                dialogOptions.calculatePositions = function (popup, targetPosition) {
                    // create a jQuery object from the internal
                    var vanilla = $(popup[0]);
                    return options.position.call(this, vanilla, targetPosition);
                }
            }

            popup = AJS.InlineDialog($field, undefined, function (contents, trigger, showPopup) {
                if (typeof calendar === 'undefined') {
                    popupContents = contents;
                    initCalendar(i18nConfig);
                }
                parentPopup = $(trigger).closest('.aui-inline-dialog').get(0);
                if (parentPopup) {
                    parentPopup._datePickerPopup = popup; // AUI-2696 - hackish coupling to control inline-dialog close behaviour.
                }

                showPopup();
            }, dialogOptions);

            popup.addClass('aui-datepicker-dialog');
            popup.addClass(containerClass);

            // bind what we need to start off with
            $field.on('focus click', handleFieldFocus); // the click is for fucking opera... Y U NO FIRE FOCUS EVENTS PROPERLY???

            // give users a hint that this is a date field; note that placeholder isn't technically a valid attribute
            // according to the spec...
            $field.attr('placeholder', options.dateFormat);

            // override the browser's default date field implementation (if applicable)
            // since IE doesn't support date input fields, we should be fine...
            if (options.overrideBrowserDefault && AJS.DatePicker.prototype.browserSupportsDateField) {
                $field[0].type = 'text';
            }

        };

        datePicker.reset = function () {

            if (typeof datePicker.destroyPolyfill === 'function') {
                datePicker.destroyPolyfill();
            }

            if ((!(AJS.DatePicker.prototype.browserSupportsDateField)) || options.overrideBrowserDefault) {
                initPolyfill();
            }

        };

        // ---------------------------------------------------------------------
        // bootstrap -----------------------------------------------------------
        // ---------------------------------------------------------------------

        datePicker.reset();

        return datePicker;

    };

    // -------------------------------------------------------------------------
    // things that should be common --------------------------------------------
    // -------------------------------------------------------------------------

    AJS.DatePicker.prototype.browserSupportsDateField = ($('<input type="date" />')[0].type === 'date');

    AJS.DatePicker.prototype.defaultOptions = {
        overrideBrowserDefault: false,
        firstDay: -1,
        languageCode: AJS.$('html').attr('lang') || 'en-AU',
        dateFormat: $.datepicker.W3C // same as $.datepicker.ISO_8601
    };

    // adapted from the jQuery UI Datepicker widget (v1.8.16), with the following changes:
    //   - dayNamesShort -> dayNamesMin
    //   - unnecessary attributes omitted
    /*
    CODE to extract codes out:

    var langCode, langs, out;
    langs = jQuery.datepicker.regional;
    out = {};

    for (langCode in langs) {
        if (langs.hasOwnProperty(langCode)) {
            out[langCode] = {
                'dayNames': langs[langCode].dayNames,
                'dayNamesMin': langs[langCode].dayNamesShort, // this is deliberate
                'firstDay': langs[langCode].firstDay,
                'isRTL': langs[langCode].isRTL,
                'monthNames': langs[langCode].monthNames,
                'showMonthAfterYear': langs[langCode].showMonthAfterYear,
                'yearSuffix': langs[langCode].yearSuffix
            };
        }
    }

     */
    AJS.DatePicker.prototype.localisations = {
        "": {
            "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "dayNamesMin": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "af": {
            "dayNames": ["Sondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag"],
            "dayNamesMin": ["Son", "Maa", "Din", "Woe", "Don", "Vry", "Sat"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januarie", "Februarie", "Maart", "April", "Mei", "Junie", "Julie", "Augustus", "September", "Oktober", "November", "Desember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ar-DZ": {
            "dayNames": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
            "dayNamesMin": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
            "firstDay": 6,
            "isRTL": true,
            "monthNames": ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ar": {
            "dayNames": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
            "dayNamesMin": ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
            "firstDay": 6,
            "isRTL": true,
            "monthNames": ["كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "az": {
            "dayNames": ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"],
            "dayNamesMin": ["B", "Be", "Ça", "Ç", "Ca", "C", "Ş"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "bg": {
            "dayNames": ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"],
            "dayNamesMin": ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "bs": {
            "dayNames": ["Nedelja", "Ponedeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"],
            "dayNamesMin": ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ca": {
            "dayNames": ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"],
            "dayNamesMin": ["Dug", "Dln", "Dmt", "Dmc", "Djs", "Dvn", "Dsb"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Gener", "Febrer", "Mar&ccedil;", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "cs": {
            "dayNames": ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"],
            "dayNamesMin": ["ne", "po", "út", "st", "čt", "pá", "so"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "da": {
            "dayNames": ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"],
            "dayNamesMin": ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "de": {
            "dayNames": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            "dayNamesMin": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "el": {
            "dayNames": ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
            "dayNamesMin": ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "en-AU": {
            "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "dayNamesMin": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "en-GB": {
            "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "dayNamesMin": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "en-NZ": {
            "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "dayNamesMin": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "eo": {
            "dayNames": ["Dimanĉo", "Lundo", "Mardo", "Merkredo", "Ĵaŭdo", "Vendredo", "Sabato"],
            "dayNamesMin": ["Dim", "Lun", "Mar", "Mer", "Ĵaŭ", "Ven", "Sab"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Januaro", "Februaro", "Marto", "Aprilo", "Majo", "Junio", "Julio", "Aŭgusto", "Septembro", "Oktobro", "Novembro", "Decembro"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "es": {
            "dayNames": ["Domingo", "Lunes", "Martes", "Mi&eacute;rcoles", "Jueves", "Viernes", "S&aacute;bado"],
            "dayNamesMin": ["Dom", "Lun", "Mar", "Mi&eacute;", "Juv", "Vie", "S&aacute;b"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "et": {
            "dayNames": ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"],
            "dayNamesMin": ["Pühap", "Esmasp", "Teisip", "Kolmap", "Neljap", "Reede", "Laup"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"],
            "showMonthAfterYear": false,
            "yearSuffix": "",
            "size": "large"
        },
        "eu": {
            "dayNames": ["Igandea", "Astelehena", "Asteartea", "Asteazkena", "Osteguna", "Ostirala", "Larunbata"],
            "dayNamesMin": ["Iga", "Ast", "Ast", "Ast", "Ost", "Ost", "Lar"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "fa": {
            "dayNames": ["يکشنبه", "دوشنبه", "سهشنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
            "dayNamesMin": ["ي", "د", "س", "چ", "پ", "ج", "ش"],
            "firstDay": 6,
            "isRTL": true,
            "monthNames": ["فروردين", "ارديبهشت", "خرداد", "تير", "مرداد", "شهريور", "مهر", "آبان", "آذر", "دي", "بهمن", "اسفند"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "fi": {
            "dayNames": ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"],
            "dayNamesMin": ["Su", "Ma", "Ti", "Ke", "To", "Pe", "Su"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kes&auml;kuu", "Hein&auml;kuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "fo": {
            "dayNames": ["Sunnudagur", "Mánadagur", "Týsdagur", "Mikudagur", "Hósdagur", "Fríggjadagur", "Leyardagur"],
            "dayNamesMin": ["Sun", "Mán", "Týs", "Mik", "Hós", "Frí", "Ley"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "Mars", "Apríl", "Mei", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "fr-CH": {
            "dayNames": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            "dayNamesMin": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "fr": {
            "dayNames": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            "dayNamesMin": ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "gl": {
            "dayNames": ["Domingo", "Luns", "Martes", "M&eacute;rcores", "Xoves", "Venres", "S&aacute;bado"],
            "dayNamesMin": ["Dom", "Lun", "Mar", "M&eacute;r", "Xov", "Ven", "S&aacute;b"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Xaneiro", "Febreiro", "Marzo", "Abril", "Maio", "Xuño", "Xullo", "Agosto", "Setembro", "Outubro", "Novembro", "Decembro"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "he": {
            "dayNames": ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
            "dayNamesMin": ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"],
            "firstDay": 0,
            "isRTL": true,
            "monthNames": ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "hr": {
            "dayNames": ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"],
            "dayNamesMin": ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "hu": {
            "dayNames": ["Vasárnap", "Hétfö", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"],
            "dayNamesMin": ["Vas", "Hét", "Ked", "Sze", "Csü", "Pén", "Szo"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"],
            "showMonthAfterYear": true,
            "yearSuffix": ""
        },
        "hy": {
            "dayNames": ["կիրակի", "եկուշաբթի", "երեքշաբթի", "չորեքշաբթի", "հինգշաբթի", "ուրբաթ", "շաբաթ"],
            "dayNamesMin": ["կիր", "երկ", "երք", "չրք", "հնգ", "ուրբ", "շբթ"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "id": {
            "dayNames": ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
            "dayNamesMin": ["Min", "Sen", "Sel", "Rab", "kam", "Jum", "Sab"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "is": {
            "dayNames": ["Sunnudagur", "M&aacute;nudagur", "&THORN;ri&eth;judagur", "Mi&eth;vikudagur", "Fimmtudagur", "F&ouml;studagur", "Laugardagur"],
            "dayNamesMin": ["Sun", "M&aacute;n", "&THORN;ri", "Mi&eth;", "Fim", "F&ouml;s", "Lau"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Jan&uacute;ar", "Febr&uacute;ar", "Mars", "Apr&iacute;l", "Ma&iacute", "J&uacute;n&iacute;", "J&uacute;l&iacute;", "&Aacute;g&uacute;st", "September", "Okt&oacute;ber", "N&oacute;vember", "Desember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "it": {
            "dayNames": ["Domenica", "Luned&#236", "Marted&#236", "Mercoled&#236", "Gioved&#236", "Venerd&#236", "Sabato"],
            "dayNamesMin": ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ja": {
            "dayNames": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
            "dayNamesMin": ["日", "月", "火", "水", "木", "金", "土"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            "showMonthAfterYear": true,
            "yearSuffix": "年"
        },
        "ko": {
            "dayNames": ["일", "월", "화", "수", "목", "금", "토"],
            "dayNamesMin": ["일", "월", "화", "수", "목", "금", "토"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["1월(JAN)", "2월(FEB)", "3월(MAR)", "4월(APR)", "5월(MAY)", "6월(JUN)", "7월(JUL)", "8월(AUG)", "9월(SEP)", "10월(OCT)", "11월(NOV)", "12월(DEC)"],
            "showMonthAfterYear": false,
            "yearSuffix": "년"
        },
        "kz": {
            "dayNames": ["Жексенбі", "Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі"],
            "dayNamesMin": ["жкс", "дсн", "ссн", "срс", "бсн", "жма", "снб"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "lt": {
            "dayNames": ["sekmadienis", "pirmadienis", "antradienis", "trečiadienis", "ketvirtadienis", "penktadienis", "šeštadienis"],
            "dayNamesMin": ["sek", "pir", "ant", "tre", "ket", "pen", "šeš"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "lv": {
            "dayNames": ["svētdiena", "pirmdiena", "otrdiena", "trešdiena", "ceturtdiena", "piektdiena", "sestdiena"],
            "dayNamesMin": ["svt", "prm", "otr", "tre", "ctr", "pkt", "sst"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ml": {
            "dayNames": ["ഞായര്", "തിങ്കള്", "ചൊവ്വ", "ബുധന്", "വ്യാഴം", "വെള്ളി", "ശനി"],
            "dayNamesMin": ["ഞായ", "തിങ്ക", "ചൊവ്വ", "ബുധ", "വ്യാഴം", "വെള്ളി", "ശനി"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["ജനുവരി", "ഫെബ്രുവരി", "മാര്ച്ച്", "ഏപ്രില്", "മേയ്", "ജൂണ്", "ജൂലൈ", "ആഗസ്റ്റ്", "സെപ്റ്റംബര്", "ഒക്ടോബര്", "നവംബര്", "ഡിസംബര്"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ms": {
            "dayNames": ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"],
            "dayNamesMin": ["Aha", "Isn", "Sel", "Rab", "kha", "Jum", "Sab"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "nl": {
            "dayNames": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
            "dayNamesMin": ["zon", "maa", "din", "woe", "don", "vri", "zat"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "no": {
            "dayNames": ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"],
            "dayNamesMin": ["søn", "man", "tir", "ons", "tor", "fre", "lør"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "pl": {
            "dayNames": ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"],
            "dayNamesMin": ["Nie", "Pn", "Wt", "Śr", "Czw", "Pt", "So"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "pt-BR": {
            "dayNames": ["Domingo", "Segunda-feira", "Ter&ccedil;a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "S&aacute;bado"],
            "dayNamesMin": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S&aacute;b"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Janeiro", "Fevereiro", "Mar&ccedil;o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "pt": {
            "dayNames": ["Domingo", "Segunda-feira", "Ter&ccedil;a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "S&aacute;bado"],
            "dayNamesMin": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S&aacute;b"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Janeiro", "Fevereiro", "Mar&ccedil;o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "rm": {
            "dayNames": ["Dumengia", "Glindesdi", "Mardi", "Mesemna", "Gievgia", "Venderdi", "Sonda"],
            "dayNamesMin": ["Dum", "Gli", "Mar", "Mes", "Gie", "Ven", "Som"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Schaner", "Favrer", "Mars", "Avrigl", "Matg", "Zercladur", "Fanadur", "Avust", "Settember", "October", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ro": {
            "dayNames": ["Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă"],
            "dayNamesMin": ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ru": {
            "dayNames": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
            "dayNamesMin": ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sk": {
            "dayNames": ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"],
            "dayNamesMin": ["Ned", "Pon", "Uto", "Str", "Štv", "Pia", "Sob"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sl": {
            "dayNames": ["Nedelja", "Ponedeljek", "Torek", "Sreda", "&#x10C;etrtek", "Petek", "Sobota"],
            "dayNamesMin": ["Ned", "Pon", "Tor", "Sre", "&#x10C;et", "Pet", "Sob"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sq": {
            "dayNames": ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtune"],
            "dayNamesMin": ["Di", "Hë", "Ma", "Më", "En", "Pr", "Sh"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sr-SR": {
            "dayNames": ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"],
            "dayNamesMin": ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sr": {
            "dayNames": ["Недеља", "Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"],
            "dayNamesMin": ["Нед", "Пон", "Уто", "Сре", "Чет", "Пет", "Суб"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Јануар", "Фебруар", "Март", "Април", "Мај", "Јун", "Јул", "Август", "Септембар", "Октобар", "Новембар", "Децембар"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "sv": {
            "dayNames": ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
            "dayNamesMin": ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "ta": {
            "dayNames": ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"],
            "dayNamesMin": ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["தை", "மாசி", "பங்குனி", "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "th": {
            "dayNames": ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
            "dayNamesMin": ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "tj": {
            "dayNames": ["якшанбе", "душанбе", "сешанбе", "чоршанбе", "панҷшанбе", "ҷумъа", "шанбе"],
            "dayNamesMin": ["якш", "душ", "сеш", "чор", "пан", "ҷум", "шан"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Январ", "Феврал", "Март", "Апрел", "Май", "Июн", "Июл", "Август", "Сентябр", "Октябр", "Ноябр", "Декабр"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "tr": {
            "dayNames": ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
            "dayNamesMin": ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "uk": {
            "dayNames": ["неділя", "понеділок", "вівторок", "середа", "четвер", "п’ятниця", "субота"],
            "dayNamesMin": ["нед", "пнд", "вів", "срд", "чтв", "птн", "сбт"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "vi": {
            "dayNames": ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
            "dayNamesMin": ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"],
            "showMonthAfterYear": false,
            "yearSuffix": ""
        },
        "zh-CN": {
            "dayNames": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            "dayNamesMin": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            "showMonthAfterYear": true,
            "yearSuffix": "年"
        },
        "zh-HK": {
            "dayNames": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            "dayNamesMin": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            "firstDay": 0,
            "isRTL": false,
            "monthNames": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            "showMonthAfterYear": true,
            "yearSuffix": "年"
        },
        "zh-TW": {
            "dayNames": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            "dayNamesMin": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            "firstDay": 1,
            "isRTL": false,
            "monthNames": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            "showMonthAfterYear": true,
            "yearSuffix": "年"
        }
    };

    // -------------------------------------------------------------------------
    // finally, integrate with jQuery for convenience --------------------------
    // -------------------------------------------------------------------------

    $.fn.datePicker = function (options) {
        return (new AJS.DatePicker(this, options));
    };

}(jQuery));
