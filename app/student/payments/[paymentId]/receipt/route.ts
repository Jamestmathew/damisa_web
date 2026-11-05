import { authorizeAction } from "@/shared/security/action";
import { getRecord } from "@/shared/data/records";
import { receiptPdf } from "@/shared/data/certificate-pdf";
import type { StoredPayment } from "@/modules/admin/features/finance/services/finance.service";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const user = await authorizeAction(["student"]);
  const { paymentId } = await params;
  const payment = await getRecord<StoredPayment>("payment", paymentId);
  if (!payment || payment.status !== "paid")
    return new Response("Receipt not found", { status: 404 });
  return new Response(
    receiptPdf(
      user.name,
      payment.payerName,
      payment.purpose,
      payment.amountNaira,
      payment.reference,
      payment.paidAt ?? payment.recordedAt,
    ),
    {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${payment.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}
