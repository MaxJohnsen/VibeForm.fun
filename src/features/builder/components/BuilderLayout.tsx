import { ReactNode } from 'react';

interface BuilderLayoutProps {
  palette: ReactNode;
  canvas: ReactNode;
  properties: ReactNode;
}

export const BuilderLayout = ({ palette, canvas, properties }: BuilderLayoutProps) => {
  return (
    <div className="flex gap-6 p-6">
      <aside>{palette}</aside>
      <main className="flex-1 min-w-0">{canvas}</main>
      <aside>{properties}</aside>
    </div>
  );
};
