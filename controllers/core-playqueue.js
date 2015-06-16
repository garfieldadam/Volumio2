var libQ = require('kew');
var libFast = require('fast.js');

// Define the CorePlayQueue class
module.exports = CorePlayQueue;
function CorePlayQueue(commandRouter, stateMachine) {
	var self = this;

	self.commandRouter = commandRouter;
	self.stateMachine = stateMachine;

	self.queueReadyDeferred = libQ.defer();
	self.queueReady = self.queueReadyDeferred.promise;

	// Init temporary play queue for testing purposes
	self.arrayQueue = [
		{"name":"Rush","album":"Cowboy Bebop OST 1","artists":"Seatbelts, Steven Berstein, Yoko Kanno, Steve Conte, New York Musicians","tracknumber":2,"date":"1998", "uid":"item:W1wOyONFf1abxZeslZlqOwTraHFCKvVo5Eik3hu-qXM", "service":"mpd","uri":"NAS/Soundtrack/Cowboy Bebop OST/Cowboy Bebop - Original Soundtrack 1/02 - Rush.flac"},
		{"name":"Rush2","album":"Cowboy Bebop OST 1","artists":"Seatbelts, Steven Berstein, Yoko Kanno, Steve Conte, New York Musicians","tracknumber":2,"date":"1998", "uid":"item:W1wOyONFf1abxZeslZlqOwTraHFCKvVo5Eik3hu-qXM", "service":"mpd","uri":"NAS/Soundtrack/Cowboy Bebop OST/Cowboy Bebop - Original Soundtrack 1/02 - Rush.flac"},
		{"name":"Rush3","album":"Cowboy Bebop OST 1","artists":"Seatbelts, Steven Berstein, Yoko Kanno, Steve Conte, New York Musicians","tracknumber":2,"date":"1998", "uid":"item:W1wOyONFf1abxZeslZlqOwTraHFCKvVo5Eik3hu-qXM", "service":"mpd","uri":"NAS/Soundtrack/Cowboy Bebop OST/Cowboy Bebop - Original Soundtrack 1/02 - Rush.flac"}
	];

	self.queueReadyDeferred.resolve();
}

// Public Methods ---------------------------------------------------------------------------------------
// These are 'this' aware, and return a promise

// Get a promise for contents of play queue
CorePlayQueue.prototype.getQueue = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'CorePlayQueue::getQueue');

	return self.queueReady
		.then(function() {
			return self.arrayQueue;
		});
};

// Get a array of contiguous trackIds which share the same service, starting at nStartIndex
CorePlayQueue.prototype.getTrackBlock = function(nStartIndex) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'CorePlayQueue::getTrackBlock');

	var sTargetService = self.arrayQueue[nStartIndex].service;
	var nEndIndex = nStartIndex;

	while (nEndIndex < self.arrayQueue.length - 1) {
		if (self.arrayQueue[nEndIndex + 1].service !== sTargetService) {
			break;
		}

		nEndIndex++;
	}

	var arrayTrackIds = libFast.map(self.arrayQueue.slice(nStartIndex, nEndIndex + 1), function(curTrack) {
		return curTrack.trackid;
	});

	return libQ.resolve({service: sTargetService, trackids: arrayTrackIds, startindex: nStartIndex});
};

// Removes one item from the queue
CorePlayQueue.prototype.removeQueueItem = function(nIndex) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'CorePlayQueue::removeQueueItem');

	return self.queueReady
		.then(function() {
			self.arrayQueue.splice(nIndex, 1);
			return self.commandRouter.volumioPushQueue(self.arrayQueue);
		});
};

// Add one item to the queue
CorePlayQueue.prototype.addQueueItem = function(objItem) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'CorePlayQueue::addQueueItem');

	return self.queueReady
		.then(function() {
			self.arrayQueue.push(objItem);
			return self.commandRouter.volumioPushQueue(self.arrayQueue);
		});
};
