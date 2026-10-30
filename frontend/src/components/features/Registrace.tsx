//Chybí:
//Odeslání dat na backend (nevím jak se to dělá)
//Kontrola zda email již existuje v backendu, k čemuž potřebuju requestnout data
//přesměrování na hlavní stránku pokud sucess, error pokud ne (potřebuju jménou routy hl stránky)
//Google integrace je nad mé znalosti

'use client';
import React, { useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';

const robotoSlab = Roboto_Slab({
  subsets: ['latin', 'latin-ext'],
});

export default function Registrace() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleFirstNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFirstName(event.target.value);
  }

  function handleLastNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLastName(event.target.value);
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function handlePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handleConfirmPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('Zadaná hesla se neshodují');
      return;
    }

    const userData = {
      name: firstName,
      surname: lastName,
      email: email,
      password: password,
    };
    console.log(userData);
  }

  return (
    <>
      {/* Registration card */}
      <div className={`w-full max-w-md bg-[#ffffff] p-4 px-12 ${robotoSlab.className}`}>
        <h1 className="mb-8 text-center text-4xl font-bold text-[#575757]">Registrace</h1>
        {/* Registration form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* name input */}
          <div>
            <label className="font-bold text-[#575757]">
              Jméno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              maxLength={50}
              className="w-full border-2 border-[#8f98a9] bg-[#f3f2f0] p-2"
              required
              onInvalid={(event) => {
                event.currentTarget.setCustomValidity('Pole Jméno nesmí být prázdné.');
              }}
              onInput={(event) => {
                event.currentTarget.setCustomValidity('');
              }}
            ></input>
          </div>

          {/* surname input */}
          <div>
            <label className="font-bold text-[#575757]">
              Příjmení <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              maxLength={50}
              className="w-full border-2 border-[#8f98a9] bg-[#f3f2f0] p-2"
              required
              onInvalid={(event) => {
                event.currentTarget.setCustomValidity('Pole Příjmení nesmí být prázdné.');
              }}
              onInput={(event) => {
                event.currentTarget.setCustomValidity('');
              }}
            ></input>
          </div>

          {/* email input */}
          <div>
            <label className="font-bold text-[#575757]">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              maxLength={254}
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              className="w-full border-2 border-[#8f98a9] bg-[#f3f2f0] p-2"
              required
              onInvalid={(event) => {
                if (event.currentTarget.validity.valueMissing) {
                  event.currentTarget.setCustomValidity('Pole E-mail nesmí být prázdné.');
                } else {
                  event.currentTarget.setCustomValidity(
                    'Zadaný e-mail je v nesprávném tvaru. Příklad: jan.novak@gmail.com',
                  );
                }
              }}

              onInput={(event) => {
                event.currentTarget.setCustomValidity('');
              }}
            ></input>
          </div>

          {/* Password section */}
          <div>
            <div className="flex flex-col gap-0">
              <label className="font-bold text-[#575757]">
                Heslo <span className="text-red-500">*</span>
              </label>

              {/* Password input and eye button */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  minLength={8}
                  maxLength={128}
                  pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+"
                  title="Heslo musí obsahovat velké a malé písmeno, číslo a speciální znak."
                  className="w-full border-2 border-[#8f98a9] bg-[#f3f2f0] p-2"
                  required
                />

                <button
                  type="button"
                  onClick={handlePasswordVisibility}
                  aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 left-full ml-3 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* password check */}
          <div>
            <label className="font-bold text-[#575757]">
              Potvrzení hesla <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full border-2 border-[#8f98a9] bg-[#f3f2f0] p-2"
              required
            ></input>
          </div>

          <button
            type="submit"
            className="mt-4 bg-[#6bbb58] py-4 text-xl font-bold text-white shadow-[0_0_20px_5px_rgba(105,187,85,0.7)] transition-colors hover:bg-green-500"
          >
            Registrovat
          </button>

          <p className="text-center font-bold text-[#575757]">nebo</p>

          <button
            type="button"
            className="flex w-3/4 items-center justify-center gap-3 self-center bg-[#11231a] py-2 font-bold text-white shadow-[0_0_20px_5px_rgba(17,35,26,0.6)] transition-colors hover:bg-[#1c3629]"
          >
            <Image
              src="/GoogleIcon.png"
              alt=""
              width={500}
              height={511}
              style={{ width: '24px', height: 'auto' }}
            />
            Google
          </button>
        </form>
      </div>
    </>
  );
}
