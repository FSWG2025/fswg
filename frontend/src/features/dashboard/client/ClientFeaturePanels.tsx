import { motion } from "framer-motion";
import type { ClientFeaturePanelsProps } from "./types";
import ReadinessWealthPanel from "./panels/ReadinessWealthPanel";
import InsurancePrepPanel from "./panels/InsurancePrepPanel";
import LearningDocsPanel from "./panels/LearningDocsPanel";
import AdvisorGoalsPanel from "./panels/AdvisorGoalsPanel";

export type { ClientFeaturePanelsProps } from "./types";

const fade = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function ClientFeaturePanels(props: ClientFeaturePanelsProps) {
  return (
    <>
      <motion.div {...fade} transition={{ delay: 0.05 }}>
        <ReadinessWealthPanel {...props} />
      </motion.div>
      <motion.div {...fade} transition={{ delay: 0.1 }}>
        <InsurancePrepPanel {...props} />
      </motion.div>
      <motion.div {...fade} transition={{ delay: 0.15 }}>
        <LearningDocsPanel {...props} />
      </motion.div>
      <motion.div {...fade} transition={{ delay: 0.2 }}>
        <AdvisorGoalsPanel {...props} />
      </motion.div>
    </>
  );
}
