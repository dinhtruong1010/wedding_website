type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export default async function handler(_req: unknown, res: VercelResponse) {
  const result: Record<string, unknown> = { hasStoreId: Boolean(process.env.BLOB_STORE_ID) };

  try {
    const { list } = await import("@vercel/blob");
    result.imported = true;
    const page = await list({ limit: 1 });
    result.listed = true;
    result.count = page.blobs.length;
  } catch (error) {
    result.imported = result.imported ?? false;
    result.error = error instanceof Error ? error.name : "UnknownError";
    result.message = error instanceof Error ? error.message.slice(0, 180) : "Blob check failed";
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(result));
}
