// Form validation logic (email, phone, required fields, date).
export function useFormValidation() {
  const validateForm = (formData) => {
    const errors = {}

    // Required Field validation
    if (!formData.firstName?.trim()) {
      errors.firstName = "Require a Firstname"
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = "Require a Lastname"
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Require Date of birth"
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()

      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = "Date of Birth must be valid"
      } else if (dob > today) {
        errors.dateOfBirth = "Date of Birth cannot be the future"
      } else {
        const age = today.getFullYear() - dob.getFullYear()

        if (age > 120) {
          errors.dateOfBirth = "Please enter valid date"
        }
      }
    }
    if (!formData.gender) {
      errors.gender = "Require a Gender"
    }
    if (!formData.address?.trim()) {
      errors.address = "Require an Address"
    }
    if (!formData.preferredLanguage) {
      errors.preferredLanguage = "Require a Preferred Language"
    }
    if (!formData.nationality) {
      errors.nationality = "Require a Nationallity"
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = "Required Email"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please provide a valid email"
      }
    }

    // Tel. validation
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Required Phone Number"
    } else {
      const digits = formData.phoneNumber.replace(/\D/g, "")
      if (digits.length < 10) {
        errors.phoneNumber = "Phone number must be at least 10 digits"
      }
    }

    // Emergeny contact validation
    if (formData.eContactName?.trim() && !formData.eContactRelationship?.trim()) {
      errors.eContactRelationship = "Please specify the relationship of Emergency contact"
    }

    return errors
  }
  const isFormValid = (formData) => {
    const errors = validateForm(formData)
    return Object.keys(errors).length === 0
  }
  return {
    validateForm, isFormValid
  }
}
