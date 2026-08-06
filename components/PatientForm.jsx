"use client";

// Patient intake form with 12 fields + validation.
import { useState } from "react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useWebSocket } from "@/hooks/useWebSocket";
import FormFields from "./FormFields";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const LANGUAGE_OPTIONS = ["Thai", "English", "Chinese", "Japanese", "Other"];
const NATIONALITY_OPTIONS = [
  "Thai",
  "American",
  "British",
  "Chinese",
  "Japanese",
  "Other",
];
const RELIGION_OPTIONS = [
  "Buddhist",
  "Christian",
  "Muslim",
  "Hindu",
  "None",
  "Other",
];

const INITIAL_FORM_DATA = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  eContactName: "",
  eContactRelationship: "",
  religion: "",
};

export default function PatientForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { validateForm } = useFormValidation();
  const { connectionStatus, sendUpdate, sendSubmit } = useWebSocket("patient");

  const errors = validateForm(formData);
  const formIsValid = Object.keys(errors).length === 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);
    sendUpdate(nextFormData);
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Reveal every error on a submit attempt, not just touched fields.
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (!formIsValid) return;

    sendSubmit(formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setTouched({});
    setSubmitted(false);
  };

  // Only show a field's error once the user has interacted with it.
  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-700">Thank you!</p>
        <p className="mt-1 text-sm text-green-600">
          Your information has been submitted successfully.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 rounded-md border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          Fill Another Form
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-3xl p-4 sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Patient Information Form
        </h1>
        {connectionStatus !== "open" && (
          <span className="shrink-0 text-xs text-amber-600">
            {connectionStatus === "connecting"
              ? "Connecting…"
              : "Reconnecting…"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <FormFields
          label="First Name"
          name="firstName"
          required
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("firstName")}
        />
        <FormFields
          label="Middle Name"
          name="middleName"
          value={formData.middleName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("middleName")}
        />
        <FormFields
          label="Last Name"
          name="lastName"
          required
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("lastName")}
        />
        <FormFields
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("dateOfBirth")}
        />
        <FormFields
          label="Gender"
          name="gender"
          type="select"
          required
          options={GENDER_OPTIONS}
          value={formData.gender}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("gender")}
        />
        <FormFields
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          required
          placeholder="e.g. 0812345678"
          value={formData.phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("phoneNumber")}
        />
        <FormFields
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("email")}
        />
        <FormFields
          label="Address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("address")}
        />
        <FormFields
          label="Preferred Language"
          name="preferredLanguage"
          type="select"
          required
          options={LANGUAGE_OPTIONS}
          value={formData.preferredLanguage}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("preferredLanguage")}
        />
        <FormFields
          label="Nationality"
          name="nationality"
          type="select"
          required
          options={NATIONALITY_OPTIONS}
          value={formData.nationality}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("nationality")}
        />
        <FormFields
          label="Emergency Contact Name"
          name="eContactName"
          placeholder="Full name"
          value={formData.eContactName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("eContactName")}
        />
        <FormFields
          label="Emergency Contact Relationship"
          name="eContactRelationship"
          placeholder="e.g. Parent, Spouse"
          value={formData.eContactRelationship}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("eContactRelationship")}
        />
        <FormFields
          label="Religion"
          name="religion"
          type="select"
          options={RELIGION_OPTIONS}
          value={formData.religion}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("religion")}
          className="md:col-span-2"
        />
      </div>

      <button
        type="submit"
        disabled={!formIsValid}
        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
      >
        Submit
      </button>
    </form>
  );
}
