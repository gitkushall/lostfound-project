import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-wpu-black">Rules &amp; Safety Tips</h1>
      <p className="mt-4 text-lg leading-relaxed text-wpu-black-light">
        All users of LostFound are expected to follow the platform rules and safety guidelines below. These requirements are in place to protect the campus community and to maintain the integrity and usefulness of the service. Failure to comply may result in loss of access or referral to University disciplinary or security procedures.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Platform Rules</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-wpu-black-light">
          <li className="leading-relaxed">
            Listings must concern items that have been genuinely lost or found on or around the William Paterson University campus. Do not post items from off-campus or commercial sales.
          </li>
          <li className="leading-relaxed">
            Do not create false, misleading, or duplicate listings. One listing per item is sufficient. Duplicate or fraudulent posts may be removed and may result in account restrictions.
          </li>
          <li className="leading-relaxed">
            Only <strong>found</strong> items may be claimed. Lost items are not subject to claim requests; use the information options (&quot;I have seen this item&quot; or &quot;Item has been returned to the information desk&quot;) to assist owners.
          </li>
          <li className="leading-relaxed">
            Once an item has been returned to its owner, the poster should remove or update the listing so that it no longer appears as active in the feed.
          </li>
          <li className="leading-relaxed">
            Users must treat one another with respect. Harassment, spam, abuse, fraud, or misuse of the platform may result in loss of access and referral to University Public Safety or other appropriate offices.
          </li>
          <li className="leading-relaxed">
            Inactive listings may be automatically removed after a defined period. You may create a new listing if the item remains lost or found.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Safety Tips for In-Person Handoffs</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          The following guidelines are strongly recommended when arranging or completing the return of an item.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-wpu-black-light">
          <li className="leading-relaxed">
            <strong className="text-wpu-black">Meet in a safe, public location.</strong> Choose a campus building, well-trafficked area, or daylight setting. Avoid isolated or private locations.
          </li>
          <li className="leading-relaxed">
            <strong className="text-wpu-black">Verify ownership before handing over an item.</strong> Ask the claimant to describe the item, its contents, or identifying details. For identification cards, keys, or valuables, follow University policy (e.g., turning items in to the appropriate office) when ownership cannot be reasonably verified.
          </li>
          <li className="leading-relaxed">
            <strong className="text-wpu-black">Use in-app chat for coordination.</strong> Keep contact within the app until you are comfortable. Do not post personal phone numbers, addresses, or other sensitive information publicly on listings.
          </li>
          <li className="leading-relaxed">
            <strong className="text-wpu-black">Trust your judgment.</strong> If a situation feels unsafe or inappropriate, do not complete the handoff. You may decline a claim or report the matter through Contact Information or University Public Safety.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-wpu-black">Reporting Concerns</h2>
        <p className="mt-3 leading-relaxed text-wpu-black-light">
          If you experience or witness harassment, fraud, theft, or other unsafe or improper behavior related to a listing or user, report it to University Public Safety and, where applicable, through official campus reporting channels. Do not share sensitive personal information with unknown parties.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
