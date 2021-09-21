export function enumeration(obj) {
    const temp = {};
    for (let key in obj) {
        temp[key] = { value: obj[key] };
    }
    const returnValue = {};
    Object.defineProperties(returnValue, temp);

    return returnValue;
};

export const TYPE = enumeration({
    UNDEFINED: 'undefined',
    STRING: 'string',
    FUNCTION: 'function',
});

export const KEY = enumeration({
    ENTER: 'Enter',
})

export const HTML_EVENT = enumeration({
    ON_CLICK: 'click',
    ON_CHANGE: 'change',
    ON_INPUT: 'input',
    ON_KEYUP: 'keyup',
    ON_KEYDOWN: 'keydown',
    ON_RESIZE: 'onresize',
    ON_BEFORE_UNLOAD: 'beforeunload',
});

export const HTML_TAG_NAME = enumeration({
    A: 'A',
    BUTTON: 'BUTTON',
    DIV: 'DIV',
    INPUT: 'INPUT',
    LABEL: 'LABEL',
    TD: 'TD',
    TR: 'TR',
});

export const HTML_ATTRIBUTE = enumeration({
    DISABLED: 'disabled',
    FOR: 'for',
    HIDDEN: 'hidden',
    NAME: 'name',
    TAB_INDEX: 'tabindex',
    TITLE: 'title',
});

export const HTML_ATTRIBUTE_VALUE = enumeration({
    CHECKBOX: 'checkbox',
})

export const TAG_ID = enumeration({
    HEADER: 'header',
    FOOTER: 'footer',
    ACTIVITY_ITEMS: 'activity-items',
    ADD_ACTIVITY: 'add-activity',
    ADD_ACTIVITY_DIALOG: 'add-activity-dialog',
    ADD_ACTIVITY_NAME: 'add-activity-name',
    ADD_AND_START: 'add-and-start',
    REMOVE_ACTIVITIES: 'remove-activities',
    REMOVE_ACTIVITIES_DIALOG: 'remove-activities-dialog',
    REMOVE_ACTIVITIES_DIALOG_LIST: 'remove-activities-dialog-list',
    REMOVE_ACTIVITIES_DIALOG_APPLY: 'remove-activities-dialog-apply',
    TIMELINE: 'timeline',
    STOP_TIME_TRACKER: 'stop-time-tracker',
    OPEN_STATISTICS_DIALOG: 'open-statistics-dialog',
    EDIT_TIMELINE_DIALOG: 'edit-timeline-dialog',
    EDIT_TIMELINE_DIALOG_ACTIVITY_NAME: 'edit-timeline-dialog-activity-name',
    EDIT_TIMELINE_DIALOG_START_HOUR: 'edit-timeline-dialog-start-hour',
    EDIT_TIMELINE_DIALOG_START_MINUTES: 'edit-timeline-dialog-start-minutes',
    EDIT_TIMELINE_DIALOG_START_SECONDS: 'edit-timeline-dialog-start-seconds',
    EDIT_TIMELINE_DIALOG_END_HOUR: 'edit-timeline-dialog-end-hour',
    EDIT_TIMELINE_DIALOG_END_MINUTES: 'edit-timeline-dialog-end-minutes',
    EDIT_TIMELINE_DIALOG_END_SECONDS: 'edit-timeline-dialog-end-seconds',
    EDIT_TIMELINE_DIALOG_INCREASE_START: 'edit-timeline-dialog-increase-start',
    EDIT_TIMELINE_DIALOG_DECREASE_START: 'edit-timeline-dialog-decrease-start',
    EDIT_TIMELINE_DIALOG_INCREASE_END: 'edit-timeline-dialog-increase-end',
    EDIT_TIMELINE_DIALOG_DECREASE_END: 'edit-timeline-dialog-decrease-end',
    APPLY_EDIT_TIMELINE_DIALOG: 'apply-edit-timeline-dialog',
    STATISTICS_DIALOG: 'statistics-dialog',
    STATISTICS_OUTPUT: 'statistics-output',
    CLEAR: 'clear',
});

export const CLASS_NAME = enumeration({
    HIDDEN: 'hidden',
    DIALOG: 'dialog',
    BUTTON: 'button',
    SMALL: 'small',
    THIN: 'thin',
    THICK: 'thick',
    FULL_WIDTH: 'full-width',
    DISABLED_BUTTON: 'disabled-button',
    BUTTON_ACTIVITY: 'button-activity',
    BUTTON_APPLY: 'button-apply',
    BUTTON_CIRCLE: 'button-circle',
    BUTTON_EDIT: 'button-edit',
    BUTTON_FUNCTION: 'button-function',
    ACTIVITY_NAME: 'activity-name',
    TIMELINE_ROW_TIME: 'timeline-row-time',
    REMOVE_ACTIVITIES_DIALOG_ROW: 'remove-activities-dialog-row',
    TO_REMOVE_ACTIVITY: 'to-remove-activity',
});

export const TEXT = enumeration({
    EDIT_SYMBOL: '&#x270F;',
});

export const ATTRIBUTE = enumeration({
    ACTIVITY_ID: 'data-activity-id',
    ACTIVITY_NAME: 'data-activity-name',
    START: 'data-start',
    END: 'data-end',
    INDEX: 'data-index',
});

export const NAME = enumeration({
    CLOSE: 'close',
});

export const APP_EVENT = enumeration({
    OPEN_ADD_ACTIVITY_DIALOG: Symbol(),
    OPEN_STATISTICS_DIALOG: Symbol(),
    ON_ADD_AND_START_BUTTON: Symbol(),
    ADD_ACTIVITY: Symbol(),
    GET_ACTIVITIES: Symbol(),
    REMOVE_ACTIVITIES: Symbol(),
    NO_ACTIVITIES: Symbol(),
    OPEN_REMOVE_ACTIVITIES_DIALOG: Symbol(),
    ENABLE_ADD_AND_START_BUTTON: Symbol(),
    DISABLE_ADD_AND_START_BUTTON: Symbol(),
    START_TIME_TRACKER: Symbol(),
    STOP_TIME_TRACKER: Symbol(),
    OPEN_EDIT_TIMELINE_DIALOG: Symbol(),
    ENABLE_STATISTICS_BUTTON: Symbol(),
    DISABLE_STATISTICS_BUTTON: Symbol(),
    CLEAR_TIMELINE: Symbol(),
    DISABLE_ACTIVITY_BUTTON: Symbol(),
    ENABLE_STOP_TIME_TRACKER_BUTTON: Symbol(),
});

export default {};
