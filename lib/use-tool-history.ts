// React hook that wires a calculator page into the shared persistence/share layer.
// Replaces ~25 lines of per-page boilerplate with one call.
//
// Usage (any tool page):
//   const formInputs = useMemo(() => ({ field1, field2, ... }), [field1, field2, ...]);
//   const applyInputs = useCallback((i: Record<string, unknown>) => { ... }, []);
//   const { saveSnapshot, restoreSnapshot } =
//     useToolHistory("cable", formInputs, applyInputs);
//
// Then call saveSnapshot(label?) inside handleCalc, and pass restoreSnapshot
// to <RecentDropdown onRestore={restoreSnapshot} />.

"use client";

import { useCallback, useEffect } from "react";
import {
  pushSnapshot,
  getSmartDefaults,
  type CalcSnapshot,
  type ToolId,
} from "@/lib/state-store";
import { readShareFromHash } from "@/lib/share-link";
import { track } from "@/lib/analytics";

export function useToolHistory<TInputs extends Record<string, unknown>>(
  tool: ToolId,
  inputs: TInputs,
  applyInputs: (i: Record<string, unknown>) => void,
) {
  // One-shot mount apply: share-link wins, else smart defaults from histogram.
  // Reading client-only storage in a useState initializer would mismatch SSR,
  // so this effect is the intentional one-shot apply. (The strict React 19
  // set-state-in-effect rule does not fire here because applyInputs is opaque
  // to the linter — setters are wrapped behind the callback boundary.)
  useEffect(() => {
    const shared = readShareFromHash();
    if (shared?.t === tool) {
      applyInputs(shared.i);
      return;
    }
    const sd = getSmartDefaults(tool);
    if (Object.keys(sd).length) applyInputs(sd);
  }, [tool, applyInputs]);

  const saveSnapshot = useCallback(
    (label?: string) => {
      pushSnapshot({ tool, inputs, label });
      track("calc-run", { tool });
    },
    [tool, inputs],
  );

  const restoreSnapshot = useCallback(
    (snap: CalcSnapshot) => {
      applyInputs(snap.inputs);
    },
    [applyInputs],
  );

  return { saveSnapshot, restoreSnapshot };
}
