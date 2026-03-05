import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations('Pages');

  // Define available pages
  const pages = ['about', 'contact', 'blog'];

  if (!pages.includes(slug)) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{t(slug + '.title')}</h1>
      <p>{t(slug + '.content')}</p>
    </div>
  );
}