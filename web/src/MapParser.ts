

export interface MapMemory {
    name: string;
    address: number;
    size: number;
}

export interface MapEntry {
    section: string,
    address: number,
    size: number,
    library: string,
    file: string,
    memory: string,
    loadAddress?: number,
    loadMemory?: string,
}

export type MapMemories = { [name: string]: MapMemory };

const GAP_LIMIT = 255;

let filterFunction = (entry: MapEntry) => { // TODO: implement as part of global filter functionality or an option
    return !entry.section.match(/^(\.debug|.comment|\.ARM\.attributes)/);
}

function memoryFromAddress(memories: MapMemories, address: number): MapMemory {
    let mem = memories['*undefined*'];
    for (let m of Object.values(memories)) {
        if (m.address <= address && address < m.address + m.size) {
            mem = m;
            break;
        }
    }
    return mem;
}


function addToMap(map: MapEntry[], entry: MapEntry) {
    if (filterFunction(entry)) {
        map.push(entry);
    }
}

function parseMapEntries(mapText: string): [MapEntry[], MapMemories] {

    let map: MapEntry[] = [];
    let memories: MapMemories = {};
    let loadAddrOffset: number | null = null;

    let m = mapText.match(/\r?\n\r?\nMemory Configuration\r?\n\r?\n/m);
    if (!m) throw Error('Cannot find "Memory Configuration".');
    let start = (m.index || 0) + m[0].length;
    let memConf = mapText.substring(start);
    m = memConf.match(/\r?\n\r?\n/m);
    if (!m) throw Error('Cannot find end of "Memory Configuration".');
    memConf = memConf.substring(0, m.index);

    m = mapText.match(/\r?\n\r?\nLinker script and memory map\r?\n\r?\n/m);
    if (!m) throw Error('Cannot find "Linker script and memory map".');
    start = (m.index || 0) + m[0].length;
    let memMap = mapText.substring(start);

    memConf.replace(/(\S+)[\t ]+(0x00000000[0-9A-F]{8})[\t ]+(0x00000000[0-9A-F]{8}).*\r?\n/img, (str, name, addrStr, sizeStr) => {
        let address = Number.parseInt(addrStr);
        let size = Number.parseInt(sizeStr);
        memories[name] = { name, address, size };
        return '';
    });
    memories['*undefined*'] = { name: '*undefined*', address: 0, size: 0x100000000 };

    memMap.replace(/\n([\t ]*)([^\s]+)\r?\n?[\t ]+(0x00000000[0-9A-F]{8})\s+(0x[0-9A-F]+)([\t ]+[^\r\n]+)?/img, (str, ind, section, addrStr, sizeStr, file) => {
        let address = Number.parseInt(addrStr);
        let size = Number.parseInt(sizeStr);
        if (ind == '') {
            let m;
            if (file && (m = file.match(/\s*load address[\t ]+(0x00000000[0-9A-F]{8})/im))) {
                loadAddrOffset = address - Number.parseInt(m[1]);
            } else {
                loadAddrOffset = null;
            }
            return '';
        }
        if (size == 0) return '';
        if (!file) {
            file = section == '*fill*' ? section : '*unknown*';
        }
        file = file.trim();
        let library = '';
        if ((m = file.match(/^(.+)\((.+)\)$/))) {
            library = m[1].trim();
            file = m[2].trim();
        }
        let entry: MapEntry = { section, address, size, library, file, memory: memoryFromAddress(memories, address).name };
        if (loadAddrOffset !== null) {
            entry.loadAddress = address - loadAddrOffset;
            entry.loadMemory = memoryFromAddress(memories, entry.loadAddress).name;
        }
        addToMap(map, entry);
        return '';
    });

    return [map, memories];
}


function removeOverlaps(map: MapEntry[], memories: MapMemories) {
    let mem: number[] = [];
    let newMap: MapEntry[] = [];
    for (let i = 0; i < map.length; i++) {
        let entry = map[i];
        let newEntry = { ...entry, size: 0 };
        for (let address = entry.address; address < entry.address + entry.size; address++) {
            if (address in mem) {
                if (newEntry.size > 0) {
                    newMap.push(newEntry);
                    newEntry = { ...entry, size: 0 };
                }
                newEntry.address = address + 1;
            } else {
                newEntry.size++;
                mem[address] = i;
            }
        }
        if (newEntry.size > 0) {
            newMap.push(newEntry);
        }
    }
    let prev: number | null = null;
    for (let strIndex of Object.keys(mem)) {
        let i = parseInt(strIndex);
        if (prev !== null) {
            let size = i - prev - 1;
            if (size <= GAP_LIMIT && size > 0) {
                addToMap(newMap, { section: '*gap*', address: prev + 1, size: size, library: '', file: '*gap*', memory: '' });
            }
        }
        prev = i;
    }
    return newMap;
}


export function parseMap(mapText: string): [MapEntry[], MapMemories] {
    let res = parseMapEntries(mapText);
    res[0] = removeOverlaps(res[0], res[1]);
    return res;
}
