import { vi } from "vitest";

// Stripe throws if key is empty at import — mock before any route loads
vi.mock("stripe", () => {
  const Stripe = vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: vi.fn() } },
    customers: { create: vi.fn(), retrieve: vi.fn() },
    subscriptions: { retrieve: vi.fn(), cancel: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  }));
  return { default: Stripe };
});

vi.mock("../../queue/analysisWorker.js", () => ({}));
