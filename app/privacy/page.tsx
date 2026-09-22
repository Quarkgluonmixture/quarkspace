import type { Metadata } from "next";
import p from "./privacy.module.css";

// Public privacy policy for "Quark", the owner's personal Google OAuth app (used by the owner's local
// personal-system gateway). Google requires a reachable homepage + privacy URL before an
// external app can leave Testing status; this page is that URL. Keep it factual and short.
export const metadata: Metadata = {
  title: "Privacy Policy · Quark",
  description: "Privacy policy for Quark, a single-user personal tool.",
};

const CONTACT = "wubbalabbadubdub1@gmail.com";

export default function PrivacyPage() {
  return (
    <main className={p.shell}>
      <h1>Privacy Policy — Quark</h1>
      <p className={p.meta}>Last updated: 22 September 2026</p>

      <p>
        Quark is a personal tool built and used only by its owner, Jiaming Wei. It is not offered
        to the public, and no one other than the owner can sign in to it.
      </p>

      <h2>What it accesses</h2>
      <p>
        With the owner&apos;s explicit Google consent, Quark reads the owner&apos;s own Gmail,
        Google Calendar, Google Drive and Google Docs data. Access is read-only.
      </p>

      <h2>How the data is used</h2>
      <ul>
        <li>Data is processed on the owner&apos;s own computer, and by AI assistants the owner
          chooses to use, only at the owner&apos;s request, to help the owner search and organise
          their own information.</li>
        <li>It is not sold, shared with third parties, or used for advertising.</li>
        <li>It is not used to train general-purpose AI or machine-learning models.</li>
        <li>OAuth tokens are stored locally with access restricted to the owner&apos;s account.</li>
      </ul>
      <p>
        Quark&apos;s use of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>Revoking access</h2>
      <p>
        Access can be revoked at any time from{" "}
        <a href="https://myaccount.google.com/permissions">Google Account → Third-party access</a>.
      </p>

      <h2>Contact</h2>
      <p><a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
    </main>
  );
}
