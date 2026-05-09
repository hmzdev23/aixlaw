"use client";

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

function ArrowIcon() {
  return (
    <svg className="sigma-arrow" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.25 11.75 11.75 4.25M6 4.25h5.75V10"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <a className="sigma-mark" href="#top" aria-label="Gambit">
      <span className="sigma-mark-icon">
        <span className="sigma-mark-dot" />
      </span>
      <span className="sigma-mark-text">Gambit</span>
    </a>
  );
}

function Inner() {
  const { state } = useWizard();
  return (
    <main id="top" className="sigma-shell">
      <header className="sigma-header">
        <BrandMark />

        <nav className="sigma-nav" aria-label="Primary">
          <a href="#workflow">Workflow</a>
          <a href="#war-room">AI Council</a>
          <a href="#exports">Exports</a>
          <a href="#security">Security</a>
        </nav>

        <div className="sigma-actions">
          <a className="sigma-muted-link" href="#app">App</a>
          <a className="sigma-button" href="#app">
            Start review
            <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="sigma-hero">
        <div className="sigma-hero-grid">
          <h1 className="sigma-display sigma-title">
            Contract work for
            <br />
            <strong>AI deal teams</strong>
          </h1>
          <div>
            <p className="sigma-lede">
              Upload a contract, review risk, coordinate signatures, debate
              tradeoffs with an AI council, and export the deal package.
            </p>
            <div className="sigma-actions sigma-hero-actions">
              <a className="sigma-button" href="#app">
                Get started
                <ArrowIcon />
              </a>
              <a className="sigma-button secondary" href="#workflow">
                See workflow
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="sigma-brand-strip">
        <div className="sigma-brand-inner">
          <div className="sigma-brand-label">
            Built for legal
            <br />
            operating teams:
          </div>
          <div className="sigma-brand-list" aria-label="Workflow capabilities">
            {["Review", "Signature", "Debate", "Memo"].map((item) => (
              <div className="sigma-brand-item" key={item}>
                <span className="sigma-brand-symbol" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="sigma-app">
        <div className="sigma-map">
          <span className="sigma-point one" />
          <span className="sigma-point two" />
          <span className="sigma-point three" />
          <span className="sigma-kicker sigma-fig">Fig 002</span>

          <div className="sigma-console-wrap">
            <div className="sigma-console">
              <div className="sigma-console-bar">
                <span className="sigma-dot" />
                <span className="sigma-dot" />
                <span className="sigma-dot" />
                <span className="sigma-console-name">gambit-review-console</span>
              </div>

              <div className="sigma-workspace">
                <div className="sigma-workspace-head">
                  <div>
                    <span className="sigma-kicker" style={{ color: "var(--green-deep)" }}>
                      step-by-step
                    </span>
                    <h2 className="sigma-display">Gambit review</h2>
                    <p className="subhead text-[13px]">
                      The upload, review, signature, council, and export flow is
                      unchanged.
                    </p>
                  </div>
                  <StepBar />
                </div>

                <section>
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
            </div>
          </div>
        </div>

        <div className="sigma-ruler" aria-hidden>
          <div className="sigma-ruler-labels">
            <span>Fig 001</span>
            <span>Fig 003</span>
          </div>
          <div className="sigma-ruler-track">
            <span className="sigma-marker" />
            {Array.from({ length: 150 }).map((_, i) => (
              <span
                className={`sigma-tick ${
                  i % 10 === 0 ? "major" : i % 5 === 0 ? "medium" : "minor"
                }`}
                key={i}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="sigma-cta">
        <h2 className="sigma-display">
          Move from draft to <span>signed</span>
        </h2>
        <div className="sigma-cta-row">
          <p>
            Keep every step in one review surface without changing the
            underlying workflow.
          </p>
          <a className="sigma-button" href="#app">
            Continue in app
            <ArrowIcon />
          </a>
        </div>
        <div className="sigma-strip" />
      </section>

      <footer className="sigma-footer">
        <div className="sigma-footer-inner">
          <BrandMark />
          <nav className="sigma-footer-nav" aria-label="Footer">
            <a href="#workflow">Workflow</a>
            <a href="#exports">Exports</a>
            <a href="#security">Privacy</a>
          </nav>
          <span className="sigma-copy">Copyright © 2026 Gambit</span>
        </div>
      </footer>
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
