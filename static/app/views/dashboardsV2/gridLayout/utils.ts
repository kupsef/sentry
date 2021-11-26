import {Layout} from 'react-grid-layout';

import localStorage from 'sentry/utils/localStorage';
import {Widget} from 'sentry/views/dashboardsV2/types';

const getLocalStorageKey = (organizationId: string, dashboardId: string) =>
  `grid-layout-${organizationId}-${dashboardId}`;

export const getDashboardLayout = (organizationId, dashboardId): Layout[] => {
  const savedLayoutString = localStorage.getItem(
    getLocalStorageKey(organizationId, dashboardId)
  );

  if (savedLayoutString) {
    return JSON.parse(savedLayoutString);
  }

  return [];
};

export const saveDashboardLayout = (
  organizationId: string,
  dashboardId: string,
  layout: Layout[]
) => {
  localStorage.setItem(
    getLocalStorageKey(organizationId, dashboardId),
    JSON.stringify(layout)
  );
};

export const reassignLayoutId = (savedWidgets: Widget[], layout: Layout, i: number) => {
  if (layout.i.startsWith('index')) {
    return {
      ...layout,
      i: `${savedWidgets[i].id}-${layout.i}`,
    };
  }
  return layout;
};