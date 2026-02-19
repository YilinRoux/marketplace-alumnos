"use client";

import { useState } from "react";
import StepPhotos from "./StepPhotos";
import StepDetails from "./StepDetails";
import StepCategory from "./StepCategory";

export default function PublishWizard() {
  const [step, setStep] = useState(1);

  return (
    /*  CONTENEDOR CENTRADO GLOBAL */
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        width: "100%",
      }}
    >
      {step === 1 && (
        <StepPhotos onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepDetails
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepCategory
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}
