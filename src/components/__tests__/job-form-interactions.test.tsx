import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobForm } from "../job-form";
import type { JobFormValues } from "@/types";

/**
 * JobForm Interaction Tests
 * 
 * Tests dynamic form behaviors beyond static accessibility checks.
 * Covers: requirements/skills management, validation, submission, edit mode.
 */

describe("JobForm - Interaction Tests", () => {
  const mockOnSubmit = jest.fn<Promise<void>, [JobFormValues]>();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe("Requirements Management", () => {
    it("adds new requirement field when Add button clicked", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Initially no requirement inputs visible
      expect(screen.queryByPlaceholderText(/5\+ years with React/i)).not.toBeInTheDocument();

      const requirementsHeading = screen.getByRole("heading", { name: /requirements/i });
      const controls = requirementsHeading.parentElement;
      expect(controls).not.toBeNull();

      const addButton = within(controls as HTMLElement).getByRole("button", { name: /^add$/i });
      await user.click(addButton);

      // Now should have 1 requirement input
      const inputs = screen.getAllByPlaceholderText(/5\+ years with React/i);
      expect(inputs).toHaveLength(1);
    });

    it("removes requirement field when Remove button clicked", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Add a requirement first
      const requirementsHeading = screen.getByRole("heading", { name: /requirements/i });
      const controls = requirementsHeading.parentElement;
      expect(controls).not.toBeNull();

      const addButton = within(controls as HTMLElement).getByRole("button", { name: /^add$/i });

      await user.click(addButton);
      await user.click(addButton); // Add second one

      // Should have 2 inputs
      let inputs = screen.getAllByPlaceholderText(/5\+ years with React/i);
      expect(inputs).toHaveLength(2);

      // Click first Remove button
      const removeButtons = screen.getAllByRole("button", { name: /^remove$/i });
      await user.click(removeButtons[0]);

      // Should have 1 input left
      inputs = screen.getAllByPlaceholderText(/5\+ years with React/i);
      expect(inputs).toHaveLength(1);
    });
  });

  describe("Skills Management", () => {
    it("adds new skill field when Add button clicked", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Initially no skill inputs visible
      expect(screen.queryByPlaceholderText(/TypeScript/i)).not.toBeInTheDocument();

      // Find Key skills heading and click its Add button
      const skillsHeading = screen.getByText("Key skills");
      const skillsSection = skillsHeading.parentElement!;
      const addButton = Array.from(skillsSection.querySelectorAll('button')).find(
        btn => btn.textContent === 'Add'
      )!;
      
      await user.click(addButton);

      // Now should have 1 skill input
      const inputs = screen.getAllByPlaceholderText(/TypeScript/i);
      expect(inputs).toHaveLength(1);
    });
  });

  describe("Form Validation", () => {
    it("prevents submission when required fields are empty", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole("button", { name: /create job/i });
      await user.click(submitButton);

      // onSubmit should not be called
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });

      // Should show validation errors (FormMessage components render with role="alert")
      const alerts = await screen.findAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with form data when valid", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValueOnce();

      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/job title/i), "Senior Developer");
      await user.type(screen.getByLabelText(/^company$/i), "Tech Corp");
      await user.type(screen.getByLabelText(/^location$/i), "San Francisco");
      await user.type(screen.getByLabelText(/job description/i), "Great opportunity");

      // Employment type and Listing status already have default values

      // Submit
      const submitButton = screen.getByRole("button", { name: /create job/i });
      await user.click(submitButton);

      // Should call onSubmit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      // Verify data structure
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Senior Developer",
          company: "Tech Corp",
          location: "San Francisco",
          description: "Great opportunity",
        })
      );
    });
  });

  describe("Edit Mode", () => {
    it("renders with initial values in edit mode", () => {
      const initialData: Partial<JobFormValues> = {
        title: "Existing Job",
        company: "Old Company",
        location: "NYC",
        type: "part-time",
        status: "published",
        description: "Existing description",
      };

      render(<JobForm mode="edit" initialValues={initialData} onSubmit={mockOnSubmit} />);

      // Check pre-populated values
      expect(screen.getByDisplayValue("Existing Job")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Old Company")).toBeInTheDocument();
      expect(screen.getByDisplayValue("NYC")).toBeInTheDocument();

      // Button should say "Save changes" in edit mode
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("pre-populates requirements and skills arrays", () => {
      const initialData: Partial<JobFormValues> = {
        title: "Job",
        company: "Co",
        location: "Loc",
        description: "Desc",
        requirements: ["Req 1", "Req 2"],
        skills: ["Skill 1"],
      };

      render(<JobForm mode="edit" initialValues={initialData} onSubmit={mockOnSubmit} />);

      // Should show 2 requirement inputs
      const reqInputs = screen.getAllByPlaceholderText(/5\+ years with React/i);
      expect(reqInputs).toHaveLength(2);
      expect(reqInputs[0]).toHaveValue("Req 1");
      expect(reqInputs[1]).toHaveValue("Req 2");

      // Should show 1 skill input
      const skillInputs = screen.getAllByPlaceholderText(/TypeScript/i);
      expect(skillInputs).toHaveLength(1);
      expect(skillInputs[0]).toHaveValue("Skill 1");
    });
  });

  describe("Cancel Button", () => {
    it("calls onCancel when cancel button clicked", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Submit Button State", () => {
    it("disables submit button during async submission", async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submissionPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submissionPromise);

      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/job title/i), "Title");
      await user.type(screen.getByLabelText(/^company$/i), "Company");
      await user.type(screen.getByLabelText(/^location$/i), "Location");
      await user.type(screen.getByLabelText(/job description/i), "Description");

      // Submit
      const submitButton = screen.getByRole("button", { name: /create job/i });
      await user.click(submitButton);

      // Button should be disabled and show "Saving..."
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/saving/i);
      });

      // Resolve submission
      resolveSubmit!();

      // Button should be enabled again
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent(/create job/i);
      });
    });
  });
});
