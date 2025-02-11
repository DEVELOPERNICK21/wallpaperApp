import {format} from 'date-fns';
import {formatInTimeZone, toZonedTime} from 'date-fns-tz';
import moment from 'moment-timezone';

// export const getCurrentDateTimeInTimeZone = (timeZone: string | null) => {
//   const currentDate = new Date(); // Get the current date and time

//   if (timeZone) {
//     // If a time zone is provided, convert to that time zone
//     const zonedDate = toZonedTime(currentDate, timeZone);
//     return formatInTimeZone(zonedDate, timeZone, 'yyyy-MM-dd HH:mm:ssXXX');
//   } else {
//     // If no time zone is provided, return the UTC time using toISOString
//     return format(
//       new Date(currentDate.toISOString()),
//       'yyyy-MM-dd HH:mm:ssXXX',
//     );
//   }
// };

export const getCurrentDateTimeInTimeZone = (timeZone: string | null) => {
  // Get the current date and time in UTC
  const currentDate = moment();

  if (timeZone) {
    // If a time zone is provided, convert the current time to that time zone
    return currentDate.tz(timeZone).format('YYYY-MM-DD HH:mm:ss'); // Example format with time zone offset
  } else {
    // If no time zone is provided, return the UTC time
    return currentDate.utc().format('YYYY-MM-DD HH:mm:ss'); // Example format with UTC offset
  }
};
