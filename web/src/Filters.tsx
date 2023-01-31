import { Alignment, Button, Intent, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tree } from "@blueprintjs/core";
import icons from "./CustomIcons";
import { ContentSorting, setContentSorting, setExpandAll, selectNode, setNodeExpanded } from "./store";
import { printSizeExact } from "./Utils";


export default function Filters() {
    return (<>
        <div className="l-content-toolbar">
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavbarHeading>Filters</NavbarHeading>
                </NavbarGroup>
                <NavbarGroup align={Alignment.RIGHT}>
                    <NavbarDivider />
                </NavbarGroup>
            </Navbar>
        </div>
        <div className="l-content-content">
            Not implemented yet.
        </div>
    </>);
}