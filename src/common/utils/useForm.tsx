import { useState } from "react";
import { notification } from "antd";
import emailjs from 'emailjs-com';
import EMAIL_CONFIG from "../../config/email";

interface IValues {
  name: string;
  email: string;
  message: string;
}

const initialValues: IValues = {
  name: "",
  email: "",
  message: "",
};

type ValidateFunction = (values: IValues) => Partial<IValues>;

export const useForm = (validate: ValidateFunction, onSuccess?: () => void) => {
  const [formState, setFormState] = useState<{
    values: IValues;
    errors: Partial<IValues>;
  }>({
    values: { ...initialValues },
    errors: {},
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = formState.values;
    const errors = validate(values);
    setFormState((prevState) => ({ ...prevState, errors }));

    try {
      if (Object.values(errors).every((error) => !error)) {
        const response = await emailjs.send(
          EMAIL_CONFIG.SERVICE_ID,
          EMAIL_CONFIG.TEMPLATE_ID,
          {
            from_name: values.name,
            from_email: values.email,
            message: values.message,
          },
          EMAIL_CONFIG.USER_ID
        );

        if (response.status === 200) {
          setFormState({
            values: { ...initialValues },
            errors: {},
          });

          notification.success({
            message: "Success",
            description: "Your message has been sent!",
          });

          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error('Failed to send email');
        }
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to submit form. Please try again later.",
      });
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      values: {
        ...prevState.values,
        [name]: value,
      },
      errors: {
        ...prevState.errors,
        [name]: "",
      },
    }));
  };

  return {
    handleChange,
    handleSubmit,
    values: formState.values,
    errors: formState.errors,
  };
};