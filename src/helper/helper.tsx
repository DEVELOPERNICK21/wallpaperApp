import { toZonedTime } from 'date-fns-tz';


const getLocalDeviceTime = () => {
    const localDate = new Date(); // Get the current date and time in the device's local timezone
    return localDate.toString(); // Returns the local time as a string
};

export const getTimeForZone = (zone: string) => {
    const utcTime = toZonedTime(new Date(), zone);
    const localTime = getLocalDeviceTime();
    return `${localTime}`;
};