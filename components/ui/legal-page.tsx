import { formatDate } from "@/components/blog/post-meta";
import { PageHeader } from "@/components/ui/page-header";
import { Prose } from "@/components/ui/prose";

export function LegalPage({
  title,
  updated,
  content,
}: {
  title: string;
  updated: string;
  content: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={<>Last updated <time dateTime={updated}>{formatDate(updated)}</time></>}
      />
      <div className="container-page py-8 sm:py-12">
        <div className="max-w-3xl">
          <Prose content={content} />
        </div>
      </div>
    </>
  );
}
