import { HTML_EVENT, HTML_TAG_NAME, HTML_ATTRIBUTE, NAME } from './consts.js'

export default class Dialog {
    constructor(tag) {
        this.tag = tag;
        this.disabledTags = [];

        this.tagCloseButtons = Array.from(this.tag.getElementsByTagName(HTML_TAG_NAME.BUTTON)).filter((value) => value.name === NAME.CLOSE
        );
        this._addCloseEventListenerToButtons(this.tagCloseButtons);

        this.tag.addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            this.close();
        });

        this.tag.children[0].addEventListener(HTML_EVENT.ON_CLICK, (event) => {
            event.stopPropagation();
        });
    }

    open() {
        document.activeElement.blur();
        this._disableBackground();
        this.tag.hidden = false;
    }

    close() {
        this.tag.hidden = true;
        this._enableDisabledTabIndex();
    }

    _addCloseEventListenerToButtons(buttons) {
        for (let button of buttons) {
            button.addEventListener(HTML_EVENT.ON_CLICK, () => {
                this.close();
            });
        }
    }

    _disableBackground() {
        this._disableAllTabIndex();
        this._enableChildrenTabIndex(this.tag);
    }

    _disableAllTabIndex() {
        const tags = Array.from(document.getElementsByTagName(HTML_TAG_NAME.A))
            .concat(Array.from(document.getElementsByTagName(HTML_TAG_NAME.BUTTON)));
        for (let i in tags) {
            let tabIndex = 0;
            if (tags[i].hasAttribute(HTML_ATTRIBUTE.TAB_INDEX)) {
                tabIndex = tags[i].getAttribute(HTML_ATTRIBUTE.TAB_INDEX);
            }
            this.disabledTags.push({
                tag: tags[i],
                tabIndex: tabIndex,
            });
            tags[i].setAttribute(HTML_ATTRIBUTE.TAB_INDEX, '-1');
        }
    }

    _enableChildrenTabIndex(parent) {
        for (let tag of parent.children) {
            if (tag.tagName === HTML_TAG_NAME.BUTTON) {
                tag.setAttribute(HTML_ATTRIBUTE.TAB_INDEX, 0);
            }
            this._enableChildrenTabIndex(tag);
        }
    }

    _enableDisabledTabIndex() {
        for (let i in this.disabledTags) {
            this.disabledTags[i].tag.setAttribute(HTML_ATTRIBUTE.TAB_INDEX, this.disabledTags[i].tabIndex);
        }
        this.disabledTags = [];
    }
}
