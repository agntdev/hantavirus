export type AuthMode = 'login' | 'profile' | 'register';

export const authModes: Array<{ label: string; value: AuthMode }> = [
  { label: 'Login', value: 'login' },
  { label: 'Register', value: 'register' },
  { label: 'Profile', value: 'profile' }
];

export const passwordRequirements = [
  'At least 12 characters',
  'Stored only as a server-side scrypt hash',
  'Session returned as a bearer token'
];

export function summarizeAuthSurface() {
  return {
    modes: authModes.length,
    oauthProviders: ['Google', 'GitHub', 'Facebook'].length,
    passwordRules: passwordRequirements.length
  };
}
