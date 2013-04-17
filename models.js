'use strict'; /*jslint nomen: true, es5: true, node: true */
var Price = exports.Price = function(amount) {
  this.Amount = amount;
};
Price.prototype.toJSON = function() {
  return {Amount: this.Amount, CurrencyCode: 'USD'};
};

var ExternalQuestion = exports.ExternalQuestion = function(external_url, frame_height) {
  this.external_url = external_url;
  this.frame_height = frame_height;
};
ExternalQuestion.prototype.toJSON = function() {
  return {ExternalURL: this.external_url, FrameHeight: this.frame_height};
};
ExternalQuestion.prototype.toXML = function() {
  var xmlns = 'http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd';
  return '<ExternalQuestion xmlns="' + xmlns + '"><ExternalURL>' + this.external_url + '</ExternalURL>' +
    '<FrameHeight>' + this.frame_height + '</FrameHeight></ExternalQuestion>';
};

function QualificationRequirement() { }
