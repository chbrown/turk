/*jslint node: true */
var xmlns = 'http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd';

var DataStructure = function() {
};
DataStructure.prototype.toString = function() {
  return this.toXML().toString();
};

// var Locale = exports.Locale = function(amount) {
//   // this.Amount = amount;
// };
// Locale.prototype.toJSON = function() {
//   // return {Amount: this.Amount, CurrencyCode: 'USD'};
// };

var Price = exports.Price = function(amount) {
  this.Amount = amount;
};
Price.prototype.toJSON = function() {
  return {Amount: this.Amount, CurrencyCode: 'USD'};
};

var ExternalQuestion = exports.ExternalQuestion = function(ExternalURL, FrameHeight) {
  this.ExternalURL = ExternalURL;
  this.FrameHeight = FrameHeight;
};
ExternalQuestion.prototype.toJSON = function() {
  return {
    ExternalURL: this.ExternalURL,
    FrameHeight: this.FrameHeight,
  };
};
ExternalQuestion.prototype.toXML = function() {
  return El('ExternalQuestion', {xmlns: xmlns}, [
    El('ExternalURL', {}, [this.ExternalURL]),
    El('FrameHeight', {}, [this.FrameHeight]),
  ]);
};

var QualificationRequirement = exports.QualificationRequirement = function(QualificationTypeId, Comparator, value) {
  this.QualificationTypeId = QualificationTypeId;
  this.Comparator = Comparator;
  this.value = value;
};
// QualificationRequirement.prototype.toJSON = function() {
//   return {
//     QualificationTypeId: this.QualificationTypeId,
//     Comparator: this.Comparator,
//     Value: this.value.toString(),
//   };
// };
QualificationRequirement.prototype.toXML = function() {
  // value can be a IntegerValue or a LocaleValue
  var value = '';
  var children = [
    El('QualificationTypeId', {}, [this.QualificationTypeId]),
    El('Comparator', {}, [this.Comparator]),
    value,
  ];
  return El('QualificationRequirement', {}, children);
};

QualificationRequirement.Types = {
  Masters: {
    sandbox: '2ARFPLSP75KLA8M8DH1HTEQVJT3SY6',
    production: '2F1QJWKUDD8XADTFD2Q0G6UTO95ALH',
  },
  CategorizationMasters: {
    sandbox: '2F1KVCNHMVHV8E9PBUB2A4J79LU20F',
    production: '2NDP2L92HECWY8NS8H3CK0CP5L9GHO',
  },
  PhotoModerationMasters: {
    sandbox: '2TGBB6BFMFFOM08IBMAFGGESC1UWJX',
    production: '21VZU98JHSTLZ5BPP4A9NOBJEK3DPG',
  },
  Worker_NumberHITsApproved: '00000000000000000040',
  Worker_Locale: '00000000000000000071',
  Worker_Adult: '00000000000000000060',
  Worker_PercentAssignmentsApproved: '000000000000000000L0',
};
