import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-wpu-black">How It Works</h1>
      <p className="mt-4 text-lg leading-relaxed text-wpu-black-light">
        This guide explains how to use LostFound from account creation through the safe return of items. Please follow these steps in order and refer to the Rules &amp; Safety Tips section before arranging any in-person handoff.
      </p>

      <ol className="mt-10 space-y-8">
        <li className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wpu-orange text-lg font-bold text-white">1</span>
          <div>
            <h2 className="text-xl font-semibold text-wpu-black">Create an Account and Verify Your Email</h2>
            <p className="mt-2 leading-relaxed text-wpu-black-light">
              Register with your William Paterson University email address and complete the verification step sent to your inbox. Only verified accounts may create listings or submit claims. This measure helps keep the platform secure and limited to the campus community.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wpu-orange text-lg font-bold text-white">2</span>
          <div>
            <h2 className="text-xl font-semibold text-wpu-black">Post a Lost or Found Item</h2>
            <p className="mt-2 leading-relaxed text-wpu-black-light">
              Create a listing with a clear title, category, location, date, and description. A photograph is strongly recommended when available. Select &quot;Lost&quot; if you have lost an item, or &quot;Found&quot; if you have recovered an item and wish to return it to its owner.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wpu-orange text-lg font-bold text-white">3</span>
          <div>
            <h2 className="text-xl font-semibold text-wpu-black">Search and Filter the Feed</h2>
            <p className="mt-2 leading-relaxed text-wpu-black-light">
              Use the home feed to browse all active listings. You may search by keyword and filter by type (Lost or Found), category, status, and other criteria to locate relevant listings efficiently.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wpu-orange text-lg font-bold text-white">4</span>
          <div>
            <h2 className="text-xl font-semibold text-wpu-black">Claim a Found Item or Report Information on a Lost Item</h2>
            <p className="mt-2 leading-relaxed text-wpu-black-light">
              For <strong>found</strong> items: submit a &quot;Request to claim&quot; with any details that support your ownership. The poster may approve or deny the claim. For <strong>lost</strong> items: use &quot;I have seen this item&quot; or &quot;Item has been returned to the information desk&quot; to provide information to the owner. Claims apply only to found items; lost items are not subject to claim.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wpu-orange text-lg font-bold text-white">5</span>
          <div>
            <h2 className="text-xl font-semibold text-wpu-black">Use In-App Chat to Arrange Handoff</h2>
            <p className="mt-2 leading-relaxed text-wpu-black-light">
              Once a claim has been approved or you have useful information to share, use the chat associated with the listing to coordinate an in-person handoff. All handoffs should occur in a safe, public, campus location. Do not share personal contact details publicly; use the in-app chat until you are comfortable proceeding.
            </p>
          </div>
        </li>
      </ol>

      <p className="mt-10 rounded-lg border border-wpu-black/10 bg-wpu-orange-light/50 p-4 text-sm leading-relaxed text-wpu-black-light">
        <strong className="text-wpu-black">Important:</strong> Before meeting in person, review the Rules &amp; Safety Tips section. Verify ownership when handing over items and report any concerning behavior through the appropriate University channels.
      </p>

      <Link href="/" className="mt-10 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
