import type { LoaderFunctionArgs } from "@react-router/node";
import { db } from "~/database/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const image = await db.image.findUnique({
    where: { id },
  });

  if (!image || !image.blob) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(image.blob, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
