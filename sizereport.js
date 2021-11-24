const fs = require('fs');
const path = require('path');
const { argv } = require('process');

const GAP_LIMIT = 255;
const NUMBER_FORMAT_3 = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3, useGrouping: false });
const NUMBER_FORMAT_4 = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4, useGrouping: false });


let filterFunction = entry => {
	return !entry.sec.match(/^(\.debug|.comment|\.ARM\.attributes)/);
}


function addToMap(map, memories, entry) {
	let mem = memories['*undefined*'];
	for (let m of Object.values(memories)) {
		if (m.addr <= entry.addr && entry.addr < m.addr + m.size) {
			mem = m;
			break;
		}
	}
	entry.memory = mem.name;
	let path = filterFunction(entry);
	if (path) {
		entry.path = path;
		map.push(entry);
	}
}

function die(text) {
	console.error(text);
	process.exit(2);
}

function parseMap(file) {

	let mapText;

	try {
		mapText = fs.readFileSync(file, 'binary');
	} catch (ex) {
		die('Cannot read input map file');
	}

	let map = [];
	let memories = {};
	let loadAddrOffset = null;

	let m = mapText.match(/\r?\n\r?\nMemory Configuration\r?\n\r?\n/m);
	if (!m) throw Error('Cannot find "Memory Configuration".');
	let start = m.index + m[0].length;
	let memConf = mapText.substr(start);
	m = memConf.match(/\r?\n\r?\n/m);
	if (!m) throw Error('Cannot find end of "Memory Configuration".');
	memConf = memConf.substr(0, m.index);

	m = mapText.match(/\r?\n\r?\nLinker script and memory map\r?\n\r?\n/m);
	if (!m) throw Error('Cannot find "Linker script and memory map".');
	start = m.index + m[0].length;
	let memMap = mapText.substr(start);

	memConf.replace(/(\S+)[\t ]+(0x00000000[0-9A-F]{8})[\t ]+(0x00000000[0-9A-F]{8}).*\r?\n/img, (str, name, addrStr, sizeStr) => {
		let addr = Number.parseInt(addrStr);
		let size = Number.parseInt(sizeStr);
		memories[name] = { name, addr, size };
	});
	memories['*undefined*'] = { name: '*undefined*', addr: 0, size: 0x100000000 };

	memMap.replace(/\n([\t ]*)([^\s]+)\r?\n?[\t ]+(0x00000000[0-9A-F]{8})\s+(0x[0-9A-F]+)([\t ]+[^\r\n]+)?/img, (str, ind, sec, addrStr, sizeStr, file) => {
		let addr = Number.parseInt(addrStr);
		let size = Number.parseInt(sizeStr);
		if (ind == '') {
			let m;
			if (file && (m = file.match(/\s*load address[\t ]+(0x00000000[0-9A-F]{8})/im))) {
				loadAddrOffset = addr - Number.parseInt(m[1]);
			} else {
				loadAddrOffset = null;
			}
			return;
		}
		if (size == 0) return;
		if (!file) {
			file = sec == '*fill*' ? sec : '*unknown*';
		}
		file = file.trim();
		let library = '';
		if ((m = file.match(/^(.+)\((.+)\)$/))) {
			library = m[1].trim();
			file = m[2].trim();
		}
		let entry = { sec, addr, size, library, file };
		if (loadAddrOffset !== null) {
			let loadEntry = { ...entry };
			loadEntry.addr = addr - loadAddrOffset;
			addToMap(map, memories, loadEntry);
		}
		addToMap(map, memories, entry);
	});

	return [map, memories];
}


function removeOverlaps(map, memories) {
	let mem = [];
	let newMap = [];
	for (let i = 0; i < map.length; i++) {
		let entry = map[i];
		let newEntry = { ...entry, size: 0 };
		for (let addr = entry.addr; addr < entry.addr + entry.size; addr++) {
			if (addr in mem) {
				if (newEntry.size > 0) {
					newMap.push(newEntry);
					newEntry = { ...entry, size: 0 };
				}
				newEntry.addr = addr + 1;
			} else {
				newEntry.size++;
				mem[addr] = i;
			}
		}
		if (newEntry.size > 0) {
			newMap.push(newEntry);
		}
	}
	let prev = null;
	for (let i of Object.keys(mem)) {
		i = parseInt(i);
		if (prev !== null) {
			let size = i - prev - 1;
			if (size <= GAP_LIMIT && size > 0) {
				addToMap(newMap, memories, { sec: '*gap*', addr: prev + 1, size: size, library: '', file: '*gap*' });
			}
		}
		prev = i;
	}
	return newMap;
}


