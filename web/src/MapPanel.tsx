import { Alignment, Boundary, BreadcrumbProps, Button, Intent, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tree } from "@blueprintjs/core";
import { Breadcrumbs2 } from "@blueprintjs/popover2";
import icons from "./CustomIcons";
import { ContentSorting, setContentSorting, setExpandAll, selectNode, setNodeExpanded } from "./store";
import { printSizeExact } from "./Utils";


const BREADCRUMBS: BreadcrumbProps[] = [
    { href: "/users", icon: "folder-close", text: "Users" },
    { href: "/users/janet", icon: "folder-close", text: "Janet" },
    { href: "/users/janet", icon: "folder-close", text: "Janet" },
    { href: "/users/janet", icon: "folder-close", text: "Janet" },
    { href: "/users/janet", icon: "folder-close", text: "Janet" },
    { href: "/users/janet", icon: "folder-close", text: "Janet" },
    { icon: "document", text: "image.jpg" },
];

export default function MapPanel() {
    return (<>
        <div className="l-content-toolbar">
            <div style={{ position: "relative", zIndex: 11, top: 10, height: 0, maxHeight: 0 }}>
                <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
                    <div style={{ flexGrow: 0, width: 115, minWidth: 115 }}></div>
                    <div style={{ flexGrow: 1, flexShrink: 1, overflow: 'hidden' }}>
                        <Breadcrumbs2 collapseFrom={Boundary.START} items={BREADCRUMBS} />
                    </div>
                </div>
            </div>
            <Navbar>
                <NavbarGroup>
                    <NavbarHeading>Size Map</NavbarHeading>
                    <NavbarDivider />
                </NavbarGroup>
            </Navbar>
        </div>
        <div className="l-content-content">
            Not implemented yet.
        </div>
    </>);
}