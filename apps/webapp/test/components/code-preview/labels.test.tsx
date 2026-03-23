import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("lottie-react", () => ({
  default: () => null,
}));

import { BarcodeLabel, QrLabel } from "~/components/code-preview/code-preview";

describe("QrLabel", () => {
  const baseProps = {
    title: "Camera",
    data: {
      qr: {
        id: "qr-123",
        src: "data:image/png;base64,AAA",
        size: "small",
      },
    },
  } as const;

  it("renders correctly", () => {
    render(<QrLabel {...(baseProps as any)} />);

    expect(screen.getByText("Camera")).toBeInTheDocument();
  });
});

describe("BarcodeLabel", () => {
  const baseProps = {
    title: "Camera",
    data: {
      type: "EAN13",
      value: "1234567890123",
    },
  } as const;

  it("renders correctly", () => {
    render(<BarcodeLabel {...(baseProps as any)} />);

    expect(screen.getByText("Camera")).toBeInTheDocument();
  });
});
