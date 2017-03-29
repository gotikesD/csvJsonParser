module.exports = {
	startMemoryCheck : function() {
		let usedMemory = process.memoryUsage().heapUsed
		return (usedMemory / (1024*1024)).toFixed(2)
	}
}
