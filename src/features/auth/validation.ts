const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "이메일을 입력하세요.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }

  if (!values.password) {
    errors.password = "비밀번호를 입력하세요.";
  }

  return errors;
}

export function validateSignupForm(values: SignupFormValues): SignupFormErrors {
  const errors: SignupFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) {
    errors.name = "이름을 입력하세요.";
  }

  if (!email) {
    errors.email = "이메일을 입력하세요.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }

  if (!values.password.trim()) {
    errors.password = "비밀번호를 입력하세요.";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }

  if (!values.passwordConfirm.trim()) {
    errors.passwordConfirm = "비밀번호 확인을 입력하세요.";
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

export function hasFormErrors<TFormErrors extends object>(errors: TFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
