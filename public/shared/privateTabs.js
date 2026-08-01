export const defaultPrivateTab = 'events';

const validTabs = new Set([defaultPrivateTab, 'password']);

export const isPrivateTab = (tab) => validTabs.has(tab);

export const normalizePrivateTab = (tab) => (isPrivateTab(tab) ? tab : defaultPrivateTab);
