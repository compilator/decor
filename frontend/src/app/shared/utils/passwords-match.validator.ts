import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Marks passwordRepeat with passwordMismatch when values differ. */
export function passwordsMatchValidator(
  passwordControlName = 'password',
  repeatControlName = 'passwordRepeat'
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const passwordControl = group.get(passwordControlName);
    const repeatControl = group.get(repeatControlName);

    if (!passwordControl || !repeatControl) {
      return null;
    }

    const mismatch = passwordControl.value !== repeatControl.value;
    const currentErrors = { ...(repeatControl.errors || {}) };

    if (mismatch) {
      currentErrors['passwordMismatch'] = true;
      repeatControl.setErrors(currentErrors);
      return { passwordMismatch: true };
    }

    if (currentErrors['passwordMismatch']) {
      delete currentErrors['passwordMismatch'];
      repeatControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
    }

    return null;
  };
}
