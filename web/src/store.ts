import { createSlice, configureStore, PayloadAction, createSelector } from '@reduxjs/toolkit';
import exampleMapFile from './ExampleMap';
import { parseMap } from './MapParser';

export enum ContentSorting {
    SIZE,
    NAME,
    ADDRESS,
};

export enum ContentType {
    LIBRARY,
    FILE,
    SYMBOL,
};

export interface MemoryInfo {
    startAddress: number;
    endAddress: number;
    size: number;
}

export interface ContentNode {
    id: number;
    type: ContentType;
    name: string;
    section?: string;
    path?: string;
    nodes: ContentNode[];
    isExpanded: boolean;
    indexPath: number[];
    memory: { [key: string]: MemoryInfo };
}

export interface ViewDetails {
    libraries: boolean;
    files: boolean;
    symbols: boolean;
}

export interface ViewPanels {
    list: boolean;
    filters: boolean;
    map: boolean;
}

export interface View {
    details: ViewDetails;
    panels: ViewPanels;
    sorting: ContentSorting;
    selectedNode?: number;
    currentMemory: number;
}

export interface Memory {
    name: string;
    address: number;
    size: number;
}

export interface State {
    memories: Memory[];
    nodes: ContentNode[];
    view: View;
}

const initialState: State = {
    memories: [
        { name: 'Loading...', address: 0, size: 0 }
    ],
    nodes: [
    ],
    view: {
        details: {
            libraries: true,
            files: true,
            symbols: true,
        },
        panels: {
            list: true,
            filters: false,
            map: true,
        },
        sorting: ContentSorting.SIZE,
        selectedNode: 1,
        currentMemory: 0,
    }
};

export type ShowDetailsNames = keyof typeof initialState.view.details;
export type ShowPanelsNames = keyof typeof initialState.view.panels;

export function nodeFromIndexPath(state: State, indexPath: number[]): ContentNode {
    let list: ContentNode[] = state.nodes;
    let node: ContentNode;
    let i = 0;
    do {
        node = list[indexPath[i]];
        list = node.nodes;
        i++;
    } while (i < indexPath.length);
    return node;
}

const appSlice = createSlice({
    name: 'root',
    initialState: initialState,
    reducers: {
        setCurrentMemory: (state, action: PayloadAction<number>) => {
            state.view.currentMemory = action.payload;
        },
        toggleViewDetail: (state, action: PayloadAction<ShowDetailsNames>) => {
            state.view.details[action.payload] = !state.view.details[action.payload];
            let anything = state.view.details.files || state.view.details.libraries || state.view.details.symbols;
            if (!anything) {
                state.view.details[action.payload] = true;
            }
        },
        toggleViewPanel: (state, action: PayloadAction<ShowPanelsNames>) => {
            state.view.panels[action.payload] = !state.view.panels[action.payload];
            let anything = state.view.panels.list || state.view.panels.map;
            if (!anything) {
                state.view.panels[action.payload] = true;
            }
        },
        setContentSorting: (state, action: PayloadAction<ContentSorting>) => {
            state.view.sorting = action.payload;
        },
        selectNode: (state, action: PayloadAction<ContentNode | undefined>) => {
            state.view.selectedNode = action.payload ? action.payload.id : -1;
        },
        setNodeExpanded: (state, action: PayloadAction<[ContentNode | undefined, boolean]>) => {
            if (action.payload[0]) {
                let node = nodeFromIndexPath(state, action.payload[0].indexPath);
                node.isExpanded = action.payload[1];
            }
        },
        setExpandAll: (state, action: PayloadAction<boolean>) => {
            expandAll(state.nodes, action.payload);
        },
        setMap: (state, action: PayloadAction<string>) => {
            console.log(state.memories);
            mapToState(state, action.payload);
        },
    }
});

function expandAll(nodes: ContentNode[], expand: boolean) {
    for (let node of nodes) {
        if (node.nodes.length > 0) {
            node.isExpanded = expand;
            expandAll(node.nodes, expand);
        }
    }
}

export const { setCurrentMemory, toggleViewDetail, toggleViewPanel, setContentSorting, selectNode, setNodeExpanded, setExpandAll, setMap } = appSlice.actions;

export const store = configureStore({
    reducer: appSlice.reducer
});

export function selectCurrentMemory(state: State) {
    return state.view.currentMemory;
}

