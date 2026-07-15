import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { passwordsMatchValidator } from '../../../shared/utils/passwords-match.validator';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { LoginResponseType } from '../../../../types/login-response.type';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  standalone: false
})
export class SignupComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        passwordRepeat: ['', [Validators.required]],
        agreement: [false, [Validators.requiredTrue]]
      },
      { validators: passwordsMatchValidator() }
    );

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = returnUrl || '/';
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get passwordRepeat() {
    return this.form.get('passwordRepeat');
  }

  get agreement() {
    return this.form.get('agreement');
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, passwordRepeat } = this.form.getRawValue() as {
      email: string;
      password: string;
      passwordRepeat: string;
    };

    this.authService.signup(email, password, passwordRepeat).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: DefaultResponseType | LoginResponseType) => {
        if (!this.authService.isLoginResponse(response)) {
          this.errorMessage = response.message || 'Не удалось зарегистрироваться. Попробуйте ещё раз.';
          return;
        }

        this.authService.setTokens(response.accessToken, response.refreshToken);
        this.authService.userId = response.userId;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error: HttpErrorResponse | Error) => {
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private extractErrorMessage(error: HttpErrorResponse | Error): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = (error.error as DefaultResponseType | null)?.message;
      if (backendMessage) {
        return backendMessage;
      }
      if (error.message) {
        return error.message;
      }
    } else if (error.message) {
      return error.message;
    }

    return 'Не удалось зарегистрироваться. Попробуйте ещё раз.';
  }
}
