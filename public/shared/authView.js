export const showLoggedOutAuthView = ({ authSplit, loginSection, registrationSection }) => {
  authSplit.classList.remove('hidden');
  loginSection.classList.remove('hidden');
  registrationSection.classList.add('hidden');
};

export const showRegistrationAuthView = ({ authSplit, loginSection, registrationSection }) => {
  authSplit.classList.remove('hidden');
  loginSection.classList.add('hidden');
  registrationSection.classList.remove('hidden');
};

export const showLoggedInPrivateView = ({
  authSplit,
  clearNotice,
  loginSection,
  registrationSection,
  privateArea,
  renderTabs,
  defaultTab
}) => {
  authSplit.classList.add('hidden');
  clearNotice();
  loginSection.classList.add('hidden');
  registrationSection.classList.add('hidden');
  privateArea.classList.remove('hidden');
  renderTabs(defaultTab);
};

export const showLoggedInDashboardView = ({
  authSplit,
  clearNotice,
  loginSection,
  dashboard
}) => {
  authSplit.classList.add('hidden');
  clearNotice();
  loginSection.classList.add('hidden');
  dashboard.classList.remove('hidden');
};