function categorize(map) {

	let selected = { entries: [], sub: {} };
	let other = { entries: [], sub: {} };

	for (let entry of map) {
		let path = entry.path;
		let obj;
		if (path === false) {
			continue;
		} else if (path === true) {
			path = entry.memory + ';';
			if (entry.library) {
				path += entry.library + ';';
			}
			path += entry.file;
			obj = other;
		} else {
			path = entry.memory + ';' + path;
			obj = selected;
		}
		path = path.split(/;+/);
		let entries;
		for (let name of path) {
			if (!obj.sub[name]) {
				obj.sub[name] = { entries: [], sub: {} };
			}
			entries = obj.sub[name].entries;
			obj = obj.sub[name];
		}
		entries.push(entry);
	}

	return [selected, other];
}


function formatSize(x) {
	if (x < 1024) {
		return `${x}`;
	} else if (x < 1024 * 1000) {
		return `${NUMBER_FORMAT_3.format(x / 1024)}KB (${x})`;
	} else if (x < 1024 * 1024) {
		return `${NUMBER_FORMAT_4.format(x / 1024)}KB (${x})`;
	} else {
		return `${NUMBER_FORMAT_3.format(x / 1024 / 1024)}MB (${x})`;
	}
}


function getStats(obj, details, ind) {
	ind = ind || '';
	let totalSize = 0;
	let text = '';
	let subs = [];
	for (let subName in obj.sub) {
		subs.push([subName, ...getStats(obj.sub[subName], details, `${ind}    `)]);
	}
	let entries = obj.entries.slice();
	entries.sort((a, b) => b.size - a.size);
	for (let entry of entries) {
		totalSize += entry.size;
		if (details) {
			text += `${ind}${entry.sec}: ${formatSize(entry.size)}    @0x${entry.addr.toString(16)}\n`;
		}
	}
	subs.sort((a, b) => b[2] - a[2]);
	for (let [subName, subText, subSize] of subs) {
		totalSize += subSize;
		text += `${ind}${subName}:`;
		text += subText;
	}
	if (text != '') {
		text = ` ${formatSize(totalSize)}\n${text}`;
	} else {
		text = ` ${formatSize(totalSize)}\n`;
	}
	return [text, totalSize];
}


function readFilterFunction(file) {
	try {
		let __rres_;
		let js = fs.readFileSync(file, 'utf-8');
		eval(js + ';__rres_=filter;');
		return __rres_;
	} catch (ex) {
		die('Cannot read filter script file');
	}
}

function printHelp(invalid) {
	if (invalid) {
		console.error('Invalid parameters.');
	}
	console.log(
		`
Usage: ${argv[0]} ${path.basename(__filename)} options map_file

Print memory usage report based on GCC-generated map file.

Options:
    -h --help             Print this help message.
    -f --filter <script>  Use a javascript file for filtering and
                          categorizing symbols.
    --no-details          Skip details in the report.
    --no-uncategorized    Skip uncategorized symbols in the report.
`
	);
	if (invalid) {
		process.exit(1);
	}
}

function main() {

	let filterFile = null;
	let mapFile = null;
	let noDetails = false;
	let noUncategorized = false;

	for (let i = 2; i < argv.length; i++) {
		switch (argv[i]) {
			case '--help':
			case '-h':
				printHelp();
				return;
			case '--filter':
			case '-f':
				if (filterFile !== null || i + 1 >= argv.length) {
					printHelp(true);
				}
				filterFile = argv[i + 1];
				i++;
				break;
			case '--no-details':
				noDetails = true;
				break;
			case '--no-uncategorized':
				noUncategorized = true;
				break;
			default:
				if (mapFile !== null) {
					printHelp(true);
				}
				mapFile = argv[i];
				break;
		}
	}

	if (!mapFile) {
		printHelp(true);
	}

	if (filterFile) {
		filterFunction = readFilterFunction('filter.js');
	}

	let map, memories;

	try {
		[map, memories] = parseMap(mapFile);
	} catch (ex) {
		die(ex.toString());
	}

	map = removeOverlaps(map, memories);
	let [selected, other] = categorize(map);
	if (selected.entries.length || Object.keys(selected.sub).length) {
		console.log('Categorized entries: ' + getStats(selected, false)[0]);
		if (!noUncategorized) {
			console.log('Other entries: ' + getStats(other, false)[0]);
		}
		if (!noDetails) {
			console.log('');
			console.log('-------------------------------------------- DETAILS --------------------------------------------');
			console.log('');
			console.log('Categorized entries: ' + getStats(selected, true)[0]);
			if (!noUncategorized) {
				console.log('Other entries: ' + getStats(other, true)[0]);
			}
		}
	} else {
		if (noUncategorized) {
			console.log('No categorized entries found');
			return;
		}
		console.log('Content: ' + getStats(other, false)[0]);
		if (!noDetails) {
			console.log('');
			console.log('-------------------------------------------- DETAILS --------------------------------------------');
			console.log('');
			console.log('Content: ' + getStats(other, true)[0]);
		}
	}
}


try {
	main();
} catch (ex) {
	die(`Unhandled exception: ${ex.toString()}`);
}
