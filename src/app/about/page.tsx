import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-wpu-black">About the App</h1>
      <p className="mt-4 text-lg leading-relaxed text-wpu-black-light">
        LostFound is the official lost and found platform for the William Paterson University community. This document provides a formal overview of the service, its purpose, eligibility, and how your information is handled.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Overview</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          LostFound provides a secure, centralized system for reporting lost items, posting found items, and facilitating the return of belongings to their owners within the William Paterson University campus community. The platform is maintained for the benefit of students, faculty, and staff and is intended to reduce the fragmentation of lost-and-found reporting across informal channels.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Purpose</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          The service consolidates lost and found reporting into a single, searchable, and filterable feed. By providing a clear process for posting, claiming, and coordinating handoffs, LostFound aims to improve the likelihood of reuniting lost items with their owners while promoting accountability and safe, in-person exchanges in appropriate campus settings.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Eligibility</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          LostFound is intended for current students, faculty, and staff of William Paterson University. Account creation and email verification are required before posting or responding to listings. This requirement helps maintain the integrity of the platform and ensures that users are members of the campus community.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Data and Privacy</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          Your name, email address, and profile information are used solely to operate the service and to facilitate safe, accountable handoffs. We do not sell your personal data. For comprehensive details regarding data collection, use, and retention, please refer to the University&apos;s official privacy policy and any terms of use that apply to campus systems and applications.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Support</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          For technical support, account issues, or questions about the platform, please use the Contact Information section available in this menu. For matters involving safety or conduct, refer to the Rules &amp; Safety Tips section and contact the appropriate University offices as indicated.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
