import React, { useCallback, useState } from 'react';
import useFormState from '../hooks/useFormState';

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
};

const defaultState = { email: '', password: '' };

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((state, submitted) => {
    const errors = {} as Record<string, string>;
    if (state.email || submitted) {
      if (!EMAIL_REGEX.test(state.email)) {
        errors.email = 'Gelieve een correct e-mailadres in te voeren';
      }
    }
    if (!state.password && submitted) {
      errors.password = 'Gelieve een wachtwoord in te voeren';
    }

    return errors;
  }, []);

  const submitHandler = useCallback(
    async (state) => {
      try {
        await onSubmit(state.email, state.password);
      } catch (e) {
        switch(e.code) {
          case 'auth/user-not-found': {
            setLoginErrors({
              email: 'Het e-mailadres kan niet gevonden worden.',
            });
            break;
          }
          case 'auth/wrong-password': {
            setLoginErrors({
              password: 'Het wachtwoord is niet correct.',
            });
            break;
          }
          default: throw e;
        }
      }
    },
    [onSubmit]
  );

  const {
    formState,
    formErrors,
    onInputChanged,
    onItemTouched,
    onSubmit: submitForm,
  } = useFormState(defaultState, submitHandler, validateForm);

  return (
    <form onSubmit={submitForm}>
      <input
        name="email"
        type="email"
        onChange={onInputChanged}
        onBlur={onItemTouched}
        placeholder="Email"
        value={formState.email || ''}
        autoComplete="on"
      />
      {formErrors.email && <span>{formErrors.email}</span>}
      {loginErrors.email && <span>{loginErrors.email}</span>}
      <input
        name="password"
        type="password"
        onChange={onInputChanged}
        onBlur={onItemTouched}
        placeholder="Password"
        value={formState.password || ''}
        autoComplete="on"
      />
      {formErrors.password && <span>{formErrors.password}</span>}
      {loginErrors.password && <span>{loginErrors.password}</span>}
      <button>Login</button>
    </form>
  );
}
