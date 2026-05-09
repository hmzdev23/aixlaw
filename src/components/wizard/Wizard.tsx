"use client";

import Image from "next/image";
import { WizardProvider, useWizard } from "./state";
import { StepBar } from "./StepBar";
import { UploadStep } from "@/components/steps/UploadStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { EsigStep } from "@/components/steps/EsigStep";
import { ViolationsStep } from "@/components/steps/ViolationsStep";
import { WorkflowStep } from "@/components/steps/WorkflowStep";
import { GoalStep } from "@/components/steps/GoalStep";
import { ContextStep } from "@/components/steps/ContextStep";
import { WarRoomStep } from "@/components/steps/WarRoomStep";
import { ExportStep } from "@/components/steps/ExportStep";
import { MeetingStep } from "@/components/steps/MeetingStep";
import { MemoStep } from "@/components/steps/MemoStep";
import { EditedDocStep } from "@/components/steps/EditedDocStep";
import { DoneStep } from "@/components/steps/DoneStep";

function SideLogo() {
  return (
    <aside
      aria-hidden
      className="hidden xl:flex flex-col items-center justify-start gap-4 pt-24 select-none"
    >
      <div className="relative h-[140px] w-[140px] fade-in">
        <Image
          src="/gambit-logo.png"
          alt=""
          fill
          sizes="140px"
          priority
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className="flex flex-col items-center gap-1 fade-in stagger-2">
        <span
          className="text-[14px] font-semibold tracking-[0.22em]"
          style={{ color: "var(--ink)" }}
        >
          GAMBIT
        </span>
        <span
          className="h-px w-10"
          style={{ background: "var(--green-line, #b9d6c4)" }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "var(--green-deep, #185538)" }}
        >
          AI Council
        </span>
      </div>
    </aside>
  );
}

function SideQuote() {
  return (
    <aside
      aria-hidden
      className="hidden xl:flex flex-col items-start justify-start pt-28 pr-2 select-none"
    >
      <div className="fade-in stagger-3 max-w-[200px]">
        <span className="side-quote-mark">&ldquo;</span>
        <p className="side-quote text-[15px]">
          Out-think the contract. Out-play the room.
        </p>
        <p
          className="mt-3 text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "var(--muted)" }}
        >
          &mdash; the gambit doctrine
        </p>
      </div>
    </aside>
  );
}

function Inner() {
  const { state } = useWizard();
  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pb-24 pt-8 md:px-6 xl:grid-cols-[180px_minmax(0,1100px)_220px]">
        <SideLogo />
        <div className="flex flex-col">
          <header className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight">Gambit</h1>
              <p className="subhead text-[13px]">
                Upload a contract. Debate it with an AI council. Export the deal.
              </p>
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--green-deep, #185538)" }}
            >
              step-by-step
            </span>
          </header>

          <div className="card mb-6 px-5 py-4">
            <StepBar />
          </div>

          <section className="card flex-1 px-6 py-6 md:px-8 md:py-8">
            {state.step === "upload" && <UploadStep />}
            {state.step === "review" && <ReviewStep />}
            {state.step === "esig" && <EsigStep />}
            {state.step === "violations" && <ViolationsStep />}
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
        </div>
        <SideQuote />
      </div>
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
