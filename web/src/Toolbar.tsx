
import { Alignment, Button, Classes, Intent, Navbar, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { useSelector, useDispatch } from 'react-redux';
import icons from './CustomIcons';
import { pascalCase } from "change-case";

import { setCurrentMemory, State, toggleViewDetail, ShowDetailsNames, toggleViewPanel } from "./store"
import { getItemIcon, getMemoryIcon } from './Toolbox';
import { Tooltip2 } from '@blueprintjs/popover2';
import { printAddress, printSize, printSizeExact } from './Utils';


export default function Toolbar() {

    const memories = useSelector((state: State) => state.memories);
    const currentMemory = useSelector((state: State) => state.view.currentMemory);
    const shownDetails = useSelector((state: State) => state.view.details);
    const shownPanels = useSelector((state: State) => state.view.panels);
    const dispatch = useDispatch();

    return (
        <Navbar className={Classes.DARK}>
            <NavbarGroup align={Alignment.LEFT}>
                {memories.map((mem, index) => (
                    <Tooltip2 key={index} content={
                        <table>
                            <tr>
                                <td>Start address:</td>
                                <td>{printAddress(mem.address)}</td>
                            </tr>
                            <tr>
                                <td>End address:</td>
                                <td>{printAddress(mem.address + mem.size)}</td>
                            </tr>
                            <tr>
                                <td>Size:</td>
                                <td>{printSizeExact(mem.size)}</td>
                            </tr>
                        </table>
                    }>
                        <Button
                            text={mem.name}
                            icon={getMemoryIcon(mem.name)}
                            intent={index === currentMemory ? Intent.PRIMARY : Intent.NONE}
                            onClick={() => {
                                dispatch(setCurrentMemory(index));
                            }} />
                    </Tooltip2>
                ))}
            </NavbarGroup>
            <NavbarGroup align={Alignment.LEFT}>
                <NavbarDivider />
                {Object.keys(shownDetails).map(name => (
                    <Button key={name}
                        text={pascalCase(name)}
                        icon={getItemIcon(name)}
                        intent={shownDetails[name as ShowDetailsNames] ? Intent.PRIMARY : Intent.NONE}
                        onClick={() => {
                            dispatch(toggleViewDetail(name as ShowDetailsNames));
                        }}
                    />
                ))}
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
                <Button icon="filter" intent={shownPanels.filters ? Intent.PRIMARY : Intent.NONE} onClick={() => dispatch(toggleViewPanel('filters'))} />
                <Button icon="properties" intent={shownPanels.list ? Intent.PRIMARY : Intent.NONE} onClick={() => dispatch(toggleViewPanel('list'))} />
                <Button icon="control" intent={shownPanels.map ? Intent.PRIMARY : Intent.NONE} onClick={() => dispatch(toggleViewPanel('map'))} />
            </NavbarGroup>
        </Navbar>
    );
}
