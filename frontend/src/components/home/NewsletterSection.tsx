import { useState } from "react";
import { ArrowRight } from "lucide-react";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#E4EFF8] py-16 md:py-24" id="cta">
      <div className="mx-auto w-[92%] max-w-[440px] sm:max-w-[560px] md:max-w-[640px]">
        <div
          className="flex flex-col items-center gap-6 rounded-[32px] bg-white px-5 py-8 text-center shadow-[0_16px_40px_rgba(18,33,62,0.06)] sm:px-8 sm:py-10"
          data-aos="fade-up"
        >
          <h2 className="section-headline text-[#12213E]">Subscribe to our newsletter</h2>
          <p className="max-w-md text-sm leading-relaxed text-[#6B7280]">
            Get practical updates on rental support, insurance, and wealth-building for newcomers and families in Canada.
          </p>
          <form
            className="w-full"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
          >
            <label className="flex items-center rounded-full bg-white py-1.5 pl-5 pr-1.5 ring-1 ring-[#E4EFF6] shadow-[0_10px_30px_rgba(18,33,62,0.08)]">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-label="Your email address"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#12213E] outline-none placeholder:text-[#12213E]/60"
              />
              <button
                type="submit"
                aria-label="Subscribe to our newsletter"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </label>
          </form>
        </div>
      </div>
      {open && (
        <LeadCaptureModal
          isOpen
          prefillData={{ email }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default NewsletterSection;
