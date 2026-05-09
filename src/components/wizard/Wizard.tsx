"use client";

import { WizardProvider, useWizard } from "./state";
import { StepBar } from "./StepBar";
import { UploadStep } from "@/components/steps/UploadStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { EsigStep } from "@/components/steps/EsigStep";
import { WorkflowStep } from "@/components/steps/WorkflowStep";
import { GoalStep } from "@/components/steps/GoalStep";
import { ContextStep } from "@/components/steps/ContextStep";
import { WarRoomStep } from "@/components/steps/WarRoomStep";
import { ExportStep } from "@/components/steps/ExportStep";
import { MeetingStep } from "@/components/steps/MeetingStep";
import { MemoStep } from "@/components/steps/MemoStep";
import { EditedDocStep } from "@/components/steps/EditedDocStep";
import { DoneStep } from "@/components/steps/DoneStep";

function Inner() {
  const { state } = useWizard();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-6 pb-24 pt-8">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Gambit</h1>
          <p className="muted text-[13px]">
            Upload a contract. Debate it with an AI council. Export the deal.
          </p>
        </div>
        <span className="muted text-[12px]">step-by-step</span>
      </header>
      <div className="card mb-6 px-5 py-4">
        <StepBar />
      </div>
      <section className="card flex-1 px-6 py-6 md:px-8 md:py-8">
        {state.step === "upload" && <UploadStep />}
        {state.step === "review" && <ReviewStep />}
        {state.step === "esig" && <EsigStep />}
        {state.step === "workflow" && <WorkflowStep />}
        {state.step === "goal" && <GoalStep />}
        {state.step === "context" && <ContextStep />}
        {state.step === "warroom" && <WarRoomStep />}
        {state.step === "export" && <ExportStep />}
        {state.step === "meeting" && <MeetingStep />}
        {state.step === "memo" && <MemoStep />}
        {state.step === "edited" && <EditedDocStep />}
        {state.step === "done" && <DoneStep />}
      </section>
    </main>
  );
}

export function Wizard() {
  return (
    <WizardProvider>
      <Inner />
    </WizardProvider>
  );
}
