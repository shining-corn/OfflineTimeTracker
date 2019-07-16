"use strict";

import { enumeration, TYPE, KEY, CLASS_NAME, TAG_ID, HTML_TAG_NAME, HTML_ATTRIBUTE, HTML_ATTRIBUTE_VALUE, HTML_EVENT, APP_EVENT, TEXT, ATTRIBUTE, NAME } from './consts.js';
import Observable from './observable.js';
import Dialog from './dialog.js';

function formatHHMMSS(date) {
    let hours = `${date.getHours()}`;
    let minutes = `${date.getMinutes()}`;
    let seconds = `${date.getSeconds()}`;

    if (hours.length == 1) {
        hours = ` ${hours}`;
    }
    if (minutes.length == 1) {
        minutes = `0${minutes}`;
    }
    if (seconds.length == 1) {
        seconds = `0${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
}

class Activity {
    constructor(name) {
        this.name = name;
        this.id = 'x-' + name;
    }
}

class ActivityContainer {
    constructor(observable) {
        this.observable = observable;
        this.activities = this._restoreActivities();
        this.observable.on(APP_EVENT.ADD_ACTIVITY, (activity) => {
            this._enableAllActivityButton();

            if (this.activities.hasOwnProperty(activity.id)) {
                let tag = document.getElementById(activity.id);
                tag.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE.DISABLED);
            }
            else {
                this.activities[activity.id] = activity;

                this._addActivityButton(activity);
            }

            this._saveActivities();
        });

        this.observable.on(APP_EVENT.STOP_TIME_TRACKER, (activity) => {
            this._enableAllActivityButton();
        });

        this.observable.on(APP_EVENT.GET_ACTIVITIES, (callback) => {
            callback(this.activities);
        });

        this.observable.on(APP_EVENT.REMOVE_ACTIVITY, (removeActivities) => {
            const tag = document.getElementById(TAG_ID.ACTIVITY_ITEMS);
            for (const activity of removeActivities) {
                delete this.activities[activity];
                tag.removeChild(document.getElementById(activity));
            }

            if (Object.keys(this.activities).length == 0) {
                this.observable.trigger(APP_EVENT.NO_ACTIVITIES);
            }

            this._saveActivities();
        });
    }

    _enableAllActivityButton() {
        let tags = document.getElementById(TAG_ID.ACTIVITY_ITEMS).getElementsByTagName(HTML_TAG_NAME.BUTTON);
        for (let tag of tags) {
            tag.removeAttribute(HTML_ATTRIBUTE.DISABLED);
        }
    }

    _addActivityButton(activity) {
        let tag = document.createElement(HTML_TAG_NAME.BUTTON);
        tag.className = CLASS_NAME.BUTTON_ACTIVITY;
        tag.id = activity.id;
        tag.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE.DISABLED);
        tag.setAttribute(HTML_ATTRIBUTE.TITLE, activity.name);
        tag.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            event.preventDefault();

            this._enableAllActivityButton();
            tag.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE.DISABLED);
            this.observable.trigger(APP_EVENT.START_TIME_TRACKER, activity);
        });
        tag.innerText = activity.name;

        document.getElementById(TAG_ID.ACTIVITY_ITEMS).insertBefore(tag, null);
    }

    _restoreActivities() {
        const strActivities = localStorage.activities;
        if (strActivities) {
            const activities = JSON.parse(strActivities);
            if (activities) {
                for (const key in activities) {
                    this._addActivityButton(activities[key]);
                }
                this._enableAllActivityButton();

                return activities;
            }
        }

        return {};
    }

    _saveActivities() {
        const strActivities = JSON.stringify(this.activities);
        localStorage.activities = strActivities;
    }
}

class TimeTracker {
    constructor(observable) {
        this.observable = observable;
        this.tagLatestLine = undefined;
        this.tagTimeline = document.getElementById(TAG_ID.TIMELINE);

        this.observable.on(APP_EVENT.START_TIME_TRACKER, (activity) => {
            if (typeof this.tagLatestLine !== TYPE.UNDEFINED) {
                if (this.tagLatestLine.getAttribute(ATTRIBUTE.NAME) !== activity.name) {
                    this._stopTimeTracker(activity);;
                } else {
                    return;
                }
            }

            /*
              <tr class="timeline-row">
                <td><div class="timeline-row-activity-name">{activity.name}</div></td>
                <td><div class="timeline-row-time">{timeStart}</div></td>
              </tr>
            */
            const date = new Date();
            date.setMilliseconds(0);
            let tagRow = document.createElement(HTML_TAG_NAME.TR);
            this.tagLatestLine = tagRow;
            tagRow.setAttribute(ATTRIBUTE.NAME, activity.name);
            tagRow.setAttribute(ATTRIBUTE.START, '' + date.getTime());

            let tagRowName = document.createElement(HTML_TAG_NAME.TD);
            tagRow.insertBefore(tagRowName, null);

            let tagRowNameDiv = document.createElement(HTML_TAG_NAME.DIV);
            tagRowNameDiv.classList.add(CLASS_NAME.ACTIVITY_NAME);
            tagRowNameDiv.classList.add(CLASS_NAME.THIN);
            tagRowNameDiv.innerText = activity.name;
            tagRowName.insertBefore(tagRowNameDiv, null);

            let tagRowStart = document.createElement(HTML_TAG_NAME.TD);
            tagRow.insertBefore(tagRowStart, null);

            let tagRowStartDiv = document.createElement(HTML_TAG_NAME.DIV);
            tagRowStartDiv.className = CLASS_NAME.TIMELINE_ROW_TIME;
            tagRowStartDiv.innerText = formatHHMMSS(date);
            tagRowStart.insertBefore(tagRowStartDiv, null);

            this.tagTimeline.insertBefore(tagRow, null);

            this._scroll();
        });

        this.observable.on(APP_EVENT.STOP_TIME_TRACKER, (activity) => {
            this._stopTimeTracker(activity);
        });

        this.observable.on(HTML_EVENT.ON_RESIZE, () => this.setPaddingToTimeline());
        this.observable.on(APP_EVENT.ADD_ACTIVITY, () => this.setPaddingToTimeline());
    }

    setPaddingToTimeline() {
        const tagHeader = document.getElementById(TAG_ID.HEADER);
        const tagFooter = document.getElementById(TAG_ID.FOOTER);
        const tag = document.getElementById('timeline-container');
        tag.style.padding = `${tagHeader.clientHeight}px 2rem ${tagFooter.clientHeight}px 2rem`;
    }

    _stopTimeTracker(activity) {
        if (typeof this.tagLatestLine === TYPE.UNDEFINED) {
            return;
        }

        this.observable.trigger(APP_EVENT.ENABLE_STATISTICS_BUTTON);

        const date = new Date();
        date.setMilliseconds(0);

        this.tagLatestLine.setAttribute(ATTRIBUTE.END, '' + date.getTime());

        /*
          <tr class="timeline-row">
            ...
            <td><div class="timeline-row-time">{timeEnd}</div></td>
            <td><button class="button-function"><div class="button-edit">&#x270F;</div></button></td>
          </tr>
        */
        let tagRowEnd = document.createElement(HTML_TAG_NAME.TD);
        this.tagLatestLine.insertBefore(tagRowEnd, null);

        let tagRowEndDiv = document.createElement(HTML_TAG_NAME.DIV);
        tagRowEndDiv.className = CLASS_NAME.TIMELINE_ROW_TIME;
        tagRowEndDiv.innerText = formatHHMMSS(date);
        tagRowEnd.insertBefore(tagRowEndDiv, null);

        let tagRowEdit = document.createElement(HTML_TAG_NAME.TD);

        let tagRowEditButton = document.createElement(HTML_TAG_NAME.BUTTON);
        tagRowEditButton.classList.add(CLASS_NAME.BUTTON_CIRCLE);
        tagRowEditButton.classList.add(CLASS_NAME.SMALL);
        ((tagRow) => {
            tagRowEditButton.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
                event.preventDefault();
                this.observable.trigger(APP_EVENT.OPEN_EDIT_TIMELINE_DIALOG, tagRow);
            });
        })(this.tagLatestLine);
        tagRowEdit.insertBefore(tagRowEditButton, null);

        let tagRowEditSymbol = document.createElement(HTML_TAG_NAME.DIV);
        tagRowEditSymbol.className = CLASS_NAME.BUTTON_EDIT;
        tagRowEditSymbol.innerHTML = TEXT.EDIT_SYMBOL;
        tagRowEditButton.insertBefore(tagRowEditSymbol, null);

        this.tagLatestLine.insertBefore(tagRowEdit, null);
        this.tagLatestLine = undefined;
    }

    _scroll() {
        window.scrollTo(0, document.body.clientHeight);
    }
}

class EditTimelineDialog {
    constructor(observable) {
        this.tag = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG);
        this.dialog = new Dialog(this.tag);
        this.observable = observable;
        this.startYear = TYPE.UNDEFINED;
        this.startMonth = TYPE.UNDEFINED;
        this.startDate = TYPE.UNDEFINED;
        this.endYear = TYPE.UNDEFINED;
        this.endMonth = TYPE.UNDEFINED;
        this.endDate = TYPE.UNDEFINED;

        this.tag = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG);
        this.tagRow = TYPE.UNDEFINED;
        this.tagApply = document.getElementById(TAG_ID.APPLY_EDIT_TIMELINE_DIALOG);
        this.tagActivityName = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_ACTIVITY_NAME);

        this.tagStartHours = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_START_HOUR);
        this.tagStartMinutes = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_START_MINUTES);
        this.tagStartSeconds = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_START_SECONDS);
        this.tagEndHours = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_END_HOUR);
        this.tagEndMinutes = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_END_MINUTES);
        this.tagEndSeconds = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_END_SECONDS);

        this.tagIncreaseStart = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_INCREASE_START);
        this.tagDecreaseStart = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_DECREASE_START);
        this.tagIncreaseEnd = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_INCREASE_END);
        this.tagDecreaseEnd = document.getElementById(TAG_ID.EDIT_TIMELINE_DIALOG_DECREASE_END);

        this.observable.on(APP_EVENT.OPEN_EDIT_TIMELINE_DIALOG, (tagRow) => {
            this.tagRow = tagRow;
            this._showDialog(tagRow);
            this.tagActivityName.focus();
        });

        this.tagActivityName.addEventListener(HTML_EVENT.ON_KEYDOWN, (event) => {
            if (event.key === KEY.ENTER) {
                this.tagApply.click();
            }
        });

        this.tagActivityName.addEventListener(HTML_EVENT.ON_CHANGE, this._getOnChangeActivityNameEventHandler());
        this.tagActivityName.addEventListener(HTML_EVENT.ON_INPUT, this._getOnChangeActivityNameEventHandler());
        this.tagActivityName.addEventListener(HTML_EVENT.ON_KEYUP, this._getOnChangeActivityNameEventHandler());

        this.tagApply.addEventListener(HTML_EVENT.ON_CLICK, () => {
            const timeline = this._getEditValues();
            this._updateTimeline(timeline);
            this.dialog.close();
        });

        this.tagIncreaseStart.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            let timeline = this._getEditValues();
            timeline.start = new Date(((timeline.start.getTime() / 300000 | 0) + 1) * 300000);
            this._setEditValues(timeline);
        });

        this.tagDecreaseStart.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            let timeline = this._getEditValues();
            timeline.start = new Date((((timeline.start.getTime() + 299999) / 300000 | 0) - 1) * 300000);
            this._setEditValues(timeline);
        });

        this.tagIncreaseEnd.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            let timeline = this._getEditValues();
            timeline.end = new Date(((timeline.end.getTime() / 300000 | 0) + 1) * 300000);
            this._setEditValues(timeline);
        });

        this.tagDecreaseEnd.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            let timeline = this._getEditValues();
            timeline.end = new Date((((timeline.end.getTime() + 299999) / 300000 | 0) - 1) * 300000);
            this._setEditValues(timeline);
        });
    }

    _showDialog(tagRow) {
        this.tagActivityName.value = tagRow.getAttribute(ATTRIBUTE.NAME);

        const start = new Date(parseInt(tagRow.getAttribute(ATTRIBUTE.START)));
        const startHours = start.getHours();
        const startMinutes = start.getMinutes();
        const startSeconds = start.getSeconds();

        const end = new Date(parseInt(tagRow.getAttribute(ATTRIBUTE.END)));
        const endHours = end.getHours();
        const endMinutes = end.getMinutes();
        const endSeconds = end.getSeconds();

        this.startYear = start.getFullYear();
        this.startMonth = start.getMonth();
        this.startDate = start.getDate();
        this.tagStartHours.selectedIndex = startHours;
        this.tagStartMinutes.selectedIndex = startMinutes;
        this.tagStartSeconds.selectedIndex = startSeconds;

        this.endYear = end.getFullYear();
        this.endMonth = end.getMonth();
        this.endDate = end.getDate();
        this.tagEndHours.selectedIndex = endHours;
        this.tagEndMinutes.selectedIndex = endMinutes;
        this.tagEndSeconds.selectedIndex = endSeconds;

        this.dialog.open();
    }

    _getEditValues() {
        const name = this.tagActivityName.value;

        const startHours = this.tagStartHours.selectedIndex;
        const startMinutes = this.tagStartMinutes.selectedIndex;
        const startSeconds = this.tagStartSeconds.selectedIndex;
        const start = new Date(parseInt(this.startYear),
            parseInt(this.startMonth),
            parseInt(this.startDate),
            startHours,
            startMinutes,
            startSeconds);

        const endHours = this.tagEndHours.selectedIndex;
        const endMinutes = this.tagEndMinutes.selectedIndex;
        const endSeconds = this.tagEndSeconds.selectedIndex;
        const end = new Date(parseInt(this.endYear),
            parseInt(this.endMonth),
            parseInt(this.endDate),
            endHours,
            endMinutes,
            endSeconds);

        return {
            name: name,
            start: start,
            end: end,
        };
    }

    _setEditValues(timeline) {
        this.tagActivityName.value = timeline.name;
        this.tagStartHours.selectedIndex = timeline.start.getHours();
        this.tagStartMinutes.selectedIndex = timeline.start.getMinutes();
        this.tagStartSeconds.selectedIndex = timeline.start.getSeconds();
        this.tagEndHours.selectedIndex = timeline.end.getHours();
        this.tagEndMinutes.selectedIndex = timeline.end.getMinutes();
        this.tagEndSeconds.selectedIndex = timeline.end.getSeconds();
    }

    _updateTimeline(timeline) {
        this.tagRow.setAttribute(ATTRIBUTE.NAME, timeline.name);
        this.tagRow.setAttribute(ATTRIBUTE.START, timeline.start.getTime());
        this.tagRow.setAttribute(ATTRIBUTE.END, timeline.end.getTime());

        this.tagRow.children[0].children[0].innerText = timeline.name;
        this.tagRow.children[1].children[0].innerText = formatHHMMSS(timeline.start);
        this.tagRow.children[2].children[0].innerText = formatHHMMSS(timeline.end);
    }

    _getOnChangeActivityNameEventHandler() {
        return (event) => {
            if (event.target.value.length) {
                this.tagApply.removeAttribute(HTML_ATTRIBUTE.DISABLED);
            }
            else {
                this.tagApply.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE_VALUE.DISABLED);
            }
        }
    }
}

class AddActivityButton {
    constructor(observable) {
        this.observable = observable;

        const tag = document.getElementById(TAG_ID.ADD_ACTIVITY);
        tag.addEventListener(HTML_EVENT.ON_CLICK, () => {
            this.observable.trigger(APP_EVENT.OPEN_ADD_ACTIVITY_DIALOG);
        });
    }
}

class StopTimeTrackerButton {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.STOP_TIME_TRACKER);

        this.tag.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            this.tag.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE.DISABLED);
            this.observable.trigger(APP_EVENT.STOP_TIME_TRACKER);
        });

        this.observable.on(APP_EVENT.START_TIME_TRACKER, () => {
            this.tag.removeAttribute(HTML_ATTRIBUTE.DISABLED);
        });
    }
}

class AddActivityNameInput {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.ADD_ACTIVITY_NAME);

        this.tag.addEventListener(HTML_EVENT.ON_CHANGE, this._getEventHandler());
        this.tag.addEventListener(HTML_EVENT.ON_INPUT, this._getEventHandler());
        this.tag.addEventListener(HTML_EVENT.ON_KEYUP, this._getEventHandler());

        this.tag.addEventListener(HTML_EVENT.ON_KEYDOWN, (event) => {
            if (event.key === KEY.ENTER) {
                document.getElementById(TAG_ID.ADD_AND_START).click();
            }
        });
    }

    init() {
        this.tag.value = '';
        this.observable.trigger(APP_EVENT.DISABLE_ADD_AND_START_BUTTON);
    }

    getValue() {
        return this.tag.value;
    }

    focus() {
        this.tag.focus();
    }

    _getEventHandler() {
        return (event) => {
            if (event.target.value.length) {
                this.observable.trigger(APP_EVENT.ENABLE_ADD_AND_START_BUTTON);
            }
            else {
                this.observable.trigger(APP_EVENT.DISABLE_ADD_AND_START_BUTTON);
            }
        }
    }
}

class AddAndStartButton {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.ADD_AND_START);

        this.observable.on(APP_EVENT.ENABLE_ADD_AND_START_BUTTON, () => {
            document.getElementById(TAG_ID.ADD_AND_START).removeAttribute(HTML_ATTRIBUTE.DISABLED);
        });

        this.observable.on(APP_EVENT.DISABLE_ADD_AND_START_BUTTON, () => {
            document.getElementById(TAG_ID.ADD_AND_START).setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE.DISABLED);

        });

        this.tag.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            this.observable.trigger(APP_EVENT.ON_ADD_AND_START_BUTTON);
        });
    }
}

class AddActivityDialog {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.ADD_ACTIVITY_DIALOG);
        this.dialog = new Dialog(this.tag);
        this.tagActivityDialog = document.getElementById(TAG_ID.ADD_ACTIVITY_DIALOG);
        this.addActivityNameInput = new AddActivityNameInput(observable);
        this.addAndStartButton = new AddAndStartButton(observable);

        observable.on(APP_EVENT.OPEN_ADD_ACTIVITY_DIALOG, () => {
            this.addActivityNameInput.init();
            this.dialog.open();
            this.addActivityNameInput.focus();
        });

        observable.on(APP_EVENT.ON_ADD_AND_START_BUTTON, () => {
            const activityName = this.addActivityNameInput.getValue();
            if (activityName) {
                const activity = new Activity(activityName);
                this.observable.trigger(APP_EVENT.ADD_ACTIVITY, activity);
                this.observable.trigger(APP_EVENT.START_TIME_TRACKER, activity);
            }

            this.dialog.close();
        });
    }
}

class OpenRemoveActivitiesDialogButton {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.REMOVE_ACTIVITIES);

        this.tag.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            this.observable.trigger(APP_EVENT.OPEN_REMOVE_ACTIVITIES_DIALOG);
        });

        this.observable.on(APP_EVENT.ADD_ACTIVITY, () => {
            this.tag.removeAttribute(HTML_ATTRIBUTE.DISABLED);
        });

        this.observable.on(APP_EVENT.NO_ACTIVITIES, () => {
            this.tag.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE_VALUE.DISABLED);
        });

        this.observable.on(APP_EVENT.ENABLE_REMOVE_ACTIVITY_BUTTON, () => {
            this.tag.removeAttribute(HTML_ATTRIBUTE.DISABLED);
        });
    }
}

class RemoveActivitiesDialog {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.REMOVE_ACTIVITIES_DIALOG);
        this.dialog = new Dialog(this.tag);
        this.tagActivitiesList = document.getElementById(TAG_ID.REMOVE_ACTIVITIES_DIALOG_LIST);
        this.tagRemoveButton = document.getElementById(TAG_ID.REMOVE_ACTIVITIES_DIALOG_APPLY);

        this.observable.on(APP_EVENT.OPEN_REMOVE_ACTIVITIES_DIALOG, () => {
            this._getActivities();

            const inputs = this.tagActivitiesList.getElementsByTagName(HTML_TAG_NAME.INPUT);
            for (const input of inputs) {
                input.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
                    const label = event.target.parentElement;
                    if (event.target.checked) {
                        label.children[1].classList.add(CLASS_NAME.TO_REMOVE_ACTIVITY);
                    }
                    else {
                        label.children[1].classList.remove(CLASS_NAME.TO_REMOVE_ACTIVITY);
                    }

                    const list = this._getCheckedActivities();
                    if (list.length) {
                        this.tagRemoveButton.removeAttribute(HTML_ATTRIBUTE.DISABLED);
                    }
                    else {
                        this.tagRemoveButton.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE_VALUE.DISABLED);
                    }
                });
            }

            this.tagRemoveButton.setAttribute(HTML_ATTRIBUTE.DISABLED, HTML_ATTRIBUTE_VALUE.DISABLED);
            this.dialog.open();
        });

        this.tagRemoveButton.addEventListener(HTML_EVENT.ON_CLICK, () => {
            let list = this._getCheckedActivities();
            this.observable.trigger(APP_EVENT.REMOVE_ACTIVITY, list);
            this.dialog.close();
        });
    }

    _getActivities() {
        this.observable.trigger(APP_EVENT.GET_ACTIVITIES, (activities) => {
            this.tagActivitiesList.innerHTML = '';
            for (const key in activities) {
                const id = `check-${activities[key].id}`;

                const label = document.createElement(HTML_TAG_NAME.LABEL);
                label.classList.add(CLASS_NAME.REMOVE_ACTIVITIES_DIALOG_ROW);
                label.setAttribute(HTML_ATTRIBUTE.FOR, id);
                label.setAttribute(ATTRIBUTE.ACTIVITY_ID, `${activities[key].id}`);

                const checkbox = document.createElement(HTML_TAG_NAME.INPUT);
                checkbox.id = id;
                checkbox.type = HTML_ATTRIBUTE_VALUE.CHECKBOX;
                label.insertBefore(checkbox, null);

                const activityName = document.createElement(HTML_TAG_NAME.DIV);
                activityName.innerText = activities[key].name;
                activityName.classList.add(CLASS_NAME.ACTIVITY_NAME);
                activityName.classList.add(CLASS_NAME.FULL_WIDTH);
                label.insertBefore(activityName, null);

                this.tagActivitiesList.insertBefore(label, null);
            }
        });
    }

    _getCheckedActivities() {
        const tags = this.tagActivitiesList.children;
        let list = [];
        for (const tag of tags) {
            if (tag.children[0].checked) {
                list.push(tag.getAttribute(ATTRIBUTE.ACTIVITY_ID));
            }
        }
        return list;
    }
}

class OpenStatisticsButton {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.OPEN_STATISTICS_DIALOG);

        this.tag.addEventListener(HTML_EVENT.ON_CLICK, () => {
            this.observable.trigger(APP_EVENT.OPEN_STATISTICS_DIALOG);
        })

        this.observable.on(APP_EVENT.ENABLE_STATISTICS_BUTTON, () => {
            this.tag.removeAttribute(HTML_ATTRIBUTE.DISABLED);
        });
    }
}

class StatisticsDialog {
    constructor(observable) {
        this.observable = observable;
        this.tag = document.getElementById(TAG_ID.STATISTICS_DIALOG);
        this.dialog = new Dialog(this.tag);

        observable.on(APP_EVENT.OPEN_STATISTICS_DIALOG, () => {
            this._showDialog();
        });
    }

    _showDialog() {
        let statistics = {};

        this.dialog.open();

        const tags = document.getElementById(TAG_ID.TIMELINE).children;
        for (let tag of tags) {
            const name = tag.getAttribute(ATTRIBUTE.NAME);
            if (typeof statistics[name] === TYPE.UNDEFINED) {
                statistics[name] = 0;
            }

            const start = tag.getAttribute(ATTRIBUTE.START);
            const end = tag.getAttribute(ATTRIBUTE.END);
            if (end) {
                statistics[name] += end - start;
            }

            /*
              <tr class="timeline-row">
                <td class="timeline-row-activity-name">{activity.name}</td>
                <td class="timeline-row-time">{time}</td>
              </tr>
            */
            document.getElementById(TAG_ID.STATISTICS_OUTPUT).innerText = '';
            for (let key in statistics) {
                const time = Math.floor(statistics[key] / 1000);
                if (time == 0) {
                    continue;
                }

                const hours = Math.floor(time / 3600);
                const minutes = Math.floor((time % 3600) / 60);
                const seconds = time % 60;
                const date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);

                const tagRow = document.createElement(HTML_TAG_NAME.TR);

                const tagRowNameDiv = document.createElement(HTML_TAG_NAME.DIV);
                tagRowNameDiv.classList.add(CLASS_NAME.ACTIVITY_NAME);
                tagRowNameDiv.classList.add(CLASS_NAME.THICK);
                tagRowNameDiv.innerText = key;

                const tagRowName = document.createElement(HTML_TAG_NAME.TD);
                tagRowName.insertBefore(tagRowNameDiv, null);

                const tagRowTimeDiv = document.createElement(HTML_TAG_NAME.DIV);
                tagRowTimeDiv.className = CLASS_NAME.TIMELINE_ROW_TIME;
                tagRowTimeDiv.innerText = formatHHMMSS(date);

                const tagRowTime = document.createElement(HTML_TAG_NAME.TD);
                tagRowTime.insertBefore(tagRowTimeDiv, null);

                tagRow.insertBefore(tagRowName, null);
                tagRow.insertBefore(tagRowTime, null);

                document.getElementById(TAG_ID.STATISTICS_OUTPUT).insertBefore(tagRow, null);
            }
        }
    }
}

(function () {
    const observable = new Observable();
    const activityContainer = new ActivityContainer(observable);
    const timeTracker = new TimeTracker(observable);
    const addActivityButton = new AddActivityButton(observable);
    const addActivityDialog = new AddActivityDialog(observable);
    const openRemoveActivitiesDialogButton = new OpenRemoveActivitiesDialogButton(observable);
    const removeActivityDialog = new RemoveActivitiesDialog(observable);
    const editTimelineDialog = new EditTimelineDialog(observable);
    const stopTimeTrackerButton = new StopTimeTrackerButton(observable);
    const openStatisticsButton = new OpenStatisticsButton(observable);
    const statisticsDialog = new StatisticsDialog(observable);
})();
