import * as $ from "jquery";
import { VSTSResponse, VSTSService  } from "./vsts";
import * as moment from "moment";
import { POLL_TIME_IN_MINUTES } from "./constants";

export function startPollingForVSTSStatus() {
    console.log("Start polling for VSTS Status");
    VSTSService.checkVSTSStatus();
    setTimeout(startPollingForVSTSStatus, moment.duration(POLL_TIME_IN_MINUTES, "m").asMilliseconds());
}
console.log("Starting background thread");

startPollingForVSTSStatus();