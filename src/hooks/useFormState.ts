import { useEffect, useCallback, useMemo } from 'react';

import { useState } from 'react';

type FormStateReturn = {
  formState: Record<string, string>;
  formErrors: Record<string, string>;
  onInputChanged(event: React.ChangeEvent<HTMLInputElement>): void;
  touchedItems: Record<string, boolean>;
  onItemTouched(
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>
  ): void;
  onSubmit(event: React.FormEvent): void;
  submitted: boolean;
};

export default function useFormState(
  defaultValues: Record<string, string>,
  submitHandler: (currentState: Record<string, string>) => void,
  validator?: (currentState: Record<string, string>, submitted: boolean) => Record<string, string>,
): FormStateReturn {
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [touchedItems, setTouchedItems] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false); 
  /**
   * Updated default values means that our form should reset.
   */
  useEffect(() => {
    setFormState(defaultValues);
    setTouchedItems({});
  }, [defaultValues]);

  /**
   * @description Use this handler to update a form field.
   * This handler will set the "name" property in your form state to the given value of the element.
   */
  const onInputChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((formState) => {
        return {
          ...formState,
          [name]: value,
        };
      });
    },
    []
  );

  /**
   * @description Depending on the desired functionality, you can set the items touched on input changed OR on input blurred/focussed.
   */
  const onItemTouched = useCallback(
    (
      event:
        | React.FocusEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name } = event.target;
      setTouchedItems((currentlyTouched) => {
        return {
          ...currentlyTouched,
          [name]: true,
        };
      });
    },
    []
  );

  /**
   * @description If given, the function to calculate these errors should return
   * an object with the properly translated Strings to show as errors.
   * @example
   * {
   *    "name": "Name is required.",
   * }
   */
  const formErrors = useMemo(() => {
    return validator ? validator(formState, submitted) : {};
  }, [formState, validator, submitted]);

  const onSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(formErrors).length === 0 && Object.values(formState).every(value => !!value)) submitHandler(formState);
  }, [submitHandler, formErrors, formState]);

  return { formState, formErrors, onInputChanged, touchedItems, onItemTouched, onSubmit, submitted };
}
