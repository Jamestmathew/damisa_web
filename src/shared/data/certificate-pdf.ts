// A small vector PDF avoids a browser dependency in Vercel functions.
export function certificatePdf(
  name: string,
  course: string,
  credential: string,
  date: string,
) {
  const escape = (value: string) =>
    value
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/[\\()]/g, "\\$&")
      .slice(0, 140);
  const line = (value: string, x: number, y: number, size: number) =>
    `BT /F1 ${size} Tf ${x} ${y} Td (${escape(value)}) Tj ET`;
  const content = [
    "0.15 0.25 0.4 RG 3 w 30 30 732 552 re S",
    line("CERTIFICATE OF COURSE COMPLETION", 90, 475, 26),
    line("This certifies that", 90, 400, 16),
    line(name, 90, 355, 28),
    line("has completed all published lessons in", 90, 305, 16),
    line(course, 90, 265, 20),
    line(`Issued: ${date.slice(0, 10)}`, 90, 170, 12),
    line(`Credential: ${credential}`, 90, 140, 12),
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join(
      "",
    )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function receiptPdf(
  student: string,
  company: string,
  description: string,
  amount: number,
  reference: string,
  date: string,
) {
  const clean = (value: string) =>
    value
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/[\\()]/g, "\\$&")
      .slice(0, 140);
  const values = [
    "MANUAL PAYMENT RECEIPT",
    `Student: ${student}`,
    `Company: ${company}`,
    `Description: ${description}`,
    `Amount recorded: NGN ${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Reference: ${reference}`,
    `Payment date: ${date.slice(0, 10)}`,
    "This receipt reflects the payment recorded by your administrator.",
  ];
  const content = values
    .map(
      (value, i) =>
        `BT /F1 ${i === 0 ? 22 : 12} Tf 50 ${740 - i * 45} Td (${clean(value)}) Tj ET`,
    )
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
