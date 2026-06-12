import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Input, PasswordInput, Button, Card, Toggle } from '../../components/ui';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

export const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const usernameValid = useMemo(
    () => /^[a-zA-Z0-9_]{3,30}$/.test(formData.username),
    [formData.username]
  );

  const passwordsMatch = useMemo(
    () =>
      formData.password === formData.confirmPassword &&
      formData.password.length > 0,
    [formData.password, formData.confirmPassword]
  );

  const passwordStrengthScore = useMemo(() => {
    const p = formData.password;

    if (p.length < 8) return 0;

    const hasL = /[a-z]/.test(p);
    const hasU = /[A-Z]/.test(p);
    const hasN = /[0-9]/.test(p);

    if (hasL && hasU && hasN) return 3;
    if ((hasL || hasU) && hasN) return 2;

    return 1;
  }, [formData.password]);


  const isFormValid =
    usernameValid &&
    passwordsMatch &&
    passwordStrengthScore >= 2 &&
    formData.terms;


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    await register(formData);
  };


  return (
    <div className="
      h-screen
      bg-[var(--bg-tertiary)]
      flex
      items-center
      justify-center
      px-4
      overflow-hidden
    ">


      <div className="
        w-full
        max-w-5xl
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-5
        items-center
        scale-[0.90]
      ">


        {/* REGISTER CARD */}

        <Card
          className="
            w-full
            max-w-[420px]
            mx-auto
            shadow-lg
            border-[var(--border)]
            overflow-hidden
          "
          padding="sm"
        >



          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >


            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
              disabled={isLoading}
              hint="3-30 characters, letters, numbers, underscores only."
              error={
                formData.username && !usernameValid
                  ? "Invalid username format"
                  : undefined
              }
            />


            <div>

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />

              <PasswordStrength
                password={formData.password}
              />

            </div>



            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={isLoading}
              error={
                formData.confirmPassword && !passwordsMatch
                  ? "Passwords do not match"
                  : undefined
              }
            />



            <div className="
              pt-2
              border-t
              border-[var(--border)]
            ">

              <Toggle
                checked={formData.terms}
                onChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    terms: checked
                  }))
                }
                label="I understand that if I lose my Password, my data cannot be recovered."
                size="sm"
              />

            </div>



            {error && (
              <div className="
                p-3
                bg-[var(--danger-subtle)]
                border
                border-[var(--danger)]
                text-[var(--danger-text)]
                text-sm
                rounded-md
              ">
                {error}
              </div>
            )}



            <Button
              type="submit"
              variant="primary"
              className="
                w-full
                h-10
                text-base
                font-semibold
              "
              loading={isLoading}
              disabled={!isFormValid}
            >
              Create Account
            </Button>


          </form>




          <div className="
            mt-4
            text-center
            text-sm
            text-[var(--text-secondary)]
          ">

            Already have an account?{" "}

            <Link
              to="/login"
              className="
                text-[var(--accent)]
                font-medium
                hover:underline
              "
            >
              Sign in
            </Link>

          </div>


        </Card>




        {/* SECURITY PANEL */}

        <div className=" hidden lg:flex h-[520px] rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-md items-center justify-center p-8 relative overflow-hidden">
          {/* Background Image Tag */}
          <img
  src="../../../registre_page.svg"
  alt="Background graphic"
  className="
    absolute
    bottom-0
    left-0
    w-full
    
    object-contain
    pointer-events-none
  "
/>

          {/* Optional Overlay to protect text legibility */}
          <div className="absolute inset-0 bg-[var(--bg-secondary)]/70 pointer-events-none"></div>

          {/* Content container layered above the image */}
            <div
  className="
    absolute
    top-8
    left-1/2
    -translate-x-1/2
    z-10
    flex
    flex-col
    items-center
    text-center
  "
>
  <Link
    to="/"
    className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
  >
    <img
      src="/logo.svg"
      alt="Passwordsaver Logo"
      className="h-14 w-14 object-contain"
    />

<h1 className="text-3xl font-bold text-[var(--text-primary)]">
        passwordsaver
    </h1>
  </Link>

  <p className="text-base text-[var(--text-secondary)] mt-1">
    Create your secure vault
  </p>
</div>
          </div>
        </div>


      </div>


    
  );
};