import type { spring } from "motion";

import type { CueOptions } from "./video.ts";

declare global {
  const Motion: { spring: typeof spring };

  interface Window {
    END: number;
    cueList: () => ({ name: string; t: number } & CueOptions)[];
    seek: (t: number) => void;
    soundtrack: () => Promise<{ cues: string; music: string }>;
  }
}
