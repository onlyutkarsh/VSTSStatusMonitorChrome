import * as moment from "moment";
import * as request from "superagent";
import * as constants from "./constants";

export class VSTSResponse {
    status: string;
    message: string;
    title: string;
    timestamp: string;
    success: boolean;
}

export class VSTSService {

    static checkVSTSStatus(): VSTSResponse {
        console.log("Checking VSTS Status...");
        // await delay();
        let vstsResponse: VSTSResponse = new VSTSResponse();
        request
            .get("https://www.visualstudio.com/wp-json/vscom/v1/service-status")
            .set("Accept", "application/json")
            .timeout({
                response: 15000,  // Wait 15 seconds for the server to start sending,
                deadline: 30000, // but allow 30 seconds for the file to finish loading.
            })
            .end(function (error, response) {
                let port = chrome.runtime.connect({ name: "vsts-status" });
                let toolbarIcon = "icons/vsts-red-16x16.png";
                let notificationIcon = "icons/vsts-red-48x48.png";

                console.log("Response from VSTS", response);
                if (error || !response.ok) {
                    console.error("Error fetching VSTS Status", error);
                    vstsResponse.status = "error";
                    vstsResponse.message = "Please check your network connection";
                    vstsResponse.title = "Unable to check VSTS status";
                    vstsResponse.timestamp = moment().format(constants.LAST_CHECK_TIME_FORMAT);
                    toolbarIcon = "icons/vsts-red-16x16.png";
                }
                else {
                    if (response.body) {
                        let status = response.body.status.toLowerCase();
                        vstsResponse.message = response.body.message;
                        vstsResponse.status = response.body.status;
                        vstsResponse.title = response.body.title;
                        vstsResponse.timestamp = moment().format(constants.LAST_CHECK_TIME_FORMAT);
                        switch (status) {
                            case "available":
                                {
                                    toolbarIcon = "icons/vsts-green-16x16.png";
                                    notificationIcon = "icons/vsts-green-48x48.png";
                                    vstsResponse.success = true;
                                    break;
                                }
                            case "maintenance":
                                {
                                    toolbarIcon = "icons/vsts-red-16x16.png";
                                    notificationIcon = "icons/vsts-red-48x48.png";
                                    break;
                                }
                            default:
                                {
                                    toolbarIcon = "icons/vsts-red-16x16.png";
                                    break;
                                }

                        }
                    }
                    else {
                        console.log("Error parsing VSTS Status", error);
                        vstsResponse.status = "error";
                        vstsResponse.message = "Please let the developer know by raising an issue.";
                        vstsResponse.title = "Unable to parse VSTS status";
                        vstsResponse.timestamp = moment().format(constants.LAST_CHECK_TIME_FORMAT);
                        toolbarIcon = "icons/vsts-red-16x16.png";
                        notificationIcon = "icons/vsts-red-48x48.png";
                    }
                }
                chrome.browserAction.setIcon({
                    path: toolbarIcon
                });

                VSTSService.notifyIfNecessary(vstsResponse, notificationIcon);

                port.postMessage(vstsResponse);
                console.log("Sent signal from VSTS to popup");
                return vstsResponse;
            });
        return null;
    }

    private static notifyIfNecessary(vstsResponse: VSTSResponse, notificationIcon: string) {
        let waiting: VSTSResponse = {
            status: "",
            message: "...Please wait!",
            timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
            success: true,
            title: "Fetching status"
        };
        chrome.storage.sync.get({ notifyOnStatusChange: true, notifyOnEveryPoll: false }, function (options: { notifyOnStatusChange: boolean, notifyOnEveryPoll: boolean }) {
            console.log("NotificationCheck", options);
            if (options.notifyOnEveryPoll) {
                console.log("Notify on every poll");
                chrome.storage.sync.get({
                    vstsStatus: waiting
                }, function (cache: { vstsStatus }) {
                    let cacheStatus: VSTSResponse = cache.vstsStatus;
                    console.log("cacheStatus", cacheStatus);
                    console.log("vstsResponse", vstsResponse);

                    let nextCheck = moment(vstsResponse.timestamp, constants.LAST_CHECK_TIME_FORMAT).add(constants.POLL_TIME_IN_MINUTES, "m").format(constants.NEXT_CHECK_TIME_FORMAT);
                    chrome.notifications.create("vsts-status-monitor-notifyOnEveryPoll", {
                        type: "basic",
                        iconUrl: notificationIcon,
                        title: vstsResponse.title,
                        message: vstsResponse.message,
                        contextMessage: `Next update: ${nextCheck}`
                    });
                    console.log("Update the cache", vstsResponse);
                    // store the status in the storage so that we do not poll till next interval
                    chrome.storage.sync.set({
                        vstsStatus: vstsResponse
                    }, function () {
                        // Update status to let user know options were saved.
                    });
                });
            }
            else if (options.notifyOnStatusChange) {
                console.log("Notify on status change");
                chrome.storage.sync.get({
                    vstsStatus: waiting
                }, function (cache: { vstsStatus }) {
                    let cacheStatus: VSTSResponse = cache.vstsStatus;
                    console.log("cacheStatus", cacheStatus);
                    console.log("vstsResponse", vstsResponse);
                    if (cacheStatus.status.toLowerCase() !== vstsResponse.status.toLowerCase()) {
                        console.log("Status has changed...Notify");
                        let nextCheck = moment(vstsResponse.timestamp, constants.LAST_CHECK_TIME_FORMAT).add(constants.POLL_TIME_IN_MINUTES, "m").format(constants.NEXT_CHECK_TIME_FORMAT);
                        chrome.notifications.create("vsts-status-monitor-notifyOnStatusChange", {
                            type: "basic",
                            iconUrl: notificationIcon,
                            title: vstsResponse.title,
                            message: vstsResponse.message,
                            contextMessage: `Next update: ${nextCheck}`
                        });
                    }
                    console.log("Update the cache", vstsResponse);
                    // store the status in the storage so that we do not poll till next interval
                    chrome.storage.sync.set({
                        vstsStatus: vstsResponse
                    }, function () {
                        // Update status to let user know options were saved.
                    });
                });
            }
            else {
                console.log("Notifications are disabled..So just update the cache", vstsResponse);
                // store the status in the storage so that we do not poll till next interval
                chrome.storage.sync.set({
                    vstsStatus: vstsResponse
                }, function () {
                    // Update status to let user know options were saved.
                });
            }
        });
    }
}

