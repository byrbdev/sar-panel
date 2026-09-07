'use client';
import { PropsWithChildren } from 'react';
import React from 'react';
import { isWindowAvailable } from 'utils/navigation';

interface AuthProps extends PropsWithChildren {}

export default function AuthLayout({ children }: AuthProps) {
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  return (
    <div className="relative float-right h-full min-h-screen w-full dark:!bg-navy-900">
      <main className="mx-auto min-h-screen">{children}</main>
    </div>
  );
}
