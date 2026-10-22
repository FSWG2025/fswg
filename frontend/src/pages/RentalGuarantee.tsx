import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import RentalGuaranteeSection from "@/components/home/RentalGuaranteeSection";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";

const RentalGuarantee = () => {
  return (
    <>
      <SEO
        title="Rental Guarantee Canada: Rent Without Canadian Credit History"
        description="Housing help for newcomers: First Step Wealth Group’s rental guarantee lets you rent in Canada without a Canadian credit score, avoid huge deposits, and build credit while you live in your home."
        canonical="https://firststepwealthgroup.ca/rental-guarantee"
        keywords={[
          "rental guarantee Canada",
          "rent without Canadian credit",
          "housing for newcomers Canada",
          "no credit rental Canada",
          "guarantor for rent Canada",
          "build credit with rent",
          "newcomer housing Canada",
          "landlord rental guarantee",
          "First Step Wealth Group rental",
        ]}
        structuredData={[
          serviceSchema({
            name: "Rental Guarantee",
            description:
              "Rent in Canada without a Canadian credit history. We guarantee rent to landlords and help newcomers build credit.",
            path: "/rental-guarantee",
            serviceType: "Rental guarantee / housing support",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Rental Guarantee", path: "/rental-guarantee" },
          ]),
        ]}
      />
      <main className="pt-24 md:pt-28">
        <section className="mx-auto max-w-[720px] px-4 pb-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#C69259]">
              Rental Guarantee
            </p>
            <h1 className="section-headline mt-3 text-[#12213E]">
              Rent in Canada without a Canadian credit history
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6B7280]">
              Many newcomers can afford the rent but still get turned away because landlords ask
              for large deposits when there is no Canadian credit file yet. Our rental guarantee
              is designed for that gap: we look at your employment and income, replace the need
              for months of rent upfront with a low monthly fee, and guarantee on-time payment to
              landlords, while rent payments help you build Canadian credit.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              Below you can explore the problem newcomers face, how the guarantee works, how to
              pre-qualify in minutes with no credit impact, and how landlords can partner with us.
            </p>
          </motion.div>
        </section>
        <RentalGuaranteeSection />
      </main>
    </>
  );
};

export default RentalGuarantee;
