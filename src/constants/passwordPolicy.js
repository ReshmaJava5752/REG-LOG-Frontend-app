// Single source of truth for the password complexity policy on the frontend.
//
// This mirrors com.example.registrationlogin.util.PasswordPolicy on the backend so that the
// client-side hint and the server-side rule can never drift apart. The rule is:
//
//   - at least 8 characters
//   - at least one uppercase letter (A-Z)
//   - at least one lowercase letter (a-z)
//   - at least one digit (0-9)
//   - at least one special character (@$!%*?&#)

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_SPECIAL_CHARACTERS = '@$!%*?&#';

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// Short placeholder shown inside the password input fields. It states the full rule so the user
// is not surprised by a server-side rejection after typing a password that only satisfies the
// length requirement.
export const PASSWORD_PLACEHOLDER = 'Min 8 chars: A-Z, a-z, 0-9, @$!%*?&#';

// Inline validation message shown when the password does not satisfy the policy.
export const PASSWORD_ERROR_MESSAGE =
  'Password must be at least 8 characters with uppercase, lowercase, digit, and special character (@$!%*?&#).';

// Individual rules, used to render a live checklist under the password input.
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A-Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a-z)',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'digit',
    label: 'One digit (0-9)',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: `One special character (${PASSWORD_SPECIAL_CHARACTERS})`,
    test: (value) => /[@$!%*?&#]/.test(value),
  },
];

/**
 * Checks whether the given password satisfies the complexity policy.
 */
export function isPasswordValid(value) {
  return typeof value === 'string' && PASSWORD_REGEX.test(value);
}
