/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { env } from "@/env";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.formData();
  const req = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PINATA_JWT}`,
    },
    body: data,
  });
  const response = await req.json();
  return NextResponse.json(response);
}
