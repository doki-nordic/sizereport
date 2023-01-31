import { Navbar, NavbarGroup, Alignment, NavbarHeading, Button, Intent, NavbarDivider, Tree, TreeNodeInfo, Icon } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";
import icons from "./CustomIcons";
import { State, ContentSorting, setContentSorting, ContentNode, ViewDetails, ContentType, View, selectNode, setNodeExpanded, Memory, setExpandAll } from "./store";
import { getItemIcon, getMemoryIcon } from "./Toolbox";
import { printAddress, printSize, printSizeExact } from "./Utils";

function createIcon(node: ContentNode) {
    return (
        <Tooltip2
            content={
                <table>
                    {node.type === ContentType.LIBRARY && (
                        <tr>
                            <td><b>Library:</b></td>
                            <td colSpan={2}><b>{node.name}</b></td>
                        </tr>)}
                    {node.type === ContentType.FILE && (
                        <tr>
                            <td><b>File:</b></td>
                            <td colSpan={2}><b>{node.name}</b></td>
                        </tr>)}
                    {node.type === ContentType.SYMBOL && (
                        <tr>
                            <td><b>Symbol:</b></td>
                            <td colSpan={2}><b>{node.name}</b></td>
                        </tr>)}
                    {node.path && (
                        <tr>
                            <td>Directory:</td>
                            <td colSpan={2}>{node.path}</td>
                        </tr>)}
                    {Object.entries(node.memory).map(([memName, mem]) => (
                        <tr key={memName}>
                            <td><Icon icon={getMemoryIcon(memName)} /> {memName}:</td>
                            <td>{printSizeExact(mem.size)}      </td>
                            <td>{printAddress(mem.startAddress)} … {printAddress(mem.endAddress)}</td>
                        </tr>))}
                </table>
            }>
            <Icon className="bp4-tree-node-icon" icon={getItemIcon(node.type)} />
        </Tooltip2>
    )
}

enum ExpandedFlags {
    NONE = 0,
    EXPANDED = 1 << 0,
    COLLAPSED = 1 << 1,
};

function addNodeToList(list: TreeNodeInfo<ContentNode>[], node: ContentNode, view: View, selectedMemory: Memory, stats: { size: number, expandedFlags: ExpandedFlags }): void {

    if (!(selectedMemory.name in node.memory)) {
        return;
    }

    let thisSize = (node.type === ContentType.SYMBOL) ? node.memory[selectedMemory.name].size : 0;
    let expandedFlags = ExpandedFlags.NONE;

    let visible = (node.type === ContentType.LIBRARY && view.details.libraries)
        || (node.type === ContentType.FILE && view.details.files)
        || (node.type === ContentType.SYMBOL && view.details.symbols);

    if (visible) {
        if (!(selectedMemory.name in node.memory)) {
            return;
        }
        let treeNode: TreeNodeInfo<ContentNode> = {
            id: node.id,
            label: node.path ? (<>{node.name}&nbsp;<span className="library-path">({node.path})</span></>) : node.name,
            icon: createIcon(node),
            isSelected: node.id === view.selectedNode,
            nodeData: node,
        };
        list.push(treeNode);
        let subList: TreeNodeInfo<ContentNode>[] = [];
        let subStats = { size: 0, expandedFlags: ExpandedFlags.NONE };
        for (let sub of node.nodes) {
            addNodeToList(subList, sub, view, selectedMemory, subStats);
        }
        thisSize += subStats.size;
        sortNodes(subList, view.sorting, selectedMemory);
        if (subList.length > 0) {
            treeNode.childNodes = subList;
            treeNode.isExpanded = node.isExpanded;
            expandedFlags |= node.isExpanded ? ExpandedFlags.EXPANDED : ExpandedFlags.COLLAPSED;
        }
        treeNode.secondaryLabel = createSizeLabel(thisSize, node.memory[selectedMemory.name].size);
    } else {
        for (let sub of node.nodes) {
            addNodeToList(list, sub, view, selectedMemory, stats);
        }
    }

    stats.size += thisSize;
    stats.expandedFlags |= expandedFlags;
}

const selectListNodes = createSelector( // TODO: is it needed? It will recalulate every time?
    (state: State) => state.nodes,
    (state: State) => state.view,
    (state: State) => state.memories,
    (nodes, view, memories): [TreeNodeInfo<ContentNode>[], number, ExpandedFlags] => {
        let list: TreeNodeInfo<ContentNode>[] = [];
        let memory = memories[view.currentMemory];
        let stats = { size: 0, expandedFlags: ExpandedFlags.NONE };
        for (let node of nodes) {
            addNodeToList(list, node, view, memory, stats);
        }
        sortNodes(list, view.sorting, memory);
        return [list, stats.size, stats.expandedFlags];;
    }
);


export default function ContentList() {
    const sorting = useSelector((state: State) => state.view.sorting);
    const [nodes, size, expandedFlags] = useSelector(selectListNodes);
    const dispatch = useDispatch();
    return (<>
        <div className="l-content-toolbar">
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavbarHeading>Content    <small>{printSizeExact(size)}</small></NavbarHeading>
                </NavbarGroup>
                <NavbarGroup align={Alignment.RIGHT}>
                    <Button text="Size" icon={icons.SortNumericalDesc}
                        intent={sorting === ContentSorting.SIZE ? Intent.PRIMARY : Intent.NONE}
                        onClick={() => dispatch(setContentSorting(ContentSorting.SIZE))} />
                    <Button text="Name" icon={icons.SortAlphabetical}
                        intent={sorting === ContentSorting.NAME ? Intent.PRIMARY : Intent.NONE}
                        onClick={() => dispatch(setContentSorting(ContentSorting.NAME))} />
                    <Button text="Address" icon={icons.Sort}
                        intent={sorting === ContentSorting.ADDRESS ? Intent.PRIMARY : Intent.NONE}
                        onClick={() => dispatch(setContentSorting(ContentSorting.ADDRESS))} />
                    <NavbarDivider />
                    <Button icon={expandedFlags === ExpandedFlags.COLLAPSED ? icons.ExpandAll : icons.CollapseAll}
                        onClick={() => dispatch(setExpandAll(expandedFlags === ExpandedFlags.COLLAPSED))}
                    />
                </NavbarGroup>
            </Navbar>
        </div>
        <div className="l-content-content">
            <Tree contents={nodes}
                onNodeClick={node => dispatch(selectNode(node.nodeData))}
                onNodeExpand={node => dispatch(setNodeExpanded([node.nodeData, true]))}
                onNodeCollapse={node => dispatch(setNodeExpanded([node.nodeData, false]))}
            />
        </div>
    </>);
}

function sortNodes(list: TreeNodeInfo<ContentNode>[], sorting: ContentSorting, selectedMemory: Memory) {
    switch (sorting) {
        case ContentSorting.SIZE:
            list.sort((a, b) => b.nodeData!.memory[selectedMemory.name]?.size - a.nodeData!.memory[selectedMemory.name]?.size);
            break;
        case ContentSorting.ADDRESS:
            list.sort((a, b) => a.nodeData!.memory[selectedMemory.name]?.startAddress - b.nodeData!.memory[selectedMemory.name]?.startAddress);
            break;
        default:
            list.sort((a, b) => a.nodeData!.name.localeCompare(b.nodeData!.name));
            break;
    }
}

function createSizeLabel(filteredSize: number, size: number) {
    if (filteredSize === size) {
        return (<b className="nowrap">{printSizeExact(size)}</b>);
    } else {
        return (<><span className="nowrap"><b>{printSize(filteredSize)}</b> of {printSize(size)}</span></>);
    }
}

