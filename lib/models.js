'use strict'; /*jslint es5: true, node: true, indent: 2 */
var xmlns = 'http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd';

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
  return {ExternalURL: this.ExternalURL, FrameHeight: this.FrameHeight};
};
ExternalQuestion.prototype.toXML = function() {
  return '<ExternalQuestion xmlns="' + xmlns + '"><ExternalURL>' + this.ExternalURL + '</ExternalURL>' +
    '<FrameHeight>' + this.FrameHeight + '</FrameHeight></ExternalQuestion>';
};

var QualificationRequirement = exports.QualificationRequirement = function() {
};
