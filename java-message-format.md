Java Message Format
===

Date format
---
Abstract class DateFormat is implemented by *SimpleDateFormat*

To instatiate a new Date object with current date and time:

    Date now = new Date();

Although toString() generates string from Date, it does not provide any control over its format. For that SimpleDateFormat is used:

    SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
    System.out.println(sdf.format(now));

sdf creates the string representation of any Date object in the format specified in its constructor. SimpleDateFormat is also able to parse a Date object from a String given in the specified format:

    Date then = sdf.parse("12:55");

For mathematical operations on Dates they have to be converted to milliseconds in Long

    //then-now [s]
    Long delta = (then.getTime() - now.getTime()) / 1000;

Date Format Constants
---

letter | Time Component
--- | ---
yyyy | year
MM | month
dd | day
HH | 24-hour hour
hh | 12-hour hour
ss | seconds

[javadoc](http://docs.oracle.com/javase/1.4.2/docs/api/java/text/SimpleDateFormat.html)

Message format
---

Message format provides a means to create strings with formatted variable substitutions. For a typical usage messages come from a resource file, substituted variables are dynamically created. Where relevant, variables are converted to strings in a locale specific manner matching the system setting.

Usage example:

    MessageFormat mf = new MessageFormat("At {0, time, HH:mm:ss.S} on planet {1, number , #.##} there was {2}");
    Object[] params = {new Date(), 7.52345, "disturbance in the force"};

    String result = mf.format(params);
    System.out.println(result);

output is:

    At 13:42:52.792 on planet 7.52 there was disturbance in the force

In the message string blanks to be filled in are designated with "{...}" curly braces. At minimum the braces contain the ordinal number of the parameter in the Object array. Curly braces may also contain information on Format type and Format style, separated by commas:

Format type | Format Style
--- | ---
number | integer / currency / percent
date / time | short / medium / long / full

Format style may also be a *SubformatPattern*

[javadoc](http://docs.oracle.com/javase/1.4.2/docs/api/java/text/MessageFormat.html)

