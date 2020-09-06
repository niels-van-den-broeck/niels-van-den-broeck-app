import React from 'react';
import { render, fireEvent, waitForElement, wait } from '@testing-library/react';
import App from './App';
import firebaseMock from 'firebase/app';

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
    auth: jest.fn(),
  };
});
jest.mock('firebase/auth');

describe('App component', () => {
  let loginCall = jest.fn();

  beforeEach(() => {
    firebaseMock.auth.mockReturnValue({
      onAuthStateChanged: jest.fn(),
      signInWithEmailAndPassword: loginCall,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  })

  function renderComponent() {
    return render(<App />);
  }

  test('it renders the component', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('app-header')).toBeInTheDocument();
  });

  test('it logs in when completing the form correctly', async () => {
    const { getByPlaceholderText, getByRole, getByText } = renderComponent();

    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'test@email.com' },
    });
    fireEvent.change(getByPlaceholderText('Password'), {
      target: { value: 'testpassword' },
    });

    fireEvent.click(getByRole('button'));

    expect(loginCall).toHaveBeenCalledWith('test@email.com', 'testpassword');
  });

  test('it blocks the login when email is not valid or password is empty', () => {
    const { getByPlaceholderText, getByRole } = renderComponent();

    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'test@gmail.com' },
    });

    fireEvent.click(getByRole('button'));

    expect(loginCall).not.toHaveBeenCalled();

    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'test@gmaicom' },
    });

    fireEvent.change(getByPlaceholderText('Password'), {
      target: { value: 'testpassword' },
    });  

    fireEvent.click(getByRole('button'));

    expect(loginCall).not.toHaveBeenCalled();

    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'test@gmail.com' },
    });

    fireEvent.click(getByRole('button'));

    expect(loginCall).toHaveBeenCalled();
  });

  test('it shows a validationMessage when the email inputField has been touched and is incorrect', () => {
    const { queryByText, getByPlaceholderText } = renderComponent();

    expect(
      queryByText('Gelieve een correct e-mailadres in te voeren')
    ).not.toBeInTheDocument();

    const emailField = getByPlaceholderText('Email');

    fireEvent.change(emailField, { target: { value: 'notanemail' } });

    expect(
      queryByText('Gelieve een correct e-mailadres in te voeren')
    ).toBeInTheDocument();

    fireEvent.change(emailField, { target: { value: 'notanemail@email.com' } });

    expect(
      queryByText('Gelieve een correct e-mailadres in te voeren')
    ).not.toBeInTheDocument();
  });

  describe('when logging in with a non existing email', () => {
    beforeEach(() => {
      loginCall.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    });

    test('it shows the error', async () => {
      const { getByPlaceholderText, getByRole, queryByText } = renderComponent();
      fireEvent.change(getByPlaceholderText('Email'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(getByPlaceholderText('Password'), {
        target: { value: 'testpassword' },
      });
  
      fireEvent.click(getByRole('button'));
  
      await waitForElement(() => queryByText('Het e-mailadres kan niet gevonden worden.'))
    });

    test('it clears the error when submitting again with a different error', async () => {
      loginCall.mockRejectedValueOnce({ code: 'auth/wrong-password' })

      const { getByPlaceholderText, getByRole, queryByText } = renderComponent();
      fireEvent.change(getByPlaceholderText('Email'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(getByPlaceholderText('Password'), {
        target: { value: 'testpassword' },
      });
  
      fireEvent.click(getByRole('button'));
      await waitForElement(() => queryByText('Het e-mailadres kan niet gevonden worden.'))

      fireEvent.click(getByRole('button'));
      await waitForElement(() => queryByText('Het wachtwoord is niet correct.')) 

      expect(queryByText('Het e-mailadres kan niet gevonden worden.')).not.toBeInTheDocument();
    });
  });

  describe('logging in with an incorrect password', () => {
    beforeEach(() => {
      loginCall.mockRejectedValueOnce({ code: 'auth/wrong-password' })
    });

    test('it shows the error', async () => {
      const { getByPlaceholderText, getByRole, queryByText, getByText } = renderComponent();
      fireEvent.change(getByPlaceholderText('Email'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(getByPlaceholderText('Password'), {
        target: { value: 'testpassword' },
      });
  
      fireEvent.click(getByRole('button'));
  
      await waitForElement(() => queryByText('Het wachtwoord is niet correct.'))
    });
  });
});
