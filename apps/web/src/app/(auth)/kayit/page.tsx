'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@burcum/api-client';
import { Button, Card, Input } from '@burcum/ui';
import { ZODIAC_DATA, getZodiacSign } from '@burcum/shared';

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const detectedSign = formData.birthDate
    ? getZodiacSign(new Date(formData.birthDate))
    : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'İsim gerekli';
    } else if (formData.name.length < 2) {
      newErrors.name = 'İsim en az 2 karakter olmalı';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'En az bir büyük harf gerekli';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'En az bir rakam gerekli';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Doğum tarihi gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime || undefined,
        birthCity: formData.birthCity || undefined,
      });

      router.push('/');
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu',
      });
    }
  };

  return (
    <Card variant="glass" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Hesap Oluştur</h1>
        <p className="text-gray-400">Kişisel burç yorumlarına erişmek için kayıt ol</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {errors.form}
          </div>
        )}

        <Input
          label="İsim"
          name="name"
          type="text"
          placeholder="Adınız"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="ornek@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Şifre"
          name="password"
          type="password"
          placeholder="En az 8 karakter"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="Şifre Tekrar"
          name="confirmPassword"
          type="password"
          placeholder="Şifrenizi tekrar girin"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Doğum Tarihi"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            error={errors.birthDate}
          />

          <Input
            label="Doğum Saati (Opsiyonel)"
            name="birthTime"
            type="time"
            value={formData.birthTime}
            onChange={handleChange}
            hint="Yükselen burç için"
          />
        </div>

        <Input
          label="Doğum Yeri (Opsiyonel)"
          name="birthCity"
          type="text"
          placeholder="İstanbul"
          value={formData.birthCity}
          onChange={handleChange}
        />

        {detectedSign && (
          <div className="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-center">
            <span className="text-2xl mr-2">{ZODIAC_DATA[detectedSign].symbol}</span>
            <span className="font-semibold">{ZODIAC_DATA[detectedSign].turkishName}</span>
            <span className="text-gray-400 ml-2">burcusun</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={register.isPending}
          className="w-full"
        >
          Kayıt Ol
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="text-indigo-400 hover:text-indigo-300">
          Giriş Yap
        </Link>
      </div>
    </Card>
  );
}
