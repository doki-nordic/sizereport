
import './App.css';

import Toolbar from "./Toolbar";


import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { State } from "./store";
import { useSelector } from "react-redux";
import ContentList from "./ContentList";
import Filters from './Filters';
import MapPanel from './MapPanel';

export default function App() {
    const panels = useSelector((state: State) => state.view.panels);
    return (<>
        <div id="l-toolbar">
            <Toolbar />
        </div>
        {(panels.list || panels.filters) && (<div id="l-below-toolbar">
            {panels.list && (<div id="l-content"><ContentList /></div>)}
            {panels.filters && (<div id="l-filters"><Filters /></div>)}
        </div>)}
        {panels.map && (<div id="l-map">
            <MapPanel />
        </div>)}
    </>);
}
