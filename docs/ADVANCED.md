## Non-obvious Mechanical Turk strategies

This is a list of some tips and tricks for getting better results from your Mechanical Turk tasks.


### Beginner's luck

The `Worker_​PercentAssignmentsApproved` [QualificationRequirement](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html) allows you to filter out workers that have low approval rates from working on other tasks.

However, all new Turkers get a grace period when, until they have completed more than 100 HITs, their approval rate is fixed at 100%. Thus, for `Worker_​PercentAssignmentsApproved` to behave as expected, you must also use the QualificationRequirement of `Worker_​NumberHITsApproved` `GreaterThan` 100.


### Repeats

It's impossible to change the URL for a `ExternalQuestion` after it has been created. So if you want to run a follow-up experiment that excludes participants from the original task, you have basically three options:

1. Put up the follow-up experiment at the same URL, then call [`ExtendHIT`](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExtendHITOperation.html) on your HIT. This requires that the HIT still exists; if you're more than a few months out, your HIT might not even be around anymore, and this option's out. And it's annoying to manipulate URLs like that.
2. Check the Turker's WorkerID when they preview your HIT and compare it to your list, server-side, displaying a message like
  > You have already completed this HIT. Please do not click Accept HIT. If you complete this HIT, your assignment will be rejected.
  Which is kind of harsh, but pretty clear. Not the best user experience, and you'll need to implement WorkerID checking on the server-side, as well as flag the Turkers that ignore the warning and complete the experiment.
3. **The right way:**
  1. [Create](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateQualificationTypeOperation.html) a new QualificationType with `AutoGranted` set to true, with an `AutoGrantedValue` of 0.
  2. Assign all of the original HIT's WorkerIDs this new qualification with an `IntegerValue` of 1. To be polite, set `SendNotification` to false so that they don't get an email that basically says you've blacklisted them.
  3. When creating the new edition of the HIT, add a qualification requirement setting the new qualification `NotEqualTo` 1.

  What makes this work is that Turkers cannot remove qualifications that you have assigned to them. So if a worker from the original task opens up the HIT preview, they will find that they do not meet the qualification requirement, and can't do anything about it.

  For novel workers that were not manually assigned the qualification, this method will require an extra action, to request and be auto-granted that qualification.

Of course none of this handles Turkers with multiple accounts / multiple WorkerIDs. If you are really concerned about it, you'll probably want to check IP addresses and do some other kind of browser fingerprinting, in which case #2 is your only viable option.


### Rate hikes and chaining

[Until July 21, 2015](https://web.archive.org/web/20150708220642/https://requester.mturk.com/pricing), Amazon Mechanical Turk's fee was 10%, with two exceptions: 1) if your HIT reward was less than $0.05, the fee per HIT bottomed out at a minimum of $0.005, and 2) Masters qualifications incurred an additional fee of 20%.

[On July 22, 2015](https://web.archive.org/web/20150812164757/https://requester.mturk.com/pricing), Amazon doubled their fees for small HITs, and quadrupled them for HITs with 10 or more assignments. Supposedly, the 10+ assignment surcharge is to discourage "rare" survey-type HITs, and encourage more unique tasks. So, they now collect a minimum 20%, and 40% for HITs with 10+ assignments, _plus_ 5% for Masters qualifications.

Compared to CrowdFlower's baseline 20% fees, this makes Mechanical Turk far less attractive, particularly for large experiments.

A clever server could avoid the 40% rate, incurring only the baseline 20% fees, by creating small new HITs and assigning qualifications automatically. I haven't implemented this yet, but it would take the following form:

Suppose you want a lot of people (more than 9) to do your experiment.

1. Create a new qualification type, as in the **Repeats** section above.
2. Create a new HIT requiring that qualification with MaxAssignments = 9
3. When that HIT has been completed:
  1. Re-assign all of the workers who completed it the qualification (which they requested and were auto-granted), but now set the value to 1.
  2. If you've got enough assignments, stop. If not, create a new HIT with identical properties, and wait for #3

Of course, this incurs a lot of overhead with having to track the HITs, workers, and qualifications. Whether or not it's worth it depends on your volume, development costs, and the bottleneck of having at most nine assignments running in parallel (and even then you have to wait until the last Turker is done before you can move on -- otherwise, you run into a race condition where they can be mid-HIT and accept your subsequent duplicate HIT before you update their qualification's value). If the bottleneck is a constraining factor, but the overhead is not, option #2 in the **Repeat** section might be a viable solution. It allows you to warn Turkers in real-time, instead of waiting for batches of HIT completions and qualification updates.
