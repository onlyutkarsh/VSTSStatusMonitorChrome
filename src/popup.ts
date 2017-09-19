import * as moment from "moment";
import * as $ from "jquery";
import { VSTSResponse } from "./vsts";
import * as constants  from "./constants";

$(function () {

    let waiting: VSTSResponse = {
        status: "",
        message: "...Please wait!",
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        success: true,
        title: "Fetching status"
    };
    // try to get the vsts status from storage - this is necessary not to poll for duration
    // if there is already status in the storage (the status is stored each poll on timer)
    // **TODO: Allow the user to configure the polling time.**
    chrome.storage.sync.get({
        vstsStatus: waiting
    }, function (cache: { vstsStatus }) {
        console.log("Cached-VSTS-Status", cache.vstsStatus);
        updateMarkup(cache.vstsStatus);
    });

    $("#optionsLink").click(() => {
        if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
        } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL("options.html"));
        }
    });

    chrome.runtime.onConnect.addListener(function (port) {
        port.onMessage.addListener(function (vstsResponse: VSTSResponse) {
            updateMarkup(vstsResponse);
        });
    });

    $("body").on("click", "a#link", function () {
        chrome.tabs.create({ url: $(this).attr("href") });
        return false;
    });

    function updateMarkup(vstsResponse: VSTSResponse) {
        console.log("Received status in popup", vstsResponse);

        let status = vstsResponse.status.toLowerCase();
        switch (status) {
            case "available":
                {
                    $("#status").removeClass().addClass("success");
                    $("#status").html(`<i class="utk-check-circle" id="icon"></i> ${vstsResponse.title} - ${vstsResponse.message}`);
                    chrome.browserAction.setIcon({
                        path: "icons/vsts-green-16x16.png"
                    });
                    break;
                }
            case "maintenance":
                {
                    $("#status").removeClass().addClass("error");
                    $("#status").html(`<i class="utk-exclamation-circle" id="icon"></i> ${vstsResponse.title} - ${vstsResponse.message}`);
                    chrome.browserAction.setIcon({
                        path: "icons/vsts-red-16x16.png"
                    });
                    break;
                }
            default:
                {
                    $("#status").removeClass().addClass("error");
                    $("#status").html(`<i class="utk-exclamation-circle" id="icon"></i> ${vstsResponse.title} - ${vstsResponse.message}`);
                    chrome.browserAction.setIcon({
                        path: "icons/vsts-red-16x16.png"
                    });
                    break;
                }
        }
        let lastcheck = vstsResponse.timestamp;
        let nextCheck = moment(lastcheck, constants.LAST_CHECK_TIME_FORMAT).add(constants.POLL_TIME_IN_MINUTES, "m");
        $("#lastcheck").text(`Last update: ${lastcheck}`).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
        let nextCheckTime = moment(nextCheck, constants.LAST_CHECK_TIME_FORMAT).format(constants.NEXT_CHECK_TIME_FORMAT);
        $("#nextcheck").text(`Next update: ${nextCheckTime}`);
    }
});

