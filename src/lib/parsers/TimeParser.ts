import Time from "../interfaces/Time";

export default function ParseTime(rawTime: Time): Time {
    return {
        hour: rawTime.hour || 0,
        minute: rawTime.minute || 0,
        second: rawTime.second || 0,
        millisecond: rawTime.millisecond || 0
    };
}