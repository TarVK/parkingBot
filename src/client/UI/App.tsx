import {jsx} from "@emotion/core";
import {FC} from "react";
import {Route, Router, Switch} from "react-router-dom";
import {SearchTest} from "./SearchTest";
import {LotCreatorView} from "./lotCreator/LotCreatorView";

export const App: FC = () => (
    <Router>
        <Switch>
            <Route path="/edit">
                <LotCreatorView />
            </Route>
            <Route path="/">
                <SearchTest />
            </Route>
        </Switch>
    </Router>
);
