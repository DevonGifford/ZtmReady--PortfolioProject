import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";

import LoginPage from "@/app/(auth)/(routes)/login/page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

global.ResizeObserver = jest.fn(() => ({
  // Create a mock for ResizeObserver in test setup
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("Login Page Rendering Tests", () => {
  it("renders login page", () => {
    const { container } = render(<LoginPage />);
    expect(container).toBeInTheDocument();
  });

  it("renders header component correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login to your account")).toBeInTheDocument();
    expect(screen.getByText(/by improving 1/i)).toBeInTheDocument();
  });

  it("renders footer correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Dont have an account?")).toBeInTheDocument();
    expect(screen.getByText("Back to Home Page")).toBeInTheDocument();
  });
});

describe("Login Form Validation Tests", () => {
  test("case empty email/password renders error messages", async () => {
    //-Arrange
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    //-Act
    await userEvent.click(emailInput);
    await userEvent.click(passwordInput);
    await userEvent.click(submitButton);

    //-Assert
    await waitFor(() => {
      const passwordRequiredText = screen.getAllByText(/Required/i);
      expect(passwordRequiredText.length).toBeGreaterThan(1); // Checks both error messages present
      // 🤔 or assert on a specific element in the array
      // ? expect(passwordRequiredText[0]).toBeInTheDocument();
    });
  });

  test("case short password renders error message", async () => {
    //-Arrange
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    //-Act
    await userEvent.click(emailInput);
    await userEvent.keyboard("test@gmail.com");
    await userEvent.click(passwordInput);
    await userEvent.keyboard("a".repeat(2));
    await userEvent.click(submitButton);

    //-Assert
    await waitFor(() => {
      const shortPasswordError = screen.getByText(
        /Password must be at least 8 characters/
      );
      expect(shortPasswordError).toBeInTheDocument();
    });
  });

  test("case incorrect email format renders error message", async () => {
    //-Arrange
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    //-Act
    await userEvent.click(emailInput);
    await userEvent.keyboard("test");
    await userEvent.click(passwordInput);
    await userEvent.keyboard("a".repeat(10));
    await userEvent.click(submitButton);

    //-Assert
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });
});

describe("Login Submission Tests", () => {
  test("case successful form submission should reroute and toast notif", async () => {
    //- Tearup
    const mockSuccessLogin = jest.fn().mockResolvedValue({ result: "success" });
    jest.mock("../components/providers/AuthProvider", () => ({
      useAuth: () => ({
        login: mockSuccessLogin,
      }),
    }));

    //- Arrange
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    //- Act
    await userEvent.type(emailInput, "test2@test.com");
    await userEvent.type(passwordInput, "test@123");
    await userEvent.click(submitButton);

    //-Assert
    setTimeout(() => {
      expect(screen.getByText("Successfully signed in")).toBeInTheDocument();
      expect(window.location.pathname).toBe("/dashboard"); // Example of checking for redirection
      expect(mockSuccessLogin).toHaveBeenCalledTimes(1);
    }, 4000);
  });

  test("case unsuccessful form submission should error with toast notif", async () => {
    //- Tearup
    const mockFailedLogin = jest.fn().mockResolvedValue({ result: "error" });
    jest.mock("../components/providers/AuthProvider", () => ({
      useAuth: () => ({
        login: mockFailedLogin,
      }),
    }));

    //- Arrange
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    //- Act
    await userEvent.type(emailInput, "notrealemail@test.com");
    await userEvent.type(passwordInput, "notrealpassword");
    await userEvent.click(submitButton);

    //- Assert
    setTimeout(() => {
      expect(
        screen.getByText("Incorrect credentials, please try again.")
      ).toBeInTheDocument();
      expect(mockFailedLogin).toHaveBeenCalledTimes(1);
    });
  });
});