function mapToState(state: State, map: string) {
    let [entries, memories] = parseMap(map);

    let idCounter = 1;
    let libraries: ContentNode[] = [];
    let librariesMap: Map<string, ContentNode> = new Map();
    let filesMap: Map<string, ContentNode> = new Map();
    let usedMemories: Set<string> = new Set();
    for (let entry of entries) {
        let library: ContentNode | undefined = undefined;
        let addToList: ContentNode[] = libraries;
        let indexPath: number[] = [];
        if (entry.library) {
            if (!librariesMap.has(entry.library)) {
                let name = entry.library;
                let path: string | undefined = undefined;
                let slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
                if (slash >= 0) {
                    path = name.substring(0, slash);
                    name = name.substring(slash + 1);
                }
                library = {
                    id: idCounter++,
                    type: ContentType.LIBRARY,
                    name: name,
                    path: path,
                    nodes: [],
                    isExpanded: false,
                    indexPath: [libraries.length],
                    memory: {},
                }
                librariesMap.set(entry.library, library);
                libraries.push(library);
            } else {
                library = librariesMap.get(entry.library);
            }
            addToList = library!.nodes;
            indexPath = library!.indexPath;
        }
        let file: ContentNode | undefined = undefined;
        if (entry.file) {
            let fileKey = `${entry.library}//${entry.file}`;
            if (!filesMap.has(fileKey)) {
                let name = entry.file;
                let path: string | undefined = undefined;
                let slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
                if (slash >= 0) {
                    path = name.substring(0, slash);
                    name = name.substring(slash + 1);
                }
                file = {
                    id: idCounter++,
                    type: ContentType.FILE,
                    name: name,
                    path: path,
                    nodes: [],
                    isExpanded: false,
                    indexPath: [...indexPath, addToList.length],
                    memory: {},
                };
                filesMap.set(fileKey, file);
                addToList.push(file);
            } else {
                file = filesMap.get(fileKey);
            }
            addToList = file!.nodes;
            indexPath = file!.indexPath;
        }
        let symbolNode: ContentNode = {
            id: idCounter++,
            type: ContentType.SYMBOL,
            name: entry.section,
            nodes: [],
            isExpanded: false,
            indexPath: [...indexPath, addToList.length],
            memory: {},
        };
        if (entry.loadMemory) {
            symbolNode.memory[entry.loadMemory] = {
                startAddress: (entry.loadAddress || 0),
                endAddress: (entry.loadAddress || 0) + entry.size,
                size: entry.size,
            };
        }
        symbolNode.memory[entry.memory] = {
            startAddress: entry.address,
            endAddress: entry.address + entry.size,
            size: entry.size,
        };
        addToList.push(symbolNode);
        for (let memName in symbolNode.memory) {
            usedMemories.add(memName);
            let memInfo = symbolNode.memory[memName];
            if (file) {
                if (!(memName in file.memory)) {
                    file.memory[memName] = { ...memInfo };
                } else {
                    let dst = file.memory[memName];
                    dst.startAddress = Math.min(dst.startAddress, memInfo.startAddress);
                    dst.endAddress = Math.max(dst.endAddress, memInfo.endAddress);
                    dst.size += memInfo.size;
                }
            }
            if (library) {
                if (!(memName in library.memory)) {
                    library.memory[memName] = { ...memInfo };
                } else {
                    let dst = library.memory[memName];
                    dst.startAddress = Math.min(dst.startAddress, memInfo.startAddress);
                    dst.endAddress = Math.max(dst.endAddress, memInfo.endAddress);
                    dst.size += memInfo.size;
                }
            }
        }
    }
    state.nodes = Array.from(libraries.values());

    let oldMemoryName = state.memories[state.view.currentMemory].name;
    let currentMemory = 0;
    state.memories = [];
    for (let name in memories) {
        if (usedMemories.has(name)) {
            if (name === oldMemoryName) {
                currentMemory = state.memories.length;
            }
            state.memories.push({
                name: name,
                address: memories[name].address,
                size: memories[name].size,
            });
        }
    }
    if (state.memories.length === 0) {
        state.memories.push({ name: 'empty', address: 0, size: 0 });
    }
    state.view.currentMemory = currentMemory;
}

setTimeout(() => store.dispatch(setMap(exampleMapFile)), 1000);
setTimeout(() => console.log('ok'), 1000);
