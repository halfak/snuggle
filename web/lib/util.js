Constants = {
	DAY: 60*60*24
}

Set = {
	max: function(a){
		if(a.length == 0){
			throw "Cannot find maximum of an empty list"
		}
		maximum = 0
		for(var i in a){
			maximum = Math.max(maximum, a[i])
		}
		return maximum
	},
	group: function(a, by){
		by = by || function(item){return item}
		
		var groups = new Object()
		
		for(var i in a){
			var item = a[i]
			var id   = by(item)
			if(groups[id]){
				groups[id].push(item)
			}else{
				groups[id] = [item]
			}
		}
		
		return groups
	}
}

Object.defineProperty(Object.prototype, 'keys',{
	value: function(){
		  var keys = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				keys.push(key)
			}
		}
		
		return keys;
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Object.defineProperty(Object.prototype, 'values',{
	value: function(){
		var values = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				values.push(this[key])
			}
		}
		
		return values;
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Date.prototype.wikiFormat = function(){
	return this.toUTCString()
}

if(window.console && window.console.log){
	LOGGING = {
		debug: function(loggable){
			var msg = ["DEBUG", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.DEBUG){
				if(console.debug){console.debug(msg)}
				else{console.log(msg)}
			}
		},
		info: function(loggable){
			var msg = ["INFO", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.INFO){
				if(console.info){console.info(msg)}
				else{console.log(msg)}
			}
		},
		error: function(loggable){
			var msg = ["ERROR", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.ERROR){
				if(console.error){console.error(msg)}
				else{console.log(msg)}
			}
		}
	}
}else{
	LOGGING = {
		debug: function(loggable){},
		info: function(loggable){},
		error: function(loggable){}
	}
}
LOGGING.levels = {
	DEBUG: 0,
	INFO:  1,
	ERROR: 2
}
LOGGING.level = 0 //Default


Page = {
	namespaces: {
		0: "",
		1: "Talk",
		2: "User",
		3: "User_talk",
		4: "Wikipedia",
		5: "Wikipedia_talk",
		6: "File",
		7: "File_talk",
		8: "Mediawiki",
		9: "Mediawiki_talk",
		10: "Template",
		11: "Template_talk",
		12: "Help",
		13: "Help_talk",
		14: "Category",
		15: "Category_talk",
		100: "Portal",
		101: "Portal_talk",
		108: "Book",
		109: "Book_talk",
		"-1": "Special",
		"-2": "Media"
	},
	fullTitle: function(ns, title){
		if(this.namespaces[ns]){
			return this.namespaces[ns] + ":" + title
		}else{
			return title
		}
	}
}

Diff = function(oldWords, newWords){
	if(typeof(oldWords)=="object" && oldWords.length != undefined){
		this.oldWords = oldWords
	}
	else{
		this.oldWords = Diff.splitText(oldWords)
	}
 
	if(typeof(newWords)=="object" && newWords.length != undefined){
		this.newWords = newWords
	}
	else{
		this.newWords = Diff.splitText(newWords)
	}
 
	this.newToOld = []
	this.oldToNew = []
	this.message  = ""
 
	Diff.diffText(this)
}
 
 
	/**
	 * Get Instructions
	 *
	 */
	Diff.prototype.getInstructions = function(){
		var instructionList = []
 
		var o2ni = 0
		var n2oi = 0
		var newWordCount = 0
		while(true){
			if(typeof(this.oldToNew[o2ni]) == "undefined" && o2ni < this.oldWords.length){
				//Word removed
				instructionList.push({"code": "remove", "i": o2ni})
				o2ni++
			}
			else if(typeof(this.newToOld[n2oi]) == "undefined" && n2oi < this.newWords.length){
				//Word added
				instructionList.push({"code": "insert", "i": n2oi})
				newWordCount++
				n2oi++
			}
			else if(newWordCount < this.newWords.length){
				//Word kept
				instructionList.push({"code": "keep", "i": this.newToOld[n2oi]})
				newWordCount++
				o2ni++
				n2oi++
			}
			else{
				break
			}
 
		}
 
		return instructionList
	}
 
	/**
	 * Split Text (better but slower)
	 * 
	 * Splits text into words.  (Note: a chunks of whitespace will be 
	 * considered words)
	 */
	Diff.splitText = function(text){
		// convert strange spaces
		//text = text.replace(/[\u000b\u00a0\u2028\u2029]+/g, ' ')
 
		var pattern = /[\w]+|\[\[|\]\]|\{\{|\}\}|\n+| +|&\w+;|'''|''|=+|\{\||\|\}|\|\-|./gi
 
		var words = []
		var result
		do {
			result = pattern.exec(text)
			if (result != null) {
				words.push(result[0])
			}
		} while (result != null)
 
		return words
	}
 
 
	/**
	 * Split Text (shitty but fast)
	 * 
	 * Splits text into words.  (Note: a chunks of whitespace will be 
	 * considered words)
	 *
	Diff.splitText = function(text){
		// convert strange spaces
		text = text.replace(/[\t\u000b\u00a0\u2028\u2029]+/g, ' ')
 
		return text.split(/\b/g)
	}*/
 
	/**
	 * Diff Words
	 *
	 * Performs a diff over an old and new word list recursively.  (Only the
	 * first two parameters are needed to call this function.  The rest are 
	 * for memoization.
	 */
	Diff.diffText = function(text, newStart, newEnd, oldStart, oldEnd, recursionLevel) {
		var symbol = {
			newCtr: [],
			oldCtr: [],
			toNew: [],
			toOld: []
		}
 
		var wDiffRecursiveDiff = true
 
		// set defaults
		newStart = newStart || 0
		newEnd = newEnd || text.newWords.length
		oldStart = oldStart || 0
		oldEnd = oldEnd || text.oldWords.length
		recursionLevel = recursionLevel || 0
 
		// limit recursion depth
		if (recursionLevel > 10) {
			return text
		}
 
		// pass 1: parse new text into symbol table s
 
		var word;
		for (var i = newStart; i < newEnd; i ++) {
			word = text.newWords[i]
 
		// add new entry to symbol table
			if ( symbol[word] == null) {
				symbol[word] = { newCtr: 0, oldCtr: 0, toNew: null, toOld: null };
			}
 
		// increment symbol table word counter for new text
			symbol[word].newCtr ++
 
		// add last word number in new text
			symbol[word].toNew = i
		}
 
		// pass 2: parse old text into symbol table
 
		for (var j = oldStart; j < oldEnd; j ++) {
			word = text.oldWords[j]
 
		// add new entry to symbol table
			if ( symbol[word] == null) {
				symbol[word] = { newCtr: 0, oldCtr: 0, toNew: null, toOld: null }
			}
 
		// increment symbol table word counter for old text
			symbol[word].oldCtr++
 
		// add last word number in old text
			symbol[word].toOld = j
		}
 
		// pass 3: connect unique words
 
		for (var i in symbol) {
 
		// find words in the symbol table that occur only once in both versions
			if ( (symbol[i].newCtr == 1) && (symbol[i].oldCtr == 1) ) {
				var toNew = symbol[i].toNew
				var toOld = symbol[i].toOld
 
		// do not use spaces as unique markers
				if ( ! /\s/.test( text.newWords[toNew] ) ) {
 
		// connect from new to old and from old to new
					text.newToOld[toNew] = toOld
					text.oldToNew[toOld] = toNew
				}
			}
		}
 
		// pass 4: connect adjacent identical words downwards
 
		for (var i = newStart; i < newEnd - 1; i ++) {
 
		// find already connected pairs
			if (text.newToOld[i] != null) {
				j = text.newToOld[i]
 
		// check if the following words are not yet connected
				if ( (text.newToOld[i + 1] == null) && (text.oldToNew[j + 1] == null) ) {
 
		// if the following words are the same connect them
					if ( text.newWords[i + 1] == text.oldWords[j + 1] ) {
						text.newToOld[i + 1] = j + 1
						text.oldToNew[j + 1] = i + 1
					}
				}
			}
		}
 
		// pass 5: connect adjacent identical words upwards
 
		for (var i = newEnd - 1; i > newStart; i --) {
 
		// find already connected pairs
			if (text.newToOld[i] != null) {
				j = text.newToOld[i]
 
		// check if the preceeding words are not yet connected
				if ( (text.newToOld[i - 1] == null) && (text.oldToNew[j - 1] == null) ) {
 
		// if the preceeding words are the same connect them
					if ( text.newWords[i - 1] == text.oldWords[j - 1] ) {
						text.newToOld[i - 1] = j - 1
						text.oldToNew[j - 1] = i - 1
					}
				}
			}
		}
 
		// recursively diff still unresolved regions downwards
 
		if (wDiffRecursiveDiff) {
			i = newStart
			j = oldStart
			while (i < newEnd) {
				if (text.newToOld[i - 1] != null) {
					j = text.newToOld[i - 1] + 1
				}
 
		// check for the start of an unresolved sequence
				if ( (text.newToOld[i] == null) && (text.oldToNew[j] == null) ) {
 
		// determine the ends of the sequences
					var iStart = i
					var iEnd = i
					while ( (text.newToOld[iEnd] == null) && (iEnd < newEnd) ) {
						iEnd++
					}
					var iLength = iEnd - iStart
 
					var jStart = j
					var jEnd = j
					while ( (text.oldToNew[jEnd] == null) && (jEnd < oldEnd) ) {
						jEnd ++;
					}
					var jLength = jEnd - jStart
 
		// recursively diff the unresolved sequence
					if ( (iLength > 0) && (jLength > 0) ) {
						if ( (iLength > 1) || (jLength > 1) ) {
							if ( (iStart != newStart) || (iEnd != newEnd) || (jStart != oldStart) || (jEnd != oldEnd) ) {
								this.diffText(text, iStart, iEnd, jStart, jEnd, recursionLevel + 1)
							}
						}
					}
					i = iEnd
				}
				else {
					i ++
				}
			}
		}
 
		// recursively diff still unresolved regions upwards
 
		if (wDiffRecursiveDiff) {
			i = newEnd - 1
			j = oldEnd - 1
			while (i >= newStart) {
				if (text.newToOld[i + 1] != null) {
					j = text.newToOld[i + 1] - 1
				}
 
		// check for the start of an unresolved sequence
				if ( (text.newToOld[i] == null) && (text.oldToNew[j] == null) ) {
 
		// determine the ends of the sequences
					var iStart = i
					var iEnd = i + 1
					while ( (text.newToOld[iStart - 1] == null) && (iStart >= newStart) ) {
						iStart --
					}
					var iLength = iEnd - iStart
 
					var jStart = j
					var jEnd = j + 1
					while ( (text.oldToNew[jStart - 1] == null) && (jStart >= oldStart) ) {
						jStart --
					}
					var jLength = jEnd - jStart
 
		// recursively diff the unresolved sequence
					if ( (iLength > 0) && (jLength > 0) ) {
						if ( (iLength > 1) || (jLength > 1) ) {
							if ( (iStart != newStart) || (iEnd != newEnd) || (jStart != oldStart) || (jEnd != oldEnd) ) {
								this.diffText(text, iStart, iEnd, jStart, jEnd, recursionLevel + 1)
							}
						}
					}
					i = iStart - 1
				}
				else {
					i--
				}
			}
		}
		return text
	}
 
	/**
	 * WDiffDetectBlocks
	 * 
	 * Detect block borders and moved blocks.  I really have no idea what 
	 * this does or how it does it.  Horray for giant blocks of mystery 
	 * code!
	 */
	Diff.detectBlocks = function(text) {
		var block = {}
		block.oldStart  = []
		block.oldToNew  = []
		block.oldLength = []
		block.oldWords  = []
		block.newStart  = []
		block.newLength = []
		block.newWords  = []
		block.newNumber = []
		block.newBlock  = []
		block.newLeft   = []
		block.newRight  = []
		block.newLeftIndex  = []
		block.newRightIndex = []
 
		var blockNumber = 0
		var wordCounter = 0
		var realWordCounter = 0
		var wDiffShowBlockMoves = true
 
		// get old text block order
		if (wDiffShowBlockMoves) {
			var j = 0
			var i = 0
			do {
 
		// detect block boundaries on old text
				if ( (text.oldToNew[j] != i) || (blockNumber == 0 ) ) {
					if ( ( (text.oldToNew[j] != null) || (j >= text.oldWords.length) ) && ( (text.newToOld[i] != null) || (i >= text.newWords.length) ) ) {
						if (blockNumber > 0) {
							block.oldLength[blockNumber - 1] = wordCounter
							block.oldWords[blockNumber - 1] = realWordCounter
							wordCounter = 0
							realWordCounter = 0
						}
 
						if (j >= text.oldWords.length) {
							j ++
						}
						else {
							i = text.oldToNew[j]
							block.oldStart[blockNumber] = j
							block.oldToNew[blockNumber] = text.oldToNew[j]
							blockNumber ++
						}
					}
				}
 
		// jump over identical pairs
				while ( (i < text.newWords.length) && (j < text.oldWords.length) ) {
					if ( (text.newToOld[i] == null) || (text.oldToNew[j] == null) ) {
						break
					}
					if (text.oldToNew[j] != i) {
						break
					}
					i ++
					j ++
					wordCounter ++
					if ( /\w/.test( text.newWords[i] ) ) {
						realWordCounter ++
					}
				}
 
		// jump over consecutive deletions
				while ( (text.oldToNew[j] == null) && (j < text.oldWords.length) ) {
					j ++
				}
 
		// jump over consecutive inserts
				while ( (text.newToOld[i] == null) && (i < text.newWords.length) ) {
					i ++
				}
			} while (j <= text.oldWords.length)
 
		// get the block order in the new text
			var lastMin
			var currMinIndex
			lastMin = null
 
		// sort the data by increasing start numbers into new text block info
			for (var i = 0; i < blockNumber; i ++) {
				currMin = null
				for (var j = 0; j < blockNumber; j ++) {
					curr = block.oldToNew[j]
					if ( (curr > lastMin) || (lastMin == null) ) {
						if ( (curr < currMin) || (currMin == null) ) {
							currMin = curr
							currMinIndex = j
						}
					}
				}
				block.newStart[i] = block.oldToNew[currMinIndex]
				block.newLength[i] = block.oldLength[currMinIndex]
				block.newWords[i] = block.oldWords[currMinIndex]
				block.newNumber[i] = currMinIndex
				lastMin = currMin
			}
 
		// detect not moved blocks
			for (var i = 0; i < blockNumber; i ++) {
				if (block.newBlock[i] == null) {
					if (block.newNumber[i] == i) {
						block.newBlock[i] = 0
					}
				}
			}
 
		// detect switches of neighbouring blocks
			for (var i = 0; i < blockNumber - 1; i ++) {
				if ( (block.newBlock[i] == null) && (block.newBlock[i + 1] == null) ) {
					if (block.newNumber[i] - block.newNumber[i + 1] == 1) {
						if ( (block.newNumber[i + 1] - block.newNumber[i + 2] != 1) || (i + 2 >= blockNumber) ) {
 
		// the shorter one is declared the moved one
							if (block.newLength[i] < block.newLength[i + 1]) {
								block.newBlock[i] = 1
								block.newBlock[i + 1] = 0
							}
							else {
								block.newBlock[i] = 0
								block.newBlock[i + 1] = 1
							}
						}
					}
				}
			}
 
		// mark all others as moved and number the moved blocks
			j = 1
			for (var i = 0; i < blockNumber; i ++) {
				if ( (block.newBlock[i] == null) || (block.newBlock[i] == 1) ) {
					block.newBlock[i] = j++
				}
			}
 
		// check if a block has been moved from this block border
			for (var i = 0; i < blockNumber; i ++) {
				for (var j = 0; j < blockNumber; j ++) {
 
					if (block.newNumber[j] == i) {
						if (block.newBlock[j] > 0) {
 
		// block moved right
							if (block.newNumber[j] < j) {
								block.newRight[i] = block.newBlock[j]
								block.newRightIndex[i] = j
							}
 
		// block moved left
							else {
								block.newLeft[i + 1] = block.newBlock[j]
								block.newLeftIndex[i + 1] = j
							}
						}
					}
				}
			}
		}
 
		text.block = block
		return text
	}
