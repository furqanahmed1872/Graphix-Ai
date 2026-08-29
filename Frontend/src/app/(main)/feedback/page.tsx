import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata = {
  title: "Feedback — Graphix",
  description:
    "Tell us what Graphix gets wrong. Bugs, missing chart types, anything that made you give up halfway.",
};

export default function FeedbackPage() {
  return (
    <main className="text-white min-h-screen">
        <FeedbackForm />
    </main>
  );
}
