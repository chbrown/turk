all: \
	2005-10-01 \
	2006-05-05 \
	2006-07-14 \
	2011-11-11 \
	2013-11-15 \
	2011-11-11/HTMLQuestion.xsd \
	2013-11-15/AWSMechanicalTurkRequester.wsdl \
	2013-11-15/AWSMechanicalTurkRequester.xsd \
	2005-10-01/QuestionForm.xsd \
	2005-10-01/QuestionFormAnswers.xsd \
	2005-10-01/AnswerKey.xsd \
	2006-07-14/ExternalQuestion.xsd \
	2006-07-14/FormattedContentXHTMLSubset.xsd \
	2006-05-05/AWSMechanicalTurkRequesterNotification.wsdl \
	2013-11-15/AWSMechanicalTurkRequester.wsdl

2006-05-05:
	mkdir $@

2005-10-01:
	mkdir $@

2006-07-14:
	mkdir $@

2011-11-11:
	mkdir $@

2013-11-15:
	mkdir $@

# The API: WSDL and message schemas
2013-11-15/AWSMechanicalTurkRequester.wsdl:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurk/2013-11-15/AWSMechanicalTurkRequester.wsdl > $@

2013-11-15/AWSMechanicalTurkRequester.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurk/2013-11-15/AWSMechanicalTurkRequester.xsd > $@


# The HTMLQuestion schema
2011-11-11/HTMLQuestion.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd > $@

# The QuestionForm, QuestionFormAnswers and AnswerKey schemas
2005-10-01/QuestionForm.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd > $@

2005-10-01/QuestionFormAnswers.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionFormAnswers.xsd > $@

2005-10-01/AnswerKey.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/AnswerKey.xsd > $@


# The ExternalQuestion schema
2006-07-14/ExternalQuestion.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd > $@


# The formatted content XHTML subset
2006-07-14/FormattedContentXHTMLSubset.xsd:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/FormattedContentXHTMLSubset.xsd > $@


# The Notification API
2006-05-05/AWSMechanicalTurkRequesterNotification.wsdl:
	curl http://mechanicalturk.amazonaws.com/AWSMechanicalTurk/2006-05-05/AWSMechanicalTurkRequesterNotification.wsdl > $@
