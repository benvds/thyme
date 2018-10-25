// @flow

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import TimeSheet from 'sections/TimeSheet';
import Projects from 'sections/Projects';
import Settings from 'sections/Settings';

import Loading from './components/Loading';

const Reports = Loadable({
  loader: () => import('./sections/Reports'),
  loading: Loading,
});

function Routes() {
  return (
    <Switch>
      <Route path="/reports/:reportId?" component={Reports} />
      <Route path="/projects" component={Projects} />
      <Route path="/settings" component={Settings} />
      <Route exact path="/" component={TimeSheet} />
    </Switch>
  );
}

export default Routes;
