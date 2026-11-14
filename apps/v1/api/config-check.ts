import weddingContent from "./wedding-content-config.json";

type VercelResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export default function handler(_req: unknown, res: VercelResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ groom: weddingContent.groomName, galleryCount: weddingContent.galleryImages.length }));
}
