type PageProps = {
  params: Promise<{ pageId: string }>;
};

export default async function PageView({ params }: PageProps) {
  const { pageId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-h1 font-semibold">페이지 {pageId}</h1>
      <p className="mt-2 text-text-secondary">M2에서 구현 예정 (S-011 / S-012)</p>
    </div>
  );
}
