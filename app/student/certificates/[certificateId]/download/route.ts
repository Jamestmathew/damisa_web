import { authorizeAction } from "@/shared/security/action";
import { getCertificates } from "@/modules/student/features/certificates/services/certificates.service";
import { certificatePdf } from "@/shared/data/certificate-pdf";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  const user = await authorizeAction(["student"]);
  const { certificateId } = await params;
  const certificate = (await getCertificates()).find(
    (c) => c.id === certificateId,
  );
  if (!certificate)
    return new Response("Certificate not found", { status: 404 });
  return new Response(
    certificatePdf(
      user.name,
      certificate.courseTitle,
      certificate.credentialId,
      certificate.issuedAt,
    ),
    {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certificate.credentialId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}
