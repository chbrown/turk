# turk: Amazon Mechanical Turk API

[![npm version](https://badge.fury.io/js/turk.svg)](https://www.npmjs.com/package/turk)

See http://en.wikipedia.org/wiki/Web_Services_Description_Language
In combination with http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_WsdlLocationArticle.html


**Install:**

    npm install turk

Or merge the following into your `package.json`:

    {
      "dependencies": {
        "turk": "*"
      }
    }


## SQS Message Payload

The body of each SQS message is a JSON-encoded structure that provides support for multiple events in each message.

The following specifications are taken from the [AWS MechTurk documentation](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html).

The JSON-encoded structure consists of the following properties:

* `EventDocVersion`: This is the requested version that is passed in the call to SetHITTypeNotification, such as '2006-05-05'. For a requested version, Mechanical Turk will not change the structure or definition of the output payload structure in a way that is not backward-compatible.
* `EventDocId`: A unique identifier for the Mechanical Turk. In rare cases, you may receive two different SQS messages for the same event, which can be detected by tracking the EventDocId values you have already seen.
* `CustomerId`: Your customerId.
* `Events`: A list of Event structures, described below.

The Event structure consists of the following properties:

* `EventType`: A value corresponding to the EventType value in the notification specification data structure.
* `EventTimestamp`: A dateTime in the Coordinated Universal Time time zone, such as 2005-01-31T23:59:59Z.
* `HITTypeId`: The HIT type ID for the event.
* `HITId`: The HIT ID for the event.
* `AssignmentId`: The assignment ID for the event, if applicable.


## License

Copyright 2013–2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2013-2015).
