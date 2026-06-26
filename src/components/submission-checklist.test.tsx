import { render, screen } from "@testing-library/react";

import { SubmissionChecklist } from "./submission-checklist";

describe("SubmissionChecklist", () => {
  it("renders checklist items and details", () => {
    render(
      <SubmissionChecklist
        checklist={[
          {
            complete: true,
            detail: "README exists",
            id: "readme",
            label: "README status",
          },
        ]}
      />,
    );

    expect(screen.getByText(/README status/i)).toBeInTheDocument();
    expect(screen.getByText(/README exists/i)).toBeInTheDocument();
  });
});
