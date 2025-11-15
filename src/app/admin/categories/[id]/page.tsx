// This is a new file that acts as a server component wrapper.
import { EditCategoryPage } from "./client-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <EditCategoryPage id={id} />;
};

export default Page;
