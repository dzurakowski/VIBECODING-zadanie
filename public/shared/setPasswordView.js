export const showValidSetPasswordView = ({ form, notice }) => {
  form.classList.remove('hidden');
  notice.textContent = '';
  notice.className = 'notice hidden';
};

export const showInvalidSetPasswordView = ({ form, notice, message }) => {
  notice.textContent = message;
  notice.className = 'notice error';
  form.classList.add('hidden');
};

