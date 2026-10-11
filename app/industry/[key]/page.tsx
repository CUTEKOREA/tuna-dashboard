// 공통 품목 라우트(/industry/<key>). 레지스트리에 없는 키는 서버에서 404로 끊고, 있으면 셸이 경로를 보고 그 품목 페이지를 고른다.
import { notFound } from 'next/navigation';
import { industryItem, isGenericIndustryItem } from '../../../lib/data/industry-registry';
import Shell from '../../[category]/page';

export default async function IndustryItemPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const item = industryItem(key);
  if (!item || !isGenericIndustryItem(item)) notFound();
  return <Shell />;
}
