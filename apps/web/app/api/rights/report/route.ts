import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamflix/database";
import { hasTrustedOrigin } from "@/lib/auth";
import { isRateLimited, requestAddress } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  if (await isRateLimited(`rights:${requestAddress(request)}`, 3, 3600)) return NextResponse.json({ error: "Trop de signalements depuis cette adresse. Réessayez plus tard." }, { status: 429 });
  let body: { contactEmail?: unknown; rightsHolderName?: unknown; contentUrl?: unknown; details?: unknown; consent?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }); }

  const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
  const rightsHolderName = typeof body.rightsHolderName === "string" ? body.rightsHolderName.trim() : "";
  const contentUrl = typeof body.contentUrl === "string" ? body.contentUrl.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  try {
    const parsedUrl = new URL(contentUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("Unsupported URL protocol");
  } catch { return NextResponse.json({ error: "Indiquez une adresse web HTTP(S) valide pour le contenu." }, { status: 400 }); }
  if (!/^\S+@\S+\.\S+$/.test(contactEmail) || rightsHolderName.length < 2 || rightsHolderName.length > 160 || details.length < 30 || details.length > 5000 || body.consent !== true) {
    return NextResponse.json({ error: "Vérifiez les informations, le détail du signalement et votre consentement." }, { status: 400 });
  }

  const report = await prisma.rightsReport.create({ data: { contactEmail, rightsHolderName, contentUrl, details } });
  return NextResponse.json({ received: true, reference: report.id }, { status: 201 });
}