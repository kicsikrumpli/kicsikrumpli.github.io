Mocking DateFormat's format method with mockito
---

Today's entry was prompted by a problem that - at first sight - should have been a non-problem. Mocking (or stubbing, don't be picky, even the mocking frameworks aren't consequent in their terminology) a simple method is normally straightforward. One creates the mock, specifies the method that is call on the mock with the proper parameters, and declares the return value. What could go wrong.

There is a DateFormatter and a DateProvider injected into the client class to be tested, Date is acquired from the latter, passed to the formatter, and via the format method we expect a string to be returned. This is declared in the test method as:

		BDDMockito.given(mockDateProvider.today()).willReturn(mockDate);
		BDDMockito.given(mockDateFormat.format(mockDate)).willReturn(DUMMY_STRING);
		
Unfortunately this will not work, and results in a NullPointerException. After some digging the reason is given in http://stackoverflow.com/questions/10598898/mockito-numberformat-mocking-nullpointer-in-when-method.

Format method with one parameter is declared as:

    /**
     * Formats a Date into a date/time string.
     * @param date the time value to be formatted into a time string.
     * @return the formatted time string.
     */
    public final String format(Date date)
    {
        return format(date, new StringBuffer(),
                      DontCareFieldPosition.INSTANCE).toString();
    }

This is a final method, which cannot be stubbed by Mockito, so in essence it uses the three argument version. That method has a call to toString(), which throws a NullPointerException. Hence the error message. To resolve this, stubbing in the test method should be declared as:

		StringBuffer mockBuffer = new StringBuffer(DUMMY_DATE_STRING);
        Date mockDate = Mockito.mock(Date.class);
        given(mockDateProvider.today()).willReturn(mockDate);
        given(mockDateFormat.format(any(Date.class), any(StringBuffer.class), any(FieldPosition.class))).willReturn(mockBuffer);

Rather awkward, surprising, but oddly logical. Meh. Lesson learned.