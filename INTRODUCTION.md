## Mechanical Turk: an Introduction

The official introduction can be found [here](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/IntroductionArticle.html), but it's written in whitepaperic, a language that's closely related to legalese.

Basic terminology:

- **AMT**: Amazon Mechanical Turk
- **Requester**: you, the experimenter
- **HIT**: the <b>H</b>uman <b>I</b>ntelligence <b>T</b>ask of your creation. Technically, this refers to a small static part of a larger job (a **HIT Type**), but is colloquially used to refer all types of jobs / experiments / tasks on AMT.
- **Turker** or **Worker**: the subject of your experiment or task, optimally a real person
- **Sandbox**: the AMT staging area.
  No one pays or gets paid to work on sandbox HITs; the sandbox exists solely to test out the HITs you've created before you submit them to the production site.
  You always have $10,000 USD in the sandbox.

AMT is located at the following URLs:

* [Requester site](https://requester.mturk.com), for most administrative types of actions outside the API.
* [Worker site](https://www.mturk.com/), which you'll likely never use.
* [Requester sandbox](https://requestersandbox.mturk.com/), for creating test HITs.
* [Worker sandbox](https://workersandbox.mturk.com/), for testing your HIT from the Turker's point of view.

There are several kinds of HITs on AMT. We'll go from most restrictive to most flexible.


### Projects

[Projects](https://requester.mturk.com/create/projects) are the easiest HITs to set up. There are 11 project template currently available on Mechanical Turk:

- Categorization
- Data Collection
- Moderation of an Image
- Sentiment
- Survey
- Survey Link
- Tagging of an Image
- Transcription from A/V
- Transcription from an Image
- Writing
- Other

If your task happens to match exactly the defaults of any one of these tasks, great! You are one lucky, lucky scientist.

It is unlikely for this to be the case, and unfortunately it's impossible to change even basic properties of these projects. For example, the 'Categorization' template requires you to limit the Turkers than can work on your task to those with the "Categorization Master" qualification. As any Turker will tell you, all Masters qualifications are just ways for Amazon to rip off both you, the experimenter, and them, the workers. The "Masters" qualifications incur an additional 20% surcharge, _on top_ of the 10% cut that Amazon takes by default. (Actually, this is only partly true; Amazon takes 10% as long as your task pays at least $0.05; they take 12.5% of $0.04 tasks, 17% of $0.03, 25% of $0.02 tasks, and 50% of $0.01 tasks. So not only is it a better user experience to create HITs that are worth at least $0.05, it's more economical.) Speaking of user experience, at least back in that parenthetical, the built-in projects do not allow you to specify how many questions to show per page (per HIT). If you have a bunch of tweets, say, and you're showing them to users one at a time, not only will they be unreasonably slow to do your task, they will not be especially happy with it, either.

As you get started, one priority is to do your best to make sure that workers want to do your tasks. If you run a lot of tasks, they [_will_](http://www.mturkgrind.com/forum.php) [talk](http://www.mturkforum.com/) [about](http://www.turkernation.com/) [you](http://turkopticon.ucsd.edu/), and they will be quite honest with each other about whether your tasks pay well, are broken, or even if the tasks are fun or have a stupid / frustrating interface. They may even talk to you. Workers on your tasks can send you messages, which get routed to whatever email address you used when signing up, and they don't appreciate it if you ignore them, so don't neglect that email address if it's not your primary address.

Your workers are using the web. Sure, you're paying them a very small amount to use the web in a certain way, but you should still treat them like your web users. You want their web experience to be smooth, efficient. Tedious, maybe, but not annoying.
This means that linking to an external form, providing a validation code at the end of that form, and having the Turkers copy & paste that back into Turk when they're done isn't cool. And radio buttons with labels that don't trigger the radio button check status. All the [usual stuff](http://uxcredo.com/).

Projects have the benefit of an easy way to export the data after the task is over. Usually, doing batching on AMT requires a good bit of tears both to set it up as well as pull the data down, but projects make both aspects easy.


### Individual HITs

[Individual HITs](https://requester.mturk.com/mturk/createHIT) are even simpler, but slightly more configurable. You have about a paragraph to explain your task, and can ask one question. This would be perfect if you have a one question survey. But you can't even pipe in a spreadsheet of your data so that different Workers will see different questions. This doesn't have much use unless you want to prove to someone that you can create a HIT on AMT.

That's all that you can create via the AMT website. Beyond that you'll need to use the API. [Boto](http://boto.readthedocs.org/en/latest/) is a reasonable Python implementation. Most other implementations are not reasonable.


### API Question Types

[QuestionForm](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QuestionFormDataStructureArticle.html)s are a constrained format that's similar to the Individual HIT option, but supports multiple questions and custom data. There are ways to insert a Java Applet (whoa, is this 1990?) or a Flash movie (whoa, is this 2000?), and other crazy remnants of the Web 1.0. This is problematic because it seems reasonable at first, but then you'll be two or three hours into designing your QuestionForm and find out that the incredibly restrictive QuestionForm XSD schema is incredibly restrictive. Oh, did you want part of that string to be in bold? Nope, sorry! Colored blue? Haha, right.

[HTMLQuestion](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HTMLQuestionArticle.html)s are a much more flexible option, and they're the most flexible option if you don't have a server to put your tasks on. (But that is no excuse; there are tons of places on the web that let you upload whatever HTML you want. For instance, [GitHub](https://github.com/).) In this case you write whatever HTML you want, even javascript with `<script></script>` tags. The HTML you upload comprises the pages your Turkers will see when they open your task. Wait, did I just say _whatever_ HTML you want? I meant whatever HTML you want, provided that it's a bizarre subset of UTF-8 that excludes characters longer than three bytes. Does this make sense? No. Three bytes covers a lot of characters, but it's surprisingly painful to make sure that all your strings contain no characters longer than three bytes. Here's a Python script I threw together to filter them out: [Unicode-byte-limits.ipynb](http://nbviewer.ipython.org/github/chbrown/sandbox/blob/gh-pages/python/notebooks/Unicode-byte-limits.ipynb). Not pretty, but Python isn't very good at unicode to begin with. It might be easier with Go's runes or similar concepts in other languages.
(Also, note that Boto will insert a `<!DOCTYPE html>` in front of the HTML you give it, even if you already have a doctype. Does this make sense? No.)

[ExternalQuestion](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExternalQuestionArticle.html)s are the most flexible of all options on AMT. These consist of all the usual HIT properties and a single URL. This URL will be loaded via an `<iframe>`, and you'll communicate with AMT via that URL by various querystring parameters that AMT will send along when loading that URL. (This happens to be precisely how HTMLQuestions are loaded, though in that case both parts are hosted by Amazon.) These consist, most importantly, of the Worker's ID, the HIT ID, and the Assignment ID. ExternalQuestions can be linked directly to an app and rendered on the fly. You can look at your server logs to look at accesses of that URL to see who's been previewing your HIT and who's been working on it.

If your question is anything but the very simplest list of multiple choice questions, save yourself the pain of creating and recreating your HIT in each type and start with the ExternalQuestion type.


### HIT Types

[HIT Types](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/Concepts_HITTypesArticle.html) can contain multiple HITs. If you create a single HIT via the GUI or the API, it'll automatically create a new HIT Type to go along with the new HIT.

The difference between a HIT Type and a HIT is that a single Turker can only do a HIT once, but there is no limit to the number of _different_ HITs within a single HIT Type that the Turker is allowed to work on. So if you want to get 5 unique annotations for each of 100 tweets, you'll create a single HIT Type, and then 100 HITs associated with that HIT Type, one for each of tweet, with the parameter `MaxAssignments=5`. Or if you're not feeling that sadistic, you'll create 10 HITs, each of which contain a group of 10 tweets, again with the `MaxAssignments=5` setting.

This is, in fact, how the Batch Projects work under the surface, but the Project interface also collects all the results back together for you at the end, whereas that step is a bit painful when you create 1000 HITs manually. Just remember the HIT Type ID that AMT gave your original HIT Type when you created it and it won't be too bad. AMT unfortunately doesn't let you retrieve all HITs for a given HIT Type ID, but Boto's `get_all_hits()` function makes this easier by smoothing over the pagination issue.


### Capabilities

A frequently asked question is "Can I do X on Mechanical Turk"? If you have ever personally done X on the web, the answer is yes. The only real disclaimer here is that some of your Turkers might be using dinosaur browsers like IE6. I have never personally found this to be an issue; it's much more likely for me to get tripped up by someone using IE10. As a web developer, I don't care much about IE users, and rarely bother to test my pages on IE. (Sorry guys, but there's really no excuse -- both Firefox and Chrome work on Windows just fine.)

Another concern might be bandwidth. Suppose Turkers make about $6 / hour. Imagine that you are a Turker and are working full-time: 40 hours a week. That comes to a monthly income of $960 before taxes, so let's say that's about $800 take-home. Now imagine what kind of internet you can afford with an income like that. That should give you an idea about bandwidth. Streaming HD is probably not a good idea, but embedded YouTube isn't out of the question.

Some things that are kind of tricky to do on the web right now, like audio/video, are going to be tricky to do via AMT. Not impossible, but certainly trickier. Particularly audio/video produced by the user. I haven't heard of any attempts to crowdsource out-loud readings via AMT, but I've looked into getting audio recordings and think it's possible. (Note that this is getting into a more sensitive area; AMT terms of service say you can't ask workers for personally identifiable information, but the AMT marketplace isn't moderated like the Mac App Store or anything.)


### Science

- Panos Ipeirotis has a great blog of his MTurk forays (and other things) at [behind-the-enemy-lines.com](http://www.behind-the-enemy-lines.com/)
- Perhaps the best known paper on using MTurk in NLP ["Cheap and Fast - But is it Good? Evaluating Non-Expert Annotations for Natural Language Tasks"](http://www.stanford.edu/people/jurafsky/amt.pdf) (Spoiler: yes. Well, good enough.)
- ["Fast, Cheap, and Creative: Evaluating Translation Quality Using Amazon's Mechanical Turk"]() includes a nice exposition of MTurk, comparisons of Turkers to experts, and how to use both effectively.
- One of my favorite uses of MTurk: [10,000 hand-drawn sheep](http://www.thesheepmarket.com/) (Total Cost: $250)
- And of course the "wisdom of crowds" [Francis Galton paper](http://galton.org/essays/1900-1911/galton-1907-vox-populi.pdf) from 1907 that kicked it all off (back in the day when groundbreaking scientific articles were one page).


## Final words

MTurk is ephemeral; be sure to export your data systematically, since MTurk will save nothing, not your HIT Types, not your HTMLQuestions, not your Workers' responses, etc., for longer than six months.

