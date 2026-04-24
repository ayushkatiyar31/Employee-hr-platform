export const PASSWORD_RULES = [
  'At least 6 characters'
];

export const isStrongPassword = (password = '') => password.length >= 6;

export const getPasswordChecks = (password = '') => [
  { label: PASSWORD_RULES[0], passed: password.length >= 6 }
];

export const validatePasswordForSignup = (password = '') => {
  if (!password.trim()) {
    return 'Password is required';
  }

  if (!isStrongPassword(password)) {
    return 'Use at least 6 characters';
  }

  return '';
};

export const validateDateRange = (startDate, endDate, options = {}) => {
  const { allowPastStart = true, maxRangeDays } = options;

  if (!startDate || !endDate) {
    return 'Both start date and end date are required';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Please enter valid dates';
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (!allowPastStart) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return 'Start date cannot be in the past';
    }
  }

  if (end < start) {
    return 'End date cannot be earlier than start date';
  }

  if (maxRangeDays) {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days > maxRangeDays) {
      return `Date range cannot be more than ${maxRangeDays} days`;
    }
  }

  return '';
};

export const getInclusiveDayCount = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};
