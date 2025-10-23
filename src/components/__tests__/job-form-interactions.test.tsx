import "@testing-library/jest-dom";
import { act, render, screen, waitFor, within } from "@testing-library/react";
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

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText(/5\+ years with React/i)).toHaveLength(1);
      });

      const removeButton = screen.getByRole("button", { name: /^remove$/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/5\+ years with React/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Skills Management", () => {
    it("adds new skill field when Add button clicked", async () => {
      const user = userEvent.setup();
      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Initially no skill inputs visible
      expect(screen.queryByPlaceholderText(/TypeScript/i)).not.toBeInTheDocument();

      // Find Key skills heading and click its Add button
      const skillsHeading = screen.getByRole("heading", { name: /key skills/i });
      const controls = skillsHeading.parentElement;
      expect(controls).not.toBeNull();

      const addButton = within(controls as HTMLElement).getByRole("button", { name: /^add$/i });
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

      const validationMessages = await screen.findAllByText(/expected string to have/i);
      expect(validationMessages.length).toBeGreaterThan(0);
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with form data when valid", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValueOnce();

      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/job title/i), "Senior React Developer");
      await user.type(screen.getByLabelText(/^company$/i), "Tech Corp");
      await user.type(screen.getByLabelText(/^location$/i), "San Francisco, CA");
      await user.type(
        screen.getByLabelText(/job description/i),
        "Join our team building next-generation web applications."
      );
      await user.selectOptions(screen.getByLabelText(/employment type/i), "full-time");
      await user.selectOptions(screen.getByLabelText(/listing status/i), "published");

      // Add dynamic requirement and skill entries
      const requirementsHeading = screen.getByRole("heading", { name: /requirements/i });
      const requirementsControls = requirementsHeading.parentElement;
      expect(requirementsControls).not.toBeNull();
      const addRequirementButton = within(requirementsControls as HTMLElement).getByRole(
        "button",
        { name: /^add$/i }
      );
      await user.click(addRequirementButton);
      const requirementInput = screen.getByPlaceholderText(/5\+ years with React/i);
      await user.type(requirementInput, "5+ years React experience");

      const skillsHeading = screen.getByRole("heading", { name: /key skills/i });
      const skillsControls = skillsHeading.parentElement;
      expect(skillsControls).not.toBeNull();
      const addSkillButton = within(skillsControls as HTMLElement).getByRole("button", { name: /^add$/i });
      await user.click(addSkillButton);
      const skillInput = screen.getByPlaceholderText(/TypeScript/i);
      await user.type(skillInput, "TypeScript");

      // Submit
      const submitButton = screen.getByRole("button", { name: /create job/i });
      await act(async () => {
        submitButton.click();
      });

      // Should call onSubmit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      // Verify data structure
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Senior React Developer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          description: "Join our team building next-generation web applications.",
          type: "full-time",
          status: "published",
          requirements: ["5+ years React experience"],
          skills: ["TypeScript"],
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
      let resolveSubmit: (() => void) | undefined;
      const submissionPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submissionPromise);

      render(<JobForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/job title/i), "Title");
      await user.type(screen.getByLabelText(/^company$/i), "Company");
      await user.type(screen.getByLabelText(/^location$/i), "Location");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a detailed job description that easily exceeds fifty characters."
      );

      // Submit
      const submitButton = screen.getByRole("button", { name: /create job/i });
      act(() => {
        submitButton.click();
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/saving/i);
      });

      resolveSubmit?.();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent(/create job/i);
      });
    });
  });
});
