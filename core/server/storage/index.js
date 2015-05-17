var errors = require('../errors'),
	config = require('../config'),
	storage = {};

function getStorage(storageChoice) {
	var storagePath,
		storageConfig;

	storageChoice = config.storage.active;
	storagePath = config.paths.storage;
	storageConfig = config.storage[storageChoice];

	if (storage[storageChoice]) {
		return storage[storageChoice];
	}

	try {
		storage[storageChoice] = require(storagePath);
	} catch (e) {
		errors.logError(e);
	}

	storage[storageChoice] = new storage[storageChoice](storageConfig);
	return storage[storageChoice];
}

module.exports.getStorage = getStorage;