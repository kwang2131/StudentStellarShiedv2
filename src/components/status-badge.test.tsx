import { render, screen } from "@testing-library/react";

import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders a formatted case status", () => {
    render(<StatusBadge status="REFUND_REQUESTED" />);
    expect(screen.getByText(/Refund Requested/i)).toBeInTheDocument();
  });
});
