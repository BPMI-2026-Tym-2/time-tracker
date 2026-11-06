import Image from 'next/image';

export function LoginBrand() {
  return (
    <div className="flex w-fit items-center gap-4">
      <div className="relative h-16 w-16">
        <Image
          src="/img/feather-logo.webp"
          width={64}
          height={64}
          alt="Logo"
          className="rounded-full object-cover"
        />
      </div>
      <h1 className="text-primary text-center text-4xl font-extrabold">ZÁZNAMNÍK</h1>
    </div>
  );
}
