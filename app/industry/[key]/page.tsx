// 공통 품목 라우트(/industry/<key>). 레지스트리에 없는 키는 서버에서 404로 끊고, 있으면 셸이 경로를 보고 그 품목 페이지를 고른다.
import { notFound } from 'next/navigation';
import registry from '../../../lib/industry-items.json';
import Shell from '../../[category]/page';

const KEYS = new Set(registry.items.filter((item) => !('route' in item) || !item.route).map((item) => item.key));

export default async function IndustryItemPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!KEYS.has(key)) notFound();
  return <Shell />;
}
