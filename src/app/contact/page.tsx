import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-wpu-black">Contact Information</h1>
      <p className="mt-4 text-lg leading-relaxed text-wpu-black-light">
        Use the information below for lost and found inquiries, technical support for the LostFound application, and reporting safety or conduct concerns. Please contact the appropriate office for your specific need.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Lost &amp; Found (Physical Items)</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          LostFound is a platform for connecting individuals who have lost or found items. Physical storage of turned-in items may be handled by campus offices such as the Information Desk, University Public Safety, or academic departments. If an item has been turned in to a specific office, contact that office directly for retrieval procedures.
        </p>
        <div className="mt-4 rounded-lg border border-wpu-black/10 bg-wpu-gray-light/50 p-4">
          <p className="font-semibold text-wpu-black">William Paterson University</p>
          <p className="mt-1 text-wpu-black-light">300 Pompton Road, Wayne, NJ 07470</p>
          <p className="mt-1 text-wpu-black-light">Main line: (973) 720-2000</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">App Support and Technical Issues</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          For account access problems, login issues, verification difficulties, or technical bugs within the LostFound application, contact your campus IT support or student services. Please mention &quot;LostFound&quot; and describe the issue so that your request can be directed to the appropriate team.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Safety and Conduct</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          If you experience or witness harassment, fraud, theft, or other unsafe or inappropriate behavior related to a listing or user on LostFound, report the matter to University Public Safety. You may also use official campus reporting channels where applicable. Do not share sensitive personal information (e.g., full address, financial details) with unknown parties.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">General Inquiries</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          For general questions about LostFound, eligibility, or how to use the platform, refer to the About the App and How It Works sections in this menu. For all other University-related inquiries, use the main University contact information above or the official William Paterson University website.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
