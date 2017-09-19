import * as moment from "moment";
import * as $ from "jquery";
import { OPTION_SAVED_TEXT } from "./constants";

// Saves options to chrome.storage.sync.
function saveOptions() {
    console.log("Saving options");
    let notifyOnStatusChange = $("#notifyOnStatusChange").prop("checked");
    let notifyOnEveryPoll = $("#notifyOnEveryPoll").prop("checked");
    chrome.storage.sync.set({
        notifyOnStatusChange: notifyOnStatusChange,
        notifyOnEveryPoll: notifyOnEveryPoll
    }, function () {
        // Update status to let user know options were saved.
        let status = $("#status");
        status.text(OPTION_SAVED_TEXT).fadeIn();
        setTimeout(function () {
            status.fadeOut("slow");
        }, 1000);
        console.log("Saved");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    console.log("Restoring options");
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        notifyOnStatusChange: true,
        notifyOnEveryPoll: false
    }, function (items: { notifyOnStatusChange, notifyOnEveryPoll }) {
        console.log("Cached items", items);
        $("#notifyOnStatusChange").prop("checked", items.notifyOnStatusChange);
        $("#notifyOnEveryPoll").prop("checked", items.notifyOnEveryPoll);
    });
    console.log("Restored options");
}
$("#save").click(saveOptions);
$("#close").click(() => window.close());
$(restoreOptions); // document.addEventListener('DOMContentLoaded', restore_options);


